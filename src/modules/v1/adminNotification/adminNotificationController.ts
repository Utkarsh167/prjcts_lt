"use strict";

import * as _ from "lodash";

import * as adminNotificationConstant from "@modules/v1/adminNotification/adminNotificationConstant";
import { AdminNotificationDao } from "@modules/v1/adminNotification/AdminNotificationDao";
import * as appUtils from "@utils/appUtils";
import * as config from "@config/constant";
import { ImageUtil } from "@lib/ImageUtil";
import { WebNotificationDao } from "@modules/v1/notification/NotificationDao";
import * as pushManager from "@lib/pushNotification/pushManager";
import { AdminDao } from "@modules/v1/admin/AdminDao";

let adminNotificationDao = new AdminNotificationDao();
let imageUtil = new ImageUtil();
let webNotificationDao = new WebNotificationDao();
let adminDao = new AdminDao();

/**
 * @function _saveAndSendNotificationChunks
 */
const _saveAndSendNotificationChunks = async function (params: EditAdminNotificationRequest) {
	try {
		let step1;
		if (params.notificationType === config.CONSTANT.NOTIFICATION_TYPE.ONE_TO_ONE) {
			step1 = await adminDao.getSingleUserDevice(params);
		} else {
			step1 = await adminDao.getChunksOfUser(params);
		}
		// separate user data to web company
		let webUsers: any = [];
		// for (let i = 0; i < step1.length; i++) {
		let uniqueUsers: any = [];
		for (let i of step1) {
			if (uniqueUsers.length > 0) {
				let isExistInRequest = _.find(uniqueUsers, (obj) => { return (obj.userId === i.userId); });
				if (!isExistInRequest)
					uniqueUsers.push({userId: i.userId});
			}
			else
			uniqueUsers.push({userId: i.userId});
			webUsers.push({ "userId": i._id, "deviceToken": i.deviceToken, "deviceId": i.deviceId, "arn": i.arn });
		}

		// let uniqueUser = [...new Set(webUsers.map(item => item.userId))];
		console.log(JSON.stringify(webUsers) + "webUsers + array iiii" + uniqueUsers.length);
		// Save send notification to admin
		await webUsers.forEach(async (data) => {
			let noticiationData = {
				"senderId": params.senderId,
				"receiverId": data.userId,
				"title": params.title,
				"message": params.message,
				"deviceId": data.deviceId,
				"image": params.image,
				"notificationType": params.notificationType
			};
			let step3 = webNotificationDao.addNotification(noticiationData);
		});
		// separate web user chunks
		let webUserChunks = appUtils.splitArrayInToChunks(webUsers);
		// create web payload
		let webPayload;
		if (webUserChunks.length) {
			params.body = params.message;
			webPayload = appUtils.createWebPushPayload(params);
		}
		// save android chunk data
		await webUserChunks.forEach(async (data) => {
			let chunkNoticiationPayload = {
				"data": data,
				"payload": webPayload,
				"deviceType": config.CONSTANT.DEVICE_TYPE.WEB
			};
			let step4 = await pushManager.pushNotification(chunkNoticiationPayload);
		});
		return uniqueUsers.length;
	} catch (error) {
		throw error;
	}
};

/**
 * @function addNotification
 */
const sendAddNotification = async function (params: AddAdminNotificationRequest) {
	try {
		// if (params.image) {
		// 	let step1: any = await imageUtil.uploadSingleMediaToS3(params.image);
		// 	params.image = step1;
		// }
		let senderId = params.userId;
		params.platform = config.CONSTANT.DEVICE_TYPE.WEB;
		params.adminType = config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN;
		let notificationType;
		if (params.audience === "all") {
			notificationType = config.CONSTANT.NOTIFICATION_TYPE.BULK_NOTIFICATION;
			let audience = {
				name: "all",
				_id: ""
			};
			params.targetAudience = audience;
		} else {
			notificationType = config.CONSTANT.NOTIFICATION_TYPE.ONE_TO_ONE;
			params.userId = params.audience;
			let audienceDetails = await adminDao.findAdminById(params);
			let audience = {
				name: audienceDetails.name,
				email: audienceDetails.email,
				_id: audienceDetails._id,
			};
			params.targetAudience = audience;
		}
		let step2 = await adminNotificationDao.addNotification(params);
		let notificationData = _.extend(params, { "notificationType": notificationType, "audience": params.audience, "senderId": senderId });
		let step3 = await _saveAndSendNotificationChunks(notificationData);
		params = _.extend(params, { "notificationId": step2._id, "sentCount": step3 });
		let step4 = await adminNotificationDao.updateNotificationCount(params);

		return adminNotificationConstant.MESSAGES.SUCCESS.ADD_NOTIFICATION;

	} catch (error) {
		throw error;
	}
};

