'use strict'

const moment = require("moment-timezone");

function logger(message) {
    console.log(moment().tz("Asia/Hong_Kong").format("YYYY-MM-DD HH:mm:ss.SSS") + " [INFO] " + message);
}

function testWait1(count, objEmail, callback) {

    setTimeout(function () {
        logger("No. " + count, objEmail);
        callback("Success " + count);
    }, 2000);

}

exports.testWait1 = testWait1;

function testWait2(count, objEmail) {
    return new Promise(async (resolved, rejected) => {
        setTimeout(function () {
            logger("No. " + count, objEmail);
            resolved("Success " + count);
        }, 2000);
    });
}

exports.testWait2 = testWait2;


