# Amir production adapter (MVP)

The local player in `createWorld.js` and remote players in `multiplayer.js` use
`createAmirCharacter({ scene, appearance, gameClass })`.
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
  gender: "female", // retained metadata; the pack does not supply gender-specific rigs
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
are rejected. The creator UI reads `AMIR_PART_OPTIONS` directly and submits
`normalizeAmirAppearance(creator)` through the existing creation method.

## Plus asset catalog

The production adapter now loads `Modular Character Plus.glb` (7,532,936 bytes).
`catalog.json` is generated from this exact file and is the single whitelist used by
appearance normalization/validation, creator controls and assembly. No appearance
fields, free-pack defaults, legacy head aliases or null semantics were changed.
Local players, remote players, NPC assembly and the live preview all use this adapter.
The creator displays each slot's available count; wings use the existing back slot.

Regenerate after replacing the GLB, from the repository root:

```sh
node tools/generate-amir-catalog.cjs
node tools/generate-amir-catalog.cjs --check
```

Discovery uses actual geometry names, rig skinning and authored attachment parents,
not guessed numeric variant ranges. The generator rejects unclassified, duplicate or
multi-primitive mesh nodes for review rather than silently exposing incompatible data.
It requires no dependencies or Babylon runtime, so Meteor validation can import the
same generated data without reading public assets or loading rendering code.

Plus contains 137 usable geometry meshes (72 additions): 16 heads; 16 each of torso,
arms, legs and feet; 15 hands; 5 hair; 10 hats; 4 glasses; 1 mask; 6 left-hand items;
10 right-hand items; and 6 back items. Player weapon choices are filtered by class;
classless NPC assembly retains access to the full catalog.
Required body slots still require a mesh; hair and equipment retain **None**.

### Plus compatibility and focused checks

- Every free-pack mesh ID is present. Geometry, indices and skin weights of the 65
  existing meshes are byte-for-byte identical; the same 65 bone names are retained.
  Internal glTF node indices differ, so the adapter continues to resolve bones by name.
- All 51 animation names and sampler data are unchanged. All three embedded palette
  PNGs are byte-for-byte identical, preserving the existing skin-tone swatches.
  Plus has nine material variants; the current skin adapter handles their body
  materials while retaining accessory/hair palettes.
- In isolated Chromium/WebGL, exercised the real React creator across 16 outfit
  families and previewed every one of the 137 geometry choices through its controls.
  Option lists matched the generated catalog; all selections rendered with one rig
  and the ten mapped animation groups. The submitted appearance matched the preview,
  including Plus equipment and null hair. Also checked a 667 × 375 viewport.
- Exercised all ten mapped animation poses on a Plus actor, procedural weapon attacks,
  independent skin palettes, a legacy actor, mounted removal, death/respawn, dungeon
  visibility, remove/re-add during loading, and scene exit. Actor meshes, rigs, groups,
  materials and textures were released; only the scene's shared default material and
  BRDF texture remained.
- Catalog freshness, shared validation for all 137 IDs, legacy aliases/defaults,
  rejection of unknown IDs, JS/JSX syntax, standalone Rspack compilation and diff
  whitespace checks passed. No Meteor builds or test suites were run.

### Plus visual findings and naming

Sampled all 16 outfit families, then compared 16 close-up combinations on `head-00`
using `hat-03`, `hat-04`, `hat-54`, `hat-105` and each of the three new hairstyles
against a hair-free baseline:

- `hair-04`, `hair-103` and `hair-55` protrude through `hat-04`'s upper surface.
- `hair-103` and `hair-55` intersect/cover `hat-03`'s crown; `hair-103` also
  protrudes through the top of `hat-105`. Hair **None** removes these overlaps.
- `hat-54` is shaped like a molded hairstyle/brow accessory rather than a conventional
  hat, and visibly overlaps `hair-04` and `hair-103` on the crown/forehead.
- On `head-00`, the face also intersects the green visor area of `hat-105` even with
  hair **None**. Its fit should be reviewed per head before promising clean combinations.
- `sych-103.col` is the scythe-shaped right-hand item; its unusual spelling is the
  actual asset ID and is retained. `.col` items are renderable attached geometry,
  not collision-only meshes. `hands-102` is still absent; it is not offered.
- The `03` body family includes extra `COLOR_0`/`COLOR_1` vertex attributes, containing
  white values. No rendering or animation incompatibility was observed for it.
- No geometry was excluded and no new rig/animation incompatibility was found.
  Every possible mixed combination and animation angle has not been visually reviewed.
  Larger weapons, paired shields and wings still need combination-specific grip/overlap
  polish; they use the existing attachment and combat behavior, with no new attack poses.

