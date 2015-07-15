var fs = require('fs');
var Sickbeard = require('node-sickbeard');
var _ = require('underscore');
var moment = require('moment');
var express = require('express');

export default (url, apikey) => {
	var sb = new Sickbeard({
		url: url,
		apikey: apikey,
		debug: true
	});

	// Given a list of shows, reduces the list to only the ones that were downloaded
    // after the supplied date.
    var filterDownloadedShows = (shows, lastSearchedDate) => _.filter(shows, (show) => show.status == "Downloaded" && moment(show.date).isAfter(lastSearchedDate));

    // Given a list of shows, reduces it to a hashmap where the key is the
    // name of the show and the value is an array of show objects.
    var getUniqueShows = (shows) => _.reduce(shows, (memo, show) => {
        if (!memo.hasOwnProperty(show.show_name)) {
            memo[show.show_name] = [];
        }
        memo[show.show_name].push(show);
        return memo;
    }, {});

    // Returns the last date/time a TV report was run.
    var getLastSearchDate = () => moment(config.test ? "Mar 9, 2014" : moment(fs.readFileSync(dateFilename, 'utf-8')));

    // Saves the current date and time to the last run text file. Subsequent
    // searches will only return shows downloaded after this date.
    var saveSearchDate = () => fs.writeFileSync(dateFilename, moment().toString());

	var router = express.Router();
	router.get('/tv', (req, res) => {
		sb.cmd('history', {}).then((results) => {
            res.send(getUniqueShows(filterDownloadedShows(results.data, getLastSearchDate())));
            saveSearchDate();
        }).catch((e) => res.status(500).send(e));
	});

	return router;
}