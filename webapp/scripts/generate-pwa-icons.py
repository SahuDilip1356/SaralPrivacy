#!/usr/bin/env python3
"""Generate the PWA icon set from public/logo-emblem.png.

Regenerate with:  python3 scripts/generate-pwa-icons.py   (needs Pillow)

Outputs into public/icons/:
  icon-192.png          launcher icon (navy bg, emblem ~82%)
  icon-512.png          large icon / splash source (navy bg, emblem ~82%)
  maskable-512.png      Android maskable — emblem confined to the 80% safe
                        circle so launcher crops (circle/squircle) never clip it
  apple-touch-icon.png  180px, flattened RGB — iOS composites transparency
                        onto black, so alpha must be removed

Background is navy-800 (#0D1322), the brand dark-canvas token. Source emblem is
256px; the mild upscale is invisible at launcher display sizes.
"""
from pathlib import Path

from PIL import Image, ImageDraw

NAVY = (0x0D, 0x13, 0x22, 255)
WHITE = (255, 255, 255, 255)
ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "logo-emblem.png"
OUT = ROOT / "public" / "icons"


def badge(canvas_px: int, emblem_px: int, flatten: bool = False) -> Image.Image:
    emblem = Image.open(SRC).convert("RGBA").resize(
        (emblem_px, emblem_px), Image.LANCZOS
    )
    canvas = Image.new("RGBA", (canvas_px, canvas_px), NAVY)
    offset = (canvas_px - emblem_px) // 2
    # The emblem's inner disc is transparent, so the navy "S" would sit on the
    # navy canvas and vanish. Restore the white disc it was designed against,
    # kept just inside the outer ring so no white halo leaks past it.
    disc = round(emblem_px * 0.94)
    d0 = offset + (emblem_px - disc) // 2
    ImageDraw.Draw(canvas).ellipse([d0, d0, d0 + disc, d0 + disc], fill=WHITE)
    canvas.alpha_composite(emblem, (offset, offset))
    return canvas.convert("RGB") if flatten else canvas


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    badge(192, 158).save(OUT / "icon-192.png")
    badge(512, 420).save(OUT / "icon-512.png")
    # 80% safe circle on 512 = 410px diameter; 312 leaves comfortable margin.
    badge(512, 312).save(OUT / "maskable-512.png")
    badge(180, 132, flatten=True).save(OUT / "apple-touch-icon.png")
    for f in sorted(OUT.iterdir()):
        print(f.name, f.stat().st_size, "bytes")


if __name__ == "__main__":
    main()
