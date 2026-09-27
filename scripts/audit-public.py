#!/usr/bin/env python3
"""Bounded source QA for every sitemap page: metadata, schemas, links and assets."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import xml.etree.ElementTree as ET,json,re
R=Path(__file__).resolve().parents[1]
class Doc(HTMLParser):
 def __init__(self,s):
  super().__init__();self.tags=[];self.ids=set();self.h1=0;self.feed(s)
 def handle_starttag(self,t,a):
  a=dict(a);self.tags.append((t,a));self.h1+=t=='h1'
  if 'id' in a:self.ids.add(a['id'])
def path_file(path):
 p=R/unquote(path).lstrip('/');return p/'index.html' if p.is_dir() or not p.suffix else p
urls=[x.text for x in ET.parse(R/'sitemap.xml').getroot().iter() if x.tag.endswith('loc')];errors=[];docs={};rows=[]
for url in urls:
 p=path_file(urlsplit(url).path)
 if not p.exists():errors.append([url,'missing file']);continue
 s=p.read_text();d=Doc(s);docs[url]=(p,s,d)
 title=re.search(r'<title>(.*?)</title>',s,re.S);canon=[a.get('href') for t,a in d.tags if t=='link' and a.get('rel')=='canonical'];desc=[a.get('content') for t,a in d.tags if t=='meta' and a.get('name')=='description'];schemas=re.findall(r'<script type="application/ld\+json">(.*?)</script>',s,re.S)
 if d.h1!=1:errors.append([url,'h1',d.h1])
 if not title or not desc or canon!=[url]:errors.append([url,'metadata',canon])
 if not schemas:errors.append([url,'schema missing'])
 for x in schemas:
  try:json.loads(x)
  except Exception:errors.append([url,'invalid schema'])
 if re.search(r'<meta[^>]+noindex',s):errors.append([url,'noindex'])
 rows.append(dict(url=url,bytes=p.stat().st_size,h1=d.h1,schemas=len(schemas)))
for url,(p,s,d) in docs.items():
 for tag,a in d.tags:
  href=a.get('href') if tag in ('a','link') else a.get('src') if tag in ('img','script') else None
  if not href:continue
  u=urlsplit(href)
  if u.scheme in ('mailto','tel','data','javascript') or (u.netloc and u.netloc!='loops.uz'):continue
  targetpath=u.path or urlsplit(url).path
  if not targetpath.startswith('/'):targetpath=str((p.parent/R).resolve()) if False else '/'+str((p.parent/targetpath).relative_to(R))
  target=path_file(targetpath)
  if not target.exists():errors.append([url,'broken local resource',href]);continue
  if tag=='img' and not 'alt' in a:errors.append([url,'missing alt',href])
  if u.fragment and target.suffix=='.html':
   targetdoc=Doc(target.read_text())
   if unquote(u.fragment) not in targetdoc.ids:errors.append([url,'missing anchor',href])
print(json.dumps(dict(pages=len(rows),errors=errors,rows=rows),ensure_ascii=False,indent=2))
raise SystemExit(bool(errors))
