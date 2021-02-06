"use strict";

import * as _ from "lodash";

import { AdminDao } from "@modules/v1/admin/AdminDao";
import * as adminConstant from "@modules/v1/admin/adminConstant";
import * as appUtils from "@utils/appUtils";
import * as config from "@config/constant";
import { MailManager } from "@lib/MailManager";
import * as tokenManager from "@lib/tokenManager";
import { LoginHistoryDao } from "@modules/v1/loginHistory/LoginHistoryDao";
import { AuditLogDao } from "@modules/v1/auditLog/AuditLogDao";
import { dashboardController } from "@modules/v1/dashboard/dashboardController";
import * as moment from "moment";
import { BaseDao } from "../shared/BaseDao";
// import { UserDao } from "@modules/v1/user";

let adminDao = new AdminDao();
let mailManager = new MailManager();
let loginHistoryDao = new LoginHistoryDao();
let auditLogDao = new AuditLogDao();
let basedao = new BaseDao();

/**
 * @function createAdmin
 * @description first checking is admin is created or not,
 * if not then create admin otherwise gives an error admin
 * already exist.
 * @param params { "platform": double, "name": string, "email": string, "password": string }
 * @returns object
 * @author Rajat Maheshwari rajat.maheshwari@appinventiv.com
 */
const createAdmin = async function (params: CreateAdminRequest) {
	try {
		let isExist = await adminDao.isEmailExists(params);
		if (isExist) {
			return Promise.reject(adminConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
		} else {
			let step1 = await adminDao.createAdmin(params);
			return adminConstant.MESSAGES.SUCCESS.ADD_SUB_ADMIN;
		}
	} catch (error) {
		throw error;
	}
};

/**
 * @function signUpEmployee
 * @description To add employee vehicle data
 * @auther Utkarsh Patil
 */

/**
 * @function addSubAdmin
 */
const addSubAdmin = async function (params: CreateAdminRequest, tokenData: TokenData) {
	try {
		if (params.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN || params.type === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN) {
			let isExist = await adminDao.isEmailExists(params);
			let adminData = await adminDao.findAdminById(params);
			let password = await appUtils.generatePassword();
			if (isExist) {
				return Promise.reject(adminConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
			} else {
				let permissions = params.permission;
				params.password = password;
				params.type = config.CONSTANT.ADMIN_TYPE.SUB_ADMIN;
				params.companyId = params.companyId;
				params.createdBy = params.userId;
				// params.totalCount = permissions.length;
				// Not required Utkarsh 08/07/2020
				// params.companyBranch = adminData.companyBranch;
				// params.companyAddress = adminData.companyAddress;
				// params.plane = adminData.plane;
				// params.url = adminData.url;
				// params.shiftSlot = adminData.shiftSlot;
				params.companyId = adminData.companyId;
				params.contactNumber = adminData.contactNumber;
				// params.companyType = adminData.companyType;
				// params.routeConf = adminData.routeConf;
				// params.maxGroupRadius = adminData.maxGroupRadius;
				// params.crfLimitMonth = adminData.crfLimitMonth;
				params.isProfileComplete = true;
				// Added created field Aashiq - 22/08/2020
				params.created = Date.now();
				let step1 = await adminDao.createAdmin(params);
				let step3 = mailManager.sendSignupPasswordEmail(params);
				step1.moduleName = "SUBADMIN";
				step1.message = "Sub admin " + " " + step1.name + " " + "is added";
				let step4 = await auditLogDao.addLog(step1, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.ADD);
				return adminConstant.MESSAGES.SUCCESS.ADD_SUB_ADMIN;
			}
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};

/**
 * @function subAdminList
 */
const subAdminList = async function (params: ListingRequest) {
	try {
		if (params.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN || params.type === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN) {
			let step1 = await adminDao.subAdminList(params);
			return adminConstant.MESSAGES.SUCCESS.SUB_ADMIN_LIST({ "subAdminList": step1.data, "totalRecord": step1.total });
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};

/**
 * @function deleteSubAdmin
 */
const deleteSubAdmin = async function (params: DeleteSubAdmin, tokenData: TokenData) {
	try {
		if (tokenData.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN || tokenData.type === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN) {
			let step1 = await adminDao.deleteSubAdmin(params);
			step1.moduleName = "SUBADMIN";
			step1.message = "Account has been archive" + " " + step1.name;
			let step2 = await auditLogDao.addLog(step1, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.ARCHIVE);
			return adminConstant.MESSAGES.SUCCESS.DELETE_SUB_ADMIN;
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};

/**
 * @function editSubAdmin
 */
const editSubAdmin = async function (params: EditSubAdminRequest, tokenData: TokenData) {
	try {
		if (tokenData.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN || tokenData.type === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN) {
			// let isExist = await adminDao.isEmailExists(params);
			// if (isExist) {
			// 	return Promise.reject(adminConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
			// } else {
			// if (params.password) {
			// 	let step1 = await adminDao.findAdminById(params);
			// 	params.hash = appUtils.encryptHashPassword(params.password, step1.salt);
			// 	params.salt = step1.salt;
			// }
			let permissions = params.permission;
			// params.totalCount = permissions.length;
			let step2 = await adminDao.editSubAdmin(params);
			step2.moduleName = "SUBADMIN";
			step2.message = "Account has been updated" + " " + step2.name;
			// let step3 = await auditLogDao.addLog(step2, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.BLOCK);
			// changed block to update log - Shivakumar A
			let step3 = await auditLogDao.addLog(step2, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.EDIT);

			return adminConstant.MESSAGES.SUCCESS.EDIT_SUB_ADMIN;
			// }
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};

/**
 * @function _blockSubAdmin
 */
const _blockSubAdmin = async function (params: BlockRequest, tokenData) {
	try {
		let step1 = await adminDao.blockUnblock(params);
		step1.moduleName = "SUBADMIN";
		step1.message = "Account has been blocked" + " " + step1.name;
		let step2 = await auditLogDao.addLog(step1, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.BLOCK);
		return adminConstant.MESSAGES.SUCCESS.BLOCK_SUB_ADMIN;
	} catch (error) {
		throw error;
	}
};

/**
 * @function _unblockSubAdmin
 */
const _unblockSubAdmin = async function (params: BlockRequest, tokenData) {
	try {
		let step1 = await adminDao.blockUnblock(params);
		step1.moduleName = "SUBADMIN";
		step1.message = "Account has been unublocked" + " " + step1.name;
		let step2 = await auditLogDao.addLog(step1, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.UNBLOCK);
		return adminConstant.MESSAGES.SUCCESS.UNBLOCK_SUB_ADMIN;
	} catch (error) {
		throw error;
	}
};

/**
 * @function blockUnblock
 */
const blockUnblock = async function (params: BlockRequest, tokenData: TokenData) {
	try {
		if (tokenData.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN || tokenData.type === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN) {
			switch (params.status) {
				case config.CONSTANT.STATUS.BLOCKED:
					return _blockSubAdmin(params, tokenData);
				case config.CONSTANT.STATUS.UN_BLOCKED:
					return _unblockSubAdmin(params, tokenData);
			}
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};

/**
 * @function forgotPassword
 * @param params { "email": string }
 */
const forgotPassword = async function (params: ForgotPasswordRequest) {
	try {
		let step1 = await adminDao.isEmailExists(params);
		if (!step1) {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
		} else {
			if (step1.status === config.CONSTANT.STATUS.BLOCKED) {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.BLOCKED);
			} else {
				let tokenData = _.extend(params, {
					"userId": step1._id,
					"name": step1.name,
					"email": step1.email,
					// "accountLevel": config.CONSTANT.ACCOUNT_LEVEL.ADMIN,
					"type": step1.type,
					// "companyCode": step1.companyCode,
					// Added company Id and removed companycode and accountlevel Aashiq 26/08/2020
					"companyId": step1.companyId
				});
				let adminObject = appUtils.buildToken(tokenData);
				let accessToken = await tokenManager.generateAdminToken({ "type": "FORGOT_PASSWORD", "object": adminObject });
				let step3 = await adminDao.updateForgetPassword(tokenData, accessToken);
				let step2 = mailManager.sendAdminForgotPasswordEmail({ "email": params.email, "accessToken": accessToken });
				// console.log({ "email": params.email, "accessToken": accessToken });
				return adminConstant.MESSAGES.SUCCESS.FORGOT_PASSWORD;
			}
		}
	} catch (error) {
		throw error;
	}
};

/**
 * @function verifyToken
 */
const verifyToken = async function (params: Device) {
	try {
		let step1 = await tokenManager.verifyToken(params.accessToken);
		return step1;
	} catch (error) {
		throw error;
	}
};

/**
 * @function changeForgotPassword
 */
const changeForgotPassword = async function (params: ChangeForgotPasswordRequest) {
	try {
		let step1 = await adminDao.findAdminById(params);
		params.hash = appUtils.encryptHashPassword(params.password, step1.salt);
		let step2 = await adminDao.changePassword(params);
		return adminConstant.MESSAGES.SUCCESS.CHANGE_FORGOT_PASSWORD;
	} catch (error) {
		throw error;
	}
};

/**
 * @function refreshToken
 */
const refreshToken = async function (params) {
	try {
		let accessToken = await tokenManager.refreshTokenOfAdmin(params);
		return config.CONSTANT.MESSAGES.SUCCESS.REFRESH_TOKEN({ "accessToken": accessToken });
	} catch (error) {
		throw error;
	}
};

/**
 * @function adminLogin
 * @param params { "emial": string, "password": string, "deviceId": string }
 * @author Utkarsh patil 06/07/2020
 */
const adminLogin = async function (params: AdminLoginRequest) {
	try {
		let step1 = await adminDao.isEmailExistForLogin(params);
		step1 = step1[0];
		console.log(step1);
		if (!step1) {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
		} else {
			if (step1.status === config.CONSTANT.STATUS.BLOCKED) {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.BLOCKED);
			} else {
				params.hash = appUtils.encryptHashPassword(params.password, step1.salt);
				if (step1.hash !== params.hash) {
					return Promise.reject(config.CONSTANT.MESSAGES.ERROR.INCORRECT_PASSWORD);
				} else {
					// Added company Location name in token Aashiq - 2/9/2020
					let tokenData = _.extend(params, {
						"userId": step1._id,
						"name": step1.name,
						"email": step1.email,
						"created": appUtils.convertISODateToTimestamp(step1.createdAt),
						"accountLevel": config.CONSTANT.ACCOUNT_LEVEL.ADMIN,
						"type": step1.type,
						"salt": step1.salt,
						"userType": step1.userType,
						"companyId": step1.companyId,
						"companyLocationName": step1.companyLocationName,
						"contactNo": step1.contactNo,
						"companyCode": step1.companyCode,
						"deviceId": params.deviceId,
					});
					let adminObject = appUtils.buildToken(tokenData);
					let accessToken = await tokenManager.generateAdminToken({ "type": "ADMIN_LOGIN", "object": adminObject });
					let refreshToken = appUtils.encodeToBase64(appUtils.genRandomString(32));
					params = _.extend(params, { "salt": step1.salt, "refreshToken": refreshToken });
					// let loginObj = {
					// 	"userId": step1._id,
					// 	"remoteAddress": params.remoteAddress,
					// 	"platform": params.platform
					// };
					// let step3 = await adminDao.updateLoginHistory(loginObj);
					let paramsReq = {
						"userId": step1._id,
						"deviceId": params.deviceId
					};
					let step2 = await loginHistoryDao.removeUserDeviceById(paramsReq);
					let step4 = await loginHistoryDao.createUserLoginHistory(params);
					return adminConstant.MESSAGES.SUCCESS.ADMIN_LOGIN({ "accessToken": accessToken, "adminObject": step1 });
				}
			}
		}
	} catch (error) {
		throw error;
	}
};

/**
 * @function logout
 */
const logout = async function (params: TokenData) {
	try {
		let step1 = await loginHistoryDao.removeUserDeviceById(params);
		let step2 = await adminDao.logout(params);
		return adminConstant.MESSAGES.SUCCESS.LOGOUT;
	} catch (error) {
		throw error;
	}
};

/**
 * @function changePassword
 */
const changePassword = async function (params: ChangePasswordRequest) {
	try {
		let step1 = await adminDao.findAdminById(params);
		let oldHash = appUtils.encryptHashPassword(params.oldPassword, step1.salt);
		if (oldHash !== step1.hash) {
			return Promise.reject(adminConstant.MESSAGES.ERROR.INVALID_OLD_PASSWORD);
		} else {
			params.hash = appUtils.encryptHashPassword(params.password, step1.salt);
			let step2 = await adminDao.adminChangePassword(params);
		}
		return adminConstant.MESSAGES.SUCCESS.CHANGE_PASSWORD;
	} catch (error) {
		throw error;
	}
};

/**
 * @function adminDetails
 */
const adminDetails = async function (params: TokenData) {
	try {
		// if (params.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN || params.permission.indexOf("profile") !== -1){
			let step1 = await adminDao.findAdminById(params);
			// Added company details for getting the settings Aashiq - 18/08/2020
			let step2 = await adminDao.displaySettings(params);
			let result: any = {};
			result.userData = step1;
			result.companyData = step2;
			return adminConstant.MESSAGES.SUCCESS.ADMIN_DETAILS(result);
		// } else {
		// 	return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		// }
	} catch (error) {
		throw error;
	}
};

/**
 * @function dashboard
 */
const dashboard = async function (params: ListingRequest) {
	try {
		if (params.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN || params.permission.indexOf("dashboard") !== -1){
			let response: any = {};
			let result = await adminDao.dashboard(params).then(function (result) {
				response.usersData = result[0];
				response.cabData = result[1];

				response.vendors = result[2];
				let approvedcrf = result[9];
				let pendingcrf = result[3] + result[10];
				response.totalCrf = approvedcrf + pendingcrf;
				response.approvedcrf = approvedcrf;
				response.pendingcrf = pendingcrf;
				response.routeData = result[4];
				response.sosData = result[5];
				response.tripData = result[6];
				response.vendorData = result[7];
				// response.tripHistory = result[8];
				response.empOnboardOffboard = result[8];
				// Added onTimeData to response - Shivakumar A
				response.onTimeData = result[11];
			});
			return adminConstant.MESSAGES.SUCCESS.DASHBOARD(response);
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}

	} catch (error) {
		throw error;
	}
};
/**
 * @function dashboardTripHistory
 */
const dashboardTripHistory = async function (params: ListingRequest) {
	try {
		if (params.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN || params.permission.indexOf("dashboard") !== -1){
			let response: any = {};
			let result = await adminDao.dashboardTripHistory(params).then(function (result) {
				response.tripCancelData = result[0];
				response.tripRescheduleData = result[1];
			});
			console.log(JSON.stringify(response) + "=============================");
			return adminConstant.MESSAGES.SUCCESS.DASHBOARD(response);
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};
/**
 * @function dashboardEmpTracking
 * @param params
 */
const dashboardEmpTracking = async function (params: ListingRequest) {
	try {
		if (params.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN || params.permission.indexOf("dashboard") !== -1){
			let response: any = {};
			let result = await adminDao.dashboardEmpTracking(params).then(function (result) {
				response.empTrackingData = result[0];
			});
			console.log(JSON.stringify(response) + "=============================");
			return adminConstant.MESSAGES.SUCCESS.DASHBOARD(response);
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};
/**
 * @function addPermission
 */
const addPermission = async function (params: Permission) {
	try {
		let step1 = await adminDao.createPermission(params);
		return adminConstant.MESSAGES.SUCCESS.PERMISSION;
	} catch (error) {
		throw error;
	}
};
/**
 * @function getPermission
 */
const getPermission = async function (params: TokenData) {
	try {
		let step1 = await adminDao.getPermission(params);
		return adminConstant.MESSAGES.SUCCESS.GET_PERMISSION(step1);
	} catch (error) {
		throw error;
	}
};
/**
 * @function subAdminDetails
 */
const subAdminDetails = async function (params: TokenData) {
	try {
		if (params.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN || params.type === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN) {
			let step1 = await adminDao.findSubAdminById(params);
			return adminConstant.MESSAGES.SUCCESS.SUB_ADMIN_LIST(step1);
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};

/**
 * @function editProfile
 */
const editProfile = async function (params: EditProfileRequest) {
	try {
		// let isExist = await adminDao.isEmailExists(params);
		// if (isExist) {
		// 	return Promise.reject(adminConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
		// } else {
		let step1 = await adminDao.editProfile(params);
		let tokenData = _.extend(params, {
			"userId": step1._id,
			"name": step1.name,
			"email": step1.email,
			"created": appUtils.convertISODateToTimestamp(step1.createdAt),
			"accountLevel": config.CONSTANT.ACCOUNT_LEVEL.ADMIN,
			"type": step1.type,
			"companyCode": step1.companyCode
		});
		let adminObject = appUtils.buildToken(tokenData);
		let accessToken = await tokenManager.generateAdminToken({ "type": "ADMIN_LOGIN", "object": adminObject });
		return adminConstant.MESSAGES.SUCCESS.EDIT_PROFILE({ "accessToken": accessToken });
		// }
	} catch (error) {
		throw error;
	}
};

/**
 * @function shiftNameExist
 */
const shiftNameExist = async function (params: ShiftName) {
	try {
		let step1 = await adminDao.isShiftNameAlreadyExists(params);
		return adminConstant.MESSAGES.SUCCESS.SHIFT_NAME_NOT_EXIST;
	} catch (error) {
		throw error;
	}
};

/**
 * @function auditLogList
 */
const auditLogList = async function (params: ListingRequest) {
	try {
		if (
			params.type === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			params.permission.indexOf("audit") !== -1
		) {
			let step1 = await adminDao.auditLogList(params);
			return adminConstant.MESSAGES.SUCCESS.AUDIT_LOG_LIST({ "auditLogList": step1.data, "totalRecord": step1.total });
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};

/**
 * @function createCompany
 * @description first checking is company is created or not,
 * if not then create company otherwise gives an error company
 * already exist.
 * @param params { "name": string, "email": string}
 * @returns object
 * @author pramod.jaiswal@appinventiv.com
 */
const addCompany = async function (params: CreateCompanyRequest) {
	try {
		let password = await appUtils.generatePassword();
		params.password = password;
		params.type = config.CONSTANT.ADMIN_TYPE.ADMIN;
		let name = params.name;
		let code = params.companyCode;
		let nameFirstThree = name.substring(0, 4);
		let codeFirstThree = code.substring(0, 4);
		params.companyId = nameFirstThree + codeFirstThree;
		// params.createdBy = params.userId;
		params.created = Date.now();
		// console.log("-------------------controller" + JSON.stringify(params));
		let step1 = await adminDao.createCompanyAdmin(params);
		let step3 = mailManager.sendSignupPasswordEmail(params);
		return adminConstant.MESSAGES.SUCCESS.ADD_COMPANY_ADMIN;

	} catch (error) {
		throw error;
	}
};

/**
 * @function adminSettings
 */

const addCompany1 = async function (params: CreateCompanyRequest) {
	try {
		console.log('Inside addCompany 1: ', params);
		return adminConstant.MESSAGES.SUCCESS.ADD_COMPANY_ADMIN;
	} catch (error) {
		throw error;
	}
};
const adminSettings = async function (params: TokenData) {
	try {
		let step1 = await adminDao.displaySettings(params);
		return adminConstant.MESSAGES.SUCCESS.ADMIN_SETTINGS(step1);
	} catch (error) {
		throw error;
	}
};

const adminLocations = async function (params: TokenData) {
	try {
		let step1 = await adminDao.displayLocations(params);
		return adminConstant.MESSAGES.SUCCESS.ADMIN_LOCATIONS(step1);
	} catch (error) {
		throw error;
	}
};

const adminLocationNames = async function (params: TokenData) {
    try {
        let step1 = await adminDao.displayLocationNames(params);
        return adminConstant.MESSAGES.SUCCESS.ADMIN_LOCATIONS(step1);
    } catch (error) {
        throw error;
    }
};
const updateAdminSettings = async function (params: UpdateSettings, tokendata: TokenData) {
	try {
		if (isNaN(params.booking_status_cutoff) || isNaN(params.geofence_cutoff) || isNaN(params.duration)){
			// console.log(params);
			return adminConstant.MESSAGES.ERROR.NUMBER_ONLY_ALLOWED;
		} else {
			let step1 = await adminDao.updateSettings(params, tokendata);
			return adminConstant.MESSAGES.SUCCESS.UPDATE_ADMIN_SETTINGS(step1);
		}
	} catch (error) {
		throw error;
	}
};
// booking slot - satyam
const getUserFloors = async function (params: TokenData) {
	try {
		// console.log(params);
		let step1 = await adminDao.getUserFloors(params);
		// console.log(step1.locations[0]);
		for (let i = 0; i < step1.locations[0].floors.length; i++){
			// console.log(step1.locations[0].floors[i].zones);
			let floorAvailableSpotCount = 0;
			for (let j = 0; j < step1.locations[0].floors[i].zones.length; j++ ){
				let obj: SnapshotRequest = {
					user: step1.locations[0].user,
					password: step1.locations[0].password,
					buildingUrl: step1.locations[0].parqueryValue,
					camera_ids: step1.locations[0].floors[i].cameras,
					with_image: false,
					with_crops: false,
					block_id: step1.locations[0].floors[i].zones[j].parqueryValue,
					klass: "",
					timestamp: parseInt(moment().format('X'))
				};
				// console.log(step1.locations[0].floors[i].zones[j].parqueryValue);
				let step2 = await dashboardController.timeTrackSnapshotApiCall(obj, params);
				let query = {"status": {"$ne": config.CONSTANT.STATUS.BLOCKED}, "isSpotBooked": true};
				let users = await basedao.find("users", query, {bookedAt: 1}, {});
				// console.log(step2.data.spot_states);
				for (let i = 0; i < step2.data.spot_states.length; i++){
					let query = {"status": {"$ne": config.CONSTANT.STATUS.BLOCKED}, "isSpotBooked": true, "bookedSpot": step2.data.spot_states[i].spot_id};
					let users = await basedao.findOne("users", query, {bookedAt: 1}, {});
					if (users){
						step2.data.spot_states[i].occupied = true;
					}
					if (!step2.data.spot_states[i].occupied){
						floorAvailableSpotCount++;
					}
				}
				step1.locations[0].floors[i].zones[j]["spots_states"] = step2.data.spot_states;
			}
			step1.locations[0].floors[i].availableSpotsCount = floorAvailableSpotCount;
		}
		return adminConstant.MESSAGES.SUCCESS.USER_FLOORS(step1);
	} catch (error) {
		throw error;
	}
};

const getParQueryData = async function () {
	try {
		let companies = await adminDao.getAllCompaniesData();
		// console.log(companies);
		for (let i = 0; i < companies.length; i++){
			// console.log(companies[i].locations);
			for (let j = 0; j < companies[i].locations.length; j++ ){
				// console.log(companies[i].locations[j].floors);
				for (let k = 0; k < companies[i].locations[j].floors.length; k++){
					let obj: SnapshotRequest = {
						user: companies[i].locations[j].user,
						password: companies[i].locations[j].password,
						buildingUrl: companies[i].locations[j].parqueryValue,
						camera_ids: companies[i].locations[j].floors[k].cameras,
						with_image: false,
						with_crops: false,
						block_id: "",
						klass: "",
						timestamp: parseInt(moment().format('X')),
					};
					let step2 = await dashboardController.timeTrackSnapshotApiCall(obj, {});
					// console.log(step2);
					for (let l = 0; l < step2.data.spot_states.length; l++){
						let obj = {
							spot_id: step2.data.spot_states[l].spot_id,
							camera_id: step2.data.spot_states[l].camera_id,
							occupied: step2.data.spot_states[l].occupied,
							event_start: step2.data.spot_states[l].event_start,
							duration: step2.data.spot_states[l].duration,
							vehicle_id: step2.data.spot_states[l].vehicle_id,
							companyLocationName: companies[i].locations[j].name,
							floorName: companies[i].locations[j].floors[k].name,
							timeStamp: step2.data.timestamp
						};
						// console.log(obj);
						await adminDao.addSpotStates(obj);
					}
				}
			}
		}
		console.log(companies);
	} catch (error){
		throw error;
	}
};
export let adminController = {
	createAdmin,
	addSubAdmin,
	subAdminList,
	deleteSubAdmin,
	editSubAdmin,
	blockUnblock,
	forgotPassword,
	verifyToken,
	changeForgotPassword,
	refreshToken,
	adminLogin,
	logout,
	changePassword,
	adminDetails,
	dashboard,
	editProfile,
	addPermission,
	getPermission,
	subAdminDetails,
	shiftNameExist,
	dashboardTripHistory,
	dashboardEmpTracking,
	auditLogList,
	addCompany,
	addCompany1,
	adminSettings,
	adminLocations,
	updateAdminSettings,
	adminLocationNames,
	getUserFloors,
	getParQueryData
};
