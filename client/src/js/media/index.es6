/** @jsx hJSX */
import moment from 'moment';
import { Rx } from '@cycle/core';
import { makeDOMDriver, hJSX } from '@cycle/dom';
import { interval, animator, request } from '../util/rx';
import { visibleState, rowCl } from '../util/view';

const INTERVAL = (60 * 60) * 1000;

const showsView = (shows, titles, tick) => titles.map((title, i) => (
  <div className={rowCl(visibleState(tick > i), 'media')}>
    <div className='num-shows'>{shows[title].length.toString()}</div>
    <div className='title'>{title}</div>
  </div>
));

const view = (state$) => state$
  .flatMap(({shows, active, date, titles, downloads}) => animator(titles.length + 2, !active)
    .map((tick) => ({date, shows, titles, tick, downloads})))
  .map((state) => (
    <div>
      <div className={rowCl(visibleState(state.tick >= 1), 'search-duration')}>
        {state.downloads.toString() + ' downloads in the last ' + moment().diff(moment(new Date(state.date)), 'days') + ' days'}
      </div>
      {showsView(state.shows, state.titles, state.tick - 1)}
    </div>
  ));

const calculateDownloads = (shows) => Object.keys(shows).reduce((memo, i) => memo + shows[i].length, 0);

const model = (active$) => Rx.Observable.combineLatest(
  active$,
  request({url: `/tv`}),
  (active, {shows, date}) => ({active, date, shows, titles: Object.keys(shows), downloads: calculateDownloads(shows)}))
  .distinctUntilChanged()

const intent = (active$) => Rx.Observable.merge(interval(INTERVAL), active$)
  .flatMap(() => active$.take(1));

export default (responses) => {
  const active = responses.props.get('active');
  return {DOM: view(model(intent(active)))};
}