"use strict";

import * as AuthBearer from "hapi-auth-bearer-token";

import { AdminDao } from "@modules/v1/admin/AdminDao";
import * as config from "@config/index";
import { CustomException } from "@exceptions/CustomException";
import * as Hapi from "hapi";
import { LoginHistoryDao } from "@modules/v1/loginHistory/LoginHistoryDao";
import { RedisClient } from "@lib/RedisClient";
import * as tokenManager from "@lib/tokenManager";
import { EmpVehicleDao } from "@modules/v1/empVehicle/EmpVehicleDao";

let adminDao = new AdminDao();
let customException = new CustomException();
let loginHistoryDao = new LoginHistoryDao();
let redisClient = new RedisClient();
let empVehicleDao = new EmpVehicleDao();

// Register Authorization Plugin
export let plugin = {
	name: "auth-token-plugin",
	register: async function (server) {
		await server.register(AuthBearer);

		/**
		 * @function AdminAuth
		 */
		server.auth.strategy("AdminAuth", "bearer-access-token", {
			allowQueryToken: false,
			allowMultipleHeaders: true,
			accessTokenName: "accessToken",
			validate: async (request: Hapi.Request, accessToken: string, h: Hapi.ResponseToolkit) => {
				try {
					let isValid = await apiKeyFunction(request.headers.api_key);

					if (!isValid) {
						return ({ isValid: false, credentials: { accessToken: accessToken, tokenData: {} } });
						// throw customException.unauthorizedAccessException();
					} else {
						let jwtPayload = await tokenManager.decodeToken({ accessToken });
						// Added permission for employee Aashiq - 24/08/2020
						if (jwtPayload.payload.type !== config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN && jwtPayload.payload.type !== config.CONSTANT.ADMIN_TYPE.SUB_ADMIN && jwtPayload.payload.type !== config.CONSTANT.ADMIN_TYPE.EMPLOYEE) {
							throw customException.unauthorizedAccessException();
						}
						let tokenData = await _verifyToken({ accessToken });
						let loginHistoryData = await loginHistoryDao.findChunkDevice(tokenData.userId);
						if (loginHistoryData.length === 0 && tokenData.type === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN) {
							throw customException.permissionChangedByAdmin();
						} else if (loginHistoryData.length === 0 && tokenData.type === config.CONSTANT.ADMIN_TYPE.ADMIN ) {
							throw customException.passwordChangedBySelf();
						}
						// let adminData = await adminDao.findAdminById(tokenData);
						let adminData = await adminDao.findAdminByIdForAuth(tokenData);
						if (!adminData) {
							throw customException.userNotFoundException();
						} else {
							if (adminData.status === config.CONSTANT.STATUS.BLOCKED) {
								throw customException.blockedException();
							} else if (adminData.status === config.CONSTANT.STATUS.DELETED) {
								throw customException.deletedException();
							} else {
								tokenData.permission = adminData.permission;
								return ({ isValid: true, credentials: { accessToken: accessToken, tokenData: tokenData } });
							}
						}
					}
				} catch (error) {
					throw error;
				}
			}
		});

		/**
		 * @function SuperAdminAuth
		 */
		server.auth.strategy("SuperAdminAuth", "bearer-access-token", {
			allowQueryToken: false,
			allowMultipleHeaders: true,
			accessTokenName: "accessToken",
			validate: async (request: Hapi.Request, accessToken: string, h: Hapi.ResponseToolkit) => {
				try {
					let isValid = await apiKeyFunction(request.headers.api_key);

					if (!isValid) {
						return ({ isValid: false, credentials: { accessToken: accessToken, tokenData: {} } });
						// throw customException.unauthorizedAccessException();
					} else {
						let jwtPayload = await tokenManager.decodeToken({ accessToken });
						if (jwtPayload.payload.accountLevel !== config.CONSTANT.ACCOUNT_LEVEL.SUPER) {
							throw customException.unauthorizedAccessException();
						}
						let tokenData = await _verifyToken({ accessToken });
						let adminData = await adminDao.findAdminById(tokenData);

						if (!adminData) {
							throw customException.userNotFoundException();
						} else {
							if (adminData.status === config.CONSTANT.STATUS.BLOCKED) {
								throw customException.blockedException();
							} else if (adminData.status === config.CONSTANT.STATUS.DELETED) {
								throw customException.deletedException();
							} else {
								tokenData.permission = adminData.permission;
								return ({ isValid: true, credentials: { accessToken: accessToken, tokenData: tokenData } });
							}
						}
					}
				} catch (error) {
					throw error;
				}
			}
		});

		/**
		 * @function UserAuth
		 * @description if IS_REDIS_ENABLE set to true,
		 * than redisClient.getList() function fetch value from redis.
		 */
		server.auth.strategy("UserAuth", "bearer-access-token", {
			allowQueryToken: false,
			allowMultipleHeaders: true,
			accessTokenName: "accessToken",
			allowChaining: false,
			validate: async (request: Hapi.Request, accessToken: string, h: Hapi.ResponseToolkit) => {
				try {
					let isValid = await apiKeyFunction(request.headers.api_key);
					console.log(isValid);
					console.log(accessToken);
					console.log(request.headers.api_key);
					console.log(config.SERVER.API_KEY);
					if (!isValid) {
						return ({ isValid: false, credentials: { accessToken: accessToken, tokenData: {} } });
						// throw customException.unauthorizedAccessException();
					} else {
						// let jwtPayload = JSON.parse(appUtils.decodeBase64(accessToken.split('.')[1]));
						let jwtPayload = await tokenManager.decodeToken({ accessToken });
						if (!config.SERVER.IS_REDIS_ENABLE) {
							// let userData = await empVehicleDao.findUserById(jwtPayload.payload);
							let userData = await empVehicleDao.findUserByIdForAuth(jwtPayload.payload);
							if (!userData) {
								throw customException.userNotFoundException();
							} else {
								let step1 = await loginHistoryDao.findDeviceById(jwtPayload.payload);
								if (!step1) {
									throw customException.sessionExpiredException();
								} else {
									let tokenData = await _verifyUserToken({ "accessToken": accessToken, "salt": step1.salt });
									// account level check removed - satyam
									// if (tokenData.accountLevel !== config.CONSTANT.ACCOUNT_LEVEL.NORMAL_USER) {
									// 	throw customException.unauthorizedAccessException();
									// } else {
									// 	if (userData.status === config.CONSTANT.STATUS.BLOCKED) {
									// 		throw customException.blockedException();
									// 	} else if (userData.status === config.CONSTANT.STATUS.DELETED) {
									// 		throw customException.deletedException();
									// 	} else {
									// 		return ({ isValid: true, credentials: { accessToken: accessToken, tokenData: tokenData } });
									// 	}
									// }
									if (userData.status === config.CONSTANT.STATUS.BLOCKED) {
										throw customException.blockedException();
									} else if (userData.status === config.CONSTANT.STATUS.DELETED) {
										throw customException.deletedException();
									} else {
										return ({ isValid: true, credentials: { accessToken: accessToken, tokenData: tokenData } });
									}
								}
							}
						} else {  // IS_REDIS_ENABLE: true
							let step1 = await redisClient.getList(jwtPayload.payload.userId + "." + jwtPayload.payload.deviceId);
							if (step1.length === 0) { // if data not found in redis then check the data in db
								throw customException.userNotFoundException();
							} else {
								let step2 = await loginHistoryDao.findDeviceById(jwtPayload.payload);
								if (!step2 || step1.length === 0) {
									throw customException.sessionExpiredException();
								} else {
									let tokenData = await _verifyUserToken({ "accessToken": accessToken, "salt": JSON.parse(step1[0]).salt });
									// account level check removed - satyam
									// if (tokenData.accountLevel !== config.CONSTANT.ACCOUNT_LEVEL.NORMAL_USER) {
									// 	console.log("inside if");
									// 	throw customException.unauthorizedAccessException();
									// } else {
									// 	let isBlocked, isDeleted = false;
									// 	let blockedUserSet = await redisClient.getSet("blocked_set");
									// 	let deletedUserSet = await redisClient.getSet("deleted_set");
									// 	isBlocked = (blockedUserSet.indexOf(tokenData.userId) === -1) ? false : true;
									// 	isDeleted = (deletedUserSet.indexOf(tokenData.userId) === -1) ? false : true;
									// 	if (isBlocked) {
									// 		throw customException.blockedException();
									// 	} else if (isDeleted) {
									// 		throw customException.deletedException();
									// 	} else {
									// 		return ({ isValid: true, credentials: { accessToken: accessToken, tokenData: tokenData } });
									// 	}
									// }
									let isBlocked, isDeleted = false;
									let blockedUserSet = await redisClient.getSet("blocked_set");
									let deletedUserSet = await redisClient.getSet("deleted_set");
									isBlocked = (blockedUserSet.indexOf(tokenData.userId) === -1) ? false : true;
									isDeleted = (deletedUserSet.indexOf(tokenData.userId) === -1) ? false : true;
									if (isBlocked) {
										throw customException.blockedException();
									} else if (isDeleted) {
										throw customException.deletedException();
									} else {
										return ({ isValid: true, credentials: { accessToken: accessToken, tokenData: tokenData } });
									}
								}
							}
						}
					}
				} catch (error) {
					throw error;
				}
			}
		});

		await server.register(require("hapi-auth-basic"));

		/**
		 * @function BasicAuth
		 */
		server.auth.strategy("BasicAuth", "basic", {
			allowQueryToken: false,
			allowMultipleHeaders: true,
			accessTokenName: "accessToken",
			allowChaining: true,
			validate: async (request: Hapi.Request, username: string, password: string, h: Hapi.ResponseToolkit) => {
				try {
					if (!username || !password || username !== config.SERVER.BASIC_AUTH.NAME || password !== config.SERVER.BASIC_AUTH.PASS) {
						// throw customException.accessDeniedException();
						return ({ isValid: false, credentials: {} });
					} else {
						return ({ isValid: true, credentials: {} });
					}
				} catch (error) {
					throw error;
				}
			}
		});

		/**
		 * @function RefreshToken
		 */
		server.auth.strategy("RefreshToken", "bearer-access-token", {
			allowQueryToken: false,
			allowMultipleHeaders: true,
			accessTokenName: "accessToken",
			validate: async (request: Hapi.Request, accessToken: string, h: Hapi.ResponseToolkit) => {
				try {
					let isValid = await apiKeyFunction(request.headers.api_key);

					if (!isValid) {
						// throw customException.unauthorizedAccessException();
						return ({ isValid: false, credentials: {} });
					} else {
						let jwtPayload = await tokenManager.decodeToken({ accessToken });
						if (!jwtPayload) {
							throw customException.tokenGenerateException("Invalid Token.");
						} else {
							return ({ isValid: true, credentials: { accessToken: accessToken, tokenData: jwtPayload } });
						}
					}
				} catch (error) {
					throw error;
				}
			}
		});

		// server.auth.default('BasicAuth');
	}
};

let apiKeyFunction = async function (apiKey) {
	try {
		return (apiKey === config.SERVER.API_KEY) ? true : false;
	} catch (error) {
		throw error;
	}
};

let _verifyToken = async function (params) {
	try {
		return tokenManager.verifyToken(params);
	} catch (error) {
		throw error;
	}
};

let _verifyUserToken = async function (params) {
	try {
		return tokenManager.verifyUserToken(params);
	} catch (error) {
		throw error;
	}
};
