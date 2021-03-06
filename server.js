var core = require('nitrogen-core')
  , fs = require('fs')
  , http = require('http')
  , nodeHttpProxy = require('http-proxy')
  , io = require('socket.io')
  , request = require('request')
  , url = require('url');

core.config = require('./config');
core.log = require('winston');

var serverOptions = {};

var urlParts = url.parse(core.config.consumption_internal_ws_endpoint);

var httpProxy = nodeHttpProxy.createProxyServer(serverOptions);
var wsProxy = nodeHttpProxy.createProxyServer({
    ws: true,
    target: {
        host: urlParts.hostname,
        port: urlParts.port
    }
});

httpProxy.on('error', function (err, req, res) {
    core.log.error('proxy error: ' + err);
});

var endpoints = {
    endpoints: {
        api_keys: core.config.api_keys_endpoint,
        blobs: core.config.blobs_endpoint,
        images: core.config.images_endpoint,
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
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.writeHead(200);
        return res.end();
    }

    // proxy request to correct server cluster
    if (urlMatchesRules(req.url, core.config.ingestion_url_rules) && req.method === "POST") {
        core.log.info('ingestion server endpoint: ' + core.config.ingestion_internal_endpoint);
        core.log.info('redirecting ' + req.method + ' to ingestion server: ' + req.url);

        httpProxy.web(req, res, { target: core.config.ingestion_internal_endpoint });
    } else if (urlMatchesRules(req.url, core.config.registry_url_rules)) {
        core.log.info('registry server endpoint: ' + core.config.registry_internal_endpoint);
        core.log.info('redirecting ' + req.method + ' to registry server: ' + req.url);

        httpProxy.web(req, res, { target: core.config.registry_internal_endpoint });
    } else if (urlMatchesRules(req.url, [ core.config.headwaiter_path ])) {
        core.log.info('serving ' + req.url);
        res.writeHead(200, {
            'Content-Type': 'application/json'
        });

        res.write(new Buffer(JSON.stringify(endpoints)));
        res.end();
    } else {
        core.log.info('consumption server endpoint: ' + core.config.consumption_internal_endpoint);
        core.log.info('redirecting ' + req.method + ' to consumption server: ' + req.url);

        httpProxy.web(req, res, { target: core.config.consumption_internal_endpoint });
    }
});

server.on('upgrade', function (req, socket, head) {
    wsProxy.ws(req, socket, head);
});

server.on('error', function(e) {
    core.log.error('frontdoor proxying error: ' + e);
});

server.listen(core.config.internal_port);
core.log.info('frontdoor server listening on ' + core.config.internal_port);
