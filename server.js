var core = require('nitrogen-core')
  , fs = require('fs')
  , http = require('http')
  , nodeHttpProxy = require('http-proxy')
  , io = require('socket.io')
  , url = require('url');

core.config = require('./config');
core.log = require('winston');

var serverOptions = {};
core.log.info('external port: ' + core.config.external_port);

if (core.config.external_port === 443) {
    core.log.info('initializing ssl');
    var cert = fs.readFileSync('../certs/' + core.config.host + '.chained.crt', 'utf8');
    core.log.info('ssl cert: ' + cert);
    var key = fs.readFileSync('../certs/' + core.config.host + '.key', 'utf8');
    core.log.info('ssl key: ' + key);

    serverOptions = {
        secure: true,
        ssl: {
            cert: cert,
            key: key
        }
    };
}

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
        core.log.info('redirecting to ingestion server: ' + req.url);

        httpProxy.web(req, res, { target: core.config.ingestion_internal_endpoint });
    } else if (urlMatchesRules(req.url, core.config.registry_url_rules)) {
        core.log.info('redirecting to registry server: ' + req.url);

        httpProxy.web(req, res, { target: core.config.registry_internal_endpoint });
    } else if (urlMatchesRules(req.url, [ core.config.headwaiter_path ])) {
        core.log.info('serving ' + req.url);
        res.writeHead(200, {
            'Content-Type': 'application/json'
        });

        res.write(new Buffer(JSON.stringify(endpoints)));
        res.end();
    } else {
        core.log.info('redirecting to consumption server: ' + req.url);
        // HTTP socket.io
        httpProxy.web(req, res, { target: core.config.consumption_internal_endpoint });
    }
});

server.on('upgrade', function (req, socket, head) {
    wsProxy.ws(req, socket, head);
});

server.listen(core.config.internal_port);
core.log.info('frontdoor server listening on ' + core.config.internal_port);
