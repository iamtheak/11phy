# Physics 11 — The Living Book

Interactive companion to the uploaded CDC Nepal Grade 11 Physics feedback copy (2024). 26 source chapters, 78 analytical laboratories, 78 generated numerical practice types, 26 conceptual checks, and a source exercise notebook. See PLAN.md for the chapter audit and limits.

## Run and build

Node 24 was used. Install with `pnpm install --frozen-lockfile`, validate with `pnpm test`, bundle with `pnpm build`, and serve the `dist` directory with any static HTTP server. No API keys or backend are needed. Runtime assets, including Pretext and the uploaded PDF, are bundled locally.

Progress and source exercise notes use browser localStorage. Students can export their chapter notes. This is a private study companion, not a teacher dashboard. Source exercise answers are printed excerpts, not independently verified solutions. Generated numerical problems are checked from separately implemented models.

## Files

- content.mjs: chapter teaching text, model parameters, equations, assumptions and conceptual checks
- canvas.mjs: analytical scenes, response graphs and Pretext Canvas text layout
- exercise.mjs: frozen exercise generation, answer tolerance and worked substitutions
- app.jsx: React components and hooks for navigation, laboratories, reader, practice, notebook, and mass drop sandbox
- interactions.mjs: pointer coordinate transforms, parameter snapping, draggable scene handles and analytical free fall
- dist/book.json: extracted source chapter text and question cards
- dist/source.pdf: uploaded original, retained for diagrams and exact notation
- PLAN.md: chapter interactions and reading/practical boundaries
- tests.mjs / interaction-tests.mjs / react-tests.jsx: numerical, direct manipulation and mounted React DOM validation

Source headings are preserved with a clarification: Chapter 25 also covers semiconductors; Chapter 26 is titled Solids but covers particles and cosmology. Text extraction can disrupt formulas and tables. Always consult the PDF for source notation. The companion does not reproduce every source formula as a separate laboratory; the plan identifies the implemented models and their boundaries. Additional topics can support more interactions with explicit physical assumptions.

## Direct manipulation

React 19 manages the interface and state; Canvas 2D and Pretext render analytical scenes and graphs. SVG handles overlay the Canvas with the same coordinate system. Vector tips, projectile launch velocity, spring mass, optical objects, refraction incidence, charge separation, torque, capacitor spacing and flux normal can be dragged by mouse or touch. Arrow keys change magnitude; Shift plus arrows changes direction where supported. The spring mass and projectile launch handles start animation on release.

The mass drop sandbox at `#drop` uses exact constant-gravity equations, stops at the ground, and shows height, speed, fall time and energy. Students can lift and release the mass or use the drop button; keyboard arrows lift and Enter drops. There is no air resistance or bounce simulation. Impact kinetic energy is displayed just before contact. Existing browser notes and progress keep the same storage key.

Tests mount React with LinkeDOM and dispatch pointer, keyboard, input and form events. They verify all laboratory/practice routes, source readers/notebooks, saved notes, animation frame movement and cancellation, drop landing, snapping, bounds, mass-independent acceleration and conserved mechanical energy. Browser visual QA is still unavailable in this environment.

## Animation replays

Fifteen additional labs animate acceleration, incline friction, work along a prescribed path, energy during uniform acceleration, perfectly inelastic collisions, cooling, conduction, radiation, four lens/mirror constructions, refraction/critical-angle ray paths and hydrogen photon emission. Every animated lab has Play/Pause/Restart, 0.25×/0.5×/1×/2× playback speed and a replay scrubber. Animations start paused, pause in hidden tabs and release their frame callbacks on unmount.

`animation.mjs` owns replay periods, physical frame samples and equivalent readable captions. `animation-tests.mjs` checks real Canvas geometry changes, signed motion, friction thresholds, cooling endpoints, collision momentum/energy and zero-driving cases. Ray and heat markers have schematic speeds. The photon animation is a sequence of quantum states, not a continuous electron trajectory. Cooling compresses the selected interval into six playback seconds. Collision positions are in the centre-of-mass view and are compressed; signed final velocity remains in the lab frame.


## Electricity flow and RC sandbox

