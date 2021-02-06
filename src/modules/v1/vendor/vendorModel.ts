"use strict";

import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import { Model } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";

let Schema = mongoose.Schema;

export interface IVendor extends mongoose.Document {
	name: string;
	email: string;
	countryCode: string;
	mobileNo: string;
	profilePicture: string;
	status: string;
	createdBy: object;
	created: number;
	adminType: number;
	companyCode: string;
}

let vendorSchema = new Schema({
	_id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
	// Vendor data
	name: { type: String, trim: true, index: true },
	createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
	companyCode: { type: String },
	adminType: { type: String, default: config.CONSTANT.ADMIN_TYPE.ADMIN },
	created: { type: Number, default: Date.now() },
	email: { type: String, trim: true, index: true, lowercase: true, default: "" },
	countryCode: { type: String, trim: true, index: true, default: "" },
	mobileNo: { type: String, trim: true, index: true, default: "" },
	profilePicture: { type: String, default: "" },
	badgeNo: { type: String, default: "" },
	cabCount: { type: Number, default: 0 },
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
	// reasonForArchive
	comment: { type: String}
}, {
		versionKey: false,
		timestamps: true
	});

vendorSchema.set("toObject", {
	virtuals: true
});

vendorSchema.methods.toJSON = function () {
	let object = appUtils.clean(this.toObject());
	return object;
};

// to set findAndModify false
mongoose.set("useFindAndModify", false);

// Export user
export let vendors: Model<IVendor> = mongoose.model<IVendor>(config.CONSTANT.DB_MODEL_REF.VENDOR, vendorSchema);