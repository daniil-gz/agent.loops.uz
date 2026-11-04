"""Shared image helpers for generated illustrations (article covers, industry cards)."""
from PIL import Image


def centre(img, margin=0.10):
    """Find the drawing on the flat paper background and put it in the middle of a 3:2 canvas."""
    from PIL import ImageChops
    bg = img.getpixel((4, 4))
    diff = ImageChops.difference(img, Image.new('RGB', img.size, bg)).convert('L').point(lambda v: 255 if v > 28 else 0)
    box = diff.getbbox()
    if not box:
        return img
    pad = 30
    box = (max(0, box[0] - pad), max(0, box[1] - pad), min(img.width, box[2] + pad), min(img.height, box[3] + pad))
    art = img.crop(box)
    W = max(art.width / (1 - 2 * margin), art.height * 1.5 / (1 - 2 * margin))
    H = W / 1.5
    # Base = an empty strip of the same paper (keeps the grain), art pasted with soft edges.
    from PIL import ImageFilter
    blank = [x for x in range(0, img.width - 40, 20) if not diff.crop((x, 0, x + 40, img.height)).getbbox()]
    strip = img.crop((blank[0], 0, blank[0] + 40, img.height)) if blank else Image.new('RGB', (40, img.height), bg)
    canvas = Image.new('RGB', (round(W), round(H)), bg)
    for x in range(0, canvas.width, 40):
        for y in range(0, canvas.height, img.height):
            canvas.paste(strip, (x, y))
    feather = max(8, round(min(art.size) * 0.04))
    mask = Image.new('L', art.size, 0)
    mask.paste(255, (feather, feather, art.width - feather, art.height - feather))
    mask = mask.filter(ImageFilter.GaussianBlur(feather / 2))
    canvas.paste(art, ((canvas.width - art.width) // 2, (canvas.height - art.height) // 2), mask)
    return canvas


def fit(im, w, h):
    r = max(w / im.width, h / im.height)
    x = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
    left, top = (x.width - w) // 2, (x.height - h) // 2
    return x.crop((left, top, left + w, top + h))
