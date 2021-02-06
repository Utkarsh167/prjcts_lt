let kue = require("kue");
let Queue = kue.createQueue();

import * as Config from '../config';
import * as pushNotification from '@utils/pushNotification';
import { adminNotificationController } from "@modules/v1/adminNotification/adminNotificationController";

let scheduleJob = data => {
	console.log(data.time - Date.now() + "=========================" + Date.now() + "==============" + data.time);
	Queue.createJob(data.jobName, data.params)
		.attempts(3)
		.delay(data.time - Date.now()) // relative to now. (data.time - Data.now())
		.save();
};

Queue.process(Config.CONSTANT.JOB_SCHEDULER_TYPE.NOTIFICATION_SEND_LATER, async function (job, done) {
	let { data } = job;
	console.log(data);
	console.log("Scheduler  job trigger ");
	let step3 = await adminNotificationController.sendDraftNotification(data);
	// let step1 = notificationManager.upcomingAppointmentAlert(data);
	done();
});

export class RedisScheduler {

	static init(args) {
		scheduleJob(args);
	}
}