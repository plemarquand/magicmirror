/** @jsx hJSX */
import moment from 'moment';
import { Rx } from '@cycle/core';
import { makeDOMDriver, hJSX } from '@cycle/dom';
import { interval, animator } from '../util/rx';
import { visibleState, rowCl } from '../util/view';

const INTERVAL = 1000;

const currentTime = () => moment().format('MMM Do, h:mma');

const view = ($state) => $state
  .map(state => (
  	<div className={rowCl(visibleState(state.active))}>{state.time}</div>
  ));

const model = (active$) => active$
  .map((active) => ({active, time: currentTime()}))
  .distinctUntilChanged();

const intent = (active$) => Rx.Observable.merge(interval(INTERVAL), active$)
  .flatMap(() => active$.take(1));

export default (responses) => {
  const active = responses.props.get('active')
  	.delayWithSelector((active) => Rx.Observable.timer(active ? 0 : animator.defaultDuration * 13));

  return {DOM: view(model(intent(active)))};
}