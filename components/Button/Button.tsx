import { Observable } from 'rxjs'
import isolateFn from '@cycle/isolate'
import { DOMSource  } from '@cycle/dom/rxjs-typings'

const { html } = require('snabbdom-jsx');
const classNames = require('classnames');

import Icon, { Props as IconProps } from '../Icon/Icon'
import {
  DomComponentSinks,
  Action,
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
export interface Sinks extends DomComponentSinks {
}

/* model struct */
export interface Model {
  label?: string;
  loading?: boolean;
  size?: string;
  type?: string;
  disabled?: boolean;
  desc?: string;
  primary?: boolean;
  secondary?: boolean;

  classNames?: string[];
  iconProps?: IconProps;
}

/* main */
function intent(domSource: DOMSource): Observable<Action> {
  return Observable.merge(
    domSource
      .select('button')
      .events('click')
      .map(e => ({type: 'click', event: e})),
    domSource
      .select('button')
      .events('hover')
      .map(e => ({type: 'hover', event: e})),

  )
}

function model(props$: Observable<Props>, actions$: Observable<Action>) : Observable<Model> {
  return props$.map(props => {
    return {
      label: props.label,
      loading: props.loading,
      size: props.size,
      type: props.type || 'flat',
      desc: props.desc,
      disabled: props.disabled,
      primary: props.primary,
      secondary: props.secondary,

      classNames: props.classNames,
      iconProps: props.icon
    }
  });
}

function view(sourceDOM: DOMSource, model$: Observable<Model>): Observable<JSX.Element> {
  const iconDOM$ = model$.flatMap(({iconProps}) => {
    return iconProps && iconProps.name ? Icon({
      DOM: sourceDOM,
      props$: Observable.of(iconProps)
    }).DOM : Observable.of('');
  });

  return Observable.combineLatest(model$, iconDOM$)
    .map(([model, iconTree]) => {
      let mainClass = `cc-button__${model.type || 'flat'}`;
      if (model.primary || model.secondary) {
        mainClass += `--${(model.primary && 'primary') || (model.secondary && 'secondary')}`
      }
      const classes = classNames(
        {
          [`${mainClass}--loading`]: model.loading,
          [mainClass]: true
        },
        classNameWithSize('cc-button', model.size),
        model.classNames
      );
      const content = model.label ? (
        <label className="cc-button__content">
          <span className="cc-button__title">{ model.label }</span>
          <span className="cc-button__desc">{ model.desc || '' }</span>
        </label>
      ) : '';
      return (
        <button className={ classes } disabled={ model.disabled }>
          { iconTree }
          { content }
        </button>
      )
    })
}

function main(sources: Sources): Sinks {
  const actions$ = intent(sources.DOM);
  const state$ = model(sources.props$, actions$);
  const vdom$ = view(sources.DOM, state$);

  return {
    DOM: vdom$,
    actions$
  }
}

export default function isolateButton(sources: Sources, isolate: boolean = true): Sinks {
  return isolate ? isolateFn(main)(sources) : main(sources)
}

