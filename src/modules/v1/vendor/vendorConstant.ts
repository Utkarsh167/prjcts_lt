"use strict";

import * as config from "@config/index";

export const MESSAGES = {
	ERROR: {
		EMAIL_ALREADY_EXIST: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "User with this email is already registered.",
			"type": "EMAIL_ALREADY_EXIST"
		},
		MOBILE_NO_ALREADY_EXIST: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "User with this mobile number is already registered.",
			"type": "MOBILE_NO_ALREADY_EXIST"
		},
		MOBILE_NO_NOT_REGISTERED: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Please register your mobile number.",
			"type": "MOBILE_NO_NOT_REGISTERED"
		},
		SEARCH_KEY_LENGTH: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Please enter more than three character.",
			"type": "SEARCH_NAME"
		},
		INVALID_DATA: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Required fields can't be blank.",
			"type": "INVALID_DATA"
		},
		CAB_EXIST: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "To block the vendor, first delete the assigned cabs.",
			"type": "CAB_EXIST"
		},
		CAB_EXIST1: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "To delete the vendor, first delete the assigned cabs.",
			"type": "CAB_EXIST1"
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
		VENDOR_REGISTERED: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Vendor has been created successfully.",
			"type": "SIGNUP_VENDOR"
		},
		VENDOR_UPDATE: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Vendor has been update successfully.",
			"type": "VENDOR_UPDATE"
		},
		BLOCK_VENDOR: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Vendor account successfully blocked.",
			"type": "BLOCK_VENDOR"
		},
		UNBLOCK_VENDOR: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Vendor account successfully Unblocked.",
			"type": "UNBLOCK_VENDOR"
		},
		DELETE_VENDOR: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Vndor deleted successfully.",
			"type": "DELETE_VENDOR"
		},
		IMPORT_VENDOR: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Vendors imported successfully.",
			"type": "IMPORT_VENDOR"
		},
		VENDOR_DETAILS: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Vendor details get successfully.",
				"type": "VENDOR_DETAILS",
				"data": data
			};
		},
		VENDOR_LIST: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Vendor list get successfully.",
				"type": "VENDOR_LIST",
				"data": data
			};
		},
	}
};