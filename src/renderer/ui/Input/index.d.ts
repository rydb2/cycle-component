/// <reference types="react" />
import { Observable } from 'rxjs';
import { DOMSource } from '@cycle/dom/rxjs-typings';
import { InputDomEvents } from '../helpers/domInterfaces';
import { SIZE } from '../enums';
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
export default function isolateBtton(sources: Sources, isolate?: boolean): Sinks;
