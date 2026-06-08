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

## Local Build

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

## How Releases Work (GitHub Actions)

There are **2 ways** a release is created automatically:

---

### Way 1 — Every push to `master` (Draft Release)

Jab bhi `master` branch pe koi code push hota hai, GitHub Actions automatically:

1. Windows (`.exe`) build karta hai
2. Linux (`.AppImage` + `.deb`) build karta hai
3. **Draft Release** create karta hai `github.com/mandeepsng/loop-timer/releases` pe — teeno files attached hoti hain

**Draft release publish karne ke liye:**
> Releases page pe jaao → Draft dikhega → **Edit** → **Publish release**

```bash
# Bas yeh karo — baaki sab automatic hoga
git add .
git commit -m "your message"
git push origin master
```

---

### Way 2 — Tag push karo (Versioned Release)

Jab koi proper version release karni ho (v1.0.1, v1.0.2 etc.):

```bash
# Step 1: Tag banao
git tag v1.0.1

# Step 2: Tag push karo
git push origin v1.0.1
```

GitHub Actions `release.yml` trigger hoga aur:
1. Windows + Linux dono build honge
2. GitHub Releases pe files automatically upload ho jaayengi

---

### Release Flow Summary

```
master pe push karo
       ↓
build-windows  +  build-linux  (parallel run)
       ↓
  Draft Release create hoti hai
       ↓
github.com/mandeepsng/loop-timer/releases
       ↓
  Publish karo (manually)
```

```
git tag v1.0.x + git push origin v1.0.x
       ↓
build-windows  +  build-linux  (parallel run)
       ↓
  Published Release (automatically)
       ↓
github.com/mandeepsng/loop-timer/releases
```

---

## GitHub Actions Workflows

| Workflow | File | Trigger | Result |
|---|---|---|---|
| Build | `.github/workflows/build.yml` | Push to `master` | Draft Release with `.exe`, `.AppImage`, `.deb` |
| Release | `.github/workflows/release.yml` | `git push origin vX.X.X` | Published Release with all files |

---

## Git Commands Reference

```bash
# Check current status
git status

# Stage all changes
git add .

# Commit changes
git commit -m "your message"

# Push to master (triggers Draft Release automatically)
git push origin master

# --- Versioned Release ---

# Create a version tag
git tag v1.0.1

# Push tag (triggers Published Release automatically)
git push origin v1.0.1

# List all tags
git tag

# Delete a local tag (if mistake)
git tag -d v1.0.1

# Delete a remote tag (if mistake)
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
│       ├── build.yml    # Push to master → Draft Release
│       └── release.yml  # Tag push → Published Release
└── package.json
```

---

## Author

Mandeep Singh — mandeep@rvsmedia.com
