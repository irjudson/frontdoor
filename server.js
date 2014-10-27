var core = require('nitrogen-core')
  , http = require('http')
  , nodeHttpProxy = require('http-proxy')
  , io = require('socket.io');

core.config = require('./config');
core.log = require('winston');

var httpProxy = nodeHttpProxy.createProxyServer({});
var wsProxy = nodeHttpProxy.createProxyServer({
    ws: true,
    target: {
        host: 'localhost',
        port: 3053
    }
});

httpProxy.on('error', function (err, req, res) {
    core.log.error('proxy error: ' + err);
});

var endpoints = {
    endpoints: {
        api_keys: core.config.api_keys_endpoint,
        blobs: core.config.blobs_endpoint,
        messages: core.config.messages_endpoint,
        permissions: core.config.permissions_endpoint,
        principals: core.config.principals_endpoint,
        subscriptions: core.config.subscriptions_endpoint,
        users: core.config.users_endpoint
    }
};

if (core.config.blob_provider) {
    endpoints.endpoints.blobs = core.config.blobs_endpoint;
}

if (core.config.images_endpoint) {
    endpoints.endpoints.images = core.config.images_endpoint;
}

var urlMatchesRules = function(url, paths) {
    var idx;
    for (idx = 0; idx < paths.length; idx++) {
        if (core.utils.stringStartsWith(url, paths[idx])) {
            return true;
        }
    }

    return false;
}

var server = http.createServer(function(req, res) {
    // proxy request to correct server cluster
    if (urlMatchesRules(req.url, core.config.ingestion_url_rules) && req.method === "POST") {
        core.log.info('redirecting to ingestion server: ' + req.url);

        httpProxy.web(req, res, { target: core.config.ingestion_internal_endpoint });
    } else if (urlMatchesRules(req.url, core.config.registry_url_rules)) {
        core.log.info('redirecting to registry server: ' + req.url);

        httpProxy.web(req, res, { target: core.config.registry_internal_endpoint });
    } else if (urlMatchesRules(req.url, core.config.consumption_url_rules)) {
        core.log.info('redirecting to consumption server: ' + req.url);

        httpProxy.web(req, res, { target: core.config.consumption_internal_endpoint });
    } else if (urlMatchesRules(req.url, [ core.config.headwaiter_path ])) {
        res.writeHead(200, {
            'Content-Type': 'application/json'
        });

        res.write(new Buffer(JSON.stringify(endpoints)));
        res.end();
    } else if (urlMatchesRules(req.url, [ "/socket.io" ])) {
        // HTTP socket.io
        httpProxy.web(req, res, { target: core.config.consumption_internal_endpoint });
    } else {
        core.log.info('Unknown endpoint requested: ' + req.url);
        res.writeHead(404);
        res.end();
    }
});

server.on('upgrade', function (req, socket, head) {
    wsProxy.ws(req, socket, head);
});

server.listen(core.config.internal_port);
core.log.info('frontdoor server listening on ' + core.config.internal_port);
