"use strict";

// import * as apns from '@lib/pushNotification/apns';
import * as config from "@config/index";
import * as fcm from "@lib/pushNotification/fcm";

export let pushNotification = async function (data) {
	return new Promise(async (resolve, reject) => {
		try {
			let promiseResult = [];
			for (let j = 0; j < data.data.length; j++) {
				promiseResult.push(fcm.sendWebPush(data.data[j].deviceToken, data.payload));
			}
			resolve(Promise.all(promiseResult));
		} catch (error) {
			reject(error);
		}
	});
};