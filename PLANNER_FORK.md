# Project-owned fork of `svar-widgets/react-grid`

**This repository is not the upstream SVAR project.** It is a project-owned fork
maintained by the SVAR Production Planner project.

| | |
| --- | --- |
| Upstream project | https://github.com/svar-widgets/react-grid |
| Upstream tag this fork branches from | `v2.7.2` |
| Upstream commit | `de7182e190932f4f75bdf333cf1357c2f9e7d884` |
| Package name | `@svar-ui/react-grid` (unchanged) |
| Package version | `2.7.2` (unchanged) |
| Upstream licence | MIT, Copyright (c) 2025 XB Software Sp. z o.o — see `license.txt` |
| Project authority | D-100, D-102 of the SVAR Production Planner project |

## Licence and attribution

The upstream code in this repository is the work of XB Software Sp. z o.o and is
used under the MIT licence. `license.txt` is upstream's own file and is kept
unchanged, in place, with its original copyright notice; it is shipped in the
published package. Nothing here relicenses, re-attributes or reassigns upstream
authorship.

Files added by this project carry a header saying so. Changes this project makes
inside upstream files are marked in place with a `SVAR-` identifier.

## Branches

```text
upstream   https://github.com/svar-widgets/react-grid.git   read-only
origin     the project-owned repository

main       exact upstream lineage. Never edited by this project. It exists so
           that `git fetch upstream` stays an ordinary operation and upstream
           tags stay reachable.
planner    the project's renderer line. Based on the exact upstream tag above.
```

Upstream ancestry is preserved, never rewritten. `git rebase` of upstream
commits is forbidden: it destroys the merge-base, which is the thing that proves
where this code came from.

### Fresh clone / bootstrap

A plain `git clone` of this repository creates `origin` only — it has no
`upstream` remote yet. `git fetch upstream --tags`, used above and needed by
`tools/planner-verify.mjs` (check 1 resolves `v2.7.2` against `upstream`'s
tags), fails on a fresh clone until `upstream` is added.

After cloning, run once — safe to re-run, since it only adds `upstream` when
it is not already there:

```bash
git remote get-url upstream >/dev/null 2>&1 || \
  git remote add upstream https://github.com/svar-widgets/react-grid.git
git fetch upstream --tags
```

After that, `node tools/planner-verify.mjs` runs with no further setup. A
`node_modules` install (`npm install` / `npm ci`) is also needed before the
package build step (`prepare`) runs, exactly as for any other consumer of
this package — that is ordinary npm behaviour, not fork-specific.

## What this project owns here

```bash
git log --oneline v2.7.2..planner     # every commit this project added
git diff v2.7.2..planner              # every line this project changed
```

Two kinds of change, deliberately kept in separate commits:

1. **Build/delivery tooling** — `tools/planner-build.mjs` (`prepare` builds the
   package, because a git dependency has no publish step),
   `tools/planner-verify.mjs` (fork-local provenance and boundary checks), and
   this file. No renderer behaviour.
2. **Renderer behaviour** — `SVAR-M1`, in `src/components/Grid.jsx`: the
   phase in which the \`data\` prop is published into the grid's own
   DataStore; `SVAR-M21`, in `src/helpers/actions/resize.js` and
   `src/components/HeaderCell.jsx`: a column resize always terminates; and
   `SVAR-M59`, in `src/components/Cell.jsx` and `src/components/Layout.jsx`:
   a row that stays in the window skips a window shift.

   `SVAR-M59`. Upstream re-rendered every cell of every visible row on every
   render of `Layout.jsx`, and `Layout.jsx` on every render of `Grid.jsx`.
   For the consuming Gantt every new row window is new `data`: `Grid.jsx`
   rendered (and with it the whole body, with the OLD rows), then its layout
   effect handed the rows to the store and the body rendered again, all
   cells, although one row entered and one left. The store never changes a
   row in place (`update-row` and `toggleBranch` make a new object), and
   react-gantt now keeps the object of an unchanged row across a window shift
   (`SVAR-M58` in `sodmod/svar-react-gantt`). So `Cell` is memoised on its
   props and skips a window shift when its row is the same object, and
   `Layout` is memoised on its props, so the render through `Grid.jsx` no
   longer redraws the old rows; it renders on its own store subscriptions as
   before. `Layout` hands each cell an `epoch` that is new on every render
   caused by anything but the rows of the window (`flatData`, `scrollTop`),
   so outside a pure window shift every cell renders exactly as upstream.
   `@svar-ui/grid-store` is not changed. Measured and guarded in the
   consuming application (`e2e/clean-pan-plan-microstutter-r2.spec.ts`
   there).

## Community / PRO boundary

This fork contains **Community** renderer source only.

`@svar-ui/gantt-store` and `@svar-ui/grid-store` are **not** forked and not
modified. They stay ordinary upstream Community npm packages, and the
Community reset of PRO capabilities inside `gantt-store` stays exactly the
foreign, unmodified file it has always been. No PRO source, and no source
reconstructed from a PRO sourcemap, is used anywhere in this repository.

`tools/planner-verify.mjs` checks that this project's own diff introduces no new
reference to any PRO identifier. What that check does and does not prove is
stated in the script itself.

## Upstream updates

**Frozen by default.** A new upstream release creates no work here automatically
and is not merged on a cadence. Taking a new upstream version is an explicit,
separately reviewed checkpoint of the Planner project: merge (never rebase),
re-check this project's changes against the new code, rebuild, re-run the
regression suite, re-accept manually.
