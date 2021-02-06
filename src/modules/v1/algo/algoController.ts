"use strict";

import * as _ from "lodash";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import * as algoConstant from "@modules/v1/algo/algoConstant";
import { AlgoDao } from "@modules/v1/algo/index";

let algoDao = new AlgoDao();

/**
 * @function algo
 * @description create employees groups and routes with ETA
 * @author Bilal Khan
 */
const algo = async function (params: AlgoDataRequest) {
	try {
		let groups = await algoDao.grouping(params);
		let routes = await algoDao.routing(groups);
		return algoConstant.MESSAGES.SUCCESS.ALGO_DATA(routes);
	} catch (error) {
		throw error;
	}
};

/**
 * @function routing
 * @description create routes with ETA
 * @author Bilal Khan
 */
const routing = async function (params: RoutingDataRequest) {
		try {
			let routes = await algoDao.routing(params);
			return algoConstant.MESSAGES.SUCCESS.ALGO_DATA(routes);
		} catch (error) {
			throw error;
		}
	};

/**
 * @function algoRegenerate
 * @description Recreate employees groups and routes with ETA
 * @author Bilal Khan
 */
const algoRegenerate = async function (params: AlgoRegenerateDataRequest) {
	try {
		let groups = await algoDao.reGrouping(params);
		let routes = await algoDao.routing(groups);
		return algoConstant.MESSAGES.SUCCESS.ALGO_DATA(routes);
	} catch (error) {
		throw error;
	}
};

export let algoController = {
	algo,
	routing,
	algoRegenerate
};