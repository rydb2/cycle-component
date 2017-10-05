import { Observable } from 'rxjs/Rx';
import { DOMSource } from '@cycle/dom/rxjs-typings';
const { html } = require('snabbdom-jsx');

import { DatePicker } from '../components';

type Sources = {
  DOM: DOMSource;
};

type Sinks = {
  DOM: Observable<JSX.Element>;
};

export default function main(sources: Sources): Sinks {
  const datePicker = DatePicker({
    DOM: sources.DOM,
    props$: Observable.of({
      classNames: ['picker'],
      placeholder: 'please select date',
    }),
  });

  const vdom$ = Observable.combineLatest(datePicker.DOM)
    .map(([datePickerTree]) => {
      return (
        <div>
          {datePickerTree}
        </div>
      );
    });

  return {
    DOM: vdom$,
  };
}
