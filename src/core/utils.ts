import { createEventWrapperFactory } from "./dom";
import {
  ReactChildren,
  ReactElement,
  ReactFunctionComponent,
  ReactProps,
} from "./types";

export const createElement = (
  type: string | ReactFunctionComponent,
  props: ReactProps,
  ...children: ReactChildren
): ReactElement => {
  if (props) {
    Object.keys(props).forEach((prop) => {
      if (prop.startsWith("on")) {
        if (props[prop] instanceof Function)
          props[prop] = createEventWrapperFactory(prop, props[prop]);
      }
    });
  }
  props = {
    ...props,
    children: children.map((x) =>
      Array.isArray(x) || x.type ? x : createTextElement(x as any as string)
    ),
  };
  return { type, props };
};

export function createTextElement(text: string) {
  return {
    type: "TEXT",
    props: {
      children: [],
      nodeValue: text,
    },
  };
}
export const isNew = (prev: ReactProps, next: ReactProps) => (key: string) =>
  prev[key] !== next[key];
export const isGone = (_prev: ReactProps, next: ReactProps) => (key: string) =>
  !(key in next);
export const isEvent = (key: string) => key.startsWith("on");
export const isProperty = (key: string) => key !== "children" && !isEvent(key);
