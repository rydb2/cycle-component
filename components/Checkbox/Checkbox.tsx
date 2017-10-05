import { DOMSource } from '@cycle/dom/rxjs-typings';
import { default as isolateFn } from '@cycle/isolate';
import * as classNamesFn from 'classnames';
import { Observable } from 'rxjs';
const { html } = require('snabbdom-jsx');

import {
  IAction,
  IInputDomComponentActions,
  IInputDomComponentProps,
  IInputDomComponentSinks,
} from '../helpers/domInterfaces';
import Icon from '../Icon/Icon';
import './style.less';

export interface IProps extends IInputDomComponentProps {
  selected?: boolean;
  label?: string;
  indeterminate?: boolean;
}

export interface ISources {
  DOM: DOMSource;
  props$: Observable<IProps>;
}

export interface IModel {
  indeterminate?: boolean;
  label?: string;
  selected?: boolean;

  classNames?: string[];
}

function intent(domSource: DOMSource): Observable<IAction> {
  return Observable.merge(
    domSource
      .select('.js-item')
      .events('click')
      .map(event => ({ event, type: 'select' })),
  );
}

function model(props$: Observable<IProps>, action$: Observable<IAction>): Observable<IModel> {

  const selected$ = props$
    .flatMap((props) => {
      return action$
        .filter(e => e.type === 'select')
        .scan(
          (selected, event) => {
            return !selected;
          },
          props.selected,
        )
        .startWith(props.selected);
    });

  selected$.map(e => {
    console.log('selected: ', e)
  });

  return Observable.combineLatest(
    props$,
    selected$,
  ).map(([props, selected]) => {
    return {
      selected,
      indeterminate: props.indeterminate,
      label: props.label,
    };
  }).shareReplay(1);
}

function iconView(DOM: DOMSource, state$: Observable<IModel>) {
  return state$.flatMap((state) => {
    if (state.selected && !state.indeterminate) {
      return Icon({
        DOM,
        props$: Observable.of({
          classNames: ['selected'],
          name: 'toggle.ic_check_box',
        }),
      }).DOM;
    } else if (state.selected && state.indeterminate) {
      return Icon({
        DOM,
        props$: Observable.of({
          classNames: ['indeterminate'],
          name: 'toggle.ic_indeterminate_check_box',
        }),
      }).DOM;
    } else {
      return Icon({
        DOM,
        props$: Observable.of({
          name: 'toggle.ic_check_box_outline_blank',
        }),
      }).DOM;
    }
  });
}

function view(
  DOM: DOMSource,
  state$: Observable<IModel>,
): Observable<JSX.Element> {
  const iconDOM$ = iconView(DOM, state$);
  return Observable.combineLatest(
    state$,
    iconDOM$,
  ).map(([state, iconTree]) => {
    return (
      <div className="cc-checkbox js-item">
        {iconTree}
        {state.label ? (<span className="label">{state.label}</span>) : ''}
      </div>
    );
  });
}

function main(sources: ISources): IInputDomComponentSinks {
  const action$ = intent(sources.DOM);
  const model$ = model(sources.props$, action$);
  const vdom$ = view(sources.DOM, model$);

  return {
    DOM: vdom$,
    actions$: action$,
    value: model$.map(state => state.selected),
  };
}

export default function (sources: ISources, isolate: boolean = true): IInputDomComponentSinks{
  return isolate ? isolateFn(main)(sources) : main(sources);
}
