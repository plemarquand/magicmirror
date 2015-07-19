/** @jsx dom */
const dom = (tag, attrs, ...children) => h(tag, attrs, children);

import moment from 'moment';
import Cycle from '@cycle/core';
import { makeDOMDriver, h } from '@cycle/web';
import { interval, animator } from '../util/rx';
import { visibleState } from '../util/view';

const INTERVAL = 1000;
const currentTime = () =>  moment().format('MMM Do, h:mma');

const view = ($state) => $state
  .map(state => (
  	<div className={'row ' + visibleState(state.active)}>{state.time}</div>
  ));

const model = (active$) => active$
  .map((active) => ({active, time: currentTime()}))
  .distinctUntilChanged();

const intent = (active$) => Cycle.Rx.Observable.merge(interval(INTERVAL), active$)
  .flatMap(() => active$.take(1));

export default (responses) => {
  const active = responses.props.get('active')
  	.delayWithSelector((active) => Cycle.Rx.Observable.timer(active ? 0 : 900));

  return {DOM: view(model(intent(active)))};
}