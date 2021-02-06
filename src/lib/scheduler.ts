let schedule = require('node-schedule');

import { Mongoose } from 'mongoose';
import { Database } from '../utils/Database';
import { adminController } from "@modules/v1/admin/adminController";

export let scheduler = async function () {

	// schedule.scheduleJob('59 * * * * *', function () {
	schedule.scheduleJob('* 59 23 * * 0-7', function () {
		console.log('In 1 day cron job');
		let args = {
		};
		adminController.expiredCompany(args);
	});
};