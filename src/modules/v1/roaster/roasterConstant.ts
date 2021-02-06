"use strict";

import * as config from "@config/index";

export const MESSAGES = {
	ERROR: {
		CAB_NOT_ASSIGN: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "No any cab assign yet.",
			"type": "CAB_NOT_ASSIGN"
		},
		CAB_OR_ROUTE_ALREADY_ASSIGN: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Cab or route already created roasters.",
			"type": "CAB_OR_ROUTE_ALREADY_ASSIGN"
		},
		ROSTER_NOT_FOUND: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Roster not found.",
			"type": "ROSTER_NOT_FOUND"
		}
	},
	SUCCESS: {
		REGISTERED: () => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.CREATED,
				"message": "Vendor has been created successfully.",
				"type": "VENDOR_REGISTERED",
			};
		},
		ROASTER_REGISTERED: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Roaster has been created successfully.",
			"type": "ROASTER_ADDED"
		},
		ROASTER_UPDATE: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Roaster has been update successfully.",
			"type": "ROASTER_UPDATE"
		},
		RATING_UPDATE: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Thank's for the feedbak.",
			"type": "RATING_UPDATE"
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
		ROASTER_LIST: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Roster list get successfully.",
				"type": "ROASTER_LIST",
				"data": data
			};
		},
		ROASTER_DRIVER_LIST: (data, isNextPage) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Roster list get successfully.",
				"type": "ROASTER_LIST",
				"data": data, isNextPage
			};
		},
		ROASTER_EMP_LIST: (data, isNextPage) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Roster list get successfully.",
				"type": "ROASTER_LIST",
				"data": data, isNextPage
			};
		},
		ADD_NOTIFICATION: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Notification added successfully.",
			"type": "ADD_NOTIFICATION"
		},
	}
};