import { Observable } from 'rxjs'
import { DOMSource  } from '@cycle/dom/rxjs-typings'
import { JsxElement } from "typescript"

const { html } = require('snabbdom-jsx');
const classNames = require('classnames');

import { classNameWithSize } from '../helpers/tools'
import './style.less'

/* sources */
export interface Props {
  name: string;
  size?: string;
}

export interface Sources {
  DOM: DOMSource;
  props$: Observable<Props>;
}

/* sinks */
export interface Sinks {
  DOM: Observable<JSX.Element | String>;
}


export default function Icon(sources: Sources): Sinks {
  const vdom$ = sources.props$.map(props => {
    if (props.name) {
      const className = classNameWithSize('cc-icon', props.size);
      const svgTag = `<use xlink:href='icons-sprite.svg#ic_${props.name}_24px' />`;
      return <svg className={className} innerHTML={svgTag} />;
    } else {
      return '';
    }
  });

  return {
    DOM: vdom$,
  }
};
