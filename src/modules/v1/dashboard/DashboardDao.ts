"use strict";

import {BaseDao} from "@modules/v1/shared/BaseDao";
import * as config from "@config/constant";

function getParquaryAuthData(params) {
    let config = {
        user: params.user,
        pass: params.password,
        sendImmediately: false
    };
    return config;
}

export class DashboardDao extends BaseDao {
    /**
     * @author Utkarsh 22/07/2020
     * @description retrieves the scope necessary to initialize the front end
     */
    async getScope(params: ScopeRequest) {
        const request = require('request');
        return await new Promise(function (resolve, reject) {
            request.get(
                {
                    // url: config.CONSTANT.PARQUERY_URL + config.CONSTANT.PARQUERY_ENDPOINTS.SCOPE,
                    //   form: formData,
                    url: params.buildingUrl === "" ? config.CONSTANT.PARQUERY_URL + config.CONSTANT.PARQUERY_ENDPOINTS.SCOPE : params.buildingUrl + config.CONSTANT.PARQUERY_ENDPOINTS.SCOPE,
                    auth: params.buildingUrl === "" ? config.CONSTANT.AUTH_DATA_PARQURY : getParquaryAuthData(params),
                },
                function (err, httpResponse, body) {
                    if (!err && httpResponse.statusCode === 200) {
                        resolve(body);
                    } else {
                        reject(err);
                    }
                    // data = body;
                    console.log(err, body);
                }
            );
        });
    }

    /**
     * @author Utkarsh 22/07/2020
     * @description retrieves the snapshot of the system closest to the given time point.
     */
    async getSnapshot(params) {
        // console.log("paramsGetSnap", params);
        const request = require('request');
        const formData = JSON.stringify(params);

        return await new Promise(function (resolve, reject) {
            request.post(
                {
                    // url: config.CONSTANT.PARQUERY_URL + config.CONSTANT.PARQUERY_ENDPOINTS.TIME_TRACK_SNAPSHOT,
                    form: formData,
                    //  auth: this.authData
                    // auth: config.CONSTANT.AUTH_DATA_PARQURY,
                    url: params.buildingUrl === "" ? config.CONSTANT.PARQUERY_URL + config.CONSTANT.PARQUERY_ENDPOINTS.TIME_TRACK_SNAPSHOT : params.buildingUrl + config.CONSTANT.PARQUERY_ENDPOINTS.TIME_TRACK_SNAPSHOT,
                    auth: params.buildingUrl === "" ? config.CONSTANT.AUTH_DATA_PARQURY : getParquaryAuthData(params),
                },
                function (err, httpResponse, body) {
                    // console.log("HttpResonse", httpResponse);
                    if (!err && httpResponse.statusCode === 200) {
                        resolve(body);
                    } else {
                        reject(err);
                    }
                    // console.log(err, body);
                }
            );
        });
    }
    /**
     * @author Utkarsh 24/07/2020
     * @description retrieves the snapshot of the system closest to the given time point.
     */
    async getHistoricalRange(params) {
        const request = require('request');
        const formData = JSON.stringify(params);

        return await new Promise(function (resolve, reject) {
            request.post(
                {
                    // url: config.CONSTANT.PARQUERY_URL + config.CONSTANT.PARQUERY_ENDPOINTS.HISTORICAL_RANGE,
                    form: formData,
                    // auth: config.CONSTANT.AUTH_DATA_PARQURY,
                    url: params.buildingUrl === "" ? config.CONSTANT.PARQUERY_URL + config.CONSTANT.PARQUERY_ENDPOINTS.HISTORICAL_RANGE : params.buildingUrl + config.CONSTANT.PARQUERY_ENDPOINTS.HISTORICAL_RANGE,
                    auth: params.buildingUrl === "" ? config.CONSTANT.AUTH_DATA_PARQURY : getParquaryAuthData(params),
                },
                function (err, httpResponse, body) {
                    if (!err && httpResponse.statusCode === 200) {
                        resolve(body);
                    } else {
                        reject(err);
                    }
                    console.log(err, body);
                }
            );
        });
    }

    /**
     * @author Utkarsh 24/07/2020
     * @description retrieves the snapshot of the system closest to the given time point.
     */
    async getHistoricalAggregate(params) {
        const request = require('request');
        const formData = JSON.stringify(params);

        return await new Promise(function (resolve, reject) {
            request.post(
                {
                    url: params.buildingUrl === "" ? config.CONSTANT.PARQUERY_URL + config.CONSTANT.PARQUERY_ENDPOINTS.HISTORICAL_AGGREGATE : params.buildingUrl + config.CONSTANT.PARQUERY_ENDPOINTS.HISTORICAL_AGGREGATE,
                    auth: params.buildingUrl === "" ? config.CONSTANT.AUTH_DATA_PARQURY : getParquaryAuthData(params),
                    form: formData,
                },
                function (err, httpResponse, body) {
                    if (!err && httpResponse.statusCode === 200) {
                        resolve(body);
                    } else {
                        reject(err);
                    }
                    console.log(err, body);
                }
            );
        });
    }