/**
 * @function resendUpdateNotification
 */
const resendUpdateNotification = async function (params: AddAdminNotificationRequest) {
	try {
		let notificationType;
		let senderId = params.userId;
		if (params.audience === "all") {
			notificationType = config.CONSTANT.NOTIFICATION_TYPE.BULK_NOTIFICATION;
			let audience = {
				name: "all",
				_id: ""
			};
			params.targetAudience = audience;
		} else {
			notificationType = config.CONSTANT.NOTIFICATION_TYPE.ONE_TO_ONE;
			params.userId = params.audience;
			let audienceDetails = await adminDao.findAdminById(params);
			let audience = {
				name: audienceDetails.name,
				email: audienceDetails.email,
				_id: audienceDetails._id,
			};
			params.targetAudience = audience;
		}
		let step1 = await adminNotificationDao.findNotificationById(params);
		let notificationData = step1;
		notificationData = _.extend(notificationData, { "notificationId": step1._id, "notificationType": notificationType, "audience": params.audience, "senderId": senderId });
		let step3 = await _saveAndSendNotificationChunks(notificationData);
		params = _.extend(params, { "notificationId": step1._id, "sentCount": step3 });
		let step4 = await adminNotificationDao.updateNotificationCount(params);
		return adminNotificationConstant.MESSAGES.SUCCESS.ADD_NOTIFICATION;
	} catch (error) {
		throw error;
	}
};

/**
 * @function notificationList
 */
const notificationList = async function (params: ListingRequest) {
	try {
		let step2 = await adminNotificationDao.notificationList(params);
		return adminNotificationConstant.MESSAGES.SUCCESS.NOTIFICATION_LIST({ "notificationList": step2.data, "totalRecord": step2.total });
	} catch (error) {
		throw error;
	}
};

/**
 * @function deleteNotification
 */
const deleteNotification = async function (params: DeleteAdminNotificationRequest) {
	try {
		let step1 = await adminNotificationDao.deleteNotification(params);
		return adminNotificationConstant.MESSAGES.SUCCESS.DELETE_NOTIFICATION;
	} catch (error) {
		throw error;
	}
};

/**
 * @function notificationDetails
 */
const notificationDetails = async function (params: NotificationId) {
	try {
		let step1 = await adminNotificationDao.findNotificationById(params);
		return adminNotificationConstant.MESSAGES.SUCCESS.NOTIFICATION_DETAILS(step1);
	} catch (error) {
		throw error;
	}
};

/**
 * @function editNotification
 */
const editNotification = async function (params: EditAdminNotificationRequest) {
	try {
		// if (params.image) {
		// 	let step1: any = await imageUtil.uploadSingleMediaToS3(params.image);
		// 	params.image = step1;
		// }
		let step2 = await adminNotificationDao.editNotification(params);
		let notificationData = _.extend(params, { "notificationType": config.CONSTANT.NOTIFICATION_TYPE.BULK_NOTIFICATION });
		let step3 = await _saveAndSendNotificationChunks(notificationData);
		params = _.extend(params, { "sentCount": step3 });
		let step4 = await adminNotificationDao.updateNotificationCount(params);

		return adminNotificationConstant.MESSAGES.SUCCESS.EDIT_NOTIFICATION;
	} catch (error) {
		throw error;
	}
};

/**
 * @function sendOneToOneNotification
 */
