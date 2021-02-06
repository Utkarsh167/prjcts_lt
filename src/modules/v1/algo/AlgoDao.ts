"use strict";

import * as _ from "lodash";
import * as config1 from "@config/environment";
import * as moment from "moment";
const distFrom = require('distance-from');
const asyncLoop = require('node-async-loop');
const googleMapsClient = require('@google/maps').createClient({
	key: config1.SERVER.GOOGLE_API_KEY,
	Promise: Promise
});

export class AlgoDao {

	// Added gender in required objects - Shivakumar A
	/**
	 * @function grouping
	 */
	async grouping(params: AlgoDataRequest) {
		let h = 0;
		let groupsObject: any = {
			waitTime: params.waitTime,
			officeLocation: params.officeLocation,
			maxTripDuration: params.maxTripDuration
		};
		let groups = [];
		loop1: for await (let emp of params.employees) {
			let loginFlag = 0;
			let logoutFlag = 0;
			if (groups.length === 0) {
				let loginGrpObj = {
					grpId: 1,
					empCount: 1,
					grpCentre: emp.location,
					shiftName: emp.shift,
					shiftType: 'login',
					shiftTime: emp.shiftStartTime,
					employees: [{
						empId: emp.empId,
						empLocation: emp.location,
						weekOff: emp.weekOff,
						name: emp.name,
						employeeId: emp.employeeId,
						countryCode: emp.countryCode,
						mobileNo: emp.mobileNo,
						address: emp.address,
						// Added gender - Shivakumar A
						gender: emp.gender
					}],
					maxGroupSize: params.maxGroupSize,
					waitTime: params.waitTime,
					maxTripDuration: params.maxTripDuration
				};
				groups.push(loginGrpObj);
				let logoutGrpObj = {
					grpId: 2,
					empCount: 1,
					grpCentre: emp.location,
					shiftName: emp.shift,
					shiftType: 'logout',
					shiftTime: emp.shiftEndTime,
					employees: [{
						empId: emp.empId,
						empLocation: emp.location,
						weekOff: emp.weekOff,
						name: emp.name,
						employeeId: emp.employeeId,
						countryCode: emp.countryCode,
						mobileNo: emp.mobileNo,
						address: emp.address,
						// Added gender - Shivakumar A
						gender: emp.gender
					}],
					maxGroupSize: params.maxGroupSize,
					waitTime: params.waitTime,
					maxTripDuration: params.maxTripDuration
				};
				groups.push(logoutGrpObj);
				continue loop1;
			}
			else {
				loop2: for (let grp of groups) {
					if (loginFlag === 1 && logoutFlag === 1)
						continue loop1;
					if (grp.empCount < params.maxGroupSize) {
						if (grp.shiftType === "login" && emp.shiftStartTime === grp.shiftTime && emp.shift === grp.shiftName) {
							let distance = distFrom([grp.grpCentre.lat, grp.grpCentre.long]).to([emp.location.lat, emp.location.long]);
							if (distance.distance.v <= 3) {
								if (loginFlag === 1)
									continue loop2;
								grp.empCount = grp.empCount + 1;
								grp.employees.push({
									empId: emp.empId,
									empLocation: emp.location,
									weekOff: emp.weekOff,
									name: emp.name,
									employeeId: emp.employeeId,
									countryCode: emp.countryCode,
									mobileNo: emp.mobileNo,
									address: emp.address,
						            // Added gender - Shivakumar A
						            gender: emp.gender

								});
								loginFlag = 1;
								continue loop2;
							}
							else {
								continue loop2;
							}
						}
						else if (grp.shiftType === "logout" && emp.shiftEndTime === grp.shiftTime && emp.shift === grp.shiftName) {
							let distance = distFrom([grp.grpCentre.lat, grp.grpCentre.long]).to([emp.location.lat, emp.location.long]);
							if (distance.distance.v <= 3) {
								if (logoutFlag === 1)
									continue loop2;
								grp.empCount = grp.empCount + 1;
								grp.employees.push({
									empId: emp.empId,
									empLocation: emp.location,
									weekOff: emp.weekOff,
									name: emp.name,
									employeeId: emp.employeeId,
									countryCode: emp.countryCode,
									mobileNo: emp.mobileNo,
									address: emp.address,
						            // Added gender - Shivakumar A
						            gender: emp.gender

								});
								logoutFlag = 1;
								continue loop2;
							}
							else {
								continue loop2;
							}
						}
						else {
							continue loop2;
						}
					}
					else {
						continue loop2;
					}
				}
				if (loginFlag === 0 && logoutFlag === 0) {
					createLoginGroup();
					createLogoutGroup();
					continue loop1;
				}
				else if (loginFlag === 0) {
					createLoginGroup();
					continue loop1;
				}
				else if (logoutFlag === 0) {
					createLogoutGroup();
					continue loop1;
				}
				else {
					continue loop1;
				}

				function createLoginGroup() {
					let loginGrpObj = {
						grpId: groups.length + 1,
						empCount: 1,
						grpCentre: emp.location,
						shiftName: emp.shift,
						shiftType: 'login',
						shiftTime: emp.shiftStartTime,
						employees: [{
							empId: emp.empId,
							empLocation: emp.location,
							name: emp.name,
							weekOff: emp.weekOff,
							employeeId: emp.employeeId,
							countryCode: emp.countryCode,
							mobileNo: emp.mobileNo,
							address: emp.address,
						    // Added gender - Shivakumar A
						    gender: emp.gender

						}],
						maxGroupSize: params.maxGroupSize,
						waitTime: params.waitTime,
						maxTripDuration: params.maxTripDuration
					};
					groups.push(loginGrpObj);
				}
				function createLogoutGroup() {
					let logoutGrpObj = {
						grpId: groups.length + 1,
						empCount: 1,
						grpCentre: emp.location,
						shiftName: emp.shift,
						shiftType: 'logout',
						shiftTime: emp.shiftEndTime,
						employees: [{
							empId: emp.empId,
							empLocation: emp.location,
							weekOff: emp.weekOff,
							name: emp.name,
							employeeId: emp.employeeId,
							countryCode: emp.countryCode,
							mobileNo: emp.mobileNo,
							address: emp.address,
						    // Added gender - Shivakumar A
					        gender: emp.gender

						}],
						maxGroupSize: params.maxGroupSize,
						waitTime: params.waitTime,
						maxTripDuration: params.maxTripDuration
					};
					groups.push(logoutGrpObj);
				}
			}
		}
		groupsObject.groups = groups;
		return groupsObject;
	}

