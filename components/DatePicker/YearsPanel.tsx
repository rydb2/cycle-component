import { Observable } from "rxjs";
import isolateFn from '@cycle/isolate';
import { DOMSource } from '@cycle/dom/rxjs-typings'

const { html } = require('snabbdom-jsx');
const classNames = require('classnames');

import {Action, DomComponentSinks, DomComponentSources} from '../helpers/domInterfaces'

export interface Props {
  date: Date;
}

export interface Sources {
  DOM: DOMSource;
  props$: Observable<Props>;
}

export interface Sinks extends DomComponentSinks{
}

function main(sources: Sources): {DOM: Observable<JSX.Element>, actions$: Observable<Action>} {

  const actions$ = sources.DOM.select('.js-year-item')
    .events('click')
    .map(event => ({type: 'yearSelect', event}));

  const vdom$ = sources.props$.map(({date}) => {
    const yearTree = [];
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    for (let i = year - 50; i < year + 100; i++) {
      const dayStr = [i, month, day].join('/');
      if (i === year) {
        yearTree.push(
          <ul
            attrs-data-date={dayStr}
            className='js-year-item cc-date-picker__year-item selected'>
            {i}
          </ul>
        )
      } else {
        yearTree.push(
          <ul
            attrs-data-date={dayStr}
            className='js-year-item cc-date-picker__year-item'>
              {i}
          </ul>
        )
      }
    }
    return (
      <div className='cc-date-picker-year-panel'>
        {yearTree}
      </div>
    )
  });
  return {
    DOM: vdom$,
    actions$
  }
}

export default function isolateDatePicker(sources: Sources, isolate: boolean = true): Sinks {
  return isolate ? isolateFn(main)(sources) : main(sources)
}