Ohm, parallel-resistor and cell circuits show conventional current or reverse electron drift in conducting leads. Marker speed is proportional to current; parallel branches carry their own currents and shared leads carry their sum. The master switch disconnects both branches. Open switches and zero driving voltage stop flow; resistor shading follows load power. The response graph and captured baseline continue to compare closed-circuit parameters. Electron motion and marker spacing are schematic, not measured drift velocities or signal propagation.

The React RC sandbox at `#charge` models charging from zero and discharging from the selected initial voltage with the source removed. It shows equal and opposite plate charge, capacitor voltage, current magnitude, stored energy, resistor heat rate, and exponential voltage/current graphs. Charges do not cross the capacitor gap. Play, pause, restart, speed, timeline seeking and a one-time-constant shortcut are supported. Five physical time constants are scaled to eight playback seconds; the run stops at 5τ. R and C change the physical time scale. No stray capacitance, inductance, leakage, dielectric breakdown, or microscopic electron dynamics are modeled.

`electricity.mjs` holds the DC/RC models and circuit marker geometry; `electrical.jsx` renders the RC sandbox. `electricity-tests.mjs` verifies branch-current sums, cell power balance, RC exponential values and energy balance, current-proportional marker speed, reverse electron direction and zero-flow cases. Mounted React tests verify switch results, capacitor motion, pause, seek, reset, parameter changes, zero voltage, automatic stopping and unmount cleanup. Browser visual QA remains unavailable.


## Optical shapes and image formation

Converging/diverging lenses now have convex/concave glass silhouettes; curved mirrors show concave/convex reflecting surfaces. The outlines are schematic and do not infer curvature from focal length. Thin lenses in contact show two signed-power lens shapes. Existing ray equations, object dragging and quantitative models remain linked.

A picture panel in lens, mirror and apparent-depth labs displays an asymmetrical sample image, or a browser-local PNG/JPEG/WebP upload up to 5 MB. Signed magnification drives image size and orientation. Virtual images are outlined; focus singularities omit a finite image. A new sandbox at `#light` compares convex and concave lenses, plane and curved mirrors, and near-normal underwater apparent depth. Plane-mirror images are equally sized and reversed. The water view shows the actual position as a ghost and raises/compresses the apparent picture according to the near-normal approximation. Uploads are not sent to a server or persisted. Phone diagrams now fit an adaptive viewBox with vertically stacked depth panels.

This is an ideal geometrical-optics illustration, not a photograph ray tracer: no blur, aberrations, Fresnel intensity, scattering or thick-lens surface tracing. `optics.mjs` contains shape and image helpers; `optical-images.jsx` provides the shared picture panel and sandbox. Tests cover signed image formation, shape geometry, plane symmetry, depth, image uploads/reset, singularities, prediction mode and all six sandbox modes. Browser visual QA remains unavailable.


## Phone and tablet layout

Phone diagrams now use matching Canvas and SVG coordinate systems rather than enlarged CSS crops. Dragging converts touch coordinates using the active viewBox. Phone response graphs use a narrower plotting area and larger text. The mass sandbox stacks expanded energy bars below the falling mass; the electricity sandbox stacks an expanded transient chart below the circuit. Optics recomputes its horizontal fit, keeps object and formed image visible, and stacks apparent-depth panels. No horizontal image panning is needed.

Inputs and sliders have larger touch targets; phone text fields use 16px to avoid automatic focus zoom. Playback controls, uploads, metrics, quizzes and chapter-plan cards stack into narrow-screen layouts. Sticky phone navigation, safe-area spacing, a tablet chapter drawer, background scroll locking, focus handling and Escape/backdrop dismissal keep navigation accessible. Browser pinch zoom remains available outside drag handles. Existing notes, progress, equations and desktop interactions are retained.

Mounted React tests verify phone viewport changes, touch-coordinate alignment for vectors and mass drops, visible stacked charts/energy/depth panels, optics picture fit, orientation changes, and drawer scroll locking. The full physics/React regression suite passes. Browser visual QA is unavailable in this environment; no device screenshots or browser layout measurements are claimed.
