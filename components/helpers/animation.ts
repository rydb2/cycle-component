import { DOMSource } from '@cycle/dom/rxjs-typings';
import { Observable, Scheduler } from 'rxjs';

function classNames(names: string[], status: string): string {
  return names.map((each) => {
    return each + '--' + status;
  }).join(' ');
}

export interface ISimpleAnimation {
  type: string;
  status: string;
  className?: string;
}

export function simple(type: string, DOM: DOMSource, animationName: string) {

  const animatonEnd$ = DOM.events('animationend').map((e) => {
    return { type, status: 'end', className: `${animationName}--end` };
  }).take(1);

  const animationStart$ = Observable.of({
    type,
    className: `${animationName}--start`,
    status: 'start',
  });

  return Observable.concat(animationStart$, animatonEnd$);
}
