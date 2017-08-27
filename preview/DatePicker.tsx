import { Observable } from 'rxjs/Rx'
import { run } from '@cycle/rxjs-run'
import { makeDOMDriver, VNode } from '@cycle/dom'
import { DOMSource } from '@cycle/dom/rxjs-typings'
import { timeDriver, TimeSource } from '@cycle/time/rxjs'
const { html } = require('snabbdom-jsx');

import { DatePicker } from '../components'

type Sources = {
  DOM: DOMSource;
}

type Sinks = {
  DOM: Observable<JSX.Element>;
}

export default function main(sources: Sources): Sinks {
  const datePicker = DatePicker({
    DOM: sources.DOM,
    props$: Observable.of({
      classNames: ['picker']
    })
  });

  const vdom$ = Observable.combineLatest(datePicker.DOM)
    .map(([datePickerTree]) => {
      return (
        <div>
          { datePickerTree }
        </div>
      )
    });

  Object.keys(datePicker.actions).forEach(eName => {
    datePicker.actions[eName].subscribe((e: Event) => {
      console.log(eName);
    })
  });

  return {
    DOM: vdom$
  };
}

