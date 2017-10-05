import { DOMSource } from '@cycle/dom/rxjs-typings';
import { default as isolateFn } from '@cycle/isolate';
import * as classNamesFn from 'classnames';
import { Observable } from 'rxjs';
const { html } = require('snabbdom-jsx');

import {
  IAction,
  IDomComponentProps,
  IDomComponentSinks,
  IDomComponentSources } from '../helpers/domInterfaces';
import { classNameWithSize } from '../helpers/tools';
import Icon, { IProps as IconProps } from '../Icon/Icon';
import './style.less';

/* sources */
export interface IProps extends IDomComponentProps {
  label?: string;
  loading?: boolean;
  size?: string;
  type?: string;
  disabled?: boolean;
  desc?: string;
  primary?: boolean;
  secondary?: boolean;

  icon?: IconProps;
}

export interface ISources extends IDomComponentSources {
  props$: Observable<IProps>;
}

/* sinks */
export interface ISinks extends IDomComponentSinks {
}

/* model struct */
export interface IModel {
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
function intent(domSource: DOMSource): Observable<IAction> {
  return Observable.merge(
    domSource
      .select('button')
      .events('click')
      .map(event => ({ event, type: 'click' })),
    domSource
      .select('button')
      .events('hover')
      .map(event => ({ event, type: 'hover' })),
  );
}

function model(props$: Observable<IProps>): Observable<IModel> {
  return props$.map((props) => {
    return {
      classNames: props.classNames,
      desc: props.desc,
      disabled: props.disabled,
      iconProps: props.icon,
      label: props.label,
      loading: props.loading,
      primary: props.primary,
      secondary: props.secondary,
      size: props.size,
      type: props.type || 'flat',
    };
  });
}

function view(sourceDOM: DOMSource, state$: Observable<IModel>): Observable<JSX.Element> {
  const iconDOM$ = state$.flatMap(({ iconProps }) => {
    return iconProps && iconProps.name ? Icon({
      DOM: sourceDOM,
      props$: Observable.of(iconProps),
    }).DOM : Observable.of('');
  });

  return Observable.combineLatest(state$, iconDOM$)
    .map(([state, iconTree]) => {
      let mainClass = `cc-button__${state.type || 'flat'}`;
      if (state.primary || state.secondary) {
        mainClass += `--${(state.primary && 'primary') || (state.secondary && 'secondary')}`;
      }
      const classes = classNamesFn(
        {
          [`${mainClass}--loading`]: state.loading,
          [mainClass]: true,
        },
        classNameWithSize('cc-button', state.size),
        state.classNames,
      );
      const content = state.label ? (
        <label className="cc-button__content">
          <span className="cc-button__title">{state.label}</span>
          <span className="cc-button__desc">{state.desc || ''}</span>
        </label>
      ) : '';
      return (
        <button className={classes} disabled={state.disabled}>
          {iconTree}
          {content}
        </button>
      );
    });
}

function main(sources: ISources): ISinks {
  const actions$ = intent(sources.DOM);
  const state$ = model(sources.props$);
  const vdom$ = view(sources.DOM, state$);

  return {
    DOM: vdom$,
    actions$,
  };
}

export default function isolateButton(sources: ISources, isolate: boolean = true): ISinks {
  return isolate ? isolateFn(main)(sources) : main(sources);
}
