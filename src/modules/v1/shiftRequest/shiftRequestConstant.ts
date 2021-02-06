"use strict";

import * as config from "@config/index";

export const MESSAGES = {
	ERROR: {
		REQUEST_EXIST: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Request range must be greater than previous request for that employee.",
			"type": "REQUEST_EXIST"
		},
		MAX_GROUP_RADIUS_EXCEEDS: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Shift request can't be generate for employees whose location exceeds the max group radius.",
			"type": "MAX_GROUP_RADIUS_EXCEEDS"
		},
		MULTIPLE_REQUEST: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "MUltiple requests with same range not allowed for a employee.",
			"type": "MULTIPLE_REQUEST"
		},
		INVALID_REQUEST_DATA: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Required fields can't be blank.",
			"type": "INVALID_REQUEST_DATA"
		},
		EMPLOYEE_NOT_FOUND: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "One or more employee ids does'nt exist or One or more employee's address not approved",
			"type": "EMPLOYEE_NOT_FOUND"
		},
		SHIFT_NOT_FOUND: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "One or more shift names does'nt exist!",
			"type": "SHIFT_NOT_FOUND"
		},
		INVALID_START_DATE: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			// startDate -- validation satyam
			"message": "Request can only be created atleast 1  day before shift change.",
			"type": "INVALID_START_DATE"
		},
		// SOS_CANCEL: {
		// 	"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
		// 	"message": "Unable to cancel",
		// 	"type": "SOS_CANCELED"
		// },
		// SOS_MARK_SAFE: {
		// 	"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
		// 	"message": "Unable to mark i'm safe.",
		// 	"type": "MARK_SAFE"
		// },
		// SEARCH_KEY_LENGTH: {
		// 	"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
		// 	"message": "Please enter more than three character.",
		// 	"type": "SEARCH_NAME"
		// },
		// SOS_PENDING: {
		// 	"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
		// 	"message": "Sos pending.",
		// 	"type": "PENDING"
		// },
	},
	SUCCESS: {
		SHIFT_REQUEST: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Shift change request have been created successfully!",
			"type": "SHIFT_REQUEST"
		},
		IMPORT_SHIFT_REQUEST: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Shift change requests imported successfully.",
			"type": "IMPORT_SHIFT_REQUEST"
		},
		SHIFT_REQUEST_LIST: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Shift Request list fetched successfully.",
				"type": "SHIFT_REQUEST_LIST",
				"data": data
			};
		},
		UPDATED_GROUP_LIST: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Updated group list fetched successfully.",
				"type": "UPDATED_GROUP_LIST",
				"data": data
			};
		},
		ROSTER_UPDATE: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Rosters have been updated successfully!",
			"type": "ROSTER_UPDATE"
		},
		SHIFT_REQUEST_DELETE: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Shift request has been deleted successfully!",
			"type": "SHIFT_REQUEST_DELETE"
		},
	}
};