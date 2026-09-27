import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {render,services} from '../dist/ssr/entry-server.js';
const base=new URL('../dist/client/',import.meta.url);
const shell=await readFile(new URL('index.html',base),'utf8');
const title='Loops — лидогенерация, ИИ и продажи в Ташкенте';
const description='Даниил Газизов и Loops: лидогенерация, ИИ-квалификация, отдел продаж, CRM и сквозная аналитика. Ташкент, Узбекистан. Кейсы и подход к работе.';
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const person={'@type':'Person','@id':'https://loops.uz/#daniil',name:'Даниил Газизов',url:'https://loops.uz/about/',image:'https://loops.uz/leadgeneration/assets/daniil-avatar-2026.webp',jobTitle:'Маркетолог, основатель Loops',sameAs:['https://t.me/dani_gzv','https://instagram.com/danii_gzv','https://www.youtube.com/@dani_gzv','https://www.threads.net/@danii_gzv']};
const organization={'@type':'Organization','@id':'https://loops.uz/#organization',name:'Loops',url:'https://loops.uz/',founder:{'@id':person['@id']},areaServed:{'@type':'Country',name:'Узбекистан'}};
// Reuse existing first-party analytics configuration. No new accounts or tracking IDs.
const analytics=await readFile(new URL('../src/analytics.html',import.meta.url),'utf8');
for(const slug of ['',...Object.keys(services)]){
 const s=services[slug],url='https://loops.uz/'+(slug?slug+'/':'');
 const t=s?.title||title,d=s?.description||description;
 const graph=[person,organization,{'@type':'WebSite','@id':'https://loops.uz/#website',url:'https://loops.uz/',name:'Loops',inLanguage:'ru',publisher:{'@id':organization['@id']}}];
 if(s)graph.push({'@type':'Service','@id':url+'#service',name:s.name,url,description:d,provider:{'@id':organization['@id']},areaServed:{'@type':'Country',name:'Узбекистан'}},{'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Главная',item:'https://loops.uz/'},{'@type':'ListItem',position:2,name:s.name,item:url}]});
 else graph.push({'@type':'WebPage','@id':url+'#page',url,name:t,description:d,about:{'@id':organization['@id']}});
 const metadata=`<noscript><style>.contact-form{display:none}</style></noscript><link rel="canonical" href="${url}"><meta property="og:type" content="website"><meta property="og:site_name" content="Loops"><meta property="og:title" content="${escape(t)}"><meta property="og:description" content="${escape(d)}"><meta property="og:url" content="${url}"><meta property="og:image" content="https://loops.uz/leadgeneration/assets/daniil-avatar-2026.webp"><meta name="twitter:card" content="summary"><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replaceAll('<','\\u003c')}</script>`;
 let html=shell.replace(/<title>.*?<\/title>/,`<title>${t}</title>`).replace(/<meta name="description" content="[^"]*"\s*\/?\s*>/,`<meta name="description" content="${escape(d)}">`).replace('noindex,follow','index,follow,max-image-preview:large').replace('</head>',metadata+'</head>').replace('<div id="root"></div>',`<div id="root">${render(slug)}</div>`).replace('</body>',analytics+'</body>');
 const dir=new URL(slug?slug+'/':'',base);await mkdir(dir,{recursive:true});await writeFile(new URL('index.html',dir),html);
}
console.log('Prerendered homepage and 4 service pages with indexable HTML.');