The existing free-pack clipping findings below still apply. Options remain independently
selectable; the adapter does not silently rewrite appearances to hide clipping.
The larger pack retains all 137 meshes and imports/tints its own materials per actor;
crowd/mobile profiling and asset caching/pruning remain follow-up work.

## Class weapons

The existing `gameClass` and `appearance.equipment` determine player weapons.
`AMIR_CLASS_WEAPONS`, `getAmirEquipmentOptions` and `applyAmirClassWeapon` in
`appearance.js` share the class rules between assembly, creator options and submission.
There is no new inventory, weapon-selection field, persistence model or realtime field.

| Class | Default asset ID | Bone / slot | Compatible saved variants |
| --- | --- | --- | --- |
| Warrior | `sword-01.col` | `RightHand` / `rightHand` | `sword-01.col`, `sword-02.col`, `sword-03.col` |
| Ranger | `bow-01.col` | `LeftHand` / `leftHand` | `bow-01.col`, `bow-02.col` |
| Mage | `staff-02.col` | `RightHand` / `rightHand` | `hammer-01.col`, `staff-02.col`, `staff-03.col` |

Null or a saved weapon of another type resolves to the class default. Warrior/Mage
left-hand shields remain selectable; bows are reserved for Rangers. Ranger right-hand
weapons are suppressed so an older saved sword cannot appear alongside the bow.
The normalized free-pack defaults remain unchanged. Resolution copies appearance
rather than rewriting existing documents. New creator submissions store the resolved
appearance through the existing creation method and validation. A classless NPC keeps
its unrestricted saved appearance and the adapter's original right-hand weapon behavior.

The local world loader already supplied class; remote assembly now supplies the existing
replicated `PlayerState.gameClass`. Creator/overview previews pass class through the
same helper and refresh on class-only changes. The adapter returns the selected mesh
and its corresponding normalized hand anchor to the existing local/remote swing code.
Reparenting preserves the GLB's authored transform. No per-class rotation, position or
scale corrections were necessary: model scale remains 6, rig scale 0.01, and normalized
hand anchors compensate by 1 / (6 × 0.01).

Focused checks used the real creator and an isolated Babylon/Chromium scene:

- Changed only class with otherwise identical appearance and verified sword/bow/staff
  preview meshes and their hand bones. Selected the Mage hammer, checked mobile layout,
  and confirmed the submitted class/appearance matched the visible selection.
- Exercised compatible variants and cross-class saved hand selections through the
  shared rules; validation passed, saved inputs were unchanged, and classless assembly
  retained its previous behavior.
- Used the actual local combat attachment block for all three defaults plus sword-03,
  bow-02, hammer-01 and staff-03. World matrices stayed within 0.0001 through attachment;
  the existing combat controller started, swung and recovered for each weapon.
- Exercised remote Warrior/Ranger weapons and the Mage hammer, all ten mapped animation
  poses, movement, death/respawn, dungeon visibility, mounts, stale loads and disposal.
  No actor mesh, rig, animation or owned material/texture remained after removal.
- Catalog freshness, JS/JSX syntax, standalone Rspack compilation and diff whitespace
  checks passed. No Meteor build or test suite was run; a live two-client Meteor session
  was not exercised.

