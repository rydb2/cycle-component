import { Observable } from 'rxjs'
import {makeHashHistoryDriver} from '@cycle/history'
import { run } from '@cycle/rxjs-run'
import { makeDOMDriver } from '@cycle/dom'

import Button from './Button'
import Input from './Input'
import DatePicker from './DatePicker'

import './styles/index.less'

const { html } = require('snabbdom-jsx');
const classNames = require('classnames');

function navigation(pathname) {
  const links = ['button', 'input', 'date-picker'];
  let linkDom = (name) => {
    let className = classNames({active: pathname === name}, 'link');
    return (
      <span
        attrs-data-link={name}
        className={ className }>
        {name}
      </span>
    )
  }
  return (
    <nav className="nav">
      {
        links.map(link => {
          return linkDom(link)
        })
      }
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
    } else if (pathname === '/date-picker') {
      page = DatePicker({DOM});
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
