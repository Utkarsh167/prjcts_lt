"use strict";

import * as Jwt from "jsonwebtoken";
import * as jwtRefresh from "jsonwebtoken-refresh";

import * as config from "@config/index";
import { CustomException } from "@exceptions/CustomException";
import { LoginHistoryDao } from "@modules/v1/loginHistory/LoginHistoryDao";
import { RedisClient } from "@lib/RedisClient";
import * as empVehicleConstant from "@modules/v1/empVehicle/empVehicleConstant";
import { EmpVehicleDao } from "@modules/v1/empVehicle/EmpVehicleDao";

let customException = new CustomException();
let loginHistoryDao = new LoginHistoryDao();
let empVehicleDao = new EmpVehicleDao();
let redisClient = new RedisClient();

export let generateAdminToken = async function (params) {
	try {
		if (params.type === "CREATE_ADMIN" || params.type === "FORGOT_PASSWORD") {
			return await Jwt.sign(params.object, config.SERVER.JWT_CERT_KEY, { algorithm: config.SERVER.JWT_ALGO, expiresIn: "10m" }); // 10 min
		} else if (params.type === "ADMIN_LOGIN") {
			return await Jwt.sign(params.object, config.SERVER.JWT_CERT_KEY, { algorithm: config.SERVER.JWT_ALGO, expiresIn: "180d" }); // 180 days
		} else if (params.type === "SUPER_ADMIN_LOGIN") {
			return await Jwt.sign(params.object, config.SERVER.JWT_CERT_KEY, { algorithm: config.SERVER.JWT_ALGO, expiresIn: "180d" }); // 180 days
		}
	} catch (error) {
		throw customException.tokenGenerateException(error);
	}
};

export let generateUserToken = async function (params) {
	try {
		if (params.type === "USER_SIGNUP" || params.type === "USER_LOGIN") {
			return await Jwt.sign(params.object, params.salt, { algorithm: config.SERVER.JWT_ALGO, expiresIn: "180d" }); // 180 days
		} else if (params.type === "FORGOT_PASSWORD") {
			return await Jwt.sign(params.object, config.SERVER.JWT_CERT_KEY, { algorithm: config.SERVER.JWT_ALGO, expiresIn: "60m" }); // 10 min
		}
	} catch (error) {
		throw customException.tokenGenerateException(error);
	}
};

export let verifyToken = async function (params) {
	try {
		return await Jwt.verify(params.accessToken, config.SERVER.JWT_CERT_KEY, { algorithms: [config.SERVER.JWT_ALGO] });
	} catch (error) {
		throw customException.invalidTokenException(error);
	}
};

export let verifyUserToken = async function (params) {
	try {
		return await Jwt.verify(params.accessToken, params.salt, { algorithms: [config.SERVER.JWT_ALGO] });
	} catch (error) {
		throw customException.invalidTokenException(error);
	}
};

export let decodeToken = async function (params) {
	try {
		let jwtPayload = await Jwt.decode(params.accessToken, { complete: true });
		if (!jwtPayload) {
			throw customException.invalidTokenException("");
		} else {
			return jwtPayload;
		}
	} catch (error) {
		throw customException.invalidTokenException("Invalid token");
	}
};

export let refreshTokenOfAdmin = async function (params) {
	try {
		return await jwtRefresh.refresh(params, "180d", config.SERVER.JWT_CERT_KEY);
	} catch (error) {
		throw customException.invalidTokenException(error);
	}
};

export let refreshTokenOfUser = async function (params) {
	try {
		return await jwtRefresh.refresh(params.object, "180d", params.salt);
	} catch (error) {
		throw customException.invalidTokenException(error);
	}
};

