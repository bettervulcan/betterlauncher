console.log("Loading renderer");

let backup = console;

var pre = document.createElement("pre"),
  code = document.createElement("code");

pre.appendChild(code);
document.body.appendChild(pre);

function print(object) {
  var s = typeof object === "string" ? object : JSON.stringify(object),
    span = document.createElement("span"),
    text = document.createTextNode(s + "\n");
  backup.log(s);

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
