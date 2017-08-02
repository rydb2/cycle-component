import { Observable } from 'rxjs/Rx'; 
import { run } from '@cycle/rxjs-run'
import { makeDOMDriver, DOMSource, VNode } from '@cycle/dom';
import * as CodeMirror from 'codemirror'
import classNames from 'classnames'
const {html} = require('snabbdom-jsx');

import * as styles from './style.css';

export interface Props {
  value: string;
}

export interface Sources {
  DOM: DOMSource;
  props$: Observable<Props>;
};

export interface Events {
  input$: Observable<Event>;
}

export interface Sinks {
  DOM: Observable<JSX.Element>;
  events?: Events;
  value$: Observable<string>;
};

export default function Editor(sources: Sources): Sinks {

  const domSource =  sources.DOM;

  const vdom$ = sources.props$.map((props) => {
    const mainClass = classNames("main", styles.editor)
    return (
      <div className={mainClass}
           contentEditable={true}>
           {props.value}
      </div>
    )
  });
  
  const input$ = domSource.select('#editor')
    .events('input')
    .debounce(() => Observable.interval(500));

  return {
    DOM: vdom$,
    value$: input$.map((e: any)=> e.target.innerText).startWith('')
  }
}
