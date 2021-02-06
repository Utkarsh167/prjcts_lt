'use strict';

import * as config from '../config';
import { Worker } from '../lib/Worker';
// import * as socket from "../lib/socketManager";
import * as cron from "../lib/scheduler";

export class BootStrap {

	startWorkers() {
		new Worker().init();
	}
	// async initiateSocket(server) {
	// 	socket.connectSocket(server);
	// }
	async initialteScheduler() {
		cron.scheduler();
	}

}