"use strict";

import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import {Model} from "mongoose";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import {type} from "os";
let Schema = mongoose.Schema;

export interface IBookingSlot extends mongoose.Document {
    // Made fields as optional Aashiq 07/08/2020
    // regNo: string;
    // vehcileId?: string;
    // entryType?: string;
    // inTime?: number;
    // outTime?: number;
    // companyCode?: string;
    // VehicleInfo?: VehicleInfoManual;
    // createdBy?: mongoose.Schema.Types.ObjectId;
    // created?: number;
    userId: mongoose.Schema.Types.ObjectId;
    slotId: string;
    companyId: mongoose.Schema.Types.ObjectId;
    companyLocationName: string;
    floorName: string;
    bookedAt: number;
    created?: number;
    CreatedAt: Date;
}
let bookingSlotSchema = new Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    spotId: {type: String, required: true},
    bookedAt: {type: Number, required: true},
    companyId: {type: mongoose.Schema.Types.ObjectId, ref: 'comapny_details'},
    createdAt: {type: Date, default: Date.now()},
    created: {type: Number, default: Date.now()},
    companyLocationName: {type: String, required: true},
    floorName: {type: String, required: true},
    zoneName: {type: String, required: true}
    },
    {
        versionKey: false,
        timestamps: true,
});

bookingSlotSchema.set("toObject", {
    virtuals: true
});

// Load password virtually
// bookingSlotSchema.virtual("password")
//     .get(function () {
//         return this._password;
//     })
//     .set(function (password) {
//         this._password = password;
//         let salt = this.salt = bcrypt.genSaltSync(config.SERVER.SALT_ROUNDS);
//         // let salt = this.salt = appUtils.genRandomString(config.SERVER.SALT_ROUNDS);
//         this.hash = appUtils.encryptHashPassword(password, salt);
//     });

bookingSlotSchema.methods.toJSON = function () {
    let object = appUtils.clean(this.toObject());
    return object;
};

// Export entry_log
export let booking_slot: Model<IBookingSlot> = mongoose.model<IBookingSlot>(config.CONSTANT.DB_MODEL_REF.BOOKING_SLOT, bookingSlotSchema);
