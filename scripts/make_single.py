#!/usr/bin/env python3
"""Бір ғана HTML файл жасайды (суреттер, қаріптер, код — бәрі ішінде). Алдымен: LITE=1 node build.mjs"""
import base64, glob, os, re, json
d='dist-lite'
css=open(f'{d}/assets/styles.css').read()
def font(m):
    f=m.group(1).replace('../','')
    return "url('data:font/woff;base64,"+base64.b64encode(open(f'{d}/{f}','rb').read()).decode()+"')"
css=re.sub(r"url\('(\.\./fonts/[^']+)'\)",font,css)
js=open(f'{d}/assets/app.js').read().replace('</script','<\\/script')
data={}
for f in sorted(glob.glob(f'{d}/images/optimized/*/*-1280.webp')):
    data[os.path.basename(f)[:-10]]=base64.b64encode(open(f,'rb').read()).decode()
html=f'''<!doctype html>
<html lang="kk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Біздің отбасы</title><meta name="theme-color" content="#1d3a2e">
<style>{css}</style></head>
<body><div id="root"></div>
<script>window.__DATA={json.dumps(data)};</script>
<script>{js}</script></body></html>'''
open('Bizdin-otbasy.html','w',encoding='utf-8').write(html)
print(len(data),'фото,',round(len(html)/1e6,1),'МБ')
