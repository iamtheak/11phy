# Physics 11 — visual system

The established world is a quiet paper-like study book, with dark green ink, pale green experimental surfaces, muted gold accents and Georgia serif headings. Keep this identity. Source: incumbent React components, Canvas palette and CSS; refined using https://impeccable.style/ and its official skill references.

## Roles and hierarchy

Laboratories operate as tools; source chapters are reading surfaces. A chapter title leads into a concise introduction, section navigation, experiment, controls, relationship and result, then explanation and graph. Utility labels use 13–14px; ordinary body text uses 16px; source prose uses 16–17px with generous leading and a 72ch maximum. Heading scale is 26–56px with -0.025em maximum negative tracking. Keep Georgia for display and the existing sans stack for interface text.

## Palette and spacing

Ink #263f38; muted text #59685f; accent #356b59; gold #946a2f; paper #faf9f5; line #dde3da. Warm off-white surfaces and restrained green accents support sustained study. Use semantic CSS tokens and a 4px base, with 8, 12, 16, 24, 32, 48 and 64px intervals. Tight label/control groups; generous spacing between different study tasks.

## Surfaces and navigation

One outlined experiment surface; explanations use open sections and a soft assumption panel. Avoid nested cards, decorative status dots, heading kickers and giant metric strips. Home uses a subject-grouped chapter index and three experiment shortcuts. Chapter numbers carry actual book sequence. Numbers in measurements use tabular numerals. Buttons have a 44px minimum target and clear focus state. SVG icons share one stroke style.

## Responsive and accessible behavior

Desktop has a fixed 264px chapter sidebar; under 760px it becomes a drawer with a backdrop, close action and inert hidden navigation. Controls stack in DOM order. On narrow screens the Canvas emphasizes its first 530 of 840 logical pixels so physical handles stay usable; equivalent explanation and results remain in HTML. Drag hit circles grow on touch layouts. Text remains zoomable; long source text wraps; tables and section tabs scroll locally. Reduced motion suppresses decorative transitions.

## Verification

CSS parsed successfully and selected semantic contrast pairs passed. Mounted React tests cover all labs, readers, practice, notebooks, pointer drags and animation lifecycle. Browser visual QA and Impeccable's executable detector were unavailable; no claim of screenshot or live-detector verification is made.

## Physics playback controls

Animated laboratories start paused. Play is the primary action, with Restart next to it; speed and replay position live below the toolbar in one compact control group. Replay position changes pause the run. Changing physical parameters resets it. Current-state captions use tabular numbers and state any time compression or schematic motion explicitly. Graph callbacks are stable during playback so unchanged parameter graphs are not redrawn on every frame.

## Calm study refinement

Reference: https://visualtextbook.com/ and its emphasis on clear reading and focused interactive concepts. Preserve the existing serif headings, curriculum, routes and physics. Sidebar sandbox shortcuts use quiet backgrounds; selected chapters and actions retain explicit feedback. Reading has generous leading, and phone content has 20px side margins. Lab controls use warm neutral surfaces, reserving pale green for the scene and equation. Color feedback takes 180ms; the navigation drawer uses a 280ms ease-out transition. Reduced motion disables both. Physics and direct manipulation remain immediate.

All six regression suites and the production build pass after this refinement. The mechanical design detector reports only the existing Inter font-stack warning; the established typography is retained. Browser tools reported no available browsers, so rendered desktop and mobile visual QA remains unverified.
