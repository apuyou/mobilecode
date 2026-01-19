# Code style

- Dot use single-line condition and statement, always use brackets
- Keep all imports in 2 blocks: external packages then local modules (using @/ prefix). Each block must be ordered alphabetically.
- Do not create static types everywhere, use available types as much as possible (from OpenCode SDK when calling the SDK) or let TypeScript infere by itself.
- Never use any or unknown hacks, types are here to help
