import { Observable } from 'rxjs'
import {makeHashHistoryDriver} from '@cycle/history'
import { run } from '@cycle/rxjs-run'
import { makeDOMDriver } from '@cycle/dom'

import Button from './Button'
import Input from './Input'

import './styles/index.less'

const { html } = require('snabbdom-jsx');
const classNames = require('classnames');

function navigation(pathname) {
  let btnClass = classNames([{active: pathname === 'button'}, 'link']);
  let inputClass = classNames([{active: pathname === 'input'}, 'link']);
  return (
    <nav className="nav">
      <span
        attrs-data-link="button"
        className={ btnClass }>
        Button
      </span>
      <span
        attrs-data-link="input"
        className={ inputClass }>
        Input
      </span>
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
      page = {DOM: Observable.of(<h1>Welcome Cycle Component</h1>)}
    }

    return page.DOM.map(domTree => {
      return (
        <div className="main">
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

  return {
    DOM: vdom$,
    history: history$
  }
}

run(main, {
  DOM: makeDOMDriver('#app'),
  history: makeHashHistoryDriver()
});
