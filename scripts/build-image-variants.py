#!/usr/bin/env python3
"""Generate display-sized WebP assets without changing the original artwork."""
from pathlib import Path
from PIL import Image
import json,re,base64
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'_handoff/leadgeneration-source'
ASSETS=ROOT/'leadgeneration/assets'
MIRROR=SOURCE/'public/assets'
def scaled(name,dest,width):
    im=Image.open(ASSETS/name).convert('RGBA')
    if im.width>width:
        im=im.resize((width,round(im.height*width/im.width)),Image.Resampling.LANCZOS)
    target=ASSETS/dest;target.parent.mkdir(parents=True,exist_ok=True)
    im.save(target,'WEBP',quality=88,method=6)
    mirror=MIRROR/dest;mirror.parent.mkdir(parents=True,exist_ok=True);mirror.write_bytes(target.read_bytes())
    return dest
covers=set(re.findall(r'["\']?image["\']?\s*:\s*["\']([^"\']+)',(SOURCE/'src/data.js').read_text()))
covers.update(x['image'] for x in json.loads((SOURCE/'src/new-cases.json').read_text()))
result={'covers':{},'logos':{}}
for name in sorted(covers):
    result['covers'][name]=scaled(name,'thumbs/'+Path(name).stem+'-640.webp',640)
for logo in json.loads((SOURCE/'src/logos.json').read_text()).values():
    name=logo['file']
    result['logos'][name]='clients/'+name if name.endswith('.svg') else scaled('clients/'+name,'clients/thumbs/'+Path(name).stem+'-240.webp',240)
scaled('marker-hero-loop.webp','marker-hero-loop-740.webp',740)
scaled('daniil-avatar-2026.webp','daniil-avatar-160.webp',160)
result['hero']='data:image/webp;base64,'+base64.b64encode((ASSETS/'marker-hero-loop-740.webp').read_bytes()).decode()
(SOURCE/'src/image-variants.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(f"Prepared {len(result['covers'])} cover and {len(result['logos'])} logo variants.")
