import { Observable } from 'rxjs'
import { DOMSource } from '@cycle/dom/rxjs-typings'

function classNames(names:string[], status:string):string {
  return names.map(each => {
    return each + '--' + status;
  }).join(' ');
}

export function simple(key: string, DOM: DOMSource, animationNames:string) {

  let animatonEnd$ = DOM.events('animationend').map(e => {
    return { key, status: 'end', className: `${animationNames}--end` };
  })

  let animationStart$ = Observable.create(function(observer) {
    observer.next({ key, status: 'start', className: `${animationNames}--start` });
  })

  return Observable.merge(animationStart$, animatonEnd$);
}
