"use strict";

import * as _ from "lodash";

import { AdminDao } from "@modules/v1/admin/AdminDao";
import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import * as csv from "@lib/csv";
import { MailManager, RedisClient } from "@lib/index";
import * as tokenManager from "@lib/tokenManager";
import * as sosConstant from "@modules/v1/contactToAdmin/sosConstant";
import { SosDao } from "@modules/v1/contactToAdmin/index";
import { LoginHistoryDao } from '@modules/v1/loginHistory/LoginHistoryDao';
import * as pushManager from "@lib/pushNotification/pushManager";
import * as pushNotification from '@utils/pushNotification';
import { RescheduleDao } from "@modules/v1/rescheduleRide/RescheduleDao";
import { RoasterDao } from "@modules/v1/roaster/RoasterDao";
import { UserDao } from "@modules/v1/user/UserDao";
import { executer } from "@lib/socketManager";

import * as xlsx from "@lib/xlsx";

let adminDao = new AdminDao();
let mailManager = new MailManager();
let redisClient = new RedisClient();
let sosDao = new SosDao();
let loginHistoryDao = new LoginHistoryDao();
let rescheduleDao = new RescheduleDao();
let roasterDao = new RoasterDao();
let userDao = new UserDao();

/**
 * @function sosList
 */
const sosList = async function (params: ListingRequest) {
	try {
		if (
			params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			params.permission.indexOf("request") !== -1
		) {
			let step1 = await adminDao.findAdminById(params);
			if (
				step1.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
				step1.permission.indexOf("request") !== -1
			) {
				let response: any = {};
				let step2 = await sosDao.sosList(params).then(function (result) {
					response.userList = result[0];
					response.totalCount = result[1] || 0;
					// add pendingSosCount to response - Shivakumar A
					response.pendingSosCount = result[2] || 0;
				});
				return sosConstant.MESSAGES.SUCCESS.SOS_LIST(response);
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
 * @function userQueryList
 * @param params
 * @description User contact to admin his query list
 */
const userQueryList = async function (params: ListingRequest) {
	try {
		if (
			params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			params.permission.indexOf("request") !== -1
		) {
			let step1 = await adminDao.findAdminById(params);
			if (
				step1.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
				step1.permission.indexOf("request") !== -1
			) {
				let response: any = {};
				let step2 = await sosDao.userQueryList(params).then(function (result) {
					response.userList = result[0];
					response.totalCount = result[1] || 0;
				});
				return sosConstant.MESSAGES.SUCCESS.SOS_LIST(response);
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
 * @function resolveSos can sos cancel
 */
const resolveRequest = async function (params: DeleteRequest) {
	try {
		if (
			params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			params.permission.indexOf("request") !== -1
		) {
			let step1 = await sosDao.resolveRequest(params);
			let step2 = await sosDao.findRequestByRequestId(params);
			let userDevice = await loginHistoryDao.findChunkDevice(step2.userId);
			let notificationData = {
				title: config.CONSTANT.NOTIFICATION_TITLE.REQUEST_RESOLVED_BY_ADMIN,
				message: config.CONSTANT.NOTIFICATION_MESSAGE.REQUEST_RESOLVED_BY_ADMIN,
				senderId: params.userId,
				notificationType: config.CONSTANT.NOTIFICATION_TYPE.REQUEST_RESOLVED_BY_ADMIN
			};
			pushNotification.saveAndSendNotificationChunks(notificationData, userDevice);
			return sosConstant.MESSAGES.SUCCESS.SOS_RESOLVE;
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}

	} catch (error) {
		throw error;
	}
};
/**
 * @function requestReject can sos cancel
 */
const requestReject = async function (params: DeleteRequest) {
	try {
		if (
			params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			params.permission.indexOf("request") !== -1
		) {
			let step1 = await sosDao.requestReject(params);
			let step2 = await sosDao.findRequestByRequestId(params);
			let userDevice = await loginHistoryDao.findChunkDevice(step2.userId);
			let notificationData = {
				title: config.CONSTANT.NOTIFICATION_TITLE.REQUEST_REJECTED_BY_ADMIN,
				message: config.CONSTANT.NOTIFICATION_MESSAGE.REQUEST_REJECTED_BY_ADMIN,
				senderId: params.userId,
				notificationType: config.CONSTANT.NOTIFICATION_TYPE.REQUEST_REJECTED_BY_ADMIN
			};
			pushNotification.saveAndSendNotificationChunks(notificationData, userDevice);
			return sosConstant.MESSAGES.SUCCESS.SOS_CANCEL;
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};
/**
 * @function sos can sos cancel
 */
const sosCancel = async function (params: DeleteRequest) {
	try {
		let findResolvedSos = await sosDao.findSosByUserId(params);
		if (findResolvedSos) {
			let step1 = await sosDao.sosCancel(params);
			return sosConstant.MESSAGES.SUCCESS.SOS_CANCEL;
		} else {
			return Promise.reject(sosConstant.MESSAGES.ERROR.SOS_CANCEL);
		}
	} catch (error) {
		throw error;
	}
};
/**
 * @function resolveSos can sos cancel
 */
const resolveSos = async function (params: DeleteRequest) {
	try {
		if (
			params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			params.permission.indexOf("request") !== -1
		) {
			let step1 = await sosDao.resolveSos(params);
			let step2 = await sosDao.findSosBySosId(params);
			let userDevice = await loginHistoryDao.findChunkDevice(step2.userId);
			console.log(JSON.stringify(userDevice) + "userDevice for notification=======");
			let notificationData = {
				title: config.CONSTANT.NOTIFICATION_TITLE.SOS_RESOLVED_BY_ADMIN,
				message: config.CONSTANT.NOTIFICATION_MESSAGE.SOS_RESOLVED_BY_ADMIN,
				senderId: params.userId,
				notificationType: config.CONSTANT.NOTIFICATION_TYPE.SOS_RESOLVED_BY_ADMIN
			};
			pushNotification.saveAndSendNotificationChunks(notificationData, userDevice);
			return sosConstant.MESSAGES.SUCCESS.SOS_RESOLVE;
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};
/**
 * @function requestReject can sos cancel
 */
const sosReject = async function (params: DeleteRequest) {
	try {
		if (
			params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			params.permission.indexOf("request") !== -1
		) {
			let step1 = await sosDao.rejectSos(params);
			let step2 = await sosDao.findSosBySosId(params);
			let userDevice = await loginHistoryDao.findChunkDevice(step2.userId);
			let notificationData = {
				title: config.CONSTANT.NOTIFICATION_TITLE.SOS_REJECTED_BY_ADMIN,
				message: config.CONSTANT.NOTIFICATION_MESSAGE.SOS_REJECTED_BY_ADMIN,
				senderId: params.userId,
				notificationType: config.CONSTANT.NOTIFICATION_TYPE.SOS_REJECTED_BY_ADMIN
			};
			pushNotification.saveAndSendNotificationChunks(notificationData, userDevice);
			return sosConstant.MESSAGES.SUCCESS.SOS_CANCEL;
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};
/**
 * @description sos user cam mark as safe
 */
const sosMarkSafe = async function (params: DeleteRequest) {
	try {
		let findResolvedSos = await sosDao.findResolvedSosById(params);
		params.rosterId = findResolvedSos.roster._id;
		// Added SOS ID - Shivakumar A
		params.sosId = findResolvedSos._id;
		if (findResolvedSos) {
			let step1 = await sosDao.SosMarkSafe(params);
			return sosConstant.MESSAGES.SUCCESS.SOS_MARK_SAFE;
		} else {
			return Promise.reject(sosConstant.MESSAGES.ERROR.SOS_MARK_SAFE);
		}
	} catch (error) {
		throw error;
	}
};
/**
 * @function pendingSos
 */
const pendingSos = async function (params) {
	try {
		let step1 = await sosDao.findSosByUserId(params);
		if (step1) {
			return Promise.reject(sosConstant.MESSAGES.ERROR.SOS_PENDING);
		} else {
			return sosConstant.MESSAGES.SUCCESS.SOS_RESOLVED;
		}
	} catch (error) {
		throw error;
	}
};

/**
 * Contact to admin any query sos
 */
const sosAdmin = async function (params: UserQueryRequest) {
	try {
		params.created = Date.now();
		let roster = await rescheduleDao.roaterData(params.rosterId);
		let sosLocation = await userDao.latLongToAddress(params);
		params.sosLocation = sosLocation;
		let rosterData = roster;
		let employeeList = rosterData.route.employees;
		let empDetails;
		employeeList.forEach(async function (item) {

			if (item.empId === params.userId) {
				empDetails = item;
			}
		});
		if (params.userType === config.CONSTANT.USER_TYPE.EMPLOYEE) {
			params.pickUpLocation = empDetails.address;
		}
		params.roster = roster;
		let empUpdateObj = {
			empId: params.userId,
			sosGenerated: true,
			rosterId: params.rosterId,
			sosLocation: sosLocation,
			sosLatitude: params.latitude,
			sosLongitude: params.longitude,
		};
		let driverUpdateObj = {
			driverId: params.userId,
			sosGenerated: true,
			sosLatitude: params.latitude,
			sosLongitude: params.longitude,
			rosterId: params.rosterId,
			sosLocation: sosLocation
		};
		if (params.userType === config.CONSTANT.USER_TYPE.DRIVER) {
			await roasterDao.driverStatusUpdate(driverUpdateObj);
		} else {
			await roasterDao.empStatusUpdate(empUpdateObj);
		}
		let data = {
			empId: params.userId,
			userType: params.userType,
			sosLocation: sosLocation,
			latitude: params.latitude,
			longitude: params.longitude,
			name: params.name,
			sosGenerated: true,
		};
		let step2 = await sosDao.contactAdmin(params);
		let adminCompanyData = await adminDao.findAdminByCompanyCode(params);
		let notificationType;
		let senderId;
		// Added newCabBadgeId to params - Shivakumar A
		params.newCabBadgeId = params.newCabBadgeId;
		for (let item of adminCompanyData) {
			let title = "New sos";
			let message: any;
			if (params.driverId)
			{message = "New sos generated by" + " " + params.name + " " + "Driver Id :" + " " + params.driverId; }
			else
			{message = "New sos generated by" + " " + params.name + " " + "Employee Id :" + " " + params.employeeId; }
			let notificationData = {
				"receiverId": item._id,
				"title": title,
				"message": message,
				"notificationType": config.CONSTANT.NOTIFICATION_TYPE.SOS_NOTIFICATION_SEND_TO_ADMIN,
				"senderId": params.userId,
			};
			// let notificationData = _.extend(params, { "notificationType": notificationType, "targetAudience": senderId, "senderId": senderId });
			let step3 = await pushNotification.saveAndSendWebNotification(notificationData);
		}
		await executer('serviceRequest', 'adminTrackingCab', [params.rosterId, data]);
		return sosConstant.MESSAGES.SUCCESS.CONTACT_ADMIN;
	} catch (error) {
		throw error;
	}
};

export let sosController = {
	sosList,
	sosCancel,
	sosMarkSafe,
	pendingSos,
	sosAdmin,
	resolveSos,
	userQueryList,
	requestReject,
	resolveRequest,
	sosReject
};