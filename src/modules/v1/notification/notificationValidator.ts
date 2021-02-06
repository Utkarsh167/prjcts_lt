"use strict";

import * as Joi from "joi";

import { fieldsValidator } from "@utils/fieldsValidator";

let validateNotificationList = Joi.object({
	pageNo: fieldsValidator.pageNo,
	limit: fieldsValidator.limit,
	fromDate: fieldsValidator.fromDate,
	toDate: fieldsValidator.toDate,
}).unknown();
let validateVoiceCall = Joi.object({
	callingAgentNumber: fieldsValidator.mobileNo["required"],
	calledPartyNumber: fieldsValidator.mobileNo["required"]
}).unknown();

export {
	validateNotificationList,
	validateVoiceCall
};