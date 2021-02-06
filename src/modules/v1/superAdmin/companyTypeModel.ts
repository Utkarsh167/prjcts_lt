"use strict";

import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import { Model } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";

let Schema = mongoose.Schema;

export interface ICompanyType extends mongoose.Document {
	companyType: string;
}

let companyTypeSchema = new Schema({
	_id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
	companyType: { type: String, trim: true, required: true },
	createdBy: { type: mongoose.Schema.Types.ObjectId },
	created: { type: Number, default: Date.now() },
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
	}
}, {
		versionKey: false,
		timestamps: true,

	});

companyTypeSchema.set("toObject", {
	virtuals: true
});

// OR
companyTypeSchema.methods.toJSON = function () {
	let object = appUtils.clean(this.toObject());
	return object;
};

// company_types
export let company_types: Model<ICompanyType> = mongoose.model<ICompanyType>(config.CONSTANT.DB_MODEL_REF.COMPANY_TYPE, companyTypeSchema);