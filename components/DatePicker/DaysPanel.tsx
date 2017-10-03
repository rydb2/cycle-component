import { source } from '@cycle/dom';
import { DOMSource } from '@cycle/dom/rxjs-typings';
import { default as isolateFn } from '@cycle/isolate';
import * as classNamesFn from 'classnames';
import { Observable } from 'rxjs';
const { html } = require('snabbdom-jsx');

import {
  simple as simpleAnimate,
  ISimpleAnimation as Animation,
} from '../helpers/animation';

import { slideDuration } from './constants';
import { Button } from '../Button';
import {
  IAction,
  IDomComponentProps,
  IDomComponentSources,
} from '../helpers/domInterfaces';
import { getPanelDays, getTitle } from './tools';

export interface IProps extends IDomComponentProps {
  date: Date;
}

export interface ISources extends IDomComponentSources {
  props$: Observable<IProps>;
}

export interface IModel {
  date: Date;
  change: number;
}

interface ISinks {
  DOM: Observable<JSX.Element>;
  actions$: Observable<IAction>;
}

/* intent */
function intent(
  domSource: DOMSource,
  prevMonthBtnAction$: Observable<IAction>,
  nextMonthBtnAction$: Observable<IAction>,
): Observable<IAction> {
  return Observable.merge(
    prevMonthBtnAction$
      .filter(({ type }) => type === 'click')
      .map(({ event }) => ({ event, type: 'prev' })),
    nextMonthBtnAction$
      .filter(({ type }) => type === 'click')
      .map(({ event }) => ({ event, type: 'next' })),
    domSource
      .select('.js-day')
      .events('click')
      .map(event => ({ event, type: 'daySelect' })),
  );
}

const animationTypes = {
  panel: 'panel',
};

function animationIntent(DOM: DOMSource, actions: Observable<IAction>): Observable<Animation> {

  const prePanel$ = actions.filter(action => action.type === 'prev').map(e => 'right');
  const nextPanel$ = actions.filter(action => action.type === 'next').map(e => 'left');

  const panelAnimation = Observable
    .merge(prePanel$, nextPanel$)
    .throttleTime(slideDuration)
    .flatMap((name) => {
      return simpleAnimate(
        `${animationTypes.panel}-${name}`,
        DOM.select('.js-cal-body'),
        `slide-${name}`,
      );
    });

  return Observable
    .merge(
      panelAnimation,
    )
    .startWith({ type: 'init', status: 'init', className: '' })
    .shareReplay(1);
}

/* model */
function model(
  props$: Observable<IProps>,
  actions$: Observable<IAction>,
): Observable<IModel> {
  const monthChange$ = Observable
    .merge(
      actions$.filter(action => action.type === 'prev').map(e => -1),
      actions$.filter(action => action.type === 'next').map(e => +1),
      props$.distinctUntilChanged((x, y) => x.date === y.date).map(() => 0),
    )
    .scan(
      (acc, i) => {
        return i === 0 ? 0 : acc + i;
      },
      0,
    )
    .startWith(0)
    .shareReplay(1);

  return Observable
    .combineLatest(
      props$,
      monthChange$,
    )
    .map(([props, change]) => {
      return {
        change,
        date: props.date,
      };
    })
    .shareReplay(1);
}

