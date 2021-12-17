import {
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
    children,
  };
  return { type, props };
};

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

function render(root: ReactElement | string, domNode: HTMLElement) {
  // our render function will just render plain strings as well as react elements

  if (typeof root === "string") {
    domNode.appendChild(document.createTextNode(root));
    return;
  }

  // if the ReactElement is not a Function component, we create a new dom node of that type and
  // recursively render all the children in that dom node

  if (typeof root.type === "string") {
    const node = document.createElement(root.type);
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

    renderChildren(root.props.children, node);

    // append the last created node in the current parent node

    domNode.appendChild(node);
  }

  // if the ReactElement is a functional component we call it with the props to get the ReactElement it returns
  else if (root.type instanceof Function) {
    const element = root.type(root.props);

    // account for fragments. if type is undefined then element is a fragment and we render all it's children
    // as the children of the current parent [domNode]

    if (element.type === undefined) {
      renderChildren(element.props.children, domNode);
      return;
    }

    // otherwise we render the new element
    render(element, domNode);
  } else {
    return;
  }
}

export const React = { createElement, render };
