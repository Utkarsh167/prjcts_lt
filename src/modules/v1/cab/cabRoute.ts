"use strict";

import * as appUtils from "@utils/appUtils";
import * as commonValidator from "@utils/commonValidator";
import * as config from "@config/index";
import * as Hapi from "hapi";
import { ResponseHandler } from "@utils/ResponseHandler";
import { cabController } from "@modules/v1/cab/cabController";
import * as cabValidator from "@modules/v1/cab/cabValidator";
import * as tokenManager from "@lib/tokenManager";

let responseHandler = new ResponseHandler();

export let cabRoute = [
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/cab`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: CabAddRequest = request.payload;
			try {
				let result = await cabController.cabAdd({ ...tokenData, ...payload }, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "cab"],
			description: "Cab add",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: cabValidator.validateCabAdd,
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
		path: `${config.SERVER.API_BASE_URL}/cab`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: CabUpdateRequest = request.payload;
			try {
				let result = await cabController.updateCab({ ...payload }, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "cab"],
			description: "Cab Update",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: cabValidator.validateCabUpdate,
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
		path: `${config.SERVER.API_BASE_URL}/cab/list`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: ListingRequest = request.query;
			try {
				let result = await cabController.cabList({ ...tokenData, ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "cab"],
			description: "Cab List",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: cabValidator.validateCabList,
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
		path: `${config.SERVER.API_BASE_URL}/cab/driverMapped`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: ListingRequest = request.query;
			try {
				let result = await cabController.driverMappedList({ ...tokenData, ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "cab"],
			description: "Cab driver mapped List",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: cabValidator.validateCabList,
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
		path: `${config.SERVER.API_BASE_URL}/cab/details`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let query: CabId = request.query;
			try {
				let result = await cabController.cabDetails({ ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "cab"],
			description: "Cab Details",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: commonValidator.validateCabId,
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
		// reasonForArchive -- satyam
		// method: "DELETE",
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/cab/{cabId}`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let params: DeleteRequest = request.params;
			// reasonForArchive -- satyam
			let payload: DeleteRequest = request.payload;
			try {
				let result = await cabController.deleteCab({ ...params, ...payload }, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "cab"],
			description: "Delete cab",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				params: commonValidator.validateCabId,
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
	 * Block cab
	 */
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/cab/block/{cabId}`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let params: CabId = request.params;
			let payload: BlockRequest = request.payload;
			try {
				let result = await cabController.blockUnblock({ ...params, ...payload }, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "cab"],
			description: "Block Cab",
			notes: "Block Unblock Cab",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				params: commonValidator.validateCabId,
				payload: commonValidator.validateStatus,
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
		path: `${config.SERVER.API_BASE_URL}/cab/driverMapping`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: CabDriverMappRequest = request.payload;
			try {
				let result = await cabController.driverMappingCab({ ...payload }, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "cab"],
			description: "Driver mapping",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: cabValidator.validateDriverAssign,
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
		path: `${config.SERVER.API_BASE_URL}/cab/companyShift`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			try {
				let result = await cabController.companyShift({ ...tokenData });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "cab"],
			description: "Company shift",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				// query: commonValidator.validateCabId,
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
		path: `${config.SERVER.API_BASE_URL}/cab/onlinelist`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			// let query: ListingRequest = request.query;
			try {
				let result = await cabController.cabOnlineList({ ...tokenData });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "cab"],
			description: "Cab List",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				// query: cabValidator.validateCabList,
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
		path: `${config.SERVER.API_BASE_URL}/cab/roasterList`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: ListingRequest = request.query;
			try {
				let result = await cabController.cabRoasterList({ ...tokenData, ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "cab"],
			description: "Cab Roaster List",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: cabValidator.validateCabRoasterList,
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
		path: `${config.SERVER.API_BASE_URL}/cab/roaster`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: ListingRequest = request.query;
			try {
				let result = await cabController.cabRoaster({ ...tokenData, ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "cab"],
			description: "Cab Roaster List",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: cabValidator.validateCabRoaster,
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
		path: `${config.SERVER.API_BASE_URL}/cab`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: CabListingRequest = request.query;
			try {
				let result = await cabController.cabListing({ ...tokenData, ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "cab"],
			description: "Cab List for filter",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: cabValidator.validateCabListing,
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
		path: `${config.SERVER.API_BASE_URL}/cab/drivers`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: CabDriverListingRequest = request.query;
			try {
				let result = await cabController.cabListingWihDriver({ ...tokenData, ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "cab"],
			description: "Cab List of mapped driver",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: cabValidator.validateCabDriverListing,
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
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/cab/bulkCab`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: CabAddRequest = request.payload;
			try {
				let result = await cabController.bulkCabSignup({ ...tokenData, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "cab"],
			description: "Bulk cab registerd via xls file",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			payload: {
				maxBytes: 1024 * 1024 * 100, // 100MB
				output: "stream",
				allow: "multipart/form-data", // important
				parse: true
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: cabValidator.validateBulkCabSignup,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					payloadType: 'form',
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/cab/isUniqueRegistarionNo`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: IsRegistrationNoUnique = request.query;
			try {
				let result = await cabController.isRegistrationNoUnique({ ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "cab"],
			description: "Check cab registration number unique",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: cabValidator.validateIsRegistrationNoUnique,
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
		path: `${config.SERVER.API_BASE_URL}/cab/isUniqueCabBadgeNo`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: IsCabBadgeNoUnique = request.query;
			try {
				let result = await cabController.isCabBadgeNoUnique({ ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "cab"],
			description: "Check cab badge number unique",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: cabValidator.validateIsCabBadgeNoUnique,
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