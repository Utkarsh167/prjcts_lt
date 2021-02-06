"use strict";

import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import { Model } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";

let Schema = mongoose.Schema;

export interface IReschedule extends mongoose.Document {
	userId: string;
	reason: string;
	scheduleTime: number;
	status: number;
	requestType: number;
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
});

let driverSchema = new Schema({
	_id: { type: mongoose.Schema.Types.ObjectId, trim: true, index: true },
	name: { type: String, trim: true, index: true },
	email: { type: String, trim: true, lowercase: true, default: "" },
	countryCode: { type: String, trim: true, default: "" },
	mobileNo: { type: String, trim: true, default: "" },
	profilePicture: { type: String, default: "" },
	driverId: { type: String, default: "" },
	assigned: { type: String, default: "Assigned" },
	// shiftId: { type: String, index: true, default: "" },
	// startShift: { type: Number, default: 0 },
	// endShift: { type: Number, default: 0 },
	// *---New shift details of the driver--*
	shift: [{
		shift: { type: String },
		shiftTime: { type: String },
		shiftType: { type: String }
	}],
	// *-----------------*
	onlineStatus: { type: Boolean, default: false },
	latitude: { type: Number, default: 0 },
	longitude: { type: Number, default: 0 },
	// companyLocation: dropoffSchema,
	booked: { type: Boolean, default: false },
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
	// shiftId: { type: String, default: "" },
	// startShift: { type: Number, default: 0 },
	// endShift: { type: Number, default: 0 },
	// startTime: { type: String, default: "10:00" },
	// endTime: { type: String, default: "7:00" },
	vendor: vendorSchema,
	driverMapped: [driverSchema],
});

let empAdd = new Schema({
	_id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
	empId: { type: String },
	validFrom: { type: Number },
	validTill: { type: Number },
	employeeId: { type: String, trim: true, index: true },
	empLocation: {
		lat: { type: Number },
		long: { type: Number }
	},
	empOrder: { type: Number },
	empETA: { type: Number },
	empPickupTime: { type: String },
	empDropTime: { type: String },
	pickupStatus: {
		type: Number,
		enum: [
			config.CONSTANT.EMP_PICKUP_STATUS.NOACTION,
			config.CONSTANT.EMP_PICKUP_STATUS.CANCELLED,
			config.CONSTANT.EMP_PICKUP_STATUS.NOSHOW,
			config.CONSTANT.EMP_PICKUP_STATUS.ONBOARDED,
			config.CONSTANT.EMP_PICKUP_STATUS.RESCHEDULE,
			config.CONSTANT.EMP_PICKUP_STATUS.STARTRIDE,
			config.CONSTANT.EMP_PICKUP_STATUS.OFFBOARD,
			config.CONSTANT.EMP_PICKUP_STATUS.DRIVER_REACHED
		],
		default: config.CONSTANT.EMP_PICKUP_STATUS.NOACTION,
		index: true,
	},
	name: { type: String },
	countryCode: { type: String },
	mobileNo: { type: String },
	address: { type: String },
	otp: { type: Number },
	noShowReason: { type: String },
	weekOff: { type: [Number] },
	// Added gender - Shivakumar A
	gender: { type: String }
});

