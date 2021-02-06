"use strict";

import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import { Model } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";

let Schema = mongoose.Schema;

export interface IUser extends mongoose.Document {
	name: string;
	email: string;
	countryCode: string;
	mobileNo: string;
	salt: string;
	hash: string;
	gender: string;
	profilePicture: string;
	pickup: Address;
	dropoff: Address;
	status: string;
	driverId: string;
	cabdriverId: string;
	employeeId: string;
	createdBy: object;
	jobStatus: number;
	shiftStartTime: number;
	shiftEndTime: number;
	tripCount: number;
	adhocCount: number;
	userType: number;
	created: number;
	adminType: number;
	forgetToken: string;
	requestTime: number;
	emergencyNo: string;
	drunker: boolean;
	alcoholic: boolean;
	tobacco: boolean;
	backgroundVarified: boolean;
	dlRenewalDate: number;
	pickupStatus: number;
	otp: number;
	otpTime: number;
	distance: number;
	estimatedTime: number;
	groupFormed: boolean;
	companyCode: string;
}

let vendorSchema = new Schema({
	_id: { type: mongoose.Schema.Types.ObjectId, trim: true, index: true },
	name: { type: String, trim: true, index: true },
	email: { type: String, trim: true, lowercase: true, default: "" },
	countryCode: { type: String, trim: true, default: "" },
	mobileNo: { type: String, trim: true, default: "" },
	profilePicture: { type: String, default: "" },
	badgeNo: { type: String, default: "" },
	color: { type: String, trim: true, default: "" },
	assigned: { type: Boolean, default: false },
}, {
		timestamps: false,
		toObject: {
			virtuals: true
		},
		toJSON: {
			virtuals: true
		},
		_id: false
	});

let cabSchema = new Schema({
	_id: { type: mongoose.Schema.Types.ObjectId, trim: true, index: true },
	cabModel: { type: String, trim: true, index: true },
	registrationNo: { type: String, trim: true, default: "" },
	type: { type: String, trim: true, default: "" },
	cabBadge: { type: String, trim: true, default: "" },
	statePermitNumber: { type: String, default: "" },
	countryPermitNumber: { type: String, default: "" },
	seatingCapacity: { type: Number, default: 0 },
	routeNo: { type: String, trim: true, default: "" },
	// shiftId: { type: String, default: "" },
	// startShift: { type: Number, default: 0 },
	// endShift: { type: Number, default: 0 },
	// startTime: { type: String, default: "10:00" },
	// endTime: { type: String, default: "7:00" },
	// *---New shift details of the driver--*
	shift: {
		shift: { type: String },
		shiftTime: { type: String },
		shiftType: { type: String }
	},
	// *-----------------*
	vendor: vendorSchema,
}, {
		timestamps: false,
		toObject: {
			virtuals: true
		},
		toJSON: {
			virtuals: true
		},
		_id: false
	});

let empDocuments = new Schema({
	_id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
	frontImageUrl: { type: String, required: false, default: "" },
	rearImageUrl: { type: String, required: false, default: "" },
	type: { type: String, required: false, default: "" },
	mediaType: { type: String, required: false, default: "" },
});

// Home address schema
let homeAddress = new Schema({
	fullAddress: { type: String, required: false },
	houseNo: { type: String, trim: true, required: false },
	roadName: { type: String, trim: true, required: false },
	city: { type: String, trim: true, required: false },
	state: { type: String, trim: true, required: false },
	landMark: { type: String, trim: true, required: false },
}, {
		_id: false
	});
// Home location
let pickupSchema = new Schema({
	address: homeAddress,
	type: { type: String, default: "Point" },
	coordinates: { type: [Number], index: "2dsphere", default: [0, 0] }// [longitude, latitude]
}, {
		_id: false
	});
// Change request address waiting for admin approval
let tempPickupSchema = new Schema({
	address: homeAddress,
	type: { type: String, default: "Point" },
	coordinates: { type: [Number], default: [0, 0] }// [longitude, latitude]
}, {
		_id: false
	});
// Comapany address
let dropoffSchema = new Schema({
	_id: { type: String, default: "62add0156d0b818f51127da4dc515ffb" }, // companyaddressId md5 encrypt
	address: { type: String, trim: true, required: true, default: "Appinventiv" },
	type: { type: String, default: "Point" },
	coordinates: { type: [Number], index: "2dsphere", default: [77.35972, 28.6060803] }// [longitude, latitude]
}, {
		_id: false
	});

