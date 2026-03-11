# Contributing to Equitherm Studio

Thanks for your interest in contributing!

## Development Setup

```bash
# Clone the repo
git clone https://github.com/P4uLT/equitherm-studio.git
cd equitherm-studio

# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

## Project Structure

This is a pnpm monorepo:

- `packages/core/` - Pure calculation library (`@equitherm-studio/core`)
- `packages/web/` - React web application (`@equitherm-studio/web`)

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start web dev server |
| `pnpm build` | Build all packages |
| `pnpm test` | Run all tests |
| `pnpm typecheck` | TypeScript type check |

## Pull Requests

1. Create a feature branch from `main`
2. Make your changes
3. Run `pnpm typecheck` and `pnpm test`
4. Open a PR with a clear description

## Code Style

- TypeScript strict mode
- Conventional commits (`feat:`, `fix:`, `docs:`, etc.)
- Tests co-located with source files (`*.test.ts`)

## Questions?

Open an issue for bugs, features, or questions.
