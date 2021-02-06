let schedule = require('node-schedule');

import { Mongoose } from 'mongoose';
import { Database } from '../utils/Database';
import { roasterController } from "@modules/v1/roaster/roasterController";
import { shiftRequestController } from "@modules/v1/shiftRequest/shiftRequestController";
import { AdminDao } from "@modules/v1/admin/AdminDao";
import { RoasterDao } from "@modules/v1/roaster/RoasterDao";
import { logger } from "@lib/logger";

let roasterDao = new RoasterDao();

export let scheduler = async function () {
	// schedule.scheduleJob('59 * * * * *', function () {
	// schedule.scheduleJob('* 59 23 * * 0-6', function () {
	// 	console.log('In 1 day cron job');
	// 	let args = {
	// 	};
	// 	roasterController.driverTripscheduler(args);
	// });

	// schedule.scheduleJob('1 0 * * *', function () {
	// 	console.log('');
	// 	console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ In 1 day cron job now (checkShiftChange) @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@22');
	// 	console.log('');
	// 	let args = {
	// 	};
	// 	shiftRequestController.checkShiftChange();
	// });

// 	schedule.scheduleJob('0 20 13 * * 0-6', function () {
// 		console.log('');
// 		console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ In 1 day cron job now first (checkShiftChange) @@@@@@@@@@@@@@@@@@@@@@@');
// 		console.log('');
// 		let args = {
// 		};
// 		logger.info("in 9 20 request call cron job");
// 		shiftRequestController.checkShiftChange();
// });

schedule.scheduleJob({hour: 18, minute: 10, dayOfWeek: [ 0 , 1 , 2 , 3 , 4 , 5 , 6 ] }, function () {
		console.log('');
		console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ In 1 day cron job now second (checkShiftChange) @@@@@@@@@@@@@@@@@@@@@@');
		console.log('');
		let args = {
		};
		logger.info("in 14 50 request call cron job");
		shiftRequestController.checkShiftChange();
});

	schedule.scheduleJob({hour: 18, minute: 20, dayOfWeek: [ 0 , 1 , 2 , 3 , 4 , 5 , 6 ] }, function () {
		console.log('');
		console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ In 1 day cron job now (weekOffRequestList) @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@22');
		console.log('');
		let args = {
		};
		shiftRequestController.weekOffRequestList();
	});

	// schedule.scheduleJob('30 4 * * * ', function () {
	// 	console.log('');
	// 	console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ In 1 day cron job now (roster end date notified to admin) @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@22');
	// 	console.log('');
	// 	let args = {
	// 	};
	// 	roasterController.rosterEndNotified();
	// });

	/* Added scheduler to check trip missed status - Shivakumar A */
	schedule.scheduleJob('0 */15 * * * *', function(){
		roasterController.checkAllrosterDriver();
		console.log('*****check missed trip every 15 minutes!*****', new Date().toLocaleString());
	  });
};
