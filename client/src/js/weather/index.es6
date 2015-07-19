/** @jsx dom */
const dom = (tag, attrs, ...children) => h(tag, attrs, children);

import moment from 'moment';
import Cycle from '@cycle/core';
import { makeDOMDriver, h } from '@cycle/web';
import { weatherIcon, beafortIcon, windDirectionIcon } from './utils';
import { request, interval, animator, defaultProp } from '../util/rx';
import { visibleState } from '../util/view';

const SCAN_INTERVAL = (60 * 5) * 1000;

const renderCurrentConditions = (weather, visible) => (
  <div className={'current row ' + visibleState(visible)}>
    <div>{Math.round(weather.main.temp).toString()}°</div>
    <div className={'wi ' + weatherIcon(weather)}></div>
  </div>
);

const renderWindConditions = (weather, visible) => (
  <div className={'current-sub row ' + visibleState(visible)}>
    <div>
      <span>{Math.round(weather.wind.speed).toString()}</span><sup> km/h</sup>
    </div>
    <div className={'wi ' + beafortIcon(weather)}></div>
    <div className={'wi ' + windDirectionIcon(weather)}></div>
  </div>
);

const renderForecast = (forecast, tick) => forecast.map((item, i) => (
  <div className={'forecast row ' + visibleState(tick > i)}>
    <div className='time'>{moment(item.dt * 1000).format('ha')}</div>
    <div className={'wi ' + weatherIcon(item)}></div>
    <div className='temp'>{Math.round(item.main.temp).toString()}°</div>
  </div>
));

const view = ($state) => $state
  .flatMap(({weather, forecast, active}) => animator(forecast.length + 2, animator.DEFAULT_DURATION, !active).map((tick) => ({weather, forecast, tick})))
  .map(({weather, forecast, tick}) => (
  <div className='weather'>
    {renderCurrentConditions(weather, tick > 0)}
    {renderWindConditions(weather, tick > 1)}
    {renderForecast(forecast, tick - 2)}
  </div>
));

const currentWeather = (city$) => city$
  .flatMap((city) => request({url: `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric`}))

const forecast = (city$, forecastSize$) => city$
  .flatMap((city) => request({url: `http://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric`}))
  .combineLatest(forecastSize$, (weather, forecastSize) => weather.list.slice(0, Math.min(weather.cnt, forecastSize)))

const model = (props$) => props$
  .flatMap(props => Cycle.Rx.Observable.zip(currentWeather(props.city), forecast(props.city, props.forecastSize), props.active, (weather, forecast, active) => ({weather, forecast, active}))
  .distinctUntilChanged())

const intent = (props) => props.active.distinctUntilChanged().map(() => props);

export default (responses) => {
  const props = {
    city: defaultProp(responses.props, 'city', 'toronto'),
    forecastSize: defaultProp(responses.props, 'forecastSize', 10),
    active: responses.props.get('active')
  };

  return {DOM: view(model(intent(props)))};
}