const five = require('johnny-five');
const debouncer = require('../util/debouncer');
const timecop = require('../util/timecop');

export default (callback, proximitySensorPin = 10) => {

  const isMorning = timecop(7, 10); // only trigger between 7 and 10
  const debouncedProcess = debouncer((value) => {
    const now = moment();
    console.log('value!', value);

    // Leaving in the morning, we get 1
    if (value === 1 && isMorning(now)) {
      state = true;
      callback(null, state);
    } else {
      state = false;
      callback(null, state);
    }
  }, 500);

  const board = new five.Board();
  board.on('message', (event) => console.log(event.message));
  board.on('warn', (event) => console.warn(event.message));
  board.on('fail', (event) => callback(event.message));
  board.on('ready', () => {
    this.pinMode(PROXIMITY_SENSOR_PIN, five.Pin.INPUT);
    this.digitalRead(PROXIMITY_SENSOR_PIN, debouncedProcess);
  });
};