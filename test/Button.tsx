import { Observable } from 'rxjs/Rx';
import { DOMSource } from '@cycle/dom/rxjs-typings';
const { html } = require('snabbdom-jsx');

import { Button } from '../components';
import '../components/Icon';
import { IProps } from '../components/Button/Button';

type Sources = {
  DOM: DOMSource;
};

type Sinks = {
  DOM: Observable<JSX.Element>;
};

function raisedBtn(DOM) {
  let config = function ({
    label = 'button',
    loading = false,
    disabled = false,
    primary = false,
    secondary = false,
    icon = {},
  }): Observable<IProps> {
    let r = {
      loading,
      disabled,
      secondary,
      primary,
      label,
      type: 'raised',
    };
    if (Object.keys(icon).length > 0) {
      r.icon = icon;
    }
    return Observable.of(r);
  };
  return Observable.combineLatest(
    Button({ DOM, props$: config({})}).DOM,
    Button({ DOM, props$: config({ loading: true })}).DOM,

    Button({ DOM, props$: config({
      label: 'primary',
      primary: true,
    })}).DOM,
    Button({ DOM, props$: config({
      label: 'primary',
      loading: true,
      primary: true,
    })}).DOM,
    Button({ DOM, props$: config({
      icon: {
        color: '#ffffff',
        name: 'social.ic_cake',
      },
      label: 'primary',
      primary: true,
    })}).DOM,

    Button({ DOM, props$: config({
      label: 'secondary',
      secondary: true,
    })}).DOM,
    Button({ DOM, props$: config({
      label: 'secondary',
      loading: true,
      secondary: true,
    })}).DOM,
    Button({ DOM, props$: config({
      disabled: true,
      label: 'disabled',
    })}).DOM,
  ).map((doms) => {
    return (
      <div className="wrap">
        {doms.map(dom => dom)}
      </div>
    );
  });
}

function flatBtn(DOM) {
  let config = function ({
    label = 'flatButton',
    loading = false,
    disabled = false,
    primary = false,
    secondary = false,
    icon = {},
  }): Observable<IProps> {
    let r = {
      loading,
      disabled,
      secondary,
      primary,
      label,
      type: 'flat',
    };
    if (Object.keys(icon).length > 0) {
      r.icon = icon;
    }
    return Observable.of(r);
  };
  return Observable.combineLatest(
    Button({ DOM, props$: config({}) }).DOM,
    Button({ DOM, props$: config({
      loading: true,
    })}).DOM,

    Button({ DOM, props$: config({
      label: 'primary',
      primary: true,
    })}).DOM,
    Button({ DOM, props$: config({
      label: 'primary',
      primary: true,
      loading: true,
    })}).DOM,

    Button({ DOM, props$: config({
      label: 'secondary',
      secondary: true,
    })}).DOM,
    Button({ DOM, props$: config({
      label: 'secondary',
      secondary: true,
      loading: true,
    })}).DOM,

    Button({ DOM, props$: config({
      label: 'disabled',
      disabled: true,
    })}).DOM,
  ).map(doms => {
    return (
      <div className="wrap">
        {doms.map(dom => dom)}
      </div>
    );
  });
}

export default function main(sources: Sources): Sinks {
  const vdom$ = Observable.combineLatest(
    raisedBtn(sources.DOM),
    flatBtn(sources.DOM),
  ).map((doms) => {
    const styleObj = {
      marginTop: '20px',
    };
    return (
      <div>
        {
          doms.map(each => {
            return <div style={styleObj}>{each}</div>;
          })
        }
      </div>
    );
  });

  return {
    DOM: vdom$,
  };
}


