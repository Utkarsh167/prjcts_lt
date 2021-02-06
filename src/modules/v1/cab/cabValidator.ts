"use strict";

import * as Joi from "joi";
import * as config from "@config/index";

import { fieldsValidator } from "@utils/fieldsValidator";

let validateCabAdd = Joi.object({
	cabModel: fieldsValidator.cabModel["minlength"],
	seatingCapacity: fieldsValidator.seatingCapacity,
	registrationNo: fieldsValidator.registrationNo,
	type: fieldsValidator.cabType,
	statePermitNumber: fieldsValidator.statepermitNumber,
	countryPermitNumber: fieldsValidator.countrypermitNumber,
	vendorId: fieldsValidator.vendorId,
	color: fieldsValidator.color,
	fuelType: fieldsValidator.fuelType,
	transmissionType: fieldsValidator.transmissionType,
	routeNo: fieldsValidator.routeNo,
	aggrementCopy: fieldsValidator.aggrementCopy,
	companyIssuance: fieldsValidator.companyIssuance,
	rgsCertificate: fieldsValidator.rgsCertificate,
	fitnessCertificate: fieldsValidator.fitnessCertificate,
	roadTax: fieldsValidator.roadTax,
	insurance: fieldsValidator.insurance,
	statePermitForm: fieldsValidator.statePermitForm,
	allIndiaPermitForm: fieldsValidator.allIndiaPermitForm,
	driverOwner: fieldsValidator.driverOwner,
	driverOnly: fieldsValidator.driverOnly,
	ac: fieldsValidator.ac,
	panicButton: fieldsValidator.panicButton,
	toolKit: fieldsValidator.toolKit,
	spareWheel: fieldsValidator.spareWheel,
	firstAidKit: fieldsValidator.firstAidKit,
	torchAmbrella: fieldsValidator.torchAmbrella,
	fireExtingusher: fieldsValidator.fireExtingusher,
	interiorExterior: fieldsValidator.interiorExterior,
	cabImage: fieldsValidator.cabImage,
}).unknown();
let validateCabUpdate = Joi.object({
	cabId: fieldsValidator.userId,
	cabModel: fieldsValidator.cabModel["minlength"],
	seatingCapacity: fieldsValidator.seatingCapacity,
	registrationNo: fieldsValidator.registrationNo,
	type: fieldsValidator.cabType,
	statePermitNumber: fieldsValidator.statepermitNumber,
	countryPermitNumber: fieldsValidator.countrypermitNumber,
	vendorId: fieldsValidator.vendorId,
	color: fieldsValidator.color,
	fuelType: fieldsValidator.fuelType,
	transmissionType: fieldsValidator.transmissionType,
	routeNo: fieldsValidator.routeNo,
	aggrementCopy: fieldsValidator.aggrementCopy,
	companyIssuance: fieldsValidator.companyIssuance,
	rgsCertificate: fieldsValidator.rgsCertificate,
	fitnessCertificate: fieldsValidator.fitnessCertificate,
	roadTax: fieldsValidator.roadTax,
	insurance: fieldsValidator.insurance,
	statePermitForm: fieldsValidator.statePermitForm,
	allIndiaPermitForm: fieldsValidator.allIndiaPermitForm,
	driverOwner: fieldsValidator.driverOwner,
	driverOnly: fieldsValidator.driverOnly,
	ac: fieldsValidator.ac,
	panicButton: fieldsValidator.panicButton,
	toolKit: fieldsValidator.toolKit,
	spareWheel: fieldsValidator.spareWheel,
	firstAidKit: fieldsValidator.firstAidKit,
	torchAmbrella: fieldsValidator.torchAmbrella,
	fireExtingusher: fieldsValidator.fireExtingusher,
	interiorExterior: fieldsValidator.interiorExterior,
	cabImage: fieldsValidator.cabImage,
}).unknown();
let validateDriverAssign = Joi.object({
	driverId: fieldsValidator.driverId,
	mappedType: fieldsValidator.driverMapped,
	cabId: fieldsValidator.cabId,
	// // shiftId: fieldsValidator.shiftId,
	// // startShift: fieldsValidator.driverShift,
	// // endShift: fieldsValidator.driverShift,
	// shift: Joi.string().required(),
	// shiftType: Joi.string().valid("login", "logout").required().description("login, logout"),
}).unknown();

let validateCabList = Joi.object({
	pageNo: fieldsValidator.pageNo,
	limit: fieldsValidator.limit,
	searchKey: Joi.string().optional().description("Search by model name, registartion no, vendor name, cabBadge"),
	// Added cabBadge to sortBy - Shivakumar A
	sortBy: Joi.string().trim().lowercase({ force: true }).valid("cabModel", "created", "seatingCapacity", "vendorName", "cabBadge").optional().description("cabModel, created, seatingCapacity", "cabBadge"),
	sortOrder: fieldsValidator.sortOrder,
	status: fieldsValidator.status["optional"],
	fromDate: fieldsValidator.fromDate,
	toDate: fieldsValidator.toDate,
	vendorId: fieldsValidator.vendorId,
	seatingCapacity: fieldsValidator.capacity,
	assigned: fieldsValidator.assigned,
	isArchived: Joi.boolean().optional().allow("").label("isArchived true for archived cab list"),
}).unknown();
let validateCabRoasterList = Joi.object({
	pageNo: fieldsValidator.pageNo,
	limit: fieldsValidator.limit,
	fromDate: fieldsValidator.fromDate,
	toDate: fieldsValidator.toDate,
	// searchKey: Joi.string().optional().description("Search not implemented"),
	shiftType: fieldsValidator.shiftType,
	tripStatus: fieldsValidator.tripStatus,
}).unknown();
let validateCabRoaster = Joi.object({
	rosterId: fieldsValidator.rosterId,
}).unknown();
let validateCabListing = Joi.object({
	// searchKey: Joi.string().optional().description("Search by cabBadge"),
	vendorId: Joi.string().required().trim(),
	// shift: Joi.string().required(),
	// shiftType: Joi.string().valid("login", "logout").required().description("login, logout"),
}).unknown();
let validateCabDriverListing = Joi.object({
	// searchKey: Joi.string().optional().description("Search by cabBadge"),
	vendorId: Joi.string().required().trim(),
	// shift: Joi.string().required(),
	shiftType: Joi.string().valid("login", "logout").required().description("login, logout"),
	shiftTime: Joi.string().required(),
	totalTripTime: Joi.number().required()
}).unknown();
let validateBulkCabSignup = Joi.object({
	file: Joi.any()
		.meta({ swaggerType: "file" })
		.required()
		.description("file exprension .xlsx|.xls").error(errors => {
			errors.forEach(err => {
				switch (err.type) {
					case "any.empty":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.file["required"];
						break;
					case "any.required":
						err.message = config.CONSTANT.VALIDATION_MESSAGE.file["required"];
						break;
					default:
						break;
				}
			});
			return errors;
		})
}).unknown();
let validateIsRegistrationNoUnique = Joi.object({
	registrationNo: fieldsValidator.registrationNo,
}).unknown();
let validateIsCabBadgeNoUnique = Joi.object({
	routeNo: fieldsValidator.routeNo,
}).unknown();

export {
	validateCabAdd,
	validateCabUpdate,
	validateCabList,
	validateDriverAssign,
	validateCabRoasterList,
	validateCabRoaster,
	validateCabListing,
	validateCabDriverListing,
	validateBulkCabSignup,
	validateIsRegistrationNoUnique,
	validateIsCabBadgeNoUnique
};