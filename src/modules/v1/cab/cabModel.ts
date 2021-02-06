"use strict";

import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import { Model } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import { CabDao } from "@modules/v1/cab";

let Schema = mongoose.Schema;

export interface ICab extends mongoose.Document {
	cabModel: string;
	type: string;
	seatingCapacity: number;
	registrationNo: string;
	cabBadge: number;
	permitNumber: string;
	status: string;
	createdBy: object;
	created: number;
	adminType: number;
	vendorId: string;
	driverId: string;
	color: string;
	assigned: boolean;
	routeNo: string;
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
/**
 * Company address
 */
let dropoffSchema = new Schema({
	_id: { type: String, default: "62add0156d0b818f51127da4dc515ffb" }, // companyaddressId md5 encrypt
	address: { type: String, trim: true, required: true, default: "Appinventiv" },
	type: { type: String, default: "Point" },
	coordinates: { type: [Number], index: "2dsphere", default: [77.35972, 28.6060803] }// [longitude, latitude]
}, {
		_id: false
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
	shift: {
		_id: { type: mongoose.Schema.Types.ObjectId, trim: true, index: true },
		shift: { type: String },
		shiftTime: { type: String },
		shiftType: { type: String }
	},
	// *-----------------*
	onlineStatus: { type: Boolean, default: false },
	latitude: { type: Number, default: 0 },
	longitude: { type: Number, default: 0 },
	companyLocation: dropoffSchema,
	booked: { type: Boolean, default: false },
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
	_id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
	// Cab data
	cabModel: { type: String, trim: true, index: true },
	cabImage: { type: String, trim: true, default: "" },
	seatingCapacity: { type: Number, default: 0 },
	registrationNo: { type: String, trim: true, index: true, default: "" },
	routeNo: { type: String, trim: true, index: true, default: "" },
	aggrementCopy: { type: String, default: "" },
	companyIssuance: { type: String, default: "" },
	rgsCertificate: { type: String, default: "" },
	fitnessCertificate: { type: String, default: "" },
	roadTax: { type: String, default: "" },
	insurance: { type: String, default: "" },
	statePermitForm: { type: String, default: "" },
	allIndiaPermitForm: { type: String, default: "" },
	driverOwner: { type: Boolean, default: false },
	driverOnly: { type: Boolean, default: false },
	ac: { type: Boolean, default: false },
	panicButton: { type: Boolean, default: false },
	toolKit: { type: Boolean, default: false },
	spareWheel: { type: Boolean, default: false },
	firstAidKit: { type: Boolean, default: false },
	torchAmbrella: { type: Boolean, default: false },
	fireExtingusher: { type: Boolean, default: false },
	interiorExterior: { type: Boolean, default: false },
	createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
	companyCode: { type: String },
	adminType: { type: String, default: config.CONSTANT.ADMIN_TYPE.ADMIN },
	created: { type: Number, default: Date.now() },
	busySlots: [{
		from: { type: String },
		to: { type: String }
	}],
	type: {
		type: String,
		enum: [
			config.CONSTANT.CAB_TYPE.HATCHBACK,
			config.CONSTANT.CAB_TYPE.SEDAN,
			config.CONSTANT.CAB_TYPE.SUV,
			config.CONSTANT.CAB_TYPE.TEMPOTRAVELLER,
			config.CONSTANT.CAB_TYPE.OTHER,
	        // Added Medical Cab - Shivakumar A
			config.CONSTANT.CAB_TYPE.MEDICALCAB,
		],
		default: config.CONSTANT.CAB_TYPE.OTHER
	},
	cabBadge: { type: String, default: "" },
	statePermitNumber: { type: String, trim: true, default: "" },
	countryPermitNumber: { type: String, trim: true, default: "" },
	color: { type: String, trim: true, default: "" },
	fuelType: {
		type: String,
		enum: [
			config.CONSTANT.FUEL_TYPE.DIESEL,
			config.CONSTANT.FUEL_TYPE.PETROL,
			config.CONSTANT.FUEL_TYPE.CNG,
		],
		default: config.CONSTANT.FUEL_TYPE.PETROL
	},
	transmissionType: {
		type: String,
		enum: [
			config.CONSTANT.TRANSMISSION_TYPE.AUTOMATIC,
			config.CONSTANT.TRANSMISSION_TYPE.MANUAL
		],
		default: config.CONSTANT.TRANSMISSION_TYPE.MANUAL
	},
	vendorId: { type: mongoose.Schema.Types.ObjectId, trim: true, index: true },
	// driverId: { type: mongoose.Schema.Types.ObjectId, trim: true, index: true },
	vendor: vendorSchema,
	driverMapped: [driverSchema],
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
	comment: { type: String}
}, {
		versionKey: false,
		timestamps: true
	});

cabSchema.set("toObject", {
	virtuals: true
});

cabSchema.methods.toJSON = function () {
	let object = appUtils.clean(this.toObject());
	return object;
};

// to set findAndModify false
mongoose.set("useFindAndModify", false);

// Export cab
export let cabs: Model<ICab> = mongoose.model<ICab>(config.CONSTANT.DB_MODEL_REF.CAB, cabSchema);