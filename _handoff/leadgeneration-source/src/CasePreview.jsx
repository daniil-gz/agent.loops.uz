import React, {useEffect, useRef} from 'react';
import {createPortal} from 'react-dom';
import {X, ArrowUpRight} from '@phosphor-icons/react';

// Native dialog supplies focus containment, inert background and Escape handling.
export function CasePreview({data, onClose}) {
 const dialog=useRef(null);
 const close=useRef(null);
 useEffect(()=>{
  const el=dialog.current;
  const origin=document.activeElement;
  const previousOverflow=document.body.style.overflow;
  el.showModal();
  document.body.style.overflow='hidden';
  close.current?.focus({preventScroll:true});
  return()=>{el.close();document.body.style.overflow=previousOverflow;origin?.focus({preventScroll:true});};
 },[]);
 return createPortal(<dialog ref={dialog} className="case-preview" aria-labelledby="preview-title" onCancel={e=>{e.preventDefault();onClose();}} onKeyDown={e=>{if(e.key==='Tab'){const items=[...dialog.current.querySelectorAll('button:not([disabled]),a[href]')];const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}} onClick={e=>{if(e.target===dialog.current){const r=dialog.current.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose();}}}>
  <button ref={close} type="button" className="icon-button preview-close" aria-label="Закрыть предпросмотр" onClick={onClose}><X size={23}/></button>
  <div className="preview-grid">
   <div className={`preview-image ${data.poster?'preview-image--poster':''} ${data.portrait?'preview-image--portrait':''}`} style={{backgroundColor:data.color}}><img src={import.meta.env.BASE_URL+'assets/'+data.image} alt=""/><div><span className="eyebrow">{data.category}</span><h2 id="preview-title">{data.name}</h2></div></div>
   <div className="preview-copy"><span className="eyebrow">КЕЙС LOOPS / {data.tools}</span>
    <div className="preview-metrics"><div><strong>{data.result}</strong><span>{data.unit}</span></div><div><strong>{data.extra}</strong><span>{data.extraLabel}</span></div></div>
    <h3>Задача и подход</h3><p>{data.description}</p><h3>Что получилось</h3><p>{data.detail}</p>
    <a className="button button-yellow" href={`/cases/case-${data.id}/`}>Посмотреть полный кейс <ArrowUpRight size={19}/></a>
    <a className="text-link" href="#contact" onClick={onClose}>Обсудить похожую задачу <ArrowUpRight size={17}/></a>
   </div>
  </div>
 </dialog>,document.body);
}
