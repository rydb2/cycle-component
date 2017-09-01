import { Observable } from 'rxjs'
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
export interface Actions {
  nextMonth: Observable<Event>;
  preMonth: Observable<Event>;
  daySelect: Observable<Event>;
}

export function intent(domSource: DOMSource): Actions {
  return {
    preMonth: domSource
      .select('.js-pre-month')
      .events('click'),
    nextMonth: domSource
      .select('.js-next-month')
      .events('click'),
    daySelect: domSource
      .select('.day')
      .events('click'),
  }
}

interface Animations {
  panel: Observable<{key: string, status: string, className: string}>;
}

function animations(DOM: DOMSource, actions: Actions) {

  const prePanel$ = actions.preMonth.map(e => 'slide-right');
  const nextPanel$ = actions.nextMonth.map(e => 'slide-left');

  const panelAnimation = Observable.merge(prePanel$, nextPanel$)
    .throttle(slideDuration)
    .flatMap(name => {
      return simpleAnimate('panel', DOM.select('.js-cal-body'), name);
    })
    .startWith({key: 'panel', status: '', className: ''});

  return {
    panel: Observable.merge(prePanel$, nextPanel$),
  }
}

/* model */
export interface Model {
  days: { value: string, label: number}[];
  panelAnimationClass: string;
}

function model(props$: Observable<Props>, actions: Actions, animations: Animations): Observable<Model> {
  return Observable
    .combineLatest(props$, animations.panel)
    .map(([props, panelAnimation]) => {
      return {
        days: getPanelDays(props.date.getFullYear(), props.date.getMonth()),
        panelAnimationClass: panelAnimation.className
      }
    })
}

/* view */
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

function confirmBtn(DOM: DOMSource) {
  return Button({
    DOM: DOM.select('.js-confirm'),
    props$: Observable.of({
      label: 'OK',
      type: 'flat',
      primary: true,
      classNames: ['cc-date-picker__confirm'],
    })
  });
}

function cancelBtn(DOM: DOMSource) {
  return Button({
    DOM: DOM.select('.js-cancel'),
    props$: Observable.of({
      label: 'CANCEL',
      type: 'flat',
      primary: true,
      classNames: ['cc-date-picker__cancel'],
    })
  });
}

function view(DOM:DOMSource,
              model$:Observable<Model>,
              animation:Observable<Animation>) {

  return Observable.combineLatest(
    model$
  )
}

function main(sources) {

}

export default function isolateDatePicker(sources: Sources, isolate: boolean = true): Sinks {
  return isolate ? isolateFn(main)(sources) : main(sources)
}
