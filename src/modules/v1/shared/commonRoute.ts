"use strict";

import { adminController } from "@modules/v1/admin/adminController";
import * as appUtils from "@utils/appUtils";
import * as commonValidator from "@utils/commonValidator";
import * as config from "@config/index";
import { LoginHistoryDao } from "@modules/v1/loginHistory/LoginHistoryDao";
import { ResponseHandler } from "@utils/ResponseHandler";
import { userController } from "@modules/v1/user/userController";
import { roasterController } from "@modules/v1/roaster/roasterController";
import * as tokenManager from "@lib/tokenManager";
// import * as smsManager from "@lib/smsManager";

let loginHistoryDao = new LoginHistoryDao();
let responseHandler = new ResponseHandler();

export let commonRoute = [
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/common/change-forgot-password`,
		handler: async (request, h) => {
			let query: Device = request.query;
			let payload: ChangeForgotPasswordRequest = request.payload;
			try {
				let tokenData = await tokenManager.verifyToken({ ...query });
				let result;
				if (tokenData.accountLevel === config.CONSTANT.ACCOUNT_LEVEL.ADMIN) {
					result = await adminController.changeForgotPassword({ ...tokenData, ...payload });
				} else if (tokenData.accountLevel === config.CONSTANT.ACCOUNT_LEVEL.SUPER) {
					result = await adminController.changeForgotPassword({ ...tokenData, ...payload });
				} else {
					result = await userController.changeForgotPassword({ ...tokenData, ...payload });
				}
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "common"],
			description: "Change Forgot Password",
			notes: "Change forgot password API for (admin/user)",
			auth: {
				strategies: ["BasicAuth"]
			},
			validate: {
				headers: commonValidator.platformHeaderObj["required"],
				query: commonValidator.validateAccessToken,
				payload: commonValidator.validateChangeForgotPassword,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					// payloadType: 'form',
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/common/verify-token`,
		handler: async (request, h) => {
			let query: Device = request.query;
			try {
				let jwtPayload = await tokenManager.decodeToken({ ...query });
				let result;
				if (jwtPayload.payload.accountLevel === config.CONSTANT.ACCOUNT_LEVEL.ADMIN) {
					result = await tokenManager.verifyToken({ ...query });
				} else {
					let step1 = await loginHistoryDao.findDeviceById({ ...jwtPayload.payload });
					result = await tokenManager.verifyUserToken({ "accessToken": query.accessToken, "salt": step1 ? step1.salt : config.SERVER.JWT_CERT_KEY });
				}
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				error.output.statusCode = 421; // modify error object
				error.output.payload.statusCode = 421; // modify error object
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "common"],
			description: "Verify Token",
			notes: "Verify token i.e., generated at the time of forgot-password API for (admin/user)",
			auth: {
				strategies: ["BasicAuth"]
			},
			validate: {
				headers: commonValidator.platformHeaderObj["required"],
				query: commonValidator.validateAccessToken,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					// payloadType: 'form',
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},

	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/common/refresh-token`,
		handler: async (request, h) => {
			let tokenData = request.auth.credentials.tokenData;
			let query: Device = request.query;
			try {
				let result;
				if (tokenData.payload.accountLevel === config.CONSTANT.ACCOUNT_LEVEL.ADMIN) {
					result = await adminController.refreshToken({ ...tokenData.payload });
				} else {
					result = await userController.refreshToken({ ...tokenData.payload, ...{ "refreshToken": query.refreshToken } });
				}
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "common"],
			description: "Refresh Token",
			notes: "Refresh token (admin/user)",
			auth: {
				strategies: ["RefreshToken"]
			},
			validate: {
				headers: commonValidator.commonAuthorizationHeaderObj,
				query: commonValidator.validateRefreshToken,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					// payloadType: 'form',
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},

	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/common/registeredAdmin`,
		handler: async (request, h) => {
			// let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: CreateCompanyRequest = request.payload;
			try {
				// console.log("-------------------route" + JSON.stringify(payload));
				let result = await adminController.addCompany({ ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "common"],
			description: "Add Company",
			// notes: "",
			auth: {
				strategies: ["BasicAuth"]
			},
			validate: {
				// headers: commonValidator.platformHeaderObj["optional"],
				payload: commonValidator.validateAddCompany,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					// payloadType: 'form',
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
];