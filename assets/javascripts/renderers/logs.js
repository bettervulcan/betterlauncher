console.log("Loading renderer");

var pre = document.createElement("pre"),
  code = document.createElement("code");

pre.appendChild(code);
document.body.appendChild(pre);

function print(object) {
  const out = [];
  object.forEach((arg) => {
    if (typeof arg === "string") {
      out.push(arg);
    } else {
      out.push(JSON.stringify(arg));
    }
  });
  const span = document.createElement("span");
  const text = document.createTextNode(out.join(" ") + "\n");
  console.log(out.join(" "));

  span.appendChild(text);
  code.appendChild(span);

  scrollToBottom();
}

function scrollToBottom() {
  window.scrollTo(0, document.body.scrollHeight);
}

window.electron.log((event, ...logs) => {
  print(logs);
});
