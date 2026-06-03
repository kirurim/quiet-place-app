# dsgn_concept2 — Home screen

A quiet social network for close people. Posts are a single photo, live for 7
days, then gone. No likes, no algorithms — reactions are short text or a voice
note. You switch between two **circles**: **Family** and **Friends**.

This is a single iOS home screen, rendered inside a realistic iPhone frame and
centered on the page.

## Run

```bash
npm install
npm run dev
```

Then open the printed local URL (default http://localhost:5173).

```bash
npm run build    # type-check + production build
npm run preview  # preview the production build
```

## Stack

- **React + Vite + TypeScript**
- **Tailwind CSS**
- **Framer Motion** — all motion (fountain spring, fly-out, grow, viewer slide)
- **Inter** via `@fontsource/inter` (400 / 500 / 700 / 900). Headings use 900.

## What's on screen

- A **freeform, pannable dark canvas** (`#0a0a0b`) with a faint dot grid. Drag
  empty space to pan; panning is **clamped** to the world bounds.
- A center **"+"** (add a moment) — a dark-glass button (no ring) at canvas
  center. Tapping it opens the camera; your own posts orbit the "+".
- **Circle pills** at the bottom. The active pill is filled lime (`#e8ff3a`).
  Switching a circle **re-centers** the canvas (the "+" animates back to center).
- **Fountain**: selecting a circle erupts its content from the active pill in a
  two-level structure —
  1. **Avatars** (people) fly out to a **ring around the center** — clusters are
     spaced evenly so they never overlap, yet stay close enough to **peek into the
     viewport** (it reads as "something flew out", never an empty center).
  2. Each avatar **unfolds** from 30 → 48px.
  3. Each avatar's **posts** grow out, evenly spaced by angle — a little
     **hub-and-spoke** cluster.
- **Post size by age** (clamp 40–120): `<2d → 120`, `2–5d → 78`, `5–7d → 40`.
- A rotating **lime dashed "new" ring** marks fresh posts — the ones you created
  via the "+" and the fresh seeded ones (age < 2d). The ring **disappears once you
  open the post** (marked seen).
- **Metaball goo**: a dark goo layer renders *behind* the glass bubbles —
  **one small filtered group per cluster** (avatar + its posts, and the "+" + your
  posts), fused by an SVG blur+threshold filter so only the organic "necks" show.
  Redrawn ~30fps to follow drift/drag, gated until each cluster settles.
- Bubbles are **draggable**; tapping a post (no drag) opens the post viewer.

Your own posts (created via the "+") are **scoped to the circle** you shared them
to (hidden in the other) and **persist** across switches, orbiting the center.

The top bar has a flat **status bar** (cellular / wifi / battery) and a **gear**
button that opens your own profile. All icons are one flat 2px-stroke SVG set.

## Photo bubbles

Each photo is a **liquid-glass sphere** with the image inside (placeholders from
`picsum.photos/seed/{n}/280/280`): a gloss/refraction treatment (no white rim), a
colored conic-gradient edge per circle (family = lime/green, friends = blue/violet),
and a slow per-bubble float. Image errors fall back to a coloured radial gradient.

## Post viewer

Tapping a post slides a full-screen viewer up from the bottom (no top story bar):
author + time + close, the photo with scrims, and a **TikTok-style comment
sheet** — drag the grip (or tap) to expand from a collapsed peek to a full
scrollable list. If the post has a **caption**, it's the first/main comment
(emphasized), then a voice reaction, then comments (`date · Reply`). Tap **Reply**
to prefill `@name` and nest your reply, with a **View N replies** toggle.
Comments and replies persist if you reopen the post. Tap the author → Profile.

## Profile

Slides up Apple-Invites style (no bio, no divider lines). **Person** (tap an
author): photo fading into a circle-tinted gradient, Inter-900 name, and a
Family / Friends / Remove segment (lime active). **You** (tap the gear): a
scrollable profile with a refined Family/Friends segment, a **member list**
(each with a Remove pill, plus an **add-row** — placeholder avatar + "Add someone"
+ green Add), and a **Settings** section (Notifications toggle, Log out, Delete
account in red with chevrons).

## Camera

Tapping the center **"+"** opens a **fullscreen viewfinder** (live frame + round
shutter) → a fullscreen **preview** with "share with: {circle}" and a **Share**
button beside the caption → a fresh 120px lime-ringed post erupts and orbits the
"+", scoped to that circle. The caption you type becomes the post's first comment.

## Structure

```
src/
  App.tsx                 circle + overlay state, scoped my-posts, pan + re-center
  lib/model.ts            circle config, no-overlap placement, my-post orbit, clampPan
  lib/comments.ts         per-seed comment + reply store (persists)
  lib/members.ts          per-circle member store (add / remove)
  components/
    IconSet.tsx           flat 2px-stroke SVG icons (send/mic/play/plus/gear + status)
    StatusBar.tsx         9:41 + cellular / wifi / battery
    IPhoneFrame.tsx       device shell, notch, status bar, viewport scaler
    Canvas.tsx            pannable (clamped) world; live refs; scoped my-posts
    GooLayer.tsx          metaball goo — one filtered group per cluster, gated
    Bubble.tsx            liquid-glass sphere — avatar | post | my-post
    CenterAdd.tsx         center "+" dark-glass add button
    CirclePill.tsx        bottom circle selector
    PostViewer.tsx        collapsible comment sheet + replies + voice + input
    Profile.tsx           person + self profile (members, settings)
    Camera.tsx            viewfinder → preview → share-with-circle
```
