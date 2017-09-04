import { Observable } from 'rxjs'
import isolateFn from '@cycle/isolate'
import { DOMSource  } from '@cycle/dom/rxjs-typings'

const { html } = require('snabbdom-jsx');
const classNames = require('classnames');

import {
  InputDomComponentSinks,
  Action,
  InputDomComponentProps,
  DomComponentSources } from '../helpers/domInterfaces'
import { classNameWithSize } from '../helpers/tools'
import './style.less'
import {JsxElement} from "typescript";

declare module 'react' {
  interface HTMLAttributes<T> {
    innerHTML?:string;
  }

}

/* sources */
export interface Props extends InputDomComponentProps {
    placeholder?: string;
    validate?: Function;
}

export interface Sources extends DomComponentSources {
  props$: Observable<Props>;
}

/* sinks */
export interface Sinks extends InputDomComponentSinks {
}

/* main */
function intent(domSource: DOMSource): Observable<Action> {
  const inputDom = domSource.select('input');
  return Observable.merge(
    inputDom.events('blur').map(event => ({type: 'blur', event})),
    inputDom.events('input')
            .map(event => ({
              type: 'input',
              event,
              value: (event.target as HTMLInputElement).value
            })),
    inputDom.events('focus')
             .map(event => ({ type: 'focus', event })),
  )
}

function model(props$: Observable<Props>, actions$: Observable<Action>) : Observable<any> {
  const initVal$ = props$.map(props => props.value).take(1);
  const newVal$ = actions$
    .filter(action => action.type === 'input')
    .map(action => {
      return action.value;
    });

  const value$ = Observable.merge(initVal$, newVal$).shareReplay();

  return Observable.combineLatest(props$, value$).map(([props, value]) => {
    const classes = classNames(classNames);
    const error = props.validate ? props.validate(value) : '';
    return {
      value: value,
      classNames: classes,
      error,
      placeholder: props.placeholder
    }
  }).shareReplay(1);
}

function view(state$: Observable<any>): Observable<JSX.Element> {
  return state$.map(({ value, classNames, error, placeholder }) => {
    return (
      <input
        className={classNames}
        value={value}
        placeholder={placeholder}
      />
    )
  });
}

function main(sources: Sources): Sinks {
  const actions$ = intent(sources.DOM);
  const state$ = model(sources.props$, actions$);
  const vdom$ = view(state$);

  return {
    DOM: vdom$,
    actions$,
    value: state$.map(state => state.value),
  }
}

export default function isolateButton(sources: Sources, isolate: boolean = true): Sinks {
  return isolate ? isolateFn(main)(sources) : main(sources)
}

