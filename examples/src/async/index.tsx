import React from "../../../src";

const useFetch = (path: string) => {
  const [status, setStatus] = React.useState(0);
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    fetch(path)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setData(
          data.data.children.map((x) => ({
            title: x.data.title,
            link: x.data.permalink,
          }))
        );
        setStatus(1);
      })
      .catch((err) => {
        setStatus(2);
        console.log(err);
      });
  }, []);

  return [status, data];
};

const App = () => {
  const [status, data] = useFetch("https://www.reddit.com/.json");

  return (
    <div>
      <h1>reddit home page</h1>
      {status === 0 ? (
        <p>Loading</p>
      ) : status === 1 ? (
        data.map((x) => (
          <p>
            <a target="_blank" href={`https://reddit.com${x.link}`}>
              {x.title}
            </a>
          </p>
        ))
      ) : status === 2 ? (
        <p>error</p>
      ) : null}
    </div>
  );
};

export default App;
