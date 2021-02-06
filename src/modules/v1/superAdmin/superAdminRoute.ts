"use strict";

import { superAdminController } from "@modules/v1/superAdmin/superAdminController";
import * as superAdminValidator from "@modules/v1/superAdmin/superAdminValidator";
import * as appUtils from "@utils/appUtils";
import * as commonValidator from "@utils/commonValidator";
import * as config from "@config/index";
import * as Hapi from "hapi";
import { ResponseHandler } from "@utils/ResponseHandler";

let responseHandler = new ResponseHandler();
/**
 * Super admin module super admin can manage company registration
 */
export let superAdminRoute = [

	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/superAdmin/forgot-password`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let payload: ForgotPasswordRequest = request.payload;
			try {
				let result = await superAdminController.forgotPassword({ ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "superAdmin"],
			description: "Forgot Password",
			// notes: "",
			auth: {
				strategies: ["BasicAuth"]
			},
			validate: {
				headers: commonValidator.platformHeaderObj["required"],
				payload: superAdminValidator.validateForgotPassword,
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
		path: `${config.SERVER.API_BASE_URL}/superAdmin/login`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			try {
				let headers: Device = request.headers;
				let requestInfo: Device = request.info;
				let payload: AdminLoginRequest = request.payload;
				let result = await superAdminController.superAdminLogin({ ...headers, ...requestInfo, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "superAdmin"],
			description: "superAdmin Login",
			// notes: "",
			auth: {
				strategies: ["BasicAuth"]
			},
			validate: {
				headers: commonValidator.platformHeaderObj["required"],
				payload: superAdminValidator.validateLogin,
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
		path: `${config.SERVER.API_BASE_URL}/superAdmin/logout`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			try {
				let result = await superAdminController.logout({ ...tokenData });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "superAdmin"],
			description: "Logout",
			// notes: "",
			auth: {
				strategies: ["SuperAdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
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
		path: `${config.SERVER.API_BASE_URL}/superAdmin/change-password`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: ChangePasswordRequest = request.payload;
			try {
				let result = await superAdminController.changePassword({ ...tokenData, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "superAdmin"],
			description: "Change Password",
			// notes: "",
			auth: {
				strategies: ["SuperAdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: superAdminValidator.validateChangePassword,
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
		path: `${config.SERVER.API_BASE_URL}/superAdmin/details`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: UserId = request.query;
			try {
				let result = await superAdminController.superAdminDetails({ ...tokenData, ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "superAdmin"],
			description: "Admin Details",
			// notes: "",
			auth: {
				strategies: ["SuperAdminAuth"]
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
		method: "PUT",
		path: `${config.SERVER.API_BASE_URL}/superAdmin`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: EditProfileRequest = request.payload;
			try {
				let result = await superAdminController.editProfile({ ...tokenData, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "superAdmin"],
			description: "Profile",
			// notes: "",
			auth: {
				strategies: ["SuperAdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: superAdminValidator.validateEditProfile,
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
	 * Company registration process start api
	 */

	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/superAdmin/company`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: CreateCompanyRequest = request.payload;
			try {
				let result = await superAdminController.addCompany({ ...tokenData, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "superAdmin"],
			description: "Add Company",
			// notes: "",
			auth: {
				strategies: ["SuperAdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: superAdminValidator.validateAddCompany,
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
	 * Super admin get Company details by id
	 */
	{
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/superAdmin/companyDetails`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: UserId = request.query;
			try {
				let result = await superAdminController.companyDetails({ ...tokenData, ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "superAdmin"],
			description: "Company Details",
			// notes: "",
			auth: {
				strategies: ["SuperAdminAuth"]
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
		path: `${config.SERVER.API_BASE_URL}/superAdmin/companyList`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: ListingRequest = request.query;
			try {
				let result = await superAdminController.companyList({ ...tokenData, ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "superAdmin"],
			description: "Company List",
			// notes: "",
			auth: {
				strategies: ["SuperAdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: superAdminValidator.validateCompanyList,
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
		path: `${config.SERVER.API_BASE_URL}/superAdmin/isCompanyUnique`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: IsCompanyUnique = request.query;
			try {
				let result = await superAdminController.IsCompanyUnique({ ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "superAdmin"],
			description: "Check company unique",
			// notes: "",
			auth: {
				strategies: ["SuperAdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: superAdminValidator.validateIsCompanyUnique,
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
		path: `${config.SERVER.API_BASE_URL}/superAdmin/companyType`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: CompanyTypeRequest = request.payload;
			try {
				let result = await superAdminController.addCompanyType({ ...tokenData, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "superAdmin"],
			description: "Add Company type",
			// notes: "",
			auth: {
				strategies: ["SuperAdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: superAdminValidator.validateCompanyType,
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
		path: `${config.SERVER.API_BASE_URL}/superAdmin/companyblock/{userId}`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let params: UserId = request.params;
			let payload: BlockRequest = request.payload;
			try {
				let result = await superAdminController._blockUnblockCompany({ ...tokenData, ...params, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "superAdmin"],
			description: "Block company",
			notes: "Block Unblock Company",
			auth: {
				strategies: ["SuperAdminAuth"]
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
		method: "PUT",
		path: `${config.SERVER.API_BASE_URL}/superAdmin/companyEdit`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let params: UserId = request.params;
			let payload: CreateCompanyRequest = request.payload;
			try {
				let result = await superAdminController.editCompany({ ...tokenData, ...params, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "superAdmin"],
			description: "Edit Company",
			// notes: "",
			auth: {
				strategies: ["SuperAdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				// params: commonValidator.validateUserId,
				payload: superAdminValidator.validateEditCompany,
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
		path: `${config.SERVER.API_BASE_URL}/superAdmin/subscription`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: CreateSubscriptionRequest = request.payload;
			try {
				let result = await superAdminController.addSubscription({ ...tokenData, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "superAdmin"],
			description: "Add Subscription",
			// notes: "",
			auth: {
				strategies: ["SuperAdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: superAdminValidator.validateAddSubscription,
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
		path: `${config.SERVER.API_BASE_URL}/superAdmin/subscription`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: CreateSubscriptionRequest = request.payload;
			try {
				let result = await superAdminController.editSubscription({ ...tokenData, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "superAdmin"],
			description: "Edit Subscription",
			// notes: "",
			auth: {
				strategies: ["SuperAdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: superAdminValidator.validateEditSubscription,
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
		path: `${config.SERVER.API_BASE_URL}/superAdmin/subscriptionblock/{subscriptionId}`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let params: UserId = request.params;
			let payload: BlockRequest = request.payload;
			try {
				let result = await superAdminController._blockUnblockSubscription({ ...tokenData, ...params, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "superAdmin"],
			description: "Block subscription",
			notes: "Block Unblock Subscription",
			auth: {
				strategies: ["SuperAdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				params: commonValidator.validateSubscriptionId,
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
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/superAdmin/subscriptionList`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: ListingRequest = request.query;
			try {
				let result = await superAdminController.subscriptionList({ ...tokenData, ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "superAdmin"],
			description: "Subscription List",
			// notes: "",
			auth: {
				strategies: ["SuperAdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: superAdminValidator.validateSubscriptionList,
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
		path: `${config.SERVER.API_BASE_URL}/superAdmin/subscriptionDetails`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: UserId = request.query;
			try {
				let result = await superAdminController.subscriptionDetails({ ...tokenData, ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "superAdmin"],
			description: "Subscription Details",
			// notes: "",
			auth: {
				strategies: ["SuperAdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: commonValidator.validateSubscriptionId,
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
		path: `${config.SERVER.API_BASE_URL}/superAdmin/isUniqueSubscription`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: IsSubscriptionUnique = request.query;
			try {
				let result = await superAdminController.isSubscriptionUnique({ ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "superAdmin"],
			description: "Check company unique",
			// notes: "",
			auth: {
				strategies: ["SuperAdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: superAdminValidator.validateIsSubscriptionUnique,
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
		path: `${config.SERVER.API_BASE_URL}/superAdmin/subscribedUsers`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: ListingRequest = request.query;
			try {
				let result = await superAdminController.subscribedUsers({ ...tokenData, ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "superAdmin"],
			description: "Subscribed users",
			// notes: "",
			auth: {
				strategies: ["SuperAdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: superAdminValidator.validateSubscribedUserList,
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
		path: `${config.SERVER.API_BASE_URL}/superAdmin/companyTypeList`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: ListingRequest = request.query;
			try {
				let result = await superAdminController.companyTypeList({ ...tokenData, ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "superAdmin"],
			description: "Company type List",
			// notes: "",
			auth: {
				strategies: ["SuperAdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				// query: superAdminValidator.validateSubscriptionList,
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
		path: `${config.SERVER.API_BASE_URL}/superAdmin/earningList`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: ListingRequest = request.query;
			try {
				let result = await superAdminController.earningList({ ...tokenData, ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "superAdmin"],
			description: "Earning List",
			// notes: "",
			auth: {
				strategies: ["SuperAdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: superAdminValidator.validateEarningList,
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
		path: `${config.SERVER.API_BASE_URL}/superAdmin/earningDetails`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: UserId = request.query;
			try {
				let result = await superAdminController.earningDetails({ ...tokenData, ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "superAdmin"],
			description: "Earning details",
			// notes: "",
			auth: {
				strategies: ["SuperAdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: commonValidator.validateUserId,
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
		path: `${config.SERVER.API_BASE_URL}/superAdmin/renewalSubscription`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let payload: CompanyId = request.payload;
			try {
				let result = await superAdminController.renewalSubscription({ ...tokenData, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "superAdmin"],
			description: "Renewal Subscription",
			// notes: "",
			auth: {
				strategies: ["SuperAdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				payload: commonValidator.validateCompanyId,
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
		path: `${config.SERVER.API_BASE_URL}/superAdmin/dashboard`,
		handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
			let tokenData: TokenData = request.auth.credentials.tokenData;
			let query: ListingRequest = request.query;
			try {
				let result = await superAdminController.dashboard({ ...tokenData, ...query });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "superAdmin"],
			description: "Dashboard company List",
			// notes: "",
			auth: {
				strategies: ["SuperAdminAuth"]
			},
			validate: {
				headers: commonValidator.adminAuthorizationHeaderObj,
				query: superAdminValidator.validateDashboardCompany,
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