import { Observable } from 'rxjs'
import isolateFn from '@cycle/isolate'
import { DOMSource } from '@cycle/dom/rxjs-typings'
import { source } from '@cycle/dom'

const { html } = require('snabbdom-jsx');
const classNames = require('classnames');

import { simple as simpleAnimate } from '../helpers/animation'
import {
  InputDomComponentSinks,
  InputDomComponentActions,
  InputDomComponentProps,
  DomComponentSources,
} from '../helpers/domInterfaces'
import { Icon } from '../Icon'
import { Button } from '../Button'
import { getPanelDays, getMonthName, getWeekdayName } from './tools'
import { slideDuration  } from './constants';

export interface Props {
  date: Date;
}

/* intent */
export interface Action {
  type: string;
  event?: Event;
  value?: any;
}

function intent(domSource: DOMSource): Observable<Action>{
  return Observable.merge(
    domSource
      .select('.js-pre-month')
      .events('click')
      .map(e => ({type: 'prev', event: e})),
    domSource
      .select('.js-next-month')
      .events('click')
      .map(e => ({ type: 'next', event: e })),
    domSource
      .select('.day')
      .events('click')
      .map(e => ({type: 'selectDay', event: e})),
  )
}

interface Animations {
  panel: Observable<{key: string, status: string, className: string}>;
}

function animationIntent(DOM: DOMSource, actions: Observable<Action>): Animations {

  const prePanel$ = actions.filter(action => action.type === 'prev').map(e => 'right');
  const nextPanel$ = actions.filter(action => action.type === 'next').map(e => 'left');

  const panelAnimation = Observable.merge(prePanel$, nextPanel$)
    .throttleTime(slideDuration)
    .flatMap(name => {
      return simpleAnimate(name, DOM.select('.js-cal-body'), name);
    })
    .startWith({key: null, status: '', className: ''})
    .shareReplay(1);

  return {
    panel: panelAnimation,
  }
}

/* model */
export interface Model {
  days: { value: string, label: number}[];
  title: string;
  panelAnimation: {name: string, classNames: string};
}

function model(
  props$: Observable<Props>,
  actions$: Observable<Action>,
  animations: Animations
): Observable<Model> {
  return Observable
    .combineLatest(props$, animations.panel)
    .map(([props, panelAnimation]) => {
      let title = getMonthName(props.date.getMonth()) + ' ' + props.date.getFullYear();
      return {
        days: getPanelDays(props.date.getFullYear(), props.date.getMonth()),
        title,
        panelAnimation: {
          name: panelAnimation.key,
          classNames: panelAnimation.className
        }
      }
    })
}

/* view */
interface Sinks {
  DOM: DOMSource;
  actions$: Observable<Action>;
}

function preMonthBtn(DOM: DOMSource) {
  return Button({
    DOM: DOM.select('.js-pre-month'),
    props$: Observable.of({
      icon: {
        name: 'navigation.ic_chevron_left',
        fill: '#bababa',
      }
    })
  });
}

function nextMontBtn(DOM: DOMSource) {
  return Button({
    DOM: DOM.select('.js-next-month'),
    props$: Observable.of({
      icon: {
        name: 'navigation.ic_chevron_right',
        fill: '#bababa',
      }
    })
  });
}

function view(DOM:DOMSource,
              model$:Observable<Model>) {

  return Observable.combineLatest(
    model$,
    preMonthBtn(DOM.select('.js-pre-month')).DOM,
    nextMontBtn(DOM.select('.js-next-month')).DOM,
  ).map(([model, preBtn, nextBtn]) => {
    return (
      <div>
        <div className="cc-date-picker__cal-head">
          <div className="js-pre-month cc-date-picker__btn">{ preBtn }</div>
          <span>{ model.title }</span>
          <div className="js-next-month cc-date-picker__btn">{ nextBtn }</div>
        </div>
        <div className="js-cal-body cc-date-picker__cal-body">
          {
            model.days.map(day => <li className="cc-date-picker__day-btn">{day.label}</li>)
          }
        </div>
      </div>
    )
  })
}

function main(sources): {DOM: DOMSource, actions$: Observable<Action>} {
  const actions$ = intent(sources.DOM);
  const animations$ = animationIntent(sources.DOM, actions$);
  const model$ = model(sources.props$, actions$, animations$);
  const vdom$ = view(sources.DOM, model$);

  return {
    DOM: vdom$,
    actions$
  }
}

export default function isolateDatePicker(sources: Sources, isolate: boolean = true): Sinks {
  return isolate ? isolateFn(main)(sources) : main(sources)
}
