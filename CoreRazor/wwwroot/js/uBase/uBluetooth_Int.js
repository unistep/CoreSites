

function read_bt() {
	var charIPay = null;

	navigator.bluetooth.requestDevice({
		filters: [{ name: 'iPay' }],
		//acceptAllDevices: true,
		optionalServices: ['generic_access']
		})
		.then(device => {

			('Connecting to GATT Server...');
			return device.gatt.connect();
		})
		.then(server => {
			Loger('Getting GAP Service...');
			return server.getPrimaryService('generic_access');
		})
		.then(service => {
			Loger('Getting GAP Characteristics...');
			return service.getCharacteristics();
		})
		.then(characteristics => {
			charIPay = characteristics;
			let queue = Promise.resolve();
			let decoder = new TextDecoder('utf-8');

			queue = queue.then(_ => charIPay[0].readValue()).then(value => {
				Loger('Appearance: ' + value.getUint16(0, true /* Little Endian */));
			});

			queue = queue.then(_ => charIPay[1].readValue()).then(value => {
				Loger('Device : ' + decoder.decode(value));
			});

			var request = downloadParameter();

			queue = queue.then(_ => charIPay[0].writeValue(request.buffer)).then(_ => {
				Loger('Params download');
			});

			queue = queue.then(_ => charIPay[0].readValue()).then(value => {
				Loger('CardData : ' + decoder.decode(value));
			});
		})
		.catch(error => {
				Loger('Error: ' + error.message);
		});
}

function padHex(value) {
	return ('00' + value.toString(16).toUpperCase()).slice(-2);
}

function getUsbVendorName(value) {
	// Check out page source to see what valueToUsbVendorName object is.
	return value +
		(value in valueToUsbVendorName ? ' (' + valueToUsbVendorName[value] + ')' : '');
}

function handleNotifications(event) {
	var value = event.target.value;
	Loger('Received ' + value);
	// TODO: Parse Heart Rate Measurement value.
	// See https://github.com/WebBluetoothCG/demos/blob/gh-pages/heart-rate-sensor/heartRateSensor.js
}

function readAppearanceValue(characteristics) {
	return characteristics.readValue().then(value => {
		Loger('Appearance: ' + value.getUint16(0, true /* Little Endian */));
	});
}

function readDeviceNameValue(characteristics) {
	return characteristics.readValue().then(value => {
		Loger('Device Name: ' + new TextDecoder().decode(value));
	});
}

function readPPCPValue(characteristics) {
	return characteristics.readValue().then(value => {
		Loger('> Peripheral Preferred Connection Parameters: ');
		Loger('  > Minimum Connection Interval: ' +
			(value.getUint8(0) | value.getUint8(1) << 8) * 1.25 + 'ms');
		Loger('  > Maximum Connection Interval: ' +
			(value.getUint8(2) | value.getUint8(3) << 8) * 1.25 + 'ms');
		Loger('  > Slave Latency: ' +
			(value.getUint8(4) | value.getUint8(5) << 8) + 'ms');
		Loger('  > Connection Supervision Timeout Multiplier: ' +
			(value.getUint8(6) | value.getUint8(7) << 8));
	});
}

function readCentralAddressResolutionSupportValue(characteristics) {
	return characteristics.readValue().then(value => {
		let supported = value.getUint8(0);
		if (supported === 0) {
			Loger('> Central Address Resolution: Not Supported');
		} else if (supported === 1) {
			Loger('> Central Address Resolution: Supported');
		} else {
			Loger('> Central Address Resolution: N/A');
		}
	});
}

function readPeripheralPrivacyFlagValue(characteristics) {
	return characteristics.readValue().then(value => {
		let flag = value.getUint8(0);
		if (flag === 1) {
			Loger('> Peripheral Privacy Flag: Enabled');
		} else {
			Loger('> Peripheral Privacy Flag: Disabled');
		}
	});
}

/* Utils */

function getDeviceType(value) {
	// Check out page source to see what valueToDeviceType object is.
	return value +
		(value in valueToDeviceType ? ' (' + valueToDeviceType[value] + ')' : '');
}

//function read_bt() {
//    //var MAIN_UUID = "00001101-0000-1000-8000-00805F9B34FB";

//	let options = {
//		optionalServices: ['00001101-0000-1000-8000-00805f9b34fb']
//	};

//	let filters = [];

//	filters.push({
//		services: ['00001101-0000-1000-8000-00805f9b34fb']
//	});

//	filters.push({
//		name: 'iPay'
//	});

