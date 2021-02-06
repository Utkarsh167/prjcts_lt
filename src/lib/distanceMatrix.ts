'use strict';

let qs = require('querystring'),
    request = require('request');

let DISTANCE_API_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json?';

const GoogleDistance = function() {
  this.apiKey = 'AIzaSyBcBQu4CmxoM7mOEobNEPZAiv6sh_9spJ0';
  // this.businessClientKey = '';
  // this.businessSignatureKey = '';
};

GoogleDistance.prototype.get = function(args, callback) {
  let self = this;
  let options = formatOptions.call(this, args);
  fetchData(options, function(err, data) {
    if (err) return callback(err);
    formatResults(data, options, function(err, results) {
      // console.log("========================mmmm=================" + JSON.stringify(results));
      if (err) return callback(err);
      return callback(null, results);
    });
  });
};

let formatOptions = function(args) {
  let options: any = {
    index: args.index || null,
    origins: args.origin,
    destinations: args.destination,
    mode: args.mode || 'driving',
    units: args.units || 'metric',
    language: args.language || 'en',
    avoid: args.avoid || null,
    sensor: args.sensor || false,
    key: this.apiKey
  };

  if (!args.origin && args.origins) {
    options.origins = args.origins.join('|');
    options.batchMode = true;
  }
  if (!args.destination && args.destinations) {
    options.destinations = args.destinations.join('|');
    options.batchMode = true;
  }

  if (this.businessClientKey && this.businessSignatureKey) {
    delete options.key;
    options.client = this.businessClientKey;
    options.signature = this.businessSignatureKey;
  }
  if (!options.origins) {
    throw new Error('Argument Error: Origin is invalid');
  }
  if (!options.destinations) {
    throw new Error('Argument Error: Destination is invalid');
  }
  return options;
};

let formatResults = function(data, options, callback) {
  let formatData = function (element) {
    return {
      index: options.index,
      distance: element.distance.text,
      distanceValue: element.distance.value,
      duration: element.duration.text,
      durationValue: element.duration.value,
      origin: element.origin,
      destination: element.destination,
      mode: options.mode,
      units: options.units,
      language: options.language,
      avoid: options.avoid,
      sensor: options.sensor
    };
  };

  let requestStatus = data.status;
  if (requestStatus !== 'OK') {
    return callback(new Error('Status error: ' + requestStatus + ': ' + data.error_message));
  }
  let results = [];

  for (let i = 0; i < data.origin_addresses.length; i++) {
    for (let j = 0; j < data.destination_addresses.length; j++) {
      let element = data.rows[i].elements[j];
      let resultStatus = element.status;
      if (resultStatus !== 'OK') {
        return callback(new Error('Result error: ' + resultStatus));
      }
      element.origin = data.origin_addresses[i];
      element.destination = data.destination_addresses[j];

      results.push(formatData(element));
    }
  }

  if (results.length === 1 && !options.batchMode) {
    results = results[0];
  }
  return callback(null, results);
};

let fetchData = function(options, callback) {
  request(DISTANCE_API_URL + qs.stringify(options), function (err, res, body) {
    if (!err && res.statusCode === 200) {
      let data = JSON.parse(body);
      callback(null, data);
    } else {
      callback(new Error('Request error: Could not fetch data from Google\'s servers: ' + body));
    }
  });
};

export let distancematrix = new GoogleDistance();

// module.exports = new GoogleDistance();