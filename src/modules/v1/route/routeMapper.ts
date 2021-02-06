"use strict";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import * as routeConstant from "@modules/v1/route/routeConstant";

const routeListResponseMapping = async function (routeList, exportData) {

	let array1 = [];
	for (let i = 0; i < routeList.hits.hits.length; i++) {
		let object = {};
		object["_id"] = routeList.hits.hits[i]._id;
		object = { ...object, ...routeList.hits.hits[i]._source };
		array1.push(object);
	}
	let array2 = [];
	for (let i = 0; i < exportData.hits.hits.length; i++) {
		let object = {};
		object["_id"] = exportData.hits.hits[i]._id;
		object = { ...object, ...exportData.hits.hits[i]._source };
		array2.push(object);
	}

	return { ...routeConstant.MESSAGES.SUCCESS.ROUTE_LIST, ...{ "data": { "userList": array1, "exportData": array2, "totalRecord": array2.length } } };
};

export let routeMapper = {
	routeListResponseMapping
};