# /public/asset — Image Assets

Place ALL site images in this folder (singular "asset", NOT "assets").

## Required files

| File | Usage |
|---|---|
| `logo.png` | **Your VG monogram logo** — drop the PNG here. It will be inverted to white for dark backgrounds and tinted gold for the hero via CSS filter. |
| `hero-bg.jpg` | Hero section background (recommended: 2560×1440, high-quality JPG) |
| `og-image.jpg` | Open Graph / social share image (1200×630) |

## Design overlays

Place design PNGs in `/public/asset/designs/` with transparent backgrounds (PNG-24):

| File | Design name |
|---|---|
| `design-arch.png` | Arch Logo |
| `design-crown.png` | Crown Crest |
| `design-script.png` | Gallery Script |
| `design-star.png` | Varsity Star |
| `design-fleur.png` | Fleur De Lis |
| `design-block.png` | Block Type |
| `design-badge.png` | Heritage Badge |
| `design-minimal.png` | Minimal VG |

## Logo CSS filter reference

The Logo component applies these filters automatically:
- Dark backgrounds → `brightness(0) invert(1)` (black logo → white)
- Gold tint → `brightness(0) saturate(100%) invert(72%) sepia(42%) saturate(600%) hue-rotate(5deg)` (black → gold #C9A84C)
