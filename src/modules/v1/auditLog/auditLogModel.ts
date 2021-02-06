"use strict";

import * as mongoose from "mongoose";
import { Model } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";

let Schema = mongoose.Schema;

export interface IAuditLog extends mongoose.Document {
	userId: mongoose.Schema.Types.ObjectId;
	targetId: mongoose.Schema.Types.ObjectId;
	userName: string;
	userEmail: string;
	targetName: string;
	targetEmail: string;
	message: string;
	userType: string;
	crudAction: string;
	actionType: string;
	created: number;
	moduleName: string;
	companyCode: string;
}

let auditLogSchema = new Schema({
	moduleName: {
		type: String
	},
	companyCode: {
		type: String
	},
	message: {
		type: String
	},
	userName: { type: String },
	targetName: { type: String },
	userEmail: { type: String },
	targetEmail: { type: String },
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	targetId: {
		type: mongoose.Schema.Types.ObjectId,
		required: false
	},
	data: {},
	crudAction: {
		type: String,
		enum: ["CREATE", "DELETE", "UPDATE", "BLOCK", "UNBLOCK"]
	},
	adminType: {
		type: String,
		enum: [
			config.CONSTANT.ADMIN_TYPE.ADMIN,
			config.CONSTANT.ADMIN_TYPE.SUB_ADMIN,
		]
	},
	actionType: {
		type: String,
		enum: [
			config.CONSTANT.LOG_HISTORY_TYPE.ADD,
			config.CONSTANT.LOG_HISTORY_TYPE.EDIT,
			config.CONSTANT.LOG_HISTORY_TYPE.DELETE,
			config.CONSTANT.LOG_HISTORY_TYPE.BLOCK,
			config.CONSTANT.LOG_HISTORY_TYPE.UNBLOCK,
			config.CONSTANT.LOG_HISTORY_TYPE.ARCHIVE,
		]
	},
	created: { type: Number }
}, {
		versionKey: false,
		timestamps: true
	});

auditLogSchema.methods.toJSON = function () {
	let object = appUtils.clean(this.toObject());
	return object;
};

// Export log
export let audit_logs: Model<IAuditLog> = mongoose.model<IAuditLog>(config.CONSTANT.DB_MODEL_REF.AUDIT_LOG, auditLogSchema);