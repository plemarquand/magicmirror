/** @jsx dom */
const dom = (tag, attrs, ...children) => h(tag, attrs, children);

import moment from 'moment';
import Cycle from '@cycle/core';
import { makeDOMDriver, h } from '@cycle/web';
import WeatherElement from './weather/index';
import { interval, request } from './util/rx';

const time = interval(1000).map(() => moment().format('MMM Do, h:mma'))

Cycle.Rx.Observable.fromPromise(request('http://localhost:8080/tv')).subscribe((x) => console.log("XX?", x));

const main = (drivers) => ({
  DOM: time.map((time) =>
    (<div className='top-right-content'>
      <div className='current-time row'>{time}</div>
      <weather key='1' city='toronto'></weather>
    </div>))
});

const drivers = {
  DOM: makeDOMDriver('.content', {
    'weather': WeatherElement
  })
};

const [requests, responses] = Cycle.run(main, drivers);