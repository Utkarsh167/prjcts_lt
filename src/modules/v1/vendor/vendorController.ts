"use strict";

import * as _ from "lodash";

import { AdminDao } from "@modules/v1/admin/AdminDao";
import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import * as csv from "@lib/csv";
import { MailManager, RedisClient } from "@lib/index";
import * as tokenManager from "@lib/tokenManager";
import * as vendorConstant from "@modules/v1/vendor/vendorConstant";
import { VendorDao, vendorMapper } from "@modules/v1/vendor/index";
import { AuditLogDao } from "@modules/v1/auditLog/AuditLogDao";

import * as xlsx from "@lib/xlsx";
// import { CabDao } from "../cab";

import { CabDao } from "@modules/v1/cab/CabDao";

let adminDao = new AdminDao();
let mailManager = new MailManager();
let redisClient = new RedisClient();
let vendorDao = new VendorDao();
let auditLogDao = new AuditLogDao();
let cabDao = new CabDao();

/**
 * @function signup
 * @description if IS_REDIS_ENABLE set to true,
 * than redisClient.storeList() function saves value in redis.
 */
const vendorSignup = async function (params: VendorSignupRequest, tokenData: TokenData) {
	try {
		if (
			params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			params.permission.indexOf("vendor") !== -1
		) {
			let step1 = await vendorDao.isEmailAlreadyExists(params);
			let randomenumber = "V" + Math.floor(Math.random() * 1000000) + 8;
			params.badgeNo = randomenumber;
			params.createdBy = params.userId;
			params.adminType = params.adminType;
			params.companyCode = params.companyCode;
			params.created = Date.now();
			let step2 = await vendorDao.vendorSignup(params);
			step2.moduleName = config.CONSTANT.MODULE_KEY.VENDOR;
			step2.message = "New vendor" + " " + params.name + " " + "is added";
			let step4 = await auditLogDao.addLog(step2, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.ADD);
			return vendorConstant.MESSAGES.SUCCESS.VENDOR_REGISTERED;
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};
// Update vendor info
const updateVendor = async function (params: VendorUpdateRequest, tokenData: TokenData) {
	try {
		if (
			tokenData.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			tokenData.permission.indexOf("vendor") !== -1
		) {
			let step1 = await vendorDao.editVendor(params);
			step1.moduleName = config.CONSTANT.MODULE_KEY.VENDOR;
			step1.message = "Personal information of" + " " + step1.name + "" + "is updated";
			let step2 = await auditLogDao.addLog(step1, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.EDIT);
			return vendorConstant.MESSAGES.SUCCESS.VENDOR_UPDATE;
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};
/**
 * @function vendorList
 */
const vendorList = async function (params: ListingRequest) {
	try {
		// if (
		// 	params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
		// 	params.permission.indexOf("vendor") !== -1
		// ) {
			// Added Subadmin Access - Shivakumar A
			if (
				params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN || params.adminType === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN ||
				params.permission.indexOf("vendor") !== -1
			) {
			let step1 = await adminDao.findAdminById(params);
			// if (
			// 	step1.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			// 	step1.permission.indexOf("vendor") !== -1
			// ) {
			// Added Subadmin Access - Shivakumar A
				if (
					step1.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN || step1.adminType === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN ||
					step1.permission.indexOf("vendor") !== -1
				) {
				let response: any = {};
				let step2 = await vendorDao.vendorList(params).then(function (result) {
					response.userList = result[0];
					response.totalCount = result[1] || 0;
				});
				return vendorConstant.MESSAGES.SUCCESS.VENDOR_LIST(response);
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
 * @function blockUnblock
 */
const blockUnblock = async function (params: BlockRequest, tokenData: TokenData) {
	try {
		if (
			tokenData.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			tokenData.permission.indexOf("vendor") !== -1
		) {
			switch (params.status) {
				case config.CONSTANT.STATUS.BLOCKED:
					let vendorId = params.userId;
					let cabExist = await cabDao.isNonDeletedCabExist(vendorId);
					if (cabExist)
						return vendorConstant.MESSAGES.ERROR.CAB_EXIST;
					let step1 = await vendorDao.blockUnblock(params);
					step1.moduleName = config.CONSTANT.MODULE_KEY.VENDOR;
					step1.message = "Account has been blocked of" + " " + step1.name;
					let step3 = await auditLogDao.addLog(step1, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.BLOCK);
					return vendorConstant.MESSAGES.SUCCESS.BLOCK_VENDOR;
				case config.CONSTANT.STATUS.UN_BLOCKED:
					let step2 = await vendorDao.blockUnblock(params);
					step2.moduleName = config.CONSTANT.MODULE_KEY.VENDOR;
					step2.message = "Account has been unblocked of" + " " + step2.name;
					let step4 = await auditLogDao.addLog(step2, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.UNBLOCK);
					return vendorConstant.MESSAGES.SUCCESS.UNBLOCK_VENDOR;
			}
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};
/**
 * @function deleteVendor
 * @description if IS_REDIS_ENABLE set to true,
 * than redisClient.storeSet() function saves value in redis.
 */
const deleteVendor = async function (params: DeleteRequest, tokenData: TokenData) {
	try {
		if (
			tokenData.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			tokenData.permission.indexOf("vendor") !== -1
		) {
			let vendorId = params.userId;
			let cabExist = await cabDao.isNonDeletedCabExist(vendorId);
			if (cabExist)
				return vendorConstant.MESSAGES.ERROR.CAB_EXIST1;
			let step1 = await vendorDao.deleteVendor(params);
			step1.moduleName = config.CONSTANT.MODULE_KEY.VENDOR;
			step1.message = "Account has been archived of" + " " + step1.name;
			let step6 = await auditLogDao.addLog(step1, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.ARCHIVE);
			return vendorConstant.MESSAGES.SUCCESS.DELETE_VENDOR;
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};
/**
 * @function vendorDetails
 */
const vendorDetails = async function (params: UserId) {
	try {
		let step1 = await vendorDao.findVendorById(params);
		return vendorConstant.MESSAGES.SUCCESS.VENDOR_DETAILS(step1);
	} catch (error) {
		throw error;
	}
};
/**
 * @function vendorListing
 */
const vendorListing = async function (params: ListingRequest) {
	try {
		let searchKeyNo = params.searchKey ? params.searchKey.length : 0;
		// if (searchKeyNo >= 3) {
		let response: any = {};
		response = await vendorDao.vendorListing(params);
		return vendorConstant.MESSAGES.SUCCESS.VENDOR_LIST(response);
		// } else {
		// 	return Promise.reject(vendorConstant.MESSAGES.ERROR.SEARCH_KEY_LENGTH);
		// }

	} catch (error) {
		throw error;
	}
};
/**
 * @function bulkVendorSignup
 */
const bulkVendorSignup = async function (params: VendorSignupRequest) {
	try {
		let vendorArr = [];
		// let json: any = await csv.readAndParseCSV(params.file); // for csv file
		let json: any = await xlsx.readAndParseXLSX(params.file);
		for (let item of json) {
			let step1 = await vendorDao.isEmailAlreadyExists(item);
			if (!item.email || !item.name || !item.mobileNo || !item.countryCode) {
				return Promise.reject(vendorConstant.MESSAGES.ERROR.INVALID_DATA);
			}
			let randomenumber = "V" + Math.floor(Math.random() * 1000000) + 8;

			let obj = {
				badgeNo: randomenumber,
				email: item.email,
				name: item.name,
				countryCode: item.countryCode,
				mobileNo: item.mobileNo.toString(),
				createdBy: params.userId,
				companyCode: params.companyCode,
				adminType: params.adminType,
				created: Date.now(),
				cabCount: 0,
				status: config.CONSTANT.STATUS.UN_BLOCKED
			};
			vendorArr.push(obj);
		}
		let step2 = await vendorDao.bulkVendoSignup(vendorArr);
		// let step2 = await userDao.bulkEmpSignup(empArr);
		return vendorConstant.MESSAGES.SUCCESS.IMPORT_VENDOR;
	} catch (error) {
		throw error;
	}
};

export let vendorController = {
	vendorSignup,
	updateVendor,
	vendorList,
	vendorListing,
	blockUnblock,
	deleteVendor,
	vendorDetails,
	bulkVendorSignup
};