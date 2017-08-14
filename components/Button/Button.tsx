import { Observable } from 'rxjs'
import isolateFn from '@cycle/isolate'
import { DOMSource  } from '@cycle/dom/rxjs-typings'
import { JsxElement } from "typescript"

const { html } = require('snabbdom-jsx');
const classNames = require('classnames');

import {
  DomComponentSinks,
  DomComponentActions,
  DomComponentProps,
  DomComponentSources } from '../helpers/domInterfaces'
import { clssNameWithSize } from '../helpers/tools'
import './style.less'

/* sources */
export interface Props extends DomComponentProps {
  label: string;
  loading?: boolean;
}

export interface Sources extends DomComponentSources {
  props$: Observable<Props>;
}


/* sinks */
export interface Actions extends DomComponentActions {
}

export interface Sinks extends DomComponentSinks {
}

/* main */
function intent(domSource: DOMSource) : Actions {
  return {
    click: domSource.select('button').events('click'),
    hover: domSource.select('button').events('hover'),
  }
}

function model(props$: Observable<Props>, actions: Actions) : Observable<any> {
  return props$.map(props => {
    return {
      label: props.label,
      loading: props.loading
    }
  });
}

function view(state$: Observable<any>): Observable<JSX.Element> {
  return state$.map(({ label, loading }) => {
    return (
      <button>{label}</button>
    )
  })
}

function main(sources: Sources): Sinks {
  const actions = intent(sources.DOM);
  const state$ = model(sources.props$, actions);
  const vdom$ = view(state$);

  return {
    DOM: vdom$,
    actions
  }
}

export default function isolateButton(sources: Sources, isolate: boolean = true): Sinks {
  return isolate ? isolateFn(main)(sources) : main(sources)
}

