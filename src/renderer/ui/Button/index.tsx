import { Observable } from 'rxjs'
import { DOMSource  } from '@cycle/dom'
import isolateFn from '@cycle/isolate';
const {html} = require('snabbdom-jsx');

import { CommonDomEvents } from '../helpers/domInterfaces'

export interface Sources {
    DOM: DOMSource;
    props$: Observable<Props>;
}

export interface Props {
    label?: string;
    classNames?: Object;
}

export interface Sinks {
    DOM: Observable<JSX.Element>;
    events?: CommonDomEvents;
}

function Button(sources: Sources): Sinks {
    // const vdom$ = sources.props$
        // .map(props => (<button>{ props.label }</button>));
    const vdom$ = sources.props$.map((props) => (<button>{props.label}</button>))

    const events: CommonDomEvents = {
        click: sources.DOM.select('button').events('click'),
        hover: sources.DOM.select('button').events('hover')
    }

    return {
        DOM: vdom$,
        events
    }
}

export default function isolateBtton(sources: Sources, isolate: boolean = true): Sinks {
    return isolate ? isolateFn(Button)(sources) : Button(sources)
}
