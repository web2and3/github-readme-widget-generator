# Contributing

Contributions are welcome. These guidelines help keep the project consistent.

## Getting started

1. Fork the repo and clone it locally.
2. Follow [SETUP.md](SETUP.md) to install dependencies and configure `.env`.
3. Create a branch for your change: `git checkout -b feature/your-feature` or `fix/your-fix`.

## Development workflow

- **Code style:** Use the project’s existing style (TypeScript, Tailwind, React). Run `pnpm lint` before committing.
- **Commits:** Prefer clear, short messages (e.g. “Add theme preset for streak card”, “Fix unfollow 404 handling”).
- **Scope:** Prefer one logical change per PR (one feature or one bugfix).

## Areas you can help

- **Widgets:** New card layouts, themes, or endpoints (see [RECOMMENDED_CATEGORIES.md](RECOMMENDED_CATEGORIES.md) for ideas).
- **Followers Check:** UX, bulk actions, filters, or performance.
- **Docs:** Fixes or improvements to README and files in `docs/`.
- **Bugs:** Open an issue with steps to reproduce; PRs with tests or clear manual testing are appreciated.

## Pull requests

1. Update docs if you add a feature or change behavior (README or `docs/`).
2. Ensure `pnpm build` and `pnpm lint` pass.
3. Open a PR against the default branch. Describe what changed and why.
4. Maintainers will review and may request changes.

## License

By contributing, you agree that your contributions will be licensed under the same MIT License as the project.