/* view */
function view(
  DOM: DOMSource,
  model$: Observable<IModel>,
  animation$: Observable<Animation>,
  prevMonthBtnDOM: Observable<JSX.Element>,
  nextMonthBtnDOM: Observable<JSX.Element>,
) {

  const daysList = (year: number, month: number, opts = {}) => {
    return getPanelDays(year, month, opts)
      .map((day) => {
        if (day.cur) {
          return (
            <li
              attrs-data-date={day.value}
              className="js-day cc-date-picker__day-btn selected"
            >
              {day.label}
            </li>
          );
        } else if (day.label === '') {
          return <li className="cc-date-picker__day-btn--hidden"/>;
        } else {
          return (
            <li
              attrs-data-date={day.value}
              className="js-day cc-date-picker__day-btn"
            >
            {day.label}
            </li>
          );
        }
      });
  };

  return Observable.combineLatest(
    model$,
    prevMonthBtnDOM,
    nextMonthBtnDOM,
    animation$,
  ).map(([state, preBtn, nextBtn, animation]) => {

    const slideLeft = animation.type === 'panel-left' && animation.status === 'start';
    const slideRight =  animation.type === 'panel-right' && animation.status === 'start';

    const animationClass = classNamesFn({
      'cc-date-picker--slide-out-left': slideLeft,
      'cc-date-picker--slide-out-right': slideRight,
    });
    const panelClass = classNamesFn('js-cal-body', 'cc-date-picker__cal-body', animationClass);
    const titleClass = classNamesFn('cc-date-picker__cal-title', animationClass);

    const curYear = state.date.getFullYear();
    let curMonth = state.date.getMonth() + state.change;

    if (animation.status === 'start') {
      curMonth -= 1;
    }

    const leftTitle = slideRight ? (
        <span className="cc-date-picker__cal-title-absolute cc-date-picker--slide-in-left">
          {getTitle(new Date(curYear, curMonth - 1))}
        </span>
      ) : '';
    const rightTitle = slideLeft ? (
        <span className="cc-date-picker__cal-title-absolute cc-date-picker--slide-in-right">
          {getTitle(new Date(curYear, curMonth + 1))}
        </span>
      ) : '';

    const leftPanel = slideRight ? (
      <div className="cc-date-picker--slide-in-left cc-date-picker__absolute-panel">
        {daysList(curYear, curMonth - 1, { current: state.date })}
      </div>
    ) : '';
    const rightPanel = slideLeft ? (
      <div className="cc-date-picker--slide-in-right cc-date-picker__absolute-panel">
        {daysList(curYear, curMonth + 1, { current: state.date })}
      </div>
    ) : '';

    return (
      <div className="cc-date-picker__days-panel">
        <div className="cc-date-picker__cal-head">
          <div className="js-pre-month cc-date-picker__btn">{preBtn}</div>
          <div className="cc-date-picker__cal-title-wrap">
            {leftTitle}
            <span className={titleClass}>{getTitle(new Date(curYear, curMonth))}</span>
            {rightTitle}
          </div>
          <div className="js-next-month cc-date-picker__btn">{nextBtn}</div>
        </div>
        <div className="cc-date-picker__cal-body-wrap">
          {leftPanel}
          <div className={panelClass}>
            {daysList(curYear, curMonth, { current: state.date })}
          </div>
          {rightPanel}
        </div>
      </div>
    );
  });
}

function main(sources: ISources): { DOM: Observable<JSX.Element>, actions$: Observable<IAction> } {
  const prevMonthBtn = Button({
    DOM: sources.DOM.select('.js-pre-month'),
    props$: Observable.of({
      icon: {
        fill: '#bababa',
        name: 'navigation.ic_chevron_left',
      },
    }),
  });

  const nextMonthBtn = Button({
    DOM: sources.DOM.select('.js-next-month'),
    props$: Observable.of({
      icon: {
        fill: '#bababa',
        name: 'navigation.ic_chevron_right',
      },
    }),
  });

  const actions$ = intent(sources.DOM, prevMonthBtn.actions$, nextMonthBtn.actions$);
  const animations$ = animationIntent(sources.DOM, actions$);
  const model$ = model(sources.props$, actions$);

  const vdom$ = view(sources.DOM, model$, animations$, prevMonthBtn.DOM, nextMonthBtn.DOM);

  return {
    actions$,
    DOM: vdom$,
  };
}

export default function isolateDatePicker(sources: ISources, isolate: boolean = true): ISinks {
  return isolate ? isolateFn(main)(sources) : main(sources);
}
