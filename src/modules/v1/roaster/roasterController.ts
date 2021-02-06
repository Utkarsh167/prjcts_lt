"use strict";

import * as _ from "lodash";

import { AdminDao } from "@modules/v1/admin/AdminDao";
// import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import * as csv from "@lib/csv";
import { MailManager, RedisClient } from "@lib/index";
import * as tokenManager from "@lib/tokenManager";
import * as roasterConstant from "@modules/v1/roaster/roasterConstant";
import { RoasterDao, roasterMapper } from "@modules/v1/roaster/index";
import * as xlsx from "@lib/xlsx";
import { RedisScheduler } from "@lib/redisScheduler";
import { UserDao } from "@modules/v1/user/UserDao";
import { AdminNotificationDao } from "@modules/v1/adminNotification/AdminNotificationDao";
import * as pushNotification from '@utils/pushNotification';
import { BaseDao } from "@modules/v1/shared/BaseDao";

let adminDao = new AdminDao();
let mailManager = new MailManager();
let redisClient = new RedisClient();
let roasterDao = new RoasterDao();
let userDao = new UserDao();
let adminNotificationDao = new AdminNotificationDao();
let baseDao = new BaseDao();

/**
 * @function routeAdd
 * @description add cab and driver assign to cab,
 */
const roasterAdd = async function (params: RoasterAddRequest) {
	try {
		if (params.validFrom > params.validTill) {
			return Promise.reject("Valid from must be smaller than valid till!");
		}
		// let randomenumber = "ROS" + Math.floor(Math.random() * 100000) + 8;
		// params.roasterBadge = randomenumber;
		params.createdBy = params.userId;
		params.companyCode = params.companyCode;
		params.adminType = params.adminType;
		params.created = Date.now();
		/** VALIDATION ALL REQUEST BEFORE PROCEEDING **/

		await Promise.all(params.rosterData.map(async (val: any) => {
			let roaster: any;
			let obj = {
				val: val,
				validFrom: params.validFrom
			};
			roaster = await roasterDao.findRoaster(obj); // this.findOne('roasters', query, projection, options);
			let existingRosters: any = [];
			if (roaster.length > 0) {
				// return Promise.reject("Roster for this route already exists for some of the given dates!");
				existingRosters = _.map(roaster, '_id');
			}
			if (existingRosters.length > 0) {
				// return Promise.reject("Roster for this route already exists for some of the given dates!");
				await baseDao.deleteMany("roasters", { "_id": { "$in": existingRosters } });
			}
		}));

		/** PROCESSING REQUESTS **/
		await Promise.all(params.rosterData.map(async (val: any) => {
			let randomNumber = "ROS" + Math.floor(Math.random() * 100000) + 8;
			let dataToProcess = {
				validTill: params.validTill,
				validFrom: params.validFrom,
				roasterBadge: randomNumber,
				createdBy: params.createdBy,
				companyCode: params.companyCode,
				routeId: val.routeId,
				cabId: val.cabId,
				driverId: val.driverId,
				userId: params.userId
			};
			await roasterDao.roasterAdd(dataToProcess);
		}));
		return roasterConstant.MESSAGES.SUCCESS.ROASTER_REGISTERED;
	} catch (error) {
		throw error;
	}
};

/**
 * @function rosterContinue
 * @description Continue same roster for next month,
 */
const rosterContinue = async function (params: RoasterAddRequest) {
	try {
		if (params.validFrom > params.validTill) {
			return Promise.reject("Valid from must be smaller than valid till!");
		}
		// *********************Finding last roster for each route************************/
		let lastRoster = await roasterDao.findAllLastRosters(params); // this.findOne('roasters', query, projection, options);
		// console.log('lastRoster: ', lastRoster);
		// ************************************************************************/
		// let randomenumber = "ROS" + Math.floor(Math.random() * 100000) + 8;
		// params.roasterBadge = randomenumber;
		params.createdBy = params.userId;
		params.companyCode = params.companyCode;
		params.adminType = params.adminType;
		params.created = Date.now();
		/** VALIDATION ALL REQUEST BEFORE PROCEEDING **/
		await Promise.all(lastRoster.map(async (val: any) => {
			// console.log('val: ', val);
			let roaster: any;
			let obj = {
				val: { routeId: val._id },
				validFrom: params.validFrom
			};
			roaster = await roasterDao.findRoaster(obj); // this.findOne('roasters', query, projection, options);
			if (roaster.length > 0) {
				// return Promise.reject("Cab or route already created roasters.");
				return Promise.reject("Roster for this route already exists for some of the given dates!");
			}
		}));

		/** PROCESSING REQUESTS **/
		await Promise.all(lastRoster.map(async (val: any) => {
			// console.log('val: ', val);
			let randomNumber = "ROS" + Math.floor(Math.random() * 100000) + 8;
			let dataToProcess = {
				validTill: params.validTill,
				validFrom: params.validFrom,
				roasterBadge: randomNumber,
				createdBy: params.createdBy,
				companyCode: params.companyCode,
				routeId: val._id,
				userId: params.userId,
				created: params.created,
				oldRosterDate: val.rosterDate
			};
			await roasterDao.rosterContinue(dataToProcess);
		}));
		return roasterConstant.MESSAGES.SUCCESS.ROASTER_REGISTERED;
	} catch (error) {
		throw error;
	}
};

