import { makeDOMDriver } from '@cycle/dom';
import { makeHashHistoryDriver } from '@cycle/history';
import { default as run } from '@cycle/rxjs-run';
import * as classNamesFn from 'classnames';
import { Observable } from 'rxjs';

import Button from './Button';
import Checkbox from './Checkbox';
import DatePicker from './DatePicker';
import Input from './Input';

import './styles/index.less';

const { html } = require('snabbdom-jsx');

function navigation(pathname) {
  const links = [
    'button',
    'input',
    'date-picker',
    'checkbox',
  ];
  const linkDom = (name) => {
    const classNames = classNamesFn({ active: pathname === name }, 'link');
    return (
      <span
        attrs-data-link={name}
        className={classNames}
      >
        {name}
      </span>
    );
  };
  return (
    <nav className="nav">
      {links.map(link => linkDom(link))}
    </nav>
  );
}

function view(DOM, history$) {
  return history$.flatMap((history) => {
    const { pathname } = history;
    const nav = navigation(pathname);

    let page;
    if (pathname === '/button') {
      page = Button({ DOM });
    } else if (pathname === '/input') {
      page = Input({ DOM });
    } else if (pathname === '/date-picker') {
      page = DatePicker({ DOM });
    } else if (pathname === '/checkbox') {
      page = Checkbox({ DOM });
    } else {
      const style = {
        textAlign: 'center',
        marginTop: '20px',
      };
      page = { DOM: Observable.of(<h1 style={style}>Welcome Cycle Component</h1>) };
    }

    return page.DOM.map((domTree) => {
      return (
        <div className="main">
          {nav}
          <div style={{flex: 1}}>{domTree}</div>
        </div>
      );
    });
  });
}

function main(sources) {
  const history$ = sources.DOM
    .select('nav')
    .events('click')
    .distinctUntilChanged()
    .map(e => e.target.dataset.link);
  const vdom$ = view(sources.DOM, sources.history);

  return {
    DOM: vdom$,
    history: history$,
  };
}

run(main, {
  DOM: makeDOMDriver('#app'),
  history: makeHashHistoryDriver(),
});
