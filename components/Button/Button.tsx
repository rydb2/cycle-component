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
  label?: string;
  loading?: boolean;
  size?: string;
  type?: string;
  disabled?: boolean;
  desc?:string;
  primary?: boolean;
  secondary?: boolean;

  icon?: IconProps;
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
  size?: string;
  type?: string;
  disabled?: boolean;
  desc?: string;
  primary?: boolean;
  secondary?: boolean;

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
      size: props.size,
      type: props.type,
      desc: props.desc,
      disabled: props.disabled,
      primary: props.primary,
      secondary: props.secondary,

      iconProps: props.icon
    }
  });
}

function view(sourceDOM: DOMSource, state$: Observable<Model>): Observable<JSX.Element> {
  const iconDOM$: Observable<JSX.Element | String> = state$.flatMap(({iconProps}) => {
    return iconProps && iconProps.name ? Icon({
      DOM: sourceDOM,
      props$: Observable.of(iconProps)
    }).DOM : Observable.of('');
  });

  return Observable.combineLatest(state$, iconDOM$)
    .map(([model, iconTree]) => {
      const classes = classNames(
        {
          loading: model.loading,
          [`cc-button-${model.type}`]: model.type,
          primary: model.primary,
          secondary: model.secondary,
        },
        classNameWithSize('cc-button', model.size),
      );
      return (
        <button className={ classes } disabled={ model.disabled }>
          { iconTree }
          <label className="cc-button-txt-wrap">
            <span className="cc-button-title">{ model.label }</span>
            <span className="cc-button-desc">{ model.desc || '' }</span>
          </label>
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

