import { Observable } from 'rxjs'
import { DOMSource  } from '@cycle/dom/rxjs-typings'
import isolateFn from '@cycle/isolate'
import { upperFirst } from 'lodash'
const { html } = require('snabbdom-jsx')
const classNames = require('classnames')

import { InputDomEvents } from '../helpers/domInterfaces'
import { SIZE } from '../enums'
import * as styles from './style.css'

export interface Props {
    value?: string;
    placeholder?: string;
    classNames?: Object;
    validate?: Function;
    size?: SIZE;
}

export interface Sources {
    DOM: DOMSource;
    props$: Observable<Props>;
}

export interface Sinks {
    DOM: Observable<JSX.Element>;
    events?: InputDomEvents;
    value: Observable<string>;
}

function Input(sources: Sources): Sinks {
    const vdom$ = sources.props$.map((props) => {
        const validate = props.validate;
        const className = props.size ? styles[`ccInput${ upperFirst(props.size) }`] : styles.ccInput;
        const classes = classNames(className, props.classNames);
        return (
            <input
                className={classes}
                value={props.value}
                placeholder={props.placeholder}
            />
        )
    })
    const inputDom = sources.DOM.select('input');
    const events: InputDomEvents = {
        blur: inputDom.events('blur'),
        input: inputDom.events('input')
                       .debounce(() => Observable.interval(300)),
    };

    // const value$ = inputDom.events('input').withLatestFrom(
    //     sources.props$,
    //     function(event, props) {
    //         return event.target.value || props;
    //     }
    // ).startWith('');
    const initVal$ = sources.props$.map(props => props.value).take(1);
    const newVal$ = events.input.map(e => {
        return (e.target as HTMLInputElement).value;
    })
    const value$ = Observable.merge(initVal$, newVal$).shareReplay(1);

    return {
        DOM: vdom$,
        events,
        value: value$
        // value$: events.input$.map((e: any) => e.target.value).startWith('')
    }
}

export default function isolateBtton(sources: Sources, isolate: boolean = true): Sinks {
    return isolate ? isolateFn(Input)(sources) : Input(sources)
}
