# Residue — Transit Isolation Probe Video

## Overview
A cinematic motion graphics video for the "Residue" design probe — a research tool for studying transit isolation. Built with React, Vite, Framer Motion, and Tailwind CSS. The video is an arthouse-style promo for the DDL 7007 design probe study.

## Project Structure

```
/
├── index.html              # Vite entry point
├── package.json            # Node.js dependencies
├── vite.config.ts          # Vite config (port 5000, host 0.0.0.0)
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── src/
│   ├── main.tsx            # React entry point
│   ├── index.css           # Tailwind + Google Fonts + CSS variables
│   ├── lib/video/
│   │   ├── hooks.ts        # useVideoPlayer hook (scene management + recording)
│   │   └── index.ts
│   └── components/video/
│       ├── VideoTemplate.tsx           # Main video component with persistent layers
│       └── video_scenes/
│           ├── Scene1.tsx  # "Thousands of people / Completely Alone"
│           ├── Scene2.tsx  # "Isolation Viewfinder" (the probe)
│           ├── Scene3.tsx  # "Tag Your Feeling" (signals)
│           ├── Scene4.tsx  # "Pin it to the Map" (the bridge)
│           └── Scene5.tsx  # "RESIDUE" closing title
├── public/
│   ├── videos/
│   │   ├── metro-crowd.mp4     # AI-generated metro crowd footage
│   │   └── subway-tunnel.mp4   # AI-generated subway tunnel footage
│   └── images/
│       ├── viewfinder.png      # AI-generated viewfinder image
│       └── map.png             # AI-generated metro map image
└── attached_assets/
    └── DDL_7007_-_Design_Probes_*.pdf  # Academic brief
```

## Visual Identity
- **Background**: #080808 (near-black)
- **Accent**: #c8923a (amber/gold)
- **Display font**: Playfair Display (serif, literary)
- **Mono font**: JetBrains Mono (technical, precise)
- **Aesthetic**: Dark cinematic, arthouse, contemplative

## Video Narrative (5 Scenes, ~22 seconds looping)
1. **Scene 1** (4s): Metro crowd backdrop — "Thousands of people / Completely Alone"
2. **Scene 2** (4.5s): Viewfinder image reveal — "The Probe / Isolation Viewfinder"
3. **Scene 3** (4s): Signal selection — "Tag Your Feeling" (INVISIBLE / SUFFOCATING / DRIFTING)
4. **Scene 4** (4.5s): Metro map — "The Bridge / Pin it to the Map"
5. **Scene 5** (5s): Closing title — "RESIDUE / A Design Probe for Transit Isolation"

## Running the App
```
npm run dev
```
Serves on port 5000 via Vite dev server.

## Building for Production
```
npm run build
```
Output to `dist/`.

## Tech Stack
- **Framework**: React 18 + TypeScript
- **Build**: Vite 5
- **Animation**: Framer Motion 11
- **Styling**: Tailwind CSS + CSS variables
- **Fonts**: Google Fonts (JetBrains Mono + Playfair Display)

## Deployment
Configured as static deployment: `npm run build` → serves `dist/`.
