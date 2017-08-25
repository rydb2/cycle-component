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
  color?: string;
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
    const [type, name] = props.name.split('.');
    if (type && name) {
      const className = classNameWithSize('cc-icon', props.size);
      const svgTag = `
        <svg class="${className}" fill="${props.color || ''}">
            <use xlink:href='cc-icons-sprite.svg#svg-sprite-${type}-symbol_${name}_24px'/>
        </svg>`;
      return <i className={className} innerHTML={svgTag}></i>;
    };
  });

  return {
    DOM: vdom$,
  }
};
