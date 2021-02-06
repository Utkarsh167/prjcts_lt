"use strict";

const FCM = require("fcm-node");

import * as config from "@config/environment";

let fcmServerKey = config.SERVER.FCM_SERVER_KEY; // put your server key here
let fcmDriverServerKey = config.SERVER.FCM_DRIVER_SERVER_KEY; // put your driver server key here
let fcmWebServerKey = config.SERVER.FCM_WEB_SERVER_KEY; // put your web service key for admin
let fcm = new FCM(fcmServerKey);
let driverFcm = new FCM(fcmDriverServerKey);
let weFcm = new FCM(fcmWebServerKey);

export let sendPush = async function (deviceId, payload) {
	let message = { // this may vary according to the message type (single recipient, multicast, topic, et cetera)
		to: deviceId,
		data: payload,
		notification: payload
	};
	return new Promise(async (resolve, reject) => {
		try {
			fcm.send(message, function (error, response) {
				console.log(error, response);
				if (error) {
					console.log(error);
					// reject(error);
				} else {
					resolve(response);
				}
			});
		} catch (error) {
			reject(error);
		}
	});
};

export let sendDriverPush = async function (deviceId, payload) {
	let message = { // this may vary according to the message type (single recipient, multicast, topic, et cetera)
		to: deviceId,
		data: payload
	};
	return new Promise(async (resolve, reject) => {
		try {
			driverFcm.send(message, function (error, response) {
				console.log(error, response);
				if (error) {
					console.log(error);
					// reject(error);
				} else {
					resolve(response);
				}
			});
		} catch (error) {
			reject(error);
		}
	});
};

export let sendWebPush = async function (deviceToken, payload) {
	let message = { // this may vary according to the message type (single recipient, multicast, topic, et cetera)
		to: deviceToken,
		notification: payload,
		click_action: config.SERVER.CLICK_ACTION
	};
	return new Promise(async (resolve, reject) => {
		try {
			weFcm.send(message, function (error, response) {
				console.log(error, response);
				if (error) {
					console.log(error);
					// reject(error);
				} else {
					resolve(response);
				}
			});
		} catch (error) {
			reject(error);
		}
	});
};

export let subscribeToTopic = async function (deviceIds, payload) {
	return new Promise(async (resolve, reject) => {
		try {
			fcm.subscribeToTopic(deviceIds, "some_topic_name", (err, res) => {
				console.log(err, res);
			});
		} catch (error) {
			reject(error);
		}
	});
};

export let unsubscribeToTopic = async function (deviceIds, payload) {
	return new Promise(async (resolve, reject) => {
		try {
			fcm.unsubscribeToTopic(deviceIds, "some_topic_name", (err, res) => {
				console.log(err, res);
			});
		} catch (error) {
			reject(error);
		}
	});
};