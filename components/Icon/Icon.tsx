import { DOMSource  } from '@cycle/dom/rxjs-typings';
import { default as isolateFn } from '@cycle/isolate';
import * as classNamesFn from 'classnames';
import { Observable } from 'rxjs';
const { html } = require('snabbdom-jsx');

import { classNameWithSize } from '../helpers/tools';
import './style.less';

/* sources */
export interface IProps {
  name: string;
  size?: string;
  color?: string;
  classNames?: string[];
}

export interface ISources {
  DOM: DOMSource;
  props$: Observable<IProps>;
}

/* sinks */
export interface ISinks {
  DOM: Observable<JSX.Element | string>;
}

function main(sources: ISources): ISinks {
  const vdom$ = sources.props$.map((props) => {
    const [type, name] = props.name.split('.');
    if (type && name) {
      let classNames = classNameWithSize('cc-icon', props.size);
      if (props.classNames && props.classNames.length > 0) {
        classNames += ` ${props.classNames.join(' ')}`;
      }

      const svgTag = `
        <svg class="${classNames}" fill="${props.color || ''}">
            <use xlink:href='material-icons-sprite.svg#svg-sprite-${type}-symbol_${name}_24px'/>
        </svg>`;
      return <i innerHTML={svgTag}></i>;
    }
  });

  return {
    DOM: vdom$,
  };
}

export default function (sources: ISources, isolate: boolean = true): ISinks {
  return isolate ? isolateFn(main)(sources) : main(sources);
}
