#!/usr/bin/env python3
"""Фотоларды өңдейді: түпнұсқаларды public/images/<бөлім>/ ішіне өзгертпей көшіреді,
жылдам жүктелетін оптимизацияланған WEBP нұсқаларын жасайды және src/data/photos.generated.ts жазады."""
import os, json, shutil, base64, io
from PIL import Image, ImageOps
UP='/root/.claude/uploads/6231b043-127d-5b69-8693-a393260d4f39/'
MNT='/mnt/user-data/uploads/'
def U(n):
    if n.startswith('@'):
        return UP+[f for f in os.listdir(UP) if f.startswith(n[1:])][0]
    for f in os.listdir(UP):
        if f[9:]==n: return UP+f
    return MNT+n
def X(*ids): return ['@'+i for i in ids]
SECTIONS={
 # I — Отбасылық портреттер
 'family':[f'XXX_{i:04d}.JPG' for i in range(472,478)]+['5Y8A6319.jpg','5Y8A6321.jpg','5Y8A6325.jpg','5Y8A6343.jpg','5Y8A6348.jpg','5Y8A6383.jpg','5Y8A6390.jpg','5Y8A6392.jpg','5Y8A6394.jpg','5Y8A6398.jpg'],
 # II — Көк төбе (6 адам бірге)
 'memories':['IMG-20230726-WA0020.jpg']+[f'IMG-20230726-WA00{i}.jpg' for i in range(22,31)],
 # III — Галерея (үй, теңіз, жұмыс, той)
 'gallery':X('9a636611','afde1432','5a40b9df','004a98aa','1bbb4538','1e282118','0bc49f4f','28816a12','56eb1158','729bccc6','8faf17fb','f403e8f8','4d15e5f5','1f3f2111','25fb85e6','b1b1f727','ccf5b10a','2a768cee','4bae5c80')+['5Y8A6463.jpg','5Y8A6465.jpg']+[f'new-{i}.jpg' for i in (3,4,10,11,12,13,9,6,5,7,8,1,2)],
}
PREFIX={'family':'family','memories':'memory','gallery':'gallery'}
WIDTHS=[(640,80),(1280,84),(2400,88)]
out=[]
for sec,files in SECTIONS.items():
    os.makedirs(f'public/images/{sec}',exist_ok=True); os.makedirs(f'public/images/optimized/{sec}',exist_ok=True)
    for i,fn in enumerate(files,1):
        src=U(fn); name=f'{PREFIX[sec]}-{i:02d}'; ext='.jpg' if fn.startswith('@') else os.path.splitext(fn)[1].lower()
        dst=f'public/images/{sec}/{name}{ext}'
        if not os.path.exists(dst): shutil.copyfile(src,dst)   # түпнұсқа — өзгеріссіз
        im=ImageOps.exif_transpose(Image.open(src)).convert('RGB')
        w,h=im.size
        for tw,q in WIDTHS:
            p=f'public/images/optimized/{sec}/{name}-{tw}.webp'
            if os.path.exists(p): continue
            t=im if w<=tw else im.resize((tw,round(h*tw/w)),Image.LANCZOS)
            t.save(p,'WEBP',quality=q,method=5)
        tiny=im.copy(); tiny.thumbnail((24,24)); b=io.BytesIO(); tiny.save(b,'JPEG',quality=50)
        avg=im.resize((1,1),Image.BOX).getpixel((0,0))
        out.append(dict(id=name,section=sec,file=f'{name}{ext}',orig=fn,w=w,h=h,blur='data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode(),color='#%02x%02x%02x'%avg,
                        widths=[tw if w>tw else w for tw,_ in WIDTHS]))
        print(sec,name,fn,w,h)
open('src/data/photos.generated.ts','w').write('// Автоматты түрде жасалған: npm run photos\nexport interface RawPhoto { id:string; section:"family"|"memories"|"gallery"; file:string; orig:string; w:number; h:number; blur:string; color:string; widths:number[] }\nexport const RAW_PHOTOS: RawPhoto[] = '+json.dumps(out,ensure_ascii=False)+' as RawPhoto[];\n')
print('total',len(out))
