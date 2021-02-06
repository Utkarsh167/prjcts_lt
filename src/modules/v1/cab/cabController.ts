"use strict";

import * as _ from "lodash";

import { AdminDao } from "@modules/v1/admin/AdminDao";
import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import * as csv from "@lib/csv";
import { MailManager, RedisClient } from "@lib/index";
import * as tokenManager from "@lib/tokenManager";
import * as cabConstant from "@modules/v1/cab/cabConstant";
import { CabDao, cabMapper } from "@modules/v1/cab/index";
import * as xlsx from "@lib/xlsx";
import { AuditLogDao } from "@modules/v1/auditLog/AuditLogDao";
import { VendorDao } from "@modules/v1/vendor";

let adminDao = new AdminDao();
let mailManager = new MailManager();
let redisClient = new RedisClient();
let cabDao = new CabDao();
let auditLogDao = new AuditLogDao();

/**
 * @function cabAdd
 * @description add cab and driver assign to cab,
 */
const cabAdd = async function (params: CabAddRequest, tokenData: TokenData) {
	try {
		if (
			params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			params.permission.indexOf("cab") !== -1
		) {
			let randomenumber = "CA" + Math.floor(Math.random() * 100000) + 8;
			params.cabBadge = randomenumber;
			params.createdBy = params.userId;
			params.companyCode = params.companyCode;
			params.adminType = params.adminType;
			params.companyCode = params.companyCode;
			params.created = Date.now();
			let step2 = await cabDao.cabAdd(params);
			step2.moduleName = config.CONSTANT.MODULE_KEY.CAB;
			step2.message = "New cab" + " " + randomenumber + " " + "is added";
			step2.targetName = randomenumber;
			let step4 = await auditLogDao.addLog(step2, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.ADD);
			return cabConstant.MESSAGES.SUCCESS.CAB_REGISTERED;
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};
// Update cab info
const updateCab = async function (params: CabUpdateRequest, tokenData: TokenData) {
	try {
		if (
			tokenData.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			tokenData.permission.indexOf("cab") !== -1
		) {
			let step1 = await cabDao.editCab(params);
			step1.moduleName = config.CONSTANT.MODULE_KEY.CAB;
			step1.message = step1.cabBadge + " " + "Cab has been updated";
			step1.targetName = step1.cabBadge;
			let step2 = await auditLogDao.addLog(step1, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.EDIT);
			return cabConstant.MESSAGES.SUCCESS.CAB_UPDATE;
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};

// Driver mapping with cab
const driverMappingCab = async function (params: CabDriverMappRequest, tokenData: TokenData) {
	try {
		if (
			tokenData.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			tokenData.permission.indexOf("cab") !== -1
		) {
			switch (params.mappedType) {
				case config.CONSTANT.DRIVER_ASSIGNED.ASSIGNED:
					let step1 = await cabDao.driverAssign(params);
					step1.moduleName = config.CONSTANT.MODULE_KEY.CAB;
					step1.message = "Driver assigned in cab" + " " + step1.cabBadge;
					step1.targetName = step1.cabBadge;
					let step3 = await auditLogDao.addLog(step1, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.EDIT);
					return cabConstant.MESSAGES.SUCCESS.DRIVER_ASSIGN;
				// case config.CONSTANT.DRIVER_ASSIGNED.UNASSIGNED:
				// 	let step2 = await cabDao.driverUnAssign(params);
				// 	return cabConstant.MESSAGES.SUCCESS.DRIVER_UNASSIGN;
				case config.CONSTANT.DRIVER_ASSIGNED.UPDATE:
					let step2 = await cabDao.cabDriverUpdate(params);
					step2.moduleName = config.CONSTANT.MODULE_KEY.CAB;
					step2.message = "Driver assigned change in cab" + " " + step2.cabBadge;
					step2.targetName = step2.cabBadge;
					let step4 = await auditLogDao.addLog(step2, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.EDIT);
					return cabConstant.MESSAGES.SUCCESS.DRIVER_UPDATE;
			}
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};
/**
 * @function cabList
 */
const cabList = async function (params: ListingRequest) {
	try {
		// if (
		// 	params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
		// 	params.permission.indexOf("cab") !== -1
		// ) {
		// Added Access for Subadmin - Shivakumar A
		if (params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN || params.adminType === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN ||
			params.permission.indexOf("cab") !== -1) {

			let step1 = await adminDao.findAdminById(params);
			// if (
			// 	step1.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			// 	step1.permission.indexOf("cab") !== -1
			// ) {
			// Added Access for Subadmin - Shivakumar A
			if (
				step1.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN || step1.adminType === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN ||
				step1.permission.indexOf("cab") !== -1
			) {
				let response: any = {};
				let step2 = await cabDao.cabList(params).then(function (result) {
					response.userList = result[0];
					response.totalCount = result[1] || 0;
				});
				return cabConstant.MESSAGES.SUCCESS.CAB_LIST(response);
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
 * @function cabList
 */
const driverMappedList = async function (params: ListingRequest) {
	try {
		if (
			params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			params.permission.indexOf("cab") !== -1
		) {
			let step1 = await adminDao.findAdminById(params);
			if (
				step1.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
				step1.permission.indexOf("cab") !== -1
			) {
				let response: any = {};
				let step2 = await cabDao.driverMappedList(params).then(function (result) {
					response.userList = result[0];
					// response.totalCount = result[0].length || 0;
					// Added total count - Shivakumar A
                    response.totalCount = result[1] || 0;
				});
				return cabConstant.MESSAGES.SUCCESS.CAB_LIST(response);
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
 * @function cabDetails
 */
const cabDetails = async function (params: CabId) {
	try {
		let step1 = await cabDao.findCabById(params);
		return cabConstant.MESSAGES.SUCCESS.CAB_DETAILS(step1);
	} catch (error) {
		throw error;
	}
};
/**
 * @function deleteCab
 * @description if IS_REDIS_ENABLE set to true,
 * than redisClient.storeSet() function saves value in redis.
 */
const deleteCab = async function (params: DeleteRequest, tokenData: TokenData) {
	try {
		if (
			tokenData.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			tokenData.permission.indexOf("cab") !== -1
		) {
			let isExist = await cabDao.isCabAlreadyAssigned(params);
			if (isExist) {
				return Promise.reject(cabConstant.MESSAGES.ERROR.CAB_ASSIGN_IN_TRIP);
			}
			let step1 = await cabDao.deleteCab(params);
			step1.moduleName = config.CONSTANT.MODULE_KEY.CAB;
			step1.message = step1.cabBadge + " " + "Cab has been archived";
			step1.targetName = step1.cabBadge;
			let step2 = await auditLogDao.addLog(step1, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.ARCHIVE);
			return cabConstant.MESSAGES.SUCCESS.DELETE_CAB;
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};
/**
 * @function blockUnblock
 */
const blockUnblock = async function (params: BlockRequest, tokenData: TokenData) {
	try {
		if (
			tokenData.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			tokenData.permission.indexOf("cab") !== -1
		) {
			switch (params.status) {
				case config.CONSTANT.STATUS.BLOCKED:
					let isExist = await cabDao.isCabAlreadyAssigned(params);
					if (isExist) {
						return Promise.reject(cabConstant.MESSAGES.ERROR.CAB_ASSIGN_IN_ROUTE_TRIP);
					}
					let step1 = await cabDao.blockUnblock(params);
					step1.moduleName = config.CONSTANT.MODULE_KEY.CAB;
					step1.message = step1.cabBadge + " " + "Cab has been blocked";
					step1.targetName = step1.cabBadge;
					let step3 = await auditLogDao.addLog(step1, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.BLOCK);
					return cabConstant.MESSAGES.SUCCESS.BLOCK_CAB;
				case config.CONSTANT.STATUS.UN_BLOCKED:
					let step2 = await cabDao.blockUnblock(params);
					step2.moduleName = config.CONSTANT.MODULE_KEY.CAB;
					step2.message = step2.cabBadge + " " + "Cab has been unblocked";
					step2.targetName = step2.cabBadge;
					let step4 = await auditLogDao.addLog(step2, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.UNBLOCK);
					return cabConstant.MESSAGES.SUCCESS.UNBLOCK_CAB;
			}
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};
/**
 * Company shift get from login admin profile
 */
const companyShift = async function (params) {
	try {
		let step1 = await cabDao.companyShift(params);
		return cabConstant.MESSAGES.SUCCESS.COMPANY_SHIFT(step1);
	} catch (error) {
		throw error;
	}
};

/**
 * @function cabOnlineList
 */
const cabOnlineList = async function (params: TokenData) {
	try {
		if (
			params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			params.permission.indexOf("rtls") !== -1
		) {
			let step1 = await adminDao.findAdminById(params);
			if (
				step1.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
				step1.permission.indexOf("rtls") !== -1
			) {
				let response: any = {};
				let result = await cabDao.onlineCabList(params);
				response.roster = result[0];
				response.totalCount = result[1];
				return cabConstant.MESSAGES.SUCCESS.CAB_LIST(response);
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
 * @param params
 * Roaster list
 * @description on rtls current date ongoing scheduled and completed trip list
 */
const cabRoasterList = async function (params: ListingRequest) {
	try {
		let response: any = {};
		let result = await cabDao.cabRoasterList(params);
		response.roster = result[0];
		response.totalCount = result[1];
		response.totalScheduled = result[2];
		response.totalCompleted = result[3];
		response.totalOngoing = result[4];
		response.totalCriticalSos = result[5];
		// Added totalMissed Count - Shivakumar A
		response.totalMissed = result[6];
		return cabConstant.MESSAGES.SUCCESS.CAB_LIST(response);
	} catch (error) {
		throw error;
	}
};
/**
 * @param params
 * Roaster cab
 * @description ongoing trip cab list showing on map
 */
const cabRoaster = async function (params: ListingRequest) {
	try {
		let response: any = {};
		let result = await cabDao.cabRoaster(params);
		// response.roster = result[0];
		// response.totalCount = result[1];
		return cabConstant.MESSAGES.SUCCESS.CAB_LIST(result);
	} catch (error) {
		throw error;
	}
};
/**
 * @function cabListing
 */
const cabListing = async function (params: CabListingRequest) {
	try {
		// let searchKeyNo = params.searchKey ? params.searchKey.length : 0;
		// if (searchKeyNo >= 3) {
		let response: any = {};
		response = await cabDao.cabListing(params);
		return cabConstant.MESSAGES.SUCCESS.CAB_LIST(response);
		// } else {
		// 	return Promise.reject(vendorConstant.MESSAGES.ERROR.SEARCH_KEY_LENGTH);
		// }

	} catch (error) {
		throw error;
	}
};
/**
 * @function cabListing
 */
const cabListingWihDriver = async function (params: CabDriverListingRequest) {
	try {
		// let searchKeyNo = params.searchKey ? params.searchKey.length : 0;
		// if (searchKeyNo >= 3) {
		let response: any = {};
		response = await cabDao.cabListingWithDriver(params);
		return cabConstant.MESSAGES.SUCCESS.CAB_LIST(response);
		// } else {
		// 	return Promise.reject(vendorConstant.MESSAGES.ERROR.SEARCH_KEY_LENGTH);
		// }

	} catch (error) {
		throw error;
	}
};
/**
 * @function bulkCabSignup
 */
const bulkCabSignup = async function (params: CabAddRequest) {
	try {
		let cabArr = [];
		let vendorData: any = {};
		let noCab = {};
		// let json: any = await csv.readAndParseCSV(params.file); // for csv file
		let json: any = await xlsx.readAndParseXLSX(params.file);
		for (let item of json) {
			if (!item.cabModel || !item.seatingCapacity || !item.registrationNo || !item.statePermitNumber || !item.countryPermitNumber || !item.vendorBadgeNo || !item.color || !item.cabBadgeNo) {
				return Promise.reject(cabConstant.MESSAGES.ERROR.INVALID_DATA);
			}
			if (item.vendorBadgeNo) {
				let vendorDetails = await cabDao.getVendorDetails(item);
				if (vendorDetails) {
					vendorData = {
						_id: vendorDetails._id,
						name: vendorDetails.name,
						email: vendorDetails.email,
						countryCode: vendorDetails.countryCode,
						mobileNo: vendorDetails.mobileNo,
						profilePicture: vendorDetails.profilePicture,
						badgeNo: vendorDetails.badgeNo,
					};
				} else {
					return Promise.reject(cabConstant.MESSAGES.ERROR.INVALID_VENDOR_BADGE);
				}
			}
			if (item.cabBadgeNo) {
				let param: any = {};
				param.routeNo = item.cabBadgeNo;
				let cabBadgeNoExist = await cabDao.isCabBadgeNoUnique(param);
				if (cabBadgeNoExist) {
					return Promise.reject(cabConstant.MESSAGES.ERROR.BADGE_NO_EXIST);
				}
			}
			if (item.registrationNo) {
				let param: any = {};
				param.registrationNo = item.registrationNo;
				let registrationNoExist = await cabDao.isRegistrationNoUnique(param);
				if (registrationNoExist) {
					return Promise.reject(cabConstant.MESSAGES.ERROR.REGISTRATION_NO_EXIST);
				}
			}

			let randomenumber = "CA" + Math.floor(Math.random() * 100000) + 8;
			let obj = {
				vendor: vendorData,
				cabBadge: randomenumber,
				cabModel: item.cabModel,
				routeNo: item.cabBadgeNo,
				seatingCapacity: item.seatingCapacity,
				registrationNo: item.registrationNo,
				statePermitNumber: item.statePermitNumber,
				countryPermitNumber: item.countryPermitNumber,
				color: item.color,
				createdBy: params.userId,
				companyCode: params.companyCode,
				adminType: params.adminType,
				created: Date.now(),
				status: config.CONSTANT.STATUS.UN_BLOCKED
			};

			let isExistInRequest = await _.find(cabArr, (obj) => { return (obj.registrationNo === item.registrationNo.toString() || obj.cabBadgeNo === item.cabBadgeNo); });
			if (isExistInRequest) {
				return Promise.reject(cabConstant.MESSAGES.ERROR.DUPLICATE_DATA);
			}
			else {
				cabArr.push(obj);
			}
			noCab[item.vendorBadgeNo] ? noCab[item.vendorBadgeNo]++ : noCab[item.vendorBadgeNo] = 1;
			// cabArr.push(obj);
		}
		let step2 = await cabDao.bulkCabSignup(cabArr);

		for (let key in noCab) {

			let paramData = {
				vendorBadgeNo: key,
				cabCount: noCab[key]
			};
			await cabDao.vendorCabCount(paramData);
		}
		return cabConstant.MESSAGES.SUCCESS.IMPORT_CAB;
	} catch (error) {
		throw error;
	}
};
/**
 * @description cab registration no check unique
 * @function isRegistrationNoUnique
 */
const isRegistrationNoUnique = async function (params: IsRegistrationNoUnique) {
	try {
		let response: any = {};
		let step = await cabDao.isRegistrationNoUnique(params);
		if (step) {
			return cabConstant.MESSAGES.ERROR.REGISTRATION_NO_EXIST;
		} else {
			return cabConstant.MESSAGES.SUCCESS.IS_REGISTRATION_NO;
		}

	} catch (error) {
		throw error;
	}
};

/**
 * @description badge no is unique check
 * @param params routeNo
 */
const isCabBadgeNoUnique = async function (params: IsCabBadgeNoUnique) {
	try {
		let response: any = {};
		let step = await cabDao.isCabBadgeNoUnique(params);
		if (step) {
			return cabConstant.MESSAGES.ERROR.BADGE_NO_EXIST;
		} else {
			return cabConstant.MESSAGES.SUCCESS.IS_BADGE_NO;
		}

	} catch (error) {
		throw error;
	}
};

export let cabController = {
	cabAdd,
	updateCab,
	cabList,
	cabDetails,
	deleteCab,
	blockUnblock,
	driverMappingCab,
	companyShift,
	driverMappedList,
	cabOnlineList,
	cabRoasterList,
	cabRoaster,
	cabListing,
	bulkCabSignup,
	cabListingWihDriver,
	isRegistrationNoUnique,
	isCabBadgeNoUnique
};