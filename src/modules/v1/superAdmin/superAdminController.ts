"use strict";

import * as _ from "lodash";

import { SuperAdminDao } from "@modules/v1/superAdmin/SuperAdminDao";
import * as superAdminConstant from "@modules/v1/superAdmin/superAdminConstant";
import * as appUtils from "@utils/appUtils";
// import * as config from "@config/constant";
const axios = require('axios');
import * as config1 from "@config/environment";
import * as config from "@config/index";
import { MailManager } from "@lib/MailManager";
import * as tokenManager from "@lib/tokenManager";
import { SubscriptionDao } from "@modules/v1/superAdmin/subscriptionDao";

let superAdminDao = new SuperAdminDao();
let mailManager = new MailManager();
let subscriptionDao = new SubscriptionDao();

/**
 * @function forgotPassword
 */
const forgotPassword = async function (params: ForgotPasswordRequest) {
	try {
		let step1 = await superAdminDao.isEmailExists(params);
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
					"accountLevel": config.CONSTANT.ACCOUNT_LEVEL.SUPER,
					"adminType": step1.adminType
				});
				let adminObject = appUtils.buildToken(tokenData);
				let accessToken = await tokenManager.generateAdminToken({ "type": "FORGOT_PASSWORD", "object": adminObject });
				let step2 = mailManager.sendAdminForgotPasswordEmail({ "email": params.email, "accessToken": accessToken });
				return superAdminConstant.MESSAGES.SUCCESS.FORGOT_PASSWORD;
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
		let step1 = await superAdminDao.findAdminById(params);
		params.hash = appUtils.encryptHashPassword(params.password, step1.salt);
		let step2 = await superAdminDao.changePassword(params);
		return superAdminConstant.MESSAGES.SUCCESS.CHANGE_FORGOT_PASSWORD;
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
 * @function superAdminLogin
 */
const superAdminLogin = async function (params: AdminLoginRequest) {
	try {
		let step1 = await superAdminDao.isEmailExists(params);
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
						"accountLevel": config.CONSTANT.ACCOUNT_LEVEL.SUPER,
						"adminType": step1.adminType
					});
					let adminObject = appUtils.buildToken(tokenData);
					let accessToken = await tokenManager.generateAdminToken({ "type": "SUPER_ADMIN_LOGIN", "object": adminObject });
					let loginObj = {
						"userId": step1._id,
						"remoteAddress": params.remoteAddress,
						"platform": params.platform
					};
					let step3 = await superAdminDao.updateLoginHistory(loginObj);
					return superAdminConstant.MESSAGES.SUCCESS.SUPER_ADMIN_LOGIN({ "accessToken": accessToken, "adminObject": step1 });
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
		let step1 = await superAdminDao.logout(params);
		return superAdminConstant.MESSAGES.SUCCESS.LOGOUT;
	} catch (error) {
		throw error;
	}
};

/**
 * @function changePassword
 */
const changePassword = async function (params: ChangePasswordRequest) {
	try {
		let step1 = await superAdminDao.findAdminById(params);
		let oldHash = appUtils.encryptHashPassword(params.oldPassword, step1.salt);
		if (oldHash !== step1.hash) {
			return Promise.reject(superAdminConstant.MESSAGES.ERROR.INVALID_OLD_PASSWORD);
		} else {
			params.hash = appUtils.encryptHashPassword(params.password, step1.salt);
			let step2 = await superAdminDao.changePassword(params);
		}
		return superAdminConstant.MESSAGES.SUCCESS.CHANGE_PASSWORD;
	} catch (error) {
		throw error;
	}
};

/**
 * @function superAdminDetails
 */
const superAdminDetails = async function (params: TokenData) {
	try {
		let step1 = await superAdminDao.findAdminById(params);
		return superAdminConstant.MESSAGES.SUCCESS.ADMIN_DETAILS(step1);
	} catch (error) {
		throw error;
	}
};
/**
 * @function companyDetails
 */
const companyDetails = async function (params: TokenData) {
	try {
		let step1 = await superAdminDao.findAdminById(params);
		return superAdminConstant.MESSAGES.SUCCESS.COMPANY_DETAILS(step1);
	} catch (error) {
		throw error;
	}
};

/**
 * @function editProfile
 */
