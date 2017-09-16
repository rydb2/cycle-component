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
import { isDate } from '../helpers/tools'
import { getPanelDays, getMonthName, getWeekdayName } from './tools'
import DaysPanel from './DaysPanel'
import './style.less'

/* sources */
export interface Props extends InputDomComponentProps {
  value?: string;
  placeholder?: string;
  validate?: Function;
  classNmaes?: string[];
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


/* main */
function intent(
  domSource: DOMSource,
  confirmAction$: Observable<Action>,
  cancelAction$: Observable<Action>
): Observable<Action> {
  return Observable.merge(
    domSource.select('.js-year')
      .events('click')
      .map(e => ({type: 'yearClick', event: e})),
    domSource.select('.js-input')
      .events('click')
      .map(e => ({type: 'inputClick', event: e})),
    domSource.select('.js-backdrop')
      .events('click')
      .map(e => ({type: 'backdropClick', event: e})),
    confirmAction$
      .filter(action => action.type === 'click')
      .map(({event}) => {
        return {
          type: 'confirm',
          event
        };
      }),
    cancelAction$
      .filter(action => action.type === 'click')
      .map(({event}) => {
        return {
          type: 'cancel',
          event
        }
      })
  );
}

/* model struct */
export interface Model {
  selectedValue: Date;
  value: string;
  modalVisible: boolean;
  classNames: string[];
  placeholder: string;
}

function model(props$: Observable<Props>, actions$: Observable<Action>) : Observable<Model> {
  const initVal$ = props$.map(props => {
    let val = props.value;
    if (val) {
      let [year, month, day] = val.split('/').map(each => parseInt(each));
      return new Date(year, month - 1, day);
    } else {
      return new Date();
    }
  }).take(1);

  const newSelectedVal$ = actions$
    .filter(action => action.type === 'daySelect')
    .map(action => {
      const newDate = (action.event.target as HTMLElement)
        .dataset
        .date
        .split('/')
        .map(each => parseInt(each));
      return new Date(newDate[0], newDate[1], newDate[2]);
    });
  const selectedValue$ = Observable.merge(initVal$, newSelectedVal$).shareReplay(1);

  const modalVisible$ = actions$
    .filter(action => ['inputClick', 'confirm', 'cancel', 'backdropClick'].indexOf(action.type) >= 0)
    .scan((visible, event) => {
      return !visible;
    }, false)
    .startWith(false);

  const newValue$ = Observable.combineLatest(
    actions$.filter(action => action.type === 'confirm'),
    actions$.filter(action => action.type === 'daySelect'),
  ).map(([confirmAction, daySelectAction]) => {
    return (daySelectAction.event.target as HTMLElement).dataset.date;
  });

  const value$ = props$.map(props => {
    return props.value || '';
  }).merge(newValue$);

  return Observable.combineLatest(
    props$,
    value$,
    selectedValue$,
    modalVisible$,
  ).map(([props, value, selectedValue, modalVisible]) => {
    return {
      value,
      selectedValue,
      modalVisible,
      placeholder: props.placeholder,
      classNames: props.classNames
    }
  }).shareReplay(1);
}

function view(
  DOM: DOMSource,
  model$: Observable<Model>,
  daysPanelDOM: Observable<JSX.Element>,
  confirmBtnDOM: Observable<JSX.Element>,
  cancelBtnDOM: Observable<JSX.Element>,
): Observable<JSX.Element> {
  return Observable
    .combineLatest(
      model$,
      cancelBtnDOM,
      confirmBtnDOM,
      daysPanelDOM,
    )
    .map(([model, cancelBtn, confirmBtn, daysPanelTree]) => {
      const curDateStr = getWeekdayName(model.selectedValue.getDay()).substring(0, 3) + ', ' +
        getMonthName(model.selectedValue.getMonth()).substring(0, 3) + ', ' +
        model.selectedValue.getFullYear();

      const classes = classNames('cc-date-picker', model.classNames);
      const modalWrapClass = 'cc-date-picker__modal-wrap--' + (model.modalVisible ? 'visible' : 'hidden');
      const modalClass = 'cc-date-picker__modal--' + (model.modalVisible ? 'visible' : 'hidden');
      const backdropClass = classNames('backdrop--' + (model.modalVisible ? 'visible' : 'hidden'), 'js-backdrop');
      const inputClass = classNames({
        'cc-date-picker__value': !!model.value,
        'cc-date-picker__placeholder': !!!model.value
      });


      return (
        <div className={classes}>
          <div className='js-input cc-date-picker__input'>
            <span className={inputClass}>{model.value || model.placeholder || ''}</span>
          </div>
          <div className={modalWrapClass}>
            <div className={backdropClass} />
            <div className={modalClass}>
              <div className='cc-date-picker__title'>
                <span className='js-year cc-date-picker__year'>
                  {model.selectedValue.getFullYear()}
                </span>
                <span className='cc-date-picker__selected-time'>
                  {curDateStr}
                </span>
              </div>
              <div className='js-content cc-date-picker__content'>
                { daysPanelTree }
              </div>
              <div className="cc-date-picker__footer">
                <div className='js-cancel'>{ cancelBtn }</div>
                <div className='js-confirm'>{ confirmBtn }</div>
              </div>
            </div>
          </div>
        </div>
      )
    });
}

function main(sources: Sources): Sinks {
  const confirmBtn = Button({
    DOM: sources.DOM.select('.js-confirm'),
    props$: Observable.of({
      label: 'OK',
      type: 'flat',
      primary: true,
      classNames: ['cc-date-picker__confirm'],
    })
  });
  const cancelBtn = Button({
    DOM: sources.DOM.select('.js-cancel'),
    props$: Observable.of({
      label: 'CANCEL',
      type: 'flat',
      primary: true,
      classNames: ['cc-date-picker__cancel'],
    })
  });

  const actions$ = intent(sources.DOM, confirmBtn.actions$, cancelBtn.actions$);
  const proxyCache$ = new Subject<Action>();

  const model$ = model(sources.props$, proxyCache$);

  const daysPanel = DaysPanel({
    DOM: sources.DOM,
    props$: model$.map(model => ({date: model.selectedValue}))
  });

  Observable
    .merge(actions$, daysPanel.actions$)
    .subscribe(proxyCache$);

  const vdom$ = view(
    sources.DOM,
    model$,
    daysPanel.DOM,
    confirmBtn.DOM,
    cancelBtn.DOM
  );

  return {
    DOM: vdom$,
    actions$,
    value: model$.map(state => state.value),
  }
}

export default function isolateDatePicker(sources: Sources, isolate: boolean = true): Sinks {
  return isolate ? isolateFn(main)(sources) : main(sources)
}

