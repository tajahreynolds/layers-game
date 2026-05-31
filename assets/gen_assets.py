#!/usr/bin/env python3
"""Generate Layers brand assets (icons + social preview) with Pillow.

Re-run with:  python3 assets/gen_assets.py
Outputs PNGs into the repo root so GitHub Pages can serve them at fixed paths.
"""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# palette (matches styles.css dark theme)
BG_TOP = (29, 25, 22)     # #1d1916
BG_BOTTOM = (20, 17, 15)  # #14110f
ACCENT = (224, 135, 107)  # #e0876b
ACCENT_HI = (239, 179, 156)
ACCENT_LO = (194, 94, 62)  # #c25e3e
INK = (243, 236, 228)      # #f3ece4
INK_SOFT = (182, 168, 155) # #b6a89b

SERIF = "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf"
SERIF_IT = "/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf"
SANS = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"


def radial_bg(w, h):
    """Soft radial gradient (light at top-center), like the site body."""
    small = Image.new("RGB", (96, 50))
    px = small.load()
    cx, cy = 96 / 2, 0  # glow centered at top
    maxd = ((96 ** 2) + (50 ** 2)) ** 0.5
    for y in range(50):
        for x in range(96):
            d = (((x - cx) ** 2) + ((y - cy) ** 2)) ** 0.5 / maxd
            d = min(1.0, d * 1.15)
            px[x, y] = tuple(
                round(BG_TOP[i] + (BG_BOTTOM[i] - BG_TOP[i]) * d) for i in range(3)
            )
    return small.resize((w, h), Image.BICUBIC).convert("RGBA")


def layers_mark(size):
    """Three nested rounded squares — the 'peeling layers' motif."""
    s = size * 4  # supersample for crisp edges
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    rings = [
        (0.04, ACCENT_LO, 110),
        (0.20, ACCENT, 190),
        (0.36, ACCENT_HI, 255),
    ]
    for inset, color, alpha in rings:
        m = s * inset
        r = s * (0.30 - inset * 0.4)
        d.rounded_rectangle(
            [m, m, s - m, s - m], radius=r, fill=color + (alpha,)
        )
    return img.resize((size, size), Image.LANCZOS)


def make_icon(size, bg=True, pad_ratio=0.0):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    if bg:
        d = ImageDraw.Draw(img)
        r = size * 0.22
        d.rounded_rectangle([0, 0, size, size], radius=r, fill=BG_BOTTOM + (255,))
    inner = round(size * (1 - pad_ratio))
    mark = layers_mark(inner)
    off = (size - inner) // 2
    img.alpha_composite(mark, (off, off))
    return img


def center_text(d, cx, y, text, font, fill):
    bbox = d.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0]
    d.text((cx - w / 2, y), text, font=font, fill=fill)
    return bbox[3] - bbox[1]


def make_og():
    W, H = 1200, 630
    img = radial_bg(W, H)
    d = ImageDraw.Draw(img)
    cx = W / 2
    mark = layers_mark(150)
    img.alpha_composite(mark, (int(cx - 75), 120))
    f_logo = ImageFont.truetype(SERIF, 132)
    f_tag = ImageFont.truetype(SANS, 38)
    center_text(d, cx, 290, "Layers", f_logo, INK)
    center_text(
        d, cx, 452,
        "A conversation for two — one layer at a time.",
        f_tag, INK_SOFT,
    )
    img.convert("RGB").save(os.path.join(ROOT, "og-image.png"), "PNG")


def main():
    make_icon(512, bg=True, pad_ratio=0.16).save(os.path.join(ROOT, "icon-512.png"))
    make_icon(192, bg=True, pad_ratio=0.16).save(os.path.join(ROOT, "icon-192.png"))
    # maskable icon: extra padding so the mark survives circular/squircle masks
    make_icon(512, bg=True, pad_ratio=0.30).save(os.path.join(ROOT, "icon-maskable-512.png"))
    make_icon(180, bg=True, pad_ratio=0.16).save(os.path.join(ROOT, "apple-touch-icon.png"))
    make_icon(32, bg=True, pad_ratio=0.10).save(os.path.join(ROOT, "favicon-32.png"))
    make_og()
    print("assets generated")


if __name__ == "__main__":
    main()
