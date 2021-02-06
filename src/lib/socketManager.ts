import * as Config from '../config';
import * as asyncFunction from 'async';
const util = require('util');
import * as tokenManager from '@lib/tokenManager';
import * as redis from "redis";
import { serviceRequest } from '../socket/service';
import * as appUtils from '@utils/appUtils';
import * as pushNotification from '@utils/pushNotification';
// import { config } from 'exceljs';
import * as config from "@config/index";
import * as _ from 'lodash';
import { UserDao } from '@modules/v1/user/UserDao';
import { LoginHistoryDao } from '@modules/v1/loginHistory/LoginHistoryDao';
import * as userController from '@modules/v1/user/userController';
import * as pushManager from "@lib/pushNotification/pushManager";
import { RoasterDao } from "@modules/v1/roaster/RoasterDao";
import { CabDao } from '@modules/v1/cab/CabDao';
import { RescheduleDao } from "@modules/v1/rescheduleRide/index";
import * as socketIo from 'socket.io';
let http = require('http');

let roasterDao = new RoasterDao();
let rescheduleDao = new RescheduleDao();
let cabDao = new CabDao();
let client = redis.createClient({ disable_resubscribing: true });
let io = null;
let userDao = new UserDao();
let loginHistoryDao = new LoginHistoryDao();
let socketConnections = Config.CONSTANT.SOCKET;
const redisAdapter = require('socket.io-redis');

