"use strict";

import * as config from "@config/constant";

export const MESSAGES = {
	ERROR: {
		EMAIL_ALREADY_EXIST: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Email already exists.",
			"type": "EMAIL_ALREADY_EXIST"
		},
		EMAIL_OR_URL_ALREADY_EXIST: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Email or url already exists.",
			"type": "EMAIL_OR_URL_ALREADY_EXIST"
		},
		INVALID_ADMIN_URL: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Provided admin url is not valid.",
			"type": "INVALID_ADMIN_URL"
		},
		COMPANY_TYPE_EXIST: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Company type already exists.",
			"type": "COMPANY_TYPE_EXIST"
		},
		INVALID_OLD_PASSWORD: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Old password is invalid.",
			"type": "INVALID_OLD_PASSWORD"
		},
		COMPANY_CODE_EXIST: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Company code should be unique.",
			"type": "COMPANY_CODE_EXIST"
		},
		SUBSCRIPTION_NAME_EXIST: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Subscription name should be unique.",
			"type": "SUBSCRIPTION_NAME_EXIST"
		}
	},
	SUCCESS: {
		BLOCK_COMPANY: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Company blocked successfully.",
			"type": "BLOCK__COMPANY"
		},
		BLOCK_SUBSCRIPTION: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Subscription blocked successfully.",
			"type": "BLOCK_SUBSCRIPTION"
		},
		IS_COMPANY_CODE: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "This company code is valid.",
			"type": "IS_COMPANY_CODE"
		},
		IS_SUBSCRIPTION_NAME: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "This subscription name is valid.",
			"type": "IS_SUBSCRIPTION_NAME"
		},
		ADD_COMPANY_ADMIN: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Company added successfully credentials send to email.",
			"type": "ADD_COMPANY_ADMIN"
		},
		ADD_COMPANY_TYPE: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Company type added successfully.",
			"type": "ADD_COMPANY_TYPE"
		},
		ADD_SUBSCRIPTION: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Subscription added successfully.",
			"type": "ADD_SUBSCRIPTION"
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
		SUPER_ADMIN_LOGIN: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Super admin logged in successfully.",
				"type": "SUPER_ADMIN_LOGIN",
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
		EDIT_COMPANY: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Company edited successfully.",
			"type": "EDIT_COMPANY"
		},
		RENEWAL_SUBSCRIPTION: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Subscription renewal successfully.",
			"type": "RENEWAL_SUBSCRIPTION"
		},
		ADMIN_DETAILS: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Admin details get successfully.",
				"type": "ADMIN_DETAILS",
				"data": data
			};
		},
		COMPANY_DETAILS: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Company details get successfully.",
				"type": "COMPANY_DETAILS",
				"data": data
			};
		},
		COMPANY_LIST: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Company list get successfully.",
				"type": "COMPANY_LIST",
				"data": data
			};
		},
		EARNING_LIST: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Earning list get successfully.",
				"type": "EARNING_LIST",
				"data": data
			};
		},
		SUBSCRIBED_USER: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Subscribed user get successfully.",
				"type": "SUBSCRIBED_USER_LIST",
				"data": data
			};
		},
		SUBSCRIPTION_LIST: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Subscription list get successfully.",
				"type": "SUBSCRIPTION_LIST",
				"data": data
			};
		},
		COMPANY_TYPE_LIST: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Company type list get successfully.",
				"type": "COMPANY_TYPE_LIST",
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
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Profile edited successfully.",
				"type": "EDIT_PROFILE",
				"data": data
			};
		},
		EDIT_SUBSCRIPTION: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.UPDATED,
				"message": "Subscription edited successfully.",
				"type": "EDIT_SUBSCRIPTION",
				"data": data
			};
		},
		SUBSCRIPTION_DETAILS: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Subscription details get successfully.",
				"type": "SUBSCRIPTION_DETAILS",
				"data": data
			};
		},
	}
};