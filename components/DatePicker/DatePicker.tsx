import { Observable, Subject } from 'rxjs'
import isolateFn from '@cycle/isolate'
import { DOMSource  } from '@cycle/dom/rxjs-typings'
import {source} from "@cycle/dom";

const { html } = require('snabbdom-jsx');
const classNames = require('classnames');

import {
  InputDomComponentSinks,
  InputDomComponentActions,
  InputDomComponentProps,
  DomComponentSources,
} from '../helpers/domInterfaces'
import { Icon } from '../Icon'
import { Button } from '../Button'
import { isDate, animationEnd } from '../helpers/tools'
import { getPanelDays, getMonthName, getWeekdayName } from './tools'
import {
  intent as DaysPanelIntent,
  default as DaysPanel,
} from './DaysPanel'
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
export interface Action {
  type: string;
  event?: Event;
  value?: any;
}

export interface Sinks extends InputDomComponentSinks {
}

/* model struct */
export interface Model {
  panelDate: Date;
  value: Date;
}

/* main */
function intent(domSource: DOMSource): Observable<Action> {
  return Observable.merge(
    domSource.select('.js-year')
      .events('click')
      .map(e => ({type: 'yearClick', event: e}))
  );
}

function model(props$: Observable<Props>, actions$: Observable<Action>) : Observable<Model> {
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
      actions$.filter(action => action.type === 'prev').map(e => -1),
      actions$.filter(action => action.type === 'next').map(e => +1)
    )
    .startWith(0)
    .shareReplay(1);

  const newPanelDate$ = Observable
    .combineLatest(initVal$, monthChange$.scan((acc, cur) => acc + cur, 0))
    .map(([initDate, change]) => {
      let month = initDate.getMonth() + change;
      return new Date(initDate.getFullYear(), month)
    });
  const panelDate$ = Observable
    .merge(newPanelDate$, initVal$)
    .shareReplay(1);

  const newVal$ = actions$
    .filter(e => e.type === 'dayClick')
    .withLatestFrom(initVal$, monthChange$)
    .map(([e, initDate, change]) => {
      return new Date(
        initDate.getFullYear(),
        initDate.getMonth() + change,
        parseInt((e.target as HTMLElement).dataset.day)
      )
    });
  const value$ = Observable.merge(initVal$, newVal$).shareReplay(1);

  return Observable.combineLatest(
    props$,
    panelDate$,
    value$,
    monthChange$,
  ).map(([props, panelDate, value]) => {
    return {
      value,
      panelDate
    }
  })
}

function view(
  DOM:DOMSource,
  model$: Observable<Model>,
  daysPanelDOM
): Observable<JSX.Element> {
  const confirmBtn = Button({
    DOM: DOM.select('.js-confirm'),
    props$: Observable.of({
      label: 'OK',
      type: 'flat',
      primary: true,
      classNames: ['cc-date-picker__confirm'],
    })
  });
  const cancelBtn = Button({
    DOM: DOM.select('.js-cancel'),
    props$: Observable.of({
      label: 'CANCEL',
      type: 'flat',
      primary: true,
      classNames: ['cc-date-picker__cancel'],
    })
  });

  return Observable
    .combineLatest(
      model$,
      cancelBtn.DOM,
      confirmBtn.DOM,
      daysPanelDOM
    )
    .map(([model, cancelBtn, confirmBtn, daysPanelTree]) => {
      const panelDate = model.panelDate;
      let days = getPanelDays(panelDate.getFullYear(), panelDate.getMonth());

      let curDateStr = getWeekdayName(model.value.getDay()).substring(0, 3) + ', ' +
        getMonthName(model.value.getMonth()).substring(0, 3) + ', ' +
        model.value.getFullYear();

      return (
        <div className="cc-date-picker">
          <div className="cc-date-picker__title">
            <span className="js-year cc-date-picker__year">
              {model.value.getFullYear()}
            </span>
            <span className="cc-date-picker__selected-time">
              {curDateStr}
            </span>
          </div>
          <div className="js-content cc-date-picker__content">
            { daysPanelTree }
          </div>
          <div className="cc-date-picker__footer">
            { cancelBtn }
            { confirmBtn }
          </div>
        </div>
      )
    });
}

function main(sources: Sources): Sinks {

  const proxyCache$ = new Subject();
  const actions$ = intent(sources.DOM);

  const model$ = model(sources.props$, proxyCache$);

  const daysPanel = DaysPanel({
    DOM: sources.DOM,
    props$: model$.map(model => ({date: model.panelDate, value: model.value}))
  });

  daysPanel
    .actions$
    .merge(actions$)
    .shareReplay(1)
    .subscribe(proxyCache$);

  const vdom$ = view(sources.DOM, model$, daysPanel.DOM);

  return {
    DOM: vdom$,
    actions$,
    value: model$.map(state => state.value),
  }
}

export default function isolateDatePicker(sources: Sources, isolate: boolean = true): Sinks {
  return isolate ? isolateFn(main)(sources) : main(sources)
}

