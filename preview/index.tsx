import { Observable } from 'rxjs'
import {makeHashHistoryDriver} from '@cycle/history'
import { run } from '@cycle/rxjs-run'
import { makeDOMDriver } from '@cycle/dom'

import Button from './Button'
import Input from './Input'

const { html } = require('snabbdom-jsx');
const classNames = require('classnames');

function navigation(pathname) {
  return (
    <nav>
      <span attrs-data-link="button" className={ pathname === 'button' ? 'active' : '' }>Button</span>
      <span attrs-data-link="button" className={ pathname === 'input' ? 'active' : '' }>Input</span>
    </nav>
  );
}

function view(DOM, history$) {
  return history$.flatMap(history => {
    const {pathname} = history;
    const nav = navigation(pathname);

    let page;
    if (pathname === '/button') {
      page = Button({DOM});
    } else if (pathname === '/input') {
      page = Input({DOM});
    } else {
      page = {DOM: Observable.of(<div></div>)}
    }

    return page.DOM.map(domTree => {
      return (
        <div>
          { nav }
          <div>{ domTree }</div>
        </div>
      )
    })
  });
}

function main(sources) {
  const history$ = sources.DOM.select('nav').events('click')
    .map(e => {
      return e.target.dataset.link
    })
    .distinctUntilChanged();
  const vdom$ = view(sources.DOM, sources.history);
  console.log('aa')

  return {
    DOM: vdom$,
    history: history$
  }
}

run(main, {
  DOM: makeDOMDriver('#app'),
  history: makeHashHistoryDriver()
});
