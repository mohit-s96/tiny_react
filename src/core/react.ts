import {
  Fiber,
  ReactAPI,
  ReactChildren,
  ReactElement,
  ReactFunctionComponent,
  StateSetter,
  SetStateWithCallback,
  FiberHooks,
  EffectCallback,
} from "./types";
import { updateDom, commitDeletion, createDom } from "./dom";
import { createElement } from "./utils";

let nextUnitOfWork: Fiber | null = null;
let wipRoot: Fiber | null = null;
let currentRoot: Fiber | null = null;
let deletions: Array<Fiber> | null = null;
let appRoot: Fiber | null = null;

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
export function getRootFIber() {
  return currentRoot;
}
export function getFiberFromDomNode(
  fiber: Fiber | null,
  dom: HTMLElement
): Fiber | null {
  if (!fiber) return null;
  if (fiber.dom === dom) {
    return fiber;
  }
  return (
    getFiberFromDomNode(fiber.child, dom) ||
    getFiberFromDomNode(fiber.sibling, dom)
  );
}

function commitRoot() {
  deletions?.forEach(commitWork);
  commitWork(wipRoot!.child);
  currentRoot = wipRoot;
  wipRoot = null;
  deletions = [];
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

  if (
    fiber.effectTag === "PLACEMENT" &&
    fiber.dom !== null &&
    fiber.type !== "NULL"
  ) {
    domParent?.appendChild(fiber.dom!);
  } else if (
    fiber.effectTag === "UPDATE" &&
    fiber.dom &&
    fiber.type !== "NULL"
  ) {
    updateDom(fiber.dom, fiber.alternate!.props!, fiber.props!);
  } else if (fiber.effectTag === "DELETION" && fiber.type !== "NULL") {
    commitDeletion(fiber, domParent);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

let wipFiber: Fiber | null = null;
let hookIdx: number | null = null;

function useEffect(callback: EffectCallback, dependency?: Array<any>) {
  if (!(callback instanceof Function)) {
    throw new Error("first argument to useEffect wasn't a function");
  }
  const oldHook =
    wipFiber!.alternate &&
    wipFiber!.alternate.hooks &&
    wipFiber!.alternate.hooks[hookIdx!];

  const hook: FiberHooks = {
    state: dependency,
  };
  if (!dependency) {
    const cleanup = callback();
    hook.cleanup = cleanup!;
    wipFiber?.hooks?.push(hook);
    hookIdx!++;
    return;
  }

  let shouldCallCallback = false;

  let cleanup: Function | void;
  if (!oldHook) {
    cleanup = callback();
  } else {
    (oldHook?.state as Array<any>).forEach((x, i) => {
      if (hook.state[i] !== x) {
        shouldCallCallback = true;
      }
    });

    if (shouldCallCallback) {
      cleanup = callback();
    }
  }
  if (cleanup) {
    hook.cleanup = cleanup;
  }
  wipFiber?.hooks?.push(hook);
  hookIdx!++;
}

function useState<T>(initial: T): [T, StateSetter<T>] {
  const oldHook =
    wipFiber!.alternate &&
    wipFiber!.alternate.hooks &&
    wipFiber!.alternate.hooks[hookIdx!];
  const hook: FiberHooks = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
    ref: wipFiber,
  };

  const actions = oldHook ? oldHook.queue : [];
  actions!.forEach((action) => {
    if (action instanceof Function) {
      hook.state = action(hook.state);
    } else {
      hook.state = action;
    }
  });

  const setState = <T>(action: T | SetStateWithCallback<T>) => {
    // debugger;
    if (!currentRoot) {
      console.error(
        "WARNING:",
        "setState was called during initial render. This might happen when you call your state setter function inside JSX instead of passing it as a callback"
      );
      return;
    }
    hook.queue!.push(action);
    appRoot = currentRoot;
    wipRoot = {
      dom: hook.ref!.dom,
      alternate: hook.ref!,
      props: hook.ref!.props,
      child: null,
      parent: hook.ref!.parent,
      sibling: null,
      type: hook.ref!.type,
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
  if (!fiber.dom && fiber.type !== "NULL") {
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

    if (element.type === "NULL") {
      newFiber = {
        type: element.type,
        dom: null,
        props: element.props,
        parent: fiber,
        alternate: null,
        child: null,
        sibling: null,
      };
    }

    if (oldFiber && !sametype) {
      oldFiber.effectTag = "DELETION";
      runCleanups(oldFiber.hooks);
      recursiveMarkForDeletion(oldFiber.child);
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

function runCleanups(hooks?: FiberHooks[]) {
  if (!hooks) return;
  hooks.forEach((hook) => {
    if (hook.cleanup instanceof Function) {
      hook.cleanup();
    }
  });
}

function recursiveMarkForDeletion(fiber: Fiber | null) {
  if (!fiber) return;

  fiber.effectTag = "DELETION";
  runCleanups(fiber.hooks);

  recursiveMarkForDeletion(fiber.child);
  recursiveMarkForDeletion(fiber.sibling);
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

export const React: ReactAPI = { createElement, render, useState, useEffect };
