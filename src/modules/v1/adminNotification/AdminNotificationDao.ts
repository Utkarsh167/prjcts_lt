"use strict";

import * as _ from "lodash";
import { Model } from "mongoose";

import * as appUtils from "@utils/appUtils";
import { BaseDao } from "@modules/v1/shared/BaseDao";
import * as models from "@modules/v1/models";
// import { config } from "exceljs";
import * as config from "@config/constant";

export class AdminNotificationDao extends BaseDao {

	public adminNotification: Model<models.IAdminNotification> = models.admin_notifications;

	/**
	 * @function findNotificationById
	 */
	async findNotificationById(params: NotificationId) {
		try {
			let query: any = {};
			query._id = params.notificationId;

			let projection = { createdAt: 0, updatedAt: 0 };

			let options: any = { lean: true };

			return await this.findOne("admin_notifications", query, projection, options);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function addNotification
	 */
	async addNotification(params: AddAdminNotificationRequest) {
		try {
			return await this.save("admin_notifications", params);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function updateNotificationCount
	 */
	async updateNotificationCount(params: EditAdminNotificationRequest) {
		try {
			let query: any = {};
			query._id = params.notificationId;

			let update = {};
			update["$set"] = {
				sentCount: params.sentCount
			};

			return await this.updateOne("admin_notifications", query, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function notificationList
	 */
	async notificationList(params: ListingRequest) {
		try {
			let { pageNo, limit, searchKey, sortBy, fromDate, toDate, scheduleFromDate, scheduleToDate, companyId } = params;
			let aggPipe = [];
			let match: any = {};
			// Changed from ADMIN to SUPER_ADMIN in if cond Aashiq - 18/08/2020
			if (params.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN) {
				match = { "$and": [{ "type": { "$eq": config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN } }, { "companyId": { "$eq": appUtils.toObjectId(params.companyId) } }] };
			} else {
				match = { "$and": [{ "type": { "$ne": config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN } }, { "createdBy": { "$eq": appUtils.toObjectId(params.userId) } }, { "companyId": { "$eq": appUtils.toObjectId(params.companyId) } }] };
			}
			// match = { "$and": [{ "type": { "$ne": config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN } }, { "createdBy": { "$eq": appUtils.toObjectId(params.userId) } }, { "companyCode": { "$eq": params.companyCode } }] };
			aggPipe.push({ "$match": match });
			if (params.searchKey) {
				let match1: any = {};
				match1.title = { "$regex": params.searchKey, "$options": "-i" };
				aggPipe.push({ "$match": match1 });
			}
			aggPipe.push({ "$addFields": { created: { "$subtract": ["$createdAt", new Date("1970-01-01")] } } });
			let match2: any = {};
			if (fromDate && !toDate) {
				match2.created = { "$gte": fromDate };
				aggPipe.push({ "$match": match2 });
			}

			let match3: any = {};
			if (toDate && !fromDate) {
				match3.created = { "$lte": toDate };
				aggPipe.push({ "$match": match3 });
			}

			let match4: any = {};
			if (fromDate && toDate) {
				match4.created = { "$gte": fromDate, "$lte": toDate };
				aggPipe.push({ "$match": match4 });
			}
			let match5: any = {};
			if (scheduleFromDate && !scheduleToDate) {
				match5.scheduleTime = { "$gte": scheduleFromDate };
				aggPipe.push({ "$match": match5 });
			}

			let match6: any = {};
			if (scheduleToDate && !scheduleFromDate) {
				match6.scheduleTime = { "$lte": scheduleToDate };
				aggPipe.push({ "$match": match6 });
			}

			let match7: any = {};
			if (scheduleFromDate && scheduleToDate) {
				match7.scheduleTime = { "$gte": scheduleFromDate, "$lte": scheduleToDate };
				aggPipe.push({ "$match": match7 });
			}
			let sort = {};
			if (params.sortBy && params.sortOrder) {
				if (params.sortBy === "title") {
					sort = { "title": params.sortOrder };
				} else if (params.sortBy === "sentCount") {
					sort = { "sentCount": params.sortOrder };
				} else {
					sort = { "created": params.sortOrder };
				}
			} else {
				sort = { "createdAt": -1 };
			}
			aggPipe.push({ "$sort": sort });

			return await appUtils.paginate(this.adminNotification, aggPipe, params.limit, params.pageNo);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function deleteNotification
	 */
	async deleteNotification(params: NotificationId) {
		try {
			let query: any = {};
			query._id = params.notificationId;

			return await this.remove("admin_notifications", query);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function editNotification
	 */
	async editNotification(params: EditAdminNotificationRequest) {
		try {
			let query: any = {};
			query._id = params.notificationId;

			let set = {};
			let unset = {};
			let update = {};
			update["$set"] = set;

			let fieldsToFill = ["title", "scheduleTime", "message", "audience", "scheduleType"];
			set = appUtils.setInsertObject(params, set, fieldsToFill);

			unset = appUtils.unsetInsertObject(params, unset, fieldsToFill);
			if (!_.isEmpty(unset)) {
				update["$unset"] = unset;
			}

			let options = { new: true };

			return await this.findOneAndUpdate("admin_notifications", query, update, options);
		} catch (error) {
			throw error;
		}
	}
}