    /**
     * @author Utkarsh 24/07/2020
     * @description retrieves the snapshot of the system closest to the given time point.
     */
    async getTimeTrackRange(params) {
        const request = require('request');
        const formData = JSON.stringify(params);

        return await new Promise(function (resolve, reject) {
            request.post(
                {
                    // url: config.CONSTANT.PARQUERY_URL + config.CONSTANT.PARQUERY_ENDPOINTS.TIME_TRACK_RANGE,
                    form: formData,
                    // auth: config.CONSTANT.AUTH_DATA_PARQURY,
                    url: params.buildingUrl === "" ? config.CONSTANT.PARQUERY_URL + config.CONSTANT.PARQUERY_ENDPOINTS.TIME_TRACK_RANGE : params.buildingUrl + config.CONSTANT.PARQUERY_ENDPOINTS.TIME_TRACK_RANGE,
                    auth: params.buildingUrl === "" ? config.CONSTANT.AUTH_DATA_PARQURY : getParquaryAuthData(params),
                },
                function (err, httpResponse, body) {
                    if (!err && httpResponse.statusCode === 200) {
                        resolve(body);
                    } else {
                        reject(err);
                    }
                    console.log(err, body);
                }
            );
        });
    }

    /**
     * @author Utkarsh 24/07/2020
     * @description retrieves the snapshot of the system closest to the given time point.
     */
    async getTimeTrackOccupiers(params) {
        const request = require('request');
        const formData = JSON.stringify(params);

        return await new Promise(function (resolve, reject) {
            request.get(
                {
                    // url: config.CONSTANT.PARQUERY_URL + config.CONSTANT.PARQUERY_ENDPOINTS.TIME_TRACK_OCCUPIERS,
                    form: formData,
                    // auth: config.CONSTANT.AUTH_DATA_PARQURY,
                    url: params.buildingUrl === "" ? config.CONSTANT.PARQUERY_URL +  config.CONSTANT.PARQUERY_ENDPOINTS.TIME_TRACK_OCCUPIERS  : params.buildingUrl +  config.CONSTANT.PARQUERY_ENDPOINTS.TIME_TRACK_OCCUPIERS,
                    auth: params.buildingUrl === "" ? config.CONSTANT.AUTH_DATA_PARQURY : getParquaryAuthData(params) ,
                },
                function (err, httpResponse, body) {
                    // console.log(err, httpResponse, body);
                    if (!err && httpResponse.statusCode === 200) {
                        resolve(body);
                    } else {
                        reject(err);
                    }
                    // console.log(err, body);
                }
            );
        });
    }

    /**
     * @author Utkarsh 24/07/2020
     * @description retrieves the snapshot of the system closest to the given time point.
     */
    async getTimeTrackVacants(params) {
        const request = require('request');
        const formData = JSON.stringify(params);

        return await new Promise(function (resolve, reject) {
            request.get(
                {
                    // url: config.CONSTANT.PARQUERY_URL + config.CONSTANT.PARQUERY_ENDPOINTS.TIME_TRACK_VACANTS,
                    form: formData,
                    // auth: config.CONSTANT.AUTH_DATA_PARQURY,
                    url: params.buildingUrl === "" ? config.CONSTANT.PARQUERY_URL +  config.CONSTANT.PARQUERY_ENDPOINTS.TIME_TRACK_VACANTS  : params.buildingUrl +  config.CONSTANT.PARQUERY_ENDPOINTS.TIME_TRACK_VACANTS,
                    auth: params.buildingUrl === "" ? config.CONSTANT.AUTH_DATA_PARQURY : getParquaryAuthData(params) ,
                },
                function (err, httpResponse, body) {
                    if (!err && httpResponse.statusCode === 200) {
                        resolve(body);
                    } else {
                        reject(err);
                    }
                    console.log(err, body);
                }
            );
        });
    }

