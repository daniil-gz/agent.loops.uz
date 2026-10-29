import React,{Suspense} from 'react';
import {renderToString} from 'react-dom/server';
import {App} from './App';
import {ServicePage} from './ServicePage';
import {services,homeFaq} from './services';
export {services,homeFaq};
export function render(slug){return renderToString(slug?<ServicePage slug={slug}/>:<Suspense fallback={null}><App/></Suspense>)}
