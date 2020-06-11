

function read_bt() {
	Loger('Requesting any Bluetooth Device...');

	navigator.bluetooth.requestDevice({
		// filters: [...] <- Prefer filters to save energy & show relevant devices.
		acceptAllDevices: true,
		optionalServices: ['generic_access']
		})
		.then(device => {
			Loger('Connecting to GATT Server...');
			return device.gatt.connect();
		})
		.then(server => {
			Loger('Getting GAP Service...');
			return server.getPrimaryService('generic_access');
		})
		.then(service => {
			Loger('Getting GAP Characteristics...');
			return service.getCharacteristics();
			//return service.read();
		})
		.then(characteristics => {
			let queue = Promise.resolve();
			let decoder = new TextDecoder('utf-8');
			characteristics.forEach(characteristic => {
				switch (characteristic.uuid) {

					case BluetoothUUID.getCharacteristic('manufacturer_name_string'):
						queue = queue.then(_ => characteristic.readValue()).then(value => {
							log('> Manufacturer Name String: ' + decoder.decode(value));
						});
						break;

					case BluetoothUUID.getCharacteristic('model_number_string'):
						queue = queue.then(_ => characteristic.readValue()).then(value => {
							log('> Model Number String: ' + decoder.decode(value));
						});
						break;

					case BluetoothUUID.getCharacteristic('hardware_revision_string'):
						queue = queue.then(_ => characteristic.readValue()).then(value => {
							log('> Hardware Revision String: ' + decoder.decode(value));
						});
						break;

					case BluetoothUUID.getCharacteristic('firmware_revision_string'):
						queue = queue.then(_ => characteristic.readValue()).then(value => {
							log('> Firmware Revision String: ' + decoder.decode(value));
						});
						break;

					case BluetoothUUID.getCharacteristic('software_revision_string'):
						queue = queue.then(_ => characteristic.readValue()).then(value => {
							log('> Software Revision String: ' + decoder.decode(value));
						});
						break;

					case BluetoothUUID.getCharacteristic('system_id'):
						queue = queue.then(_ => characteristic.readValue()).then(value => {
							log('> System ID: ');
							log('  > Manufacturer Identifier: ' +
								padHex(value.getUint8(4)) + padHex(value.getUint8(3)) +
								padHex(value.getUint8(2)) + padHex(value.getUint8(1)) +
								padHex(value.getUint8(0)));
							log('  > Organizationally Unique Identifier: ' +
								padHex(value.getUint8(7)) + padHex(value.getUint8(6)) +
								padHex(value.getUint8(5)));
						});
						break;

					case BluetoothUUID.getCharacteristic('ieee_11073-20601_regulatory_certification_data_list'):
						queue = queue.then(_ => characteristic.readValue()).then(value => {
							log('> IEEE 11073-20601 Regulatory Certification Data List: ' +
								decoder.decode(value));
						});
						break;

					case BluetoothUUID.getCharacteristic('pnp_id'):
						queue = queue.then(_ => characteristic.readValue()).then(value => {
							log('> PnP ID:');
							log('  > Vendor ID Source: ' +
								(value.getUint8(0) === 1 ? 'Bluetooth' : 'USB'));
							if (value.getUint8(0) === 1) {
								log('  > Vendor ID: ' +
									(value.getUint8(1) | value.getUint8(2) << 8));
							} else {
								log('  > Vendor ID: ' +
									getUsbVendorName(value.getUint8(1) | value.getUint8(2) << 8));
							}
							log('  > Product ID: ' +
								(value.getUint8(3) | value.getUint8(4) << 8));
							log('  > Product Version: ' +
								(value.getUint8(5) | value.getUint8(6) << 8));
						});
						break;

					case BluetoothUUID.getCharacteristic('gap.appearance'):
						queue = queue.then(_ => readAppearanceValue(characteristic));
						break;

					case BluetoothUUID.getCharacteristic('gap.device_name'):
						queue = queue.then(_ => readDeviceNameValue(characteristic));
						break;

					default: log('> Unknown Characteristic: ' + characteristic.uuid);
				}
			});
			return queue;
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

