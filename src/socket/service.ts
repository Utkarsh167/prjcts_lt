import * as Config from '../config';
let socketConnections = Config.CONSTANT.SOCKET;
import * as  socketManager from '../lib/socketManager';

let socketError = async function (io, userId, dataToEmit) {
    try {
        let socketIdArray = await socketManager.getSocketId(userId);
        console.log("socket id array");
        console.log(socketIdArray);
        if (socketIdArray[0] !== "" && socketIdArray[0] !== null) {
            console.log("in socket error");
            console.log(dataToEmit);
            io.to(socketIdArray[0]).emit(socketConnections.EVENT.SOCKET_ERROR, dataToEmit);
        }
    } catch (error) {
        console.log("error..................", error);
    }
};

let driverTracking = async function (io, userId, dataToEmit) {
    try {
        console.log("********************live tracking******************");
        let socketIdArray = await socketManager.getSocketId(userId);
        console.log("socket id array");
        console.log(socketIdArray);
        if (socketIdArray[0] !== "" && socketIdArray[0] != null) {
            console.log("in live tracking emit event");
            io.to(socketIdArray[0]).emit(socketConnections.EVENT.DRIVER_TRACKING, dataToEmit);
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

let employeeOnboard = async function (io, userId, dataToEmit) {
    try {
        console.log("********************Employee onboard******************");
        let socketIdArray = await socketManager.getSocketId(userId);
        if (socketIdArray[0] !== "" && socketIdArray[0] != null) {
            io.to(socketIdArray[0]).emit(socketConnections.EVENT.EMPLOYEE_ONBOARD, dataToEmit);
        }
    } catch (error) {
        console.log("error..................", error);
    }
};
let employeeOfboard = async function (io, userId, dataToEmit) {
    try {
        console.log("********************Employee offboard******************");
        let socketIdArray = await socketManager.getSocketId(userId);
        if (socketIdArray[0] !== "" && socketIdArray[0] != null) {
            io.to(socketIdArray[0]).emit(socketConnections.EVENT.EMPLOYEE_OFBOARD, dataToEmit);
        }
    } catch (error) {
        console.log("error..................", error);
    }
};
let markNoShow = async function (io, userId, dataToEmit) {
    try {
        console.log("********************Driver mark no show******************");
        let socketIdArray = await socketManager.getSocketId(userId);
        if (socketIdArray[0] !== "" && socketIdArray[0] != null) {
            io.to(socketIdArray[0]).emit(socketConnections.EVENT.MARK_NO_SHOW, dataToEmit);
        }
    } catch (error) {
        console.log("error..................", error);
    }
};

let driverReachedPickupPoints = async function (io, userId, dataToEmit) {
    try {
        console.log("********************Driver reached on pickup pointes******************");
        let socketIdArray = await socketManager.getSocketId(userId);
        if (socketIdArray[0] !== "" && socketIdArray[0] != null) {
            io.to(socketIdArray[0]).emit(socketConnections.EVENT.DRIVER_REACHED_PICKUP_POINT, dataToEmit);
        }
    } catch (error) {
        console.log("error..................", error);
    }
};

let cancelledRide = async function (io, userId, dataToEmit) {
    try {
        console.log("********************Cancelled ride by employee******************");
        let socketIdArray = await socketManager.getSocketId(userId);
        if (socketIdArray[0] !== "" && socketIdArray[0] != null) {
            io.to(socketIdArray[0]).emit(socketConnections.EVENT.EMPLOYEE_CANCEL_RIDE, dataToEmit);
        }
    } catch (error) {
        console.log("error..................", error);
    }
};
let adminTrackingCab = async function (io, userId, dataToEmit) {
    try {
        console.log("********************Sos generated for listen admin ******************");
        // let socketIdArray = await socketManager.getSocketId(userId);
        // if (socketIdArray[0] !== "" && socketIdArray[0] != null) {
        // io.to(socketIdArray[0]).emit(socketConnections.EVENT.EMPLOYEE_CANCEL_RIDE, dataToEmit);
        io.to(userId).emit(socketConnections.EVENT.ADMIN_TRACKING_CAB, dataToEmit);
        io.of('/').adapter.clients([userId], (err, clients) => {
            console.log('redis clients by [room]');
            console.log(clients);
        });
        // }
    } catch (error) {
        console.log("error..................", error);
    }
};

export let serviceRequest = {
    socketError: socketError,
    driverTracking: driverTracking,
    driverStartRide: driverStartRide,
    employeeOnboard: employeeOnboard,
    employeeOfboard: employeeOfboard,
    driverReachedPickupPoints: driverReachedPickupPoints,
    markNoShow: markNoShow,
    cancelledRide: cancelledRide,
    adminTrackingCab: adminTrackingCab
};
