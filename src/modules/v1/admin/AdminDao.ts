"use strict";

import * as _ from "lodash";
import { Model } from "mongoose";

import * as appUtils from "@utils/appUtils";
import { BaseDao } from "@modules/v1/shared/BaseDao";
import * as config from "@config/constant";
import * as models from "@modules/v1/models";

export class AdminDao extends BaseDao {

	public admin: Model<models.IAdmin> = models.admins;

	/**
	 * @function isEmailExists
	 */
	async isEmailExists(params) {
		let query: any = {};
		query.email = params.email;
		if (params.userId) {
			query._id = { "$not": { "$eq": params.userId } };
		}
		query.status = { "$ne": config.CONSTANT.STATUS.DELETED };
		query.adminType = { "$eq": config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN };

		return await this.findOne("admins", query, {}, {});
	}

	async isCompanyTypeExists(params) {
		let query: any = {};
		query.companyType = params.companyType;
		query.status = { "$ne": config.CONSTANT.STATUS.DELETED };
		return await this.findOne("company_types", query, {}, {});
	}

	async createCompanyType(params) {
		return await this.save("company_types", params);
	}

	/**
	 * @function findAdminById
	 */
	async findAdminById(params: TokenData) {
		let query: any = {};
		query._id = params.userId;
		query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

		let projection = { loginAttempts: 0, accessToken: 0 };

		return await this.findOne("admins", query, projection, {});
	}