const editProfile = async function (params: EditProfileRequest) {
	try {
		let isExist = await superAdminDao.isEmailExists(params);
		if (isExist) {
			return Promise.reject(superAdminConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
		} else {
			let step1 = await superAdminDao.editProfile(params);
			let tokenData = _.extend(params, {
				"userId": step1._id,
				"name": step1.name,
				"email": step1.email,
				"created": appUtils.convertISODateToTimestamp(step1.createdAt),
				"accountLevel": config.CONSTANT.ACCOUNT_LEVEL.SUPER,
				"adminType": step1.adminType
			});
			let adminObject = appUtils.buildToken(tokenData);
			let accessToken = await tokenManager.generateAdminToken({ "type": "SUPER_ADMIN_LOGIN", "object": adminObject });
			return superAdminConstant.MESSAGES.SUCCESS.EDIT_PROFILE({ "accessToken": accessToken });
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
		const headers = {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'platform': 1,
			'auth': {
				username: config1.SERVER.ADMIN_API_NAME,
				password: config1.SERVER.ADMIN_API_PASS
			},
			// 'api_key': config1.SERVER.API_KEY
		};
		let admin: any;
		// admin = await axios.post(`http://localhost:3000/fleet/api/v1/admin/ceateAdmin1`, { a: 'a' }, headers);
		// console.log(admin + "====================" + JSON.stringify(admin));
		// return "hello";
		let isExist = await superAdminDao.isCompanyEmailOrUrlExists(params);
		if (isExist) {
			return Promise.reject(superAdminConstant.MESSAGES.ERROR.EMAIL_OR_URL_ALREADY_EXIST);
		} else {
			let name = params.name;
			let code = params.companyCode;
			let nameFirstThree = name.substring(0, 4);
			let codeFirstThree = code.substring(0, 4);
			params.companyId = nameFirstThree + codeFirstThree;
			params.createdBy = params.userId;
			if (params.serverType === config.CONSTANT.SERVER_TYPE.FLEET_SERVER) {
				params.url = config.SERVER.COMPANY_URL;
				let password = await appUtils.generatePassword();
				params.password = password;
				params.adminType = config.CONSTANT.ADMIN_TYPE.ADMIN;
				params.created = Date.now();
				let step1 = await superAdminDao.createCompanyAdmin(params);
			}
			else {
				// console.log('params: ', params);
				// const headers = {
				// 	'Content-Type': 'application/json',
				// 	'Accept': 'application/json',
				// 	'platform': 1,
				// 	'auth': {
				// 		username: config1.SERVER.ADMIN_API_NAME,
				// 		password: config1.SERVER.ADMIN_API_PASS
				// 	},
				// 	// 'api_key': config1.SERVER.API_KEY
				// };
				// console.log('(params.url + `${config1.SERVER.ADMIN_API_URL}`: ', (params.url + config1.SERVER.ADMIN_API_URL));
				// console.log('param`: ', params);
				// console.log('headers: ', headers);
				let dataObj: any = {
					name: params.name,
					email: params.email,
					companyCode: params.companyCode,
					contactNumber: params.contactNumber,
					companyType: params.companyType,
					totalEmp: params.totalEmp,
					address: params.address,
					planeId: params.planeId,
					paymentType: params.paymentType,
					serverType: params.serverType,
					longitude: params.longitude,
					latitude: params.latitude,
					url: params.url,
					maxGroupRadius: params.maxGroupRadius,
					createdBy: params.createdBy
				};
				admin = await axios.post(params.url + `${config1.SERVER.ADMIN_API_URL}`, dataObj, headers);
				// admin = await axios.post('http://localhost:3000/fleet/api/v1/common/registeredAdmin', dataObj, headers);
				// console.log('admin.................................: ', admin);

				if (!admin || admin.data.statusCode !== 200) {
					return Promise.reject(superAdminConstant.MESSAGES.ERROR.INVALID_ADMIN_URL);
				}
				params.adminType = config.CONSTANT.ADMIN_TYPE.ADMIN;
				params.created = Date.now();
				let step1 = await superAdminDao.createCompanyAdmin(params);
			}

			if (params.serverType === config.CONSTANT.SERVER_TYPE.FLEET_SERVER) {
				let step3 = mailManager.sendSignupPasswordEmail(params);
			}
			return superAdminConstant.MESSAGES.SUCCESS.ADD_COMPANY_ADMIN;
		}
	} catch (error) {
		return Promise.reject(superAdminConstant.MESSAGES.ERROR.INVALID_ADMIN_URL);
		// throw error;
	}
};
const addCompanyType = async function (params: CompanyTypeRequest) {
	try {
		let isExist = await superAdminDao.isCompanyTypeExists(params);
		if (isExist) {
			return Promise.reject(superAdminConstant.MESSAGES.ERROR.COMPANY_TYPE_EXIST);
		} else {
			params.createdBy = params.userId;
			params.created = Date.now();
			let step1 = await superAdminDao.createCompanyType(params);
			return superAdminConstant.MESSAGES.SUCCESS.ADD_COMPANY_TYPE;
		}
	} catch (error) {
		throw error;
	}
};
/**
 * @function companyList
 */
const companyList = async function (params: ListingRequest) {
	try {
		let response: any = {};
		// let step2 = await superAdminDao.companyList(params).then(function (result) {
		// 	response.companyList = result[0];
		// 	response.totalCount = result[1] || 0;
		// });
		let step2 = await superAdminDao.companyList(params);
		response.companyList = step2[0];
		response.totalCount = step2[1] || 0;
		return superAdminConstant.MESSAGES.SUCCESS.COMPANY_LIST(response);
	} catch (error) {
		throw error;
	}
};

/**
 * @function isCompanyUnique
 */
const IsCompanyUnique = async function (params: IsCompanyUnique) {
	try {
		let response: any = {};
		let step = await superAdminDao.isCompanyExist(params);
		if (step) {
			return superAdminConstant.MESSAGES.ERROR.COMPANY_CODE_EXIST;
		} else {
			return superAdminConstant.MESSAGES.SUCCESS.IS_COMPANY_CODE;
		}

	} catch (error) {
		throw error;
	}
};
/**
 * @function isCompanyUnique
 */
const isSubscriptionUnique = async function (params: IsSubscriptionUnique) {
	try {
		let response: any = {};
		let step = await superAdminDao.isSubscriptionUnique(params);
		if (step) {
			return superAdminConstant.MESSAGES.ERROR.SUBSCRIPTION_NAME_EXIST;
		} else {
			return superAdminConstant.MESSAGES.SUCCESS.IS_SUBSCRIPTION_NAME;
		}

	} catch (error) {
		throw error;
	}
};
/**
 * @function subscriptionList
 * @param params searcKey,sort,status
 */
const subscriptionList = async function (params: ListingRequest) {
	try {
		let response: any = {};
		let step2 = await subscriptionDao.subscriptionList(params).then(function (result) {
			response.subscriptionList = result[0];
			response.totalCount = result[1] || 0;
		});
		return superAdminConstant.MESSAGES.SUCCESS.SUBSCRIPTION_LIST(response);
	} catch (error) {
		throw error;
	}
};
/**
 * companyTypeList
 * @param params
 */
const companyTypeList = async function (params: ListingRequest) {
	try {
		let response: any = {};
		let step = await superAdminDao.companyTypeList(params);
		return superAdminConstant.MESSAGES.SUCCESS.COMPANY_TYPE_LIST(step);
	} catch (error) {
		throw error;
	}
};
/**
 * @function _blockCompany
 */
const _blockUnblockCompany = async function (params: BlockRequest) {
	try {
		let step1 = await superAdminDao.blockUnblock(params);
		return superAdminConstant.MESSAGES.SUCCESS.BLOCK_COMPANY;
	} catch (error) {
		throw error;
	}
};
/**
 * @function _blockUnblockSubscription
 */
const _blockUnblockSubscription = async function (params: BlockRequest) {
	try {
		let step1 = await subscriptionDao.blockUnblock(params);
		return superAdminConstant.MESSAGES.SUCCESS.BLOCK_SUBSCRIPTION;
	} catch (error) {
		throw error;
	}
};
/**
 * @function editCompany
 */
const editCompany = async function (params: CreateCompanyRequest) {
	try {
		let step2 = await superAdminDao.editCompany(params);
		return superAdminConstant.MESSAGES.SUCCESS.EDIT_COMPANY;
	} catch (error) {
		throw error;
	}
};
/**
 * @function editSubscription
 */
const editSubscription = async function (params: CreateSubscriptionRequest) {
	try {
		let yearMonth = params.year * 12;
		let totalMonth = params.month + yearMonth;
		let CurrentDate = new Date();
		let expiryDate = CurrentDate.setMonth(CurrentDate.getMonth() + totalMonth);
		params.expiryDate = expiryDate;
		let newExpiry = new Date(expiryDate);
		let expiryEndDate = newExpiry.setDate(newExpiry.getDate() + params.gracePeriod);
		params.expiryEndDate = expiryEndDate;
		let step2 = await subscriptionDao.editSubscription(params);
		return superAdminConstant.MESSAGES.SUCCESS.EDIT_SUBSCRIPTION;
	} catch (error) {
		throw error;
	}
};
const addSubscription = async function (params: CreateSubscriptionRequest) {
	try {
		params.createdBy = params.userId;
		params.created = Date.now();
		let yearMonth = params.year * 12;
		let totalMonth = params.month + yearMonth;
		let CurrentDate = new Date();
		let expiryDate = CurrentDate.setMonth(CurrentDate.getMonth() + totalMonth);
		params.expiryDate = expiryDate;
		let newExpiry = new Date(expiryDate);
		let expiryEndDate = newExpiry.setDate(newExpiry.getDate() + params.gracePeriod);
		params.expiryEndDate = expiryEndDate;
		let step1 = await subscriptionDao.createSubscription(params);
		return superAdminConstant.MESSAGES.SUCCESS.ADD_SUBSCRIPTION;
	} catch (error) {
		throw error;
	}
};
/**
 * subscriptionDetails
 * @param params subscriptionId
 */
const subscriptionDetails = async function (params: TokenData) {
	try {
		let step1 = await subscriptionDao.findSubscriptionById(params);
		return superAdminConstant.MESSAGES.SUCCESS.SUBSCRIPTION_DETAILS(step1);
	} catch (error) {
		throw error;
	}
};
/**
 * renewalSubscription
 * @param params companyId
 */
const renewalSubscription = async function (params: TokenData) {
	try {
		let step1 = await subscriptionDao.renewalSubscription(params);
		return superAdminConstant.MESSAGES.SUCCESS.RENEWAL_SUBSCRIPTION;
	} catch (error) {
		throw error;
	}
};

/**
 * @function earningList
 */
const earningList = async function (params: ListingRequest) {
	try {
		let response: any = {};
		let step2 = await subscriptionDao.earningList(params).then(function (result) {
			response.earningList = result[0];
			response.totalCount = result[1] || 0;
			let amount = result[2] || 0;
			response.totalAmount = amount[0].totalAmount;
		});
		return superAdminConstant.MESSAGES.SUCCESS.EARNING_LIST(response);
	} catch (error) {
		throw error;
	}
};
/**
 * subscribedUsers
 * @param params pagination and search
 */
const subscribedUsers = async function (params: ListingRequest) {
	try {
		let response: any = {};
		let step2 = await subscriptionDao.subscribedUsers(params).then(function (result) {
			response.companyList = result[0];
			response.totalCount = result[1] || 0;
		});
		return superAdminConstant.MESSAGES.SUCCESS.SUBSCRIBED_USER(response);
	} catch (error) {
		throw error;
	}
};
/**
 * @function earningDetails
 */
const earningDetails = async function (params: TokenData) {
	try {
		let response: any = {};
		let step2 = await subscriptionDao.earningDetails(params);
		return superAdminConstant.MESSAGES.SUCCESS.EARNING_LIST(step2[0]);
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
		let CurrentDate = new Date();
		let timestamp = CurrentDate.getTime();
		if (params.duration === config.CONSTANT.DURATION.WEEKLY) {
			params.toDate = timestamp;
			let expiryDate = CurrentDate.setDate(CurrentDate.getDay() - 7);
			params.fromDate = expiryDate;
		} else if (params.duration === config.CONSTANT.DURATION.MONTHLY) {
			params.toDate = timestamp;
			let expiryDate = CurrentDate.setMonth(CurrentDate.getMonth() - 1);
			params.fromDate = expiryDate;
		} else if (params.duration === config.CONSTANT.DURATION.YEARLY) {
			params.toDate = timestamp;
			let expiryDate = CurrentDate.setMonth(CurrentDate.getMonth() - 12);
			params.fromDate = expiryDate;
		}
		let step2 = await superAdminDao.dashboard(params).then(function (result) {
			response.companyList = result[0];
			response.totalCount = result[1] || 0;
			response.totalEarning = result[2] || 0;
			response.totalCompany = result[3] || 0;
			response.expiringInMonth = result[4] || 0;
			response.expiredCompany = result[5] || 0;
			response.activeCompany = result[6] || 0;
		});
		return superAdminConstant.MESSAGES.SUCCESS.COMPANY_LIST(response);
	} catch (error) {
		throw error;
	}
};
export let superAdminController = {
	forgotPassword,
	verifyToken,
	changeForgotPassword,
	refreshToken,
	superAdminLogin,
	logout,
	changePassword,
	superAdminDetails,
	editProfile,
	addCompany,
	companyDetails,
	companyList,
	_blockUnblockCompany,
	editCompany,
	addSubscription,
	subscriptionList,
	IsCompanyUnique,
	addCompanyType,
	companyTypeList,
	editSubscription,
	_blockUnblockSubscription,
	subscriptionDetails,
	earningList,
	subscribedUsers,
	earningDetails,
	renewalSubscription,
	dashboard,
	isSubscriptionUnique
};