"use strict";
import { Model } from "mongoose";

import { BaseDao } from "@modules/v1/shared/BaseDao";
import * as appUtils from "@utils/appUtils";
import * as models from "@modules/v1/models";

export class NotificationDao extends BaseDao {
	public web_notification: Model<models.IWebNotification> = models.web_notifications;
	public notification: Model<models.INotification> = models.notifications;

	/**
	 * @function addNotification
	 */
	async addNotification(params: AddNotificationRequest) {
		try {
			return await this.save("notifications", params);
		} catch (error) {
			throw error;
		}
	}

	async addWebNotification(params: AddNotificationRequest) {
		try {
			return await this.save("web_notifications", params);
		} catch (error) {
			throw error;
		}
	}
	/**
	 * @function notificationList
	 */
	async notificationList(params: TokenData) {
		try {
			let query: any = {};
			query.receiverId = params.userId;
			query.deviceId = params.deviceId;

			return await this.findWithPaginate("notifications", query, {}, {}, params);
		} catch (error) {
			throw error;
		}
	}
	async notificationData(params: ListingRequest) {
		try {
			let { pageNo, limit } = params;
			let aggPipe = [];
			let match1: any = {};
			match1.receiverId = appUtils.toObjectId(params.userId);
			aggPipe.push({ "$match": match1 });
			aggPipe.push({ "$addFields": { created: { "$subtract": ["$createdAt", new Date("1970-01-01")] } } });
			let lookup = {
				"from": "users_new",
				"localField": "senderId",
				"foreignField": "_id",
				"as": "notifications"
			};
			aggPipe.push({ "$lookup": lookup });

			// aggPipe.push({ "$unwind": "$notifications" });
			aggPipe.push({ $unwind: { path: "$notifications", preserveNullAndEmptyArrays: true } });
			let project = { createdAt: 1, profilePicture: "$notifications.profilePicture", name: "$notifications.name", senderId: 1, notificationType: 1, isRead: 1, _id: 1, title: 1, created: 1, message: 1 };
			aggPipe.push({ "$project": project });

			let sort = {};
			sort = { "createdAt": -1 };
			aggPipe.push({ "$sort": sort });
			return await appUtils.paginate(this.notification, aggPipe, limit, pageNo);
		} catch (error) {
			throw error;
		}
	}
	/**
	 * @function webNotificationList
	 */
	async webNotificationList(params: ListingRequest) {
		try {
			let { searchKey, sortBy, sortOrder, status, fromDate, toDate } = params;
			// let query: any = {};
			// query.receiverId = params.userId;
			// query.deviceId = params.deviceId;
			let { pageNo, limit } = params;
			let aggPipe = [];

			let match1: any = {};
			match1.receiverId = appUtils.toObjectId(params.userId);
			aggPipe.push({ "$match": match1 });
			aggPipe.push({ "$addFields": { created: { "$subtract": ["$createdAt", new Date("1970-01-01")] } } });
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
			let project = { _id: 1, title: 1, image: 1, created: 1, message: 1 };
			aggPipe.push({ "$project": project });

			let sort = {};
			sort = { "createdAt": -1 };
			aggPipe.push({ "$sort": sort });
			return await appUtils.paginate(this.web_notification, aggPipe, limit, pageNo);
			// return await this.findWithPaginate("web_notifications", query, {}, {}, params);
		} catch (error) {
			throw error;
		}
	}
}