    /**
     * @author Utkarsh 30/07/2020
     * @description retrieves the snapshot of the system closest to the given time point.
     */
    async getTimeTrackVideoFromForm(params) {
        const fs = require('fs');
        const http = require('http');
        const https = require('https');
        const request = require('request');
        const querystring = require('querystring');
        // const formDataJson = JSON.stringify(params);
        // console.log(params);
        // var username = config.CONSTANT.AUTH_DATA_PARQURY.user;
        // var password = config.CONSTANT.AUTH_DATA_PARQURY.pass;

        // var auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
        // var header = {'Host': 'www.example.com', 'Authorization': auth};
        // let formData = new FormData();
        // formData.set('camera_id', params.camera_id);
        // formData.set('spot_id', params.spot_id);
        // formData.set('to_timestamp', params.to_timestamp);
        // formData.set('from_timestamp', params.from_timestamp);

        let form = {
            'camera_id': params.camera_id,
            'spot_id': params.spot_id,
            'to_timestamp': params.to_timestamp,
            'from_timestamp': params.from_timestamp
        };
        let fb = querystring.stringify(form);
        return await new Promise(function (resolve, reject) {
        //     const file = fs.createWriteStream(filePath);
        //         const fileInfo = null;

        //         const request = https.get({
        //             url: config.CONSTANT.PARQUERY_URL + config.CONSTANT.PARQUERY_ENDPOINTS.TIME_TRACK_VIDEO_FROM_FORM,
        //             headers: header}, response => {
        //         if (response.statusCode !== 200) {
        //             reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
        //             return;
        //         }

        //         fileInfo = {
        //             mime: response.headers['content-type'],
        //             size: parseInt(response.headers['content-length'], 10),
        //         };

        //         response.pipe(file);
        //         });

        //         // The destination stream is ended by the time it's called
        //         file.on('finish', () => resolve(fileInfo));

        //         request.on('error', err => {
        //         fs.unlink(filePath, () => reject(err));
        //         });

        //         file.on('error', err => {
        //         fs.unlink(filePath, () => reject(err));
        //         });

        //         request.end();
            request.post(
                {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0',
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-MicrosoftAjax': 'Delta=true', // blah, blah, blah...
                    },
                    // url: config.CONSTANT.PARQUERY_URL + config.CONSTANT.PARQUERY_ENDPOINTS.TIME_TRACK_VIDEO_FROM_FORM,
                    //  form: formData,
                    formData: form,
                    // auth: config.CONSTANT.AUTH_DATA_PARQURY,
                    url: params.buildingUrl === "" ? config.CONSTANT.PARQUERY_URL +  config.CONSTANT.PARQUERY_ENDPOINTS.TIME_TRACK_VIDEO_FROM_FORM  : params.buildingUrl +  config.CONSTANT.PARQUERY_ENDPOINTS.TIME_TRACK_VIDEO_FROM_FORM,
                    auth: params.buildingUrl === "" ? config.CONSTANT.AUTH_DATA_PARQURY : getParquaryAuthData(params) ,
                },
                function (err, httpResponse, body) {
                    let file = fs.createWriteStream(httpResponse.body);
                    //    if (!err && httpResponse.statusCode === 200){
                        httpResponse.pipe(file);

                    resolve(httpResponse);
                    //    }else{
                    // reject(err);
                    //    }
                    // console.log(httpResponse);
                }
            );
        });
    }

    /**
     * @author Utkarsh 22/07/2020
     * @description retrieves the snapshot of the system closest to the given time point.
     */
    async getPlanImage(params) {
        let g = [
            {
                "spot_id": "0",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "1",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "10",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "11",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "12",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "13",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "14",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "15",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "16",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "17",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "18",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "19",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "2",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595483279,
                "duration": 1800,
                "number_plate": "1"

            },
            {
                "spot_id": "20",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "21",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595449136,
                "duration": 35943,
                "number_plate": "2"

            },
            {
                "spot_id": "22",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595438517,
                "duration": 46562,
                "number_plate": "3"

            },
            {
                "spot_id": "23",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "24",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "25",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "26",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "27",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "28",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "29",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "3",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595483279,
                "duration": 1800,
                "number_plate": "4"
            },
            {
                "spot_id": "30",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "31",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595459338,
                "duration": 25741,
                "number_plate": "5"
            },
            {
                "spot_id": "32",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "33",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "34",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "35",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "36",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "37",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "38",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "39",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "4",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "40",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "41",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "0",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "1",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "10",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "11",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "12",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "13",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "14",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "15",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "16",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "17",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "18",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "19",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "2",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595483279,
                "duration": 1800,
                "number_plate": "1"

            },
            {
                "spot_id": "20",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "21",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595449136,
                "duration": 35943,
                "number_plate": "2"

            },
            {
                "spot_id": "22",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595438517,
                "duration": 46562,
                "number_plate": "3"

            },
            {
                "spot_id": "23",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "24",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "25",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "26",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "27",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "28",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "29",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "3",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595483279,
                "duration": 1800,
                "number_plate": "4"
            },
            {
                "spot_id": "30",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "31",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595459338,
                "duration": 25741,
                "number_plate": "5"
            },
            {
                "spot_id": "32",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "33",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "34",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "35",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "36",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "37",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "38",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "39",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "4",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "40",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "41",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "0",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "1",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "10",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "11",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "12",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "13",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "14",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "15",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "16",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "17",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "18",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "19",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "2",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595483279,
                "duration": 1800,
                "number_plate": "1"

            },
            {
                "spot_id": "20",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "21",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595449136,
                "duration": 35943,
                "number_plate": "2"

            },
            {
                "spot_id": "22",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595438517,
                "duration": 46562,
                "number_plate": "3"

            },
            {
                "spot_id": "23",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "24",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "25",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "26",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "27",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "28",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "29",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "3",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595483279,
                "duration": 1800,
                "number_plate": "4"
            },
            {
                "spot_id": "30",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "31",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595459338,
                "duration": 25741,
                "number_plate": "5"
            },
            {
                "spot_id": "32",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "33",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "34",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "35",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "36",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "37",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "38",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "39",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "4",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "40",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "41",
                "camera_id": "cotesa-384",
                "occupied": false
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
            {
                "spot_id": "42",
                "camera_id": "cotesa-384",
                "occupied": true,
                "event_start": 1595485079,
                "duration": 0,
                "number_plate": "6"
            },
        ];
        let c = [
            {
                "emp_id": "1",
                "number_plate": "1"
            },
            {
                "emp_id": "2",
                "number_plate": "2"
            },
            {
                "emp_id": "3",
                "number_plate": "3"
            },
            {
                "emp_id": "4",
                "number_plate": "4"
            },
            {
                "emp_id": "5",
                "number_plate": "5"
            },
            {
                "emp_id": "6",
                "number_plate": "6"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "7",
                "number_plate": "7"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
            {
                "emp_id": "8",
                "number_plate": "8"
            },
        ];
        let arrayList = [];
        for (let i in g) {
            let obj = {spot_id: g[i].spot_id, camera_id: g[i].camera_id, occupied: g[i].occupied, event_start: g[i].event_start, duration: g[i].duration, number_plate: g[i].number_plate, emp_id: 'NA'};
            for (let j in c) {
                if (g[i].number_plate === c[j].number_plate) {
                    obj.emp_id = c[j].emp_id;
                }
            }
            arrayList.push(obj);
        }
        return arrayList;
    }
    /**
     * @author Aashiq 31/08/2020
     * @description retrieves the vehicle data.
     */
    async getvehData(params) {
        let query: any = {};
        let aggPipeline = [];
        query = {regNo: {$in: params}};
        aggPipeline.push({"$match": query});
        let lookup: any = {};
        lookup = {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "users"
        };
        aggPipeline.push({"$lookup": lookup});
        aggPipeline.push({$unwind: {path: "$users", preserveNullAndEmptyArrays: true}});
        // aggPipeline.push({"$match": {$and: [{"status": {$eq: config.CONSTANT.STATUS.UN_BLOCKED}}, {"users.status": {$eq: config.CONSTANT.STATUS.UN_BLOCKED}}]}});
        let project: any = {};
        project = {
            vehicleId: "$_id",
            userId: 1,
            regNo: 1,
            companyId: 1,
            vehicleType: 1,
            vehicleStatus: "$status",
            userType: "$users.type",
            userStatus: "$users.status",
            email: "$users.email",
            name: "$users.name",
            contactNo: "$users.contactNo",
            _id: 0,
        };
        aggPipeline.push({"$project": project});
        let response = await this.aggregate("vehicles", aggPipeline, {});
        return response;
    }
    async getCompanyDetails(params){
        let query = {_id: params.companyId};
        return await this.findOne("company_details", query, {}, {});
    }
    async getEmpCount(params){
        let query = {companyId: params.companyId, type: config.CONSTANT.ADMIN_TYPE.EMPLOYEE, status: {"$ne": config.CONSTANT.STATUS.BLOCKED}};
        return await this.count("users", query);
    }
    async getVehicleCount(params){
        let query = {companyId: params.companyId, status: {"$ne": config.CONSTANT.STATUS.BLOCKED}};
        return await this.count("vehicles", query);
    }
    async getEntryLogCount(params){
        let query = {companyId: params.companyId};
        return await this.count("vehicles", query);
    }
}
