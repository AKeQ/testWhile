const moment = require("moment-timezone");
const async = require('async');
let test = require('./waitTest.js');

let time_all_loop = 30; // s
let time_single_loop = 1200; // ms

let end_time = moment().add(time_all_loop, 'seconds');
let queue_data = [];

for (let count = 0; count < 200; count++) {
	queue_data.push(count);
}

let loop_count = 1;

async.whilst(function () {
	if (moment() <= end_time) {
		return true;
	} else {
		return false;
	}
}, function (whilstBack) {
	async.parallel([
		function (parallelBack) {
			// Wait for 1.2 sec
			logger("starting loop:", loop_count);
			setTimeout(function () {
				parallelBack();
			}, time_single_loop);
		},
		function (parallelBack) {
			// Process Queue
			logger("process queue:", loop_count);

			//parallelBack();
			processQueue(15, (arrayEmail) => {
				logger("arrayEmail : " + arrayEmail.length);
				// callback
				async.eachOfLimit(arrayEmail, 15,
					(objEmail, key, eachBack) => {
						test.testWait1(loop_count, objEmail, (result) => {
							logger(result);
						});
						eachBack();
					});
				// async/awiat
				/*
				async.eachOfLimit(arrayEmail, 15,
					(objEmail, key) => {
						try {
							let result = await test.testWait2(loop_count, objEmail);
							logger(result);
						} catch (error) {
							logger.error(error);
						}
					});
					*/
				parallelBack();
			});
		}
	], function (err, results) {
		logger("---finished loop:", loop_count + "---");
		loop_count++;
		whilstBack();
	});
}, function () {
	// Complete
	logger("Completed all loop");
});

function logger(message) {
	console.log(moment().tz("Asia/Hong_Kong").format("YYYY-MM-DD HH:mm:ss.SSS") + " [INFO] " + message);
}

function processQueue(maxMsgThrottle, pCallback) {
	let arrayMsg = [];
	let count = 0;
	let breakLoop = false;
	async.whilst(
		() => {
			return count < maxMsgThrottle / 10 * 2
				&& arrayMsg.length < maxMsgThrottle
				&& !breakLoop
		},
		(callback2) => {
			let vMaxNumber = 0;
			if (maxMsgThrottle - arrayMsg.length >= 10) {
				vMaxNumber = 10;
			} else {
				vMaxNumber = maxMsgThrottle - arrayMsg.length;
			}
			if (queue_data.length !== 0) {
				let vCount = Math.floor(Math.random() * (vMaxNumber - 0 + 1)) + 0;
				for (let i = 0; i < vCount; i++) {
					let temp = queue_data.pop();
					arrayMsg.push(temp);
				}
				logger("get message, " + count + ", " + vCount);
				count++;
				callback2(null, arrayMsg);
			} else {
				breakLoop = true;
			}
		},
		(err, result) => {
			if (err) {
				mailSQSLogger.error(err);
				pCallback(err);
			}
			pCallback(result);
		});
}
