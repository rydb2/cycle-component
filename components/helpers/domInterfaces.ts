import { Observable } from 'rxjs'
import { DOMSource  } from '@cycle/dom/rxjs-typings'

/* sinks */
export interface DomComponentSinks {
  DOM: Observable<JSX.Element>;
  actions: DomComponentActions;
}

export interface InputDomComponentSinks extends DomComponentSinks {
    value: Observable<any>
}

/* actions */
export interface DomComponentActions {
  hover?: Observable<Event>;
  click?:  Observable<Event>;
}

export interface InputDomComponentActions extends DomComponentActions {
  blur?:  Observable<Event>;
  input?:  Observable<Event>;
}

/* sources */
export interface DomComponentSources {
  DOM: DOMSource;
  props$: Observable<DomComponentProps>;
}

/* props */
export interface DomComponentProps {
  isolate?: boolean;
  classNames?: string;
  style?: object | string;
  size?: string;
}

export interface InputDomComponentProps extends DomComponentProps{
  value?: any;
}
