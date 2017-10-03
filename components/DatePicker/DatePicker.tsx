import { DOMSource } from '@cycle/dom/rxjs-typings';
import { default as isolateFn } from '@cycle/isolate';
import * as classNamesFn from 'classnames';
import { Observable, Subject } from 'rxjs';
const { html } = require('snabbdom-jsx');

import { Button } from '../Button';
import {
  IAction,
  IDomComponentSources,
  IInputDomComponentActions,
  IInputDomComponentProps,
  IInputDomComponentSinks,
} from '../helpers/domInterfaces';

import DaysPanel from './DaysPanel';
import './style.less';
import { getMonthName, getWeekdayName } from './tools';
import YearsPanel from './YearsPanel';

/* sources */
export interface IProps extends IInputDomComponentProps {
  value?: string;
  classNames?: string[];
  placeholder?: string;
}

export interface ISources extends IDomComponentSources {
  props$: Observable<IProps>;
}

export interface ISinks extends IInputDomComponentSinks {
}

/* main */
function intent(
  domSource: DOMSource,
  confirmAction$: Observable<IAction>,
  cancelAction$: Observable<IAction>,
): Observable<IAction> {
  return Observable.merge(
    domSource.select('.js-year')
      .events('click')
      .map(event => ({ event, type: 'yearClick' })),
    domSource.select('.js-input')
      .events('click')
      .map(event => ({ event, type: 'inputClick' })),
    domSource.select('.js-backdrop')
      .events('click')
      .map(event => ({ event, type: 'backdropClick' })),
    confirmAction$
      .filter(action => action.type === 'click')
      .map(({ event }) => {
        return {
          event,
          type: 'confirm',
        };
      }),
    cancelAction$
      .filter(action => action.type === 'click')
      .map(({ event }) => {
        return {
          event,
          type: 'cancel',
        };
      }),
  );
}

/* model struct */
export interface IModel {
  selectedValue: Date;
  value: string;
  modalVisible: boolean;
  classNames: string[];
  placeholder: string;
  yearsPanelVisible: boolean;
}

function model(props$: Observable<IProps>, actions$: Observable<IAction>): Observable<IModel> {
  const initVal$ = props$.map((props) => {
    const val = props.value;
    if (val) {
      const [year, month, day] = val.split('/').map(each => parseInt(each, 10));
      return new Date(year, month - 1, day);
    } else {
      return new Date();
    }
  }).take(1);

  const newSelectedVal$ = actions$
    .filter(action => ['daySelect', 'yearSelect'].indexOf(action.type) >= 0)
    .map((action) => {
      const newDate = (action.event.target as HTMLElement)
        .dataset
        .date
        .split('/')
        .map(each => parseInt(each, 10));
      return new Date(newDate[0], newDate[1], newDate[2]);
    });
  const selectedValue$ = Observable.merge(initVal$, newSelectedVal$).shareReplay(1);

  const toggleVisibleActions = ['inputClick', 'confirm', 'cancel', 'backdropClick'];
  const modalVisible$ = actions$
    .filter(action => toggleVisibleActions.indexOf(action.type) >= 0)
    .scan(
      (visible, event) => {
        return !visible;
      },
      false,
    )
    .startWith(false);

  const yearsPanelVisible$ = actions$
    .filter(action => ['yearClick', 'yearSelect'].indexOf(action.type) >= 0)
    .scan(
      (visible, event) => {
        return !visible;
      },
      false,
    )
    .startWith(false);

  const newValue$ = Observable.combineLatest(
    actions$.filter(action => action.type === 'confirm'),
    actions$.filter(action => action.type === 'daySelect'),
  ).map(([confirmAction, daySelectAction]) => {
    return (daySelectAction.event.target as HTMLElement).dataset.date;
  });

  const value$ = props$.map((props) => {
    return props.value || '';
  }).merge(newValue$);

  return Observable.combineLatest(
    props$,
    value$,
    selectedValue$,
    modalVisible$,
    yearsPanelVisible$,
  ).map(([props, value, selectedValue, modalVisible, yearsPanelVisible]) => {
    return {
      modalVisible,
      selectedValue,
      value,
      yearsPanelVisible,
      classNames: props.classNames,
      placeholder: props.placeholder,
    };
  }).shareReplay(1);
}

