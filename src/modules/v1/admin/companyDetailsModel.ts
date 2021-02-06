"use strict";

import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import { Model } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";

let Schema = mongoose.Schema;

// Model file to add company details Utkarsh 06/07/2020
export interface ICompanyDetails extends mongoose.Document {
	name: String;
	code: String;
	address: String;
	locations: LocationDetails[];
}

let addressSchema = new Schema({
	_id: { type: mongoose.Schema.Types.ObjectId, required: false, auto: false },
	fullAddress: { type: mongoose.Schema.Types.String, required: false },
	lat: { type: mongoose.Schema.Types.String, required: false },
	lng: { type: mongoose.Schema.Types.String, required: false },
});

let SpotDetailsSchema = new Schema({
	_id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
	name: String,
}, {
	versionKey: false,
	timestamps: true,
});

let ZoneDetailsSchema = new Schema({
	_id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
	name: String,
	key: String,
	parqueryValue: String,
	cameras: [String],
	spots: [SpotDetailsSchema],
	// satyam to append the data
	spots_states: [],
}, {
	versionKey: false,
	timestamps: true,
});

let FloorDetailsSchema = new Schema({
	_id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
	name: String,
	value: String,
	key: String,
	parqueryValue: String,
	cameras: [String],
	zones: [ZoneDetailsSchema],
	// addedBySatyam
	availableSpotsCount: Number
}, {
	versionKey: false,
	timestamps: true,
});

let LocationDetailsScema = new Schema({
	_id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
	name: String,
	key: String,
	parqueryValue: String,
	address: addressSchema,
	floors: [FloorDetailsSchema],
	user: String,
	password: String,
    // Added camera Ids for locations
    cameras: [String],
}, {
	versionKey: false,
	timestamps: true,
});
let ConfigScema = new Schema({
	_id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
	// value in terms of minutes
	booking_status_cutoff: {type: Number, default: 5},
	// value in terms of metres
	geofence_cutoff: {type: Number, default: 500},
	// 	Added duration  - value in terms of minutes Aashiq - 27/08/2020
	duration: {type: Number, default: 30}
});

let companyDetailsSchema = new Schema({
	name: String,
	code: String,
	address: String,
	config: ConfigScema,
	locations: [LocationDetailsScema]
}, {
		versionKey: false,
		timestamps: true,
	});

companyDetailsSchema.set("toObject", {
	virtuals: true
});

companyDetailsSchema.methods.toJSON = function () {
	let object = appUtils.clean(this.toObject());
	return object;
};

// Export companyDetails
export let company_details: Model<ICompanyDetails> = mongoose.model<ICompanyDetails>(config.CONSTANT.DB_MODEL_REF.COMPANY_DETAILS, companyDetailsSchema);
