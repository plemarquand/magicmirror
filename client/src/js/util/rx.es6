import $ from 'jquery';
import Cycle from '@cycle/core';

export const request = (options) => $.ajax(options).promise();
export const interval = (time) => Cycle.Rx.Observable.interval(time).startWith(null);