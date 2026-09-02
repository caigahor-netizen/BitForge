---
title: A first-pass loss model for a synchronous buck
description: Conduction and switching losses before the board is built
category: Digital Power
pubDate: 2025-05-18
---

## The goal

Before touching the bench, get a believable estimate of where the losses are in a synchronous buck.

The usual suspects, in order:

1. **Conduction loss** — $I^2 \cdot R_{DS(on)}$, scaled by duty on the high side.
2. **Switching loss** — energy lost in each transition times frequency.
3. **Gate drive** — $Q_g \cdot V_{gs} \cdot f_{sw}$.
4. **Inductor** — DCR plus core loss at the ripple frequency.

A quick spreadsheet gets you to the right design decisions faster than a first prototype.

*Placeholder note — full analysis and measured data to follow.*