//	options.filters = filters;

//	Loger("Got here: " + navigator.bluetooth)
//	navigator.bluetooth.requestDevice({
//		acceptAllDevices: true,
//		optionalServices: ['00001101-0000-1000-8000-00805f9b34fb']
//	}).then(device => {
//		Loger("Got here 1")
//		return device.gatt.connect();
//	}).then(server => {
//		Loger("Got here 2")
//		return server.getPrimaryService('00001101-0000-1000-8000-00805f9b34fb');
//	}).then(service => {
//		Loger("Got here 3")
//		chosenHeartRateService = service;
//		return Promise.all([
//			service.getCharacteristic('00000001-0000-1000-8000-00805f9b34fb').then(w),
//			service.getCharacteristic('00000003-0000-1000-8000-00805f9b34fb').then(read)
//		]);

//	}).catch(error => {
//		Loger("Got here 4")
//		Loger(error.message);
//		});
//}

function crc16(btData) {
	var CRC = 0;
	var Tmp = false;

	for (i = 0; i < btData.length; ++i) {
		CRC = (CRC & '\uffff' ^ btData[i] & 255);

		for (j = 0; j < 8; ++j) {
			Tmp = (CRC & 1);
			CRC = ((CRC & '\uffff') >> 1);
			if (Tmp > 0) {
				CRC = (CRC & '\uffff' ^ 'ꀁ');
			}
		}
	}

	var byteCRC = new Uint8Array(2);
	byteCRC[0] = CRC >> 8;
	byteCRC[1] = CRC & 0xff;

	return byteCRC;
}


function downloadParameter()
{
	var content = new Uint8Array(27);

	content[0] = 0;
	content[1] = 22;
	content[2] = 53;
	content[3] = -1; // shutdown
	content[4] = 0;
	content[5] = 0; // delay time
	content[6] = 1; // buzzer
	content[7] = 1; // bluetooth
	content[8] = 1; // track 1
	content[9] = 1; // track 2
	content[10] = 1; // track 3
	content[11] = 0x9f; // send other

	content[12] = -1; // filler
	content[13] = -1; // filler
	content[14] = -1; // filler
	content[15] = -1; // filler
	content[16] = -1; // filler
	content[17] = -1; // filler
	content[18] = -1; // filler
	content[19] = -1; // filler
	content[20] = -1; // filler
	content[21] = -1; // filler
	content[22] = -1; // filler
	content[23] = -1; // filler
	content[24] = 0; // tail
	content[25] = 0; // tail
	content[26] = 0; // tail

	var byteCRC = crc16(content);

	content = concatenate(Uint8Array, new Uint8Array(2), content, byteCRC)
	return content;
	
	//content = ArraysUtil.concat(content, param.getShutdownMode());
	//content = ArraysUtil.concat(content, ArraysUtil.int2bytes((param.getDelayTime() & '\uffff') / 2, 2));
	//content = ArraysUtil.concat(content, (byte)(param.isBuzzerEnabled() ? 1 : 0));
	//content = ArraysUtil.concat(content, (byte)(param.isBluetoothEnabled() ? 1 : 0));
	//content = ArraysUtil.concat(content, (byte)(param.isTrackOneEnabled() ? 1 : 0));
	//content = ArraysUtil.concat(content, (byte)(param.isTrackTwoEnabled() ? 1 : 0));
	//content = ArraysUtil.concat(content, (byte)(param.isTrackThreeEnabled() ? 1 : 0));
	//content = ArraysUtil.concat(content, param.getSendOther());
	////content = ArraysUtil.concat(content, new byte[]{-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1});
	//content = ArraysUtil.concat(content, tail);
	////byte[] crc = ArraysUtil.int2bytes(this.crc16(content), 2);
	//if (this.manager.write(ArraysUtil.concat(ArraysUtil.concat(head, content), crc)))
	//{
	//	//byte[] bytes = this.receive();
	//	if (bytes != null)
	//	{
	//		//byte cmd = bytes[0];
	//		//byte state = bytes[1];
	//		if (cmd == 53)
	//		{
	//			this.bSendOther = param.getSendOther();
	//			this.sendMessage(1, 9, state);
	//		}
	//	}
	//}
}

function concatenate(resultConstructor, ...arrays) {
	let totalLength = 0;
	for (const arr of arrays) {
		totalLength += arr.length;
	}
	const result = new resultConstructor(totalLength);
	let offset = 0;
	for (const arr of arrays) {
		result.set(arr, offset);
		offset += arr.length;
	}
	return result;
}