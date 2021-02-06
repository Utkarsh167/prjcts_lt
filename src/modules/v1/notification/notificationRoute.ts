"use strict";

import * as appUtils from "@utils/appUtils";
import * as commonValidator from "@utils/commonValidator";
import * as config from "@config/index";
import * as Hapi from "hapi";
import { notificationController } from "@modules/v1/notification/notificationController";
import * as notificationValidator from "@modules/v1/notification/notificationValidator";
import { ResponseHandler } from "@utils/ResponseHandler";

let responseHandler = new ResponseHandler();

export let notificationRoute = [
	{
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/notification`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: ListingRequest = request.query;
			try {
				let result = await notificationController.notificationList({ ...tokenData, ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "notification"],
			description: "Notification List",
			// notes: "",
			auth: {
				strategies: ["UserAuth"]
			},
			validate: {
				headers: commonValidator.userAuthorizationHeaderObj,
				query: notificationValidator.validateNotificationList,
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
		path: `${config.SERVER.API_BASE_URL}/webNotification`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: ListingRequest = request.query;
			try {
				let result = await notificationController.webNotificationList({ ...tokenData, ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "notification"],
			description: "Notification List",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.userAuthorizationHeaderObj,
				query: notificationValidator.validateNotificationList,
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
	// {
	// 	method: "POST",
	// 	path: `${config.SERVER.API_BASE_URL}/yakoVoiceCall`,
	// 	handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
	// 		let tokenData: TokenData = request.auth.credentials.tokenData;
	// 		let payload: VoiceCallRequest = request.payload;
	// 		try {
	// 			let result = await notificationController.voiceCalling({ ...tokenData, ...payload });
	// 			return responseHandler.sendSuccess(h, result);
	// 		} catch (error) {
	// 			return responseHandler.sendError(error);
	// 		}
	// 	},
	// 	config: {
	// 		tags: ["api", "notification"],
	// 		description: "Voice calling",
	// 		notes: "Voice calling number masking.",
	// 		auth: {
	// 			strategies: ["UserAuth"]
	// 		},
	// 		validate: {
	// 			headers: commonValidator.userAuthorizationHeaderObj,
	// 			payload: notificationValidator.validateVoiceCall,
	// 			failAction: appUtils.failActionFunction
	// 		},
	// 		plugins: {
	// 			"hapi-swagger": {
	// 				responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
	// 			}
	// 		}
	// 	}
	// },
];