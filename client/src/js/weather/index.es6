/** @jsx dom */
const dom = (tag, attrs, ...children) => h(tag, attrs, children);

import moment from 'moment';
import Cycle from '@cycle/core';
import { makeDOMDriver, h } from '@cycle/web';
import { weatherIcon, beafortIcon, windDirectionIcon } from './utils';
import { request, interval } from '../util/rx';

const SCAN_INTERVAL = (60 * 5) * 1000;

const renderCurrentConditions = (weather) => (
  <div className='current row'>
    <div>{Math.round(weather.main.temp).toString()}°</div>
    <div className={'wi ' + weatherIcon(weather)}></div>
  </div>
);

const renderWindConditions = (weather) => (
  <div className='current-sub row'>
    <div>
      <span>{Math.round(weather.wind.speed).toString()}</span><sup>km/h</sup>
    </div>
    <div className={'wi ' + beafortIcon(weather)}></div>
    <div className={'wi ' + windDirectionIcon(weather)}></div>
  </div>
);

const renderForecast = (forecast) => forecast.map((item) => (
  <div className='forecast row'>
    <div className='time'>{moment(item.dt * 1000).format('ha')}</div>
    <div className={'wi ' + weatherIcon(item)}></div>
    <div className='temp'>{Math.round(item.main.temp).toString()}°</div>
  </div>
));

const view = ($state) => $state.map(({weather, forecast}) => (
  <div className='weather'>
    {renderCurrentConditions(weather)}
    {renderWindConditions(weather)}
    {renderForecast(forecast)}
  </div>
));

const currentWeather = (city$) => city$
  .flatMap((city) => request({url: `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric`}))

const forecast = (city$) => city$
  .flatMap((city) => request({url: `http://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric`}))
  .map(weather => weather.list.slice(0, Math.min(weather.cnt, 6)))

const model = (city$) => Cycle.Rx.Observable.combineLatest(currentWeather(city$), forecast(city$), (weather, forecast) => ({weather, forecast}));

const intent = (city$) => interval(SCAN_INTERVAL).flatMap(() => city$)

export default (responses) => {
  const city = responses.props.get('city').startWith('new york').debounce(50).first();

  return {DOM: view(model(intent(city)))}
}