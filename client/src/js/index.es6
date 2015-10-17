/** @jsx hJSX */
import moment from 'moment';
import SocketIO from 'cycle-socket.io';
import Cycle from '@cycle/core';
import { makeDOMDriver, hJSX } from '@cycle/dom';
import { interval, request } from './util/rx';
import { fullscreen } from './util/view';
import WeatherElement from './weather/index';
import ClockElement from './clock/index';
import MediaElement from './media/index';
import TodoElement from './todo/index';

const main = ({DOM, SocketIO}) => {
  console.log("fullscreen?", fullscreen);

  Cycle.Rx.Observable.fromEvent(document, 'click').take(1).subscribe(() => fullscreen());

  var socket$ = SocketIO.get('active').startWith(true);
  return ({
    SocketIO: socket$,
    DOM: socket$.map(active => (
      <div className='content'>
        <div className='top-left-content'>
          <media key='0' active={active}></media>
          <todo key='1' active={active}></todo>
        </div>
        <div className='top-right-content'>
          <clock key='2' className='current-time' active={active}></clock>
          <weather key='3' city='toronto' active={active}></weather>
        </div>

      </div>
    ))
  });
};

const drivers = {
  DOM: makeDOMDriver('.content', {
    'weather': WeatherElement,
    'clock': ClockElement,
    'media': MediaElement,
    'todo': TodoElement
  }),
  SocketIO: SocketIO.createSocketIODriver('http://localhost:8080')
};

const [requests, responses] = Cycle.run(main, drivers);