const sendOneToOneNotification = async function (params: SendAdminNotificationRequest) {
	try {
		let step1 = await adminDao.getChunksOfSingleUser();
		// separate user data to android user and ios user
		let androidUsers = [], iosUsers = [];
		for (let i = 0; i < step1.data.length; i++) {
			if (step1.data[i].platform === config.CONSTANT.DEVICE_TYPE.ANDROID) {
				androidUsers.push({ "userId": step1.data[i]._id, "deviceToken": step1.data[i].deviceToken, "deviceId": step1.data[i].deviceId, "arn": step1.data[i].arn });
			}
			if (step1.data[i].platform === config.CONSTANT.DEVICE_TYPE.IOS) {
				iosUsers.push({ "userId": step1.data[i]._id, "deviceToken": step1.data[i].deviceToken, "deviceId": step1.data[i].deviceId, "arn": step1.data[i].arn });
			}
		}

		// save data to notification history for android
		await androidUsers.forEach(async (data) => {
			let noticiationData = {
				"receiverId": data.userId,
				"title": params.title,
				"message": params.message,
				"deviceId": data.deviceId,
				"notificationType": config.CONSTANT.NOTIFICATION_TYPE.BULK_NOTIFICATION
			};
			let step2 = webNotificationDao.addNotification(noticiationData);
		});

		// save data to notification history for IOS
		await iosUsers.forEach(async (data) => {
			let noticiationData = {
				"receiverId": data.userId,
				"title": params.title,
				"message": params.message,
				"deviceId": data.deviceId,
				"notificationType": config.CONSTANT.NOTIFICATION_TYPE.BULK_NOTIFICATION
			};
			let step3 = webNotificationDao.addNotification(noticiationData);
		});

		let payloadData = _.extend(params, {
			"notificationType": config.CONSTANT.NOTIFICATION_TYPE.ONE_TO_ONE,
			"image": step1.profilePicture
		});

		// create android and ios payload
		if (androidUsers.length) {
			let androidPayload = appUtils.createAndroidPushPayload(payloadData);
			let noticiationPayload = {
				"data": androidUsers,
				"payload": androidPayload,
				"deviceType": config.CONSTANT.DEVICE_TYPE.ANDROID
			};
			let step4 = await pushManager.pushNotification(noticiationPayload);
		}
		if (iosUsers.length) {
			let iosPayload = appUtils.createIOSPushPayload(payloadData);
			let noticiationPayload = {
				"data": iosUsers,
				"payload": iosPayload,
				"deviceType": config.CONSTANT.DEVICE_TYPE.IOS
			};
			let step5 = await pushManager.pushNotification(noticiationPayload);
		}
		return adminNotificationConstant.MESSAGES.SUCCESS.SEND_NOTIFICATION;

	} catch (error) {
		throw error;
	}
};

/**
 * @function sendBulkNotification
 */
const sendBulkNotification = async function (params: SendBulkNotificationRequest) {
	try {
		let step1 = await adminNotificationDao.findNotificationById(params);
		let notificationData = step1;
		notificationData = _.extend(notificationData, { "notificationId": step1._id, "notificationType": config.CONSTANT.NOTIFICATION_TYPE.BULK_NOTIFICATION });
		let step2 = await _saveAndSendNotificationChunks(notificationData);
		let dataToBeUpdated = _.extend(params, { "sentCount": step2 });
		let step3 = await adminNotificationDao.updateNotificationCount(dataToBeUpdated);
		return adminNotificationConstant.MESSAGES.SUCCESS.SEND_NOTIFICATION;
	} catch (error) {
		throw error;
	}
};

const adminList = async function (params: ListingRequest) {
	try {
		let step1 = await adminDao.adminList(params);
		return adminNotificationConstant.MESSAGES.SUCCESS.ADMIN_LIST(step1);
	} catch (error) {
		throw error;
	}
};

export let adminNotificationController = {
	sendAddNotification,
	notificationList,
	deleteNotification,
	notificationDetails,
	editNotification,
	sendOneToOneNotification,
	sendBulkNotification,
	adminList,
	resendUpdateNotification
};