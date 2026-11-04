import React,{Suspense} from 'react';
import {renderToString} from 'react-dom/server';
import {App} from './App';
import {ServicePage} from './ServicePage';
import {services,homeFaq,teamQuestions} from './services';
export {services,homeFaq,teamQuestions};
export function render(slug){return renderToString(slug?<ServicePage slug={slug}/>:<Suspense fallback={null}><App/></Suspense>)}
