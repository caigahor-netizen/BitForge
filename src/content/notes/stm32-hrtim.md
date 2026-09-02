---
title: Getting HRTIM right on the STM32G4
description: High-resolution timer configuration notes for digital power
category: Embedded
pubDate: 2025-02-10
---

## Why HRTIM

The high-resolution timer on the STM32G4 gives the timing edge placement needed for digital power — dead-time generation, burst/dithering modes, and ~184 ps resolution.

Key things to verify before writing a single control-sample:

- **Clock tree**: the HRTIM is on its own PLL branch; confirm the timer clock before anything else.
- **Event vs. timer counts**: know whether a delay is expressed in timer ticks or the fine-resolution steps.
- **Dead-time**: set it in the register domain you think you are in.

More detail to come — this note is a placeholder while the project notes are being written.
