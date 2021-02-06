"use strict";

import * as Joi from "joi";
import * as config from "@config/index";
import { fieldsValidator } from "@utils/fieldsValidator";

let validateDriverSignup = Joi.object({
	name: fieldsValidator.name["minlength"],
	email: fieldsValidator.email["required"],
	countryCode: fieldsValidator.countryCode["optional"],
	mobileNo: fieldsValidator.mobileNo["optional"],
	profilePicture: fieldsValidator.profilePicture,
	// driverId: fieldsValidator.driverId,
	emergencyNo: fieldsValidator.mobileNo["optional"],
	drunker: fieldsValidator.drunker,
	alcoholic: fieldsValidator.alcoholic,
	tobacco: fieldsValidator.tobacco,
	backgroundVarified: fieldsValidator.backgroundVarified,
	dlRenewalDate: fieldsValidator.dlRenewalDate,
	DlBadgeNO: fieldsValidator.DlBadgeNO,
	documents: fieldsValidator.documents,
}).unknown();
let validateDriverUpdate = Joi.object({
	userId: fieldsValidator.userId,
	name: fieldsValidator.name["minlength"],
	countryCode: fieldsValidator.countryCode["optional"],
	mobileNo: fieldsValidator.mobileNo["optional"],
	profilePicture: fieldsValidator.profilePicture,
	documents: fieldsValidator.documents,
	emergencyNo: fieldsValidator.mobileNo["optional"],
	drunker: fieldsValidator.drunker,
	alcoholic: fieldsValidator.alcoholic,
	tobacco: fieldsValidator.tobacco,
	backgroundVarified: fieldsValidator.backgroundVarified,
	dlRenewalDate: fieldsValidator.dlRenewalDate,
	DlBadgeNO: fieldsValidator.DlBadgeNO,
}).unknown();

let validateEmpSignup = Joi.object({
	name: fieldsValidator.name["minlength"],
	email: fieldsValidator.email["required"],
	// countryCode: fieldsValidator.countryCode["optional"],
	mobileNo: fieldsValidator.mobileNo["optional"],
	employeeId: fieldsValidator.employeeId,
	// gender: fieldsValidator.gender["required"],
	// houseNo: fieldsValidator.houseNo,
	// roadName: fieldsValidator.roadName,
	// city: fieldsValidator.city,
	// state: fieldsValidator.state,
	// landMark: fieldsValidator.landMark,
	// fullAddress: Joi.string().optional().allow("").description("Home address"),
	// latitude: Joi.number().optional().allow("").description("latitude"),
	// longitude: Joi.number().optional().allow("").description("latitude"),
	// shiftStartTime: fieldsValidator.shiftStartTime,
	// shiftEndTime: fieldsValidator.shiftEndTime,
	// shift: Joi.string(),
	profilePicture: fieldsValidator.profilePicture,
}).unknown();

let validateVehicleSignup = Joi.object({
	employeeId: fieldsValidator.employeeId,
	vehicles: Joi.array().items(Joi.object({
		regNo: fieldsValidator.regNo,
		modal: fieldsValidator.modal,
		vehicleType: fieldsValidator.vehicleType,
	})).required(),
}).unknown();

let validateVehicleUpdate = Joi.object({
	regNo: fieldsValidator.regNo,
	modal: fieldsValidator.modal,
	vehicleType: fieldsValidator.vehicleType,
}).unknown();
// added by satyam
let validateUserVehicleSignup = Joi.object({
	regNo: fieldsValidator.regNo,
	modal: fieldsValidator.modal,
	vehicleType: fieldsValidator.vehicleType,
}).unknown();
let validateUserVehicleUpdate = Joi.object({
	vehicleId: fieldsValidator.vehicleId,
	regNo: fieldsValidator.regNo,
	modal: fieldsValidator.modal,
	vehicleType: fieldsValidator.vehicleType,
}).unknown();

let validateEmpUpdate = Joi.object({
	// name: fieldsValidator.name["minlength"].optional(),
	empId: fieldsValidator.userId,
	countryCode: fieldsValidator.countryCode["optional"],
	mobileNo: fieldsValidator.mobileNo["optional"],
	email: fieldsValidator.email["optional"],
	// employeeId: fieldsValidator.employeeId,
	// gender: fieldsValidator.gender["required"],
	// shiftStartTime: fieldsValidator.shiftStartTime,
	// shiftEndTime: fieldsValidator.shiftEndTime,
	// shift: Joi.string(),
	// houseNo: fieldsValidator.houseNo,
	// roadName: fieldsValidator.roadName,
	// city: fieldsValidator.city,
	// state: fieldsValidator.state,
	// landMark: fieldsValidator.landMark,
	// fullAddress: Joi.string().optional().allow("").description("Home address"),
	// latitude: Joi.number().optional().allow("").description("latitude"),
	// longitude: Joi.number().optional().allow("").description("latitude"),
	profilePicture: fieldsValidator.profilePicture,
}).unknown();

let validatelogin = Joi.object({
	email: fieldsValidator.email["optional"],
	password: fieldsValidator.userpassword,
	deviceId: fieldsValidator.deviceId,
	// deviceToken: fieldsValidator.deviceToken,
	type: fieldsValidator.userType,
	// companyCode: fieldsValidator.companyCode,
}).unknown();

