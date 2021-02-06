"use strict";

import { adminController } from "@modules/v1/admin/adminController";
import * as adminValidator from "@modules/v1/admin/adminValidator";
import * as appUtils from "@utils/appUtils";
import * as commonValidator from "@utils/commonValidator";
import * as config from "@config/index";
import * as Hapi from "hapi";
import { ResponseHandler } from "@utils/ResponseHandler";

let responseHandler = new ResponseHandler();

export let adminRoute = [

	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/admin/forgot-password`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let payload: ForgotPasswordRequest = request.payload;
			try {
				let result = await adminController.forgotPassword({ ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "admin"],
			description: "Forgot Password",
			// notes: "",
			auth: {
				strategies: ["BasicAuth"]
			},
			validate: {
				headers: commonValidator.platformHeaderObj["required"],
				payload: adminValidator.validateForgotPassword,
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
		path: `${config.SERVER.API_BASE_URL}/admin/change-password`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: ChangePasswordRequest = request.payload;
			try {
				let result = await adminController.changePassword({ ...tokenData, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "admin"],
			description: "Change Password",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: adminValidator.validateChangePassword,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
];