# CLAUDE.md

## Version bump

After every code edit in this repo, bump the version so the header's version indicator changes:

```
npm version patch --no-git-tag-version
```

This updates `package.json`/`package-lock.json` only (no git tag/commit of its own) — include the bump in the same commit as the edit.

## Git and GitHub

Commit and push automatically after every code edit in this repo. Do not stop to ask for approval before committing or pushing.
