"use strict";

import * as _ from "lodash";

import { AdminDao } from "@modules/v1/admin/AdminDao";
import * as appUtils from "@utils/appUtils";
import * as bcrypt from "bcrypt";
import * as config from "@config/index";
import * as csv from "@lib/csv";
import { LoginHistoryDao } from "@modules/v1/loginHistory/LoginHistoryDao";
import { MailManager, RedisClient } from "@lib/index";
import * as mimeType from "../../../json/mime-type.json";
import * as tokenManager from "@lib/tokenManager";
import * as GoogleDistance from "@lib/distanceMatrix";
import * as userConstant from "@modules/v1/user/userConstant";
import { UserDao, userMapper } from "@modules/v1/user/index";
import * as xlsx from "@lib/xlsx";
import { BaseDao } from "@modules/v1/shared/BaseDao";
import * as promise from "bluebird";
// const distance = require('../../../lib/distanceMatrix.ts');
import { CabRouteDao } from "@modules/v1/route/RouteDao";
import { AuditLogDao } from "@modules/v1/auditLog/AuditLogDao";

let baseDao = new BaseDao();
let adminDao = new AdminDao();
let loginHistoryDao = new LoginHistoryDao();
let mailManager = new MailManager();
let redisClient = new RedisClient();
let userDao = new UserDao();
let cabRouteDao = new CabRouteDao();
let auditLogDao = new AuditLogDao();

// let options = {
// 	origin: '28.6060756,77.3597253',
// 	destination: '28.668002,77.3808467',
// };

// GoogleDistance.distancematrix.get(options, function (err, data) {
// 	try {
// 		return data;
// 		console.log("result");
// 		console.log(err, data);
// 	} catch{
// 		throw err;
// 	}
// });

/**
 * @function signup
 * @description if IS_REDIS_ENABLE set to true,
 * than redisClient.storeList() function saves value in redis.
 */
