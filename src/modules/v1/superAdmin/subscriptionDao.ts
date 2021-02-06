"use strict";

import * as _ from "lodash";
import { Model } from "mongoose";

import * as appUtils from "@utils/appUtils";
import { BaseDao } from "@modules/v1/shared/BaseDao";
import * as config from "@config/constant";
import * as models from "@modules/v1/models";

export class SubscriptionDao extends BaseDao {

	public subscription: Model<models.ISubscription> = models.subscriptions;

	/**
	 * @function createSubscription
	 */
	async createSubscription(params: CreateSubscriptionRequest) {
		return await this.save("subscriptions", params);
	}

	/**
	 * @function editSubscription
	 */
	async editSubscription(params: CreateSubscriptionRequest) {
		let query: any = {};
		query._id = params.subscriptionId;
		let set = {};
		let update = {};
		update["$set"] = set;

		let fieldsToFill = ["name", "price", "description", "year", "month", "gracePeriod", "createdBy", "expiryDate"];
		set = appUtils.setInsertObject(params, set, fieldsToFill);
		return await this.updateOne("subscriptions", query, update, {});
	}
	/**
	 * @function blockUnblock
	 */
	async blockUnblock(params: BlockRequest) {
		let query: any = {};
		query._id = params.subscriptionId;

		let update = {};
		update["$set"] = {
			status: params.status
		};

		return await this.updateOne("subscriptions", query, update, {});
	}

	/**
	 * @function subscriptionList
	 * @description subscription plan list without pagination
	 */
	async subscriptionList(params: ListingRequest) {
		let { pageNo, type, limit, searchKey, sortBy, sortOrder, status, fromDate, toDate } = params;
		let aggPipe = [];

		let match1: any = {};
		if (type === "all") {
			match1["$and"] = [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }];
		} else {
			match1["$and"] = [{ "status": { "$eq": config.CONSTANT.STATUS.UN_BLOCKED } }];
		}
		aggPipe.push({ "$match": match1 });

		let match2 = {};
		if (searchKey) {
			match2["$or"] = [
				{ "name": { "$regex": searchKey, "$options": "-i" } },
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
		let sort = {};
		if (sortBy && sortOrder) {
			if (sortBy === "name") {
				sort = { "name": sortOrder };
			} else if (sortBy === "gracePeriod") {
				sort = { "gracePeriod": sortOrder };
			} else if (sortBy === "price") {
				sort = { "price": sortOrder };
			} else {
				sort = { "created": sortOrder };
			}
		} else {
			sort = { "createdAt": -1 };
		}
		aggPipe.push({ "$sort": sort });
		// if (pageNo && limit) {
		// 	let skip = (pageNo - 1) * limit;
		// 	aggPipe.push({ "$skip": skip });
		// 	aggPipe.push({ "$limit": limit });
		// }
		let project = {
			_id: 1, created: 1,
			totalSubscribers: 1, status: 1, name: 1, price: 1, description: 1, gracePeriod: 1, validity: 1
		};
		aggPipe.push({ "$project": project });
		let option = { collation: { locale: "en", strength: 2 } };
		let response: any = {};
		let subscriptionList = this.aggregate("subscriptions", aggPipe, {});
		let totalCount = this.count('subscriptions', { ...match1, ...match2, ...match3 });
		response = Promise.all([subscriptionList, totalCount]);
		return response;
	}
	/**
	 * findSubscriptionById
	 * @param params subscriptionId
	 */
	async findSubscriptionById(params: TokenData) {
		let query: any = {};
		query._id = params.subscriptionId;
		query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

		let projection = {};

		return await this.findOne("subscriptions", query, projection, {});
	}
	/**
	 * @function earningList
	 */
	async earningList(params: ListingRequest) {
		let { pageNo, limit, searchKey, sortBy, sortOrder, status, fromDate, toDate } = params;
		let aggPipe = [];

		let match1: any = {};
		match1["$and"] = [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "adminType": { "$eq": config.CONSTANT.ADMIN_TYPE.ADMIN } }];
		aggPipe.push({ "$match": match1 });

		let match2 = {};
		if (searchKey) {
			match2["$or"] = [
				{ "name": { "$regex": searchKey, "$options": "-i" } },
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
			_id: 1, created: 1, name: 1, companyCode: 1, paymentType: 1, companyId: 1, totalAmount: 1, "paymentDate": "$plane.paymentDate", "plan": "$plane.name", "amount": "$plane.price"
		};
		aggPipe.push({ "$project": project });
		let option = { collation: { locale: "en", strength: 2 } };
		let response: any = {};
		let companyList = this.aggregate("admins", aggPipe, {});
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
		let totalamount = this.aggregate("admins", planeamountPipe, options);
		// console.log("totalamount============" + JSON.stringify(totalamount[0].totalAmount));
		let totalCount = this.count('admins', { ...match1, ...match2, ...match3, ...match4, ...match5, ...match6 });
		response = Promise.all([companyList, totalCount, totalamount]);
		return response;
	}
	/**
	 * earningDetails
	 * @param params companyId
	 */
	async earningDetails(params: TokenData) {
		let aggPipe = [];

		let match1: any = {};
		match1["$and"] = [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "_id": { "$eq": appUtils.toObjectId(params.userId) } }, { "adminType": { "$eq": config.CONSTANT.ADMIN_TYPE.ADMIN } }];
		aggPipe.push({ "$match": match1 });
		let project = {
			_id: 1, created: 1, name: 1, companyCode: 1, paymentType: 1, companyId: 1, totalAmount: 1, "paymentDate": "$plane.paymentDate", "plan": "$plane.name", "amount": "$plane.price"
		};
		aggPipe.push({ "$project": project });
		let option = { collation: { locale: "en", strength: 2 } };
		let response: any = {};
		let companyList = this.aggregate("admins", aggPipe, {});
		return companyList;
	}

