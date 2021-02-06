"use strict";

import * as _ from "lodash";

import * as adminNotificationConstant from "@modules/v1/adminNotification/adminNotificationConstant";
import { AdminNotificationDao } from "@modules/v1/adminNotification/AdminNotificationDao";
import * as appUtils from "@utils/appUtils";
import * as config from "@config/constant";
import { ImageUtil } from "@lib/ImageUtil";
import { NotificationDao } from "@modules/v1/notification/NotificationDao";
import * as pushManager from "@lib/pushNotification/pushManager";
import { UserDao } from "@modules/v1/user/UserDao";
import { RedisScheduler } from "@lib/redisScheduler";
import { AdminDao } from "@modules/v1/admin/AdminDao";

let adminDao = new AdminDao();
let adminNotificationDao = new AdminNotificationDao();
let imageUtil = new ImageUtil();
let notificationDao = new NotificationDao();
let userDao = new UserDao();

/**
 * @function _saveAndSendNotificationChunks
 */
const _saveAndSendNotificationChunks = async function (params: EditAdminNotificationRequest) {
	try {
		let step1 = await userDao.getChunksOfUser(params);
		// separate user data to android user and ios user
		let androidUsers = [], iosUsers = [];
		for (let i = 0; i < step1.length; i++) {
			if (step1[i].platform === config.CONSTANT.DEVICE_TYPE.ANDROID) {
				androidUsers.push({ "userId": step1[i]._id, "deviceToken": step1[i].deviceToken, "deviceId": step1[i].deviceId, "arn": step1[i].arn, "userType": step1[i].userType });
			}
			if (step1[i].platform === config.CONSTANT.DEVICE_TYPE.IOS) {
				iosUsers.push({ "userId": step1[i]._id, "deviceToken": step1[i].deviceToken, "deviceId": step1[i].deviceId, "arn": step1[i].arn, "userType": step1[i].userType });
			}
		}

		// save data to notification history for android
		await androidUsers.forEach(async (data) => {
			let noticiationData = {
				"senderId": params.userId,
				"receiverId": data.userId,
				"title": params.title,
				"message": params.message,
				"deviceId": data.deviceId,
				"notificationType": params.notificationType,
			};
			let step2 = await notificationDao.addNotification(noticiationData);
		});

		// save data to notification history for IOS
		await iosUsers.forEach(async (data) => {
			let noticiationData = {
				"senderId": params.userId,
				"receiverId": data.userId,
				"title": params.title,
				"message": params.message,
				"deviceId": data.deviceId,
				"notificationType": params.notificationType,
			};
			let step3 = await notificationDao.addNotification(noticiationData);
		});

		// separate android user data and ios user data to android user chunks and ios user chunks
		let androidUserChunks = appUtils.splitArrayInToChunks(androidUsers);
		let iosUserChunks = appUtils.splitArrayInToChunks(iosUsers);

		// create android and ios payload
		let androidPayload, iosPayload;
		if (androidUserChunks.length) {
			androidPayload = appUtils.createAndroidPushPayload(params);
		}
		if (iosUserChunks.length) {
			iosPayload = appUtils.createIOSPushPayload(params);
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
		return step1.length;
	} catch (error) {
		throw error;
	}
};

/**
 * @function addNotification
 */
const addNotification = async function (params: AddAdminNotificationRequest) {
	try {
		if (
			params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			params.permission.indexOf("notification") !== -1
		) {
			// if (params.image) {
			// 	let step1: any = await imageUtil.uploadSingleMediaToS3(params.image);
			// 	params.image = step1;
			// }
			params.createdBy = params.userId;
			params.companyCode = params.companyCode;
			let step2 = await adminNotificationDao.addNotification(params);
			if (params.scheduleType === config.CONSTANT.NOTIFICATION_SCHEDULE_TYPE.SEND_NOW) {
				let notificationData = _.extend(params, { "notificationType": config.CONSTANT.NOTIFICATION_TYPE.SEND_BY_ADMIN });
				let step3 = await _saveAndSendNotificationChunks(notificationData);
				params = _.extend(params, { "notificationId": step2._id, "sentCount": step3 });
				let step4 = await adminNotificationDao.updateNotificationCount(params);
			} else {
				params = _.extend(params, { "notificationId": step2._id });
				let payload = {
					jobName: config.CONSTANT.JOB_SCHEDULER_TYPE.NOTIFICATION_SEND_LATER,
					time: params.scheduleTime,
					params: { ...params }
				};
				let step = await RedisScheduler.init(payload);
			}
			return adminNotificationConstant.MESSAGES.SUCCESS.ADD_NOTIFICATION;
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};
/**
 * send to later
 * @param params notificationData
 */
const sendDraftNotification = async function (params: AddAdminNotificationRequest) {
	let notificationData = _.extend(params, { "notificationType": config.CONSTANT.NOTIFICATION_TYPE.SEND_BY_ADMIN });
	let step3 = await _saveAndSendNotificationChunks(notificationData);
	params = _.extend(params, { "sentCount": step3 });
	let step4 = await adminNotificationDao.updateNotificationCount(params);
};
/**
 * @function notificationList
 */
const notificationList = async function (params: ListingRequest) {
	try {
		if (
			params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			params.permission.indexOf("notification") !== -1
		) {
			let step1 = await adminDao.findAdminById(params);
			if (
				step1.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
				step1.permission.indexOf("notification") !== -1
			) {
				let step2 = await adminNotificationDao.notificationList(params);
				return adminNotificationConstant.MESSAGES.SUCCESS.NOTIFICATION_LIST({ "notificationList": step2.data, "totalRecord": step2.total });
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			}
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};

/**
 * @function deleteNotification
 */
const deleteNotification = async function (params: DeleteAdminNotificationRequest) {
	try {
		if (
			params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			params.permission.indexOf("notification") !== -1
		) {
			let step1 = await adminNotificationDao.deleteNotification(params);
			return adminNotificationConstant.MESSAGES.SUCCESS.DELETE_NOTIFICATION;
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
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
		if (
			params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			params.permission.indexOf("notification") !== -1
		) {
			// if (params.image) {
			// 	let step1: any = await imageUtil.uploadSingleMediaToS3(params.image);
			// 	params.image = step1;
			// }
			let step2 = await adminNotificationDao.editNotification(params);
			if (params.scheduleType === config.CONSTANT.NOTIFICATION_SCHEDULE_TYPE.SEND_NOW) {
				let notificationData = _.extend(params, { "notificationType": config.CONSTANT.NOTIFICATION_TYPE.SEND_BY_ADMIN });
				let step3 = await _saveAndSendNotificationChunks(notificationData);
				params = _.extend(params, { "sentCount": step3 });
				let step4 = await adminNotificationDao.updateNotificationCount(params);
			}
			return adminNotificationConstant.MESSAGES.SUCCESS.EDIT_NOTIFICATION;
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};

/**
 * @function sendOneToOneNotification
 */
const sendOneToOneNotification = async function (params: SendAdminNotificationRequest) {
	try {
		if (
			params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			params.permission.indexOf("notification") !== -1
		) {
			let step1 = await userDao.getChunksOfSingleUser();

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
				let step2 = notificationDao.addNotification(noticiationData);
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
				let step3 = notificationDao.addNotification(noticiationData);
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
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};

/**
 * @function sendBulkNotification
 */
const sendBulkNotification = async function (params: SendBulkNotificationRequest) {
	try {
		if (
			params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			params.permission.indexOf("notification") !== -1
		) {
			let step1 = await adminNotificationDao.findNotificationById(params);
			let notificationData = step1;
			notificationData = _.extend(notificationData, { "notificationId": step1._id, "notificationType": config.CONSTANT.NOTIFICATION_TYPE.SEND_BY_ADMIN });
			let step2 = await _saveAndSendNotificationChunks(notificationData);
			let dataToBeUpdated = _.extend(params, { "sentCount": step2 });
			let step3 = await adminNotificationDao.updateNotificationCount(dataToBeUpdated);
			return adminNotificationConstant.MESSAGES.SUCCESS.SEND_NOTIFICATION;
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};

export let adminNotificationController = {
	addNotification,
	notificationList,
	deleteNotification,
	notificationDetails,
	editNotification,
	sendOneToOneNotification,
	sendBulkNotification,
	sendDraftNotification
};