const fetch = require("node-fetch");

fetch("http://192.168.1.16:81/stream")
  .then((res) => console.log("STATUS:", res.status))
  .catch((err) => console.error("ERROR:", err));
