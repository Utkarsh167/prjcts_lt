"use strict";

import * as _ from "lodash";
import * as atob from "atob";
import * as Boom from "boom";
import * as btoa from "btoa";
import * as del from "del";
import * as Hapi from "hapi";
import * as moment from "moment";
import * as mongoose from "mongoose";
import * as path from "path";
import * as validator from "validator";

import * as config from "@config/index";
import * as pushManager from "@lib/pushNotification/pushManager";
// import { NotificationDao } from "@modules/v1/notification/NotificationDao";
// import * as appUtils from '@utils/appUtils';

// let notificationDao = new NotificationDao();
/**
 * @function _saveAndSendNotificationChunks
 */
let saveAndSendNotificationChunks = async function (params, userData) {
	try {
		// separate user data to android user and ios user
		let androidUsers = [], iosUsers = [];
		for (let i = 0; i < userData.length; i++) {
			if (userData[i].platform === config.CONSTANT.DEVICE_TYPE.ANDROID) {
				androidUsers.push({ "userId": userData[i].userId, "deviceToken": userData[i].deviceToken, "deviceId": userData[i].deviceId, "arn": userData[i].arn, "userType": userData[i].userType });
			}
			if (userData[i].platform === config.CONSTANT.DEVICE_TYPE.IOS) {
				console.log("Push for ios device");
				iosUsers.push({ "userId": userData[i].userId, "deviceToken": userData[i].deviceToken, "deviceId": userData[i].deviceId, "arn": userData[i].arn, "userType": userData[i].userType });
			}
		}
		// save data to notification history for android
		await androidUsers.forEach(async (data) => {
			let noticiationData = {
				"receiverId": data.userId,
				"senderId": params.senderId,
				"title": params.title,
				"message": params.message,
				"deviceId": data.deviceId,
				"notificationType": params.notificationType
			};
			// let step2 = await notificationDao.addNotification(noticiationData);
		});

		// save data to notification history for IOS
		await iosUsers.forEach(async (data) => {
			let noticiationData = {
				"receiverId": data.userId,
				"title": params.title,
				"message": params.message,
				"deviceId": data.deviceId,
				"notificationType": params.notificationType
			};
			// let step3 = await notificationDao.addNotification(noticiationData);
		});

		// separate android user data and ios user data to android user chunks and ios user chunks
		let androidUserChunks = this.splitPushArrayInToChunks(androidUsers);
		let iosUserChunks = this.splitPushArrayInToChunks(iosUsers);

		// create android and ios payload
		let androidPayload, iosPayload;
		if (androidUserChunks.length) {
			androidPayload = this.createPushAndroidPushPayload(params);
		}
		if (iosUserChunks.length) {
			iosPayload = this.createPushIOSPushPayload(params);
		}
		// save android chunk data
		await androidUserChunks.forEach(async (data) => {
			let chunkNoticiationPayload = {
				"data": data,
				"payload": androidPayload,
				"deviceType": config.CONSTANT.DEVICE_TYPE.ANDROID
			};
			let step4 = await pushManager.pushNotification(chunkNoticiationPayload);
		});

		// save ios chunk data
		await iosUserChunks.forEach(async (data) => {
			let chunkNoticiationPayload = {
				"data": data,
				"payload": iosPayload,
				"deviceType": config.CONSTANT.DEVICE_TYPE.IOS
			};
			let step5 = await pushManager.pushNotification(chunkNoticiationPayload);
		});
		return userData.length;
	} catch (error) {
		throw error;
	}
};

let splitPushArrayInToChunks = function (data) {
	return data.chunk_inefficient(config.SERVER.CHUNK_SIZE);
};

let createPushAndroidPushPayload = function (data) {
	let set: any = {};
	let fieldsToFill = ["type", "title", "message", "link", "image", "priority", "contentType", "category"];

	data.type = data.notificationType;
	data.priority = "high";
	data.contentType = data.image ? "image" : "text"; // video, audio, gif, text
	data.category = "action";
	set = this.setPushInsertObject(data, set, fieldsToFill);
	return set;
};

let createPushIOSPushPayload = function (data) {
	let set: any = {};
	let fieldsToFill = ["type", "title", "message", "alert", "link", "attachmentUrl", "contentType", "category", "mutableContent", "threadId", "sound"];

	data.type = data.notificationType;
	data.alert = data.title;
	data.body = data.message;
	data.attachmentUrl = data.image;
	data.contentType = data.image ? "image" : "text"; // video, audio, gif, text
	data.category = "action";
	data.mutableContent = 1;
	data.threadId = "RichPush";
	data.sound = "default";
	set = this.setPushInsertObject(data, set, fieldsToFill);
	return set;
};

let setPushInsertObject = function (source, destination, fields) {
	_.each(fields, function (value, index) {
		if (source[value] != null) {
			destination[value] = source[value];
		}
	});

	return destination;
};

export {
	saveAndSendNotificationChunks,
	splitPushArrayInToChunks,
	setPushInsertObject,
	createPushAndroidPushPayload,
	createPushIOSPushPayload,
};