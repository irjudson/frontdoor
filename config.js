var config = {
    internal_port: process.env.PORT,
};

if (process.env.NODE_ENV === 'production') {

} else if (process.env.NODE_ENV === 'test') {
    console.log('frontdoor: using test configuration');
    config.internal_port = 3050;
    config.external_port = 3050;
    config.registry_internal_endpoint = "http://localhost:3051";
    config.ingestion_internal_endpoint = "http://localhost:3052";
    config.consumption_internal_endpoint = "http://localhost:3053";
} else {
    console.log('frontdoor: using dev configuration');
    config.internal_port = 3030;
    config.external_port = 3030;
    config.registry_internal_endpoint = "http://localhost:3031";
    config.ingestion_internal_endpoint = "http://localhost:3032";
    config.consumption_internal_endpoint = "http://localhost:3033";
}

config.internal_port = config.internal_port || 3030;
config.external_port = config.external_port || 443;
config.protocol = process.env.PROTOCOL || config.protocol || "https";
config.host = process.env.HOST_NAME || config.host || "localhost";
config.mongodb_connection_string = config.mongodb_connection_string || process.env.MONGODB_CONNECTION_STRING;

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

config.ingestion_url_rules = [
    config.messages_path
];

config.registry_url_rules = [
    config.api_keys_path,
    config.principals_path
];

config.consumption_url_rules = [
    config.blobs_path,
    config.messages_path,
    config.permissions_path
];

module.exports = config;