	/**
	 * @function routing
	 */
	routing = (params) => {
		return new Promise((resolve, reject) => {
			let resultData = [];
			let c = 0;
			asyncLoop(params.groups, async (grp, next) => {
				let origin;
				let destination;
				let farthestEmployee: any = {};
				let waypoints;
				if (grp.optimize === false) {
					waypoints = 'optimize:false';
					if (grp.shiftType === 'login') {
						farthestEmployee = await grp.employees.splice(0, 1);
						origin = farthestEmployee[0].empLocation.lat + ',' + farthestEmployee[0].empLocation.long;
						destination = params.officeLocation.lat + ',' + params.officeLocation.long;
					}
					else {
						farthestEmployee = await grp.employees.splice(grp.employees.length - 1, 1);
						origin = params.officeLocation.lat + ',' + params.officeLocation.long;
						destination = farthestEmployee[0].empLocation.lat + ',' + farthestEmployee[0].empLocation.long;
					}
				}
				else {
					waypoints = 'optimize:true';
					for (let [i, emp] of grp.employees.entries()) {
						let distance = distFrom([params.officeLocation.lat, params.officeLocation.long]).to([emp.empLocation.lat, emp.empLocation.long]);
						emp.officeDistance = distance.distance.v;
					}
					if (grp.shiftType === 'login') {
						await grp.employees.sort(function (b, a) { return a.officeDistance - b.officeDistance; });
						farthestEmployee = await grp.employees.splice(0, 1);
						origin = farthestEmployee[0].empLocation.lat + ',' + farthestEmployee[0].empLocation.long;
						destination = params.officeLocation.lat + ',' + params.officeLocation.long;
					}
					else {
						await grp.employees.sort(function (a, b) { return a.officeDistance - b.officeDistance; });
						farthestEmployee = await grp.employees.splice(grp.employees.length - 1, 1);
						origin = params.officeLocation.lat + ',' + params.officeLocation.long;
						destination = farthestEmployee[0].empLocation.lat + ',' + farthestEmployee[0].empLocation.long;
					}
				}
				await _.map(grp.employees, (empl) => { waypoints = waypoints.concat('|', empl.empLocation.lat, ',', empl.empLocation.long); });
				let googleObj: any = {
					origin: origin,
					destination: destination,
				};
				if (grp.employees.length > 0)
					googleObj.waypoints = waypoints;

				await googleMapsClient.directions(googleObj)
					.asPromise()
					.then((response) => {
						grp.route = response.json.routes[0].overview_polyline;
						grp.bounds = response.json.routes[0].bounds;
						let empCounter = grp.employees.length - 1;
						let empCounter1 = 0;
						if (grp.shiftType === 'login') {
							if (response.json.routes[0].waypoint_order.length > 0 && grp.optimize !== false)
								grp.startLocation = response.json.routes[0].legs[0].end_address;
							else
								grp.startLocation = response.json.routes[0].legs[0].start_address;
							grp.endLocation = response.json.routes[0].legs[response.json.routes[0].legs.length - 1].end_address;
							let nextStopTime = moment(grp.shiftTime, 'HH mm').format('HH mm');
							let extraDaysMinutes = 0;
							asyncLoop(response.json.routes[0].legs, -1, 0, (leg, prevLeg) => {
								let ar = leg.duration.text.split(" ");
								let minutes = 0;
								ar.filter(function (item, index) {
									if (item.includes('year'))
										minutes = minutes + moment.duration(parseInt(ar[index - 1]), "years").asMinutes();
									else if (item.includes('month'))
										minutes = minutes + moment.duration(parseInt(ar[index - 1]), "months").asMinutes();
									else if (item.includes('week'))
										minutes = minutes + moment.duration(parseInt(ar[index - 1]), "weeks").asMinutes();
									else if (item.includes('day')) {
										minutes = minutes + moment.duration(parseInt(ar[index - 1]), "days").asMinutes();
										extraDaysMinutes = moment.duration(parseInt(ar[index - 1]), "days").asMinutes();
									}
									else if (item.includes('hour'))
										minutes = minutes + moment.duration(parseInt(ar[index - 1]), "hours").asMinutes();
									else if (item.includes('min'))
										minutes = minutes + moment.duration(parseInt(ar[index - 1]), "minutes").asMinutes();
									else if (item.includes('sec'))
										minutes = minutes + moment.duration(parseInt(ar[index - 1]), "seconds").asMinutes();
								});
								let pickupTime = moment(nextStopTime, 'HH mm').subtract(minutes, "minutes").subtract(params.waitTime, "minutes").format('HH mm');
								if (empCounter >= 0 && empCounter < response.json.routes[0].waypoint_order.length)
									grp.employees[response.json.routes[0].waypoint_order.indexOf(empCounter)].empPickupTime = pickupTime;
								else
									farthestEmployee[0].empPickupTime = pickupTime;
								nextStopTime = pickupTime;
								empCounter = empCounter - 1;
								prevLeg();
							}, (err) => {
								if (err) {
									console.log('err: ', err);
								}
								let tripTime;
								let startTime = moment(farthestEmployee[0].empPickupTime, 'HH mm');
								let endTime = moment(grp.shiftTime, 'HH mm');
								if (endTime.isBefore(startTime)) {
									let arr = farthestEmployee[0].empPickupTime.split(' ');
									let arr1 = grp.shiftTime.split(':');
									let prevDayMinutes = 0;
									let currentDay = 0;
									prevDayMinutes = prevDayMinutes + moment.duration(parseInt(arr[0]), "hours").asMinutes();
									prevDayMinutes = prevDayMinutes + moment.duration(parseInt(arr[1]), "minutes").asMinutes();
									currentDay = currentDay + moment.duration(parseInt(arr1[0]), "hours").asMinutes();
									currentDay = currentDay + moment.duration(parseInt(arr1[1]), "minutes").asMinutes();
									tripTime = moment("23:59", 'HH mm').diff(moment(farthestEmployee[0].empPickupTime, 'HH mm'), 'minutes') + 1 + currentDay + extraDaysMinutes;
								}
								else {
									tripTime = endTime.diff(startTime, 'minutes');
								}
								grp.totalTripTime = tripTime;
								if (response.json.routes[0].waypoint_order.length > 0) {
									asyncLoop(response.json.routes[0].waypoint_order, (order, nextOrder) => {
										grp.employees[response.json.routes[0].waypoint_order.indexOf(order)].empOrder = order + 1;
										let beginningTime = moment(farthestEmployee[0].empPickupTime, 'HH mm');
										let endingTime = moment(grp.employees[response.json.routes[0].waypoint_order.indexOf(order)].empPickupTime, 'HH mm');
										let ETA;
										if (endingTime.isBefore(beginningTime)) {
											let arr = farthestEmployee[0].empPickupTime.split(' ');
											let arr1 = grp.employees[response.json.routes[0].waypoint_order.indexOf(order)].empPickupTime.split(' ');
											let prevDayMinutes = 0;
											let currentDay = 0;
											prevDayMinutes = prevDayMinutes + moment.duration(parseInt(arr[0]), "hours").asMinutes();
											prevDayMinutes = prevDayMinutes + moment.duration(parseInt(arr[1]), "minutes").asMinutes();
											currentDay = currentDay + moment.duration(parseInt(arr1[0]), "hours").asMinutes();
											currentDay = currentDay + moment.duration(parseInt(arr1[1]), "minutes").asMinutes();
											ETA = moment("23:59", 'HH mm').diff(moment(farthestEmployee[0].empPickupTime, 'HH mm'), 'minutes') + 1 + currentDay + extraDaysMinutes;
										}
										else {
											ETA = moment(grp.employees[response.json.routes[0].waypoint_order.indexOf(order)].empPickupTime, 'HH mm').diff(moment(farthestEmployee[0].empPickupTime, 'HH mm'), 'minutes');
										}
										grp.employees[response.json.routes[0].waypoint_order.indexOf(order)].empETA = ETA;
										nextOrder();
									}, (err) => {
										if (err) {
											console.log('err: ', err);
										}
									});
								}
								farthestEmployee[0].empOrder = 0;
								farthestEmployee[0].empETA = 0;
								grp.employees.splice(0, 0, farthestEmployee[0]);
							});
						}
						else {
							grp.startLocation = response.json.routes[0].legs[0].start_address;
							if (response.json.routes[0].waypoint_order.length > 0 && grp.optimize !== false)
								grp.endLocation = response.json.routes[0].legs[response.json.routes[0].legs.length - 1].start_address;
							else
								grp.endLocation = response.json.routes[0].legs[response.json.routes[0].legs.length - 1].end_address;
							let nextStopTime = moment(grp.shiftTime, 'HH mm').format('HH mm');
							let extraDaysMinutes = 0;
							asyncLoop(response.json.routes[0].legs, 0, -1, (leg, nextLeg) => {
								let ar = leg.duration.text.split(" ");
								let minutes = 0;
								ar.filter(function (item, index) {
									if (item.includes('year'))
										minutes = minutes + moment.duration(parseInt(ar[index - 1]), "years").asMinutes();
									else if (item.includes('month'))
										minutes = minutes + moment.duration(parseInt(ar[index - 1]), "months").asMinutes();
									else if (item.includes('week'))
										minutes = minutes + moment.duration(parseInt(ar[index - 1]), "weeks").asMinutes();
									else if (item.includes('day')) {
										minutes = minutes + moment.duration(parseInt(ar[index - 1]), "days").asMinutes();
										extraDaysMinutes = moment.duration(parseInt(ar[index - 1]), "days").asMinutes();
									}
									else if (item.includes('hour'))
										minutes = minutes + moment.duration(parseInt(ar[index - 1]), "hours").asMinutes();
									else if (item.includes('min'))
										minutes = minutes + moment.duration(parseInt(ar[index - 1]), "minutes").asMinutes();
									else if (item.includes('sec'))
										minutes = minutes + moment.duration(parseInt(ar[index - 1]), "seconds").asMinutes();
								});
								let dropTime = moment(nextStopTime, 'HH mm').add(minutes, "minutes").format('HH mm');
								if (empCounter1 < response.json.routes[0].waypoint_order.length)
									grp.employees[response.json.routes[0].waypoint_order.indexOf(empCounter1)].empDropTime = dropTime;
								else
									farthestEmployee[0].empDropTime = dropTime;
								nextStopTime = dropTime;
								empCounter1 = empCounter1 + 1;
								nextLeg();
							}, (err) => {
								if (err) {
									console.log('err: ', err);
								}
								let startTime = moment(grp.shiftTime, 'HH mm');
								let endTime = moment(farthestEmployee[0].empDropTime, 'HH mm');
								let tripTime;
								if (endTime.isBefore(startTime)) {
									let arr = farthestEmployee[0].empDropTime.split(' ');
									let nextDayMinutes = 0;
									nextDayMinutes = nextDayMinutes + moment.duration(parseInt(arr[0]), "hours").asMinutes();
									nextDayMinutes = nextDayMinutes + moment.duration(parseInt(arr[1]), "minutes").asMinutes();
									tripTime = moment("23:59", 'HH mm').diff(moment(grp.shiftTime, 'HH mm'), 'minutes') + 1 + nextDayMinutes + extraDaysMinutes;
								}
								else {
									tripTime = endTime.diff(startTime, 'minutes');
								}
								grp.totalTripTime = tripTime;
								if (response.json.routes[0].waypoint_order.length > 0) {
									asyncLoop(response.json.routes[0].waypoint_order, (order, nextOrder) => {
										grp.employees[response.json.routes[0].waypoint_order.indexOf(order)].empOrder = order;
										let beginningTime = moment(grp.shiftTime, 'HH mm');
										let endingTime = moment(grp.employees[response.json.routes[0].waypoint_order.indexOf(order)].empDropTime, 'HH mm');
										let ETA;
										if (endingTime.isBefore(beginningTime)) {
											let arr = grp.employees[response.json.routes[0].waypoint_order.indexOf(order)].empDropTime.split(' ');
											let nextDayMinutes = 0;
											nextDayMinutes = nextDayMinutes + moment.duration(parseInt(arr[0]), "hours").asMinutes();
											nextDayMinutes = nextDayMinutes + moment.duration(parseInt(arr[1]), "minutes").asMinutes();
											ETA = moment("23:59", 'HH mm').diff(moment(grp.shiftTime, 'HH mm'), 'minutes') + 1 + nextDayMinutes + extraDaysMinutes;
										}
										else {
											ETA = moment(grp.employees[response.json.routes[0].waypoint_order.indexOf(order)].empDropTime, 'HH mm').diff(moment(grp.shiftTime, 'HH mm'), 'minutes');
										}
										grp.employees[response.json.routes[0].waypoint_order.indexOf(order)].empETA = ETA;
										nextOrder();
									}, (err) => {
										if (err) {
											console.log('err: ', err);
										}
									});
								}
								let beginningTime = moment(grp.shiftTime, 'HH mm');
								let endingTime = moment(farthestEmployee[0].empDropTime, 'HH mm');
								let ETA;
								if (endingTime.isBefore(beginningTime)) {
									let arr = farthestEmployee[0].empDropTime.split(' ');
									let nextDayMinutes = 0;
									nextDayMinutes = nextDayMinutes + moment.duration(parseInt(arr[0]), "hours").asMinutes();
									nextDayMinutes = nextDayMinutes + moment.duration(parseInt(arr[1]), "minutes").asMinutes();
									ETA = moment("23:59", 'HH mm').diff(moment(grp.shiftTime, 'HH mm'), 'minutes') + 1 + nextDayMinutes + extraDaysMinutes;
								}
								else {
									ETA = moment(farthestEmployee[0].empDropTime, 'HH mm').diff(moment(grp.shiftTime, 'HH mm'), 'minutes');
								}
								farthestEmployee[0].empETA = ETA;
								farthestEmployee[0].empOrder = response.json.routes[0].waypoint_order.length;
								grp.employees.splice(grp.employees.length, 0, farthestEmployee[0]);
							});
						}
						next();
					})
					.catch((err) => {
						console.log('errr: ', err);
					});
				_.map(grp.employees, (empl) => { delete empl.officeDistance; });
				resultData.push(grp);
			}, (err) => {
				if (err) {
					console.log('err: ', err);
					reject(new Error(err));
				}
				resolve(resultData);
			});

		});
	}

