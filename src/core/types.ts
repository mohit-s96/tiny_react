export type ReactChildren = Array<ReactElement | Array<ReactElement>>;
export interface ReactProps {
  children: ReactChildren;
  [x: string]: any;
}
export type ReactFunctionComponent = (props?: ReactProps) => JSX.Element;
export type ReactElement = {
  type: string | ReactFunctionComponent;
  props: ReactProps;
};
export type FiberHooks = {
  state: any;
  queue?: Array<any | SetStateWithCallback<any>>;
  ref?: Fiber | null;
};
export type CreateElement = (
  type: string | ReactFunctionComponent,
  props: ReactProps,
  ...children: ReactChildren
) => ReactElement;
export type Render = (root: ReactElement, domNode: HTMLElement) => void;
export type SetStateWithCallback<T> = (state: T) => any;
export type StateSetter<T> = (state: T | SetStateWithCallback<T>) => any;
export type useState = <T>(initial: T) => [T, StateSetter<T>];
export type useEffect = (callback: Function, dependency?: Array<any>) => any;
export type ReactAPI = {
  createElement: CreateElement;
  render: Render;
  useState: useState;
  useEffect: useEffect;
};
export type Fiber = {
  type: string | ReactFunctionComponent;
  dom: HTMLElement | null;
  props: ReactProps;
  parent: Fiber | null;
  sibling: Fiber | null;
  child: Fiber | null;
  alternate: Fiber | null;
  hooks?: Array<FiberHooks>;
  effectTag?: "UPDATE" | "PLACEMENT" | "DELETION";
};
