

//=================================================================================
var		g_map				= null;
var		g_current_location	= null;
var		g_map_bounds		= null;
var		g_map_center		= null;
var		g_zoom_level		= 12;


//=================================================================================
function drawMap(get_current_position) { // true | false
	if (!g_map_center) g_map_center = new google.maps.LatLng("32.05", "34.75");

	g_map_bounds = new google.maps.LatLngBounds(); // DO NOT REMOVE!!!
	g_map_bounds.extend(g_map_center);

	var map_options = {
		zoom: g_zoom_level,
		center: g_map_center,
		mapTypeControl: false,
		navigationControlOptions: {
			style: google.maps.NavigationControlStyle.SMALL
		},

		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	g_map = new google.maps.Map(document.getElementById("mapcanvas"), map_options);

	if (get_current_position)
	{
		getCurrentPosition();
	}
}


//=================================================================================
function drawMarker(lat, lng, icon, title, info_data, onLongClickMarkerAction)
{
	if (icon == null) icon = fontawesome.markers.MAP_MARKER;

	var set_title = title		? title		: g_here_within_7;
	var info_data = info_data	? info_data	: (title ? title : "%");
	//set_title = IsEmpty(title) ? g_here_within_7 : title;
	//info_data = IsEmpty(info_data) ? IsEmpty(title) ? "%" : title : info_data;

	var marker = new google.maps.Marker(
		{
			position: new google.maps.LatLng(lat, lng),
			map: g_map,
			title: set_title,
			data: info_data,
			optimized: false,
			icon: {
				path: icon,
				scale: 0.4,
				strokeWeight: 0.2,
				strokeColor: 'black',
				strokeOpacity: 1,
				fillColor: 'blue',
				fillOpacity: 0.7
			}
		});

	zoom_change_bounds_listener = google.maps.event.addListener(g_map, 'bounds_changed', function (event)
	{
		if (this.getZoom() != g_zoom_level)
		{
			this.setZoom(g_zoom_level);
		}

		google.maps.event.removeListener(zoom_change_bounds_listener);
	});

	g_map_bounds.extend(marker.position);
	g_map.fitBounds(g_map_bounds);

	setMarkerInfoWindow(marker, onLongClickMarkerAction);

	return marker;
}


//=================================================================================
function setMarkerInfoWindow(marker, onLongClickMarkerAction)
{
	if (!marker.data) return;

	var long_press = false;

	google.maps.event.addListener(marker, 'click', function (event)
	{
		if ((long_press) && (onLongClickMarkerAction != null))
		{
			onLongClickMarkerAction(marker);
		}
		else
		{
			onShortClickMarkerAction(marker);
		}
	});

	google.maps.event.addListener(marker, 'mousedown', function (event)
	{
		var start = new Date().getTime();
	});

	google.maps.event.addListener(marker, 'mouseup', function (event)
	{
		var end = new Date().getTime();
		long_press = (end - start < 500) ? false : true;
	});
}


//=================================================================================
function onShortClickMarkerAction(marker)
{
	if (marker.data.indexOf("%") !== -1)
	{
		var geocoder = new google.maps.Geocoder;
		geocoder.geocode({ 'location': marker.position }, function (results, status)
		{
			if ((status === 'OK') && results[0])
			{
				marker.setTitle(marker.title + "\n" + results[0].formatted_address);
				marker.data = (marker.data.replace("%", results[0].formatted_address))
				openInfoWindow(marker, marker.data)
			}
			else
			{
				Loger("*** Geocoder failed due to: " + status);
			}
		})
	}
	else
	{
		openInfoWindow(marker, marker.data)
	}
}


//=================================================================================
function openInfoWindow(marker, content)
{
	var info_window = new google.maps.InfoWindow(
	{
		content: "<p><br />" + content.replaceAll("\n", "<br />") + "</p>",
		position: marker.position
	});

	info_window.open(marker.map);
}


//=================================================================================
function getCurrentPosition()
{
	if (navigator.geolocation)
	{
		navigator.geolocation.getCurrentPosition(geo_success, geo_error);
	}
	else
	{
		Loger("*** Geo Location not supported");
	}

	function geo_success(positionCurrent)
	{
		g_current_location = new google.maps.LatLng(positionCurrent.coords.latitude, positionCurrent.coords.longitude);

		Loger("Location: " + sprintf("%.5f %.5f",   positionCurrent.coords.latitude,
													positionCurrent.coords.longitude));

		if (g_map) {
			var icon = fontawesome.markers.HOME; // "https://maps.google.com/mapfiles/kml/pal4/icon29.png";
			marker = drawMarker(positionCurrent.coords.latitude, positionCurrent.coords.longitude, icon);
			google.maps.event.trigger(marker, 'click');
		}

		if (typeof onLocationChange !== 'undefined' && typeof onLocationChange === 'function') {
			onLocationChange();
		}
	}

	function geo_error(msg)
	{
		Loger("*** " + msg.message, true);
	}
}


//=================================================================================
function getGoogleDuration(origin, destination, callback) {
	var directions_service = new google.maps.DirectionsService();
	var directions_display = null;

	if (g_map) {
		directions_display = new google.maps.DirectionsRenderer({
			preserveViewport: true,
			map: g_map
		});
	}
	if (!callback) return;

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

			duration = (response.routes[0].legs[0].duration.value / 60).toFixed(0);
			callback(duration);
		} else {
			callback("~0:30");
			window.alert('Please enter a starting location');
		}
	});
}
