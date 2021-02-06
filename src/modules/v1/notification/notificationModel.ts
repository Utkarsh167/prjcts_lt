"use strict";

import * as mongoose from "mongoose";
import { Model } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";

let Schema = mongoose.Schema;

export interface INotification extends mongoose.Document {
	senderId: mongoose.Schema.Types.ObjectId;
	receiverId: mongoose.Schema.Types.ObjectId;
	title: string;
	message: string;
	deviceId: string;
	notificationType: number;
	isRead: boolean;
	companyCode: string;
}

/**
 * @description used to track the notification history
 */
let notificationSchema = new Schema({
	senderId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: config.CONSTANT.DB_MODEL_REF.USERSNEW
	},
	receiverId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: config.CONSTANT.DB_MODEL_REF.USERSNEW
	},
	companyCode: { type: String },
	title: { type: String, required: true },
	message: { type: String, required: true },
	deviceId: { type: String },
	notificationType: { type: Number, required: true },
	isRead: { type: Boolean, default: false }
}, {
		versionKey: false,
		timestamps: true
	});

notificationSchema.set("toObject", {
	virtuals: true
});

notificationSchema.methods.toJSON = function () {
	let object = appUtils.clean(this.toObject());
	return object;
};

// Export notification schema
export let notifications: Model<INotification> = mongoose.model<INotification>(config.CONSTANT.DB_MODEL_REF.NOTIFICATION, notificationSchema);