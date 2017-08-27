import { Observable } from 'rxjs'
import isolateFn from '@cycle/isolate'
import { DOMSource  } from '@cycle/dom/rxjs-typings'
import { JsxElement } from "typescript"
import {source} from "@cycle/dom";

const { html } = require('snabbdom-jsx');
const classNames = require('classnames');

import {
  InputDomComponentSinks,
  InputDomComponentActions,
  InputDomComponentProps,
  DomComponentSources } from '../helpers/domInterfaces'
import { classNameWithSize } from '../helpers/tools'
import { Icon } from '../Icon'
import { Button } from '../Button'
import { isDate } from '../helpers/tools'
import { getPanelDays } from './tools'
import './style.less'

/* sources */
export interface Props extends InputDomComponentProps {
  value?: Date | string;
  placeholder?: string;
  validate?: Function;
}

export interface Sources extends DomComponentSources {
  props$: Observable<Props>;
}

/* sinks */
export interface Actions extends InputDomComponentActions {
  nexMonth: Observable<Event>;
  preMonth: Observable<Event>;
  yearToggle: Observable<Event>;
  daySelect: Observable<Event>;
}

export interface Sinks extends InputDomComponentSinks {
}

/* model struct */
export interface Model {
  headLabel: string;
  panelDate: Date;
  value: Date;
}

/* main */
function intent(domSource: DOMSource) : Actions {
  return {
    preMonth: domSource
      .select('.pre-month')
      .events('click'),
    nexMonth: domSource
      .select('.next-month')
      .events('click'),
    yearToggle: domSource
      .select('.year')
      .events('click'),
    daySelect: domSource
      .select('.day')
      .events('click')
  }
}

function model(props$: Observable<Props>, actions: Actions) : Observable<Model> {
  const initVal$ = props$.map(props => {
    let val = props.value || new Date();
    let initVal;
    if (isDate(val)) {
      initVal = val as Date;
    } else {
      let [year, month, day] = (val as string)
        .split('/')
        .map(each => parseInt(each));
      initVal = new Date(year, month - 1, day);
    }
    return initVal;
  }).take(1);

  const monthChange$ = Observable
    .merge(
      actions.preMonth.map(e => -1),
      actions.nexMonth.map(e => +1)
    )
    .scan((acc, cur) => acc + cur, 0)
    .debounce(() => Observable.interval(500));

  const newPanelDate$ = Observable
    .combineLatest(initVal$, monthChange$)
    .map(([initDate, change]) => {
      let month = initDate.getMonth() + change;
      return new Date(initDate.getFullYear(), month)
    });
  const panelDate$ = Observable.merge(newPanelDate$, initVal$);

  const newVal$ = actions
    .daySelect
    .withLatestFrom(initVal$, monthChange$)
    .map(([e, initDate, change]) => {
      return new Date(
        initDate.getFullYear(),
        initDate.getMonth() + change,
        parseInt((e.target as HTMLElement).dataset.day)
      )
    });
  const value$ = Observable.merge(initVal$, newVal$);

  return Observable.combineLatest(
    props$,
    panelDate$,
    value$
  ).map(([props, panelDate, value]) => {
    return {
      value,
      headLabel: 'ahaahh',
      panelDate
    }
  })
}

function view(DOM:DOMSource, model$: Observable<Model>): Observable<JSX.Element> {
  const preMonthBtn = Button({
    DOM: DOM.select('.pre-month'),
    props$: Observable.of({
      icon: {
        name: 'navigation.ic_chevron_left'
      }
    })
  });
  const nextMontBtn = Button({
    DOM: DOM.select('.next-month'),
    props$: Observable.of({
      icon: {
        name: 'navigation.ic_chevron_right'
      }
    })
  });

  return Observable
    .combineLatest(
      model$,
      preMonthBtn.DOM,
      nextMontBtn.DOM
    )
    .map(([model, preBtn, nexBtn]) => {
    console.log(model.panelDate)
      return (
        <div>
          <div className="cc-date-picker-head">
            <div className="pre-month">{ preBtn }</div>
            <span>{model.panelDate.toString()}</span>
            <div className="next-month">{ nexBtn }</div>
          </div>
        </div>
      )
    });
}

function main(sources: Sources): Sinks {
  const actions = intent(sources.DOM);
  const model$ = model(sources.props$, actions);
  const vdom$ = view(sources.DOM, model$);

  return {
    DOM: vdom$,
    actions,
    value: model$.map(state => state.value),
  }
}

export default function isolateDatePicker(sources: Sources, isolate: boolean = true): Sinks {
  return isolate ? isolateFn(main)(sources) : main(sources)
}

