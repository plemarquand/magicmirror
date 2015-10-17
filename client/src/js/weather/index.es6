/** @jsx hJSX */
import moment from 'moment';
import { Rx } from '@cycle/core';
import { makeDOMDriver, hJSX } from '@cycle/dom';
import { weatherIcon, beafortIcon, windDirectionIcon } from './utils';
import { request, interval, animator, defaultProp } from '../util/rx';
import { visibleState, classList, rowCl } from '../util/view';

const round = (n) => Math.round(n).toString();
const weather = (type, city) => request({url: `/weather/${type}?q=${city}&units=metric`}).map(JSON.parse);
const weatherForecast = weather.bind(null, 'forecast');
const weatherCurrent = weather.bind(null, 'weather');
const wiCl = classList.bind(null, 'wi');

const renderCurrentConditions = (weather, visible) => (
  <div className={rowCl(visibleState(visible), 'current')}>
    <div>{round(weather.main.temp)}°</div>
    <div className={wiCl(weatherIcon(weather))}></div>
  </div>
);

const renderWindConditions = (weather, visible) => (
  <div className={rowCl(visibleState(visible), 'current-sub')}>
    <div>
      <span>{round(weather.wind.speed)}</span><sup> km/h</sup>
    </div>
    <div className={wiCl(beafortIcon(weather))}></div>
    <div className={wiCl(windDirectionIcon(weather))}></div>
  </div>
);

const renderForecast = (forecast, tick) => forecast.map((item, i) => (
  <div className={rowCl(visibleState(tick > i), 'forecast')}>
    <div className='time'>{moment(item.dt * 1000).format('h a')}</div>
    <div className={wiCl(weatherIcon(item))}></div>
    <div className='temp'>{round(item.main.temp)}°</div>
  </div>
));

const view = ($state) => $state
  .flatMap(({weather, forecast, active}) => animator(forecast.length + 2, !active).map((tick) => ({weather, forecast, tick})))
  .map(({weather, forecast, tick}) => (
  <div className='weather'>
    {renderCurrentConditions(weather, tick > 0)}
    {renderWindConditions(weather, tick > 1)}
    {renderForecast(forecast, tick - 2)}
  </div>
));

const currentWeather = (city$) => city$
  .flatMap(weatherCurrent);

const forecast = (city$, forecastSize$) => city$
  .flatMap(weatherForecast)
  .do(r => console.log("RRR", r))
  .combineLatest(forecastSize$, (weather, forecastSize) => weather.list.slice(0, Math.min(weather.cnt, forecastSize)));

const model = (props$) => props$
  .flatMap(props => Rx.Observable.zip(
    currentWeather(props.city),
    forecast(props.city, props.forecastSize),
    props.active,
    (weather, forecast, active) => ({weather, forecast, active})
  )
  .distinctUntilChanged());

const intent = (props) => props.active.distinctUntilChanged()
  .map(() => props);

export default (responses) => {
  const props = {
    city: defaultProp(responses.props, 'city', 'toronto'),
    forecastSize: defaultProp(responses.props, 'forecastSize', 10),
    active: responses.props.get('active')
  };

  return {DOM: view(model(intent(props)))};
};