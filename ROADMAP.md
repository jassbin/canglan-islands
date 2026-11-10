# Roadmap

Direction, not a delivery contract. Every item below hangs off something already in the
tree, so the plan is a growth path rather than a wish list — but the ordering will change as
the project is used, and no date is promised.

## Where the project already stands

The spine is in place: six data layers with recorded provenance, a run engine, three
machine staffs, a per-seat intelligence model with four confidence grades, ten screens, and
a force catalogue built entirely from primitives. What follows is layered on top of that,
not a rewrite of it.

## 1 · The physical picture

**Sea state and weather as inputs.** The sensor model currently resolves a geometric
horizon and a detection envelope. The next layer is a sea-state field that raises the
horizon, degrades small-craft and helicopter operations, and changes acoustic conditions.
The grid infrastructure for a scalar field over the same map already exists (depth and
elevation are stored exactly that way), so this is an additional field, not new plumbing.

**Electronic warfare in the intelligence layer.** Because contact quality is already graded
per seat and per source, a jamming or decoy effect can be expressed as an input that
changes which grade a seat gets, rather than as a special case in the display code.
Standoff jamming, course-correction decoys and a "picture is polluted but not blind" state
are the interesting cases.

**Acoustics for the subsurface.** Submarine classes are catalogued with their parameters;
the surface engagement model does not yet give them a differentiated detection problem.
A layered sound-speed proxy plus a speed/noise trade is the smallest honest step.

**Damage that is not binary.** The catalogue carries magazine depth and crew for each type.
That is enough to move from "alive / sunk" toward mobility, firepower and sensor
degradation with a damage-control tempo, and to make sustained campaigns — rather than
single salvos — legible.

## 2 · The decision picture

**Richer staff behaviour, still auditable.** Each staff already attaches a one-line reason
to every order. The plan keeps that contract while adding the things that make real
commanders nervous: ammunition and fuel economy over a multi-day run, risk tolerance that
changes with the strategic phase, and force generation that responds to losses instead of
being fixed at start.

**Search-and-track as a campaign problem.** The verbs exist (`search`, `track`,
`commit_reserve`). The next step is making the *allocation* of scarce reconnaissance the
interesting decision — which axis gets the patrol, which satellite pass gets tasked, and
what the staff stops seeing when it spends the effort elsewhere.

**Coalition and external politics.** The strategic layer already separates our decisions
from uncertain externals with branches and sequels. Making those externals react — with a
threshold model for reinforcement, overflight and basing access — is the natural extension,
and it is where the tree structure earns its keep.

## 3 · Making runs shareable

**Deterministic replays.** A run is already reproducible from its opening scheme and its
random seed. The goal is a single file that carries both plus the decision log, so a
scenario can be posted, argued with, and re-run exactly.

**Scenario authoring in the browser.** The pre-war configuration desk builds a side's
strategic tree and opening from data. Exposing that as an importable, exportable document —
same JSON discipline as the shipped layers, with the same source and confidence fields —
turns the game into a tool other people can write for.

**A public data-pipeline release.** The shipped repository is the product: pages plus the
data files they read. The generation and validation tooling around it is planned as a
separate public release, so the source inventory can be checked and extended by others
rather than taken on trust.

## 4 · Reach

**Interface language.** The application text is Chinese; the documentation is bilingual.
An English string set is planned, and the wording should be reviewed by people who read
order-of-battle literature in both languages rather than machine-transferred.

**Small screens and weaker GPUs.** The map is already decluttered by distance and the
renderer has adaptive quality. Touch layout, a lower-resolution terrain path, and a
reduced-effects mode are the open work.

**Accessibility.** Label contrast, keyboard paths through the ten screens, and a
screen-reader-shaped description of the contact rail.

## 5 · Community

**Scenario library.** A folder of authored openings, each carrying its own source list, so
that "what if" runs can be compared on data rather than on vibes.

**Data corrections.** Because every record names its own reference, the useful bug report is
a citation: "this source no longer supports this record, here is the better one." That is
the contribution path this project is structurally best at, and the highest-value one.

**Model gallery.** Every hull and airframe is generated from primitives in shared code.
A page that shows the same build functions at close range, with the dimensions they were
modelled from, is a small addition and a good teaching surface.

## What this project will not become

Not a forecasting tool, not an official planning product, and not a game whose numbers are
tuned to a conclusion. When a record cannot be supported by a public source, the honest move
is to grade it low or leave the unit out. The value of the thing is that you can trace every
number, disagree with it, and watch what follows.
