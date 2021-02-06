"use strict";

import * as Joi from "joi";

import { fieldsValidator } from "@utils/fieldsValidator";
let validateEntryLogList = Joi.object({
    fromDate: fieldsValidator.fromDate,
    toDate: fieldsValidator.toDate,
}).unknown();

let validateUserList = Joi.object({
    pageNo: fieldsValidator.pageNo,
    limit: fieldsValidator.limit,
    searchKey: Joi.string().optional().description("Search by name, email, employeeId"),
    companyLocationName: Joi.string().optional().description("company Location name"),
    sortBy: Joi.string().trim().lowercase({ force: true }).valid("name", "created", "driverId", "shiftEndTime", "shiftStartTime", "employeeId").optional().description("name, created,employeeId,driverId,shiftStartTime, shiftEndTime"),
    sortOrder: fieldsValidator.sortOrder,
    status: fieldsValidator.status["optional"],
    fromDate: fieldsValidator.fromDate,
    toDate: fieldsValidator.toDate,
    userType: fieldsValidator.userType,
    shiftName: Joi.string().optional().allow("").label("Shift Name"),
    isAddressChangeReq: Joi.boolean().optional().allow("").label("isAddressChangeReq true for address change request list"),
    isArchived: Joi.boolean().optional().allow("").label("isArchived true for archived user list"),
}).unknown();
export {
	validateEntryLogList,
    validateUserList
};
