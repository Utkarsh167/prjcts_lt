"use strict";

import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import { Model } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import { CabRouteDao } from "@modules/v1/route";
import { ObjectId } from "bson";

let Schema = mongoose.Schema;

export interface IRoaster extends mongoose.Document {
	tripType: number;
	status: string;
	createdBy: object;
	created: number;
	adminType: number;
	routeId: ObjectId;
	cabId: ObjectId;
	roasterBadge: string;
	validFrom: number;
	validTill: number;
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
	// // shiftId: { type: String, index: true, default: "" },
	// // startShift: { type: Number, default: 0 },
	// // endShift: { type: Number, default: 0 },
	// // *---New shift details of the driver--*
	// shift: [{
	// 	shift: { type: String },
	// 	shiftTime: { type: String },
	// 	shiftType: { type: String }
	// }],
	// // *-----------------*
	onlineStatus: { type: Boolean, default: false },
	latitude: { type: Number, default: 0 },
	longitude: { type: Number, default: 0 },
	sosGenerated: { type: Boolean, default: false },
	sosLatitude: { type: Number },
	sosLongitude: { type: Number },
	sosLocation: { type: String },
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
	routeNo: { type: String, trim: true, index: true, default: "" },
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
	sosGenerated: { type: Boolean, default: false },
	sosLatitude: { type: Number },
	sosLongitude: { type: Number },
	sosLocation: { type: String },
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
			config.CONSTANT.EMP_PICKUP_STATUS.DRIVER_REACHED,
			config.CONSTANT.EMP_PICKUP_STATUS.MISSED
		],
		default: config.CONSTANT.EMP_PICKUP_STATUS.NOACTION,
		index: true,
	},
	reachedTime: { type: Number },
	isDriverNotified: { type: Boolean },
	name: { type: String },
	countryCode: { type: String },
	mobileNo: { type: String },
	address: { type: String },
	otp: { type: Number },
	noShowReason: { type: String },
	//  Added seen field - Shivakumar A
	seen: { type: Boolean },
	weekOff: { type: [Number] },
	rating: { type: Number },
	//  Added gender field - Shivakumar A
	gender: { type: String },
	// Added created - Shivakumar A
	noshowedAt: { type: Number, default: Date.now() },

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
	_id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
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
	avgRating: { type: Number, default: 0 },
	totalRating: { type: Number, default: 0 },
	isSosGenerated: { type: Number, default: false },
	// Added rideMissed - Shivakumar A
	rideMissed: { type: Boolean, default: false },
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
	},
	offboardedAt: { type: String },
	onTime: { type: Boolean }
}, {
		versionKey: false,
		timestamps: true
	});

roasterSchema.set("toObject", {
	virtuals: true
});

roasterSchema.methods.toJSON = function () {
	let object = appUtils.clean(this.toObject());
	return object;
};

// to set findAndModify false
mongoose.set("useFindAndModify", false);

// Export cab
export let roasters: Model<IRoaster> = mongoose.model<IRoaster>(config.CONSTANT.DB_MODEL_REF.ROASTER, roasterSchema);