	/**
	 * @function reGrouping
	 */
	async reGrouping(params: AlgoRegenerateDataRequest) {
		let groupsObject: any = {
			waitTime: params.waitTime,
			officeLocation: params.officeLocation,
			maxTripDuration: params.maxTripDuration
		};
		let groups = [];
		await asyncLoop(params.employees, (emp, next) => {
			let loginFlag = 0;
			let logoutFlag = 0;
			if (groups.length === 0) {
				let grpObj = {
					grpId: 2,
					empCount: 1,
					grpCentre: emp.location,
					shiftName: emp.shiftName,
					shiftType: emp.shiftType,
					shiftTime: emp.shiftTime,
					employees: [{
						empId: emp.empId,
						empLocation: emp.location,
						weekOff: emp.weekOff,
						name: emp.name,
						employeeId: emp.employeeId,
						countryCode: emp.countryCode,
						mobileNo: emp.mobileNo,
						address: emp.address,
						// Added gender - Shivakumar A
						gender: emp.gender

					}],
					maxGroupSize: params.maxGroupSize,
					waitTime: params.waitTime,
					maxTripDuration: params.maxTripDuration
				};
				groups.push(grpObj);
				next();
			}
			else {
				asyncLoop(groups, (grp, next1) => {
					if (grp.empCount < params.maxGroupSize) {
						if (grp.shiftType === "login" && emp.shiftTime === grp.shiftTime && emp.shiftName === grp.shiftName) {
							let distance = distFrom([grp.grpCentre.lat, grp.grpCentre.long]).to([emp.location.lat, emp.location.long]);
							if (distance.distance.v <= 3) {
								grp.empCount = grp.empCount + 1;
								grp.employees.push({
									empId: emp.empId,
									empLocation: emp.location,
									weekOff: emp.weekOff,
									name: emp.name,
									employeeId: emp.employeeId,
									countryCode: emp.countryCode,
									mobileNo: emp.mobileNo,
									address: emp.address,
						            // Added gender - Shivakumar A
						            gender: emp.gender

								});
								loginFlag = 1;
								next1();
							}
							else {
								next1();
							}
						}
						else if (grp.shiftType === "logout" && emp.shiftTime === grp.shiftTime && emp.shiftName === grp.shiftName) {
							let distance = distFrom([grp.grpCentre.lat, grp.grpCentre.long]).to([emp.location.lat, emp.location.long]);
							if (distance.distance.v <= 3) {
								grp.empCount = grp.empCount + 1;
								grp.employees.push({
									empId: emp.empId,
									empLocation: emp.location,
									weekOff: emp.weekOff,
									name: emp.name,
									employeeId: emp.employeeId,
									countryCode: emp.countryCode,
									mobileNo: emp.mobileNo,
									address: emp.address,
						           // Added gender - Shivakumar A
						            gender: emp.gender

								});
								logoutFlag = 1;
								next1();
							}
							else {
								next1();
							}
						}
						else {
							next1();
						}
					}
					else {
						next1();
					}
				}, (err) => {
					if (err) {
						console.log('err');
					}
					if (loginFlag === 0 && emp.shiftType === 'login') {
						createLoginGroup();
						next();
					}
					else if (logoutFlag === 0 && emp.shiftType === 'logout') {
						createLogoutGroup();
						next();
					}
					else {
						next();
					}

					function createLoginGroup() {
						let loginGrpObj = {
							grpId: groups.length + 1,
							empCount: 1,
							grpCentre: emp.location,
							shiftName: emp.shiftName,
							shiftType: 'login',
							shiftTime: emp.shiftTime,
							employees: [{
								empId: emp.empId,
								empLocation: emp.location,
								weekOff: emp.weekOff,
								name: emp.name,
								employeeId: emp.employeeId,
								countryCode: emp.countryCode,
								mobileNo: emp.mobileNo,
								address: emp.address,
						        // Added gender - Shivakumar A
						        gender: emp.gender

							}],
							maxGroupSize: params.maxGroupSize,
							waitTime: params.waitTime,
							maxTripDuration: params.maxTripDuration
						};
						groups.push(loginGrpObj);
					}
					function createLogoutGroup() {
						let logoutGrpObj = {
							grpId: groups.length + 1,
							empCount: 1,
							grpCentre: emp.location,
							shiftName: emp.shiftName,
							shiftType: 'logout',
							shiftTime: emp.shiftTime,
							employees: [{
								empId: emp.empId,
								empLocation: emp.location,
								weekOff: emp.weekOff,
								name: emp.name,
								employeeId: emp.employeeId,
								countryCode: emp.countryCode,
								mobileNo: emp.mobileNo,
								address: emp.address,
						        // Added gender - Shivakumar A
						        gender: emp.gender

							}],
							maxGroupSize: params.maxGroupSize,
							waitTime: params.waitTime,
							maxTripDuration: params.maxTripDuration
						};
						groups.push(logoutGrpObj);
					}
				});
			}
		}, (err) => {
			if (err) {
				console.error('Error: ' + err.message);
				return;
			}
			groupsObject.groups = groups;
		});
		return groupsObject;
	}
}