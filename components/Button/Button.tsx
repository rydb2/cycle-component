import { Observable } from 'rxjs'
import isolateFn from '@cycle/isolate'
import { DOMSource  } from '@cycle/dom/rxjs-typings'
import { JsxElement } from "typescript"

const { html } = require('snabbdom-jsx');
const classNames = require('classnames');

import Icon, { Props as IconProps } from '../Icon/Icon'
import {
  DomComponentSinks,
  DomComponentActions,
  DomComponentProps,
  DomComponentSources } from '../helpers/domInterfaces'
import { classNameWithSize } from '../helpers/tools'
import './style.less'

/* sources */
export interface Props extends DomComponentProps {
  label: string;
  loading?: boolean;
  icon?: string;
  iconSize?: string;
}

export interface Sources extends DomComponentSources {
  props$: Observable<Props>;
}

/* sinks */
export interface Actions extends DomComponentActions {
}

export interface Sinks extends DomComponentSinks {
}

/* model struct */
export interface Model {
  label: string;
  loading?: boolean;
  iconProps?: IconProps;
}

/* main */
function intent(domSource: DOMSource) : Actions {
  return {
    click: domSource.select('button').events('click'),
    hover: domSource.select('button').events('hover'),
  }
}

function model(props$: Observable<Props>, actions: Actions) : Observable<Model> {
  return props$.map(props => {
    return {
      label: props.label,
      loading: props.loading,
      iconProps: {
        name: props.icon,
        size: props.iconSize
      }
    }
  });
}

function view(sourceDOM: DOMSource, state$: Observable<Model>): Observable<JSX.Element> {
  const iconDOM$ = state$.flatMap(({iconProps}) => {
    return Icon({
      DOM: sourceDOM.select('.icon'),
      props$: Observable.of(iconProps)
    }).DOM;
  });

  return Observable.combineLatest(state$, iconDOM$).map(([{ label, loading, iconProps }, iconTree]) => {
    return (
      <button>
        <i className="icon">{ iconTree }</i>
        { label }
      </button>
    )
  })
}

function main(sources: Sources): Sinks {
  const actions = intent(sources.DOM);
  const state$ = model(sources.props$, actions);
  const vdom$ = view(sources.DOM, state$);

  return {
    DOM: vdom$,
    actions
  }
}

export default function isolateButton(sources: Sources, isolate: boolean = true): Sinks {
  return isolate ? isolateFn(main)(sources) : main(sources)
}

