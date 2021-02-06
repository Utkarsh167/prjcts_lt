"use strict";

import * as mongoose from "mongoose";
import { Model } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";

let Schema = mongoose.Schema;

export interface IWebNotification extends mongoose.Document {
	senderId: mongoose.Schema.Types.ObjectId;
	receiverId: mongoose.Schema.Types.ObjectId;
	title: string;
	message: string;
	deviceId: string;
	notificationType: number;
	isRead: boolean;
}

/**
 * @description used to track the notification history
 */
let web_notificationSchema = new Schema({
	senderId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: config.CONSTANT.DB_MODEL_REF.USERS
	},
	receiverId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: config.CONSTANT.DB_MODEL_REF.USERS
	},
	title: { type: String, required: true },
	message: { type: String, required: true },
	deviceId: { type: String },
	notificationType: { type: Number, required: true },
	isRead: { type: Boolean, default: false }
}, {
		versionKey: false,
		timestamps: true
	});

web_notificationSchema.set("toObject", {
	virtuals: true
});

web_notificationSchema.methods.toJSON = function () {
	let object = appUtils.clean(this.toObject());
	return object;
};

// Export notification schema
export let web_notifications: Model<IWebNotification> = mongoose.model<IWebNotification>(config.CONSTANT.DB_MODEL_REF.WEBNOTIFICATION, web_notificationSchema);