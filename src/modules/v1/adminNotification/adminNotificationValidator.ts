"use strict";

import * as Joi from "joi";

import { fieldsValidator } from "@utils/fieldsValidator";

let validateAddEditNotification = Joi.object({
	// image: fieldsValidator.image["optional"],
	title: fieldsValidator.title["required"],
	// link: fieldsValidator.link["optional"],
	message: fieldsValidator.message["required"],
	scheduleType: fieldsValidator.notificationScheduleType,
	audience: fieldsValidator.notificationAudience,
	scheduleTime: fieldsValidator.scheduleTime,
	// appPlatform: fieldsValidator.appPlatform["required"],
	// fromDate: fieldsValidator.fromDate,
	// toDate: fieldsValidator.toDate,
	// gender: fieldsValidator.gender["required"]
}).unknown();
let validateEditNotification = Joi.object({
	// image: fieldsValidator.image["optional"],
	title: fieldsValidator.title["required"],
	// link: fieldsValidator.link["optional"],
	message: fieldsValidator.message["required"],
	scheduleType: fieldsValidator.notificationScheduleType,
	audience: fieldsValidator.notificationAudience,
	scheduleTime: fieldsValidator.scheduleTime,
	notificationId: fieldsValidator.notificationId,
	// appPlatform: fieldsValidator.appPlatform["required"],
	// fromDate: fieldsValidator.fromDate,
	// toDate: fieldsValidator.toDate,
	// gender: fieldsValidator.gender["required"]
}).unknown();

let validateNotificationList = Joi.object({
	pageNo: fieldsValidator.pageNo,
	limit: fieldsValidator.limit,
	searchKey: Joi.string().optional().description("Search by title"),
	sortBy: Joi.string().trim().valid("title", "sentCount", "created").optional().description("title, sentCount, created"),
	sortOrder: fieldsValidator.sortOrder,
	fromDate: fieldsValidator.fromDate,
	toDate: fieldsValidator.toDate,
	scheduleFromDate: fieldsValidator.fromDate,
	scheduleToDate: fieldsValidator.toDate,
}).unknown();

let validateSendOneToOneNotification = Joi.object({
	title: fieldsValidator.title["required"],
	link: fieldsValidator.link["optional"],
	message: fieldsValidator.message["required"]
}).unknown();

export {
	validateAddEditNotification,
	validateNotificationList,
	validateSendOneToOneNotification,
	validateEditNotification
};