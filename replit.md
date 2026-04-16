# Residue — Isolation Viewfinder Probe

## Overview
A Progressive Web App (PWA) designed as a design probe for transit isolation. Built with React + Vite and concepts like the "Isolation Compass" and "Residue Notes" to elicit post-hoc reflection on spatial and social experiences in transit environments.

## Project Structure
This is a **pre-built static site** (production output from Vite). There is no source code in this repository — only the compiled output.

```
/                  # Root (served as static files)
├── index.html     # Main entry point
├── assets/        # Bundled JS/CSS from Vite
├── icon-192.png   # PWA icons
├── icon-512.png
├── manifest.webmanifest  # PWA manifest
├── registerSW.js  # Service worker registration
├── sw.js          # Service worker
├── workbox-*.js   # Workbox PWA library
└── server.js      # Simple Node.js static file server
```

## Running the App
The app is served via a simple Node.js HTTP static file server on port 5000.

```
node server.js
```

## Tech Stack
- **Frontend:** React (pre-built, Vite output)
- **Styling:** CSS-in-JS with Google Fonts (JetBrains Mono, Playfair Display)
- **PWA:** Workbox-based service worker for offline support
- **Server:** Node.js built-in `http` module

## Deployment
Configured as a static site deployment. The root directory (`.`) is served directly.
