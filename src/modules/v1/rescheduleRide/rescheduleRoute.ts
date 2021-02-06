"use strict";

import * as appUtils from "@utils/appUtils";
import * as commonValidator from "@utils/commonValidator";
import * as config from "@config/index";
import * as Hapi from "hapi";
import { ResponseHandler } from "@utils/ResponseHandler";
import { rescheduleController } from "@modules/v1/rescheduleRide/rescheduleController";
import * as rescheduleValidator from "@modules/v1/rescheduleRide/rescheduleValidator";
import * as tokenManager from "@lib/tokenManager";

let responseHandler = new ResponseHandler();

export let rescheduleRoute = [
	// User can reschedule trip before 8 hours
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/tripReschedule`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: RescheduleRequest = request.payload;
			try {
				let result = await rescheduleController.rescheduleTrip({ ...tokenData, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "reschedule"],
			description: "Reschedule trip by employee",
			// notes: "",
			auth: {
				strategies: ["UserAuth"]
			},
			validate: {
				headers: commonValidator.userAuthorizationHeaderObj,
				payload: rescheduleValidator.validateReschedule,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},

	// User can cancel future trip
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/tripCancel`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: RescheduleRequest = request.payload;
			try {
				let result = await rescheduleController.cancelTrip({ ...tokenData, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "reschedule"],
			description: "Cancel trip by employee",
			// notes: "",
			auth: {
				strategies: ["UserAuth"]
			},
			validate: {
				headers: commonValidator.userAuthorizationHeaderObj,
				payload: rescheduleValidator.validateReschedule,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "PUT",
		// path: `${config.SERVER.API_BASE_URL}/tripReschedule/cancel/{rescheduleId}`,
		path: `${config.SERVER.API_BASE_URL}/tripReschedule/cancel`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: TripCancelRequest = request.payload;
			try {
				let result = await rescheduleController.rescheduleCancel({ ...tokenData, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "reschedule"],
			description: "Reschedule trip request cancel by the admin",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.userAuthorizationHeaderObj,
				payload: rescheduleValidator.rescheduleCancel,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},

	{
		method: "PUT",
		// path: `${config.SERVER.API_BASE_URL}/tripReschedule/accept/{rescheduleId}`,
		path: `${config.SERVER.API_BASE_URL}/tripReschedule/accept`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: TripAcceptRequest = request.payload;
			try {
				let result = await rescheduleController.rescheduleAccept({ ...tokenData, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "reschedule"],
			description: "Reschedule trip request cancel by the admin",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.userAuthorizationHeaderObj,
				payload: rescheduleValidator.rescheduleAccept,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},

	{
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/reschedule/list`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: ListingRequest = request.query;
			try {
				let result = await rescheduleController.rescheduleList({ ...tokenData, ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "reschedule"],
			description: "Reschedule List",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: rescheduleValidator.validateRescheduleList,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	/**
	 * Get data of user cancel trip
	 */
	{
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/cancelled/list`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: ListingRequest = request.query;
			try {
				let result = await rescheduleController.cancelledList({ ...tokenData, ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "reschedule"],
			description: "Cancelled List",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: rescheduleValidator.validateCancelledList,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/shiftList`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			// let payload: RescheduleRequest = request.payload;
			try {
				let result = await rescheduleController.shiftList({ ...tokenData });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "reschedule"],
			description: "Cancel trip by employee",
			// notes: "",
			auth: {
				strategies: ["UserAuth"]
			},
			validate: {
				headers: commonValidator.userAuthorizationHeaderObj,
				// payload: rescheduleValidator.validateReschedule,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},

	/* Get list of No Show - Shivakumar A*/
	{
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/noshow/list`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: ListingRequest = request.query;
			try {
				let result = await rescheduleController.noshowList({ ...tokenData, ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "reschedule"],
			description: "No Show List",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: rescheduleValidator.validateCancelledList,
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