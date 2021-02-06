"use strict";

// import * as apns from '@lib/pushNotification/apns';
import * as config from "@config/index";
import * as fcm from "@lib/pushNotification/fcm";

export let pushNotification = async function (data) {
	return new Promise(async (resolve, reject) => {
		try {
			// if (config.SERVER.PUSH_TYPE === config.CONSTANT.PUSH_SENDING_TYPE.SNS) {
			// 	let promiseResult = [];
			// 	for (let i = 0; i < data.data.length; i++) {
			// 		if (data.deviceType === config.CONSTANT.DEVICE_TYPE.ANDROID) {
			// 			promiseResult.push(sns.sendPushToAndroidUser(data.data[i].arn, data.payload));
			// 		}
			// 		if (data.deviceType === config.CONSTANT.DEVICE_TYPE.IOS) {
			// 			promiseResult.push(sns.sendPushToIOSUser(data.data[i].arn, data.payload));
			// 		}
			// 	}
			// 	resolve(Promise.all(promiseResult));
			// } else if (config.SERVER.PUSH_TYPE === config.CONSTANT.PUSH_SENDING_TYPE.FCM) {
			// 	let promiseResult = [];
			// 	for (let j = 0; j < data.data.length; j++) {
			// 		promiseResult.push(fcm.sendPush(data.data[j].deviceToken, data.payload));
			// 	}
			// 	resolve(Promise.all(promiseResult));
			// }
			let promiseResult = [];
			for (let j = 0; j < data.data.length; j++) {
				if (data.data[j].userType === config.CONSTANT.USER_TYPE.DRIVER) {
					console.log("--------==============DRIVER push===================================");
					promiseResult.push(fcm.sendDriverPush(data.data[j].deviceToken, data.payload));
				} else {
					console.log("--------==============EMPLOYEE push===================================");
					promiseResult.push(fcm.sendPush(data.data[j].deviceToken, data.payload));
				}
			}
			resolve(Promise.all(promiseResult));
		} catch (error) {
			reject(error);
		}
	});
};

export let pushWebNotification = async function (data) {
	return new Promise(async (resolve, reject) => {
		try {
			// console.log("data----------------===========usertype" + JSON.stringify(data));
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