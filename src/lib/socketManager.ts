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
import * as socketIo from 'socket.io';
let http = require('http');

let client = redis.createClient({ disable_resubscribing: true });
let io = null;
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

        console.log("socket redis================= client server Redis" + config.SERVER.REDIS.PORT + "" + config.SERVER.REDIS.SERVER + "" + config.SERVER.REDIS.REDIS_AUTH_PASS);
        // const sub = redis.createClient(6379, 'fleet.redis.cache.windows.net', { auth_pass: "IHP0i6yX7yyYbTbj3aIgA7xryeEbF88Q8AiXVyMXW4s=" });
        io.adapter(redisAdapter({ pubClient: pub }));
    } else {
        console.log("socket ================= translab server Redis" + config.SERVER.REDIS.PORT + "config.SERVER.REDIS.SERVER" + config.SERVER.REDIS.SERVER + "config.SERVER.REDIS.REDIS_AUTH_PASS" + config.SERVER.REDIS.REDIS_AUTH_PASS);
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
                console.log(jwtPayload);
                if (jwtPayload.payload.type === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN || jwtPayload.payload.type === config.CONSTANT.ADMIN_TYPE.SUB_ADMIN) {
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
                            console.log({"Aashiq": userId, "socketId": socketId});
                            await insertInRedis(userId, socketId);

                        } else {
                            socket.emit(socketConnections.EVENT.AUTHORIZATION_ERROR, Config.CONSTANT.STATUS_MSG.SOCKET_ERROR.AUTHORIZATION_ERROR);
                        }
                        socket['userId'] = userId;
                    } else {
                        socket.emit(socketConnections.EVENT.AUTHORIZATION_ERROR, Config.CONSTANT.STATUS_MSG.SOCKET_ERROR.AUTHORIZATION_ERROR);
                    }

                }
                // else {
                //     let response = await tokenManager.verifyUserSocketToken(socket, token);
                //
                //     console.log(response);
                //
                //     if (response['statusCode'] === Config.CONSTANT.HTTP_STATUS_CODE.UNAUTHORIZED) {
                //         socket.emit(socketConnections.EVENT.SOCKET_ERROR, { success: false, message: 'Token Expired', result: [] });
                //     } else {
                //         console.log('Looks good Started Connection........');
                //         socket.emit(socketConnections.DEFAULT.CONNECTED, { success: true, message: 'Connection Established', result: [] });
                //         userId = response['userId'];
                //         userName = response['name'];
                //         companyCode = response['companyCode'];
                //         userType = response['userType'];
                //         name = response['name'];
                //         email = response['email'];
                //         mobileNo = response['mobileNo'];
                //         employeeId = response['employeeId'];
                //         let socketId = socket.id;
                //         await closeOldConnects(userId);
                //         if (userId && userId !== undefined && userId !== null && userId !== "") {
                //             if (userType === config.CONSTANT.USER_TYPE.EMPLOYEE) {
                //                 let empData: any = {};
                //                 empData.userId = userId;
                //                 empData.companyCode = companyCode;
                //                 let empRoster = await roasterDao.rosterEmp(empData);
                //                 let rosterData = empRoster[0];
                //                 let employeeList = rosterData.route.employees;
                //                 let empIds = [userId];
                //                 let filteredArray = employeeList.filter(function (itm) {
                //                     return empIds.indexOf(itm.empId) > -1;
                //                 });
                //                 if (filteredArray[0].pickupStatus !== config.CONSTANT.EMP_PICKUP_STATUS.CANCELLED && filteredArray[0].pickupStatus !== config.CONSTANT.EMP_PICKUP_STATUS.NOSHOW) {
                //                     socket.join(rosterData._id);
                //                 } else {
                //                     socket.leave(rosterData._id);
                //                 }
                //
                //                 io.of('/').adapter.clients([rosterData._id], (err, clients) => {
                //                     console.log('redis clients by [room]');
                //                     console.log(clients);
                //                 });
                //             } else {
                //                 let driverData: any = {};
                //                 driverData.userId = userId;
                //                 driverData.companyCode = companyCode;
                //                 let driverRoster = await roasterDao.rosterDriver(driverData);
                //                 let rosterData = driverRoster[0];
                //                 if (rosterData) {
                //                     socket.join(rosterData._id);
                //                     io.of('/').adapter.clients([rosterData._id], (err, clients) => {
                //                         console.log('redis clients by [room]');
                //                         console.log(clients);
                //                     });
                //                 }
                //             }
                //             await insertInRedis(userId, socketId);
                //
                //         } else {
                //             socket.emit(socketConnections.EVENT.AUTHORIZATION_ERROR, Config.CONSTANT.STATUS_MSG.SOCKET_ERROR.AUTHORIZATION_ERROR);
                //         }
                //         socket['userId'] = userId;
                //     }
                // }
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
