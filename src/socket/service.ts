import * as Config from '../config';
let socketConnections = Config.CONSTANT.SOCKET;
import * as  socketManager from '../lib/socketManager';

let socketError = async function (io, userId, dataToEmit) {
    try {
        let socketIdArray = await socketManager.getSocketId(userId);
        console.log("socket id array");
        if (socketIdArray[0] !== "" && socketIdArray[0] !== null) {
            console.log("in socket error");
            console.log(dataToEmit);
            io.to(socketIdArray[0]).emit(socketConnections.EVENT.SOCKET_ERROR, dataToEmit);
        }
    } catch (error) {
        console.log("error..................", error);
    }
};

let driverStartRide = async function (io, userId, dataToEmit) {
    try {
        console.log("********************driverStartRide******************");
        let socketIdArray = await socketManager.getSocketId(userId);
        if (socketIdArray[0] !== "" && socketIdArray[0] != null) {
            io.to(socketIdArray[0]).emit(socketConnections.EVENT.DRIVER_START_RIDE, dataToEmit);
        }
    } catch (error) {
        console.log("error..................", error);
    }
};

let testFunc = async function (io, userId, dataToEmit) {
    try {
        console.log("********************Test function started******************");
        let socketIdArray = await socketManager.getSocketId(userId);
        if (socketIdArray[0] !== "" && socketIdArray[0] != null) {
            io.to(socketIdArray[0]).emit(socketConnections.EVENT.TEST, dataToEmit);
        }
    } catch (error) {
        console.log("error..................", error);
    }
};

export let serviceRequest = {
    socketError: socketError,
    driverStartRide: driverStartRide,
    testFunc: testFunc
};
