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

export default function main(sources: Sources): Sinks {
  const raisedBtn = Button({
    DOM: sources.DOM,
    props$: Observable.of({
      label: 'button',
      type: 'raised',
      secondary: true,
      icon: {
        name: 'social.ic_cake',
        color: '#ffffff',
      },
    })
  });

  const raisedBtnLoading = Button({
    DOM: sources.DOM,
    props$: Observable.of({
      label: 'button',
      type: 'raised',
      loading: true,
    })
  });

  const flatBtn = Button({
    DOM: sources.DOM,
    props$: Observable.of({
      label: 'outline button',
      type: 'flat',
    })
  });

  const flatBtnLoading = Button({
    DOM: sources.DOM,
    props$: Observable.of({
      label: 'outline button',
      type: 'flat',
      loading: true,
    })
  });

  const disabledBtn = Button({
    DOM: sources.DOM,
    props$: Observable.of({
      label: 'outline button',
      type: 'raised',
      disabled: true,
    })
  });

  const vdom$ = Observable.combineLatest(
    raisedBtn.DOM,
    raisedBtnLoading.DOM,
    flatBtn.DOM,
    flatBtnLoading.DOM,
    disabledBtn.DOM
  )
    .map(btns => {
      let style = {
        marginTop: '20px',
      };
      return (
        <div>
          {
            btns.map(each => {
              return <li style={style}>{each}</li>
            })
          }
        </div>
      )
    });

  return {
    DOM: vdom$
  };
}

