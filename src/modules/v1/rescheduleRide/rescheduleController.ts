"use strict";

import * as _ from "lodash";

import { AdminDao } from "@modules/v1/admin/AdminDao";
import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import * as csv from "@lib/csv";
import { MailManager, RedisClient } from "@lib/index";
import * as tokenManager from "@lib/tokenManager";
import { LoginHistoryDao } from '@modules/v1/loginHistory/LoginHistoryDao';
import * as rescheduleConstant from "@modules/v1/rescheduleRide/rescheduleConstant";
import { RescheduleDao } from "@modules/v1/rescheduleRide/RescheduleDao";
import * as pushManager from "@lib/pushNotification/pushManager";
import * as pushNotification from '@utils/pushNotification';
import { RoasterDao } from "@modules/v1/roaster/RoasterDao";
import { CabRouteDao } from "@modules/v1/route/RouteDao";

import * as xlsx from "@lib/xlsx";
import { BaseDao } from "../shared/BaseDao";

let adminDao = new AdminDao();
let mailManager = new MailManager();
let redisClient = new RedisClient();
let rescheduleDao = new RescheduleDao();
let loginHistoryDao = new LoginHistoryDao();
let roasterDao = new RoasterDao();
let routeDao = new CabRouteDao();

/**
 * @function rescheduleList
 */
