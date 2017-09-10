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
      .select('.js-day')
      .events('click')
      .map(e => ({type: 'daySelect', event: e})),
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
  change: number;
}

function model(
  props$: Observable<Props>,
  actions$: Observable<Action>,
): Observable<Model> {
  const monthChange$ = Observable
    .merge(
      actions$.filter(action => action.type === 'prev').map(e => -1),
      actions$.filter(action => action.type === 'next').map(e => +1),
      props$.distinctUntilChanged((x, y) => x.date === y.date).map(() => 0)
    )
    .scan((acc, i) => {
      return i === 0 ? 0 : acc + i;
    }, 0)
    .startWith(0)
    .shareReplay(1);

  return Observable
    .combineLatest(
      props$,
      monthChange$,
    )
    .map(([props, change]) => {
      return {
        date: props.date,
        change: change
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

  const daysList = (year:number, month:number, opts = {}) => {
    return getPanelDays(year, month, opts)
      .map(day => {
        if (day.cur) {
          return (
            <li attrs-data-date={day.value} className="js-day cc-date-picker__day-btn selected">{day.label}</li>
          )
        } else if (day.label === '') {
          return <li className="cc-date-picker__day-btn--hidden"></li>;
        } else {
          return <li attrs-data-date={day.value} className="js-day cc-date-picker__day-btn">{day.label}</li>
        }
      })
  };

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

    const curYear = model.date.getFullYear();
    let curMonth = model.date.getMonth() + model.change;

    if (animation.status === 'start') {
      curMonth--;
    }

    return (
      <div className="cc-date-picker__days-panel">
        <div className="cc-date-picker__cal-head">
          <div className="js-pre-month cc-date-picker__btn">{ preBtn }</div>
          <div className="cc-date-picker__cal-title-wrap">
            {
              slideRight ? (
                <span className="cc-date-picker__cal-title-absolute cc-date-picker--slide-in-left">
                  {getTitle(new Date(curYear, curMonth - 1))}
                </span>
              ) : ''
            }
            <span className={titleClass}>{ getTitle(new Date(curYear, curMonth)) }</span>
            {
              slideLeft ? (
                <span className="cc-date-picker__cal-title-absolute cc-date-picker--slide-in-right">
                  {getTitle(new Date(curYear, curMonth + 1))}
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
                {
                  daysList(
                    curYear,
                    curMonth - 1,
                    {
                      current: model.date
                    }
                  )
                }
              </div>
            ) : ''
          }
          <div className={ panelClass }>
            {
              daysList(
                curYear,
                curMonth,
                {
                  current: model.date
                }
              )
            }
          </div>
          {
            slideLeft ? (
              <div className="cc-date-picker--slide-in-right cc-date-picker__absolute-panel">
                {
                  daysList(
                    curYear,
                    curMonth + 1,
                    {
                      current: model.date
                    }
                  )
                }
              </div>
            ) : ''
          }
        </div>
      </div>
    )
  });
}

export interface Props extends DomComponentProps {
  date: Date;
}

export interface Sources extends DomComponentSources {
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
    actions$
  }
}

export default function isolateDatePicker(sources: Sources, isolate: boolean = true): Sinks {
  return isolate ? isolateFn(main)(sources) : main(sources)
}
