"use strict";

const FCM = require("fcm-node");

import * as config from "@config/environment";

let fcmWebServerKey = config.SERVER.FCM_WEB_SERVER_KEY; // put your web server key for admin
let weFcm = new FCM(fcmWebServerKey);

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
