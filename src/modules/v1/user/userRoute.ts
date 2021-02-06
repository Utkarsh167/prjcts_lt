"use strict";

import * as appUtils from "@utils/appUtils";
import * as commonValidator from "@utils/commonValidator";
import * as config from "@config/index";
import * as Hapi from "hapi";
import { ResponseHandler } from "@utils/ResponseHandler";
import { userController } from "@modules/v1/user/userController";
import * as userValidator from "@modules/v1/user/userValidator";
import * as tokenManager from "@lib/tokenManager";

let responseHandler = new ResponseHandler();

export let userRoute = [
	{
		method: "PUT",
		path: `${config.SERVER.API_BASE_URL}/user/driver`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: DriverUpdateRequest = request.payload;
			try {
				let result = await userController.updateDriver({ ...payload }, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "Driver update",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: userValidator.validateDriverUpdate,
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
		path: `${config.SERVER.API_BASE_URL}/user/driver`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: DriverSignupRequest = request.payload;
			try {
				let result = await userController.driverSignup({ ...tokenData, ...payload }, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "User signup via email and password",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: userValidator.validateDriverSignup,
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
		path: `${config.SERVER.API_BASE_URL}/user/employee`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: EmpUpdateRequest = request.payload;
			try {
				let result = await userController.updateEmp({ ...payload }, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "Employee update profile",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: userValidator.validateEmpUpdate,
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
		path: `${config.SERVER.API_BASE_URL}/user/employee`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: EmpSignupRequest = request.payload;
			try {
				let result = await userController.empSignup({ ...tokenData, ...payload }, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "User signup via email and password",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: userValidator.validateEmpSignup,
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
		path: `${config.SERVER.API_BASE_URL}/user/login`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let headers: Device = request.headers;
			let requestInfo: Device = request.info;
			let payload: LoginRequest = request.payload;
			try {
				let result = await userController.login({ ...headers, ...requestInfo, ...payload });
				console.log("=================", result.data.data.pickup);
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
				payload: userValidator.validatelogin,
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
	 * Driver filter using search
	 */
	{
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/user/driver`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: ListingRequest = request.query;
			try {
				let result = await userController.driverListing({ ...tokenData, ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "user"],
			description: "Driver List for filter",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: userValidator.validateDriverListing,
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
				let result = await userController.changePassword({ ...tokenData, ...payload });
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
				payload: userValidator.validateChangePassword,
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
				let result = await userController.forgotPassword({ ...payload });
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
				payload: userValidator.validateForgotPassword,
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
				result = await userController.changeForgotPassword({ ...tokenData, ...payload });
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
				payload: userValidator.validateChangeForgotPassword,
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
				let result = await userController.redirectToResetPassword({ accessToken });
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
				query: userValidator.validateResetaccessToken,
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
				let result = await userController.logout({ ...tokenData });
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
				let result = await userController.userList({ ...tokenData, ...query });
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
				query: userValidator.validateUserList,
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
				let result = await userController.userListCurrent({ ...tokenData, ...query });
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
				query: userValidator.validateUserList,
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
				let result = await userController.exportUser({ ...query });
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
				query: userValidator.validateExportUser,
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
				let result = await userController.blockUnblock({ ...params, ...payload }, tokenData);
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
		path: `${config.SERVER.API_BASE_URL}/user/bulk-block`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: MultiBlockRequest = request.payload;
			try {
				let result = await userController.multiBlockUnblock({ ...tokenData, ...payload });
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
				payload: userValidator.validateMultiBlockUnblock,
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
		// reasonForArchive -- satyam
		// method: "DELETE",
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/user/{userId}`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let params: DeleteRequest = request.params;
			// reasonForArchive -- satyam
			let payload: DeleteRequest = request.payload;
			try {
				let result = await userController.deleteUser({ ...params, ...payload }, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "Delete User",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				params: commonValidator.validateUserId,
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
		path: `${config.SERVER.API_BASE_URL}/user/details`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let query: UserId = request.query;
			try {
				let result = await userController.userDetails({ ...query });
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
		path: `${config.SERVER.API_BASE_URL}/user/employeeByEmpId`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: IsEmployee = request.query;
			try {
				let result = await userController.employeeById({ ...query, ...tokenData });
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
				let result = await userController.profile({ ...tokenData });
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
				let result = await userController.importUsers({ ...tokenData, ...payload });
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
				payload: userValidator.validateImportUsers,
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
				let result = await userController.updateHomeAddress({ ...tokenData, ...payload });
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
				payload: userValidator.validateHomeAddress,
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
		path: `${config.SERVER.API_BASE_URL}/user/getEmployeeForGroup`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: EmployeeForGroupRequest = request.query;
			try {
				let result = await userController.empForGroup({ ...query, ...tokenData });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "User details by emp by emp id for group",
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
				let result = await userController.contactAdmin({ ...tokenData, ...payload });
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
				payload: userValidator.validateUserQuery,
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
				let result = await userController.empList({ ...tokenData });
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
				// query: userValidator.validateUserList,
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
		path: `${config.SERVER.API_BASE_URL}/user/bulkEmployee`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: EmpBulkSignupRequest = request.payload;
			try {
				let result = await userController.bulkEmpSignup({ ...tokenData, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "Bulk employee signup via csv file",
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
				payload: userValidator.validateBulkEmpSignup,
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
		path: `${config.SERVER.API_BASE_URL}/user/bulkDriver`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: DriverSignupRequest = request.payload;
			try {
				let result = await userController.bulkDriverSignup({ ...tokenData, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "Bulk driver signup via csv file",
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
				payload: userValidator.validateBulkEmpSignup,
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

	/**
	 * Employee Shift listing
	 */
	{
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/user/empShiftList`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: EmpShiftListing = request.query;
			try {
				let result = await userController.empShiftList({ ...tokenData, ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "user"],
			description: "Employee WeekOff List",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: userValidator.validateEmpShiftList,
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
		path: `${config.SERVER.API_BASE_URL}/user/empShift`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: EmpShiftUpdateRequest = request.payload;
			try {
				let result = await userController.updateEmpShift({ ...tokenData, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "Employee update profile",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: userValidator.validateEmpShiftUpdate,
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
		path: `${config.SERVER.API_BASE_URL}/user/addressChangeRequest`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: IsAddressChangeRequest = request.payload;
			try {
				let result = await userController.addressChangeRequest({ ...tokenData, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "Admin can approve or reject of employee address change request",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: userValidator.validateAddressChangeRequest,
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
		path: `${config.SERVER.API_BASE_URL}/user/isUniqueMobileNo`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: IsMobileNoUnique = request.query;
			try {
				let result = await userController.isMobileNoUnique({ ...query, ...tokenData });
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
				query: userValidator.validateMobileNoUnique,
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