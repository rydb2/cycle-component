import { DOMSource  } from '@cycle/dom/rxjs-typings';
import { Observable } from 'rxjs';

export interface IAction {
  type: string;
  event?: Event;
  value?: any;
}

/* sinks */
export interface IDomComponentSinks {
  DOM: Observable<JSX.Element>;
  actions$: Observable<IAction>;
}

export interface IInputDomComponentSinks extends IDomComponentSinks {
  value: Observable<any>;
}

/* actions */
export interface IDomComponentActions {
  hover$?: Observable<Event>;
  click$?: Observable<Event>;
}

export interface IInputDomComponentActions extends IDomComponentActions {
  blur$?: Observable<Event>;
  input$?: Observable<Event>;
}

/* sources */
export interface IDomComponentSources {
  DOM: DOMSource;
  props$: Observable<IDomComponentProps>;
}

/* props */
export interface IDomComponentProps {
  isolate?: boolean;
  classNames?: string[];
  style?: object | string;
}

export interface IInputDomComponentProps extends IDomComponentProps {
  value?: number | string | object;
}
