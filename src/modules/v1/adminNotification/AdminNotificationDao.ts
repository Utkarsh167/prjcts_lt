"use strict";

import * as _ from "lodash";
import { Model } from "mongoose";

import * as appUtils from "@utils/appUtils";
import { BaseDao } from "@modules/v1/shared/BaseDao";
import * as models from "@modules/v1/models";

export class AdminNotificationDao extends BaseDao {

	public adminNotification: Model<models.IAdminNotification> = models.admin_notifications;

	/**
	 * @function findNotificationById
	 */
	async findNotificationById(params: NotificationId) {
		let query: any = {};
		query._id = params.notificationId;

		let projection = { createdAt: 0, updatedAt: 0 };

		let options: any = { lean: true };

		return await this.findOne("admin_notifications", query, projection, options);
	}

	/**
	 * @function addNotification
	 */
	async addNotification(params: AddAdminNotificationRequest) {
		return await this.save("admin_notifications", params);
	}

	/**
	 * @function updateNotificationCount
	 */
	async updateNotificationCount(params: EditAdminNotificationRequest) {
		let query: any = {};
		query._id = params.notificationId;

		let update = {};
		update["$set"] = {
			sentCount: params.sentCount,
			targetAudience: params.targetAudience,
			audience: params.audience,
		};

		return await this.updateOne("admin_notifications", query, update, {});
	}

	/**
	 * @function notificationList
	 */
	async notificationList(params: ListingRequest) {
		let aggPipe = [];

		if (params.searchKey) {
			let match1: any = {};
			match1.title = { "$regex": params.searchKey, "$options": "-i" };
			aggPipe.push({ "$match": match1 });
		}

		aggPipe.push({ "$addFields": { created: { "$subtract": ["$createdAt", new Date("1970-01-01")] } } });
		let match4: any = {};
		if (params.fromDate && !params.toDate) {
			match4.created = { "$gte": params.fromDate };
			aggPipe.push({ "$match": match4 });
		}

		let match5: any = {};
		if (params.toDate && !params.fromDate) {
			match5.created = { "$lte": params.toDate };
			aggPipe.push({ "$match": match5 });
		}

		let match6: any = {};
		if (params.fromDate && params.toDate) {
			match6.created = { "$gte": params.fromDate, "$lte": params.toDate };
			aggPipe.push({ "$match": match6 });
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
	}

	/**
	 * @function deleteNotification
	 */
	async deleteNotification(params: NotificationId) {
		let query: any = {};
		query._id = params.notificationId;

		return await this.remove("admin_notifications", query);
	}

	/**
	 * @function editNotification
	 */
	async editNotification(params: EditAdminNotificationRequest) {
		let query: any = {};
		query._id = params.notificationId;

		let set = {};
		let unset = {};
		let update = {};
		update["$set"] = set;

		let fieldsToFill = ["image", "title", "link", "message"];
		set = appUtils.setInsertObject(params, set, fieldsToFill);

		unset = appUtils.unsetInsertObject(params, unset, fieldsToFill);
		if (!_.isEmpty(unset)) {
			update["$unset"] = unset;
		}

		let options = { new: true };

		return await this.findOneAndUpdate("admin_notifications", query, update, options);
	}
}