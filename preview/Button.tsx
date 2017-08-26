import { Observable } from 'rxjs/Rx'
import { run } from '@cycle/rxjs-run'
import { makeDOMDriver, VNode } from '@cycle/dom'
import { DOMSource } from '@cycle/dom/rxjs-typings'
import { timeDriver, TimeSource } from '@cycle/time/rxjs'
const { html } = require('snabbdom-jsx');

import { Button } from '../components'
import '../components/Icon'

type Sources = {
  DOM: DOMSource;
}

type Sinks = {
  DOM: Observable<JSX.Element>;
}

function raisedBtn(DOM) {
  let config =  ({label='button',
                  loading=false,
                  disabled=false,
                  primary=false,
                  secondary=false,
                  icon={}}) => {
    return Observable.of({
      loading,
      disabled,
      secondary,
      primary,
      label,
      type: 'raised',
      icon
    })
  };
  return Observable.combineLatest(
    Button({DOM, props$: config({})}).DOM,
    Button({DOM, props$: config({loading: true})}).DOM,

    Button({DOM, props$: config({label: 'primary', primary: true})}).DOM,
    Button({DOM, props$: config({label: 'primary', primary: true, loading: true})}).DOM,
    Button({DOM, props$: config({
      label: 'primary',
      primary: true,
      icon: {
        name: 'social.ic_cake',
        color: '#ffffff'
      }
    })}).DOM,

    Button({DOM, props$: config({label: 'secondary', secondary: true})}).DOM,
    Button({DOM, props$: config({label: 'secondary', secondary: true, loading: true})}).DOM,

    Button({DOM, props$: config({label: 'disabled', disabled: true})}).DOM,
  ).map(doms => {
    return (
      <div className="wrap">
        {
          doms.map(dom => {
            return dom
          })
        }
      </div>
    )
  })
}

function flatBtn(DOM) {
  let config = ({
    label='flatButton',
    loading=false,
    disabled=false,
    primary=false,
    secondary=false,
    icon={}
  }) => {
    return Observable.of({
      loading,
      disabled,
      secondary,
      primary,
      label,
      type: 'flat',
      icon
    })
  };
  return Observable.combineLatest(
    Button({DOM, props$: config({})}).DOM,
    Button({DOM, props$: config({loading: true})}).DOM,

    Button({DOM, props$: config({label: 'primary', primary: true})}).DOM,
    Button({DOM, props$: config({label: 'primary', primary: true, loading: true})}).DOM,

    Button({DOM, props$: config({label: 'secondary', secondary: true})}).DOM,
    Button({DOM, props$: config({label: 'secondary', secondary: true, loading: true})}).DOM,

    Button({DOM, props$: config({label: 'disabled', disabled: true})}).DOM,
  ).map(doms => {
    return (
      <div className="wrap">
        {
          doms.map(dom => {
            return dom
          })
        }
      </div>
    )
  })
}

export default function main(sources: Sources): Sinks {
  const vdom$ = Observable.combineLatest(
    raisedBtn(sources.DOM),
    flatBtn(sources.DOM)
  ).map(doms => {
      let style = {
        marginTop: '20px',
      };
      return (
        <div>
          {
            doms.map(each => {
              return <div style={style}>{each}</div>
            })
          }
        </div>
      )
    });

  return {
    DOM: vdom$
  };
}

