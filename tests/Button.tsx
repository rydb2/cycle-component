import { Observable } from 'rxjs/Rx'
import { run } from '@cycle/rxjs-run'
import { makeDOMDriver, VNode } from '@cycle/dom'
import { DOMSource } from '@cycle/dom/rxjs-typings'
import { timeDriver, TimeSource } from '@cycle/time/rxjs'
const { html } = require('snabbdom-jsx');

import { Button } from '../components'
import '../components/Icon'

type Sources = {
  DOM: DOMSource;
}

type Sinks = {
  DOM: Observable<JSX.Element>;
}

function main(sources: Sources): Sinks {
  const button = Button({
    DOM: sources.DOM,
    props$: Observable.of({
      label: 'hahaha',
      icon: 'face'
    })
  }, false);

  const vdom$ = Observable.combineLatest(button.DOM)
    .map(([buttonTree]) => {
      return (
        <div>
          { buttonTree }
        </div>
      )
    });

  Object.keys(button.actions).forEach(eName => {
    button.actions[eName].subscribe(e => {
      console.log(eName);
    })
  });

  return {
    DOM: vdom$
  };
}

run(main, {
  DOM: makeDOMDriver('#main')
});
