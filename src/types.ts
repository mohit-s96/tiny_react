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
export type Fiber = {
  type?: string | ReactFunctionComponent;
  dom?: HTMLElement | null;
  props?: ReactProps;
  parent?: Fiber;
  sibling?: Fiber;
  child?: Fiber;
  alternate?: Fiber | null;
  effectTag?: "UPDATE" | "PLACEMENT" | "DELETION";
};
