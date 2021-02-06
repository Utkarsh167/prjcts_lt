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
import { UserDao } from "@modules/v1/user";

let adminDao = new AdminDao();
let mailManager = new MailManager();
let loginHistoryDao = new LoginHistoryDao();
let auditLogDao = new AuditLogDao();

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
 * @function addSubAdmin
 */
const addSubAdmin = async function (params: CreateAdminRequest, tokenData: TokenData) {
	try {
		if (params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN) {
			let isExist = await adminDao.isEmailExists(params);
			let adminData = await adminDao.findAdminById(params);
			let password = await appUtils.generatePassword();
			if (isExist) {
				return Promise.reject(adminConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
			} else {
				let permissions = params.permission;
				params.password = password;
				params.adminType = config.CONSTANT.ADMIN_TYPE.SUB_ADMIN;
				params.companyCode = params.companyCode;
				params.createdBy = params.userId;
				params.totalCount = permissions.length;
				params.companyBranch = adminData.companyBranch;
				params.companyAddress = adminData.companyAddress;
				params.plane = adminData.plane;
				params.url = adminData.url;
				params.shiftSlot = adminData.shiftSlot;
				params.companyId = adminData.companyId;
				params.contactNumber = adminData.contactNumber;
				params.companyType = adminData.companyType;
				params.routeConf = adminData.routeConf;
				params.maxGroupRadius = adminData.maxGroupRadius;
				params.crfLimitMonth = adminData.crfLimitMonth;
				params.isProfileComplete = true;
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
		if (params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN) {
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
		if (tokenData.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN) {
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
		if (tokenData.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN) {
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
			params.totalCount = permissions.length;
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
		if (tokenData.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN) {
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
					"accountLevel": config.CONSTANT.ACCOUNT_LEVEL.ADMIN,
					"adminType": step1.adminType,
					"companyCode": step1.companyCode,
				});
				let adminObject = appUtils.buildToken(tokenData);
				let accessToken = await tokenManager.generateAdminToken({ "type": "FORGOT_PASSWORD", "object": adminObject });
				let step3 = await adminDao.updateForgetPassword(tokenData, accessToken);
				let step2 = mailManager.sendAdminForgotPasswordEmail({ "email": params.email, "accessToken": accessToken });
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
 */
const adminLogin = async function (params: AdminLoginRequest) {
	try {
		let step1 = await adminDao.isEmailExists(params);
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
					let tokenData = _.extend(params, {
						"userId": step1._id,
						"name": step1.name,
						"email": step1.email,
						"created": appUtils.convertISODateToTimestamp(step1.createdAt),
						"accountLevel": config.CONSTANT.ACCOUNT_LEVEL.ADMIN,
						"adminType": step1.adminType,
						"salt": step1.salt,
						"userType": step1.userType,
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
		let step1 = await adminDao.findAdminById(params);
		return adminConstant.MESSAGES.SUCCESS.ADMIN_DETAILS(step1);
	} catch (error) {
		throw error;
	}
};

/**
 * @function dashboard
 */
const dashboard = async function (params: ListingRequest) {
	try {
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
	} catch (error) {
		throw error;
	}
};
/**
 * @function dashboardTripHistory
 */
const dashboardTripHistory = async function (params: ListingRequest) {
	try {
		let response: any = {};
		let result = await adminDao.dashboardTripHistory(params).then(function (result) {
			response.tripCancelData = result[0];
			response.tripRescheduleData = result[1];
		});
		console.log(JSON.stringify(response) + "=============================");
		return adminConstant.MESSAGES.SUCCESS.DASHBOARD(response);
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
		let response: any = {};
		let result = await adminDao.dashboardEmpTracking(params).then(function (result) {
			response.empTrackingData = result[0];
		});
		console.log(JSON.stringify(response) + "=============================");
		return adminConstant.MESSAGES.SUCCESS.DASHBOARD(response);
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
		if (params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN) {
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
			"adminType": step1.adminType,
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
			params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
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
		params.adminType = config.CONSTANT.ADMIN_TYPE.ADMIN;
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

const addCompany1 = async function (params: CreateCompanyRequest) {
	try {
		console.log('Inside addCompany 1: ', params);
		return adminConstant.MESSAGES.SUCCESS.ADD_COMPANY_ADMIN;
	} catch (error) {
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
	addCompany1
};