	/**
	 * @function subscribedUsers
	 */
	async subscribedUsers(params: ListingRequest) {
		let { pageNo, limit, searchKey, sortBy, sortOrder, status, fromDate, toDate, subscriptionId } = params;
		let aggPipe = [];

		let match1: any = {};
		match1["$and"] = [{ "status": { "$ne": config.CONSTANT.STATUS.DELETED } }, { "plane._id": { "$eq": appUtils.toObjectId(params.subscriptionId) } }, { "adminType": { "$eq": config.CONSTANT.ADMIN_TYPE.ADMIN } }];
		aggPipe.push({ "$match": match1 });

		let match2 = {};
		if (searchKey) {
			match2["$or"] = [
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
			_id: 1, created: 1, status: 1, name: 1, email: 1, companyCode: 1, paymentType: 1, companyId: 1, totalAmount: 1, "paymentDate": "$plane.paymentDate", "plan": "$plane.name", "amount": "$plane.price"
		};
		aggPipe.push({ "$project": project });
		let option = { collation: { locale: "en", strength: 2 } };
		let response: any = {};
		let companyList = this.aggregate("admins", aggPipe, {});
		let totalCount = this.count('admins', { ...match1, ...match2, ...match3, ...match4, ...match5, ...match6 });
		response = Promise.all([companyList, totalCount]);
		return response;
	}

	async renewalSubscription(params: TokenData) {
		let query: any = {};
		query._id = params.companyId;
		let projection = { plane: 1 };
		let subscriptionPlane = await this.findOne("admins", query, projection, {});
		let subscription = subscriptionPlane.plane;
		let yearMonth = subscription.year * 12;
		let totalMonth = subscription.month + yearMonth;
		let CurrentDate = new Date();
		let expiryDate = CurrentDate.setMonth(CurrentDate.getMonth() + totalMonth);
		// params.expiryDate = expiryDate;
		let newExpiry = new Date(expiryDate);
		let expiryEndDate = newExpiry.setDate(newExpiry.getDate() + subscription.gracePeriod);
		let update = {};
		update["$set"] = { "plane.expiryDate": expiryDate, "plane.expiryEndDate": expiryEndDate };
		return await this.updateMany("admins", query, update, {});
	}
}