import {
  Fiber,
  ReactAPI,
  ReactChildren,
  ReactElement,
  ReactFunctionComponent,
  StateSetter,
  SetStateWithCallback,
  FiberHooks,
} from "./types";
import { updateDom, commitDeletion, createDom } from "./dom";
import { createElement } from "./utils";

let nextUnitOfWork: Fiber | null = null;
let wipRoot: Fiber | null = null;
let currentRoot: Fiber | null = null;
let deletions: Array<Fiber> | null = null;

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

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

let wipFiber: Fiber | null = null;
let hookIdx: number | null = null;

function useState<T>(initial: T): [T, StateSetter<T>] {
  const oldHook =
    wipFiber!.alternate &&
    wipFiber!.alternate.hooks &&
    wipFiber!.alternate.hooks[hookIdx!];
  const hook: FiberHooks = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  };

  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action) => {
    if (action instanceof Function) {
      hook.state = action(hook.state);
    } else {
      hook.state = action;
    }
  });

  const setState = <T>(action: T | SetStateWithCallback<T>) => {
    if (!currentRoot) {
      console.error(
        "WARNING:",
        "setState was called during initial render. This might happen when you call your state setter function inside JSX instead of passing it as a callback"
      );
      return;
    }
    hook.queue.push(action);
    wipRoot = {
      dom: currentRoot.dom,
      alternate: currentRoot,
      props: currentRoot.props,
      child: null,
      parent: null,
      sibling: null,
      type: currentRoot.type,
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
  };
  wipFiber?.hooks?.push(hook);
  hookIdx!++;
  return [hook.state, setState];
}

function updateFunctionComponent(fiber: Fiber) {
  wipFiber = fiber;
  hookIdx = 0;
  wipFiber.hooks = [];
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
  const children = fiber.props!.children.reduce(
    (acc, child) =>
      //@ts-ignore
      Array.isArray(child) ? [...acc, ...child] : [...acc, child],
    []
  );

  //@ts-ignore
  reconcileChildren(fiber, children);
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
    props: root.props,
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

export const React: ReactAPI = { createElement, render, useState };
