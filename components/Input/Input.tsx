import { DOMSource } from '@cycle/dom/rxjs-typings';
import { default as isolateFn } from '@cycle/isolate';
import * as classNamesFn from 'classnames';
import { Observable } from 'rxjs';
const { html } = require('snabbdom-jsx');

import {
  IAction,
  IDomComponentSources,
  IInputDomComponentProps,
  IInputDomComponentSinks,
} from '../helpers/domInterfaces';
import { classNameWithSize } from '../helpers/tools';
import './style.less';

/* sources */
export interface IProps extends IInputDomComponentProps {
  placeholder?: string;
  validate?: (val: string) => void;
}

export interface ISources extends IDomComponentSources {
  props$: Observable<IProps>;
}

/* sinks */
export interface ISinks extends IInputDomComponentSinks {
}

/* main */
function intent(domSource: DOMSource): Observable<IAction> {
  const inputDom = domSource.select('input');
  return Observable.merge(
    inputDom.events('blur').map(event => ({ event, type: 'blur' })),
    inputDom.events('input')
      .map(event => ({
        event,
        type: 'input',
        value: (event.target as HTMLInputElement).value,
      })),
    inputDom.events('focus')
      .map(event => ({ event, type: 'focus' })),
  );
}

function model(props$: Observable<IProps>, actions$: Observable<IAction>): Observable<any> {
  const initVal$ = props$.map(props => props.value).take(1);
  const newVal$ = actions$
    .filter(action => action.type === 'input')
    .map((action) => {
      return action.value;
    });

  const value$ = Observable.merge(initVal$, newVal$).shareReplay();

  return Observable.combineLatest(props$, value$).map(([props, value]) => {
    const classes = classNamesFn(props.classNames, 'cc-input');
    const error = props.validate ? props.validate(value) : '';
    return {
      error,
      value,
      classNames: classes,
      placeholder: props.placeholder,
    };
  }).shareReplay(1);
}

function view(state$: Observable<any>): Observable<JSX.Element> {
  return state$.map(({ value, error, placeholder, classNames }) => {
    return (
      <input
        className={classNames}
        value={value}
        placeholder={placeholder}
      />
    );
  });
}

function main(sources: ISources): ISinks {
  const actions$ = intent(sources.DOM);
  const state$ = model(sources.props$, actions$);
  const vdom$ = view(state$);

  return {
    actions$,
    value: state$.map(state => state.value),
    DOM: vdom$,
  };
}

export default function isolateButton(sources: ISources, isolate: boolean = true): ISinks {
  return isolate ? isolateFn(main)(sources) : main(sources);
}