// Update route info
const roasterUpdate = async function (params: RoasterUpdateRequest) {
	try {
		if (
			params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			params.permission.indexOf("roster") !== -1
		) {
			let step1 = await roasterDao.roasterUpdate(params);
			return roasterConstant.MESSAGES.SUCCESS.ROASTER_UPDATE;
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};
/**
 * @function tripCancelByEmp
 * @param params rosterId, reason
 * @description employee cancel ride future ride
 */
const tripCancelByEmp = async function (params: RoasterTripCancelRequest) {
	try {
		let step1 = await roasterDao.tripCancel(params);
		return roasterConstant.MESSAGES.SUCCESS.ROASTER_UPDATE;
	} catch (error) {
		throw error;
	}
};
/**
 * Upadte user rating on trip
 */
const userRatingUpdate = async function (params: RoasterUpdateRequest) {
	try {
		// ((Avg Rating * Total Rating) + new Rating) / (Total Rating + 1)
		let rosterDetails = await roasterDao.roasterData(params.rosterId);
		let driverId = rosterDetails.cab.driverMapped[0]._id;
		let oldAvgRating = rosterDetails.avgRating ? rosterDetails.avgRating : 0;
		let oldTotalRating = rosterDetails.totalRating ? rosterDetails.totalRating : 0;
		let calculateAvg = ((oldAvgRating * oldTotalRating) + params.rating) / (oldTotalRating + 1);
		let newUserId: any = {};
		newUserId.userId = driverId;
		let userDetails = await userDao.findUserById(newUserId);
		let userAvgRating = userDetails.avgRating ? userDetails.avgRating : 0;
		let userTotalRating = userDetails.totalRating ? userDetails.totalRating : 0;
		let calculateUserRating = ((userAvgRating * userTotalRating) + params.rating) / (userTotalRating + 1);
		newUserId.avgRating = calculateUserRating;
		newUserId.totalRating = userTotalRating + 1;
		await userDao.ratingUserRoster(newUserId);
		params.avgRating = calculateAvg;
		params.totalRating = oldTotalRating + 1;
		await roasterDao.ratingRoster(params);
		let step1 = await roasterDao.ratingEmpRoster(params);
		return roasterConstant.MESSAGES.SUCCESS.RATING_UPDATE;
	} catch (error) {
		throw error;
	}
};

/**
 * @param params
 * Roaster list
 */
const rosterListEmp = async function (params: ListingRequest) {
	try {
		let response: any = {};
		response = await roasterDao.rosterListEmp(params);
		let result = response.roster;
		let result1 = response.isNextPage;
		return roasterConstant.MESSAGES.SUCCESS.ROASTER_EMP_LIST(result, result1);
	} catch (error) {
		throw error;
	}
};
/**
 * @function rosterListReschedule
 * @param params fromDate
 */
const rosterListReschedule = async function (params: ListingRequest) {
	try {
		let response: any = {};
		response = await roasterDao.rosterRescheduleEmp(params);
		return roasterConstant.MESSAGES.SUCCESS.ROASTER_LIST(response);
	} catch (error) {
		throw error;
	}
};

/**
 * @function rosterEmp
 * @description employee get driver and cab and employee list who ride with him
 * @param params
 */
const rosterEmp = async function (params: TokenData) {
    try {
    let response: any = [];
    response = await roasterDao.rosterEmp(params);
    // crfTimings admin data - satyam
	let response_admin: any = {};
    response_admin = await roasterDao.adminData(params);
    response.push( { loginCrf: response_admin.loginCutoff, logoutCrf: response_admin.logoutCutoff, crfLimitMonth: response_admin.crfLimitMonth } );
    return roasterConstant.MESSAGES.SUCCESS.ROASTER_LIST(response);
    } catch (error) {
    throw error;
    }
   };
/**
 * @function rosterListDriver
 * @description employee get driver and cab and employee list who ride with him
 * @param params
 */
const rosterListDriver = async function (params: ListingRequest) {
	try {
		let response: any = {};
		response = await roasterDao.rosterListDriver(params);
		let result = response.roster;
		let result1 = response.isNextPage;
		return roasterConstant.MESSAGES.SUCCESS.ROASTER_DRIVER_LIST(result, result1);
	} catch (error) {
		throw error;
	}
};
/**
 * @function rosterDriver
 * @description employee get driver and cab and employee list who ride with him
 * @param params
 */
const rosterDriver = async function (params: TokenData) {
	try {
		let response: any = {};
		response = await roasterDao.nextTripDriver(params);
		return roasterConstant.MESSAGES.SUCCESS.ROASTER_LIST(response);
	} catch (error) {
		throw error;
	}
};

/**
 * @function checkAllrosterDriver
 * @description check for missed trips
 * @param params - Shivakumar A
 */
const checkAllrosterDriver = async function () {
	try {
		let response: any = {};
		response = await roasterDao.checkAllnextTripDriver();
		return roasterConstant.MESSAGES.SUCCESS.ROASTER_LIST(response);
	} catch (error) {
		throw error;
	}
};

/**
 * @function driverTripscheduler
 * @param data
 */
const driverTripscheduler = async function (data) {
	try {
		data.userId = "12232323232";
		let payload = {
			jobName: config.CONSTANT.JOB_SCHEDULER_TYPE.DRIVER_BEFORE_START_RIDE,
			time: 1565357280000,
			params: { ...data }
		};
		let step = await RedisScheduler.init(payload);
	} catch (error) {
		throw error;
	}
};
/**
 * @function rosterAdmin
 */
const rosterAdmin = async function (params: ListingRequest) {
	try {
		// if (params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN || params.permission.indexOf("roster") !== -1) {
		// Added Access for Subadmin - Shivakumar A
		if (params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN || params.adminType === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN ||
			params.permission.indexOf("roster") !== -1) {
			let step1 = await adminDao.findAdminById(params);
			// if (step1.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||	step1.permission.indexOf("roster") !== -1) {
			// Added Access for Subadmin - Shivakumar A
			if (step1.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN || params.adminType === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN || step1.permission.indexOf("roster") !== -1) {
				let response: any = {};
				let step2 = await roasterDao.rosterAdmin(params).then(function (result) {
					response.rosterList = result[0];
					response.totalCount = result[1] || 0;
				});
				return roasterConstant.MESSAGES.SUCCESS.ROASTER_LIST(response);
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
 * @function rosterEndNotified
 * @param params rosterEndDate
 * @description before 5 day roster expired notified to admin using scheduler
 */
const rosterEndNotified = async function () {
	try {
		let rosterExpiredList = await roasterDao.rosterEndNotified();
		// console.log("======================" + JSON.stringify(rosterExpiredList) + "+++++++++++++++++++++++");
		let params: any = {};
		let notificationType;
		let audience: any = {};
		let senderId;
		for (let item of rosterExpiredList) {
			// 	senderId = item.createdBy;
			// 	params.platform = config.CONSTANT.DEVICE_TYPE.WEB;
			// 	params.adminType = config.CONSTANT.ADMIN_TYPE.ADMIN;
			// 	params.createdBy = item.createdBy;
			// 	notificationType = config.CONSTANT.NOTIFICATION_TYPE.ROSTER_EXPIRED_NOTIFIED;
			// 	// let audienceDetails = await adminDao.findAdminById(params);
			// 	params.audience = config.CONSTANT.NOTIFICATION_AUDIENCE.ADMIN;
			// }
			// let step2 = await adminNotificationDao.addNotification(params);
			let title = "Roster expired";
			let message = "I would like to inform your roster route batch no -:" + item.routeBadge + " " + "is espired within 5 day's. Please extend your roster";
			let notificationData = {
				"receiverId": item.createdBy,
				"title": title,
				"message": message,
				"notificationType": config.CONSTANT.NOTIFICATION_TYPE.ROSTER_EXPIRED_NOTIFIED,
				"senderId": item.createdBy,
			};
			// let notificationData = _.extend(params, { "notificationType": notificationType, "targetAudience": senderId, "senderId": senderId });
			let step3 = await pushNotification.saveAndSendWebNotification(notificationData);
		}
		// params = _.extend(params, { "notificationId": step2._id, "sentCount": step3 });
		// let step4 = await adminNotificationDao.updateNotificationCount(params);
		return roasterConstant.MESSAGES.SUCCESS.ADD_NOTIFICATION;

	} catch (error) {
		throw error;
	}
};

export let roasterController = {
	roasterAdd,
	rosterContinue,
	roasterUpdate,
	rosterDriver,
	rosterEmp,
	rosterListEmp,
	driverTripscheduler,
	rosterListDriver,
	rosterAdmin,
	rosterListReschedule,
	userRatingUpdate,
	rosterEndNotified,
	tripCancelByEmp,
	// Added checkAllrosterDriver - Shivakumar A
	checkAllrosterDriver
};