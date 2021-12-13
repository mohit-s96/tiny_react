const createElement = (
  type: string | Function,
  props: Record<string, any>,
  ...children: any
) => {
  props = {
    ...props,
    children,
  };
  return { type, props };
};
const React = { createElement };
const arr = [5, 6];
function Hello() {
  return <div>hi</div>;
}
export function test() {
  const App = (
    <div title="foo">
      Hello World <span>hi</span> ok
      <Hello />
      {arr.map((x) => (
        <p>{x}</p>
      ))}
    </div>
  );
  console.log(App);
}