	/**
	 * @function expiredCompany
	 */
	async expiredCompany(params: TokenData) {
		let query: any = {};
		// query.status = { "$ne": config.CONSTANT.STATUS.DELETED };
		let CurrentDate = new Date();
		let currentMonth = CurrentDate.getTime();
		// let afterOneMonth = CurrentDate.setMonth(CurrentDate.getMonth() + 1);
		let expiryDetails: any = {};
		let expired: any = {};
		let active: any = {};
		query = { "$and": [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "plane.expiryDate": { "$lte": currentMonth } }, { "plane.expiryEndDate": { "$gte": currentMonth } }] };
		let projection = { email: 1, name: 1 };
		return await this.find("admins", query, projection, {});
	}

	/**
	 * @function createAdmin
	 */
	async createAdmin(params: CreateAdminRequest) {
		return await this.save("admins", params);
	}

	/**
	 * @function changePassword
	 */
	async changePassword(params: ChangeForgotPasswordRequest | ChangePasswordRequest) {
		let query: any = {};
		query._id = params.userId;
		let userData = await this.isTokenExist(params);
		if (userData.forgetToken) {
			let update = {};
			update["$set"] = {
				"hash": params.hash,
				"forgetToken": "",
			};

			return await this.updateOne("admins", query, update, {});
		} else {
			return Promise.reject(config.CONSTANT.MESSAGES.ERROR.TOKEN_EXPIRED);
		}
	}

	/**
	 * @function updateLoginHistory
	 */
	async updateLoginHistory(params) {
		let query: any = {};
		query._id = params.userId;

		let set = {};
		let update = {};
		update["$set"] = set;

		let fieldsToFill = ["isLogin", "lastLogin", "loginAttempts"];

		params = _.extend(params, { isLogin: true, lastLogin: Date.now() });
		set = appUtils.setInsertObject(params, set, fieldsToFill);

		update["$addToSet"] = {
			loginAttempts: [{
				"remoteAddress": params.remoteAddress,
				"platform": params.platform
			}]
		};

		return await this.updateOne("admins", query, update, {});
	}

	async getSingleUserDevice(params: AddAdminNotificationRequest) {
		let aggPipe = [];

		aggPipe.push({ "$addFields": { created: { "$subtract": ["$createdAt", new Date("1970-01-01")] } } });

		let lookup = {
			"from": "login_histories",
			"localField": "_id",
			"foreignField": "userId",
			"as": "admins"
		};
		aggPipe.push({ "$lookup": lookup });

		aggPipe.push({ "$unwind": "$admins" });

		let project1 = {
			_id: 1, isLogin: "$admins.isLogin", platform: "$admins.platform", deviceId: "$admins.deviceId",
			deviceToken: "$admins.deviceToken", arn: "$admins.arn", name: 1, gender: 1,
			created: 1, adminType: 1
		};
		aggPipe.push({ "$project": project1 });

		let match1: any = {};
		match1.isLogin = true;
		match1._id = appUtils.toObjectId(params.audience);
		match1.adminType = config.CONSTANT.ADMIN_TYPE.ADMIN;
		aggPipe.push({ "$match": match1 });
		return await this.aggregate("admins", aggPipe, {});
	}

	/**
	 * @function getChunksOfUser
	 */
	async getChunksOfUser(params: AddAdminNotificationRequest) {
		let aggPipe = [];

		aggPipe.push({ "$addFields": { created: { "$subtract": ["$createdAt", new Date("1970-01-01")] } } });

		let lookup = {
			"from": "login_histories",
			"localField": "_id",
			"foreignField": "userId",
			"as": "admins"
		};
		aggPipe.push({ "$lookup": lookup });

		aggPipe.push({ "$unwind": "$admins" });

		let project1 = {
			_id: 1, isLogin: "$admins.isLogin", platform: "$admins.platform", deviceId: "$admins.deviceId",
			deviceToken: "$admins.deviceToken", arn: "$admins.arn", name: 1, gender: 1,
			created: 1, adminType: 1
		};
		aggPipe.push({ "$project": project1 });

		let match1: any = {};
		match1.isLogin = true;
		match1.adminType = config.CONSTANT.ADMIN_TYPE.ADMIN;
		aggPipe.push({ "$match": match1 });
		return await this.aggregate("admins", aggPipe, {});
	}

	/**
	 * @function getChunksOfSingleUser
	 */
	async getChunksOfSingleUser() {
		let aggPipe = [];

		let lookup = {
			"from": "login_histories",
			"localField": "_id",
			"foreignField": "userId",
			"as": "admins"
		};
		aggPipe.push({ "$lookup": lookup });

		aggPipe.push({ "$unwind": "$admins" });

		let project = {
			_id: 1, isLogin: "$admins.isLogin", platform: "$admins.platform", deviceToken: "$admins.deviceToken",
			deviceId: "$admins.deviceId", arn: "$admins.arn", profilePicture: 1
		};
		aggPipe.push({ "$project": project });

		let match: any = {};
		match.isLogin = true;
		aggPipe.push({ "$match": match });

		aggPipe.push({
			"$group": {
				_id: "$_id", profilePicture: { "$first": "$profilePicture" },
				data: { "$push": { _id: "$_id", platform: "$platform", deviceToken: "$deviceToken", deviceId: "$deviceId", arn: "$arn" } }
			}
		});

		let response = await this.aggregate("admins", aggPipe, {});
		return response[0];
	}

	/**
	 * @function adminList
	 * @description adminList without pagination
	 */
	async adminList(params: ListingRequest) {
		let response: any = {};
		let query: any = {};
		query = {
			"$and": [{ "adminType": { "$eq": config.CONSTANT.ADMIN_TYPE.ADMIN } }, { "status": { "$ne": config.CONSTANT.STATUS.DELETED } }]
		};
		let projection = { name: 1 };
		let adminList = this.find("admins", query, projection, {});
		return adminList;
	}
	/**
	 * @function checkValidCompany
	 * @description User or employee can check our company registerd or not and expiry
	 */
	async checkValidCompany(params: CompanyCode) {
		let query: any = {};
		// query.status = { "$ne": config.CONSTANT.STATUS.DELETED };
		let CurrentDate = new Date();
		let currentMonth = CurrentDate.getTime();
		// let afterOneMonth = CurrentDate.setMonth(CurrentDate.getMonth() + 1);
		let expiryDetails: any = {};
		let expired: any = {};
		let active: any = {};
		query = { "$and": [{ "companyCode": { "$eq": params.companyCode } }, { "status": { "$eq": config.CONSTANT.STATUS.UN_BLOCKED } }, { "plane.expiryEndDate": { "$gte": currentMonth } }] };
		let projection = { url: 1, plane: 1 };
		return await this.find("admins", query, projection, {});
	}

	// Forgot passsword toke save
	async updateForgetPassword(tokenData, accessToken) {
		let query: any = {};

		query._id = tokenData.userId;

		let update: any = {};
		update['$set'] = {
			forgetToken: accessToken
		};

		let options: any = {};

		let response = await this.update('admins', query, update, options);

		return response;
	}

	async isTokenExist(userData) {
		let query: any = {};
		query._id = userData.userId;
		let projection: any = {};
		let options: any = {};
		let response = await this.findOne('admins', query, projection, options);
		return response;
	}
}