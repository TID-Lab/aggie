/**
 * A set of utility functions for interacting with the comments API
 */

const request = require('request');
var { URL } = require('url');
const config = require('./config/secrets');

let jwtToken;
const { comments } = config.get();
const { username, password, baseUrl } = comments || {};

/**
 * A handy helper function for adding/removing posts
 * @param {String} method The HTTP method to use
 * @param {String} url The URL of the post to add/remove
 * @param {Function} callback The callback function
 */
const postHelper = function(method, url, callback) {
    if (typeof jwtToken !== 'string') {
        authenticate((err) => {
            if (err) {
                return callback(err)
            }
            postHelper(method, url, callback)
        });
        return;
    }
    const options = {
        method,
        auth: { bearer: jwtToken },
        json: true,
        body: { url }
    }
    const postURL = completeUrl('post');
    request(postURL, options, (err, res) => {
        if (err) {
            return callback(new Error('HTTP error: ' + err.message));
        } else if (res.statusCode === 401) {
            jwtToken = null;
            postHelper(method, url, callback);
        } else if (res.statusCode !== 409 && res.statusCode !== 200) {
            return callback(new Error.HTTP(res.statusCode));
        }

        callback(null);
    });
}

/**
 * Sends an API request to add a post
 * @param {String} url The URL of the post
 * @param {Function} callback The callback
 */
const addPost = function(url, callback) {
    postHelper('POST', url, callback);
}

/**
 * Sends an API request to remove a post
 * @param {String} url The URL of the post
 * @param {Function} callback The callback
 */
const removePost = function(url, callback) {
    postHelper('DELETE', url, callback);
}

/**
 * Creates a complete URL from the path
 * @param {String} path The URL path
 */
const completeUrl = function(path) {
    return new URL(path, baseUrl);
}

/**
 * Fetches a new JWT token to authenticate future requests
 */
const authenticate = function(callback) {
    const authUrl = completeUrl('user');
    request(authUrl, {
        json: true,
        body: {
            name: username,
            pwd: password,
        },
        method: 'POST',
    }, (err, res, body) => {
        if (err) {
            return callback(new Error('HTTP error: ' + err.message));
        } else if (res.statusCode !== 200) {
            return callback(new Error.HTTP(res.statusCode));
        }
        jwtToken = body.toString();
        callback(null);
    });
}

/**
 * Returns the current JWT token.
 */
const getJWTToken = function() {
    return jwtToken;
}

/**
 * Sets the JWT token to a new value.
 * @param {String} token The new JWT token
 */
const setJWTToken = function(token) {
    jwtToken = token;
}

module.exports = {
    completeUrl,
    authenticate,
    getJWTToken,
    setJWTToken,
    addPost,
    removePost,
}
