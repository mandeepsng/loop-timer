# Loop Timer

An Electron-based desktop reminder app that shows fullscreen break notifications at set intervals. Runs in the system tray on Windows and Linux.

---

## Features

- Fullscreen notification across all monitors
- Preset timer intervals (20s, 1min, 5min, 10min, 15min, 30min, 1hr, 1.5hr)
- Custom timer via minutes input
- Stop timer button
- Active interval highlight
- Sound on notification
- Auto-repeats after each interval
- Pauses on screen lock, resumes on unlock
- Custom notification title and message

---

## Requirements

- [Node.js](https://nodejs.org/) v18+
- npm

---

## Setup

```bash
# Clone the repository
git clone https://github.com/mandeepsng/loop-timer.git
cd loop-timer

# Install dependencies
npm install --ignore-scripts
```

---

## Development

```bash
# Run the app in development mode
npm run dev
```

---

## Build

### Build for Windows

```bash
npm run build:win
```

Output: `dist/looptimer Setup x.x.x.exe`

### Build for Linux

```bash
npm run build:linux
```

Output:
- `dist/looptimer-x.x.x.AppImage`
- `dist/looptimer_x.x.x_amd64.deb`

---

## Release (GitHub Actions)

### Step 1 — Create a version tag

```bash
git tag v1.0.1
git push origin v1.0.1
```

### What happens automatically:

1. GitHub Actions `release.yml` workflow triggers
2. Windows (`.exe`) and Linux (`.AppImage`, `.deb`) builds run in parallel
3. A draft GitHub Release is created with all build files attached
4. Go to `github.com/mandeepsng/loop-timer/releases` and publish the draft release

---

## GitHub Actions Workflows

| Workflow | File | Trigger | What it does |
|---|---|---|---|
| Build | `.github/workflows/build.yml` | Push to `master` | Builds for Win + Linux, uploads as artifacts |
| Release | `.github/workflows/release.yml` | Push a `v*` tag | Builds for Win + Linux, publishes to GitHub Releases |

### Download build artifacts (without releasing)

After every push to `master`, go to:

```
github.com/mandeepsng/loop-timer/actions
```

Open the latest workflow run → scroll down to **Artifacts** section → download `windows-build` or `linux-build`.

---

## Git Commands Reference

```bash
# Check status
git status

# Stage all changes
git add .

# Commit
git commit -m "your message"

# Push to master
git push origin master

# Create a release tag
git tag v1.0.2
git push origin v1.0.2

# List all tags
git tag

# Delete a local tag
git tag -d v1.0.1

# Delete a remote tag
git push origin --delete v1.0.1
```

---

## Project Structure

```
loop-timer/
├── main.js              # Electron main process
├── renderer.js          # Renderer process (UI logic)
├── preload.js           # Context bridge (IPC bridge)
├── index.html           # Main app window
├── notification.html    # Fullscreen notification window
├── about.html           # About page
├── assets/
│   └── icon.png         # App icon
├── data.json            # Saved notification settings
├── .github/
│   └── workflows/
│       ├── build.yml    # CI build workflow
│       └── release.yml  # Release workflow
└── package.json
```

---

## Author

Mandeep Singh — mandeep@rvsmedia.com
