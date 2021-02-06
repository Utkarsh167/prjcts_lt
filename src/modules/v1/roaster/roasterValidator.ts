"use strict";

import * as Joi from "joi";

import { fieldsValidator } from "@utils/fieldsValidator";

let rosterData = Joi.object({
	cabId: fieldsValidator.cabId,
	// tripType: fieldsValidator.tripType,
	driverId: fieldsValidator.driverId,
	routeId: fieldsValidator.routeId,
}).unknown();

let validateRoasterAdd = Joi.object({
	// cabId: fieldsValidator.cabId,
	// // tripType: fieldsValidator.tripType,
	// driverId: fieldsValidator.driverId,
	// routeId: fieldsValidator.routeId,
	rosterData: Joi.array().items(rosterData).required(),
	validFrom: fieldsValidator.validFrom,
	validTill: fieldsValidator.validTill,
}).unknown();

let validateRoasterContinue = Joi.object({
	// cabId: fieldsValidator.cabId,
	// // tripType: fieldsValidator.tripType,
	// driverId: fieldsValidator.driverId,
	// routeId: fieldsValidator.routeId,
	// rosterData: Joi.array().items(rosterData).required(),
	validFrom: fieldsValidator.validFrom,
	validTill: fieldsValidator.validTill,
}).unknown();

let validateRoasterUpdate = Joi.object({
	cabId: fieldsValidator.cabId,
	rosterId: fieldsValidator.rosterId,
	driverId: fieldsValidator.driverId,
}).unknown();
let validateRoasterRating = Joi.object({
	rosterId: fieldsValidator.rosterId,
	rating: Joi.number().required().description("user rating"),
}).unknown();

let validateTripCancel = Joi.object({
	rosterId: fieldsValidator.rosterId,
	noShowReason: Joi.string().description("cancel reason"),
}).unknown();

let validateRoasterList = Joi.object({
	pageNo: fieldsValidator.pageNo,
	limit: fieldsValidator.limit,
	fromDate: fieldsValidator.fromDate,
	// toDate: fieldsValidator.toDate,
	tripStatus: fieldsValidator.tripStatus
}).unknown();
let validateRoasterReschedule = Joi.object({
	fromDate: fieldsValidator.fromDate,
}).unknown();
let validateRoasterEmpList = Joi.object({
	pageNo: fieldsValidator.pageNo,
	limit: fieldsValidator.limit,
	fromDate: fieldsValidator.fromDate,
	toDate: fieldsValidator.toDate,
}).unknown();
let validateTripType = Joi.object({
	tripType: fieldsValidator.tripType,
}).unknown();

let validateRosterList = Joi.object({
	pageNo: fieldsValidator.pageNo,
	limit: fieldsValidator.limit,
	// searchKey: Joi.string().optional().description("Search by model name, registartion no, vendor name"),
	sortBy: Joi.string().trim().lowercase({ force: true }).valid("created").optional().description("created"),
	sortOrder: fieldsValidator.sortOrder,
	status: fieldsValidator.status["optional"],
	fromDate: fieldsValidator.fromDate,
	toDate: fieldsValidator.toDate,
	shiftType: fieldsValidator.shiftType,
	tripStatus: fieldsValidator.tripStatus,
}).unknown();

let validateAdminRosterList = Joi.object({
	pageNo: fieldsValidator.pageNo,
	limit: fieldsValidator.limit,
	searchKey: Joi.string().optional().description("Search by employeeName, employeeId, driverName, driverId, cabBadge"),
	// sortBy: Joi.string().trim().lowercase({ force: true }).valid("created").optional().description("created"),
	// Added ShiftTime - Shivakumar A
	sortBy: Joi.string().optional().description("created, ShiftTime"),
	sortOrder: fieldsValidator.sortOrder,
	status: fieldsValidator.status["optional"],
	fromDate: fieldsValidator.fromDate,
	toDate: fieldsValidator.toDate,
	shiftType: fieldsValidator.shiftType,
	tripStatus: fieldsValidator.tripStatus,
	shiftName: Joi.string().optional().allow("").label("Shift Name"),
}).unknown();
export {
	validateRoasterAdd,
	validateRoasterContinue,
	validateRoasterUpdate,
	validateRoasterList,
	validateAdminRosterList,
	validateTripType,
	validateRosterList,
	validateRoasterEmpList,
	validateRoasterReschedule,
	validateRoasterRating,
	validateTripCancel
};