let routeSchema = new Schema({
	_id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
	grpId: { type: Number },
	empCount: { type: Number },
	shiftName: { type: String },
	shiftTime: { type: String },
	shiftType: {
		type: String,
		enum: ['login', 'logout']
	},
	grpCentre: {
		lat: { type: Number },
		long: { type: Number }
	},
	route: {
		points: { type: String }
	},
	bounds: {
		northeast: {
			lat: { type: Number },
			long: { type: Number }
		},
		southwest: {
			lat: { type: Number },
			long: { type: Number }
		}
	},
	startLocation: { type: String },
	endLocation: { type: String },
	totalTripTime: { type: Number },
	routeName: { type: String, trim: true, index: true },
	createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
	adminType: { type: String, default: config.CONSTANT.ADMIN_TYPE.ADMIN },
	created: { type: Number, default: Date.now() },
	companyCode: { type: String },
	employees: [empAdd],
	tripType: {
		type: Number,
		enum: [
			config.CONSTANT.TRIP_TYPE.HOME_TO_OFFICE,
			config.CONSTANT.TRIP_TYPE.OFFICE_TO_HOME,
		],
		default: config.CONSTANT.TRIP_TYPE.HOME_TO_OFFICE
	},
	routeBadge: { type: String, default: "" },
	status: {
		type: String,
		enum: [
			config.CONSTANT.STATUS.APPROVED,
			config.CONSTANT.STATUS.UN_APPROVED,
			config.CONSTANT.STATUS.DELETED,
			config.CONSTANT.STATUS.EXECUTED,
		],
		default: config.CONSTANT.STATUS.UN_APPROVED,
		index: true,
		sparse: true

	},
	maxGroupSize: { type: Number, default: 0 },
	waitTime: { type: Number, default: 0 },
	maxTripDuration: { type: Number, default: 0 }
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

let roasterSchema = new Schema({
	_id: { type: mongoose.Schema.Types.ObjectId, trim: true, index: true },
	roasterBadge: { type: String, default: "" },
	adminType: { type: String, default: config.CONSTANT.ADMIN_TYPE.ADMIN },
	created: { type: Number, default: Date.now() },
	validFrom: { type: Number },
	validTill: { type: Number },
	rosterDate: { type: Number },
	rideStarted: { type: Boolean, default: false },
	rideCompleted: { type: Boolean, default: false },
	startLat: { type: Number },
	startLong: { type: Number },
	cab: cabSchema,
	route: routeSchema,
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
	createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
	companyCode: { type: String },
	officeAddress: { type: String },
	officeLocation: {
		lat: { type: Number },
		long: { type: Number }
	}
});

let rescheduleSchema = new Schema({
	_id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
	// Added seen, newCabBadgeId, gender, cancelledAt - Shivakumar A
	seen: {type: mongoose.Schema.Types.Boolean, default: false},
	newCabBadgeId: {type: String, default: ""},
	gender: {type: String, default: ""},
	cancelledAt: { type: Number, default: Date.now() },
	// Employee reschedule and cancel trip by employee
	name: { type: mongoose.Schema.Types.String, trim: true },
	email: { type: mongoose.Schema.Types.String, trim: true },
	employeeId: { type: mongoose.Schema.Types.String, index: true, trim: true },
	countryCode: { type: String, trim: true, default: "91" },
	mobileNo: { type: String, trim: true, default: "" },
	userId: { type: mongoose.Schema.Types.ObjectId, required: true, auto: false, ref: 'user', index: true },
	rosterId: { type: mongoose.Schema.Types.ObjectId, required: true, auto: false, ref: 'roasters', index: true },
	shiftName: { type: mongoose.Schema.Types.String, trim: true },
	shiftTime: { type: mongoose.Schema.Types.String, trim: true },
	pickUpLocation: { type: String },
	shiftType: {
		type: String,
		enum: [
			config.CONSTANT.SHIFT_TYPE.LOGIN,
			config.CONSTANT.SHIFT_TYPE.LOGOUT,
		],
	},
	reason: { type: String, trim: true },
	scheduleTime: { type: Number, default: Date.now() },
	companyCode: { type: String },
	requestType: {
		type: Number,
		enum: [
			config.CONSTANT.TRIP_RESCHEDULE.CANCELLED,
			config.CONSTANT.TRIP_RESCHEDULE.RESCHEDULE,
		],
		default: config.CONSTANT.QUERY_TYPE.DEFAULT,
	},
	status: {
		type: Number,
		enum: [
			config.CONSTANT.USER_QUERY_STATUS.RESOLVED,
			config.CONSTANT.USER_QUERY_STATUS.CANCELLED,
			config.CONSTANT.USER_QUERY_STATUS.PENDING,
		],
		default: config.CONSTANT.USER_QUERY_STATUS.PENDING,
	},
	roster: roasterSchema,
	created: { type: Number, default: Date.now() },
	foundRosterId: { type: mongoose.Schema.Types.ObjectId, auto: false, ref: 'roasters', index: true },
	newGroupFormed: routeSchema,
	oldGroupFormed: routeSchema,
	newRosterId: { type: mongoose.Schema.Types.ObjectId, auto: false, ref: 'roasters', index: true },
	rosterFound: { type: Boolean }
}, {
		versionKey: false,
		timestamps: true
	});

rescheduleSchema.set("toObject", {
	virtuals: true
});

rescheduleSchema.methods.toJSON = function () {
	let object = appUtils.clean(this.toObject());
	return object;
};

// to set findAndModify false
mongoose.set("useFindAndModify", false);

// Export user
export let reschedules: Model<IReschedule> = mongoose.model<IReschedule>(config.CONSTANT.DB_MODEL_REF.RESCHEDULE, rescheduleSchema);