# Amir production adapter (MVP)

The local player in `createWorld.js` now uses `createAmirCharacter({ scene, appearance })`.
The temporary `amirPreview` entry-point branch and standalone preview scene are removed.
The same loader works for future NPCs without accounts, Colyseus, or persistence imports.

## Appearance data

`appearance.js` owns the allowed asset IDs, defaults, normalization, and validation.
New characters persist this cosmetic object through the existing `characters.create`
Meteor method, including existing species-specific skin-tone validation:

```js
appearance: {
  head: "head-01",
  hair: "hair-51", // null hides hair
  skinTone: "medium",
  bodyType: "medium", // existing slim / medium / large width scaling
  gender: "female", // retained metadata; the free pack does not supply gender-specific rigs
  outfit: {
    torso: "torso-01", arms: "arms-01", hands: "hands-01",
    legs: "legs-01", feet: "feet-01"
  },
  equipment: {
    hat: null, glasses: null, mask: null,
    leftHand: null, rightHand: null, back: null
  }
}
```

Equipment here selects cosmetic geometry, not inventory ownership or stats.
`Character.equipment` remains the existing gameplay item equipment. Body slots require
real meshes; optional hair/equipment slots accept null. Legacy `head1`–`head5` IDs
normalize to real Amir heads. Existing documents get missing fields at assembly time;
there is no destructive migration. Unknown fields are discarded and invalid part IDs
are rejected. The future creator UI can use `AMIR_PART_OPTIONS` directly.

## Assembly and compatibility

```js
const actor = await createAmirCharacter({ scene, appearance });
actor.root.parent = npcRoot; // or the existing local-player collider
const controller = actor.createAnimationController();
controller.setRunning(true);
controller.update(deltaTime);
// On actor removal:
controller.destroy();
actor.dispose();
```

The adapter keeps the original 65-bone rig and authored attachments. Geometry meshes
are selected independently without disabling joint nodes. It returns `root`, `meshes`,
`skeleton`, `animations`, normalized `appearance`, selected `parts`, and normalized
`attachments` for head, left hand, right hand, and back.

All animation and bone names are mapped inside the adapter. Ten clips satisfy the
existing locomotion controller contract, including aliases for jump start/fall/landing,
hit, death, and chat interaction. Source clips are cloned against the same actor's
joint targets; unused source groups are disposed. Horizontal hip animation is held
in place in the source rig's coordinates. Existing movement, jump physics, collider,
controls, attack cooldowns, damage, and procedural sword-swing code are retained.

The source approximately 0.31 m character scales by six to about 1.88 m. Hand anchors
compensate for the rig's centimetre scale so the existing sword configuration works.
A configured Amir right-hand mesh replaces the fallback sword, preserving its authored
transform and using the same combat pivot/trail. Explicit cosmetic weapons remain
visible for any class; the default fallback still follows existing class visibility.

`applyAmirSkinTone.js` copies each actor's body palette and replaces four verified
skin swatches in the supplied 128 × 128 Imphenzia texture. Other palette cells and
rigid equipment/hair materials are unchanged. Actors own their tint resources;
changing one actor's palette does not recolor another actor.

## Focused checks

Using the installed Babylon.js 9.27.0, a temporary standalone Rspack bundle, and
Chromium/WebGL, without a Meteor build:

- Loaded a legacy appearance and a customized actor on separate rigs; confirmed all
  whitelisted IDs exist in the real GLB, one enabled mesh per required body slot,
  correctly enabled equipment, and all joint nodes remaining enabled.
- Checked legacy default normalization and rejection of unavailable `hands-102`.
- Compared texture pixels: only the four intended skin cells changed. Different
  characters received separate materials/palettes.
- Exercised Run, jump start/fall/landing, mounted idle, idle, hit/death clip mapping,
  and confirmed animation targets are bound. The existing controller's one-shot
  hit/death interruption behavior is retained.
- Verified animation/controller operations do not move the gameplay collider.
- Rendered the existing sword and an authored Amir sword/shield/backpack; confirmed
  procedural attack starts, duplicate cooldown requests are rejected, and the pivot
  recovers after the swing.
- Disposed one actor and its combat resources; the other actor and rig remained live.
- Parsed changed JS/JSX, compiled the adapter/check scene, and checked diff whitespace.

The earlier asset investigation also checked independent toggling of all 65 meshes,
all 51 source clips, and seven outfit families. Original GLB/FBX files are unchanged;
only the GLB is used at runtime.

## Remaining work before the creator UI / wider rollout

- **Creator preview and remote players still use KayKit.** They need the Amir adapter
  and replicated modular appearance fields before multiplayer visuals can match the
  new local-player appearance. This MVP deliberately changes only local assembly.
- There is no appearance-edit method/UI yet. The existing creation method persists
  new appearances; an edit flow will need ownership validation and live visual refresh.
- Review allowed head/hair/hat and mixed outfit combinations for clipping before
  exposing every combination. Some heads already contain thematic details; paired
  arms/legs/hands/feet cannot be customized left/right independently. `hands-102`
  does not exist and must not be offered.
- Gender remains metadata; the free asset has one rig and limited geometry variants.
  Skin swatch mapping is specific to this GLB and must be reviewed if the asset changes.
- NPC instancing, geometry pruning/caching, crowd/mobile performance, mounted pose
  polish, and weapon-specific grip/trail calibration remain unverified. The full
  asset geometry is retained, although only the mapped animation groups remain live.

There is no blocker to building a local creator UI against the shared appearance
contract, provided the preview is switched to the same adapter. Multiplayer appearance
replication is the main remaining integration dependency for a wider rollout.