let userSchema = new Schema({
	_id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },

	// Driver and emp data

	driverId: { type: String, trim: true, index: true, default: "" },
	avgRating: { type: Number, default: 0 },
	totalRating: { type: Number, default: 0 },
	cabdriverId: { type: String, trim: true, index: true },
	otp: { type: Number, index: true, default: 0 },
	otpTime: { type: Number },
	pickupStatus: {
		type: Number,
		enum: [
			config.CONSTANT.EMP_PICKUP_STATUS.NOACTION,
			config.CONSTANT.EMP_PICKUP_STATUS.CANCELLED,
			config.CONSTANT.EMP_PICKUP_STATUS.NOSHOW,
			config.CONSTANT.EMP_PICKUP_STATUS.ONBOARDED,
			config.CONSTANT.EMP_PICKUP_STATUS.RESCHEDULE,
			config.CONSTANT.EMP_PICKUP_STATUS.STARTRIDE,
			config.CONSTANT.EMP_PICKUP_STATUS.OFFBOARD
		],
		default: config.CONSTANT.EMP_PICKUP_STATUS.NOACTION,
		index: true,
	},
	noShowReason: { type: String, trim: true },
	employeeId: { type: String, trim: true, index: true },
	name: { type: String, trim: true, index: true },
	createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
	adminType: { type: String, default: config.CONSTANT.ADMIN_TYPE.ADMIN },
	forgetToken: { type: String, required: false },
	assigned: { type: Boolean, required: false },
	isAddressChange: { type: Boolean, required: false, default: false },
	isAddressChangeReq: { type: Boolean, required: false, default: false }, // if admin request change address then true
	isEmailChange: { type: Boolean, required: false, default: false },
	requestTime: { type: Number },
	distance: { type: Number },
	distKm: { type: String },
	estimatedTime: { type: Number },
	durationMinute: { type: String },
	jobStatus: {
		type: Number,
		enum: [
			config.CONSTANT.JOB_ASSIGNED.ASSIGNED,
			config.CONSTANT.JOB_ASSIGNED.UNASSIGNED,
		]
	},
	pickup: pickupSchema,
	tempPickup: tempPickupSchema,
	dropoff: dropoffSchema,
	shiftStartTime: { type: String },
	shiftEndTime: { type: String },
	shift: { type: String },
	weekOff: { type: [Number] },
	tripCount: { type: Number, required: false, default: 0 },
	adhocCount: { type: Number, required: false, default: 0 },
	documents: [empDocuments],
	userType: {
		type: Number,
		enum: [
			config.CONSTANT.USER_TYPE.EMPLOYEE,
			config.CONSTANT.USER_TYPE.DRIVER,
		],
		index: true
	},
	companyCode: { type: String },
	created: { type: Number, default: Date.now() },
	email: { type: String, trim: true, index: true, lowercase: true, default: "" },
	countryCode: { type: String, trim: true, index: true, default: "91" },
	mobileNo: { type: String, trim: true, index: true, default: "" },
	emergencyNo: { type: String, trim: true, default: "" },
	drunker: {
		type: Number,
		enum: [
			config.CONSTANT.DRINK_STATUS.REGULAR_DRUNKER,
			config.CONSTANT.DRINK_STATUS.RARE_DRUNKER,
			config.CONSTANT.DRINK_STATUS.NOT_DRUNKER,
		],
		default: config.CONSTANT.DRINK_STATUS.NOT_DRUNKER,
	},
	alcoholic: { type: Boolean, default: false },
	tobacco: { type: Boolean, default: false },
	backgroundVarified: { type: Boolean, default: false },
	dlRenewalDate: { type: Number, default: "" },
	DlBadgeNO: { type: String, default: "" },
	salt: { type: String, required: false },
	hash: { type: String, required: false },
	gender: {
		type: String,
		enum: [
			config.CONSTANT.GENDER.MALE,
			config.CONSTANT.GENDER.FEMALE,
			config.CONSTANT.GENDER.OTHER,
		],
		default: config.CONSTANT.GENDER.OTHER,
	},
	profilePicture: { type: String, default: "" },
	status: {
		type: String,
		enum: [
			config.CONSTANT.STATUS.BLOCKED,
			config.CONSTANT.STATUS.UN_BLOCKED,
			config.CONSTANT.STATUS.DELETED
		],
		default: config.CONSTANT.STATUS.UN_BLOCKED,
		index: true,
		sparse: true

	},
	cab: [cabSchema],
	groupFormed: { type: Boolean, default: false, required: true },
	// reasonForArchive
	comment: { type: String }
}, {
		versionKey: false,
		timestamps: true
	});

userSchema.set("toObject", {
	virtuals: true
});

// Load password virtually
userSchema.virtual("password")
	.get(function () {
		return this._password;
	})
	.set(function (password) {
		this._password = password;
		let salt = this.salt = bcrypt.genSaltSync(config.SERVER.SALT_ROUNDS);
		// let salt = this.salt = appUtils.genRandomString(config.SERVER.SALT_ROUNDS);
		this.hash = appUtils.encryptHashPassword(password, salt);
	});

userSchema.methods.toJSON = function () {
	let object = appUtils.clean(this.toObject());
	return object;
};

// to set findAndModify false
mongoose.set("useFindAndModify", false);

// Export user
export let users: Model<IUser> = mongoose.model<IUser>(config.CONSTANT.DB_MODEL_REF.USER, userSchema);