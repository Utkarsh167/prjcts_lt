"use strict";

import * as notificationConstant from "@modules/v1/notification/notificationConstant";
import { WebNotificationDao } from "@modules/v1/notification/NotificationDao";

let webNotificationDao = new WebNotificationDao();

/**
 * @function notificationList
 */
const notificationList = async function (params: ListingRequest) {
	try {
		let step1 = await webNotificationDao.notificationList(params);
		return notificationConstant.MESSAGES.SUCCESS.NOTIFICATION_LIST({ "notificationList": step1 });
	} catch (error) {
		throw error;
	}
};

export let notificationController = {
	notificationList
};