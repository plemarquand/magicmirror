export default (callback, sensitivity = 70) => {
  var lastState, lastSent, timeout = false;

  return (value) => {
    if (timeout !== false) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      timeout = false;

      if (lastState != lastSent) {
        callback(lastState);
      }

      lastSent = lastState;
    }, sensitivity);

    lastState = value;
  }
};