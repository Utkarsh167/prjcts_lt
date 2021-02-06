"use strict";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import * as vendorConstant from "@modules/v1/vendor/vendorConstant";

const vendorListResponseMapping = async function (vendorList, exportData) {

	let array1 = [];
	for (let i = 0; i < vendorList.hits.hits.length; i++) {
		let object = {};
		object["_id"] = vendorList.hits.hits[i]._id;
		object = { ...object, ...vendorList.hits.hits[i]._source };
		array1.push(object);
	}
	let array2 = [];
	for (let i = 0; i < exportData.hits.hits.length; i++) {
		let object = {};
		object["_id"] = exportData.hits.hits[i]._id;
		object = { ...object, ...exportData.hits.hits[i]._source };
		array2.push(object);
	}

	return { ...vendorConstant.MESSAGES.SUCCESS.VENDOR_LIST, ...{ "data": { "userList": array1, "exportData": array2, "totalRecord": array2.length } } };
};

const exportVendorResponseMapping = async function (data: any) {
	const exportedData = [];
	let obj: any;
	let i = 0;
	data.forEach(element => {
		obj = {
			"sno": ++i,
			"name": element.name ? element.name : "",
			"email": element.email ? element.email : "",
			"created": appUtils.convertTimestampToUnixDate(element.created),
			"status": (element.status === config.CONSTANT.STATUS.BLOCKED) ? "Blocked" : (element.status === config.CONSTANT.STATUS.UN_BLOCKED) ? "Active" : ""
		};
		exportedData.push(obj);
	});
	return exportedData;
};

export let vendorMapper = {
	vendorListResponseMapping,
	exportVendorResponseMapping
};