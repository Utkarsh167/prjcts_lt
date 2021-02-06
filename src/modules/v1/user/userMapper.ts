"use strict";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import * as userConstant from "@modules/v1/user/userConstant";

const userListResponseMapping = async function (userList, exportData) {

	let array1 = [];
	for (let i = 0; i < userList.hits.hits.length; i++) {
		let object = {};
		object["_id"] = userList.hits.hits[i]._id;
		object = { ...object, ...userList.hits.hits[i]._source };
		array1.push(object);
	}
	let array2 = [];
	for (let i = 0; i < exportData.hits.hits.length; i++) {
		let object = {};
		object["_id"] = exportData.hits.hits[i]._id;
		object = { ...object, ...exportData.hits.hits[i]._source };
		array2.push(object);
	}

	return { ...userConstant.MESSAGES.SUCCESS.USER_LIST, ...{ "data": { "userList": array1, "exportData": array2, "totalRecord": array2.length } } };
};

const exportUserResponseMapping = async function (data: any) {
	const exportedData = [];
	let obj: any;
	let i = 0;
	data.forEach(element => {
		obj = {
			"sno": ++i,
			"firstName": element.firstName,
			"middleName": element.middleName ? element.middleName : "",
			"lastName": element.lastName ? element.lastName : "",
			"dob": element.dob ? appUtils.convertTimestampToUnixDate(element.dob) : "",
			"gender": element.gender ? ((element.gender === "male") ? "Male" : (element.gender === "female") ? "Female" : (element.gender === "other") ? "Other" : "") : "",
			"email": element.email ? element.email : "",
			"created": appUtils.convertTimestampToUnixDate(element.created),
			"status": (element.status === config.CONSTANT.STATUS.BLOCKED) ? "Blocked" : (element.status === config.CONSTANT.STATUS.UN_BLOCKED) ? "Active" : ""
		};
		exportedData.push(obj);
	});
	return exportedData;
};

export let userMapper = {
	userListResponseMapping,
	exportUserResponseMapping
};