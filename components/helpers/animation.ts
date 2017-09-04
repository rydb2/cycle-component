import { Observable } from 'rxjs'
import { DOMSource } from '@cycle/dom/rxjs-typings'

function classNames(names:string[], status:string):string {
  return names.map(each => {
    return each + '--' + status;
  }).join(' ');
}

export interface SimpleAnimation {
  type: string;
  status: string;
  className: string;
}

export function simple(type: string, DOM: DOMSource, animationName:string) {

  let animatonEnd$ = DOM.events('animationend').map(e => {
    return { type, status: 'end', className: `${animationName}--end` };
  })

  let animationStart$ = Observable.of({ type, status: 'start', className: `${animationName}--start` });

  return Observable.merge(animationStart$, animatonEnd$);
}
