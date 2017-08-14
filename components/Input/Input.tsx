import { Observable } from 'rxjs'
import isolateFn from '@cycle/isolate'
import { DOMSource  } from '@cycle/dom/rxjs-typings'

const { html } = require('snabbdom-jsx');
const classNames = require('classnames');

import {
  InputDomComponentSinks,
  InputDomComponentActions,
  InputDomComponentProps,
  DomComponentSources } from '../helpers/domInterfaces'
import { clssNameWithSize } from '../helpers/tools'
import './style.scss'
import {JsxElement} from "typescript";

/* sources */
export interface Props extends InputDomComponentProps {
    placeholder?: string;
    validate?: Function;
}

export interface Sources extends DomComponentSources {
  props$: Observable<Props>;
}

/* sinks */
export interface Actions extends InputDomComponentActions {
  focus: Observable<Event>;
}

export interface Sinks extends InputDomComponentSinks {
}

/* main */
function intent(domSource: DOMSource) : Actions {
  const inputDom = domSource.select('input');
  return {
    blur: inputDom.events('blur'),
    input: inputDom.events('input')
                   .debounce(() => Observable.interval(300)),
    focus: inputDom.events('focus'),
  };
}

function model(props$: Observable<Props>, actions: Actions) : Observable<any> {
  const initVal$ = props$.map(props => props.value).take(1);
  const newVal$ = actions.input.map(e => {
    return (e.target as HTMLInputElement).value;
  });

  const value$ = Observable.merge(initVal$, newVal$).shareReplay();

  return Observable.combineLatest(props$, value$).map(([props, value]) => {
    const className = clssNameWithSize('cc-input', props.size);
    const classes = classNames(className, classNames);
    const error = props.validate ? props.validate(value) : '';
    return {
      value: value,
      classNames: classes,
      error,
      placeholder: props.placeholder
    }
  }).shareReplay();
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
  const actions = intent(sources.DOM);
  const state$ = model(sources.props$, actions);
  const vdom$ = view(state$);

  return {
    DOM: vdom$,
    actions,
    value: state$.map(state => state.value),
  }
}

export default function isolateButton(sources: Sources, isolate: boolean = true): Sinks {
  return isolate ? isolateFn(main)(sources) : main(sources)
}

