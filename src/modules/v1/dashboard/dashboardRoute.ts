"use strict";

import { dashboardController } from "@modules/v1/dashboard/dashboardController";
import * as dashboardValidator from "@modules/v1/dashboard/dashboardValidator";
import * as appUtils from "@utils/appUtils";
import * as commonValidator from "@utils/commonValidator";
import * as config from "@config/index";
import * as Hapi from "hapi";
import { ResponseHandler } from "@utils/ResponseHandler";

let responseHandler = new ResponseHandler();

export let dashboardRoute = [
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/dashboard/scope`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: ScopeRequest = request.payload;
			try {
				let result = await dashboardController.scopeParqueryApiCall({ ...tokenData, ...payload }, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "dashboard"],
			description: "get scope data for front end",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				// payload: dashboardValidator.validateAddAdmin,
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
		path: `${config.SERVER.API_BASE_URL}/dashboard/timeTrackSnapshot`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: SnapshotRequest = request.payload;
			try {
				let result = await dashboardController.timeTrackSnapshotApiCall({ ...tokenData, ...payload }, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "dashboard"],
			description: "Retrieves snapshot of the system",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				// payload: dashboardValidator.validateAddAdmin,
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
		path: `${config.SERVER.API_BASE_URL}/dashboard/timeTrackSnapshotAndroid`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			// let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: SnapshotRequest = request.payload;
			try {
				let result = await dashboardController.timeTrackSnapshotApiCall({ ...payload }, {});
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "dashboard"],
			description: "Retrieves snapshot of the system",
			// notes: "",
			// auth: {
			// strategies: ["AdminAuth"]
			// },
			validate: {
				// headers: commonValidator.adminAuthorizationHeaderObj,
				// payload: dashboardValidator.validateAddAdmin,
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
		path: `${config.SERVER.API_BASE_URL}/dashboard/planImage`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: PlanImageRequest = request.payload;
			try {
				let result = await dashboardController.planImageParqueryApiCall({ ...tokenData, ...payload }, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "dashboard"],
			description: "Test api",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				// payload: dashboardValidator.validateAddAdmin,
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
		path: `${config.SERVER.API_BASE_URL}/dashboard/historialRange`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: HistoricalAgregateRequest = request.payload;
			try {
				let result = await dashboardController.historicalRangeApiCall({ ...tokenData, ...payload }, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "dashboard"],
			description: "provides range of the available aggregated historical data.",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				// payload: dashboardValidator.validateAddAdmin,
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
		path: `${config.SERVER.API_BASE_URL}/dashboard/historicalAggregate`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: HistoricalAgregateRequest = request.payload;
			try {
				let result = await dashboardController.historicalAggregateApiCall({ ...tokenData, ...payload }, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "dashboard"],
			description: "retrieves the historical data entries",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				// payload: dashboardValidator.validateAddAdmin,
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
		path: `${config.SERVER.API_BASE_URL}/dashboard/timeTrackRange`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: HistoricalAgregateRequest = request.payload;
			try {
				let result = await dashboardController.timeTrackRangeApiCall({ ...tokenData, ...payload }, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "dashboard"],
			description: "Serves the range encompassing all of the available time track data.",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				// payload: dashboardValidator.validateAddAdmin,
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
		path: `${config.SERVER.API_BASE_URL}/dashboard/timeTrackOccupiers`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: TimeTrackOccupiersRequest = request.payload;
			try {
				let result = await dashboardController.timeTrackOccupiersApiCall({ ...tokenData, ...payload }, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "dashboard"],
			description: "Contains the IDs of the cameras as comma-separated list to be considered.",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				// payload: dashboardValidator.validateAddAdmin,
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
		path: `${config.SERVER.API_BASE_URL}/dashboard/timeTrackVacants`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: TimeTrackOccupiersRequest = request.payload;
			try {
				let result = await dashboardController.timeTrackVacantsApiCall({ ...tokenData, ...payload }, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "dashboard"],
			description: "Gives the latest number of vacant spots registered by the system.",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				// payload: dashboardValidator.validateAddAdmin,
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
		path: `${config.SERVER.API_BASE_URL}/dashboard/timeTrackVideoFromForm`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			//  let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: TimeTrackVideoFromFormRequest = request.payload;
			try {
				let result = await dashboardController.timeTrackVideoFromFormApiCall(payload);
				const response = h.response(result);
				response.type(result.headers['content-type']);
				response.header('content-disposition', result.headers['content-disposition']);
				return response;
				return responseHandler.sendSuccess(h, result.headers);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "dashboard"],
			description: "Gives the latest number of vacant spots registered by the system.",
			// notes: "",
			// auth: {
			// 	strategies: ["AdminAuth"]
			// },
			validate: {
				// headers: commonValidator.adminAuthorizationHeaderObj,
				// payload: dashboardValidator.validateAddAdmin,
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
		path: `${config.SERVER.API_BASE_URL}/dashboard/cardData`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			// let query: ListingRequest = request.query;
			try {
				let result = await dashboardController.cardData({ ...tokenData});
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "user"],
			description: "card data for dashboard",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				// headers: commonValidator.adminAuthorizationHeaderObj,
				// query: empVehicleValidator.validateEmployeeListing,
				// failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
];
