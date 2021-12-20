import { Fiber, ReactProps } from "../types";
import { isProperty, isGone, isNew, isEvent } from "./utils";

export function attachPropsToDomNode(root: Required<Fiber>, node: HTMLElement) {
  Object.keys(root.props).forEach((key) => {
    if (key === "children") {
      return;
    } else if (key === "style") {
      Object.keys(root.props[key]).forEach((css) => {
        node.style[css as any] = root.props[key][css];
      });
    } else if (isEvent(key)) {
      const event = key.slice(2).toLowerCase();
      node["addEventListener"](event, root.props[key]);
    }
    //@ts-ignore
    else node[key] = root.props[key];
  });
}

export function createDom(fiber: Fiber): HTMLElement | null {
  const root = fiber;
  if (!root) return null;

  if (typeof root.type === "string") {
    const node =
      root.type === "TEXT"
        ? document.createTextNode("")
        : (document.createElement(root.type) as any);

    attachPropsToDomNode(root as Required<Fiber>, node);

    return node;
  }

  return null;
}

export function updateDom(
  dom: HTMLElement,
  prevProps: ReactProps,
  nextProps: ReactProps
) {
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      //@ts-ignore
      dom[name] = "";
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      //@ts-ignore
      dom[name] = nextProps[name];
    });
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
}
export function commitDeletion(fiber: Fiber | null, domParent: HTMLElement) {
  if (fiber!.dom) {
    domParent?.removeChild(fiber!.dom);
  } else {
    commitDeletion(fiber!.child, domParent);
  }
}
