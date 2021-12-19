import {
  Fiber,
  ReactChildren,
  ReactElement,
  ReactFunctionComponent,
  ReactProps,
} from "./types";

const createElement = (
  type: string | ReactFunctionComponent,
  props: ReactProps,
  ...children: ReactChildren
): ReactElement => {
  props = {
    ...props,
    children: children.map((x) =>
      Array.isArray(x) || x.type ? x : createTextElement(x as any as string)
    ),
  };
  return { type, props };
};

const isNew = (prev: ReactProps, next: ReactProps) => (key: string) =>
  prev[key] !== next[key];
const isGone = (_prev: ReactProps, next: ReactProps) => (key: string) =>
  !(key in next);
const isEvent = (key: string) => key.startsWith("on");
const isProperty = (key: string) => key !== "children" && !isEvent(key);

function createTextElement(text: string) {
  return {
    type: "TEXT",
    props: {
      children: [],
      nodeValue: text,
    },
  };
}

function renderChildren(children: ReactChildren, node: HTMLElement) {
  children.forEach((child) => {
    // primitive type means append to parent node

    if (typeof child === "string" || typeof child === "number") {
      node.appendChild(document.createTextNode(child));
    }

    // if child is a react element then render it recursively
    else if (!Array.isArray(child) && child.type) {
      render(child, node);
    }

    // if child is generated from a list i.e. an array render all elements of the array recursively
    else if (Array.isArray(child)) {
      child.forEach((ch) => {
        render(ch, node);
      });
    } else {
      return;
    }
  });
}

function attachPropsToDomNode(root: Required<Fiber>, node: HTMLElement) {
  Object.keys(root.props).forEach((key) => {
    if (key === "children") {
      return;
    } else if (key === "style") {
      Object.keys(root.props[key]).forEach((css) => {
        node.style[css as any] = root.props[key][css];
      });
    } else if (key.startsWith("on")) {
      const event = key.slice(2).toLowerCase();
      node["addEventListener"](event, root.props[key]);
    }
    //@ts-ignore
    else node[key] = root.props[key];
  });
}

function createDom(fiber: Fiber): HTMLElement | null {
  // our render function will just render plain strings as well as react elements
  const root = fiber;
  if (!root) return null;
  // if (typeof root === "string") {
  //   domNode.appendChild(document.createTextNode(root));
  //   return;
  // }

  // if the ReactElement is not a Function component, we create a new dom node of that type and
  // recursively render all the children in that dom node

  if (typeof root.type === "string") {
    const node =
      root.type === "TEXT"
        ? document.createTextNode("")
        : (document.createElement(root.type) as any);

    attachPropsToDomNode(root as Required<Fiber>, node);

    return node;
    // renderChildren(root.props.children, node);

    // append the last created node in the current parent node

    // domNode.appendChild(node);
  }

  // if the ReactElement is a functional component we call it with the props to get the ReactElement it returns
  else if (root.type instanceof Function) {
    const element = root.type(root.props);
    return null;
    // account for fragments. if type is undefined then element is a fragment and we render all it's children
    // as the children of the current parent [domNode]

    // if (element.type === undefined) {
    //   renderChildren(element.props.children, domNode);
    //   return;
    // }

    // otherwise we render the new element
    // render(element, domNode);
  } else {
    return null;
  }
}

// fiber structures
let nextUnitOfWork: Fiber | null = null;
let wipRoot: Fiber | null = null;
let currentRoot: Fiber | null = null;
let deletions: Array<Fiber> | null = null;

// TODO : implement fiber data structure and the performunitofwork function
function workLoop(deadLine: IdleDeadline) {
  let shouldYeild = false;
  while (nextUnitOfWork && !shouldYeild) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYeild = deadLine.timeRemaining() < 1;
  }
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
  requestIdleCallback(workLoop);
}

function commitRoot() {
  deletions?.forEach(commitWork);
  commitWork(wipRoot!.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function updateDom(
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

function commitDeletion(fiber: Fiber | null, domParent: HTMLElement) {
  if (fiber!.dom) {
    domParent?.removeChild(fiber!.dom);
  } else {
    commitDeletion(fiber!.child, domParent);
  }
}

function commitWork(fiber: Fiber | null) {
  if (!fiber) {
    return;
  }
  let domParentFiber = fiber.parent;
  while (!domParentFiber?.dom) {
    domParentFiber = domParentFiber?.parent!;
  }

  const domParent = domParentFiber.dom;

  if (fiber.effectTag === "PLACEMENT" && fiber.dom !== null) {
    domParent?.appendChild(fiber.dom!);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom) {
    updateDom(fiber.dom, fiber.alternate!.props!, fiber.props!);
  } else if (fiber.effectTag === "DELETION") {
    commitDeletion(fiber, domParent);
  }

  // domParent?.appendChild(fiber.dom!);
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function updateFunctionComponent(fiber: Fiber) {
  const children = [(fiber.type as ReactFunctionComponent)(fiber.props)].reduce(
    (acc, child) =>
      //@ts-ignore
      Array.isArray(child) ? [...acc, ...child] : [...acc, child],
    []
  );
  //@ts-ignore
  reconcileChildren(fiber, children);
}

function updateNormalComponent(fiber: Fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  const elements = fiber.props!.children.reduce(
    (acc, child) =>
      //@ts-ignore
      Array.isArray(child) ? [...acc, ...child] : [...acc, child],
    []
  );

  //@ts-ignore
  reconcileChildren(fiber, elements);
}

function performUnitOfWork(fiber: Fiber): Fiber | null {
  if (fiber.type instanceof Function) {
    updateFunctionComponent(fiber);
  } else {
    updateNormalComponent(fiber);
  }

  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber: Fiber | undefined | null = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }

  return null;
}

function reconcileChildren(fiber: Fiber, elements: ReactChildren) {
  let prevSibling: Fiber | null = null;
  let idx = 0;

  let oldFiber = fiber.alternate && fiber.alternate.child;

  while (idx < elements!.length || oldFiber !== null) {
    const element = elements![idx] as ReactElement;

    let newFiber: Fiber | null = null;

    const sametype = oldFiber && element && element.type === oldFiber.type;

    if (sametype) {
      newFiber = {
        type: oldFiber!.type,
        props: element.props,
        dom: oldFiber!.dom,
        parent: fiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
        child: null,
        sibling: null,
      };
    }
    if (element && !sametype) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: fiber,
        alternate: null,
        effectTag: "PLACEMENT",
        child: null,
        sibling: null,
      };
    }

    if (oldFiber && !sametype) {
      oldFiber.effectTag = "DELETION";
      deletions!.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (idx === 0) {
      fiber.child = newFiber!;
    } else {
      prevSibling!.sibling = newFiber!;
    }

    prevSibling = newFiber;
    idx++;
  }
}

function render(root: ReactElement, domNode: HTMLElement) {
  wipRoot = {
    dom: domNode,
    props: {
      children: [root],
    },
    type: root.type,
    alternate: currentRoot,
    child: null,
    effectTag: undefined,
    parent: null,
    sibling: null,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

requestIdleCallback(workLoop);

export const React = { createElement, render };