export let verifyUserSocketToken = async function (socket, accessToken) {
	try {
		let jwtPayload = await decodeToken({ accessToken });
		if (!config.SERVER.IS_REDIS_ENABLE) { // IS_REDIS_ENABLE: false
			let userData = await empVehicleDao.findUserById(jwtPayload.payload);
			if (!userData) {
				socket.emit(config.CONSTANT.SOCKET.EVENT.SOCKET_ERROR, config.CONSTANT.MESSAGES.ERROR.USER_NOT_FOUND);
			} else {
				let step1 = await loginHistoryDao.findDeviceById(jwtPayload.payload);
				if (!step1) {
					socket.emit(config.CONSTANT.SOCKET.EVENT.SOCKET_ERROR, empVehicleConstant.MESSAGES.ERROR.SESSION_EXPIRED);
				} else {
					let tokenData = await verifyUserToken({ "accessToken": accessToken, "salt": step1.salt });
					if (tokenData.accountLevel !== config.CONSTANT.ACCOUNT_LEVEL.NORMAL_USER) {
						socket.emit(config.CONSTANT.SOCKET.EVENT.SOCKET_ERROR, config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
					} else {
						if (userData.status === config.CONSTANT.STATUS.BLOCKED) {
							socket.emit(config.CONSTANT.SOCKET.EVENT.SOCKET_ERROR, config.CONSTANT.MESSAGES.ERROR.BLOCKED);
						} else if (userData.status === config.CONSTANT.STATUS.DELETED) {
							socket.emit(config.CONSTANT.SOCKET.EVENT.SOCKET_ERROR, config.CONSTANT.MESSAGES.ERROR.USER_NOT_FOUND);
						} else {
							return tokenData;
						}
					}
				}
			}
		} else { // IS_REDIS_ENABLE: true
			let step1 = await redisClient.getList(jwtPayload.payload.userId + "." + jwtPayload.payload.deviceId);
			let step2 = await loginHistoryDao.findDeviceById(jwtPayload.payload);
			if (step1.length === 0) { // if data not found in redis then check the data in db
				let userData = await empVehicleDao.findUserById(jwtPayload.payload);
				if (!userData) {
					socket.emit(config.CONSTANT.SOCKET.EVENT.SOCKET_ERROR, config.CONSTANT.MESSAGES.ERROR.USER_NOT_FOUND);
				} else if (!step2) {
					socket.emit(config.CONSTANT.SOCKET.EVENT.SOCKET_ERROR, empVehicleConstant.MESSAGES.ERROR.SESSION_EXPIRED);
				}
			}
			// let step2 = await loginHistoryDao.findDeviceById(jwtPayload.payload);
			// if (!step2 || step1.length === 0) {
			if (!step2) {
				socket.emit(config.CONSTANT.SOCKET.EVENT.SOCKET_ERROR, empVehicleConstant.MESSAGES.ERROR.SESSION_EXPIRED);
			} else {
				// let tokenData = await verifyUserToken({ "accessToken": accessToken, "salt": JSON.parse(step1[0]).salt });
				let tokenData = await verifyUserToken({ "accessToken": accessToken, "salt": step2.salt });
				if (tokenData.accountLevel !== config.CONSTANT.ACCOUNT_LEVEL.NORMAL_USER) {
					socket.emit(config.CONSTANT.SOCKET.EVENT.SOCKET_ERROR, config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
				} else {
					let isBlocked, isDeleted = false;
					let blockedUserSet = await redisClient.getSet("blocked_set");
					let deletedUserSet = await redisClient.getSet("deleted_set");
					isBlocked = (blockedUserSet.indexOf(tokenData.userId) === -1) ? false : true;
					isDeleted = (deletedUserSet.indexOf(tokenData.userId) === -1) ? false : true;
					if (isBlocked) {
						socket.emit(config.CONSTANT.SOCKET.EVENT.SOCKET_ERROR, config.CONSTANT.MESSAGES.ERROR.BLOCKED);
					} else if (isDeleted) {
						socket.emit(config.CONSTANT.SOCKET.EVENT.SOCKET_ERROR, config.CONSTANT.MESSAGES.ERROR.USER_NOT_FOUND);
					} else if (!isBlocked || !isDeleted) { // if data not found in redis then check the data in db
						let userData = await empVehicleDao.findUserById(jwtPayload.payload);
						if (userData.status === config.CONSTANT.STATUS.BLOCKED) {
							socket.emit(config.CONSTANT.SOCKET.EVENT.SOCKET_ERROR, config.CONSTANT.MESSAGES.ERROR.BLOCKED);
						} else if (userData.status === config.CONSTANT.STATUS.DELETED) {
							socket.emit(config.CONSTANT.SOCKET.EVENT.SOCKET_ERROR, config.CONSTANT.MESSAGES.ERROR.USER_NOT_FOUND);
						} else {
							return tokenData;
						}
					} else {
						return tokenData;
					}
				}
			}
		}
	} catch (error) {
		throw error;
	}
};