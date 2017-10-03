import { DOMSource } from '@cycle/dom/rxjs-typings';
import { default as isolateFn } from '@cycle/isolate';
import * as classNamesFn from 'classnames';
import { Observable } from 'rxjs';
import { VNode } from 'snabbdom/vnode';
const { html } = require('snabbdom-jsx');

import {
  IAction,
  IDomComponentSinks,
  IDomComponentSources,
} from '../helpers/domInterfaces';

export interface IProps {
  date: Date;
}

export interface ISources {
  DOM: DOMSource;
  props$: Observable<IProps>;
}

export interface ISinks extends IDomComponentSinks {
}

function main(sources: ISources): { DOM: Observable<JSX.Element>, actions$: Observable<IAction> } {

  const actions$ = Observable.merge(
    sources.DOM.select('.js-year-item')
      .events('click')
      .map(event => ({ event, type: 'yearSelect' })),
  );

  const vdom$ = sources.props$.map(({ date }) => {
    const yearTree = [];
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    for (let i = year - 100; i <= year + 100; i += 1) {
      const dayStr = [i, month, day].join('/');
      if (i === year) {
        yearTree.push(
          <ul
            attrs-data-date={dayStr}
            className="js-year-item cc-date-picker__year-item selected"
          >
            {i}
          </ul>,
        );
      } else {
        yearTree.push(
          <ul
            attrs-data-date={dayStr}
            className="js-year-item cc-date-picker__year-item"
          >
              {i}
          </ul>,
        );
      }
    }

    function insert(vnode: VNode) {
      vnode.elm.parentElement.scrollTop = (vnode.elm as HTMLElement).offsetHeight / 2 - 150;
    }

    return (
      <div hook-insert={insert} className="cc-date-picker-year-panel">
        {yearTree}
      </div>
    );

  });
  return {
    actions$,
    DOM: vdom$,
  };
}

export default function isolateDatePicker(sources: ISources, isolate: boolean = true): ISinks {
  return isolate ? isolateFn(main)(sources) : main(sources);
}
