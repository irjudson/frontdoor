var app = require('../../server')
  , assert = require('assert')
  , core = require('nitrogen-core')
  , request = require('request').defaults({jar: true});

describe('users endpoint', function() {
    it('should be able to proxy to registry server', function(done) {
        request.get(core.config.registry_internal_endpoint + '/user/login', function(err, resp, body) {
            assert(!err);
            assert.equal(resp.statusCode, 200);
            assert(body);

            done();
        });
    });
});
