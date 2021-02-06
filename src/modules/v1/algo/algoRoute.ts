"use strict";

import * as appUtils from "@utils/appUtils";
import * as commonValidator from "@utils/commonValidator";
import * as config from "@config/index";
import * as Hapi from "hapi";
import { ResponseHandler } from "@utils/ResponseHandler";
import { algoController } from "@modules/v1/algo/algoController";
import * as algoValidator from "@modules/v1/algo/algoValidator";
// import * as tokenManager from "@lib/tokenManager";

let responseHandler = new ResponseHandler();

export let algoRoute = [
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/algo`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let payload: AlgoDataRequest = request.payload;
			try {
				let result = await algoController.algo({ ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "algo"],
			description: "Algorithm for creating employees groups and routes with ETA",
			auth: {
				strategies: ["BasicAuth"]
			},
			validate: {
				headers: commonValidator.platformHeaderObj["optional"],
				payload: algoValidator.validateAlgoData,
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
		path: `${config.SERVER.API_BASE_URL}/routing`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let payload: RoutingDataRequest = request.payload;
			try {
				let result = await algoController.routing({ ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "algo"],
			description: "Algorithm for creating routes with ETA",
			auth: {
				strategies: ["BasicAuth"]
			},
			validate: {
				headers: commonValidator.platformHeaderObj["optional"],
				payload: algoValidator.validateRoutingData,
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
		path: `${config.SERVER.API_BASE_URL}/algoRegenerate`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let payload: AlgoRegenerateDataRequest = request.payload;
			try {
				let result = await algoController.algoRegenerate({ ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "algo"],
			description: "Algorithm for recreating employees groups and routes with ETA",
			auth: {
				strategies: ["BasicAuth"]
			},
			validate: {
				headers: commonValidator.platformHeaderObj["optional"],
				payload: algoValidator.validateAlgoRegenerateData,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	}
];