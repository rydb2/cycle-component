import { Observable } from 'rxjs/Rx'
import { run } from '@cycle/rxjs-run'
import { makeDOMDriver, VNode } from '@cycle/dom'
import { DOMSource } from '@cycle/dom/rxjs-typings'
import { timeDriver, TimeSource } from '@cycle/time/rxjs'
import * as marked from 'marked'
const { html } = require('snabbdom-jsx')

import Button from './ui/Button'
import Input from './ui/Input'
import * as enums from './ui/enums'

type Sources = {
  DOM: DOMSource;
}

type Sinks = {
  DOM: Observable<JSX.Element>;
}

function main(sources: Sources): Sinks {

  // const button = Button({
  //   DOM: sources.DOM,
  //   props$: Rx.Observable.of({label: 'lala'})
  // }, true);

  // button.events.click.subscribe((e) => {
  //   console.log(e)
  // })

  const input = Input({
    DOM: sources.DOM,
    props$: Observable.of({
      value: 'defautl event',
      placeholder: 'hahahh',
      size: enums.SIZE.large
    })
  })

  const vdom$ = Observable.combineLatest(input.DOM, input.value)
    .map(([inputTree, value]) => {
      return (
        <div>
          {inputTree}
          {value}
        </div>
      )
    });

  return {
    DOM: vdom$
  };
}

run(main, {
  DOM: makeDOMDriver('#main')
});