let validateForgotPassword = Joi.object({
	email: fieldsValidator.email["required"],
	type: fieldsValidator.userType,
	// companyCode: fieldsValidator.companyCode,
}).unknown();

let validateChangeForgotPassword = Joi.object({
	password: fieldsValidator.userpassword,
	companyCode: fieldsValidator.companyCode,
}).unknown();

let validateChangePassword = Joi.object({
	password: fieldsValidator.userpassword,
	oldPassword: fieldsValidator.userOldPassword,
}).unknown();
let validateHomeAddress = Joi.object({
	longitude: fieldsValidator.pickuplong,
	latitude: fieldsValidator.pickuplat,
	houseNo: fieldsValidator.houseNo,
	roadName: fieldsValidator.roadName,
	city: fieldsValidator.city,
	state: fieldsValidator.state,
	landMark: fieldsValidator.landMark,
	isAddressChange: fieldsValidator.isAddressChange,
}).unknown();
let validateUserQuery = Joi.object({
	query: fieldsValidator.query,
}).unknown();

let validateUserList = Joi.object({
	pageNo: fieldsValidator.pageNo,
	limit: fieldsValidator.limit,
	searchKey: Joi.string().optional().description("Search by name, email, employeeId"),
	sortBy: Joi.string().trim().lowercase({ force: true }).valid("name", "created", "driverId", "shiftEndTime", "shiftStartTime", "employeeId", "model", "regNo", "userName").optional().description("name, created,employeeId,driverId,shiftStartTime, shiftEndTime"),
	sortOrder: fieldsValidator.sortOrder,
	status: fieldsValidator.status["optional"],
	companyLocationName: Joi.string().optional().description("company Location name"),
	fromDate: fieldsValidator.fromDate,
	toDate: fieldsValidator.toDate,
	userType: fieldsValidator.userType,
	shiftName: Joi.string().optional().allow("").label("Shift Name"),
	isAddressChangeReq: Joi.boolean().optional().allow("").label("isAddressChangeReq true for address change request list"),
	isArchived: Joi.boolean().optional().allow("").label("isArchived true for archived user list"),
}).unknown();

let validateExportUser = Joi.object({
	searchKey: Joi.string().optional().description("Search by name, email"),
	sortBy: Joi.string().trim().lowercase({ force: true }).valid("name", "created").optional().description("name, created"),
	sortOrder: fieldsValidator.sortOrder,
	status: fieldsValidator.status["optional"],
	fromDate: fieldsValidator.fromDate,
	toDate: fieldsValidator.toDate
}).unknown();

let validateResetaccessToken = Joi.object({
	accessToken: fieldsValidator.accessToken
}).unknown();

let validateMultiBlockUnblock = Joi.object({
	userIds: Joi.array().items(fieldsValidator.userId).required(),
	status: fieldsValidator.status["required"]
}).unknown();

let validateImportUsers = Joi.object({
	file: fieldsValidator.file["required"]
}).unknown();
let validateDriverListing = Joi.object({
	searchKey: Joi.string().optional().description("Search by name"),
}).unknown();
let validateEmployeeListing = Joi.object({
	searchKey: Joi.string().optional().description("Search by employee id"),
}).unknown();

let validateBulkEmpSignup = Joi.object({
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

let validateEmpShiftList = Joi.object({
	pageNo: fieldsValidator.pageNo,
	limit: fieldsValidator.limit,
	searchKey: Joi.string().optional().description("Search by name"),
	sortBy: Joi.string().trim().lowercase({ force: true }).valid("name", "created").optional().description("name, created"),
	sortOrder: fieldsValidator.sortOrder,
	// status: Joi.string().trim().lowercase({ force: true }).optional().valid([config.CONSTANT.STATUS.APPROVED, config.CONSTANT.STATUS.UN_APPROVED]).description("Status => 'approved', 'unapproved'"),
}).unknown();

let validateEmpShiftUpdate = Joi.object({
	employeeId: Joi.string().trim().required(),
	shiftName: Joi.string().optional().label("Shift Name"),
	weekOff: Joi.array().optional().label("Company weekOff")
}).unknown();

let validateAddressChangeRequest = Joi.object({
	actionType: Joi.string().trim().required().valid([
		config.CONSTANT.STATUS.APPROVED,
		config.CONSTANT.STATUS.REJECTED,
	]).description("address change request approved reject"),
	empId: fieldsValidator.userId,
}).unknown();

let validateMobileNoUnique = Joi.object({
	mobileNo: fieldsValidator.mobileNo["optional"],
}).unknown();

export {
	validateDriverSignup,
	validateEmpSignup,
	validateVehicleSignup,
	validatelogin,
	validateForgotPassword,
	validateChangeForgotPassword,
	validateUserList,
	validateExportUser,
	validateMultiBlockUnblock,
	validateImportUsers,
	validateChangePassword,
	validateResetaccessToken,
	validateHomeAddress,
	validateDriverUpdate,
	validateEmpUpdate,
	validateDriverListing,
	validateUserQuery,
	validateBulkEmpSignup,
	validateEmpShiftList,
	validateEmpShiftUpdate,
	validateAddressChangeRequest,
	validateMobileNoUnique,
	validateEmployeeListing,
	validateVehicleUpdate,
	validateUserVehicleSignup,
	validateUserVehicleUpdate
};
