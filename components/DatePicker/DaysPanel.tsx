import { Observable } from 'rxjs'
import isolateFn from '@cycle/isolate'
import { DOMSource } from '@cycle/dom/rxjs-typings'
import { source } from '@cycle/dom'

const { html } = require('snabbdom-jsx');
const classNames = require('classnames');

import {
  simple as simpleAnimate,
  SimpleAnimation as Animation
} from '../helpers/animation'

import {
  DomComponentSinks,
  DomComponentActions,
  DomComponentProps,
  DomComponentSources,
} from '../helpers/domInterfaces'
import { Icon } from '../Icon'
import { Button } from '../Button'
import { getPanelDays, getMonthName, getWeekdayName } from './tools'
import { slideDuration  } from './constants';
import {shareReplay} from "rxjs/operator/shareReplay";

export interface Props {
  date: Date;
}

/* intent */
export interface Action {
  type: string;
  event?: Event;
  value?: any;
}

function intent(
  domSource: DOMSource,
  prevMonthBtnAction$: Observable<Action>,
  nextMonthBtnAction$: Observable<Action>
): Observable<Action>{

  return Observable.merge(
    prevMonthBtnAction$
      .filter(({type}) => type === 'click')
      .map(({event}) => ({type: 'prev', event})),
    nextMonthBtnAction$
      .filter(({type}) => type === 'click')
      .map(({event}) => ({type: 'next', event})),
    domSource
      .select('.day')
      .events('click')
      .map(e => ({type: 'selectDay', event: e})),
  );
}

const animationTypes = {
  panel: 'panel'
};

function animationIntent(DOM: DOMSource, actions: Observable<Action>): Observable<Animation>{

  const prePanel$ = actions.filter(action => action.type === 'prev').map(e => 'right');
  const nextPanel$ = actions.filter(action => action.type === 'next').map(e => 'left');

  const panelAnimation = Observable
    .merge(prePanel$, nextPanel$)
    .throttleTime(slideDuration)
    .flatMap(name => {
      return simpleAnimate(
        `${animationTypes.panel}-${name}`,
        DOM.select('.js-cal-body'),
        `slide-${name}`
      );
    });

  return Observable
    .merge(
      panelAnimation,
    )
    .startWith({type: 'init', status: 'init', className: ''})
    .shareReplay(1);
}

/* model */
export interface Model {
  date: Date;
  title: string;
  slideLeft: boolean;
  slideRight: boolean;
}

function model(
  props$: Observable<Props>,
  actions$: Observable<Action>,
  animation$: Observable<Animation>,
): Observable<Model> {

  return Observable
    .combineLatest(
      props$,
      animation$
    )
    .map(([props, animation]) => {
      let date = props.date;
      if (animation.status === 'start') {
        date = new Date(date.getFullYear(), date.getMonth() - 1);
      }
      console.log(props.date.getMonth())
      let title = getMonthName(props.date.getMonth()) + ' ' + props.date.getFullYear();
      return {
        date: props.date,
        title,
        slideLeft: animation.type === 'panel-left' && animation.status === 'start',
        slideRight: animation.type === 'panel-right' && animation.status === 'start'
      }
    })
    .shareReplay(1);
}

/* view */
interface Sinks {
  DOM: Observable<JSX.Element>;
  actions$: Observable<Action>;
}


function view(
  DOM: DOMSource,
  model$: Observable<Model>,
  animation$: Observable<Animation>,
  prevMonthBtnDOM: Observable<JSX.Element>,
  nextMonthBtnDOM: Observable<JSX.Element>,
) {
  return Observable.combineLatest(
    model$,
    prevMonthBtnDOM,
    nextMonthBtnDOM
  ).map(([model, preBtn, nextBtn]) => {
    const panelClass = classNames({
      'cc-date-picker--slide-out-left': model.slideLeft,
      'cc-date-picker--slide-out-right': model.slideRight,
    }, 'js-cal-body', 'cc-date-picker__cal-body');

    return (
      <div className="cc-date-picker__days-panel">
        <div className="cc-date-picker__cal-head">
          <div className="js-pre-month cc-date-picker__btn">{ preBtn }</div>
          <span>{ model.title }</span>
          <div className="js-next-month cc-date-picker__btn">{ nextBtn }</div>
        </div>
        <div className="cc-date-picker__cal-body-wrap">
          {
            model.slideRight ? (
              <div className="cc-date-picker--slide-in-left cc-date-picker__absolute-panel">
                {getPanelDays(model.date.getFullYear(), model.date.getMonth()- 1).map(day => <li className="cc-date-picker__day-btn">{day.label}</li>)}
              </div>
            ) : ''
          }
          <div className={ panelClass }>
            {
              getPanelDays(model.date.getFullYear(), model.date.getMonth()).map(day => <li className="cc-date-picker__day-btn">{day.label}</li>)
            }
          </div>
          {
            model.slideLeft ? (
              <div className="cc-date-picker--slide-in-right cc-date-picker__absolute-panel">
                {getPanelDays(model.date.getFullYear(), model.date.getMonth() + 1).map(day => <li className="cc-date-picker__day-btn">{day.label}</li>)}
              </div>
            ) : ''
          }
        </div>
      </div>
    )
  });
}

export interface Props extends DomComponentProps  {
  date: Date,
  value: Date,
}

export interface Sources extends DomComponentSources{
  props$: Observable<Props>;
}

function main(sources: Sources): {DOM: Observable<JSX.Element>, actions$: Observable<Action>} {
  const prevMonthBtn = Button({
    DOM: sources.DOM.select('.js-pre-month'),
    props$: Observable.of({
      icon: {
        name: 'navigation.ic_chevron_left',
        fill: '#bababa',
      }
    })
  });

  const nextMonthBtn = Button({
    DOM: sources.DOM.select('.js-next-month'),
    props$: Observable.of({
      icon: {
        name: 'navigation.ic_chevron_right',
        fill: '#bababa',
      }
    })
  });

  const actions$ = intent(sources.DOM, prevMonthBtn.actions$, nextMonthBtn.actions$);
  const animations$ = animationIntent(sources.DOM, actions$);
  const model$ = model(sources.props$, actions$, animations$);

  const vdom$ = view(sources.DOM, model$, animations$, prevMonthBtn.DOM, nextMonthBtn.DOM);

  return {
    DOM: vdom$,
    actions$
  }
}

export default function isolateDatePicker(sources: Sources, isolate: boolean = true): Sinks {
  return isolate ? isolateFn(main)(sources) : main(sources)
}
