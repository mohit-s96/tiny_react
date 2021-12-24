import { getFiberFromDomNode, getRootFIber, setSyncRenderFlag } from "./react";
import { Fiber, ReactProps } from "./types";
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
      let event = "";
      if (key === "onChange") {
        event = "input";
      } else {
        event = key.slice(2).toLowerCase();
      }
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
      if (name === "style") {
        Object.keys(nextProps[name]).forEach((css) => {
          dom.style[css as any] = nextProps[name][css];
        });
      } else {
        //@ts-ignore
        dom[name] = nextProps[name];
      }
    });
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      let event = "";
      if (name === "onChange") {
        event = "input";
        dom.removeEventListener(event, prevProps[name]);
        // console.log("removed");
      } else {
        event = name.toLowerCase().substring(2);
        dom.removeEventListener(event, prevProps[name]);
      }
    });
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      let event = "";
      if (name === "onChange") {
        event = "input";
      } else {
        event = name.slice(2).toLowerCase();
      }
      dom.addEventListener(event, nextProps[name]);
    });
}
export function commitDeletion(fiber: Fiber | null, domParent: HTMLElement) {
  // debugger;
  if (fiber!.dom) {
    domParent?.removeChild(fiber!.dom);
    fiber!.effectTag = undefined;
  } else {
    commitDeletion(fiber!.child, domParent);
  }
}

export function createEventWrapperFactory(key: string, cb: any) {
  if (key === "onChange") {
    return (e: Event) => {
      e.preventDefault();
      const fiber = getFiberFromDomNode(getRootFIber(), e.target as any);
      const synthevent = {
        target: {
          value: (e.target! as any).value,
        },
        preventDefault: e.preventDefault,
      };

      (e.target! as any).value = fiber!.props.value;
      setSyncRenderFlag(true);
      cb(synthevent);
    };
  } else {
    return (e: Event) => {
      cb(e);
    };
  }
}
