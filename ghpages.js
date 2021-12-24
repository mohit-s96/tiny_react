const fs = require("fs");
const ghpages = require("gh-pages");

readWriteSync();

ghpages.publish("examples/dist", function (err) {
if (err) {
    console.log(err);
} else {
    console.log("Success");
}
});
function readWriteSync() {
  try {
    let data = fs.readFileSync("examples/dist/index.html", "utf-8");

    let newValue = data.replace(/="\//gm, '="');

    fs.writeFileSync("dist/index.html", newValue, "utf-8");

    console.log("Updated index.html");
  } catch (e) {
    console.log(e);
  }
}