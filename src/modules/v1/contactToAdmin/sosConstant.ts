"use strict";

import * as config from "@config/index";

export const MESSAGES = {
	ERROR: {
		SOS_CANCEL: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Unable to cancel",
			"type": "SOS_CANCELED"
		},
		SOS_MARK_SAFE: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Unable to mark i'm safe.",
			"type": "MARK_SAFE"
		},
		SEARCH_KEY_LENGTH: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Please enter more than three character.",
			"type": "SEARCH_NAME"
		},
		SOS_PENDING: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Sos pending.",
			"type": "PENDING"
		},
	},
	SUCCESS: {
		REGISTERED: () => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.CREATED,
				"message": "Vendor has been created successfully.",
				"type": "VENDOR_REGISTERED",
			};
		},
		CONTACT_ADMIN: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Your query has been send to admin.",
			"type": "CONTACT_ADMIN"
		},
		SOS_RESOLVE: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Sos resolve successfully.",
			"type": "SOS_RESOLVE"
		},
		SOS_CANCEL: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Sos canceled successfully.",
			"type": "SOS_CANCELED"
		},
		SOS_MARK_SAFE: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Mark safe successfully.",
			"type": "MARK_SAFE"
		},
		SOS_RESOLVED: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Sos resolved by the admin.",
			"type": "SOS_RESOLVE"
		},
		SOS_LIST: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "SOS list get successfully.",
				"type": "SOS_LIST",
				"data": data
			};
		},
	}
};