import { Observable } from 'rxjs/Rx';
import { DOMSource } from '@cycle/dom/rxjs-typings';
const { html } = require('snabbdom-jsx');

import { Checkbox } from '../components';

type Sources = {
  DOM: DOMSource;
};

type Sinks = {
  DOM: Observable<JSX.Element>;
};

export default function main(sources: Sources): Sinks {
  const selected$ = Observable
    .interval(5000)
    .scan(
      (selected, event) => {
        return !selected;
      },
      false
    )
    .startWith(false)
    .shareReplay(1);

  const checkbox = Checkbox({
    DOM: sources.DOM,
    props$: Observable.of({
      label: 'checkbox',
    }),
  });

  const checkboxDisabled = Checkbox({
    DOM: sources.DOM,
    props$: Observable.of({
      disabled: true,
      label: 'checkbox',
    }),
  });

  const checkboxIndeterminate = Checkbox({
    DOM: sources.DOM,
    props$: Observable.of({
      indeterminate: true,
      label: 'indeterminate checkbox',
    }),
  });

  const vdom$ = Observable
    .combineLatest(
      checkbox.DOM,
      checkboxIndeterminate.DOM,
      checkboxDisabled.DOM,
    )
    .map(([checkboxTree, checkboxTreeIndeterminate, checkboxDisabled]) => {
      return (
        <div>
          {checkboxTree}
          {checkboxDisabled}
          {checkboxTreeIndeterminate}
        </div>
      );
    });

  return {
    DOM: vdom$,
  };
}
