'use strict';
var moment = require('moment');

export default (startDate, endDate) => {
    var isNumber = (n) => !isNaN(parseFloat(n)) && isFinite(n);

    return (date) => {
        var testDate = moment(date);
        var start = isNumber(startDate) ? moment().hour(startDate).minute(0).second(0) : startDate;
        var end = isNumber(endDate) ? moment().hour(endDate).minute(0).second(0) : endDate;
        return testDate.isAfter(start) && testDate.isBefore(end);
    };
};