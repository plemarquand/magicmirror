/** @jsx dom */
const dom = (tag, attrs, ...children) => h(tag, attrs, children);

import moment from 'moment';
import Cycle from '@cycle/core';
import { makeDOMDriver, h } from '@cycle/web';
import { interval, animator, request } from '../util/rx';
import { visibleState } from '../util/view';

const INTERVAL = (60 * 60) * 1000;
const showsView = (shows, titles, tick) => titles.map((title, i) => (
  <div className={'row media ' + visibleState(tick > i)}>
  	<div className='num-shows'>{shows[title].length.toString()}</div>
  	<div className='title'>{title}</div>
  </div>
));

const view = (state$) => state$
  .flatMap(({shows, active, date, titles}) => animator(titles.length + 2, animator.DEFAULT_DURATION, !active)
  	.map((tick) => ({date, shows, titles, tick})))
  .map((state) => (
  	<div>
  		{showsView(state.shows, state.titles, state.tick)}
      <div className={'row search-duration ' + visibleState(state.tick >= state.titles.length + 1)}>
        {'Last ' + moment().diff(moment(new Date(state.date)), 'days') + ' days'}
      </div>
  	</div>
  ));

const model = (active$) => Cycle.Rx.Observable.combineLatest(
  active$,
  request({url: `http://localhost:8080/tv`}),
  (active, {shows, date}) => ({active, date, shows, titles: Object.keys(shows)}))
  .distinctUntilChanged()

const intent = (active$) => Cycle.Rx.Observable.merge(interval(INTERVAL), active$)
  .flatMap(() => active$.take(1));

export default (responses) => {
  const active = responses.props.get('active');
  return {DOM: view(model(intent(active)))};
}