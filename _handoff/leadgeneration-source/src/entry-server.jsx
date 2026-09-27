import React from 'react';
import {renderToString} from 'react-dom/server';
import {App} from './App';
import {ServicePage} from './ServicePage';
import {services} from './services';
export {services};
export function render(slug){return renderToString(slug?<ServicePage slug={slug}/>:<App/>)}
