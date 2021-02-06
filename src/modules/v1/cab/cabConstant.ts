"use strict";

import * as config from "@config/index";

export const MESSAGES = {
	ERROR: {
		EMAIL_ALREADY_EXIST: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "User with this email is already registered.",
			"type": "EMAIL_ALREADY_EXIST"
		},
		CAB_ASSIGN_IN_TRIP: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Cab assigned in route trip. you can't delete this cab .",
			"type": "CAB_ASSIGN_IN_TRIP"
		},
		CAB_ASSIGN_IN_ROUTE_TRIP: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Cab assigned in route trip. you can't block this cab .",
			"type": "CAB_ASSIGN_IN_TRIP"
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
		DRIVER_ASSIGNED: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Driver already assigned with cab.",
			"type": "DRIVER_ASSIGNED"
		},
		DRIVER_ASSIGNED_IN_SHIFT: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Driver already assigned with cab for this shift.",
			"type": "DRIVER_ASSIGNED"
		},
		INVALID_DATA: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Required fields can't be blank.",
			"type": "INVALID_DATA"
		},
		INVALID_VENDOR_BADGE: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Please enter valid vendorBadgeNo.",
			"type": "INVALID_VENDOR_BADGE"
		},
		DRIVER_UPDATE_ERROR: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "No driver already exists to be replaced.",
			"type": "DRIVER_UPDATE_ERROR"
		},
		REGISTRATION_NO_EXIST: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Registration no should be unique.",
			"type": "REGISTRATION_NO_EXIST"
		},
		BADGE_NO_EXIST: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Badge no should be unique.",
			"type": "BADGE_NO_EXIST"
		},
		DUPLICATE_DATA: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "File contains either duplicate cabBadgeNo or duplicate registrationNO.",
			"type": "DUPLICATE_DATA"
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
		CAB_REGISTERED: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Cab has been created successfully.",
			"type": "CAB_ADDED"
		},
		CAB_UPDATE: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Cab has been update successfully.",
			"type": "CAB_UPDATE"
		},
		BLOCK_CAB: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Cab account successfully blocked.",
			"type": "BLOCK_CAB"
		},
		DRIVER_ASSIGN: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Driver assign with cab successfully.",
			"type": "DRIVER_ASSIGN"
		},
		DRIVER_UNASSIGN: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Driver un assign from cab successfully.",
			"type": "DRIVER_UNASSIGN"
		},
		DRIVER_UPDATE: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Driver changed for the cab successfully.",
			"type": "DRIVER_UPDATE"
		},
		UNBLOCK_CAB: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Cab account successfully Unblocked.",
			"type": "UNBLOCK_CAB"
		},
		DELETE_CAB: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "CAb deleted successfully.",
			"type": "DELETE_CAB"
		},
		IS_REGISTRATION_NO: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "This registration number is valid.",
			"type": "IS_REGISTRATION_NO"
		},
		IS_BADGE_NO: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "This badge number is valid.",
			"type": "IS_BADGE_NO"
		},
		CAB_DETAILS: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Cab details get successfully.",
				"type": "CAB_DETAILS",
				"data": data
			};
		},
		COMPANY_SHIFT: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Company shift get successfully.",
				"type": "COMPANY_SHIFT",
				"data": data
			};
		},
		CAB_LIST: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Cab list get successfully.",
				"type": "CAB_LIST",
				"data": data
			};
		},
		IMPORT_CAB: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Cab imported successfully.",
			"type": "IMPORT_CAB"
		},
	}
};