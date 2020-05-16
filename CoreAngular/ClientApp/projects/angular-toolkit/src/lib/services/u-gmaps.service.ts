
import { Injectable } from '@angular/core';
import { } from '@angular/common';
import { } from 'googlemaps';

import { UGenericsService } from './u-generics.service'

@Injectable()
export class UGmapsService {
	public map: google.maps.Map;

	public current_location: any;
	public current_address: any;
	public map_bounds: any;
	public map_center: any;
	public zoom_level: any = 12;
	public duration: any = "30";

	constructor(public ugs: UGenericsService) {
	}


	//=================================================================================
	getMyLocation(eid) {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(p => {
				this.current_location = new google.maps.LatLng(p.coords.latitude, p.coords.longitude);
        this.ugs.Loger(`Location: ${p.coords.latitude} ${p.coords.longitude}`);
				var geocoder = new google.maps.Geocoder;

				geocoder.geocode({ 'location': this.current_location }, function (results, status) {
					if ((status.toString() === 'OK') && results[0]) {
						this.current_address = results[0].formatted_address;
						this.ugs.Loger("Address: " + this.current_address);
						var currentAddressLabel = document.getElementById(eid);
						if (!currentAddressLabel) return;
						currentAddressLabel.innerText = this.current_address;

					}
					else {
						this.ugs.Loger("*** Geocoder failed due to: " + status);
					}
				}.bind(this))
			})
		}
		else {
			this.ugs.Loger("*** Geo Location not supported");
		}

		//this.drawCenteredMap("32.05, 34.75");
	}


	//=================================================================================
	mapMyLocation(centerPoint) {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(p => {
				this.current_location = new google.maps.LatLng(p.coords.latitude, p.coords.longitude);
        this.ugs.Loger(`Location: ${p.coords.latitude} ${p.coords.longitude}`);
				this.drawCenteredMap(this.current_location);
				this.drawMarker(this.current_location);
			})
		}
		else {
			this.ugs.Loger("*** Geo Location not supported");
		}

		//this.drawCenteredMap("32.05, 34.75");
	}


	//=================================================================================
	mapDrawRoute(destination) {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(p => {
				this.current_location = new google.maps.LatLng(p.coords.latitude, p.coords.longitude);
        this.ugs.Loger(`Location: ${p.coords.latitude} ${p.coords.longitude}`);
				this.drawCenteredMap(this.current_location);
				this.getGoogleDuration(this.current_location, destination);
			})
		}
		else {
			this.ugs.Loger("*** Geo Location not supported");
		}
	}


  //=================================================================================
	drawCenteredMap(mapCenter) {
		this.map_center = mapCenter;

		var map_options = {
			zoom: this.zoom_level,
			center: this.map_center,
			mapTypeControl: false,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};

		var elmMap = document.getElementById("mapcanvas");
		this.map = new google.maps.Map(elmMap, map_options);

		//this.map_bounds = new google.maps.LatLngBounds();
		//this.map_bounds.extend(this.map_center);
		//this.map.fitBounds(this.map_bounds);
	}


	//=================================================================================
	drawMarker(latlng, icon?, title?, info_data?, onLongClickMarkerAction?) {
		// if (icon === null) icon = "https://maps.google.com/mapfiles/kml/pal4/icon30.png"; // fontawesome.markers.MAP_MARKER;

		var set_title = title ? title : this.ugs.uTranslate("Here_Within_7");
		info_data = info_data ? info_data : (title ? title : "%");

		var marker = new google.maps.Marker(
			{
				position: latlng,
				map: this.map,
				title: set_title,
				//data: info_data,
				optimized: false,
				//icon: {
				//	path: icon,
				//	scale: 0.4,
				//	strokeWeight: 0.2,
				//	strokeColor: 'black',
				//	strokeOpacity: 1,
				//	fillColor: 'blue',
				//	fillOpacity: 0.7
				//}
			});

		//var zoom_change_bounds_listener = google.maps.event.addListener(this.map, 'bounds_changed', function (event) {
		//	if (this.getZoom() !== this.zoom_level) {
		//		this.setZoom(this.zoom_level);
		//	}

		//	google.maps.event.removeListener(zoom_change_bounds_listener);
		//});

		//this.map_bounds.extend(marker.getPosition);
		//this.map.fitBounds(this.map_bounds);

		//this.setMarkerInfoWindow(marker, onLongClickMarkerAction);

		return marker;
	}


	//=================================================================================
	setMarkerInfoWindow(marker, onLongClickMarkerAction) {
		if (!marker.data) return;

		var long_press = false;
		var start = null;

		google.maps.event.addListener(marker, 'click', function (event) {
			if ((long_press) && (onLongClickMarkerAction !== null)) {
				onLongClickMarkerAction(marker);
			}
			else {
				this.onShortClickMarkerAction(marker);
			}
		});

		google.maps.event.addListener(marker, 'mousedown', function (event) {
			start = new Date().getTime();
		});

		google.maps.event.addListener(marker, 'mouseup', function (event) {
			var end = new Date().getTime();
			long_press = (end - start < 500) ? false : true;
		});
	}


	//=================================================================================
	onShortClickMarkerAction(marker) {
		if (marker.data.indexOf("%") !== -1) {
			var geocoder = new google.maps.Geocoder;
			geocoder.geocode({ 'location': marker.position }, function (results, status) {
				if ((status.toString() === 'OK') && results[0]) {
					marker.setTitle(marker.title + "\n" + results[0].formatted_address);
					marker.data = (marker.data.replace("%", results[0].formatted_address))
					this.openInfoWindow(marker, marker.data)
				}
				else {
					this.gs.Loger("*** Geocoder failed due to: " + status);
				}
			})
		}
		else {
			this.openInfoWindow(marker, marker.data)
		}
	}


	//=================================================================================
	openInfoWindow(marker, content) {
		var info_window = new google.maps.InfoWindow(
			{
				content: "<p><br />" + content.replaceAll("\n", "<br />") + "</p>",
				position: marker.position
			});

		info_window.open(marker.map);
	}


	//=================================================================================
	getGoogleDuration(origin, destination, callback?, context?) {
		//if (!callback || !context) return;

		var directions_service = new google.maps.DirectionsService();
		var directions_display = null;

		if (this.map) {
			directions_display = new google.maps.DirectionsRenderer({
				preserveViewport: true,
				map: this.map
			});
		}

		var request = {
			origin: origin,
			destination: destination,
			travelMode: google.maps.TravelMode.DRIVING
		};

		directions_service.route(request, function (response, status) {
			if (status === google.maps.DirectionsStatus.OK) {
				if (directions_display) {
					directions_display.setDirections(response);
				}

				this.duration = (response.routes[0].legs[0].duration.value / 60).toFixed(0);
				if (callback) callback(context, this.duration);
			} else {
				this.duration = 30;
				this.ugs.Loger('Please enter a starting location', true);
				if (callback) callback(context, "~" + this.duration.toString());
			}
		}.bind(this));
	}
}

