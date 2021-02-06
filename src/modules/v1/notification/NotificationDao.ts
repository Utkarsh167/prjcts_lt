"use strict";

import { BaseDao } from "@modules/v1/shared/BaseDao";

export class WebNotificationDao extends BaseDao {

	/**
	 * @function addNotification
	 */
	async addNotification(params: AddNotificationRequest) {
		return await this.save("web_notifications", params);
	}

	/**
	 * @function notificationList
	 */
	async notificationList(params: TokenData) {
		let query: any = {};
		query.receiverId = params.userId;
		query.deviceId = params.deviceId;

		return await this.findWithPaginate("web_notifications", query, {}, {}, params);
	}
}