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
import { getPanelDays, getMonthName, getWeekdayName, getTitle } from './tools'
import { slideDuration } from './constants';
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
}

function model(
  props$: Observable<Props>,
  actions$: Observable<Action>,
): Observable<Model> {

  return Observable
    .combineLatest(
      props$,
    )
    .map(([props]) => {
      let date = props.date;
      return {
        date: props.date,
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
    nextMonthBtnDOM,
    animation$,
  ).map(([model, preBtn, nextBtn, animation]) => {

    const slideLeft = animation.type === 'panel-left' && animation.status === 'start';
    const slideRight =  animation.type === 'panel-right' && animation.status === 'start';

    const animationClass = classNames({
      'cc-date-picker--slide-out-left': slideLeft,
      'cc-date-picker--slide-out-right': slideRight,
    });
    const panelClass = classNames('js-cal-body', 'cc-date-picker__cal-body', animationClass);
    const titleClass = classNames('cc-date-picker__cal-title', animationClass);

    return (
      <div className="cc-date-picker__days-panel">
        <div className="cc-date-picker__cal-head">
          <div className="js-pre-month cc-date-picker__btn">{ preBtn }</div>
          <div className="cc-date-picker__cal-title-wrap">
            {
              slideRight ? (
                <span className="cc-date-picker__cal-title-absolute cc-date-picker--slide-in-left">
                  {getTitle(new Date(model.date.getFullYear(), model.date.getMonth() - 1))}
                </span>
              ) : ''
            }
            <span className={titleClass}>{ getTitle(model.date) }</span>
            {
              slideLeft ? (
                <span className="cc-date-picker__cal-title-absolute cc-date-picker--slide-in-right">
                  {getTitle(new Date(model.date.getFullYear(), model.date.getMonth() + 1))}
                </span>
              ) : ''
            }
          </div>
          <div className="js-next-month cc-date-picker__btn">{ nextBtn }</div>
        </div>
        <div className="cc-date-picker__cal-body-wrap">
          {
            slideRight ? (
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
            slideLeft ? (
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
  const model$ = model(sources.props$, actions$);

  const vdom$ = view(sources.DOM, model$, animations$, prevMonthBtn.DOM, nextMonthBtn.DOM);

  return {
    DOM: vdom$,
    //it's bad. for animation duration
    //TODO: animation auto delay? or a better animation stream encapsulation
    actions$: actions$.delay(200)
  }
}

export default function isolateDatePicker(sources: Sources, isolate: boolean = true): Sinks {
  return isolate ? isolateFn(main)(sources) : main(sources)
}
