"use strict";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import * as roasterConstant from "@modules/v1/roaster/roasterConstant";

const cabListResponseMapping = async function (cabList, exportData) {

	let array1 = [];
	for (let i = 0; i < cabList.hits.hits.length; i++) {
		let object = {};
		object["_id"] = cabList.hits.hits[i]._id;
		object = { ...object, ...cabList.hits.hits[i]._source };
		array1.push(object);
	}
	let array2 = [];
	for (let i = 0; i < exportData.hits.hits.length; i++) {
		let object = {};
		object["_id"] = exportData.hits.hits[i]._id;
		object = { ...object, ...exportData.hits.hits[i]._source };
		array2.push(object);
	}

	return { ...roasterConstant.MESSAGES.SUCCESS.ROASTER_LIST, ...{ "data": { "userList": array1, "exportData": array2, "totalRecord": array2.length } } };
};

const exportCabResponseMapping = async function (data: any) {
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

export let roasterMapper = {
	cabListResponseMapping,
	exportCabResponseMapping
};