"use strict";

import * as notificationConstant from "@modules/v1/notification/notificationConstant";
import { NotificationDao } from "@modules/v1/notification/NotificationDao";
import * as config1 from "@config/environment";
const axios = require('axios');

let notificationDao = new NotificationDao();

/**
 * @function notificationList
 */
const notificationList = async function (params: ListingRequest) {
	try {
		let step1 = await notificationDao.notificationData(params);
		return notificationConstant.MESSAGES.SUCCESS.NOTIFICATION_LIST({ "notificationList": step1.data });
	} catch (error) {
		throw error;
	}
};
const webNotificationList = async function (params: ListingRequest) {
	try {
		let step1 = await notificationDao.webNotificationList(params);
		return notificationConstant.MESSAGES.SUCCESS.NOTIFICATION_LIST({ "notificationList": step1.data, "totalCount": step1.total });
	} catch (error) {
		throw error;
	}
};

// const voiceCalling = async function (params: VoiceCallRequest) {
// 	try {
// 		const headers = {
// 			'Content-Type': 'application/x-www-form-urlencoded',
// 			'Accept': 'application/json',
// 		};
// 		let param: any = {};
// 		param.apiKey = config1.SERVER.API_KEY_YAKO_VOICE;
// 		param.clientId = config1.SERVER.CLIENT_ID_YAKO_VOICE;
// 		param.callerId = config1.SERVER.CALLER_ID_YAKO_VOICE;
// 		param.CallingAgentNumber = params.callingAgentNumber;
// 		param.CalledPartyNumber = params.calledPartyNumber;
// 		param.callType = config1.SERVER.CALL_TYPE_YAKO_VOICE;
// 		let response = await axios.post(`${config1.SERVER.YAKO_VOICE_URL}`, param, headers);
// 		return notificationConstant.MESSAGES.SUCCESS.VOICE_CALL_SUCCESS;
// 	} catch (error) {
// 		throw error;
// 	}
// };

export let notificationController = {
	notificationList,
	webNotificationList,
	// voiceCalling
};