function view(
  DOM: DOMSource,
  state$: Observable<IModel>,
  daysPanelDOM: Observable<JSX.Element>,
  confirmBtnDOM: Observable<JSX.Element>,
  cancelBtnDOM: Observable<JSX.Element>,
  yearsPanelDOM: Observable<JSX.Element>,
): Observable<JSX.Element> {
  return Observable
    .combineLatest(
      state$,
      cancelBtnDOM,
      confirmBtnDOM,
      daysPanelDOM,
      yearsPanelDOM,
    )
    .map(([state, cancelBtn, confirmBtn, daysPanelTree, yearsPanelTree]) => {
      const curDateStr = getWeekdayName(state.selectedValue.getDay()).substring(0, 3) + ', ' +
        getMonthName(state.selectedValue.getMonth()).substring(0, 3) + ', ' +
        state.selectedValue.getFullYear();

      const classes = classNamesFn('cc-date-picker', state.classNames);
      const modalWrapClass = 'cc-date-picker__modal-wrap--' +
        (state.modalVisible ? 'visible' : 'hidden');
      const modalClass = 'cc-date-picker__modal--' +
        (state.modalVisible ? 'visible' : 'hidden');
      const backdropClass = classNamesFn(
        'backdrop--' + (state.modalVisible ? 'visible' : 'hidden'),
        'js-backdrop',
      );
      const inputClass = classNamesFn({
        'cc-date-picker__placeholder': !Boolean(state.value),
        'cc-date-picker__value': Boolean(state.value),
      });

      const panelBody = state.yearsPanelVisible
        ? (
          <div className="js-content cc-date-picker__content">
            {yearsPanelTree}
          </div>
        )
        : (
          <div className="js-content cc-date-picker__content">
            {daysPanelTree}
          </div>
        );
      return (
        <div className={classes}>
          <div className="js-input cc-date-picker__input">
            <span className={inputClass}>{state.value || state.placeholder || ''}</span>
          </div>
          <div className={modalWrapClass}>
            <div className={backdropClass} />
            <div className={modalClass}>
              <div className="cc-date-picker__title">
                <span className="js-year cc-date-picker__year">
                  {state.selectedValue.getFullYear()}
                </span>
                <span className="cc-date-picker__selected-time">
                  {curDateStr}
                </span>
              </div>
              {panelBody}
              <div className="cc-date-picker__footer">
                <div className="js-cancel">{cancelBtn}</div>
                <div className="js-confirm">{confirmBtn}</div>
              </div>
            </div>
          </div>
        </div>
      );
    });
}

function main(sources: ISources): ISinks {
  const confirmBtn = Button({
    DOM: sources.DOM.select('.js-confirm'),
    props$: Observable.of({
      classNames: ['cc-date-picker__confirm'],
      label: 'OK',
      primary: true,
      type: 'flat',
    }),
  });
  const cancelBtn = Button({
    DOM: sources.DOM.select('.js-cancel'),
    props$: Observable.of({
      classNames: ['cc-date-picker__cancel'],
      label: 'CANCEL',
      primary: true,
      type: 'flat',
    }),
  });

  const actions$ = intent(sources.DOM, confirmBtn.actions$, cancelBtn.actions$);
  const proxyCache$ = new Subject<IAction>();

  const model$ = model(sources.props$, proxyCache$);

  const daysPanel = DaysPanel({
    DOM: sources.DOM.select('.js-content'),
    props$: model$.map(state => ({ date: state.selectedValue })),
  });

  const yearsPanel = YearsPanel({
    DOM: sources.DOM.select('.js-content'),
    props$: model$.map(state => ({ date: state.selectedValue })),
  });

  Observable
    .merge(actions$, daysPanel.actions$, yearsPanel.actions$)
    .subscribe(proxyCache$);

  const vdom$ = view(
    sources.DOM,
    model$,
    daysPanel.DOM,
    confirmBtn.DOM,
    cancelBtn.DOM,
    yearsPanel.DOM,
  );

  return {
    actions$,
    value: model$.map(state => state.value),
    DOM: vdom$,
  };
}

export default function isolateDatePicker(sources: ISources, isolate: boolean = true): ISinks {
  return isolate ? isolateFn(main)(sources) : main(sources);
}
