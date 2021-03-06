var config = {
    internal_port: process.env.PORT,
    external_port: process.env.EXTERNAL_PORT
};

if (process.env.NODE_ENV === 'production') {
    config.internal_port = config.internal_port || 8080;
    config.external_port = config.external_port || 443;
    config.protocol = process.env.PROTOCOL || "https";
} else if (process.env.NODE_ENV === 'test') {
    console.log('frontdoor: using test configuration');

    config.internal_port = config.internal_port || 3050;
    config.external_port = config.external_port || 3050;
    config.protocol = process.env.PROTOCOL || "http";

    config.registry_internal_endpoint = "http://localhost:3051";
    config.ingestion_internal_endpoint = "http://localhost:3052";
    config.consumption_internal_endpoint = "http://localhost:3053";
    config.consumption_internal_ws_endpoint = "ws://localhost:3053";
} else {
    console.log('frontdoor: using dev configuration');

    config.external_port = config.external_port || 3030;
    config.protocol = process.env.PROTOCOL || "http";

    config.registry_internal_endpoint = "http://localhost:3031";
    config.ingestion_internal_endpoint = "http://localhost:3032";
    config.consumption_internal_endpoint = "http://localhost:3033";
    config.consumption_internal_ws_endpoint = "ws://localhost:3033";
}

config.internal_port = config.internal_port || 3030;
config.external_port = config.external_port || 80;
config.protocol = process.env.PROTOCOL || config.protocol || "https";
config.host = process.env.HOST_NAME || config.host || "localhost";
config.mongodb_connection_string = config.mongodb_connection_string || process.env.MONGODB_CONNECTION_STRING;

config.registry_internal_endpoint = process.env.REGISTRY_INTERNAL_ENDPOINT || "http://localhost:3031";
config.ingestion_internal_endpoint = process.env.INGESTION_INTERNAL_ENDPOINT || "http://localhost:3032";
config.consumption_internal_endpoint = process.env.CONSUMPTION_INTERNAL_ENDPOINT || "http://localhost:3033";
config.consumption_internal_ws_endpoint = process.env.CONSUMPTION_INTERNAL_WS_ENDPOINT || "ws://localhost:3033";

// Endpoint URI configuration

config.api_path = "/api/";
config.v1_api_path = config.api_path + "v1";

config.base_endpoint = config.protocol + "://" + config.host + ":" + config.external_port;
config.api_endpoint = config.base_endpoint + config.v1_api_path;

config.api_keys_path = config.v1_api_path + "/api_keys";
config.api_keys_endpoint = config.base_endpoint + config.api_keys_path;

config.blobs_path = config.v1_api_path + "/blobs";
config.blobs_endpoint = config.base_endpoint + config.blobs_path;

config.headwaiter_path = config.v1_api_path + "/headwaiter";
config.headwaiter_uri = config.base_endpoint + config.headwaiter_path;

config.images_endpoint = process.env.IMAGES_ENDPOINT || 'http://localhost/images';

config.messages_path = config.v1_api_path + "/messages";
config.messages_endpoint = config.base_endpoint + config.messages_path;

config.ops_path = config.v1_api_path + "/ops";
config.ops_endpoint = config.base_endpoint + config.ops_path;

config.permissions_path = config.v1_api_path + "/permissions";
config.permissions_endpoint = config.base_endpoint + config.permissions_path;

config.principals_path = config.v1_api_path + "/principals";
config.principals_endpoint = config.base_endpoint + config.principals_path;

config.subscriptions_path = '/';
config.subscriptions_endpoint = config.base_endpoint + config.subscriptions_path;

config.users_path = "/user";
config.users_endpoint = config.base_endpoint + config.users_path;

config.ingestion_url_rules = [
    config.messages_path
];

config.registry_url_rules = [
    config.api_keys_path,
    config.principals_path,
    config.users_path,
    "/bootstrap.min",
    "/favicon.ico",
    "/fonts"
];

config.consumption_url_rules = [
    config.blobs_path,
    config.messages_path,
    config.permissions_path,
    "/client"
];

module.exports = config;