const driverSignup = async function (params: DriverSignupRequest, tokenData: TokenData) {
	try {
		if (
			params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			params.permission.indexOf("driver") !== -1
		) {
			if (!params.email) {
				return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_OR_PHONE_REQUIRED);
			} else {
				let step1 = await userDao.isEmailAlreadyExists(params);
				let adminCompany = await adminDao.findAdminById(params);
				let password = await appUtils.generatePassword();
				let randomenumber = "D" + Math.floor(Math.random() * 100000) + 8;
				params.driverId = randomenumber;
				params.password = password;
				params.createdBy = params.userId;
				params.companyCode = params.companyCode;
				params.userType = config.CONSTANT.USER_TYPE.DRIVER;
				params.adminType = params.adminType;
				params.dropoff = adminCompany.companyAddress;
				params.created = Date.now();
				let step2 = await userDao.driverSignup(params);
				step2.moduleName = config.CONSTANT.MODULE_KEY.DRIVER;
				step2.message = "New driver" + " " + params.name + " " + "is added";
				let step4 = await auditLogDao.addLog(step2, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.ADD);
				let step3 = mailManager.sendSignupPasswordEmail(params);
				return userConstant.MESSAGES.SUCCESS.SIGNUP_PASSWORD_ON_EMAIL;
			}
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};

/**
 * Employee signup
 */
const empSignup = async function (params: EmpSignupRequest, tokenData: TokenData) {
	try {
		if (
			params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			params.permission.indexOf("employee") !== -1
		) {
			if (!params.email) {
				return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_OR_PHONE_REQUIRED);
			} else {
				let coordinate, type;
				let homeAddress: any = {};
				let step1 = await userDao.isEmpEmailAlreadyExists(params);
				let isExist = await userDao.isEmployeeIdAlreadyExists(params);
				let password = await appUtils.generatePassword();
				let shift = await adminDao.findAdminById(params);
				let shiftSlot = shift.shiftSlot;
				let shiftObj = await _.find(shiftSlot, (obj) => { return obj.shiftName === params.shift; });
				let homeObj: any = {};
				if (params.houseNo)
					homeObj.houseNo = params.houseNo;
				if (params.roadName)
					homeObj.roadName = params.roadName;
				if (params.city)
					homeObj.city = params.city;
				if (params.state)
					homeObj.state = params.state;
				if (params.landMark)
					homeObj.landMark = params.landMark;
				if (params.fullAddress)
					homeObj.fullAddress = params.fullAddress;
				if (params.latitude && params.longitude) {
					coordinate = [params.longitude, params.latitude];
					type = "Point";
					homeAddress = { address: homeObj, coordinates: coordinate, type: type };
				}
				// if (homeObj && params.fullAddress) {
				// 	let address = '';
				// 	_.forIn(homeObj, function (value, key) { address = address.concat(value, ','); });
				// 	let latLong = await userDao.addrToLatLong(address);
				// 	coordinate = [latLong.lng, latLong.lat];
				// 	type = "Point";
				// 	homeAddress = { address: homeObj, coordinates: coordinate, type: type };
				// }
				params.password = password;
				params.createdBy = params.userId;
				params.companyCode = params.companyCode;
				params.userType = config.CONSTANT.USER_TYPE.EMPLOYEE;
				params.adminType = params.adminType;
				params.created = Date.now();
				params.dropoff = shift.companyAddress;
				params.shiftStartTime = shiftObj.startShift;
				params.shiftEndTime = shiftObj.endShift;
				params.shift = params.shift;
				params.weekOff = shiftObj.weekOff;
				params.pickup = homeAddress;
				let step2 = await userDao.empSignup(params);
				step2.moduleName = config.CONSTANT.MODULE_KEY.EMPLOYEE;
				step2.message = "New employee" + " " + params.name + " " + "is added";
				let step4 = await auditLogDao.addLog(step2, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.ADD);
				// let routes = await baseDao.find("cab_routes", {"companyCode": params.companyCode}, {}, {});
				// console.log('routes: ', routes);
				// if (routes.length > 0) {
				// Creating routing group for this new employee
				// let algoReqObj: any = {};
				// let officeLocation: any = {};
				// let employees = [];
				// officeLocation.lat = shift.companyBranch.coordinates[1];
				// officeLocation.long = shift.companyBranch.coordinates[0];
				// // algoReqObj.maxGroupSize = config.CONSTANT.ROUTE_DATA.MAX_GROUP_SIZE;
				// algoReqObj.maxGroupSize = shift.routeConf.maxGroupSize;
				// // algoReqObj.waitTime = config.CONSTANT.ROUTE_DATA.WAIT_TIME;
				// algoReqObj.waitTime = shift.routeConf.waitTime;
				// // algoReqObj.maxTripDuration = config.CONSTANT.ROUTE_DATA.MAX_TRIP_DURATION;
				// algoReqObj.maxTripDuration = shift.routeConf.maxTripDuration;
				// algoReqObj.officeLocation = officeLocation;
				// let b = step2.pickup.address;
				// let address: any = '';
				// for (let addr in b) {
				// 	if ((addr === "houseNo" || addr === "roadName" || addr === "city" || addr === "state" || addr === "landMark") && step2.pickup.address[addr])
				// 		address += step2.pickup.address[addr] + ' ';
				// }
				// let obj = {
				// 	"empId": step2._id,
				// 	"shift": step2.shift,
				// 	"shiftStartTime": step2.shiftStartTime,
				// 	"shiftEndTime": step2.shiftEndTime,
				// 	"weekOff": step2.weekOff,
				// 	"location": {
				// 		"lat": step2.pickup.coordinates[1],
				// 		"long": step2.pickup.coordinates[0]
				// 	},
				// 	"name": step2.name,
				// 	"employeeId": step2.employeeId,
				// 	"countryCode": step2.countryCode,
				// 	"mobileNo": step2.mobileNo,
				// 	"address": address.trim()
				// };
				// employees.push(obj);
				// algoReqObj.employees = employees;
				// 	 let routingAlgo = await cabRouteDao.routingAlgo(algoReqObj, params);
				// 	}

				let step3 = mailManager.sendSignupPasswordEmail(params);
				return userConstant.MESSAGES.SUCCESS.SIGNUP_PASSWORD_ON_EMAIL;
			}
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};

/**
 * @function login
 * @description if IS_REDIS_ENABLE set to true,
 * than redisClient.storeList() function saves value in redis.
 */
const login = async function (params: LoginRequest) {
	try {
		if (!params.email) {
			return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_OR_PHONE_REQUIRED);
		} else {
			let step1 = await userDao.findUserByEmailCompanyCode(params);
			if (!step1) {
				if (params.email) {
					return Promise.reject(config.CONSTANT.MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
				} else {
					return Promise.reject(config.CONSTANT.MESSAGES.ERROR.INCORRECT_PASSWORD);
				}
			} else {
				if (step1.status === config.CONSTANT.STATUS.BLOCKED) {
					return Promise.reject(config.CONSTANT.MESSAGES.ERROR.BLOCKED);
				} else {
					let salt, accessToken;
					if (!step1.hash) {
						return Promise.reject(config.CONSTANT.MESSAGES.ERROR.INCORRECT_PASSWORD);
					} else {
						params.hash = appUtils.encryptHashPassword(params.password, step1.salt);
						if (step1.hash !== params.hash) {
							return Promise.reject(config.CONSTANT.MESSAGES.ERROR.INCORRECT_PASSWORD);
						} else {
							salt = await appUtils.CryptDataMD5(step1._id + "." + new Date().getTime() + "." + params.deviceId);
							let tokenData = _.extend(params, {
								"userId": step1._id,
								"name": step1.name,
								"email": step1.email,
								"countryCode": step1.countryCode,
								"mobileNo": step1.mobileNo,
								"userType": step1.userType,
								"status": step1.status,
								"employeeId": step1.employeeId,
								"driverId": step1.driverId,
								"companyCode": step1.companyCode,
								"salt": salt,
								"accountLevel": config.CONSTANT.ACCOUNT_LEVEL.NORMAL_USER,
								"createdBy": step1.createdBy,
							});
							let userObject = appUtils.buildToken(tokenData);
							accessToken = await tokenManager.generateUserToken({ "type": "USER_LOGIN", "object": userObject, "salt": salt });
						}
					}
					let paramsReq = {
						"userId": step1._id,
						"deviceId": params.deviceId
					};
					if (config.SERVER.IS_SINGLE_DEVICE_LOGIN) {
						let step2 = await loginHistoryDao.removeDeviceByUserId(paramsReq);
					} else {
						let step2 = await loginHistoryDao.removeUserDeviceById(paramsReq);
					}
					let refreshToken = appUtils.encodeToBase64(appUtils.genRandomString(32));
					params = _.extend(params, { "salt": salt, "refreshToken": refreshToken });
					let step3 = await loginHistoryDao.createUserLoginHistory(params);
					if (config.SERVER.IS_REDIS_ENABLE) {
						let step4 = await redisClient.deleteKey(step1._id + "." + params.deviceId);
						// store _id.deviceId as a key and {deviceId, salt} as a value (redis list)
						let step5 = await redisClient.storeList(step1._id + "." + params.deviceId, [JSON.stringify({ "deviceId": params.deviceId, "salt": salt })]);
					}
					step1.socketPort = config.SERVER.SOCKET_PORT;
					step1.socketUrl = config.SERVER.SOCKET_URL;
					delete step1.salt, delete step1.hash, delete step1.createdAt, delete step1.createdBy;
					step1.socketPort = config.SERVER.SOCKET_PORT;
					step1.socketUrl = config.SERVER.SOCKET_URL;
					return userConstant.MESSAGES.SUCCESS.LOGIN({ "accessToken": accessToken, "refreshToken": refreshToken, "data": step1 });
				}
			}
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
		if (!params.email) {
			return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_OR_PHONE_REQUIRED);
		} else {
			let step1 = await userDao.findUserByEmailCompanyCode(params);
			if (!step1) {
				if (params.email) {
					return Promise.reject(config.CONSTANT.MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
				} else {
					return Promise.reject(userConstant.MESSAGES.ERROR.MOBILE_NO_NOT_REGISTERED);
				}
			} else {
				let tokenData = _.extend(params, {
					"userId": step1._id,
					"name": step1.name,
					"email": step1.email,
					"accountLevel": config.CONSTANT.ACCOUNT_LEVEL.NORMAL_USER,
					"userType": step1.userType,
					"companyCode": step1.companyCode,
				});
				let userObject = appUtils.buildToken(tokenData);
				let accessToken = await tokenManager.generateUserToken({ type: "FORGOT_PASSWORD", object: userObject });
				let step3 = await userDao.updateForgetPassword(tokenData, accessToken);
				let redirectUrl = config.SERVER.APP_URL + config.SERVER.API_BASE_URL + "/user/reset-password?accessToken=" + accessToken;
				if (params.email) {
					let step2 = mailManager.sendForgotPasswordEmail({ "email": params.email, "accessToken": accessToken, "name": step1.name, "url": redirectUrl });
					return userConstant.MESSAGES.SUCCESS.FORGOT_PASSWORD_ON_EMAIL;
				} else {
					return userConstant.MESSAGES.SUCCESS.FORGOT_PASSWORD_ON_PHONE;
				}
			}
		}
	} catch (error) {
		throw error;
	}
};

// change-password of users
const changePassword = async function (params: ChangeUserPasswordRequest) {
	try {
		let step1 = await userDao.findUserById(params);
		let oldHash = appUtils.encryptHashPassword(params.oldPassword, step1.salt);
		params.hash = appUtils.encryptHashPassword(params.password, step1.salt);
		params.salt = step1.salt;
		if (oldHash === step1.hash) {
			let step2 = await userDao.changePassword(params);
		} else {
			return Promise.reject(userConstant.MESSAGES.ERROR.INVALID_OLD_PASSWORD);
		}
		return userConstant.MESSAGES.SUCCESS.CHANGE_PASSWORD;
	} catch (error) {
		throw error;
	}
};

/**
 * @function changeForgotPassword
 */
const changeForgotPassword = async function (params: ChangeForgotPasswordRequest) {
	try {
		let step1 = await userDao.findUserByCompanyCode(params);
		if (!step1) {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.USER_NOT_FOUND);
		} else {
			params.hash = appUtils.encryptHashPassword(params.password, step1.salt);
			let step2 = await userDao.changeForgotPassword(params);
			return userConstant.MESSAGES.SUCCESS.CHANGE_FORGOT_PASSWORD;
		}
	} catch (error) {
		throw error;
	}
};

/**
 * @function refreshToken
 */
const refreshToken = async function (params: RefreshTokenRequest) {
	try {
		if (!params.refreshToken) {
			return Promise.reject(userConstant.MESSAGES.ERROR.REFRESH_TOKEN_REQUIRED);
		} else {
			let step1 = await loginHistoryDao.findDeviceById(params);
			if (step1.refreshToken !== params.refreshToken) {
				return Promise.reject(userConstant.MESSAGES.ERROR.INVALID_REFRESH_TOKEN);
			} else {
				delete params.refreshToken;
				let accessToken = await tokenManager.refreshTokenOfUser({ "object": params, "salt": step1 ? step1.salt : config.SERVER.JWT_CERT_KEY });
				let refreshToken = appUtils.encodeToBase64(appUtils.genRandomString(32));
				let step2 = await loginHistoryDao.updateRefreshToken({
					"deviceId": params.deviceId,
					"userId": params.userId,
					"refreshToken": refreshToken
				});
				return config.CONSTANT.MESSAGES.SUCCESS.REFRESH_TOKEN({ "accessToken": accessToken, "refreshToken": refreshToken });
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
		if (config.SERVER.IS_SINGLE_DEVICE_LOGIN) {
			let step1 = await loginHistoryDao.removeDeviceByUserId(params);
		} else {
			let step1 = await loginHistoryDao.removeUserDeviceById(params);
		}
		if (config.SERVER.IS_REDIS_ENABLE) {
			let step2 = await redisClient.deleteKey(params.userId + "." + params.deviceId);
		}
		return userConstant.MESSAGES.SUCCESS.LOGOUT;
	} catch (error) {
		throw error;
	}
};

/**
 * @function userList
 */
const userList = async function (params: ListingRequest) {
	try {
		// if (
		// 	params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
		// 	params.permission.indexOf("employee") !== -1 || params.permission.indexOf("driver") !== -1
		// ) {
		// Added Access for Subadmin - Shivakumar A
		if (params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN || params.adminType === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN ||
			params.permission.indexOf("employee") !== -1 || params.permission.indexOf("driver") !== -1) {
			let step1 = await adminDao.findAdminById(params);
			// if (
			// 	step1.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			// 	step1.permission.indexOf("employee") !== -1 || step1.permission.indexOf("driver") !== -1
			// ) {
			// Added Access for Subadmin - Shivakumar A
			if (step1.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN || params.adminType === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN ||
				step1.permission.indexOf("employee") !== -1 || step1.permission.indexOf("driver") !== -1) {
				let response: any = {};
				let step2 = await userDao.userList(params).then(function (result) {
					response.userList = result[0];
					response.totalCount = result[1] || 0;
				});
				return userConstant.MESSAGES.SUCCESS.USER_LIST(response);
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
// userlist with approved address - satyam
const userListCurrent = async function (params: ListingRequest) {
	try {
		if (params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN || params.adminType === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN ||
			params.permission.indexOf("employee") !== -1 || params.permission.indexOf("driver") !== -1) {
			let step1 = await adminDao.findAdminById(params);
			if (step1.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN || params.adminType === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN ||
				step1.permission.indexOf("employee") !== -1 || step1.permission.indexOf("driver") !== -1) {
				let response: any = {};
				let step2 = await userDao.userListCurrent(params).then(function (result) {
					response.userList = result[0];
					response.totalCount = result[1] || 0;
				});
				return userConstant.MESSAGES.SUCCESS.USER_LIST(response);
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
 * @function exportUser
 */
const exportUser = async function (params: ListingRequest) {
	try {
		let step1 = await userDao.exportUser(params);
		let step2 = await userMapper.exportUserResponseMapping(step1);
		let step3 = config.CONSTANT.EXPORT_SHEET.USER_LIST;
		const sheetName = "";
		let step4 = await appUtils.createStream(step2, step3, sheetName);
		return userConstant.MESSAGES.SUCCESS.EXPORT_USER(step4);
	} catch (error) {
		throw error;
	}
};

/**
 * @function _blockUser
 * @description if IS_REDIS_ENABLE set to true,
 * than redisClient.storeSet() function saves value in redis.
 */
const _blockUser = async function (params: BlockRequest, tokenData: TokenData) {
	try {
		let step1 = await userDao.blockUnblock(params);
		// store blocked_set as a key and userId as a value (redis SET)
		let step2;
		if (config.SERVER.IS_REDIS_ENABLE) {
			step2 = await redisClient.storeSet("blocked_set", [params.userId]);
		}
		let step3 = await promise.join(step1, step2);
		if (step1.userType === config.CONSTANT.USER_TYPE.DRIVER) {
			step3[0].moduleName = config.CONSTANT.MODULE_KEY.DRIVER;
		} else {
			step3[0].moduleName = config.CONSTANT.MODULE_KEY.EMPLOYEE;
		}
		step3[0].message = "Account has been blocked of" + " " + step1.name;
		let step4 = await auditLogDao.addLog(step3[0], tokenData, config.CONSTANT.LOG_HISTORY_TYPE.BLOCK);
		return userConstant.MESSAGES.SUCCESS.BLOCK_USER;
	} catch (error) {
		throw error;
	}
};

/**
 * @function _unblockUser
 * @description if IS_REDIS_ENABLE set to true,
 * than redisClient.removeFromSet() function removes value in redis.
 */
const _unblockUser = async function (params: BlockRequest, tokenData: TokenData) {
	try {
		let step1 = await userDao.blockUnblock(params);
		// remove userId from blocked_set (redis SET)
		let step2;
		if (config.SERVER.IS_REDIS_ENABLE) {
			step2 = await redisClient.removeFromSet("blocked_set", params.userId);
		}
		let step3 = await promise.join(step1, step2);
		if (step1.userType === config.CONSTANT.USER_TYPE.DRIVER) {
			step3[0].moduleName = config.CONSTANT.MODULE_KEY.DRIVER;
		} else {
			step3[0].moduleName = config.CONSTANT.MODULE_KEY.EMPLOYEE;
		}
		step3[0].message = "Account has been unblocked of" + " " + step1.name;
		let step4 = await auditLogDao.addLog(step3[0], tokenData, config.CONSTANT.LOG_HISTORY_TYPE.BLOCK);
		return userConstant.MESSAGES.SUCCESS.UNBLOCK_USER;
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
			tokenData.permission.indexOf("driver") !== -1 || tokenData.permission.indexOf("employee") !== -1
		) {
			switch (params.status) {
				case config.CONSTANT.STATUS.BLOCKED:
					return _blockUser(params, tokenData);
				case config.CONSTANT.STATUS.UN_BLOCKED:
					return _unblockUser(params, tokenData);
			}
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};

/**
 * @function _multiBlockUser
 * @description if IS_REDIS_ENABLE set to true,
 * than redisClient.storeSet() function saves value in redis.
 */
const _multiBlockUser = async function (params: MultiBlockRequest) {
	try {
		let userIds: any = params.userIds;
		// block users one by one
		await userIds.forEach(async (userId) => {
			params.userId = userId;
			let step1 = await userDao.multiBlockUnblock(params);
		});
		// store blocked_set as a key and userId as a value (redis SET)
		if (config.SERVER.IS_REDIS_ENABLE) {
			let step2 = await redisClient.storeSet("blocked_set", params.userIds);
		}
		return userConstant.MESSAGES.SUCCESS.MULTI_BLOCK_USER;
	} catch (error) {
		throw error;
	}
};

/**
 * @function _multiUnblockUser
 * @description if IS_REDIS_ENABLE set to true,
 * than redisClient.removeFromSet() function removes value in redis.
 */
const _multiUnblockUser = async function (params: MultiBlockRequest) {
	try {
		let userIds: any = params.userIds;
		// un-block users one by one
		await userIds.forEach(async (userId) => {
			params.userId = userId;
			let step1 = await userDao.multiBlockUnblock(params);
		});
		// remove userId from blocked_set (redis SET)
		if (config.SERVER.IS_REDIS_ENABLE) {
			let step2 = await redisClient.removeFromSet("blocked_set", params.userIds);
		}
		return userConstant.MESSAGES.SUCCESS.MULTI_UNBLOCK_USER;
	} catch (error) {
		throw error;
	}
};

/**
 * @function multiBlockUnblock
 */
const multiBlockUnblock = async function (params: MultiBlockRequest) {
	try {
		if (
			params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			params.permission.indexOf("block_user") !== -1
		) {
			switch (params.status) {
				case config.CONSTANT.STATUS.BLOCKED:
					return _multiBlockUser(params);
				case config.CONSTANT.STATUS.UN_BLOCKED:
					return _multiUnblockUser(params);
			}
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};

/**
 * @function deleteUser
 * @description if IS_REDIS_ENABLE set to true,
 * than redisClient.storeSet() function saves value in redis.
 */
const deleteUser = async function (params: DeleteRequest, tokenData: TokenData) {
	try {
		if (
			tokenData.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			tokenData.permission.indexOf("employee") !== -1 || tokenData.permission.indexOf("driver") !== -1
		) {
			let step1 = await userDao.deleteUser(params);
			// store deleted_set as a key and userId as a value (redis SET)
			let step2;
			if (config.SERVER.IS_REDIS_ENABLE) {
				step2 = await redisClient.storeSet("deleted_set", [params.userId]);
			}
			let step3 = loginHistoryDao.removeDeviceById({ "userId": params.userId });
			let step4 = await promise.join(step1, step2, step3);
			if (step1.userType === config.CONSTANT.USER_TYPE.DRIVER) {
				step4[0].moduleName = config.CONSTANT.MODULE_KEY.DRIVER;
			} else {
				step4[0].moduleName = config.CONSTANT.MODULE_KEY.EMPLOYEE;
			}
			step4[0].message = "Account has been archived of" + " " + step1.name;
			let step6 = await auditLogDao.addLog(step4[0], tokenData, config.CONSTANT.LOG_HISTORY_TYPE.ARCHIVE);
			return userConstant.MESSAGES.SUCCESS.DELETE_USER;
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};

/**
 * @function userDetails
 */
const userDetails = async function (params: UserId) {
	try {
		let step1 = await userDao.findUserById(params);
		let step2 = await userDao.findUserGroupById(params);
		// User Counts -- satyam
		let step3  = await userDao.getUserrequestCountReschedule(params);
		let step4  = await userDao.getUserrequestCountCancelled(params);
		let step5 = await userDao.getUserNoShowStatus(params);
		return userConstant.MESSAGES.SUCCESS.USER_DETAILS(step1, step2, step3, step4, step5);
	} catch (error) {
		throw error;
	}
};
/**
 * @function employeeById
 * @param params Chect employee exist
 */
const employeeById = async function (params: IsEmployee) {
	try {
		let response: any = {};
		let step = await userDao.employeeById(params);
		if (step) {
			return userConstant.MESSAGES.SUCCESS.PROFILE(step);
		} else {
			return userConstant.MESSAGES.ERROR.EMPLOYEE_DATA;
		}

	} catch (error) {
		throw error;
	}
};
// satyam -- employee for group
const empForGroup = async function (params: EmployeeForGroupRequest) {
	try {
		let response: any = {};
		let step = await userDao.empForGroup(params);
		if (step) {
			return userConstant.MESSAGES.SUCCESS.PROFILE(step);
		} else {
			return userConstant.MESSAGES.ERROR.EMPLOYEE_DATA;
		}

	} catch (error) {
		throw error;
	}
};
/**
 * @function driverListing
 */
const driverListing = async function (params: ListingRequest) {
	try {
		// let searchKeyNo = params.searchKey ? params.searchKey.length : 0;
		// if (searchKeyNo >= 3) {
		let response: any = {};
		response = await userDao.driverListing(params);
		return userConstant.MESSAGES.SUCCESS.USER_LIST(response);
		// } else {
		// 	return Promise.reject(userConstant.MESSAGES.ERROR.SEARCH_KEY_LENGTH);
		// }

	} catch (error) {
		throw error;
	}
};

/**
 * @param params
 * Employee list for dummy testing purpose
 */
const empList = async function (params: TokenData) {
	try {
		let response: any = {};
		response = await userDao.empList(params);
		return userConstant.MESSAGES.SUCCESS.EMP_LIST(response);
	} catch (error) {
		throw error;
	}
};

/**
 * @function profile
 */
const profile = async function (params: TokenData) {
	try {
		let step1 = await userDao.findUserProfile(params);
		return userConstant.MESSAGES.SUCCESS.PROFILE(step1);
	} catch (error) {
		throw error;
	}
};

/**
 * @function _addUserOnImport
 */
const _addUserOnImport = async function (params) {
	let step1 = await userDao.findUserByEmailOrMobileNo(params);
	if (!step1) {
		return await userDao.addUser(params);
	} else {
		return await userDao.updateUser(params);
	}
};

/**
 * @function _importXLSXFile
 */
const _importXLSXFile = async function (file) {
	let json = await xlsx.readAndParseXLSX(file);
	let parseJson = appUtils.readAndParseJSON(json);
	await parseJson.forEach(async (data) => {
		let step1 = await _addUserOnImport(data);
	});
	return userConstant.MESSAGES.SUCCESS.IMPORT_USER;
};

/**
 * @function _importCSVFile
 */
const _importCSVFile = async function (file) {
	let json = await csv.readAndParseCSV(file);
	let parseJson = appUtils.readAndParseJSON(json);
	await parseJson.forEach(async (data) => {
		let step1 = await _addUserOnImport(data);
	});
	return userConstant.MESSAGES.SUCCESS.IMPORT_USER;
};

// redirect to reset password page
const redirectToResetPassword = async function (params: ResetPasswordRequest) {
	try {
		let result = await tokenManager.verifyToken(params);
		let step1 = await userDao.checkExistingToken(result, params.accessToken);
		if (step1) {
			let userData = await userDao.isTokenExist(result);
			if (userData.forgetToken) {
				// EMPTY THE TOKEN
				let step1 = await userDao.emptyForgetToken(userData);
				return result;
			} else {
				result.response = config.CONSTANT.MESSAGES.ERROR.TOKEN_EXPIRED;
				return result;
			}
		} else {
			result.response = config.CONSTANT.MESSAGES.ERROR.TOKEN_EXPIRED;
			return result;
		}
	} catch (error) {
		return error;
	}
};

/**
 * @function importUsers
 */
const importUsers = async function (params: ImportUsersRequest) {
	try {
		if (
			params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			params.permission.indexOf("import_user") !== -1
		) {
			let excelMime = mimeType.excel;
			switch (params.file.hapi.headers["content-type"]) {
				case config.CONSTANT.MIME_TYPE.XLSX:
				case excelMime[0].mimetype:
					return _importXLSXFile(params.file);
				case config.CONSTANT.MIME_TYPE.XLS:
				case excelMime[1].mimetype:
					return _importXLSXFile(params.file);
				case config.CONSTANT.MIME_TYPE.CSV1:
				case config.CONSTANT.MIME_TYPE.CSV2:
				case excelMime[2].mimetype:
				case excelMime[3].mimetype:
					return _importCSVFile(params.file);
			}
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};

// Update home address of employee
const updateHomeAddress = async function (params: HomeAddressRequest) {
	try {
		// let source: any = {};
		// let destination: any = {};
		// let step1 = await userDao.findUserById(params);
		// source = step1.dropoff.coordinates;
		// await userDao.checkAlreadyRequest(params);
		// await appUtils.getDistanceTime(source, params).then(function (data) {
		// 	console.log("data Home locatipon update =========" + JSON.stringify(data));
		// 	let distance = data['distance'];
		// 	let duration = data['duration'];
		// 	let fdistance = distance.split(" ", 1);
		// 	let fduration = duration.split(" ", 1);
		// 	params.distance = data['distanceValue'];
		// 	params.estimatedTime = data['durationValue'];
		// 	params.durationMinute = data['duration'];
		// 	params.distKm = data['distance'];
		// 	let step = userDao.updateHomeAddress(params);
		// });
		let step = await userDao.updateHomeAddress(params);
		let step2 = await userDao.findUserById(params);
		return userConstant.MESSAGES.SUCCESS.EMP_HOME_ADDRESS({ "data": step2 });
	} catch (error) {
		throw error;
	}
};
// Update driver info
const updateDriver = async function (params: DriverUpdateRequest, tokenData: TokenData) {
	try {
		if (
			tokenData.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			tokenData.permission.indexOf("driver") !== -1
		) {
			let step1 = await userDao.updateDriver(params);
			step1.moduleName = config.CONSTANT.MODULE_KEY.DRIVER;
			step1.message = "Personal information of" + " " + step1.name + " " + "is updated";
			let step2 = await auditLogDao.addLog(step1, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.EDIT);
			return userConstant.MESSAGES.SUCCESS.DRIVER_UPDATE;
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};
// Update employee info
const updateEmp = async function (params: EmpUpdateRequest, tokenData: TokenData) {
	try {
		if (
			tokenData.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			tokenData.permission.indexOf("employee") !== -1
		) {
			let emailExistCheck = await userDao.isEmpEmailByIdExists(params);
			// satyam -- Employee Id - alreadyExists
			let isExist = await userDao.isEmployeeIdAlreadyExistsUpdate(params);
			params.userId = params.empId;
			let userDetails = await userDao.findUserById(params);
			let password = await appUtils.generatePassword();
			let salt = bcrypt.genSaltSync(config.SERVER.SALT_ROUNDS);
			let hash = appUtils.encryptHashPassword(password, salt);
			// let coordinate, type;
			// let homeAddress: any = {};
			// let homeObj: any = {};
			// if (params.houseNo)
			// 	homeObj.houseNo = params.houseNo;
			// if (params.roadName)
			// 	homeObj.roadName = params.roadName;
			// if (params.city)
			// 	homeObj.city = params.city;
			// if (params.state)
			// 	homeObj.state = params.state;
			// if (params.landMark)
			// 	homeObj.landMark = params.landMark;
			// if (params.fullAddress)
			// 	homeObj.fullAddress = params.fullAddress;
			// if (params.latitude && params.longitude) {
			// 	coordinate = [params.longitude, params.latitude];
			// 	type = "Point";
			// 	homeAddress = { address: homeObj, coordinates: coordinate, type: type };
			// 	params.pickup = homeAddress;
			// 	params.isAddressChangeReq = true;
			// }
			if (params.email && userDetails.isEmailChange === false) {
				params.password = password;
				params.salt = salt;
				params.hash = hash;
			}
			params.isEmailChange = userDetails.isEmailChange;
			let step1 = await userDao.updateEmp(params);

			// Get Companycode while updating employee -  Shivakumar A
			params.userId = userDetails.createdBy;
			let adminCompany = await adminDao.findAdminById(params);
			params.companyCode = adminCompany.companyCode;

			if (params.email && userDetails.isEmailChange === false) {

				let step3 = mailManager.sendSignupPasswordEmail(params);
			}
			let step5 = await promise.join(userDetails, step1);

			step5[0].moduleName = config.CONSTANT.MODULE_KEY.EMPLOYEE;

			step5[0].message = "Personal information of" + " " + step1.name + " " + "is updated";
			let step4 = await auditLogDao.addLog(step5[0], tokenData, config.CONSTANT.LOG_HISTORY_TYPE.EDIT);
			return userConstant.MESSAGES.SUCCESS.EMP_UPDATE;
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};

/**
 * Contact to admin any query
 */
const contactAdmin = async function (params: UserQueryRequest) {
	try {
		params.created = Date.now();
		let step2 = await userDao.contactAdmin(params);
		return userConstant.MESSAGES.SUCCESS.CONTACT_ADMIN;
	} catch (error) {
		throw error;
	}
};

/**
 * @function bulkEmpSignup
 */
const bulkEmpSignup = async function (params: EmpBulkSignupRequest) {
	try {
		let empArr = [];
		let mailArr = [];
		let coordinate, type;
		// let json: any = await csv.readAndParseCSV(params.file); // for csv file
		let json: any = await xlsx.readAndParseXLSX(params.file);
		let shift = await adminDao.findAdminById(params);
		let shiftSlot = shift.shiftSlot;
		// for (let item of json) {
		await Promise.all(json.map(async (item: any) => {
			// console.log('item.employeeId.toString(): ', item.employeeId.toString());
			// await _.find(shiftSlot, (obj) => { console.log("obj.shiftName === item.shift: ", obj.shiftName === item.shift, "obj.shiftName: ", obj.shiftName, "item.shift: ", item.shift); });
			let shiftObj = await _.find(shiftSlot, (obj) => { return obj.shiftName === item.shift; });
			if (!shiftObj) {
				return Promise.reject(userConstant.MESSAGES.ERROR.SHIFT_NOT_FOUND);
			}
			let step1 = await userDao.isEmailAlreadyExists(item);
			let isExist = await userDao.isEmployeeIdAlreadyExists(item);
			let isMobileExist = await userDao.isMobileNoUnique({ 'mobileNo': item.mobileNo.toString() });
			if (isMobileExist)
				return Promise.reject(userConstant.MESSAGES.ERROR.MOBILE_NO_ALREADY_EXIST);
			let password = await appUtils.generatePassword();
			// let adminCompany = await adminDao.findAdminById(params);
			let salt = bcrypt.genSaltSync(config.SERVER.SALT_ROUNDS);
			// let salt = this.salt = appUtils.genRandomString(config.SERVER.SALT_ROUNDS);
			let hash = appUtils.encryptHashPassword(password, salt);
			item.gender = item.gender.toLowerCase();
			if (item.gender !== config.CONSTANT.GENDER.MALE && item.gender !== config.CONSTANT.GENDER.FEMALE) {
				return Promise.reject(userConstant.MESSAGES.ERROR.INVALID_GENDER);
			}

			// if (!item.email || !item.shift || (!item.lat && !item.long && !item.houseNo && !item.roadName && !item.city && !item.state)) {
			// 	return Promise.reject(userConstant.MESSAGES.ERROR.INVALID_DATA);
			// }
			if (!item.email || !item.shift || !item.employeeId || !item.mobileNo) {
				return Promise.reject(userConstant.MESSAGES.ERROR.INVALID_DATA);
			}
			let empIdvalidate = item.employeeId;
			if (empIdvalidate.toString().length < 3) {
				return Promise.reject(userConstant.MESSAGES.ERROR.EMPLOYEEID_LENGETH);
			}
			/*if (! /^[a-z][a-z\s]*$/.test(item.name)) {
				return Promise.reject(userConstant.MESSAGES.ERROR.CAHRACTER_ALLOWED);
			}*/

			// new validation
			if (! /^[a-zA-Z ]+$/.test(item.name)) {
				return Promise.reject(userConstant.MESSAGES.ERROR.CAHRACTER_ALLOWED);
			}
			if (_.isNumber(item.mobileNo) === false) {
				return Promise.reject(userConstant.MESSAGES.ERROR.NUMBER_ALLOWED);
			}
			// if (! /^[0-9]{10}$/.test(item.mobileNo)) {
			// 	return Promise.reject(userConstant.MESSAGES.ERROR.MOBILE_NUMBER_LENGETH);
			// }
			// Check if Mobile number is 10 digits - Shivakumar A
			if (! /^[0-9]{10}$/.test(parseInt(item.mobileNo).toString())) {
				console.log(item.mobileNo);
				return Promise.reject(userConstant.MESSAGES.ERROR.MOBILE_NUMBER_LENGETH);
			}

			if (item.gender === 'male')
				item.gender = config.CONSTANT.GENDER.MALE;
			else if (item.gender === 'female')
				item.gender = config.CONSTANT.GENDER.FEMALE;
			else
				config.CONSTANT.GENDER.OTHER;

			let homeObj: any = {};
			let pickup: any = {};
			if (item.houseNo || item.roadName || item.city || item.state){
				if (item.houseNo)
					homeObj.houseNo = item.houseNo;
				if (item.roadName)
					homeObj.roadName = item.roadName;
				if (item.city)
					homeObj.city = item.city;
				if (item.state)
					homeObj.state = item.state;
				if (item.landMark)
					homeObj.landMark = item.landMark;
				if (item.lat && item.long) {
					coordinate = [item.long, item.lat];
					type = "Point";
				}
				else {
					let address = '';
					await _.forIn(homeObj, function (value, key) { address = address.concat(value, ','); });
					let latLong = await userDao.addrToLatLong(address);
					if (!latLong) {
						return Promise.reject({...userConstant.MESSAGES.ERROR.INVALID_ADDRESS, employee: item.name});
					}
					else{
						coordinate = [latLong.lng, latLong.lat];
						type = "Point";
						let fullAddress = "";
						if (item.houseNo){
							fullAddress = fullAddress.concat(item.houseNo);
						}
						if (item.roadName){
							if (fullAddress.length !== 0){
								fullAddress = fullAddress.concat(',');
							}
							fullAddress = fullAddress.concat(item.roadName);
						}
						if (item.city){
							if (fullAddress.length !== 0){
								fullAddress = fullAddress.concat(',');
							}
							fullAddress = fullAddress.concat(item.city);
						}
						if (item.state){
							if (fullAddress.length !== 0){
								fullAddress = fullAddress.concat(',');
							}
							fullAddress = fullAddress.concat(item.state);
						}
						if (item.landMark){
							if (fullAddress.length !== 0){
								fullAddress = fullAddress.concat(',');
							}
							fullAddress = fullAddress.concat(item.landMark);
						}
						homeObj.fullAddress = fullAddress;
						pickup = {
							address: homeObj,
							coordinates: coordinate,
							type: type
						};
					}
				}
			} else {
				pickup = {};

			}
			let obj = {
				salt: salt,
				hash: hash,
				employeeId: item.employeeId.toString(),
				email: item.email,
				name: item.name,
				shiftStartTime: shiftObj.startShift,
				shiftEndTime: shiftObj.endShift,
				shift: item.shift,
				weekOff: shiftObj.weekOff,
				countryCode: item.countryCode,
				mobileNo: item.mobileNo.toString(),
				gender: item.gender,
				// pickup: {},
				pickup: pickup ,
				// password: password,
				createdBy: params.userId,
				companyCode: params.companyCode,
				userType: config.CONSTANT.USER_TYPE.EMPLOYEE,
				adminType: params.adminType,
				created: Date.now(),
				groupFormed: false,
				dropoff: shift.companyAddress,
				status: config.CONSTANT.STATUS.UN_BLOCKED,
				isAddressChange: false
			};
			let isExistInRequest = await _.find(empArr, (obj) => { return (obj.employeeId === item.employeeId.toString() || obj.email === item.email || obj.mobileNo === item.mobileNo.toString()); });
			if (isExistInRequest) {
				return Promise.reject(userConstant.MESSAGES.ERROR.DUPLICATE_DATA);
			}
			else {
				empArr.push(obj);
				mailArr.push({ name: obj.name, email: obj.email, password: password, companyCode: params.companyCode });
			}
		}));
		// console.log('finished for all employees ###########################################################');
		// let finalEmp = await _.uniqBy(empArr, 'email');
		// let step2 = await userDao.bulkEmpSignup(finalEmp);
		let step2 = await userDao.bulkEmpSignup(empArr);
		for (let mail of mailArr) {
			let step3 = mailManager.sendSignupPasswordEmail(mail);
		}
		return userConstant.MESSAGES.SUCCESS.IMPORT_USER;
	} catch (error) {
		throw error;
	}
};
/**
* @function bulkDriverSignup
*/
const bulkDriverSignup = async function (params: DriverSignupRequest) {
	try {
		let driverArr = [];
		let mailArr = [];
		let coordinate, type;
		let adminCompany = await adminDao.findAdminById(params);
		// let json: any = await csv.readAndParseCSV(params.file); // for csv file
		let json: any = await xlsx.readAndParseXLSX(params.file);
		for (let item of json) {
			let step1 = await userDao.isEmailAlreadyExists(item);
			let isMobileExist = await userDao.isMobileNoUnique({ 'mobileNo': item.mobileNo.toString() });
			if (isMobileExist)
				return Promise.reject(userConstant.MESSAGES.ERROR.MOBILE_NO_ALREADY_EXIST);
			let password = await appUtils.generatePassword();
			// if (!/[^a-z]/i.test(item.name) === false) {
			// 	return Promise.reject(userConstant.MESSAGES.ERROR.CAHRACTER_ALLOWED);
			// }
			if (! /^[a-zA-Z ]+$/.test(item.name)) {
				return Promise.reject(userConstant.MESSAGES.ERROR.CAHRACTER_ALLOWED);
			}
			if (_.isNumber(item.mobileNo) === false) {
				return Promise.reject(userConstant.MESSAGES.ERROR.NUMBER_ALLOWED);
			}
			if (_.isNumber(item.emergencyNo) === false) {
				return Promise.reject(userConstant.MESSAGES.ERROR.NUMBER_ALLOWED);
			}
			if (! /^[0-9]{10}$/.test(item.mobileNo)) {
				return Promise.reject(userConstant.MESSAGES.ERROR.MOBILE_NUMBER_LENGETH);
			}
			if (! /^[0-9]{10}$/.test(item.emergencyNo)) {
				return Promise.reject(userConstant.MESSAGES.ERROR.MOBILE_NUMBER_LENGETH);
			}
			if (!item.email || !item.DlBadgeNO || !item.dlRenewalDate || !item.mobileNo || !item.countryCode || !item.name) {
				return Promise.reject(userConstant.MESSAGES.ERROR.INVALID_DATA);
			}

			let randomenumber = "D" + Math.floor(Math.random() * 100000) + 8;
			let salt = bcrypt.genSaltSync(config.SERVER.SALT_ROUNDS);
			// let salt = this.salt = appUtils.genRandomString(config.SERVER.SALT_ROUNDS);
			let hash = appUtils.encryptHashPassword(password, salt);
			if (item.dlRenewalDate)
				item.dlRenewalDate = new Date(item.dlRenewalDate).getTime();
			let obj = {
				salt: salt,
				hash: hash,
				dropoff: adminCompany.companyAddress,
				driverId: randomenumber,
				dlRenewalDate: item.dlRenewalDate,
				DlBadgeNO: item.DlBadgeNO,
				backgroundVarified: item.backgroundVarified,
				email: item.email,
				name: item.name,
				countryCode: item.countryCode,
				mobileNo: item.mobileNo.toString(),
				emergencyNo: item.emergencyNo.toString(),
				// emergencyNo:item.emergencyNo.toString(),
				// password: password,
				createdBy: params.userId,
				companyCode: params.companyCode,
				userType: config.CONSTANT.USER_TYPE.DRIVER,
				adminType: params.adminType,
				created: Date.now(),
				status: config.CONSTANT.STATUS.UN_BLOCKED
			};
			let isExistInRequest = await _.find(driverArr, (obj) => { return (obj.email === item.email || obj.mobileNo === item.mobileNo.toString()); });
			if (isExistInRequest) {
				return Promise.reject(userConstant.MESSAGES.ERROR.DUPLICATE_DRIVER_DATA);
			}
			else {
				driverArr.push(obj);
				mailArr.push({ name: obj.name, email: obj.email, password: password, companyCode: obj.companyCode });
			}
		}
		let step2 = await userDao.bulkEmpSignup(driverArr);
		for (let mail of mailArr) {
			let step3 = mailManager.sendSignupPasswordEmail(mail);
		}
		return userConstant.MESSAGES.SUCCESS.IMPORT_USER;
	} catch (error) {
		throw error;
	}
};

/**
 * Employee Shift Listing
 */
const empShiftList = async function (params: EmpShiftListing) {
	try {
		let response: any = {};
		response = await userDao.empShiftList(params);
		return userConstant.MESSAGES.SUCCESS.EMP_WEEKOFF_LIST(response);
	} catch (error) {
		throw error;
	}
};
// Update employee shift
const updateEmpShift = async function (params: EmpShiftUpdateRequest) {
	try {
		console.log('params: ', params);
		let empProfileObj: any = {};
		empProfileObj.userId = params.employeeId;
		if (params.weekOff)
			empProfileObj.weekOff = params.weekOff;
		if (params.shiftName) {
			let adminCompany = await adminDao.findAdminById(params);
			for (let shiftItem of adminCompany.shiftSlot) {
				if (shiftItem.shiftName === params.shiftName)
					console.log('shiftItem: ', shiftItem);
				empProfileObj.shift = params.shiftName;
				empProfileObj.shiftStartTime = shiftItem.startShift;
				empProfileObj.shiftEndTime = shiftItem.endShift;
			}
		}
		console.log('empProfileObj: ', empProfileObj);
		let empUpdate = await userDao.updateEmpShift(params);
		return userConstant.MESSAGES.SUCCESS.EMP_SHIFT_UPDATE;
	} catch (error) {
		throw error;
	}
};

/**
 * @function addressChangeRequest
 */
const addressChangeRequest = async function (params: IsAddressChangeRequest) {
	try {
		if (
			params.adminType === config.CONSTANT.ADMIN_TYPE.ADMIN ||
			params.permission.indexOf("employee") !== -1
		) {
			let result = await userDao.addressChangeRequest(params);
			return result;
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	} catch (error) {
		throw error;
	}
};
/**
 * @function isMobileNoUnique
 * @param params mobileNo
 */
const isMobileNoUnique = async function (params: IsMobileNoUnique) {
	try {
		let response: any = {};
		let step = await userDao.isMobileNoUnique(params);
		if (step) {
			return userConstant.MESSAGES.ERROR.MOBILE_NO_EXIST;
		} else {
			return userConstant.MESSAGES.SUCCESS.IS_MOBILE_NO;
		}

	} catch (error) {
		throw error;
	}
};
export let userController = {
	driverSignup,
	empSignup,
	login,
	forgotPassword,
	changeForgotPassword,
	refreshToken,
	logout,
	userList,
	// userlist with approved address - satyam
	userListCurrent,
	exportUser,
	blockUnblock,
	multiBlockUnblock,
	deleteUser,
	userDetails,
	profile,
	importUsers,
	changePassword,
	redirectToResetPassword,
	updateHomeAddress,
	updateDriver,
	updateEmp,
	driverListing,
	contactAdmin,
	empList,
	bulkEmpSignup,
	bulkDriverSignup,
	empShiftList,
	updateEmpShift,
	employeeById,
	addressChangeRequest,
	isMobileNoUnique,
	empForGroup
};