export let connectSocket = async function (server) {
    const socket = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('okay');
    });
    socket.listen(process.env["SOCKET_PORT"], () => {
        console.log(`Server is up and socket running on${process.env["SOCKET_PORT"]}`);
    });

    // io = require('socket.io').listen(process.env["SOCKET_PORT"]);
    io = socketIo(socket, { origins: '*:*' });
    if (process.env.NODE_ENV === "production") {
        const pub = redis.createClient(config.SERVER.REDIS.PORT, config.SERVER.REDIS.SERVER, { auth_pass: config.SERVER.REDIS.REDIS_AUTH_PASS });

        console.log("socket redis================= cline server Redis" + config.SERVER.REDIS.PORT + "" + config.SERVER.REDIS.SERVER + "" + config.SERVER.REDIS.REDIS_AUTH_PASS);
        // const sub = redis.createClient(6379, 'fleet.redis.cache.windows.net', { auth_pass: "IHP0i6yX7yyYbTbj3aIgA7xryeEbF88Q8AiXVyMXW4s=" });
        io.adapter(redisAdapter({ pubClient: pub }));
    } else {
        console.log("socket ================= appinventiv server Redis" + config.SERVER.REDIS.PORT + "config.SERVER.REDIS.SERVER" + config.SERVER.REDIS.SERVER + "config.SERVER.REDIS.REDIS_AUTH_PASS" + config.SERVER.REDIS.REDIS_AUTH_PASS);
        io.adapter(redisAdapter({ host: config.SERVER.REDIS.SERVER, port: config.SERVER.REDIS.PORT }));
    }
    // io.adapter(redisAdapter({ host: 'fleet.redis.cache.windows.net', port: 6379 }));
    let timeout = 1000;

    /**
     * @description On connection established Event
     */
    io.on(socketConnections.DEFAULT.CONNECTION, async function (socket) {
        try {

            console.log('....Connection Established....', socket.id);

            let authorization = socket.handshake.query.authorization;

            let token: any = {};
            let userId;
            let companyCode;
            let userName;
            let userType;
            let employeeId;
            let name;
            let email;
            let mobileNo;
            token = authorization;
            let params: any = {};
            params.accessToken = token;
            let result;
            if (authorization) {
                let jwtPayload = await tokenManager.decodeToken({ ...params });
                if (jwtPayload.payload.accountLevel === config.CONSTANT.ACCOUNT_LEVEL.ADMIN) {
                    result = await tokenManager.verifyToken({ ...params });
                    if (result) {
                        console.log('Looks good Admin Started Connection........', result['userId'], authorization);
                        socket.emit(socketConnections.DEFAULT.CONNECTED, { success: true, message: 'Connection Established', result: [] });
                        userId = result['userId'];
                        companyCode = result['companyCode'];
                        userName = result['name'];
                        userType = result['adminType:'];
                        let socketId = socket.id;
                        await closeOldConnects(userId);
                        if (userId && userId !== undefined && userId !== null && userId !== "") {

                            await insertInRedis(userId, socketId);

                        } else {
                            socket.emit(socketConnections.EVENT.AUTHORIZATION_ERROR, Config.CONSTANT.STATUS_MSG.SOCKET_ERROR.AUTHORIZATION_ERROR);
                        }
                        socket['userId'] = userId;
                    } else {
                        socket.emit(socketConnections.EVENT.AUTHORIZATION_ERROR, Config.CONSTANT.STATUS_MSG.SOCKET_ERROR.AUTHORIZATION_ERROR);
                    }

                } else {
                    let response = await tokenManager.verifyUserSocketToken(socket, token);

                    console.log(response);

                    if (response['statusCode'] === Config.CONSTANT.HTTP_STATUS_CODE.UNAUTHORIZED) {
                        socket.emit(socketConnections.EVENT.SOCKET_ERROR, { success: false, message: 'Token Expired', result: [] });
                    } else {
                        console.log('Looks good Started Connection........');
                        socket.emit(socketConnections.DEFAULT.CONNECTED, { success: true, message: 'Connection Established', result: [] });
                        userId = response['userId'];
                        userName = response['name'];
                        companyCode = response['companyCode'];
                        userType = response['userType'];
                        name = response['name'];
                        email = response['email'];
                        mobileNo = response['mobileNo'];
                        employeeId = response['employeeId'];
                        let socketId = socket.id;
                        await closeOldConnects(userId);
                        if (userId && userId !== undefined && userId !== null && userId !== "") {
                            if (userType === config.CONSTANT.USER_TYPE.EMPLOYEE) {
                                let empData: any = {};
                                empData.userId = userId;
                                empData.companyCode = companyCode;
                                let empRoster = await roasterDao.rosterEmp(empData);
                                let rosterData = empRoster[0];
                                let employeeList = rosterData.route.employees;
                                let empIds = [userId];
                                let filteredArray = employeeList.filter(function (itm) {
                                    return empIds.indexOf(itm.empId) > -1;
                                });
                                if (filteredArray[0].pickupStatus !== config.CONSTANT.EMP_PICKUP_STATUS.CANCELLED && filteredArray[0].pickupStatus !== config.CONSTANT.EMP_PICKUP_STATUS.NOSHOW) {
                                    socket.join(rosterData._id);
                                } else {
                                    socket.leave(rosterData._id);
                                }

                                io.of('/').adapter.clients([rosterData._id], (err, clients) => {
                                    console.log('redis clients by [room]');
                                    console.log(clients);
                                });
                            } else {
                                let driverData: any = {};
                                driverData.userId = userId;
                                driverData.companyCode = companyCode;
                                let driverRoster = await roasterDao.rosterDriver(driverData);
                                let rosterData = driverRoster[0];
                                if (rosterData) {
                                    socket.join(rosterData._id);
                                    io.of('/').adapter.clients([rosterData._id], (err, clients) => {
                                        console.log('redis clients by [room]');
                                        console.log(clients);
                                    });
                                }
                            }
                            await insertInRedis(userId, socketId);

                        } else {
                            socket.emit(socketConnections.EVENT.AUTHORIZATION_ERROR, Config.CONSTANT.STATUS_MSG.SOCKET_ERROR.AUTHORIZATION_ERROR);
                        }
                        socket['userId'] = userId;
                    }
                }
            } else {
                socket.emit(socketConnections.EVENT.AUTHORIZATION_ERROR, Config.CONSTANT.STATUS_MSG.SOCKET_ERROR.AUTHORIZATION_ERROR);
            }
            /**
             * Admin can track one selected cab
             */
            socket.on(Config.CONSTANT.SOCKET.EVENT.ADMIN_ON_TRACKING, async function (data) {
                console.log(JSON.stringify(data) + "*****************Admin on tracking cab*************************");
                if (typeof (data) !== "object") {
                    data = JSON.parse(data);
                }
                data.userId = userId;
                socket.join(data.rosterId);
                io.of('/').adapter.clients([data.rosterId], (err, clients) => {
                    console.log('redis clients by [room]');
                    console.log(clients);
                });
            });
            /**
             * Admin leave for cab tracking
             */
            socket.on(Config.CONSTANT.SOCKET.EVENT.ADMIN_LEAVE_TRACKING, async function (data) {
                console.log("*****************Admin leave from tracking cab*************************");
                if (typeof (data) !== "object") {
                    data = JSON.parse(data);
                }
                data.userId = userId;
                socket.leave(data.rosterId);
                io.of('/').adapter.clients([data.rosterId], (err, clients) => {
                    console.log('redis clients by [room]');
                    console.log(clients);
                });
            });

            /**
             * Driver start ride send {"latitude":"1.2324343", "longitude":"3434.343434"}
             */
            socket.on(Config.CONSTANT.SOCKET.EVENT.DRIVER_TRACKING, async function (data) {
                console.log("*****************Driver is moving*************************");
                if (typeof (data) !== "object") {
                    data = JSON.parse(data);
                }
                data.userId = userId;
                data.companyCode = companyCode;

                socket.to(data.rosterId).emit(config.CONSTANT.SOCKET.EVENT.DRIVER_TRACKING, data);

                socket.to(data.rosterId).emit(config.CONSTANT.SOCKET.EVENT.ADMIN_TRACKING_CAB, data);
                if (data.empId) {
                    let userDevice = await loginHistoryDao.findChunkDevice(data.empId);
                    let notificationData = {
                        title: config.CONSTANT.NOTIFICATION_TITLE.DRIVER_ABOUT_TO_REACHED,
                        message: config.CONSTANT.NOTIFICATION_MESSAGE.DRIVER_ABOUT_TO_REACHED,
                        senderId: userId,
                        notificationType: config.CONSTANT.NOTIFICATION_TYPE.DRIVER_ABOUT_TO_REACHED,
                    };
                    pushNotification.saveAndSendNotificationChunks(notificationData, userDevice);
                    let updateObj = {
                        empId: data.empId,
                        isDriverNotified: true,
                        rosterId: data.rosterId,
                    };
                    await roasterDao.empStatusUpdate(updateObj);
                }

            });

            /**
             * Driver offboard mark one by one office to home
             */
            socket.on(Config.CONSTANT.SOCKET.EVENT.DRIVER_OFFBOARDED, async function (data, ack) {
                console.log(JSON.stringify(data) + "*****************Driver can mark offboarded of employee *************************" + data);
                if (typeof (data) !== "object") {
                    data = JSON.parse(data);
                }
                data.userId = userId;
                data.companyCode = companyCode;
                let updateObj = {
                    empId: data.empId,
                    pickupStatus: config.CONSTANT.EMP_PICKUP_STATUS.OFFBOARD,
                    rosterId: data.rosterId,
                };
                await roasterDao.empStatusUpdate(updateObj);
                let driverRoster = await roasterDao.rosterDriver(data);
                let rosterData = driverRoster[0];
                let employeeList = rosterData.route.employees;
                let index = -1;
                let empDetails;
                let nextEmp;
                employeeList.forEach(async function (item) {
                    if (item.empId === data.empId) {
                        empDetails = item;
                    }
                });

                let i = 1;
                let flag = 0;
                for (let item1 of employeeList) {
                    for (let item of employeeList) {

                        if ((item.pickupStatus !== config.CONSTANT.EMP_PICKUP_STATUS.OFFBOARD && item.pickupStatus !== config.CONSTANT.EMP_PICKUP_STATUS.NOSHOW && item.pickupStatus !== config.CONSTANT.EMP_PICKUP_STATUS.CANCELLED &&
                            item.pickupStatus !== config.CONSTANT.EMP_PICKUP_STATUS.RESCHEDULE)
                            && item.empOrder === empDetails.empOrder + i) {
                            nextEmp = item;
                            flag = 1;
                            break;
                        }
                    }
                    if (flag === 1) {
                        break;
                    }
                    if (flag === 0) {
                        i++;
                    }
                }
                let empAck = {
                    "message": config.CONSTANT.NOTIFICATION_MESSAGE.ALL_OFBOARDED,
                    "empId": data.empId,
                };
                socket.to(rosterData._id).emit(config.CONSTANT.SOCKET.EVENT.EMPLOYEE_OFFBOARDED, empAck);
                io.of('/').adapter.clients([rosterData._id], (err, clients) => {
                    console.log('redis clients by [room]');
                    console.log(clients);
                });
                data.pickupStatus = config.CONSTANT.EMP_PICKUP_STATUS.OFFBOARD;
                socket.to(rosterData._id).emit(config.CONSTANT.SOCKET.EVENT.ADMIN_TRACKING_CAB, data);
                ack(nextEmp);

                let userDevice = await loginHistoryDao.findChunkDevice(data.empId);
                let notificationData = {
                    title: config.CONSTANT.NOTIFICATION_TITLE.ALL_OFBOARDED,
                    message: config.CONSTANT.NOTIFICATION_MESSAGE.ALL_OFBOARDED,
                    senderId: userId,
                    notificationType: config.CONSTANT.NOTIFICATION_TYPE.ALL_OFBOARDED,
                };
                pushNotification.saveAndSendNotificationChunks(notificationData, userDevice);
            });

            /**
             * Driver mark as all employee offboard when ride from office to home - logout
             */
            socket.on(Config.CONSTANT.SOCKET.EVENT.DRIVER_ALL_OFFBOARDED, async function (data, ack) {
                // ack("I have received")
                console.log(JSON.stringify(data) + "*****************Driver can mark all employee offboarded office to home *************************" + data);
                if (typeof (data) !== "object") {
                    data = JSON.parse(data);
                }
                data.userId = userId;
                data.companyCode = companyCode;
                let driverRoster = await roasterDao.rosterDriver(data);
                if (driverRoster) {
                    let rosterData = driverRoster[0];
                    let employeeList = rosterData.route.employees;

                    let updateObj = {
                        rosterId: rosterData._id,
                        rideStarted: false,
                        rideCompleted: true
                    };
                    await roasterDao.driverAllOffborded(updateObj);
                    let p1 = { "_id": rosterData._id };
                    await roasterDao.freeCabIfNoMoreRoster(p1);

                    ack(data);

                } else {
                    socket.emit(socketConnections.EVENT.COMMON_ERROR, Config.CONSTANT.STATUS_MSG.SOCKET_ERROR.CAB_ASSIGN_ERROR);
                }
            });

            /**
             * Driver mark as all employee ofboard - login
             */
            socket.on(Config.CONSTANT.SOCKET.EVENT.ALL_OFFBOARDED, async function (data, ack) {

                console.log(JSON.stringify(data) + "*****************Driver can mark all offboarded *************************" + data);
                if (typeof (data) !== "object") {
                    data = JSON.parse(data);
                }
                data.userId = userId;
                data.companyCode = companyCode;
                let driverRoster = await roasterDao.rosterDriver(data);
                if (driverRoster) {
                    let rosterData = driverRoster[0];
                    let employeeList = rosterData.route.employees;
                    let index = -1;
                    let empDetails;
                    let updateObj = {
                        rosterId: rosterData._id,
                        rideStarted: false,
                        rideCompleted: true,
                        shiftType: rosterData.route.shiftType,
                        shiftTime: rosterData.route.shiftTime
                    };
                    await roasterDao.driverAllOffborded(updateObj);
                    let p1 = { "_id": rosterData._id };
                    await roasterDao.freeCabIfNoMoreRoster(p1);
                    let empAck = {
                        "message": config.CONSTANT.NOTIFICATION_MESSAGE.ALL_OFBOARDED,
                    };
                    socket.to(rosterData._id).emit(config.CONSTANT.SOCKET.EVENT.EMPLOYEE_OFFBOARDED, empAck);
                    io.of('/').adapter.clients([rosterData._id], (err, clients) => {
                        console.log('redis clients by [room]');
                        console.log(clients);
                    });
                    ack(data);
                    let arrayData = [];
                    employeeList.forEach(async function (item) {
                        if (item.empId.pickupStatus !== config.CONSTANT.EMP_PICKUP_STATUS.NOSHOW || item.empId.pickupStatus !== config.CONSTANT.EMP_PICKUP_STATUS.CANCELLED || item.empId.pickupStatus !== config.CONSTANT.EMP_PICKUP_STATUS.RESCHEDULE) {
                            arrayData.push(item.empId._id);
                        }
                    });
                    let userDevice = await loginHistoryDao.findChunkDevice(arrayData);
                    let notificationData = {
                        title: config.CONSTANT.NOTIFICATION_TITLE.ALL_OFBOARDED,
                        message: config.CONSTANT.NOTIFICATION_MESSAGE.ALL_OFBOARDED,
                        senderId: userId,
                        notificationType: config.CONSTANT.NOTIFICATION_TYPE.ALL_OFBOARDED,
                    };
                    pushNotification.saveAndSendNotificationChunks(notificationData, userDevice);

                } else {
                    socket.emit(socketConnections.EVENT.COMMON_ERROR, Config.CONSTANT.STATUS_MSG.SOCKET_ERROR.CAB_ASSIGN_ERROR);
                }
            });

            /**
             * Employee can cancel ride
             */
            socket.on(Config.CONSTANT.SOCKET.EVENT.EMPLOYEE_CANCEL_RIDE, async function (data, ack) {
                // ack("I have received")
                console.log(JSON.stringify(data) + "*****************Employee cancel ride *************************" + data);
                if (typeof (data) !== "object") {
                    data = JSON.parse(data);
                }
                data.userId = userId;
                data.companyCode = companyCode;
                let empRoster = await roasterDao.rosterEmp(data);
                if (empRoster) {
                    let rosterData = empRoster[0];
                    let employeeList = rosterData.route.employees;
                    let empDetails;
                    // Added newCabBadgeId field to data - Shivakumar A
                    data.newCabBadgeId = rosterData.cab.routeNo;
                    employeeList.forEach(async function (item) {

                        if (item.empId === userId) {
                            empDetails = item;
                        }
                    });

                    socket.to(rosterData._id).emit(config.CONSTANT.SOCKET.EVENT.EMPLOYEE_CANCEL_RIDE, data);
                    io.of('/').adapter.clients([rosterData._id], (err, clients) => {
                        console.log('redis clients by [room]');
                        console.log(clients);
                    });
                    let driverId = rosterData.cab.driverMapped[0]._id;
                    await executer('serviceRequest', 'cancelledRide', [driverId, data]);

                    // let updateObj = {
                    //     empId: data.empId,
                    //     pickupStatus: config.CONSTANT.EMP_PICKUP_STATUS.CANCELLED,
                    //     rosterId: rosterData._id,
                    //     noShowReason: data.reason,
                    // };
                    // await roasterDao.empStatusUpdate(updateObj);
                    // data.companyCode = companyCode;
                    // data.email = email;
                    // data.name = name;
                    // data.employeeId = employeeId;
                    // data.mobileNo = mobileNo;
                    // data.roster = rosterData;
                    // data.rosterId = rosterData._id;
                    // data.reason = data.reason;
                    // data.scheduleTime = rosterData.rosterDate;
                    // data.shiftTime = rosterData.route.shiftTime;
                    // data.shiftName = rosterData.route.shiftName;
                    // data.shiftType = rosterData.route.shiftType;
                    // data.requestType = config.CONSTANT.TRIP_RESCHEDULE.CANCELLED;
                    // data.pickUpLocation = empDetails.address;
                    // await rescheduleDao.rescheduleTrip(data);
                    // ack(data);

                     /* Mark Noshow or cancelled - Shivakumar A */
                     let currentTime = new Date().getHours();
                     let diffHour = parseInt(data.shiftstarttime) - currentTime;
                     let cuttoff_hour = Math.abs(diffHour);

                     if (cuttoff_hour < config.CONSTANT.CUT_OFF_TIME.CANCELLATION_CUTOFF) {
                         let updateObj = {
                             empId: data.empId,
                             pickupStatus: config.CONSTANT.EMP_PICKUP_STATUS.NOSHOW,
                             rosterId: rosterData._id,
                             noShowReason: data.reason,
                             // Added seen - Shivakumar A
                             seen: false,
                         };
                        await roasterDao.empStatusUpdate(updateObj);
                        // Added acknowledgment - Shivakumar A
                        ack(updateObj);
                     } else {
                            let updateObj = {
                            empId: data.empId,
                            pickupStatus: config.CONSTANT.EMP_PICKUP_STATUS.CANCELLED,
                            rosterId: rosterData._id,
                            noShowReason: data.reason,
                        };
                        await roasterDao.empStatusUpdate(updateObj);
                        // Added cancelledAt  - Shivakumar A
                        data.cancelledAt = Date.now();
                        data.companyCode = companyCode;
                        data.email = email;
                        data.name = name;
                        data.employeeId = employeeId;
                        data.mobileNo = mobileNo;
                        data.roster = rosterData;
                        data.rosterId = rosterData._id;
                        data.reason = data.reason;
                        data.scheduleTime = rosterData.rosterDate;
                        data.shiftTime = rosterData.route.shiftTime;
                        data.shiftName = rosterData.route.shiftName;
                        data.shiftType = rosterData.route.shiftType;
                        data.requestType = config.CONSTANT.TRIP_RESCHEDULE.CANCELLED;
                        data.pickUpLocation = empDetails.address;
                        // Added gender - Shivakumar A
                        data.gender = empDetails.gender;
                        await rescheduleDao.rescheduleTrip(data);
                        // ack(data);
                        // acknowledge updateObj - Shivakumar A
                        ack(updateObj);
                     }

                    socket.leave(rosterData._id);
                    io.of('/').adapter.clients([rosterData._id], (err, clients) => {
                        console.log('redis clients by [room]');
                        console.log(clients);
                    });
                    await closeOldConnects(userId);
                    /**
                     * Send notification to driver if employee cancel ride when driver navigate on tha map
                    */
                    let userDevice = await loginHistoryDao.findChunkDevice(driverId);
                    let notificationData = {
                        title: config.CONSTANT.NOTIFICATION_TITLE.TRIP_CANCEL_BY_EMPLOYEE,
                        message: config.CONSTANT.NOTIFICATION_MESSAGE.TRIP_CANCEL_BY_EMPLOYEE + " " + userName,
                        senderId: userId,
                        notificationType: config.CONSTANT.NOTIFICATION_TYPE.TRIP_CANCEL_BY_EMPLOYEE
                    };
                    pushNotification.saveAndSendNotificationChunks(notificationData, userDevice);
                } else {
                    socket.emit(socketConnections.EVENT.COMMON_ERROR, Config.CONSTANT.STATUS_MSG.SOCKET_ERROR.CAB_ASSIGN_ERROR);
                }
            });

            /**
             * Employee mark as offboard
             */
            socket.on(Config.CONSTANT.SOCKET.EVENT.EMPLOYEE_OFFBOARDED, async function (data, ack) {
                console.log(JSON.stringify(data) + "*****************Employee can mark offboarded *************************" + data);
                if (typeof (data) !== "object") {
                    data = JSON.parse(data);
                }
                data.userId = userId;
                data.companyCode = companyCode;

                let updateObj = {
                    empId: data.empId,
                    pickupStatus: config.CONSTANT.EMP_PICKUP_STATUS.EMP_SELF_OFFBOARD,
                    rosterId: data.rosterId
                };
                await roasterDao.empStatusUpdate(updateObj);

                ack("You are safely off boarded");
            });

            /**
             * If employee not available on pickup location then can mark no show with reason
             */
            socket.on(Config.CONSTANT.SOCKET.EVENT.MARK_NO_SHOW, async function (data, ack) {
                console.log("*****************Driver mark no show*************************");
                if (typeof (data) !== "object") {
                    data = JSON.parse(data);
                }
                data.userId = userId;
                data.companyCode = companyCode;
                let updateObj = {
                    empId: data.empId,
                    pickupStatus: config.CONSTANT.EMP_PICKUP_STATUS.NOSHOW,
                    rosterId: data.rosterId,
                    noShowReason: data.noShowReason,
                    // Added seen field - Shivakumar A
                    seen: false,
                };
                await roasterDao.empStatusUpdate(updateObj);
                let driverRoster = await roasterDao.rosterDriver(data);
                let rosterData = driverRoster[0];
                let employeeList = rosterData.route.employees;
                let empDetails;
                let nextEmp;

                employeeList.forEach(async function (item) {

                    if (item.empId === data.empId) {
                        empDetails = item;
                    }
                });
                let i = 1;
                let flag = 0;
                for (let item1 of employeeList) {
                    for (let item of employeeList) {
                        if ((item.pickupStatus !== config.CONSTANT.EMP_PICKUP_STATUS.RESCHEDULE && item.pickupStatus !== config.CONSTANT.EMP_PICKUP_STATUS.NOSHOW && item.pickupStatus !== config.CONSTANT.EMP_PICKUP_STATUS.CANCELLED) &&
                            item.empOrder === empDetails.empOrder + i) {
                            nextEmp = item;
                            flag = 1;
                            break;
                        }
                    }
                    if (flag === 1) {
                        break;
                    }
                    if (flag === 0) {
                        i++;
                    }
                }

                let empAck = {
                    "message": config.CONSTANT.NOTIFICATION_MESSAGE.EMPLOYEE_NOT_REACHED,
                    "empId": data.empId,
                };
                socket.to(rosterData._id).emit(config.CONSTANT.SOCKET.EVENT.MARK_NO_SHOW, empAck);
                io.of('/').adapter.clients([rosterData._id], (err, clients) => {
                    console.log('redis clients by [room]');
                    console.log(clients);
                });
                data.pickupStatus = config.CONSTANT.EMP_PICKUP_STATUS.NOSHOW;
                socket.to(rosterData._id).emit(config.CONSTANT.SOCKET.EVENT.ADMIN_TRACKING_CAB, data);
                ack(nextEmp);
                await closeOldConnects(data.empId);

            });
            /**
             * Driver reached at home location
             */
            socket.on(Config.CONSTANT.SOCKET.EVENT.DRIVER_REACHED_PICKUP_POINT, async function (data, ack) {
                console.log("*****************Driver reached pickup pointes*************************");
                if (typeof (data) !== "object") {
                    data = JSON.parse(data);
                }
                data.userId = userId;

                let updateObj = {
                    empId: data.empId,
                    pickupStatus: config.CONSTANT.EMP_PICKUP_STATUS.DRIVER_REACHED,
                    rosterId: data.rosterId,
                    reachedTime: Date.now(),
                };
                // Update in db status reached on pickup points
                await roasterDao.empStatusUpdate(updateObj);
                let empAck = {
                    "message": config.CONSTANT.NOTIFICATION_MESSAGE.DRIVER_REACHED_PICKUP_POINT,
                    "empId": data.empId,
                };
                socket.to(data.rosterId).emit(config.CONSTANT.SOCKET.EVENT.DRIVER_REACHED_PICKUP_POINT, empAck);
                io.of('/').adapter.clients([data.rosterId], (err, clients) => {
                    console.log('redis clients by [room]');
                    console.log(clients);
                });
                await executer('serviceRequest', 'driverReachedPickupPoints', [data.empId, data]);
                ack(data);
                /**
                 * Send notification to employee cab reached your location please contact to driver. and event also trigger
                 */
                let userDevice = await loginHistoryDao.findChunkDevice(data.empId);
                console.log(JSON.stringify(userDevice) + "userDevice for notification=======");
                let notificationData = {
                    title: config.CONSTANT.NOTIFICATION_TITLE.DRIVER_REACHED_PICKUP_POINT,
                    message: config.CONSTANT.NOTIFICATION_MESSAGE.DRIVER_REACHED_PICKUP_POINT,
                    senderId: userId,
                    notificationType: config.CONSTANT.NOTIFICATION_TYPE.DRIVER_REACHED_PICKUP_POINT
                };
                pushNotification.saveAndSendNotificationChunks(notificationData, userDevice);
            });
            /**
             * Driver otp verify of employee then pickup employee
             */
            socket.on(Config.CONSTANT.SOCKET.EVENT.DRIVER_OTP_VERIFY, async function (data, ack) {
                console.log(JSON.stringify(data) + "*****************Driver OTP verify*************************");
                if (typeof (data) !== "object") {
                    data = JSON.parse(data);
                }
                data.userId = userId;
                data.companyCode = companyCode;
                let driverRoster = await roasterDao.rosterDriver(data);
                let rosterData = driverRoster[0];
                let employeeList = rosterData.route.employees;
                let empDetails;
                let nextEmp;
                employeeList.forEach(async function (item) {
                    if (item.empId === data.empId) {
                        empDetails = item;
                    }
                });
                let i = 1;
                let flag = 0;
                for (let item1 of employeeList) {
                    for (let item of employeeList) {
                        if ((item.pickupStatus !== config.CONSTANT.EMP_PICKUP_STATUS.ONBOARDED && item.pickupStatus !== config.CONSTANT.EMP_PICKUP_STATUS.NOSHOW && item.pickupStatus !== config.CONSTANT.EMP_PICKUP_STATUS.CANCELLED &&
                            item.pickupStatus !== config.CONSTANT.EMP_PICKUP_STATUS.RESCHEDULE)
                            && item.empOrder === empDetails.empOrder + i) {
                            nextEmp = item;
                            flag = 1;
                            break;
                        }
                    }
                    if (flag === 1) {
                        break;
                    }
                    if (flag === 0) {
                        i++;
                    }
                }

                if (empDetails.otp === data.otp) {
                    let updateObj = {
                        empId: data.empId,
                        pickupStatus: config.CONSTANT.EMP_PICKUP_STATUS.ONBOARDED,
                        rosterId: rosterData._id
                    };
                    await roasterDao.empStatusUpdate(updateObj);
                    let empAck = {
                        "message": config.CONSTANT.NOTIFICATION_MESSAGE.EMPLOYEE_ONBOARD,
                        "empId": data.empId,
                    };
                    socket.to(rosterData._id).emit(config.CONSTANT.SOCKET.EVENT.EMPLOYEE_ONBOARD, empAck);
                    io.of('/').adapter.clients([rosterData._id], (err, clients) => {
                        console.log('redis clients by [room]');
                        console.log(clients);
                    });
                    data.pickupStatus = config.CONSTANT.EMP_PICKUP_STATUS.ONBOARDED;
                    socket.to(rosterData._id).emit(config.CONSTANT.SOCKET.EVENT.ADMIN_TRACKING_CAB, data);
                    ack(Config.CONSTANT.SOCKET.SUCCESS.OPT_VERIFIED(nextEmp));
                } else {
                    ack(Config.CONSTANT.STATUS_MSG.SOCKET_ERROR.OTP_MATCH_ERROR);
                }

            });
            /**
             * Driver start ride send push to employee and ack emp details to driver
             */
            socket.on(Config.CONSTANT.SOCKET.EVENT.DRIVER_START_RIDE, async function (data, ack) {
                console.log(JSON.stringify(data) + "*****************Driver start ride *************************" + data);
                if (typeof (data) !== "object") {
                    data = JSON.parse(data);
                }
                data.userId = userId;
                data.companyCode = companyCode;

                let driverData = await roasterDao.rosterDriver(data);
                if (driverData.length > 0) {
                    let rosterData = driverData[0];
                    let employeeList = rosterData.route.employees;
                    let roasterUpdate = {
                        _id: rosterData._id,
                        rideStarted: true,
                        latitude: data.latitude,
                        longitude: data.longitude,
                    };
                    await roasterDao.driverStartRide(roasterUpdate);

                    let empNoactionArr = [];

                    for (let element of employeeList) {
                        if (element.pickupStatus === config.CONSTANT.EMP_PICKUP_STATUS.NOACTION) {
                            empNoactionArr.push(element);
                        }
                    }
                    let nextEmp: any = {};

                    let i = 0;
                    let flag = 0;
                    for (let item1 of employeeList) {
                        for (let item of employeeList) {
                            if ((item.pickupStatus === config.CONSTANT.EMP_PICKUP_STATUS.NOACTION) &&
                                item.empOrder === i) {
                                nextEmp = item;
                                flag = 1;
                                break;
                            }
                        }
                        if (flag === 1) {
                            break;
                        }
                        if (flag === 0) {
                            i++;
                        }
                    }
                    ack(nextEmp);

                    let empArr = [];
                    if (empNoactionArr.length > 0) {

                        let newOtp;

                        empNoactionArr.forEach(async element => {
                            newOtp = Math.floor(100000 + Math.random() * 900000);

                            let empAck = {
                                "message": config.CONSTANT.NOTIFICATION_MESSAGE.DRIVER_START_RIDE + " " + newOtp || "",
                                "otp": newOtp,
                                "empId": element.empId
                            };
                            socket.to(rosterData._id).emit(config.CONSTANT.SOCKET.EVENT.DRIVER_START_RIDE, empAck);
                            io.of('/').adapter.clients([rosterData._id], (err, clients) => {
                                console.log('redis clients by [room]');
                                console.log(clients);
                            });
                            // let hardCodeOtp = 1234;
                            await roasterDao.otpUpdateEmpRoster(element.empId, newOtp, rosterData._id, rosterData.route.shiftType);
                            let userDevice = await loginHistoryDao.findChunkDevice(element.empId);
                            // let notificationData = {
                            //     title: config.CONSTANT.NOTIFICATION_TITLE.DRIVER_START_RIDE,
                            //     message: newOtp ? config.CONSTANT.NOTIFICATION_MESSAGE.DRIVER_START_RIDE + " " + newOtp : config.CONSTANT.NOTIFICATION_MESSAGE.DRIVER_START_RIDE + " " + newOtp,
                            //     senderId: userId,
                            //     notificationType: config.CONSTANT.NOTIFICATION_TYPE.DRIVER_START_RIDE
                            // };

                            // Send respective otp's to users in notification - Shivakumar A
                            let notificationData = {
                                title: config.CONSTANT.NOTIFICATION_TITLE.DRIVER_START_RIDE + ", your OTP: " + empAck.otp,
                                message: config.CONSTANT.NOTIFICATION_MESSAGE.DRIVER_START_RIDE + " " + empAck.otp,
                                senderId: userId,
                                notificationType: config.CONSTANT.NOTIFICATION_TYPE.DRIVER_START_RIDE
                            };
                            pushNotification.saveAndSendNotificationChunks(notificationData, userDevice);
                        });

                    } else {
                        socket.emit(socketConnections.EVENT.COMMON_ERROR, Config.CONSTANT.STATUS_MSG.SOCKET_ERROR.CAB_ASSIGN_ERROR);
                    }
                } else {
                    socket.emit(socketConnections.EVENT.COMMON_ERROR, Config.CONSTANT.STATUS_MSG.SOCKET_ERROR.TRIP_CANCELLED);
                }
            });
            /**
            * @description On connection break Event
            */
            socket.on(socketConnections.DEFAULT.DISCONNECT, async function () {
                await insertInRedis(userId, "");
                console.log("*******************user type**********", userType);
                console.log("****************user name*****************", userName);
                console.log('....Connection Braked....', socket['userId'], socket.id);
                io.of('/').adapter.clients([config.CONSTANT.SOCKET.ROOMS.TRACKING_MAP_ROOM], (err, clients) => {
                    console.log('redis clients by [room]');
                    console.log(clients);
                });
            });

        } catch (error) {
            console.log('error----------> ', error);
        }

    });

};

