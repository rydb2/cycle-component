import { Observable } from 'rxjs/Rx'
import { run } from '@cycle/rxjs-run'
import { makeDOMDriver, VNode } from '@cycle/dom'
import { DOMSource } from '@cycle/dom/rxjs-typings'
import { timeDriver, TimeSource } from '@cycle/time/rxjs'
const { html } = require('snabbdom-jsx');

import { Input } from '../components'

type Sources = {
  DOM: DOMSource;
}

type Sinks = {
  DOM: Observable<JSX.Element>;
}

function main(sources: Sources): Sinks {
  const input = Input({
    DOM: sources.DOM,
    props$: Observable.of({
      value: 'defautl event',
      placeholder: 'hahahh',
      size: 'large'
    })
  });

  const vdom$ = Observable.combineLatest(input.DOM, input.value)
    .map(([inputTree, value]) => {
      return (
        <div>
          {inputTree}
          {value}
        </div>
      )
    });

  Object.keys(input.actions).forEach(eName => {
      input.actions[eName].subscribe((e: Event) => {
        console.log(eName);
      })
  });

  return {
    DOM: vdom$
  };
}

export default main;
