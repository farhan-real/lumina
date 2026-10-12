# Lumina

A minimalist, high-performance optical physics simulation and puzzle game built with pure web standards.

Guide, refract, disperse, and gravitationally bend continuous beams of light across vacuum testing chambers using flat mirrors, dispersion prisms, convex lenses, concave lenses, beam splitters, wormhole portals, and cosmic singularities.

---

## Features

- **Continuous 2D Optics Simulation:** Snell's law refraction, Cauchy spectral dispersion, specular reflection, and thin-lens optical transfers.
- **Wavelength-Specific Sensors:** Receptors requiring specific spectral bands (Red 680nm, Green 532nm, Blue 445nm, Cyan, Amber, Violet) or simultaneous multi-beam convergence.
- **Physical Optical Instruments:**
  - **Flat Mirror:** Specular 1-to-1 reflection.
  - **Dispersion Prism:** Chromatic beam separation into continuous spectral fans.
  - **Convex Lens:** Positive focal convergence toward a real focal point ($f = +250\text{px}$).
  - **Concave Lens:** Diverging refraction expanding narrow rays into wide shafts ($f = -180\text{px}$).
  - **Beam Splitter:** 50/50 division into transmitted and 90° reflected branches.
  - **Quantum Portal:** Non-Euclidean spatial teleportation between paired apertures.
  - **Black Hole:** Relativistic gravitational lensing and event-horizon absorption.
  - **Wall:** Impassable obsidian barriers.
- **High Performance (200+ FPS):** Zero heap allocations in the raycasting loop, pre-allocated segment pools, capped DPR (1.5), and additive canvas blend passes with zero blur shader overhead.
- **Zero External Dependencies:** Built with vanilla HTML5 Canvas, CSS3, ES6+ JavaScript, and the Web Audio API.

---

## Quick Start (Play Locally)

Because Lumina uses zero build tools or bundlers, you can play it immediately:

### Option 1: Direct File Opening
Double-click `index.html` in your file explorer to open it in any modern browser.

### Option 2: Local HTTP Server
Run a lightweight local server to prevent browser local-file (`file://`) security warnings:

```bash
# Using Python 3
python -m http.server 8000

# Using Node (npx)
npx serve .
```

Navigate to `http://localhost:8000` in your browser.

---

## Controls

| Action | Control |
| :--- | :--- |
| **Select / Inspect Piece** | Click or tap on any placed optical instrument |
| **Translate / Move** | Click and drag the piece across the chamber |
| **Rotate (Continuous)** | Drag the cyan ring handle on the gizmo |
| **Rotate (Step)** | Mouse wheel up/down over piece, or click `-5°` / `+5°` on gizmo |
| **Exact Angle** | Click the numeric angle input on the gizmo and type the exact degree |
| **Remove Piece** | Click the trash icon on the gizmo, or press `Delete` / `Backspace` |
| **Run Test** | Click `[Run Test]` in the header to validate your optical circuit |
| **Reset Level** | Click `[Reset]` in the header to reload the default chamber layout |

---

## License

This project is licensed under the [GNU Affero General Public License v3.0](https://www.gnu.org/licenses/agpl-3.0.en.html) (AGPL-3.0).