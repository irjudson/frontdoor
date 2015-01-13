var assert = require('assert')
  , core = require('nitrogen-core')
  , request = require('request');

describe('headwaiter endpoint', function() {
    it('should return headwaiter json', function(done) {
        request.get({
            url: core.config.headwaiter_uri,
            json: true
        }, function(err,resp,body) {
            assert(!err);
            assert.equal(resp.statusCode, 200);

            assert(body.endpoints);

            assert.equal(core.utils.stringEndsWith(body.endpoints.api_keys, "/api_keys"), true);
            assert.equal(core.utils.stringEndsWith(body.endpoints.blobs, "/blobs"), true);
            assert(body.endpoints.images);
            assert.equal(core.utils.stringEndsWith(body.endpoints.messages, "/messages"), true);
            assert.equal(core.utils.stringEndsWith(body.endpoints.permissions, "/permissions"), true);
            assert.equal(core.utils.stringEndsWith(body.endpoints.principals, "/principals"), true);
            assert(body.endpoints.subscriptions);
            assert.equal(core.utils.stringEndsWith(body.endpoints.users, "/user"), true);

            done();
        });
    });
});
