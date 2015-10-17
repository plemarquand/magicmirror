/** @jsx hJSX */
import moment from 'moment';
import { Rx } from '@cycle/core';
import { makeDOMDriver, hJSX } from '@cycle/dom';
import { interval, animator, request } from '../util/rx';
import { visibleState, rowCl } from '../util/view';

const INTERVAL = (1000 * 60) * 30; // 30min refresh interval

const renderTodos = (items, tick) => items.map((item, i) => (
  <div className={rowCl(visibleState(tick > i), 'todo')}>
  	<div className='wi wi-meteor wi-flip-horizontal'></div>
    <div className='content'>{item.content}</div>
  </div>
));

const view = ($state) => $state
  .flatMap(({active, todos}) => animator(todos.length + 1, !active).map((tick) => ({active, todos, tick})))
  .map(({todos, tick}) => (
  	<div className='todos'>
    	{renderTodos(todos, tick > 0)}
    </div>
  ));

const model = (active$) => Rx.Observable.combineLatest(
  active$,
  request({url: `/todo/today`}),
  (active, todos) => ({active, todos}))
  .distinctUntilChanged();

const intent = (active$) => Rx.Observable.merge(interval(INTERVAL), active$)
  .flatMap(() => active$.take(1));

export default (responses) => {
  const active = responses.props.get('active')
  	.delayWithSelector((active) => Rx.Observable.timer(active ? 0 : animator.defaultDuration * 14));

  return {DOM: view(model(intent(active)))};
}