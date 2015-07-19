/** @jsx dom */
const dom = (tag, attrs, ...children) => h(tag, attrs, children);

import moment from 'moment';
import SocketIO from 'cycle-socket.io';
import Cycle from '@cycle/core';
import { makeDOMDriver, h } from '@cycle/web';
import { interval, request } from './util/rx';
import WeatherElement from './weather/index';
import ClockElement from './clock/index';
import MediaElement from './media/index';

const main = ({DOM, SocketIO}) => {
  var socket$ = SocketIO.get('active').startWith(true);
  return ({
    SocketIO: socket$,
    DOM: socket$.map(active => (
      <div className='content'>
        <div className='top-left-content'>
          <media key='0' active={active}></media>
        </div>
        <div className='top-right-content'>
          <clock key='1' className='current-time' active={active}></clock>
          <weather key='2' city='toronto' active={active}></weather>
        </div>
      </div>
    ))
  });
};

const drivers = {
  DOM: makeDOMDriver('.content', {
    'weather': WeatherElement,
    'clock': ClockElement,
    'media': MediaElement
  }),
  SocketIO: SocketIO.createSocketIODriver("http://localhost:8080")
};

const [requests, responses] = Cycle.run(main, drivers);