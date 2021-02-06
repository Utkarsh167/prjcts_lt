"use strict";

import * as config from "@config/index";

export const MESSAGES = {
	ERROR: {
		// Added EMPLOYEE_COUNT_EXCEEDED object - Shivakumar A
		EMPLOYEE_COUNT_EXCEEDED: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Employee count exceeded max group size.",
			"type": "EMPLOYEE_COUNT_EXCEEDED"
		},
		EMPLOYEE_ALREADY_ADDED: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Employee already added in this trip.",
			"type": "EMPLOYEE_ALREADY_ADDED"
		},
		GROUP_TYPE_MISMATCHED: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Group with different shift type, shift time, weekOff or waiting time can't be merged together!",
			"type": "GROUP_TYPE_MISMATCHED"
		},
		PICKUP_NOT_FOUND: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
				"message": "Employee pickup details not found.",
				"type": "PICKUP_NOT_FOUND",
				"data": data
			};
		},
		INCOMPLETE_EMPLOYEE_DATA: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Some of the employee does'nt have the required data to form groups!",
			"type": "INCOMPLETE_EMPLOYEE_DATA"
		},
		NO_EMPLOYEE_FOUND_WITHIN_OFFICE_RANGE: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "No employee found within office range!",
			"type": "NO_EMPLOYEE_FOUND_WITHIN_OFFICE_RANGE"
		},
		NO_EMPLOYEE_LEFT: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "No employee found with verified address.",
			"type": "NO_EMPLOYEE_LEFT"
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
		ROUTE_REGISTERED: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Route has been created successfully.",
			"type": "ROUTE_ADDED"
		},
		ROUTE_UPDATE: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Route has been updated successfully.",
			"type": "ROUTE_UPDATE"
		},
		CAB_DETAILS: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Cab details get successfully.",
				"type": "CAB_DETAILS",
				"data": data
			};
		},
		ROUTE_DETAILS: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Route details get successfully.",
				"type": "ROUTE_DETAILS",
				"data": data
			};
		},
		ROUTE_LIST: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Route list get successfully.",
				"type": "ROUTE_LIST",
				"data": data
			};
		},
		// NO_EMPLOYEE_LEFT: {
		// 	"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
		// 	"message": "Groups already assigned to each employee with verified address.",
		// 	"type": "NO_EMPLOYEE_LEFT"
		// },
		ROUTE_APPROVE: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Groups have been approved successfully.",
			"type": "ROUTE_APPROVE"
		},
		ROUTE_MERGE: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Groups have been merged successfully.",
			"type": "ROUTE_MERGE"
		},
		ROUTE_DISSOLVE: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Groups have been dissolved successfully.",
			"type": "ROUTE_DISSOLVE"
		},
		ROUTE_REGENERATE: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Groups have been regenerated successfully.",
			"type": "ROUTE_REGENERATE"
		},
		EMP_SWAPPED: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Group's employees order have been updated successfully.",
			"type": "EMP_SWAPPED"
		},
		NEW_EMPLOYEES_GROUPS: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "New employees have been added to groups successfully.",
			"type": "NEW_EMPLOYEES_GROUPS"
		},
	}
};