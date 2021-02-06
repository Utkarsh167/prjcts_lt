"use strict";

import * as Joi from "joi";

import { fieldsValidator } from "@utils/fieldsValidator";

let validateNotificationList = Joi.object({
	pageNo: fieldsValidator.pageNo,
	limit: fieldsValidator.limit
}).unknown();

export {
	validateNotificationList
};