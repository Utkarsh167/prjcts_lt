"use strict";

import {bookingSlotController} from "@modules/v1/bookingSlot/bookingSlotController";
import * as commonValidator from "@utils/commonValidator";
import * as config from "@config/index";
import * as Hapi from "hapi";
import {ResponseHandler} from "@utils/ResponseHandler";
import * as appUtils from "@utils/appUtils";
import * as bookingSlotValidator from "@modules/v1/bookingSlot/bookingSlotValidator";

let responseHandler = new ResponseHandler();

export let bookingSlotRoute = [
    {
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/bookingSlot/book`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: BookingSlotRequest = request.payload;
			try {
				let result = await bookingSlotController.bookSlot({ ...payload, ...tokenData });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "admin"],
			description: "Book",
			// notes: "",
			auth: {
				strategies: ["UserAuth"]
			},
			validate: {
				headers: commonValidator.userAuthorizationHeaderObj,
				payload: commonValidator.validateBookingSlot,
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