import * as Rx from 'rxjs/Rx'; 
import { run } from '@cycle/rxjs-run'
import { makeDOMDriver, DOMSource, VNode } from '@cycle/dom';

const {html} = require('snabbdom-jsx');

export interface EditorProps {
    base: string;
}

interface Sources {
  DOM: DOMSource;
  // props$: Rx.Observer<EditorProps>;
};

interface Sinks  {
  DOM: Rx.Observer<JSX.Element>;
};


function Editor(sources: Sources): Sinks {
  // const props$ = sources.props$;
  const domSource =  sources.DOM;

  const vdom$ = Rx.Observer
    .of(1, 2, 3)
    .map((num: any) => {
        return (<div>{num}</div>)
    });

  return {
    DOM: vdom$
  }
}

export default Editor;

