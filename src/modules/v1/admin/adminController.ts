"use strict";

import * as _ from "lodash";

import { AdminDao } from "@modules/v1/admin/AdminDao";
import * as adminConstant from "@modules/v1/admin/adminConstant";
import * as appUtils from "@utils/appUtils";
import * as config from "@config/constant";
import { MailManager } from "@lib/MailManager";
import * as tokenManager from "@lib/tokenManager";

let adminDao = new AdminDao();
let mailManager = new MailManager();

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
					"adminType": step1.adminType
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
			let step2 = await adminDao.changePassword(params);
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
 * @description Its a send mail for notified expired company call to scheduler
 * @function expiredCompany
 */
const expiredCompany = async function (params) {
	try {
		let step1 = await adminDao.expiredCompany(params);
		console.log("==============================" + JSON.stringify(step1));
		step1.forEach(element => {
			params.email = element.email;
			params.name = element.name;
			let step2 = mailManager.notifiedExpiredCompany(params);
		});
	} catch (error) {
		throw error;
	}
};

export let adminController = {
	createAdmin,
	forgotPassword,
	verifyToken,
	changeForgotPassword,
	refreshToken,
	changePassword,
	expiredCompany
};