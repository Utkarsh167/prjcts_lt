"use strict";

import * as redis from "redis";
import * as Promise from "bluebird";

import * as config from "@config/environment";
import { logger } from "@lib/logger";

Promise.promisifyAll(redis.RedisClient.prototype),
	Promise.promisifyAll(redis.Multi.prototype);

let redisClient;

export class RedisClient {

	constructor() { }

	static init() {
		console.log("============================" + process.env.NODE_ENV);
		if (process.env.NODE_ENV === "production") {
			redisClient = redis.createClient(config.SERVER.REDIS.PORT, config.SERVER.REDIS.SERVER, { auth_pass: config.SERVER.REDIS.REDIS_AUTH_PASS });
			console.log("Redis client ==========" + config.SERVER.REDIS.PORT + "" + config.SERVER.REDIS.SERVER + "" + config.SERVER.REDIS.REDIS_AUTH_PASS);
		} else {
			redisClient = redis.createClient(config.SERVER.REDIS.PORT, config.SERVER.REDIS.SERVER);
			console.log("Redis appinventiv ==========" + config.SERVER.REDIS.PORT + "" + config.SERVER.REDIS.SERVER + "" + config.SERVER.REDIS.REDIS_AUTH_PASS);
		}
		redisClient.on("ready", () => {
			logger.info("Redis is ready");
		});

		redisClient.on("error", (error) => {
			logger.error("Error in Redis", error);
			console.log("Error in Redis");
		});
	}

	storeValue(key, value) {
		// redisClient.set(['framework', 'AngularJS']);
		return redisClient.set(key, value, function (error, reply) {
			if (error) {
				console.log(error);
			}
			return reply;
		});
	}

	getValue(key) {
		return new Promise(function (resolve, reject) {
			redisClient.get(key, function (error, reply) {
				if (error) {
					console.log(error);
				}
				resolve(reply);
			});
		});
	}

	storeHash(key, value) {
		// redisClient.hmset("tools", "webserver", "expressjs", "database", "mongoDB", "devops", "jenkins");
		// 													OR
		// redisClient.hmset("tools", {"webserver": "expressjs", "database": "mongoDB", "devops": "jenkins"});
		// {"webserver": "expressjs", "database": "mongoDB", "devops": "jenkins"} // store like this
		return redisClient.hmset(key, value, function (error, object) {
			if (error) {
				console.log(error);
			}
			return object;
		});
	}

	getHash(key) {
		return new Promise(function (resolve, reject) {
			redisClient.hgetall(key, function (error, object) {
				if (error) {
					console.log(error);
				}
				resolve(object);
			});
		});
	}

	storeList(key, value) {
		value.unshift(key);
		// redisClient.rpush(['frameworks', 'angularjs', 'backbone']); // push the elements to the right.
		// redisClient.lpush(['frameworks', 'angularjs', 'backbone']); // push the elements to the left.
		return redisClient.rpush(value, function (error, reply) {
			if (error) {
				console.log(error);
			}
			return reply;
		});
	}

	getList(key) {
		// redisClient.lrange(key, startIndex, endIndex or -1);
		return new Promise(function (resolve, reject) {
			redisClient.lrange(key, 0, -1, function (error, reply) {
				if (error) {
					console.log(error);
				}
				resolve(reply);
			});
		});
	}

	storeSet(key, value) {
		value.unshift(key);
		// Sets are similar to lists, but the difference is that they don’t allow duplicates
		// redisClient.sadd(['frameworks', 'angularjs', 'backbone']);
		return redisClient.sadd(value, function (error, reply) {
			if (error) {
				console.log(error);
			}
			return reply;
		});
	}

	removeFromSet(key, value) {
		// Redis SREM is used to remove the specified member from the set stored at the key.
		// redisClient.srem('blocked_set', '5c07c44395a7ee2e99608bc9');
		// redisClient.srem('blocked_set', ['5c07c44395a7ee2e99608bc9', '5c07c44e95a7ee2e99608bca']);
		return redisClient.srem(key, value, function (error, reply) {
			if (error) {
				console.log(error);
			}
			return reply;
		});
	}

	getSet(key) {
		return new Promise(function (resolve, reject) {
			redisClient.smembers(key, function (error, reply) {
				if (error) {
					console.log(error);
				}
				resolve(reply);
			});
		});
	}

	checkKeyExists(key) {
		return redisClient.exists(key, function (error, reply) {
			if (error) {
				console.log(error);
			}
			return reply;
		});
	}

	deleteKey(key) {
		return redisClient.del(key, function (error, reply) {
			if (error) {
				console.log(error);
			}
			return reply;
		});
	}

	expireKey(key, expiryTime) {
		// in seconds
		return redisClient.expireAsync(key, expiryTime, function (error, reply) {
			if (error) {
				console.log(error);
			}
			return reply;
		});
	}

	incrementKey(key, value) {
		// or incrby()
		return redisClient.set(key, 10, function () {
			return redisClient.incr(key, function (error, reply) {
				if (error) {
					console.log(error);
				}
				console.log(reply); // 11
			});
		});
	}

	decrementKey(key, value) {
		// or decrby()
		return redisClient.set(key, 10, function () {
			return redisClient.decr(key, function (error, reply) {
				if (error) {
					console.log(error);
				}
				console.log(reply); // 11
			});
		});
	}
}