let SocketManager = {
    // newRequest: newRequest,
    serviceRequest: serviceRequest
};

export let executer = async (type, func, params) => {
    return await new Promise(async (resolve, reject) => {
        try {
            if ((io === null || io === undefined)) {
                resolve(false);
            } else {
                await SocketManager[type][func](io, ...params);
                resolve(true);
            }
        } catch (error) {
            reject(false);
        }
    });
};

/**
 * @description Insert in redis
 */
export let insertInRedis = async function (userId, socketId) {
    console.log("Insert in redis:-", socketId);
    let promise1 = util.promisify(client.set).bind(client);
    if (socketId) {
        let appSocket = await promise1(userId.toString(), socketId.toString());
    }
    return;
};

/**
 * @description Get socket ids from redis db
 */
export let getSocketId = async function (userId) {
    let promise1 = util.promisify(client.get).bind(client);
    let appSocket = promise1(userId.toString());
    let allSocket = await Promise.all([appSocket]);
    console.log("This user has " + userId + " these socket ids " + allSocket);
    return allSocket;
};

export let closeOldConnects = async function (userId) {
    let socketIds = await getSocketId(userId);
    console.log("socket Id", socketIds);

    if (socketIds[0] !== undefined && socketIds[0] !== null) {
        console.log("Socket connection for userId " + userId + " forcefully disconnected via APP with socket Id " + socketIds[0]);
        await remoteDisconnect(socketIds[0]);
    }
    return;
};

let remoteDisconnect = async (socketId) => {
    return new Promise((resolve, reject) => {
        try {
            io.of('/').adapter.remoteDisconnect(socketId, true);
            resolve();
        } catch (error) {
            console.log("remoteDisconnect error", error);
            resolve();
        }

    });
};
