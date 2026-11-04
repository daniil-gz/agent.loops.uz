import React from 'react';
import site from './site-nav.json';
// One header menu and footer for every page. Python pages read the same site-nav.json (scripts/offer_block.py).
export const SITE = site;
const main = new Set(site.nav.map(([u]) => u));
export function NavLinks({onClick}) {
 return <>{site.nav.map(([u, t]) => <a key={u} href={u} onClick={onClick}>{t}</a>)}
  {site.menu.filter(([u]) => !main.has(u)).map(([u, t]) => <a key={'m' + u} href={u} className="nav-extra" onClick={onClick}>{t}</a>)}</>;
}
export function FooterLinks() {
 return <>{site.footer.map(([u, t]) => <a key={u} href={u}>{t}</a>)}</>;
}
export function SeoLinks({className = 'footer-seo'}) {
 return <nav className={className} aria-label="Услуги и материалы">{site.seo.map(([u, t]) => <a key={u} href={u}>{t}</a>)}</nav>;
}
