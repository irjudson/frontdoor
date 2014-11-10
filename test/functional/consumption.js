var app = require('../../server')
  , assert = require('assert')
  , core = require('nitrogen-core')
  , request = require('request').defaults({jar: true});

describe('consumption endpoint', function() {
    it('should be able to proxy to consumption server', function(done) {
        request.get(core.config.consumption_internal_endpoint + '/client/nitrogen.js', function(err, resp, body) {
            assert(!err);
            assert.equal(resp.statusCode, 200);

            done();
        });
    });
});