No new attachment, scale or animation failures were found. Authored idle weapons carry
across the front of the body, including the bow and staff. Existing projectile attacks
and procedural swings are preserved; there is no added bow draw/release, staff casting,
two-hand grip or weapon-specific trail calibration. Large weapons, off-hand shields and
mixed outfits may still overlap in poses that were not visually reviewed.

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
A resolved Amir class weapon (or a classless NPC's right-hand mesh) replaces the
fallback sword, preserving its authored transform and using the same combat pivot/trail.
Player defaults now use Amir geometry; the legacy fallback retains existing behavior
for callers without an Amir weapon.

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

## Creator preview and controls

The existing Species → Class → Appearance → Name wizard now offers head, hair,
species-specific skin tones, body type, individual outfit parts, and equipment.
It stores the existing appearance fields in the creator draft and uses the shared
normalizer for both preview and submission. No second appearance schema is used.

`CharacterPreview.jsx` delegates Babylon rendering to `createAmirCharacterPreview.js`,
which uses the production adapter. Selection changes are coalesced for 120 ms;
the engine and drag rotation survive appearance changes, and stale loads are discarded.
Load failures show a message. The same preview component also serves character overview.

Focused Chromium/WebGL checks used the actual React wizard, existing DaisyUI/Tailwind
styles, and real GLB, with a temporary Meteor-call stub (not a Meteor server/database):

- Exercised head/hair/skin/outfit/equipment selectors and confirmed enabled GLB meshes
  match the shared normalized appearance; one rig remained live after changes.
- Confirmed drag rotation survived replacing the assembled character.
- Followed creation through name availability and captured `characters.create`:
  its appearance matched the preview selections exactly. Creator reset and engine
  disposal completed after submission.
- Checked desktop and 667 × 375 layout, including scrolling to lower equipment
  selectors while Back/Next remain accessible. No browser runtime errors occurred.
- Compiled the standalone check bundle and parsed changed files/imports; no Meteor
  builds or test suites were run.

### Visual combination findings

Inspected 13 sample combinations, including both hair variants with every hat,
alternative heads, mask/glasses, and a mixed outfit:

- `hair-51` and `hair-102` visibly protrude through `hat-01`, `hat-02`, `hat-101`, and
  `hat-51` on `head-00` (fringe/crown and, for the helmet, rear/top hair). Use hair
  **None** with those hats for a clean silhouette. Options remain independently
  selectable; the UI does not silently override the saved appearance.
- `head-02` + `hair-51`, `head-51` + `hair-102`, and `head-101` + `mask-102` +
  `glasses-102` loaded and rendered in the sampled front idle view.
- The sampled mixed outfit (`torso-51`, `arms-01`, `hands-52`, `legs-101`, `feet-02`)
  rendered on the shared rig. Not every seam, angle, animation, or possible mixed
  combination has been checked.
- No sampled combination failed to load. `hands-102` remains absent from the asset
  and is consequently absent from the controls.

## Remote-player replication

`WorldRoom.onJoin` normalizes the authenticated character's persisted appearance and
serializes its visual fields into `PlayerState.appearance`. This replaces the four
legacy flat fields rather than adding a parallel appearance model. The JSON payload
uses the same head/hair/skin/body/outfit/equipment keys and null semantics; gender is
omitted because it is metadata only. No client message can author this payload, and
unchanged appearance is not resent in movement/health patches. Dungeon rooms inherit
the same join path and player schema.

Remote players assemble through the production adapter and obtain their animation
controller from it. Resolved class weapons use the same normalized hand anchor,
authored transform, combat pivot and tip placement as the local player. Existing
class-dependent fallback behavior remains for callers without an Amir weapon. Movement interpolation, health bars,
nameplates, combat timings, mounting, death visibility and respawn snapping are retained.
A per-spawn token rejects loads that complete after removal, replacement or scene exit.
Removal and failed assembly release owned actor, label, fallback weapon and mount
resources, including texture wrappers cloned during skin tinting.

Focused checks used the installed Colyseus schema encoder/decoder and an isolated
Chromium/WebGL scene with real GLBs and the remote assembly/join/removal code:

- World and dungeon snapshots carried appearance intact; later health patches decoded.
- Customized and legacy appearances selected the correct parts, null hair, isolated
  skin palettes, independent rigs and adapter animation mappings.
- Existing movement targets, running timeout, nameplate text, authored weapon attacks,
  death/respawn visibility, dungeon hiding/return and mounted removal worked.
- Remove/re-add during loading, leaving during loading, and scene exit discarded stale
  actors without affecting another player's rig.
- Syntax checks, standalone Rspack compilation and diff whitespace checks passed.

These checks do not replace an end-to-end session with a live Meteor database and two
connected clients. Each remote actor currently imports the full roughly 7.5 MB Plus GLB and
keeps disabled geometry plus its own rig, palette and mapped animations. Existing
visibility culling pauses distant rendering/animation; it does not eliminate import
cost or retained geometry. Asset caching/pruning and crowd/mobile profiling remain
follow-up work rather than part of this MVP.

## Remaining work for wider rollout

- There is no appearance-edit flow for existing characters. The creation method
  persists new appearances; later editing needs ownership validation and live refresh.
- Review allowed head/hair/hat and mixed outfit combinations for clipping before
  exposing every combination. Some heads already contain thematic details; paired
  arms/legs/hands/feet cannot be customized left/right independently. `hands-102`
  does not exist and must not be offered.
- Gender remains metadata; the pack has one rig and fixed geometry variants.
  Skin swatch mapping is specific to this GLB and must be reviewed if the asset changes.
- NPC instancing, geometry pruning/caching, crowd/mobile performance, mounted pose
  polish, and weapon-specific grip/trail calibration remain unverified. The full
  asset geometry is retained, although only the mapped animation groups remain live.

The creator, local player, and remote players share the production appearance contract
and adapter. Crowd/mobile profiling remains necessary before a wider rollout.
