"use strict";

import * as config from "@config/index";

export const MESSAGES = {
	ERROR: {

		SEARCH_KEY_LENGTH: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Please enter more than three character.",
			"type": "SEARCH_NAME"
		},
		INVALID_CAB_DATA: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "CabId and DriverId can't be blank.",
			"type": "INVALID_CAB_DATA"
		},
		REQUEST_EXCEED: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Your monthaly request has been exceeded.",
			"type": "REQUEST_EXCEED"
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
		TRIP_CANCEL: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Your trip has been cancelled successfully.",
			"type": "TRIP_CANCEL"
		},
		TRIP_ACCEPT: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Reschedule trip accepted.",
			"type": "TRIP_ACCEPT"
		},
		RESCHEDULE_CANCEL: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Reschedule canceled successfully.",
			"type": "RESCHEDULE_CANCEL"
		},

		RESCHEDULE_LIST: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Reschedule list get successfully.",
				"type": "RESCHEDULE_LIST",
				"data": data
			};
		},
		CANCELLED_LIST: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Cancelled list get successfully.",
				"type": "CANCELLED_LIST",
				"data": data
			};
		},
        // No Show List Success object = Shivakumar A
		NOSHOW_LIST: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "No Show list get successfully.",
				"type": "NOSHOW_LIST",
				"data": data
			};
		},
		SHIFT_LIST: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Shift list get successfully.",
				"type": "SHIFT_LIST",
				"data": data
			};
		},
	}
};