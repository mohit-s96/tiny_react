export type ReactChildren = Array<
  string | ReactElement | Array<string | ReactElement>
>;
export interface ReactProps {
  children: ReactChildren;
  [x: string]: any;
}
export type ReactFunctionComponent = (props?: ReactProps) => JSX.Element;
export type ReactElement = {
  type: string | ReactFunctionComponent;
  props: ReactProps;
};
