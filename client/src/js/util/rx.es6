import $ from 'jquery';
import { Rx } from '@cycle/core';

export const request = (options) => Rx.Observable.fromPromise($.ajax(options).promise());

export const interval = (time) => Rx.Observable.interval(time)
	.startWith(null);

export const defaultProp = (props, name, fallback) => props
	.get(name)
	.startWith(fallback)
	.debounce(50)
	.first();

const DEFAULT_DURATION = 50;
export const animator = (ticks, animateInterval = DEFAULT_DURATION, countdown = false) => Rx.Observable.interval(typeof animateInterval === 'boolean' ? DEFAULT_DURATION : animateInterval)
	.map(i => (typeof animateInterval === 'boolean' ? animateInterval : countdown) ? ticks - i - 1 : i)
	.take(ticks);

animator.defaultDuration = DEFAULT_DURATION;