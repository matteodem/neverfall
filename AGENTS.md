# Neverfall

Browser-based 3D MMORPG.

## Stack
- Meteor.js + MongoDB
- React for UI/HUD
- Babylon.js for 3D
- Colyseus for realtime game server
- Zustand for client state
- TailwindCSS + DaisyUI
- JavaScript, no TypeScript

## Architecture rules
- Meteor handles accounts and persistent game data.
- Colyseus handles realtime world state.
- Zustand is client-only state.
- React should not contain Babylon-specific rendering logic where avoidable.
- Prefer small focused files over large components.

## Code style
- Keep implementations simple and MVP-oriented.
- Do not add dependencies unless necessary.
- Preserve existing behavior during refactors.
- Always mention which files were changed.
- Do not run Meteor build commands or tests unless explicitly requested.

## External documentation

When implementing functionality that depends on external libraries:

- Check the current official documentation when uncertain.
- Prefer official documentation over blogs or Stack Overflow.
- Verify APIs against the versions installed in package.json.
- Do not upgrade dependencies unless explicitly requested.
