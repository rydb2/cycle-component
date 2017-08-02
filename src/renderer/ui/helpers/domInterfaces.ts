import { Observable } from 'rxjs'

export interface DomComponent {
    DOM: Observable<JSX.Element>
}

export interface DomComponentProps {
    isolate?: boolean;
    className?: string;
    style?: object | string;
}

export interface CommonDomEvents {
    hover?: Observable<Event>;
    click?:  Observable<Event>;
}

export interface InputDomEvents extends CommonDomEvents {
    blur?:  Observable<Event>;
    input?:  Observable<Event>;
}