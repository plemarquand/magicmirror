import $ from 'jquery';
import Cycle from '@cycle/core';

const DEFAULT_DURATION = 50;
export const request = (options) => Cycle.Rx.Observable.fromPromise($.ajax(options).promise());
export const interval = (time) => Cycle.Rx.Observable.interval(time).startWith(null);
export const animator = (ticks, animateInterval = DEFAULT_DURATION, countdown = false) => Cycle.Rx.Observable.interval(animateInterval).map(i => countdown ? ticks - i - 1 : i).take(ticks);
export const defaultProp = (props, name, fallback) => props.get(name).startWith(fallback).debounce(50).first();

animator.DEFAULT_DURATION = DEFAULT_DURATION;

