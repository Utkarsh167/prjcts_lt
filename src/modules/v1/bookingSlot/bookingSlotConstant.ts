"use strict";

import * as config from "@config/constant";

export const MESSAGES = {
	ERROR: {
		VALIDITY_EXPIRED: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Guest validity expired, contact admin to increase validity",
				// "type": "VEHICLE_DETAILS",
				"data": data,
				"event": "automatic-blocked",
				"hidden": true,
			};
		},
		VEHICLE_DETAILS: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Vehicle details not found.",
				// "type": "VEHICLE_DETAILS",
				"data": data,
				"event": "manual",
				"hidden": false,
			};
		},
		ENTRY_LOG_DETAILS: () => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Entry Log Id not found.",
				// "type": "VEHICLE_DETAILS"
			};
		},
		VEHICLE_STATUS: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.ACCESS_FORBIDDEN,
				"message": "Vehicle is blacklisted.",
				// "type": "VEHICLE_STATUS",
				"data": data,
				"event": "automatic-blacklisted",
				"hidden": true,
			};
		},
		USER_BLOCKED: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.ACCESS_FORBIDDEN,
				"message": "User is blocked, contact Admin for unblocking the user.",
				// "type": "VEHICLE_STATUS",
				"data": data,
				"event": "automatic-blocked",
				"hidden": true,
			};
		},
		ENTRY_LOG_NOT_FOUND: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.ACCESS_FORBIDDEN,
				"message": "Vehicle parked for a longer duration or wrong regNo",
				// "type": "VEHICLE_STATUS",
				"data": data,
				"event": "automatic-not-found",
				"hidden": true,
			};
		},
	},
	SUCCESS: {
		BOOKED: {"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Spot Booked successfully"
		},
		VEHICLE_DETAILS: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Registered vehicle! entry logged successfully",
				// "type": "VEHICLE_DETAILS",
				"data": data,
				"event": "automatic-whitelisted",
				"hidden": true,
			};
		},
		LOG_CREATED: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Entry log created successfully.",
				// "type": "VEHICLE_DETAILS",
				"data": data
			};
		},
		LOG_EXISTS: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Entry for this vehicle already exists.",
				// "type": "VEHICLE_DETAILS",
				"event": "automatic-whitelisted-reentry",
				"hidden": true,
				"data": data
			};
		},
		OUT_UPDATED: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Entry log updated with outTime successfully.",
				// "type": "VEHICLE_DETAILS",
				"data": data,
				"event": "automatic-whitelisted",
				"hidden": true,
			};
		},
		UPDATED: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Entry log updated successfully.",
				// "type": "VEHICLE_DETAILS",
				"data": data
			};
		},
		LOG_LISTED: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Entry log list generated successfully.",
				// "type": "VEHICLE_DETAILS",
				"data": data
			};
		},
		USER_LISTED: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "User list generated successfully.",
				// "type": "USER_DETAILS",
				"data": data
			};
		},
	},
};
