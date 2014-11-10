var async = require('async')
  , assert = require('assert')
  , server = require('../server')
  , core = require('nitrogen-core');

var removeAll = function (modelType, callback) {
    modelType.remove({}, callback);
};

before(function(done) {
    done();
});
