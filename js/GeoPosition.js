function ShowPositionValues(position){	// Set lat and lon fields to geolocation values
	let pos = position.coords;
	console.log("lat: " + pos.latitude);
	console.log("long: " + pos.longitude);
	$(".place_field").attr("disabled", true);
	$("#city_input").val("Using geolocation info");
	$("#lat_field").val(pos.latitude);
	$("#lon_field").val(pos.longitude);
}

// TODO: Make possible to change back to city input


function GetPosition(){	// Get geolocation values from browser
	navigator.geolocation.getCurrentPosition(ShowPositionValues);
}