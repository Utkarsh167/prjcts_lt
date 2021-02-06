"use strict";

import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import { Model } from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";

let Schema = mongoose.Schema;

export interface IPermission extends mongoose.Document {
	moduleName: AdminPermission;
}
let moduleName = new Schema({
	moduleName: { type: mongoose.Schema.Types.String, required: true },
	moduleKey: { type: mongoose.Schema.Types.String, required: true },
});
let permissionSchema = new Schema({
	moduleName: [moduleName],
	status: {
		type: String,
		enum: [
			config.CONSTANT.STATUS.BLOCKED,
			config.CONSTANT.STATUS.UN_BLOCKED,
			config.CONSTANT.STATUS.DELETED
		],
		default: config.CONSTANT.STATUS.UN_BLOCKED
	}
}, {
		versionKey: false,
		timestamps: true,
	});
permissionSchema.set("toObject", {
	virtuals: true
});

permissionSchema.methods.toJSON = function () {
	let object = appUtils.clean(this.toObject());
	return object;
};

// Export admin
export let permissions: Model<IPermission> = mongoose.model<IPermission>(config.CONSTANT.DB_MODEL_REF.PERMISSION, permissionSchema);