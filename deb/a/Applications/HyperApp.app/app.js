function print (data) {
  term.io.print(data);
};

function sigwinch () {
  // This was removed as in theory the next resize would also take care of it.
  // It looks like under certain scenarios there is a race condition under which different sizes are
  // sent through different events on hterm and here included. This ensures that we take care of the
  // event chain ourselves.
  var doc = term.getDocument();
  var screen = doc.getElementsByTagName("x-screen")[0];
  var width = document.documentElement.clientWidth;
  var height = document.documentElement.clientHeight;
  screen.style.width = width;
  screen.style.height = height;
  window.sendMessage({"type": "resized", "payload": {width: width, height: height}});
};

window.addEventListener('resize', sigwinch);

var increaseTermFontSize = function () {
  var size = term.getFontSize();
  setFontSize(++size);
}
var decreaseTermFontSize = function () {
  var size = term.getFontSize();
  setFontSize(--size);
}
var resetTermFontSize = function () {
  setFontSize(0);
}

var scaleTermStart = function () {
  this.fontSize = term.getFontSize();
}
var scaleTerm = function (scale) {
  if (scale > 2.0) scale = 2.0;
  if (scale < 0.5) scale = 0.5;
  setFontSize(Math.floor(this.fontSize * scale));
}
var setFontSize = function (size) {
  term.setFontSize(size);
  window.sendMessage({"type": "fontSizeChanged", "payload": {"size": term.getFontSize()}});
}

var setCursorBlink = function (state) {
  term.prefs_.set('cursor-blink', state);
}

var focusTerm = function () {
  term.onFocusChange_(true);
}

var blurTerm = function () {
  term.onFocusChange_(false);
}

var setWidth = function (columnCount) {
  term.setWidth(columnCount);
}

var clear = function () {
  term.clear();
}

var reset = function () {
  term.reset();
}

hterm.copySelectionToClipboard = function (document) {
  window.sendMessage({"type": "copy", "payload": document.getSelection().toString()});
};