const rescheduleList = async function (params: ListingRequest) {
	try {
		if (
			params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			// Added SUB ADMIN ACCESS - Shivakumar A
			params.adminType === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN ||
			params.permission.indexOf("roster") !== -1
		) {
			let step1 = await adminDao.findAdminById(params);
			if (
				step1.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
				// Added SUB ADMIN ACCESS - Shivakumar A
			    step1.adminType === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN ||
				step1.permission.indexOf("roster") !== -1
			) {
				let response: any = {};
				let step2 = await rescheduleDao.rescheduleList(params).then(function (result) {
					response.rescheduleList = result[0];
					response.totalCount = result[1] || 0;
				});
				return rescheduleConstant.MESSAGES.SUCCESS.RESCHEDULE_LIST(response);
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
const cancelledList = async function (params: ListingRequest) {
	try {
		if (
			params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			// Added SUB ADMIN ACCESS - Shivakumar A
			params.adminType === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN ||
			params.permission.indexOf("roster") !== -1
		) {
			let step1 = await adminDao.findAdminById(params);
			if (
				step1.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			    // Added SUB ADMIN ACCESS - Shivakumar A
			    step1.adminType === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN ||
				step1.permission.indexOf("roster") !== -1
			) {
				let response: any = {};
				let step2 = await rescheduleDao.cancelledList(params).then(function (result) {
					response.rescheduleList = result[0];
					response.totalCount = result[1] || 0;
					// add pendingCounts to response - Shivakumar A
					response.pendingSosCount = result[2] || 0;
					response.pendingAddressCount = result[3] || 0;
					response.pendingRescheduleCount = result[4] || 0;
					response.pendingOtherRequestsCount = result[5] || 0;
					response.pendingCancelledCount = result[6] || 0;

					if (result[7][0] === undefined) {
						response.pendingNoShowCount = 0;
					} else {
						response.pendingNoShowCount = result[7][0].count;
					}

				});
				return rescheduleConstant.MESSAGES.SUCCESS.CANCELLED_LIST(response);
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
 * @function rescheduleCancel c
 * Admin can cancel reschedule request
 */
const rescheduleCancel = async function (params: TripCancelRequest) {
	try {
		let step1 = await rescheduleDao.rescheduleCancel(params);
		let step2 = await rescheduleDao.findRescheduleById(params);
		let userDevice = await loginHistoryDao.findChunkDevice(step2.userId);
		let notificationData = {
			title: config.CONSTANT.NOTIFICATION_TITLE.TRIP_REQUEST_CANCEL_BY_ADMIN,
			message: config.CONSTANT.NOTIFICATION_MESSAGE.TRIP_REQUEST_CANCEL_BY_ADMIN,
			senderId: params.userId,
			notificationType: config.CONSTANT.NOTIFICATION_TYPE.TRIP_REQUEST_CANCEL_BY_ADMIN
		};
		pushNotification.saveAndSendNotificationChunks(notificationData, userDevice);
		return rescheduleConstant.MESSAGES.SUCCESS.RESCHEDULE_CANCEL;
	} catch (error) {
		throw error;
	}
};
/**
 * @param params rescheduleId
 */
const rescheduleAccept = async function (params: TripAcceptRequest) {
	try {
		let step1 = await rescheduleDao.rescheduleAccept(params);
		let step2 = await rescheduleDao.findRescheduleById(params);
		let userDevice = await loginHistoryDao.findChunkDevice(step2.userId);
		let notificationData = {
			title: config.CONSTANT.NOTIFICATION_TITLE.TRIP_REQUEST_RESCHEDULE_BY_ADMIN,
			message: config.CONSTANT.NOTIFICATION_MESSAGE.TRIP_REQUEST_RESCHEDULE_BY_ADMIN,
			senderId: params.userId,
			notificationType: config.CONSTANT.NOTIFICATION_TYPE.TRIP_REQUEST_RESCHEDULE_BY_ADMIN
		};
		pushNotification.saveAndSendNotificationChunks(notificationData, userDevice);
		return rescheduleConstant.MESSAGES.SUCCESS.TRIP_ACCEPT;
	} catch (error) {
		throw error;
	}
};

/**
 * Contact to admin for reschedule trip
 */
const rescheduleTrip = async function (params: RescheduleRequest) {
	try {
		/**
		 * If admin panel done then it will uncomment code fo check no of request exceeded or not
		 */
		let requestCountMonth = await rescheduleDao.monthRescheduleCount(params);
		let adminData = await adminDao.findAdminByCreatedBy(params);
		if (requestCountMonth >= adminData.crfLimitMonth) {
			return Promise.reject(rescheduleConstant.MESSAGES.ERROR.REQUEST_EXCEED);
		}
		params.created = Date.now();
		let roster = await rescheduleDao.roaterData(params.rosterId);
		let rosterData = roster;
		let employeeList = rosterData.route.employees;
		let empDetails;
		employeeList.forEach(async function (item) {

			if (item.empId === params.userId) {
				empDetails = item;
			}
		});
		// Added newCabBadgeId and gender to params - Shivakumar A
		params.newCabBadgeId = rosterData.cab.routeNo;
		params.gender = empDetails.gender;

		params.companyCode = params.companyCode;
		params.scheduleTime = roster.rosterDate;
		params.roster = roster;
		params.requestType = config.CONSTANT.TRIP_RESCHEDULE.RESCHEDULE;
		params.reason = params.reason;
		params.pickUpLocation = empDetails.address;
		let updateObj = {
			empId: params.userId,
			pickupStatus: config.CONSTANT.EMP_PICKUP_STATUS.RESCHEDULE,
			rosterId: params.rosterId,
			noShowReason: params.reason
		};
		let oldGroupObj = { userId: params.userId, routeId: params.roster.route._id };
		let oldGroupFormed = await routeDao.removeFromGroup(oldGroupObj);
		params.oldGroupFormed = oldGroupFormed.oldGroupFormed;
		let adjustInGroupObj = {
			userId: params.userId,
			shiftName: params.shiftName,
			shiftType: params.shiftType,
			empShifted: oldGroupFormed.empShifted,
			rescheduleRequest: true,
			rosterDate: params.scheduleTime
		};
		let adjustInGroup = await routeDao.adjustInGroup(adjustInGroupObj);
		if (adjustInGroup) {
			let rosterQuery = {
				"route._id": adjustInGroup.grpDbId,
				"rosterDate": params.scheduleTime
			};
			let rosterFound = await roasterDao.findOne("roasters", rosterQuery, { _id: 1 }, {});
			params.newRosterId = rosterFound._id;
			params.newGroupFormed = adjustInGroup;
			params.rosterFound = true;
		}
		else {
			let newGroupObj = {
				userId: params.userId,
				shiftName: params.shiftName,
				shiftType: params.shiftType,
				shiftTime: params.shiftTime,
				empShifted: oldGroupFormed.empShifted,
				oldRoute: params.roster.route
			};
			let newGroup = await routeDao.createSingleEmpGroup(newGroupObj);
			params.newGroupFormed = newGroup;
			params.rosterFound = false;
		}
		await roasterDao.empStatusUpdate(updateObj);
		let step2 = await rescheduleDao.rescheduleTrip(params);
		return rescheduleConstant.MESSAGES.SUCCESS.CONTACT_ADMIN;
	} catch (error) {
		throw error;
	}
};
/**
 * User can cancel future trip
 * @param params
 */
const cancelTrip = async function (params: RescheduleRequest) {
	try {
		params.created = Date.now();
		let step2 = await rescheduleDao.cancelTrip(params);
		return rescheduleConstant.MESSAGES.SUCCESS.TRIP_CANCEL;
	} catch (error) {
		throw error;
	}
};
/**
 * User get shift of company
 * @param params
 */
const shiftList = async function (params: TokenData) {
	try {
		params.created = Date.now();
		let step2 = await rescheduleDao.findAdminShift(params);
		return rescheduleConstant.MESSAGES.SUCCESS.SHIFT_LIST(step2);
	} catch (error) {
		throw error;
	}
};

/*
Get No Show List - Shivakumar A
*/
const noshowList = async function (params: ListingRequest) {
	try {
		if (
			params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			params.adminType === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN ||
			params.permission.indexOf("roster") !== -1
		) {
			let step1 = await adminDao.findAdminById(params);
			if (
				step1.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			    step1.adminType === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN ||
				step1.permission.indexOf("roster") !== -1
			) {
				let response: any = {};
				let step2 = await rescheduleDao.noshowList(params).then(function (result) {
					response.noshowList = result[0];

					if (result[1][0] === undefined) {
						response.totalCount =  0;
					} else {
						response.totalCount = result[1][0].count;
					}
				});
				return rescheduleConstant.MESSAGES.SUCCESS.NOSHOW_LIST(response);
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

export let rescheduleController = {
	rescheduleList,
	rescheduleCancel,
	rescheduleAccept,
	rescheduleTrip,
	cancelTrip,
	shiftList,
	cancelledList,
	// Added noshowList - Shivakumar A
	noshowList
};