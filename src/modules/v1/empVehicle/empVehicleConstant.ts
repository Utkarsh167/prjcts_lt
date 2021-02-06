"use strict";

import * as config from "@config/index";

export const MESSAGES = {
	ERROR: {
		EMAIL_ALREADY_EXIST: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "User with this email ID already exists.",
			"type": "EMAIL_ALREADY_EXIST"
		},
		INVALID_EMAIL: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Invalid email ID format.",
			"type": "INVALID_EMAIL_ID"
		},
		LOCATION_NAME_NOT_EXIST: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Location name does not exist",
			"type": "LOCATION_NAME_NOT_EXIST"
		},
		EMPLOYEE_ID_ALREADY_EXIST: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "User with this employeeId already exist.",
			"type": "EMPLOYEE_ID_ALREADY_EXIST"
		},
		EMPLOYEE_ID_NOT_PRESENT: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "User with this employeeId does not exist.",
			"type": "EMPLOYEE_ID_NOT_PRESENT"
		},
		NO_VEHICLE_FOR_EMPLOYEE: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "No Vehicle exist for this employee",
			"type": "NO_VEHICLE_FOR_EMPLOYEE"
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
		EMAIL_OR_PHONE_REQUIRED: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Either email is required.",
			"type": "EMAIL_OR_PHONE_REQUIRED"
		},
		REFRESH_TOKEN_REQUIRED: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Refresh token is required.",
			"type": "REFRESH_TOKEN_REQUIRED"
		},
		INVALID_REFRESH_TOKEN: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Invalid refresh token.",
			"type": "INVALID_REFRESH_TOKEN"
		},
		SESSION_EXPIRED: {
			"statusCode": 423,
			"message": "Your session has expired due to login in to another device.",
			"type": "SESSION_EXPIRED"
		},
		INVALID_OLD_PASSWORD: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Old password is invalid.",
			"type": "INVALID_OLD_PASSWORD"
		},
		SEARCH_KEY_LENGTH: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Please enter more than three character.",
			"type": "SEARCH_NAME"
		},
		CHANGE_REQUESTED: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "You have already requested for change address. You can't request again before one month.",
			"type": "HOME_ADDRESS_CHANGE"
		},
		INVALID_DATA: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Required fields can't be blank.",
			"type": "INVALID_DATA"
		},
		CAHRACTER_ALLOWED: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Name can contain only characters",
			"type": "CAHRACTER_ALLOWED"
		},
		NUMBER_ALLOWED: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Mobile number contain only number",
			"type": "CAHRACTER_ALLOWED"
		},
		MOBILE_NUMBER_LENGETH: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Mobile number should be 10 digit",
			"type": "MOBILE_NUMBER_LENGETH"
		},
		INVALID_REG_NUMBER: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Invalid Registration number",
			"type": "INVALID_REG_NUMBER"
		},
		REGISTRATION_NO_EXIST: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Registration no should be unique.",
			"type": "REGISTRATION_NO_EXIST"
		},
		VEHICLE_ID_NOT_PRESENT: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Vehicle id not present",
			"type": "VEHICLE_ID_NOT_PRESENT"
		},
		EMPLOYEEID_LENGETH: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Employee Id should be atleast 3",
			"type": "EMPLOYEEID_LENGETH"
		},
		EMPLOYEE_DATA: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "User not found.",
			"type": "EMPLOYEE_DATA"
		},
		DUPLICATE_DATA: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "File contains either duplicate emails, duplicate employee Ids or duplicate registrationNumber.",
			"type": "DUPLICATE_DATA"
		},
		DUPLICATE_DRIVER_DATA: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "File contains either duplicate emails or duplicate mobileNo.",
			"type": "DUPLICATE_DRIVER_DATA"
		},
		MOBILE_NO_EXIST: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Mobile number should be unique.",
			"type": "MOBILE_NO_EXIST"
		},
		SHIFT_NOT_FOUND: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "One or more shift names does'nt exist!",
			"type": "SHIFT_NOT_FOUND"
		},
		INVALID_GENDER: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Gender must be either 'male' or 'female'.",
			"type": "INVALID_GENDER"
		},
		INVALID_VEHICLE: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Vehicle must be either 'car' or 'bike'.",
			"type": "INVALID_VEHICLE"
		},
		INVALID_ADDRESS: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Unable to find lat long for one or more address.",
			"type": "INVALID_ADDRESS"
		},
		CAB_ASSIGN_IN_TRIP: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Driver is assigned to a trip and can't be deleted.",
			"type": "CAB_ASSIGN_IN_TRIP"
		},
	},
	SUCCESS: {
		SIGNUP: () => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.CREATED,
				"message": "Your account has been created successfully.",
				"type": "SIGNUP",
			};
		},
		LOGIN: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Logged-In successfully.",
				"type": "LOGIN",
				"data": data
			};
		},
		EMP_HOME_ADDRESS: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Home address update successfully.",
				"type": "HOME_ADDRESS",
				"data": data
			};
		},

		SIGNUP_PASSWORD_ON_EMAIL: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Password send to on email please check your e-mail.",
			"type": "SIGNUP_PASSWORD_SEND"
		},
		SIGNUP_VEHICLE: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Vehicle data inserted successfully",
			"type": "SIGNUP_VEHICLE"
		},
		CONTACT_ADMIN: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Your query has been send to admin.",
			"type": "CONTACT_ADMIN"
		},
		FORGOT_PASSWORD_ON_EMAIL: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Please check your e-mail for password reset link.",
			"type": "FORGOT_PASSWORD_ON_EMAIL"
		},
		FORGOT_PASSWORD_ON_PHONE: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Please check your number for password reset link.",
			"type": "FORGOT_PASSWORD_ON_PHONE"
		},
		CHANGE_FORGOT_PASSWORD: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Password changed successfully.",
			"type": "CHANGE_FORGOT_PASSWORD"
		},
		LOGOUT: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Logout successfully.",
			"type": "LOGOUT"
		},
		USER_LIST: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "User list get successfully.",
				"type": "USER_LIST",
				"data": data
			};
		},
		VEHICLE_LIST: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Vehicle list get successfully.",
				"type": "VEHICLE_LIST",
				"data": data
			};
		},
		EMP_LIST: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Employee list get successfully.",
				"type": "EMP_LIST",
				"data": data
			};
		},
		BOOKED_SPOTS: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Booked spots list get successfully.",
				"type": "BOOKED_SPOTS",
				"data": data
			};
		},
		EXPORT_USER: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Users export successfully.",
				"type": "EXPORT_USER",
				"data": data
			};
		},
		BLOCK_USER: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "User account successfully blocked.",
			"type": "BLOCK_USER"
		},
		UNBLOCK_USER: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "User account successfully unblocked.",
			"type": "UNBLOCK_USER"
		},
		BLOCK_VEHICLE: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Vehicle successfully blocked.",
			"type": "BLOBLOCK_VEHICLECK_USER"
		},
		UNBLOCK_VEHICLE: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Vehicle successfully unblocked.",
			"type": "UNBLOCK_VEHICLE"
		},
		MULTI_BLOCK_USER: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Users account successfully blocked.",
			"type": "BLOCK_USER"
		},
		MULTI_UNBLOCK_USER: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Users account successfully unblocked.",
			"type": "UNBLOCK_USER"
		},
		DELETE_USER: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "User deleted successfully.",
			"type": "DELETE_USER"
		},
		// User Counts -- satyam
		USER_DETAILS: (data, data1, data2, data3, data4) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "User details get successfully.",
				"type": "USER_DETAILS",
				"data": data, data1, data2, data3, data4
			};
		},
		USER_VEHICLE_DETAILS: (data, data1) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "User details get successfully.",
				"type": "USER_VEHICLE_DETAILS",
				"data": data, data1
			};
		},
		VEHICLE_DETAILS: (data, data1) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Vehicle details get successfully.",
				"type": "VEHICLE_DETAILS",
				"data": data, data1
			};
		},
		PROFILE: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "User profile get successfully.",
				"type": "PROFILE",
				"data": data
			};
		},
		IMPORT_USER: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Users imported successfully.",
			"type": "IMPORT_USER"
		},
		IMPORT_VEHICLE: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Vehicles imported successfully.",
			"type": "IMPORT_VEHICLE"
		},
		CHANGE_PASSWORD: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Your password has been updated successfully!",
			"type": "CHANGE_PASSWORD"
		},
		HOME_ADDRESS: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Your home address has been updated successfully!",
			"type": "HOME_ADDRESS"
		},
		DRIVER_UPDATE: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Driver profile has been updated successfully!",
			"type": "DRIVER_UPDATE"
		},
		EMP_UPDATE: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "User profile has been updated successfully!",
			"type": "EMPLOYEE_UPDATE"
		},
		VEHICLE_UPDATE: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Vehicle data has been updated successfully!",
			"type": "EMPLOYEE_UPVEHICLE_UPDATEDATE"
		},
		VEHICLE_UPDATE_DEMO: (data) => {
			return{
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Vehicle data has been updated successfully!",
				"type": "EMPLOYEE_UPVEHICLE_UPDATEDATE",
				"data": data
			};
		},
		EMP_WEEKOFF_LIST: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Employee weekOff list fetched successfully.",
				"type": "EMP_WEEKOFF_LIST",
				"data": data
			};
		},
		EMP_SHIFT_UPDATE: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Employee shift has been updated successfully!",
			"type": "EMP_SHIFT_UPDATE"
		},
		IS_MOBILE_NO: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "This mobile number is valid.",
			"type": "IS_MOBILE_NO"
		},
	}
};
