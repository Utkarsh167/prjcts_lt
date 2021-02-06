"use strict";

import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import { Model } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";

let Schema = mongoose.Schema;

export interface ISubscription extends mongoose.Document {
	name: string;
	price: number;
	descreption: string;
	gracePeriod: number;
	expiryEndDate: number;
	validity: number;
}

let subscriptionSchema = new Schema({
	_id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
	name: { type: String, trim: true, required: true },
	price: { type: String, trim: true, required: true },
	description: { type: String, trim: true, required: true },
	gracePeriod: { type: Number, required: true },
	// validity: { type: Number, required: true },
	createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
	created: { type: Number, default: Date.now() },
	totalSubscribers: { type: Number, default: 0 },
	year: { type: Number, default: 0 },
	month: { type: Number, default: 0 },
	expiryDate: { type: Number, required: true, default: 0 },
	expiryEndDate: { type: Number, required: true, default: 0 },
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

subscriptionSchema.set("toObject", {
	virtuals: true
});

// OR
subscriptionSchema.methods.toJSON = function () {
	let object = appUtils.clean(this.toObject());
	return object;
};

// Export admin
export let subscriptions: Model<ISubscription> = mongoose.model<ISubscription>(config.CONSTANT.DB_MODEL_REF.SUBSCRIPTION, subscriptionSchema);