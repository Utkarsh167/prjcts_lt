"use strict";

import { adminNotificationController } from "@modules/v1/adminNotification/adminNotificationController";
import * as adminNotificationValidator from "@modules/v1/adminNotification/adminNotificationValidator";
import * as appUtils from "@utils/appUtils";
import * as commonValidator from "@utils/commonValidator";
import * as config from "@config/index";
import * as Hapi from "hapi";
import { ResponseHandler } from "@utils/ResponseHandler";

let responseHandler = new ResponseHandler();

export let adminNotificationRoute = [
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/admin-notification`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			request.payload.platform = request.payload.appPlatform;
			let payload: AddAdminNotificationRequest = request.payload;
			try {
				let result = await adminNotificationController.addNotification({ ...tokenData, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "admin-notification"],
			description: "Add Notification",
			notes: "Add and send bulk notification",
			auth: {
				strategies: ["AdminAuth"]
			},
			// payload: {
			// 	maxBytes: 1024 * 1024 * 100, // 100MB
			// 	output: "stream",
			// 	allow: "multipart/form-data", // important
			// 	parse: true
			// },
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: adminNotificationValidator.validateAddEditNotification,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					payloadType: "form",
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/admin-notification`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: ListingRequest = request.query;
			try {
				let result = await adminNotificationController.notificationList({ ...tokenData, ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "admin-notification"],
			description: "Notification List",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: adminNotificationValidator.validateNotificationList,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					payloadType: "form",
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "DELETE",
		path: `${config.SERVER.API_BASE_URL}/admin-notification/{notificationId}`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let params: NotificationId = request.params;
			try {
				let result = await adminNotificationController.deleteNotification({ ...tokenData, ...params });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "admin-notification"],
			description: "Notification Delete",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				params: commonValidator.validateNotificationId,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					payloadType: "form",
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/admin-notification/details`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let query: NotificationId = request.query;
			try {
				let result = await adminNotificationController.notificationDetails({ ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "admin-notification"],
			description: "Notification Details",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: commonValidator.validateNotificationId,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					payloadType: "form",
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "PUT",
		path: `${config.SERVER.API_BASE_URL}/admin-notification`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let params: NotificationId = request.params;
			request.payload.platform = request.payload.appPlatform;
			let payload: EditAdminNotificationRequest = request.payload;
			try {
				let result = await adminNotificationController.editNotification({ ...tokenData, ...params, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "admin-notification"],
			description: "Edit Notification",
			notes: "Edit and send bulk notification",
			auth: {
				strategies: ["AdminAuth"]
			},
			// payload: {
			// 	maxBytes: 1024 * 1024 * 100, // 100MB
			// 	output: "stream",
			// 	allow: "multipart/form-data", // important
			// 	parse: true
			// },
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				// params: commonValidator.validateNotificationId,
				payload: adminNotificationValidator.validateEditNotification,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					payloadType: "form",
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/admin-notification/send/{userId}`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let params: UserId = request.params;
			let payload: SendAdminNotificationRequest = request.payload;
			try {
				let result = await adminNotificationController.sendOneToOneNotification({ ...tokenData, ...params, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "admin-notification"],
			description: "Add Notification",
			notes: "Add and send one to one notification",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				params: commonValidator.validateUserId,
				payload: adminNotificationValidator.validateSendOneToOneNotification,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					payloadType: "form",
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/admin-notification/resend/{notificationId}`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let params: NotificationId = request.params;
			try {
				let result = await adminNotificationController.sendBulkNotification({ ...tokenData, ...params });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "admin-notification"],
			description: "Send Notification",
			notes: "Send bulk notification",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				params: commonValidator.validateNotificationId,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					payloadType: "form",
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	}
];