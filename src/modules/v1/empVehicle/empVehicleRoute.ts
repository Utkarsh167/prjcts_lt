"use strict";

import * as appUtils from "@utils/appUtils";
import * as commonValidator from "@utils/commonValidator";
import * as config from "@config/index";
import * as Hapi from "hapi";
import { ResponseHandler } from "@utils/ResponseHandler";
import {empVehicleController} from "@modules/v1/empVehicle/empVehicleController";
import * as empVehicleValidator from "@modules/v1/empVehicle/empVehicleValidator";

import * as tokenManager from "@lib/tokenManager";

let responseHandler = new ResponseHandler();

export let empVehicleRoute = [
	{
		method: "PUT",
		path: `${config.SERVER.API_BASE_URL}/user/employee`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: EmpUpdateRequest = request.payload;
			try {
				let result = await empVehicleController.updateEmp({ ...payload }, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "user", "vehicle"],
			description: "Employee update profile",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: empVehicleValidator.validateEmpUpdate,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					// payloadType: 'form',
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "PUT",
		path: `${config.SERVER.API_BASE_URL}/vehicle/editVehicle`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: VehicleUpdateRequest = request.payload;
			try {
				let result = await empVehicleController.updateVehicle({ ...payload }, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "Vehicle update data",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: empVehicleValidator.validateVehicleUpdate,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					// payloadType: 'form',
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/vehicle/showcaseDemoApi`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: VehicleUpdateRequest = request.payload;
			try {
				let result = await empVehicleController.showcaseDemoApi({ ...payload }, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "Showcase demo data",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: empVehicleValidator.validateVehicleUpdate,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					// payloadType: 'form',
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	// {
	// 	method: "POST",
	// 	path: `${config.SERVER.API_BASE_URL}/user/employee`,
	// 	handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
	// 		let tokenData: TokenData = request.auth.credentials.tokenData;
	// 		let payload: EmpSignupRequest = request.payload;
	// 		try {
	// 			let result = await empVehicleController.empVehicleSignup({ ...tokenData, ...payload }, tokenData);
	// 			return responseHandler.sendSuccess(h, result);
	// 		} catch (error) {
	// 			return responseHandler.sendError(error);
	// 		}
	// 	},
	// 	options: {
	// 		tags: ["api", "user"],
	// 		description: "User signup via email and password",
	// 		// notes: "",
	// 		auth: {
	// 			strategies: ["AdminAuth"]
	// 		},
	// 		validate: {
	// 			headers: commonValidator.adminAuthorizationHeaderObj,
	// 			payload: empVehicleValidator.validateEmpSignup,
	// 			failAction: appUtils.failActionFunction
	// 		},
	// 		plugins: {
	// 			"hapi-swagger": {
	// 				// payloadType: 'form',
	// 				responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
	// 			}
	// 		}
	// 	}
	// },
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/user/login`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let headers: Device = request.headers;
			let requestInfo: Device = request.info;
			let payload: LoginRequest = request.payload;
			try {
				let result = await empVehicleController.login({ ...headers, ...requestInfo, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "User Login",
			notes: "User login via email and password",
			auth: {
				strategies: ["BasicAuth"]
			},
			validate: {
				headers: commonValidator.platformHeaderObj["required"],
				payload: empVehicleValidator.validatelogin,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					// payloadType: 'form',
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},

	/**
	 * Employee filter using search
	 */
	{
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/user/employee`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: ListingRequest = request.query;
			try {
				let result = await empVehicleController.emmloyeeListing({ ...tokenData, ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "user"],
			description: "Employee List for filter",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: empVehicleValidator.validateEmployeeListing,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	// Change password user
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/user/change-password`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: ChangeUserPasswordRequest = request.payload;
			try {
				let result = await empVehicleController.changePassword({ ...tokenData, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "user"],
			description: "Change Password",
			// notes: "",
			auth: {
				strategies: ["UserAuth"]
			},
			validate: {
				headers: commonValidator.userAuthorizationHeaderObj,
				payload: empVehicleValidator.validateChangePassword,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/user/forgot-password`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let payload: ForgotPasswordRequest = request.payload;
			try {
				let result = await empVehicleController.forgotPassword({ ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "user"],
			description: "Forgot Password",
			notes: "Send Password reset link on email",
			auth: {
				strategies: ["BasicAuth"]
			},
			validate: {
				headers: commonValidator.platformHeaderObj["optional"],
				payload: empVehicleValidator.validateForgotPassword,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					// payloadType: 'form',
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/user/change-forgot-password`,
		handler: async (request, h) => {
			let query: Device = request.query;
			let payload: ChangeForgotPasswordRequest = request.payload;
			try {
				let tokenData = await tokenManager.verifyToken({ ...query });
				let result;
				result = await empVehicleController.changeForgotPassword({ ...tokenData, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "user"],
			description: "Change Forgot Password",
			notes: "Change forgot password API for (user)",
			auth: {
				strategies: ["BasicAuth"]
			},
			validate: {
				headers: commonValidator.platformHeaderObj["required"],
				query: commonValidator.validateAccessToken,
				payload: empVehicleValidator.validateChangeForgotPassword,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					// payloadType: 'form',
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/user/reset-password`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let { accessToken }: ResetPasswordRequest = request.query;
			try {
				let result = await empVehicleController.redirectToResetPassword({ accessToken });
				let isExpired = false;
				if (result.response === config.CONSTANT.MESSAGES.ERROR.TOKEN_EXPIRED) {
					accessToken = accessToken + Math.random();
					isExpired = true;
				}
				if (result) {
					if (result.userType === config.CONSTANT.USER_TYPE.DRIVER) {
						// config.SERVER.ADMIN_URL + "/forgot-password/" + params.accessToken
						result.fallback = config.SERVER.ADMIN_URL + '/user/reset-password/' + accessToken;
						result.url = config.CONSTANT.DEEPLINK.URL_DRIVER + accessToken;
						result.android_package_name = config.CONSTANT.DEEPLINK.ANDROID_DRIVER_PACKAGE_NAME;
						result.is_expired = isExpired;
					} else {
						result.fallback = config.SERVER.ADMIN_URL + '/user/reset-password/' + accessToken;
						result.url = config.CONSTANT.DEEPLINK.URL_EMP + accessToken;
						result.iosLink = config.CONSTANT.DEEPLINK.IOSEMPLINK + accessToken;
						result.ios_store_link = config.CONSTANT.DEEPLINK.IOS_STORE_LINK;
						result.android_package_name = config.CONSTANT.DEEPLINK.ANDROID_EMP_PACKAGE_NAME;
						result.is_expired = isExpired;
					}

					console.log("deeplink data");
					console.log(result);

					return h.view('deeplink', result);
				} else {
					result = config.CONSTANT.MESSAGES.ERROR.TOKEN_EXPIRED;
					return responseHandler.sendSuccess(h, result);
				}
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "user"],
			description: "Export User",
			// notes: "",
			// auth: {
			// 	strategies: ["AdminAuth"]
			// },
			validate: {
				// headers: commonValidator.adminAuthorizationHeaderObj,
				query: empVehicleValidator.validateResetaccessToken,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/user/logout`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			try {
				let result = await empVehicleController.logout({ ...tokenData });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "User Logout",
			// notes: "",
			auth: {
				strategies: ["UserAuth"]
			},
			validate: {
				headers: commonValidator.userAuthorizationHeaderObj,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					// payloadType: 'form',
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/user/list`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: ListingRequest = request.query;
			try {
				let result = await empVehicleController.userList({ ...tokenData, ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "user"],
			description: "User List",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: empVehicleValidator.validateUserList,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/vehicle/list`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: ListingRequest = request.query;
			try {
				let result = await empVehicleController.vehicleList({ ...tokenData, ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "vehicle"],
			description: "Vehicle List",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: empVehicleValidator.validateUserList,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/user/currentList`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: ListingRequest = request.query;
			try {
				let result = await empVehicleController.userListCurrent({ ...tokenData, ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "user"],
			description: "User List",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: empVehicleValidator.validateUserList,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/user/export`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let query: ListingRequest = request.query;
			try {
				let result = await empVehicleController.exportUser({ ...query });
				let response = request.raw.res;
				let Reportres = result.data;
				response.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
				const fileName: string = new Date().getTime() + "_Users";
				response.setHeader("Content-Disposition", "attachment; filename=" + fileName + ".xlsx");
				response.setHeader("Access-Control-Allow-Origin", "*");
				await Reportres.write(response);
				response.end();
				return h.abandon;
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "user"],
			description: "Export User",
			// notes: "",
			// auth: {
			// 	strategies: ["AdminAuth"]
			// },
			validate: {
				// headers: commonValidator.adminAuthorizationHeaderObj,
				query: empVehicleValidator.validateExportUser,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/user/block/{userId}`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let params: UserId = request.params;
			let payload: BlockRequest = request.payload;
			try {
				let result = await empVehicleController.blockUnblockEmployee({ ...params, ...payload }, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "Block User",
			notes: "Block Unblock User",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				params: commonValidator.validateUserId,
				payload: commonValidator.validateStatus,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					// payloadType: 'form',
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/vehicle/block/{vehicleId}`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			// let tokenData: TokenData = request.auth.credentials.tokenData;
			let params: UserId = request.params;
			let payload: BlockRequest = request.payload;
			try {
				let result = await empVehicleController.blockUnblockVehicle({ ...params, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "Block Vehicle",
			notes: "Block Unblock Vehicle",
			// auth: {
			// 	strategies: ["AdminAuth"]
			// },
			validate: {
				// headers: commonValidator.adminAuthorizationHeaderObj,
				params: commonValidator.validateVehicleId,
				payload: commonValidator.validateStatus,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					// payloadType: 'form',
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/user/bulk-block`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: MultiBlockRequest = request.payload;
			try {
				let result = await empVehicleController.multiBlockUnblock({ ...tokenData, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "Block User",
			notes: "Multiple Block Unblock Users",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: empVehicleValidator.validateMultiBlockUnblock,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					// payloadType: 'form',
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	// {
	// 	method: "DELETE",
	// 	path: `${config.SERVER.API_BASE_URL}/user/{userId}`,
	// 	handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
	// 		let tokenData: TokenData = request.auth.credentials.tokenData;
	// 		let params: DeleteRequest = request.params;
	// 		try {
	// 			let result = await empVehicleController.deleteUser({ ...params }, tokenData);
	// 			return responseHandler.sendSuccess(h, result);
	// 		} catch (error) {
	// 			return responseHandler.sendError(error);
	// 		}
	// 	},
	// 	options: {
	// 		tags: ["api", "user"],
	// 		description: "Delete User",
	// 		// notes: "",
	// 		auth: {
	// 			strategies: ["AdminAuth"]
	// 		},
	// 		validate: {
	// 			headers: commonValidator.adminAuthorizationHeaderObj,
	// 			params: commonValidator.validateUserId,
	// 			failAction: appUtils.failActionFunction
	// 		},
	// 		plugins: {
	// 			"hapi-swagger": {
	// 				// payloadType: 'form',
	// 				responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
	// 			}
	// 		}
	// 	}
	// },
	{
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/user/details`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let query: UserId = request.query;
			try {
				let result = await empVehicleController.userDetails({ ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "User Details",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: commonValidator.validateUserId,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					// payloadType: 'form',
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/vehicle/details`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let query: UserId = request.query;
			try {
				let result = await empVehicleController.vehicleDetails({ ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "vehilce"],
			description: "Vehicle Details",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: commonValidator.validateVehicleId,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					// payloadType: 'form',
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/user/employeeByEmpId`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: IsEmployee = request.query;
			try {
				let result = await empVehicleController.employeeById({ ...query, ...tokenData });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "User details by emp by emp id",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: commonValidator.validateEmpId,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					// payloadType: 'form',
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/user/profile`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			try {
				let result = await empVehicleController.profile({ ...tokenData });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "User Profile",
			// notes: "",
			auth: {
				strategies: ["UserAuth"]
			},
			validate: {
				headers: commonValidator.userAuthorizationHeaderObj,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					// payloadType: 'form',
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/user/import`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: ImportUsersRequest = request.payload;
			try {
				let result = await empVehicleController.importUsers({ ...tokenData, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "user"],
			description: "Import User",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			payload: {
				maxBytes: 1024 * 1024 * 100, // 100MB
				output: "stream",
				allow: "multipart/form-data", // important
				parse: true
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: empVehicleValidator.validateImportUsers,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					payloadType: "form",
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	// Update home address of employee
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/user/home-address`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: HomeAddressRequest = request.payload;
			try {
				let result = await empVehicleController.updateHomeAddress({ ...tokenData, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "user"],
			description: "Update home address",
			// notes: "",
			auth: {
				strategies: ["UserAuth"]
			},
			validate: {
				headers: commonValidator.userAuthorizationHeaderObj,
				payload: empVehicleValidator.validateHomeAddress,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	// satyam -getEmployeeForgroup
	{
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/user/getEmployeeForVehicle`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: EmployeeForGroupRequest = request.query;
			try {
				let result = await empVehicleController.empForGroup({ ...query, ...tokenData });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "User details by employee id for group",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: commonValidator.validateEmpId,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					// payloadType: 'form',
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},

	// User have any query then contact to admin
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/user/contact-admin`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: UserQueryRequest = request.payload;
			try {
				let result = await empVehicleController.contactAdmin({ ...tokenData, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "user"],
			description: "User query",
			// notes: "",
			auth: {
				strategies: ["UserAuth"]
			},
			validate: {
				headers: commonValidator.userAuthorizationHeaderObj,
				payload: empVehicleValidator.validateUserQuery,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},

	/**
	 * Dummy employee list for testing purpose
	 */
	{
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/user/emplist`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			// let query: ListingRequest = request.query;
			try {
				let result = await empVehicleController.empList({ ...tokenData });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "user"],
			description: "Employee List",
			// notes: "",
			auth: {
				strategies: ["UserAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: empVehicleValidator.validateUserList,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/user/empVehicleSignup`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: EmpSignupRequest = request.payload;
			try {
				let result = await empVehicleController.empVehicleSignup({ ...tokenData, ...payload }, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "User and Vehicle signup",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: empVehicleValidator.validateEmpSignup,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					// payloadType: 'form',
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/user/vehicleSignup`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: EmpSignupRequest = request.payload;
			try {
				let result = await empVehicleController.vehicleSignup({ ...tokenData, ...payload }, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "Vehicle signup",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: empVehicleValidator.validateVehicleSignup,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					// payloadType: 'form',
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/user/bulkEmpVehicleSignup`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: EmpBulkSignupRequest = request.payload;
			try {
				let result = await empVehicleController.bulkEmpVehicleSignup({ ...tokenData, ...payload }, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "Bulk employee signup via xls file",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			payload: {
				maxBytes: 1024 * 1024 * 100, // 100MB
				output: "stream",
				allow: "multipart/form-data", // important
				parse: true
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: empVehicleValidator.validateBulkEmpSignup,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					payloadType: 'form',
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/user/bulkVehicle`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: VehicleSignUpRequest = request.payload;
			try {
				let result = await empVehicleController.bulkVehicleSignup({ ...tokenData, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "Bulk vehicle signup via xls file",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			payload: {
				maxBytes: 1024 * 1024 * 100, // 100MB
				output: "stream",
				allow: "multipart/form-data", // important
				parse: true
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: empVehicleValidator.validateBulkEmpSignup,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					payloadType: 'form',
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	// {
	// 	method: "POST",
	// 	path: `${config.SERVER.API_BASE_URL}/user/bulkDriver`,
	// 	handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
	// 		let tokenData: TokenData = request.auth.credentials.tokenData;
	// 		let payload: DriverSignupRequest = request.payload;
	// 		try {
	// 			let result = await empVehicleController.bulkDriverSignup({ ...tokenData, ...payload });
	// 			return responseHandler.sendSuccess(h, result);
	// 		} catch (error) {
	// 			return responseHandler.sendError(error);
	// 		}
	// 	},
	// 	options: {
	// 		tags: ["api", "user"],
	// 		description: "Bulk driver signup via csv file",
	// 		// notes: "",
	// 		auth: {
	// 			strategies: ["AdminAuth"]
	// 		},
	// 		payload: {
	// 			maxBytes: 1024 * 1024 * 100, // 100MB
	// 			output: "stream",
	// 			allow: "multipart/form-data", // important
	// 			parse: true
	// 		},
	// 		validate: {
	// 			headers: commonValidator.adminAuthorizationHeaderObj,
	// 			payload: empVehicleValidator.validateBulkEmpSignup,
	// 			failAction: appUtils.failActionFunction
	// 		},
	// 		plugins: {
	// 			"hapi-swagger": {
	// 				payloadType: 'form',
	// 				responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
	// 			}
	// 		}
	// 	}
	// },

	/**
	 * Employee Shift listing
	 */
	// {
	// 	method: "GET",
	// 	path: `${config.SERVER.API_BASE_URL}/user/empShiftList`,
	// 	handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
	// 		let tokenData: TokenData = request.auth.credentials.tokenData;
	// 		let query: EmpShiftListing = request.query;
	// 		try {
	// 			let result = await empVehicleController.empShiftList({ ...tokenData, ...query });
	// 			return responseHandler.sendSuccess(h, result);
	// 		} catch (error) {
	// 			return responseHandler.sendError(error);
	// 		}
	// 	},
	// 	config: {
	// 		tags: ["api", "user"],
	// 		description: "Employee WeekOff List",
	// 		// notes: "",
	// 		auth: {
	// 			strategies: ["AdminAuth"]
	// 		},
	// 		validate: {
	// 			headers: commonValidator.adminAuthorizationHeaderObj,
	// 			query: empVehicleValidator.validateEmpShiftList,
	// 			failAction: appUtils.failActionFunction
	// 		},
	// 		plugins: {
	// 			"hapi-swagger": {
	// 				responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
	// 			}
	// 		}
	// 	}
	// },
	// {
	// 	method: "PUT",
	// 	path: `${config.SERVER.API_BASE_URL}/user/empShift`,
	// 	handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
	// 		let tokenData: TokenData = request.auth.credentials.tokenData;
	// 		let payload: EmpShiftUpdateRequest = request.payload;
	// 		try {
	// 			let result = await empVehicleController.updateEmpShift({ ...tokenData, ...payload });
	// 			return responseHandler.sendSuccess(h, result);
	// 		} catch (error) {
	// 			return responseHandler.sendError(error);
	// 		}
	// 	},
	// 	options: {
	// 		tags: ["api", "user"],
	// 		description: "Employee update profile",
	// 		// notes: "",
	// 		auth: {
	// 			strategies: ["AdminAuth"]
	// 		},
	// 		validate: {
	// 			headers: commonValidator.adminAuthorizationHeaderObj,
	// 			payload: empVehicleValidator.validateEmpShiftUpdate,
	// 			failAction: appUtils.failActionFunction
	// 		},
	// 		plugins: {
	// 			"hapi-swagger": {
	// 				// payloadType: 'form',
	// 				responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
	// 			}
	// 		}
	// 	}
	// },
	// {
	// 	method: "PUT",
	// 	path: `${config.SERVER.API_BASE_URL}/user/addressChangeRequest`,
	// 	handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
	// 		let tokenData: TokenData = request.auth.credentials.tokenData;
	// 		let payload: IsAddressChangeRequest = request.payload;
	// 		try {
	// 			let result = await empVehicleController.addressChangeRequest({ ...tokenData, ...payload });
	// 			return responseHandler.sendSuccess(h, result);
	// 		} catch (error) {
	// 			return responseHandler.sendError(error);
	// 		}
	// 	},
	// 	options: {
	// 		tags: ["api", "user"],
	// 		description: "Admin can approve or reject of employee address change request",
	// 		// notes: "",
	// 		auth: {
	// 			strategies: ["AdminAuth"]
	// 		},
	// 		validate: {
	// 			headers: commonValidator.adminAuthorizationHeaderObj,
	// 			payload: empVehicleValidator.validateAddressChangeRequest,
	// 			failAction: appUtils.failActionFunction
	// 		},
	// 		plugins: {
	// 			"hapi-swagger": {
	// 				// payloadType: 'form',
	// 				responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
	// 			}
	// 		}
	// 	}
	// },
	{
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/user/isUniqueMobileNo`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: IsMobileNoUnique = request.query;
			try {
				let result = await empVehicleController.isMobileNoUnique({ ...query, ...tokenData });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "user"],
			description: "Check user mobile number unique",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: empVehicleValidator.validateMobileNoUnique,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/empVehicle/userVehiclelist`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: VehicleListForUser = request.query;

			try {
				let result = await empVehicleController.userVehicleList({ ...query, ...tokenData });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "user"],
			description: "List of user vehicle",
			// notes: "",
			auth: {
				strategies: ["UserAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				// query: empVehicleValidator.validateMobileNoUnique,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/empVehicle/userAddVehicle`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: Vehicle = request.payload;
			try {
				let result = await empVehicleController.userAddVehicle({ ...payload, ...tokenData });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "user"],
			description: "Add user vehicle",
			// notes: "",
			auth: {
				strategies: ["UserAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: empVehicleValidator.validateUserVehicleSignup,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "PUT",
		path: `${config.SERVER.API_BASE_URL}/empVehicle/userUpdateVehicle`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: VehicleUpdateRequest = request.payload;
			try {
				let result = await empVehicleController.userUpdateVehicle({ ...payload, ...tokenData });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "user"],
			description: "Add user vehicle",
			// notes: "",
			auth: {
				strategies: ["UserAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: empVehicleValidator.validateUserVehicleUpdate,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},

	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/empVehicle/bookedSpots`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: VehicleUpdateRequest = request.payload;
			try {
				let result = await empVehicleController.getBookedSpots({ ...payload, ...tokenData });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "user"],
			description: "Send booked spots",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				// payload: empVehicleValidator.validateUserVehicleUpdate,
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
];
