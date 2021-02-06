"use strict";

import * as _ from "lodash";
import { Model } from "mongoose";

import * as appUtils from "@utils/appUtils";
import { BaseDao } from "@modules/v1/shared/BaseDao";
import * as config from "@config/constant";
import * as models from "@modules/v1/models";

export class SuperAdminDao extends BaseDao {

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
		query.adminType = config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN;

		return await this.findOne("admins", query, {}, {});
	}
	/**
	 * @function isCompanyEmailExists
	 * @param params email
	 */
	async isCompanyEmailExists(params) {
		let query: any = {};
		query.email = params.email;
		query.status = { "$ne": config.CONSTANT.STATUS.DELETED };
		query.adminType = { "$ne": config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN };

		return await this.findOne("admins", query, {}, {});
	}
	/**
	 * @function isCompanyEmailExists
	 * @param params email
	 */
	async isCompanyEmailOrUrlExists(params) {
		let query: any = {};
		query = { $or: [{ ["email"]: params.email }, { url: params.url }] };
		query.status = { "$ne": config.CONSTANT.STATUS.DELETED };
		query.adminType = { "$ne": config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN };

		return await this.findOne("admins", query, {}, {});
	}
	async isCompanyTypeExists(params) {
		let query: any = {};
		query.companyType = params.companyType;
		query.status = { "$ne": config.CONSTANT.STATUS.DELETED };
		return await this.findOne("company_types", query, {}, {});
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
	 * @function findAdminById
	 */
	async findCompanyById(params: TokenData) {
		let query: any = {};
		query._id = params.userId;
		query.status = { "$ne": config.CONSTANT.STATUS.DELETED };
		query.adminType = { "$ne": config.CONSTANT.ADMIN_TYPE.ADMIN };
		let projection = { loginAttempts: 0, accessToken: 0 };
		return await this.findOne("admins", query, projection, {});
	}

	/**
	 * @function createCompanyAdmin
	 */
	async createCompanyAdmin(params: CreateCompanyRequest) {
		let query: any = {};
		let query1: any = {};
		let projection = {};
		query._id = params.planeId;
		query1._id = params.companyType;
		let location: any = {};
		location.address = params.address;
		location.coordinates = [params.longitude, params.latitude];
		params.companyBranch = location;
		params.companyAddress = location;
		if (params.companyType) {
			let companyType = await this.findOne("company_types", query1, projection, {});
			let compantData: any = {};
			compantData = {
				_id: companyType._id,
				type: companyType.companyType
			};
			params.companyType = compantData;
		}
		if (params.planeId) {
			let subscription = await this.findOne("subscriptions", query, projection, {});
			let yearMonth = subscription.year * 12;
			let totalMonth = subscription.month + yearMonth;
			let CurrentDate = new Date();
			let expiryDate = CurrentDate.setMonth(CurrentDate.getMonth() + totalMonth);
			// params.expiryDate = expiryDate;
			let newExpiry = new Date(expiryDate);
			let expiryEndDate = newExpiry.setDate(newExpiry.getDate() + subscription.gracePeriod);
			// params.expiryEndDate = expiryEndDate;
			params.plane = {
				_id: subscription._id,
				name: subscription.name,
				price: subscription.price,
				description: subscription.description,
				gracePeriod: subscription.gracePeriod,
				year: subscription.year,
				month: subscription.month,
				expiryDate: expiryDate,
				expiryEndDate: expiryEndDate,
				paymentDate: Date.now(),
			};
			let update = {};
			update["$inc"] = {
				totalSubscribers: 1,
			};
			await this.updateOne("subscriptions", query, update, {});
			params.totalAmount = subscription.price;
		}

		return await this.save("admins", params);
	}
	/**
	 * createCompanyType
	 * @param params companyType
	 */
	async createCompanyType(params: CompanyTypeRequest) {
		return await this.save("company_types", params);
	}

	/**
	 * @function blockUnblock
	 */
	async blockUnblock(params: BlockRequest) {
		let query: any = {};
		query._id = params.userId;

		let update = {};
		update["$set"] = {
			status: params.status
		};

		return await this.updateOne("admins", query, update, {});
	}

	/**
	 * @function changePassword
	 */
	async changePassword(params: ChangeForgotPasswordRequest | ChangePasswordRequest) {
		let query: any = {};
		query._id = params.userId;

		let update = {};
		update["$set"] = {
			"hash": params.hash
		};

		return await this.updateOne("admins", query, update, {});
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

	/**
	 * @function logout
	 */
	async logout(params: TokenData) {
		let query: any = {};
		query._id = params.userId;

		let update = {};
		update["$set"] = {
			"isLogin": false,
			"lastLogout": Date.now()
		};

		return await this.update("admins", query, update, {});
	}

	/**
	 * @function editProfile
	 */
	async editProfile(params: EditProfileRequest) {
		let query: any = {};
		query._id = params.userId;
		let update = {};
		update["$set"] = {
			"name": params.name,
			"email": params.email,
		};
		let options = {};
		return await this.findOneAndUpdate("admins", query, update, options);
	}

	async isCompanyExist(params: IsCompanyUnique) {
		let query: any = {};
		query["$and"] = [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "adminType": { "$eq": config.CONSTANT.ADMIN_TYPE.ADMIN } }, { "companyCode": { "$eq": params.companyCode } }];
		let projection = { loginAttempts: 0, accessToken: 0 };
		return await this.findOne("admins", query, projection, {});
	}
	/**
	 * Subscription unique check
	 */
	async isSubscriptionUnique(params: IsSubscriptionUnique) {
		let query: any = {};
		query["$and"] = [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "name": { "$eq": params.name } }];
		let projection = {};
		return await this.findOne("subscriptions", query, projection, {});
	}
	/**
	 * @function companyList
	 */
	async companyList(params: ListingRequest) {
		let { companyType, pageNo, limit, searchKey, sortBy, sortOrder, status, fromDate, toDate } = params;
		let aggPipe = [];

		let match1: any = {};
		match1["$and"] = [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "adminType": { "$eq": config.CONSTANT.ADMIN_TYPE.ADMIN } }];
		aggPipe.push({ "$match": match1 });

		let match2 = {};
		if (searchKey) {
			match2["$or"] = [
				{ "companyCode": { "$regex": searchKey, "$options": "-i" } },
				{ "name": { "$regex": searchKey, "$options": "-i" } },
				{ "email": { "$regex": searchKey, "$options": "-i" } },
			];
			aggPipe.push({ "$match": match2 });
		}
		let match3: any = {};
		if (status) {
			match3.status = { "$eq": status };
			aggPipe.push({ "$match": match3 });
		}

		let match4: any = {};
		if (fromDate && !toDate) {
			match4.created = { "$gte": fromDate };
			aggPipe.push({ "$match": match4 });
		}

		let match5: any = {};
		if (toDate && !fromDate) {
			match5.created = { "$lte": toDate };
			aggPipe.push({ "$match": match5 });
		}

		let match6: any = {};
		if (fromDate && toDate) {
			match6.created = { "$gte": fromDate, "$lte": toDate };
			aggPipe.push({ "$match": match6 });
		}
		let match7: any = {};

		aggPipe.push({ "$match": match7 });
		let match8: any = {};
		if (companyType) {
			match8["companyType._id"] = { "$eq": appUtils.toObjectId(companyType) };
			aggPipe.push({ "$match": match8 });
		}
		let sort = {};
		if (sortBy && sortOrder) {
			if (sortBy === "name") {
				sort = { "name": sortOrder };
			} else if (sortBy === "companyCode") {
				sort = { "companyCode": sortOrder };
			} else {
				sort = { "created": sortOrder };
			}
		} else {
			sort = { "createdAt": -1 };
		}
		aggPipe.push({ "$sort": sort });
		if (pageNo && limit) {
			let skip = (pageNo - 1) * limit;
			aggPipe.push({ "$skip": skip });
			aggPipe.push({ "$limit": limit });
		}
		let project = {
			_id: 1, created: 1,
			status: 1, adminType: 1, maxGroupRadius: 1, email: 1, name: 1, companyCode: 1, contactNumber: 1, companyType: 1, companyBranch: 1, totalEmp: 1, paymentType: 1, serverType: 1, url: 1, companyId: 1
		};
		aggPipe.push({ "$project": project });
		let option = { collation: { locale: "en", strength: 2 } };
		let response: any = {};
		let companyList = this.aggregate("admins", aggPipe, {});
		let totalCount = this.count('admins', { ...match1, ...match2, ...match3, ...match4, ...match5, ...match6, ...match8 });
		response = Promise.all([companyList, totalCount]);
		return response;
	}

	/**
	 * @function editCompany
	 */
	async editCompany(params: CreateCompanyRequest) {
		let query: any = {};
		query._id = params.userId;
		let query1: any = {};
		let projection = {};
		query1._id = params.companyType;
		let location: any = {};
		location.address = params.address;
		location.coordinates = [params.longitude, params.latitude];
		params.companyBranch = location;
		if (params.companyType) {
			let companyType = await this.findOne("company_types", query1, projection, {});
			let compantData: any = {};
			compantData = {
				_id: companyType._id,
				type: companyType.companyType
			};
			params.companyType = compantData;
		}
		// if (params.planeId) {
		// 	let subscription = await this.findOne("subscriptions", query1, projection, {});
		// 	params.plane = {
		// 		_id: subscription._id,
		// 		name: subscription.name,
		// 		price: subscription.price,
		// 		description: subscription.description,
		// 		gracePeriod: subscription.gracePeriod,
		// 		year: subscription.year,
		// 		month: subscription.month,
		// 		expiryDate: subscription.expiryDate,
		// 	};
		// }

		let set = {};
		let update = {};
		update["$set"] = set;

		let fieldsToFill = ["name", "companyCode", "contactNumber", "companyType", "companyBranch", "totalEmp", "paymentType", "serverType", "url"];
		set = appUtils.setInsertObject(params, set, fieldsToFill);

		return await this.updateOne("admins", query, update, {});
	}
	/**
	 * @function companyTypeList
	 * @description companyTypelist without pagination
	 */
	async companyTypeList(params: ListingRequest) {
		let response: any = {};
		let projection = { createdBy: 0, created: 0, status: 0 };
		let subscriptionList = this.find("company_types", {}, projection, {});
		return subscriptionList;
	}

	/**
	 * @function dashboard
	 */
	async dashboard(params: ListingRequest) {
		let { pageNo, limit, searchKey, sortBy, sortOrder, status, fromDate, toDate } = params;
		let aggPipe = [];
		let CurrentDate = new Date();
		let currentMonth = CurrentDate.getTime();
		let afterOneMonth = CurrentDate.setMonth(CurrentDate.getMonth() + 1);
		let expiryDetails: any = {};
		let expired: any = {};
		let active: any = {};
		expired = { "plane.expiryDate": { "$lte": currentMonth } };
		active = { "plane.expiryDate": { "$gte": currentMonth }, "adminType": { "$eq": config.CONSTANT.ADMIN_TYPE.ADMIN } };
		expiryDetails = { "plane.expiryDate": { "$gte": currentMonth, "$lte": afterOneMonth } };
		let match1: any = {};
		match1["$and"] = [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "adminType": { "$eq": config.CONSTANT.ADMIN_TYPE.ADMIN } }];
		aggPipe.push({ "$match": match1 });

		let match2 = {};
		if (searchKey) {
			match2["$or"] = [
				{ "companyCode": { "$regex": searchKey, "$options": "-i" } },
				{ "name": { "$regex": searchKey, "$options": "-i" } },
				{ "email": { "$regex": searchKey, "$options": "-i" } },
			];
			aggPipe.push({ "$match": match2 });
		}
		let match3: any = {};
		if (status) {
			match3.status = { "$eq": status };
			aggPipe.push({ "$match": match3 });
		}

		let match4: any = {};
		if (fromDate && !toDate) {
			match4.created = { "$gte": fromDate };
			aggPipe.push({ "$match": match4 });
		}

		let match5: any = {};
		if (toDate && !fromDate) {
			match5.created = { "$lte": toDate };
			aggPipe.push({ "$match": match5 });
		}

		let match6: any = {};
		if (fromDate && toDate) {
			match6.created = { "$gte": fromDate, "$lte": toDate };
			aggPipe.push({ "$match": match6 });
		}
		let match7: any = {};

		aggPipe.push({ "$match": match7 });

		let sort = {};
		if (sortBy && sortOrder) {
			if (sortBy === "name") {
				sort = { "name": sortOrder };
			} else if (sortBy === "companyCode") {
				sort = { "companyCode": sortOrder };
			} else {
				sort = { "created": sortOrder };
			}
		} else {
			sort = { "createdAt": -1 };
		}
		aggPipe.push({ "$sort": sort });
		if (pageNo && limit) {
			let skip = (pageNo - 1) * limit;
			aggPipe.push({ "$skip": skip });
			aggPipe.push({ "$limit": limit });
		}
		let project = {
			_id: 1, created: 1,
			status: 1, adminType: 1, email: 1, name: 1, companyCode: 1, contactNumber: 1, companyType: 1, companyBranch: 1, totalEmp: 1, paymentType: 1, serverType: 1, url: 1, companyId: 1, "paymentDate": "$plane.paymentDate", "plan": "$plane.name", "amount": "$plane.price", "expiryDate": "$plane.expiryDate", "expiryEndDate": "$plane.expiryEndDate", "gracePeriod": "$plane.gracePeriod", "year": "$plane.year", "month": "$plane.month"
		};
		aggPipe.push({ "$project": project });
		let option = { collation: { locale: "en", strength: 2 } };
		let response: any = {};
		let companyList = this.aggregate("admins", aggPipe, {});
		let totalCount = this.count('admins', { ...match1, ...match2, ...match3, ...match4, ...match5, ...match6 });
		let totalCompany = this.count('admins', { ...match1 });
		let expiringInMonth = this.count('admins', expiryDetails);
		let expiredCompany = this.count('admins', expired);
		let activeCompany = this.count('admins', active);
		let totalEarning = this.totalEarning();
		response = Promise.all([companyList, totalCount, totalEarning, totalCompany, expiringInMonth, expiredCompany, activeCompany]);
		return response;
	}

	async totalEarning() {
		let planeamountPipe = [];
		planeamountPipe.push({
			$group: {
				_id: null,
				totalAmount: { $sum: "$totalAmount" },
			}
		},
			{
				$project: {
					_id: 0,
					totalAmount: '$totalAmount',
				}
			}
		);
		let options: any = { lean: true };
		let totalamount = await this.aggregate("admins", planeamountPipe, options);
		return totalamount[0].totalAmount;
	}
}