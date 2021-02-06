"use strict";

import * as config from "@config/constant";

export const MESSAGES = {
	ERROR: {
		EMAIL_ALREADY_EXIST: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "User with this email is already registered.",
			"type": "EMAIL_ALREADY_EXIST"
		},
		SHIFT_NAME_ALREADY_EXIST: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "ShiftName already exists.",
			"type": "SHIFT_NAME_ALREADY_EXIST"
		},
		INVALID_OLD_PASSWORD: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Old password is invalid.",
			"type": "INVALID_OLD_PASSWORD"
		}
	},
	SUCCESS: {
		ADD_COMPANY_ADMIN: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Company added successfully credentials send to email.",
			"type": "ADD_COMPANY_ADMIN"
		},
		PERMISSION: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Permission module added.",
			"type": "ADD_PERMISSION"
		},
		GET_PERMISSION: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Permission module get successfully.",
				"type": "ADD_PERMISSION",
				"data": data,
			};
		},
		ADD_SUB_ADMIN: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Sub admin created successfully.Password send to on email.",
			"type": "ADD_SUB_ADMIN"
		},
		SUB_ADMIN_LIST: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Sub admin list get successfully.",
				"type": "SUB_ADMIN_LIST",
				"data": data
			};
		},
		AUDIT_LOG_LIST: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Audit log list get successfully.",
				"type": "AUDIT_LOG_LIST",
				"data": data
			};
		},
		DELETE_SUB_ADMIN: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Sub admin deleted successfully.",
			"type": "DELETE_SUB_ADMIN"
		},
		EDIT_SUB_ADMIN: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Sub admin edited successfully.",
			"type": "EDIT_SUB_ADMIN"
		},
		BLOCK_SUB_ADMIN: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Sub admin blocked successfully.",
			"type": "BLOCK__SUB_ADMIN"
		},
		UNBLOCK_SUB_ADMIN: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Sub admin unblocked successfully.",
			"type": "UNBLOCK_SUB_ADMIN"
		},
		FORGOT_PASSWORD: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Please check your e-mail for password reset link.",
			"type": "FORGOT_PASSWORD"
		},
		CHANGE_FORGOT_PASSWORD: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Password changed successfully.",
			"type": "CHANGE_FORGOT_PASSWORD"
		},
		ADMIN_LOGIN: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Admin logged in successfully.",
				"type": "ADMIN_LOGIN",
				"data": data
			};
		},
		LOGOUT: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Admin logged out successfully.",
			"type": "LOGOUT"
		},
		CHANGE_PASSWORD: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Password changed successfully.",
			"type": "CHANGE_PASSWORD"
		},
		ADMIN_DETAILS: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Admin details get successfully.",
				"type": "ADMIN_DETAILS",
				"data": data
			};
		},
		DASHBOARD: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Dashboard data get successfully.",
				"type": "DASHBOARD",
				"data": data
			};
		},
		EDIT_PROFILE: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.UPDATED,
				"message": "Profile edited successfully.",
				"type": "EDIT_PROFILE",
				"data": data
			};
		},
		SHIFT_NAME_NOT_EXIST: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Shift name does'nt exists.",
			"type": "SHIFT_NAME_NOT_EXIST"
		},
	}
};