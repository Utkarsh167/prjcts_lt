"use strict";

import * as Joi from "joi";

import { fieldsValidator } from "@utils/fieldsValidator";

let validateReschedule = Joi.object({
	shiftName: Joi.string().required("shift name"),
	shiftType: fieldsValidator.shiftType,
	shiftTime: Joi.string().required("start shift or end shift"),
	rosterId: fieldsValidator.rosterId,
	reason: Joi.string().optional(),
	noShowReason: Joi.string().optional(),
}).unknown();
let validateRescheduleList = Joi.object({
	pageNo: fieldsValidator.pageNo,
	limit: fieldsValidator.limit,
	sortOrder: fieldsValidator.sortOrder,
	status: fieldsValidator.rescheduleStatus["optional"],
	fromDate: fieldsValidator.fromDate,
	toDate: fieldsValidator.toDate,
}).unknown();
let validateCancelledList = Joi.object({
	pageNo: fieldsValidator.pageNo,
	limit: fieldsValidator.limit,
	sortOrder: fieldsValidator.sortOrder,
	// status: fieldsValidator.rescheduleStatus["optional"],
	fromDate: fieldsValidator.fromDate,
	toDate: fieldsValidator.toDate,
}).unknown();
let rescheduleCancel = Joi.object({
	rescheduleId: fieldsValidator.rescheduleId,
}).unknown();
let rescheduleAccept = Joi.object({
	rescheduleId: fieldsValidator.rescheduleId,
	cabId: Joi.string().optional(),
	driverId: Joi.string().optional()
}).unknown();

export {
	validateReschedule,
	validateRescheduleList,
	rescheduleCancel,
	rescheduleAccept,
	validateCancelledList
};