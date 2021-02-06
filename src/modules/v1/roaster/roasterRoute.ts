"use strict";

import * as appUtils from "@utils/appUtils";
import * as commonValidator from "@utils/commonValidator";
import * as config from "@config/index";
import * as Hapi from "hapi";
import { ResponseHandler } from "@utils/ResponseHandler";
import { roasterController } from "@modules/v1/roaster/roasterController";
import * as roasterValidator from "@modules/v1/roaster/roasterValidator";
import * as tokenManager from "@lib/tokenManager";

let responseHandler = new ResponseHandler();

export let roasterRoute = [
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/roster`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: RoasterAddRequest = request.payload;
			try {
				let result = await roasterController.roasterAdd({ ...tokenData, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "roster"],
			description: "Roster add",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: roasterValidator.validateRoasterAdd,
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
		path: `${config.SERVER.API_BASE_URL}/rosterContinue`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: RoasterContinueRequest = request.payload;
			try {
				let result = await roasterController.rosterContinue({ ...tokenData, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "roster"],
			description: "Roster add",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: roasterValidator.validateRoasterContinue,
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
	/**
	 * Update route info
	 */
	{
		method: "PUT",
		path: `${config.SERVER.API_BASE_URL}/roster`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: RoasterUpdateRequest = request.payload;
			try {
				let result = await roasterController.roasterUpdate({ ...tokenData, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "roster"],
			description: "Roster update",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: roasterValidator.validateRoasterUpdate,
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
		method: "PUT",
		path: `${config.SERVER.API_BASE_URL}/roster/empRating`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: RoasterUpdateRequest = request.payload;
			try {
				let result = await roasterController.userRatingUpdate({ ...tokenData, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "roster"],
			description: "Roster update",
			// notes: "",
			auth: {
				strategies: ["UserAuth"]
			},
			validate: {
				headers: commonValidator.userAuthorizationHeaderObj,
				payload: roasterValidator.validateRoasterRating,
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
		path: `${config.SERVER.API_BASE_URL}/roster/driver`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			try {
				let result = await roasterController.rosterDriver({ ...tokenData });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "roster"],
			description: "Roster List",
			// notes: "",
			auth: {
				strategies: ["UserAuth"]
			},
			validate: {
				headers: commonValidator.userAuthorizationHeaderObj,
				// query: roasterValidator.validateTripType,
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
		path: `${config.SERVER.API_BASE_URL}/roster/emp`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			// let query: ListingRequest = request.query;
			try {
				let result = await roasterController.rosterEmp({ ...tokenData });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "roster"],
			description: "Roster List",
			// notes: "",
			auth: {
				strategies: ["UserAuth"]
			},
			validate: {
				headers: commonValidator.userAuthorizationHeaderObj,
				// query: roasterValidator.validateRoasterList,
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
		path: `${config.SERVER.API_BASE_URL}/rosterList/emp`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: ListingRequest = request.query;
			try {
				let result = await roasterController.rosterListEmp({ ...tokenData, ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "roster"],
			description: "Roster List",
			// notes: "",
			auth: {
				strategies: ["UserAuth"]
			},
			validate: {
				headers: commonValidator.userAuthorizationHeaderObj,
				query: roasterValidator.validateRoasterEmpList,
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
		path: `${config.SERVER.API_BASE_URL}/rosterList/reschedule`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: ListingRequest = request.query;
			try {
				let result = await roasterController.rosterListReschedule({ ...tokenData, ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "roster"],
			description: "Roster List",
			// notes: "",
			auth: {
				strategies: ["UserAuth"]
			},
			validate: {
				headers: commonValidator.userAuthorizationHeaderObj,
				query: roasterValidator.validateRoasterReschedule,
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
		path: `${config.SERVER.API_BASE_URL}/rosterList/driver`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: ListingRequest = request.query;
			try {
				let result = await roasterController.rosterListDriver({ ...tokenData, ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "roster"],
			description: "Roster List",
			// notes: "",
			auth: {
				strategies: ["UserAuth"]
			},
			validate: {
				headers: commonValidator.userAuthorizationHeaderObj,
				query: roasterValidator.validateRoasterList,
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
		path: `${config.SERVER.API_BASE_URL}/rosterList/admin`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: ListingRequest = request.query;
			try {
				let result = await roasterController.rosterAdmin({ ...tokenData, ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "roster"],
			description: "Roster List",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: roasterValidator.validateAdminRosterList,
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
		path: `${config.SERVER.API_BASE_URL}/roster/tripCancel`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: RoasterTripCancelRequest = request.payload;
			try {
				let result = await roasterController.tripCancelByEmp({ ...tokenData, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "roster"],
			description: "Trip cancel",
			// notes: "",
			auth: {
				strategies: ["UserAuth"]
			},
			validate: {
				headers: commonValidator.userAuthorizationHeaderObj,
				payload: roasterValidator.validateTripCancel,
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