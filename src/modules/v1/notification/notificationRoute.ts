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
				strategies: ["SuperAdminAuth"]
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
	}
];