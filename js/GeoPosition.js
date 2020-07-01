function ShowPositionValues(position){
	let pos = position.coords;
	console.log("lat: " + pos.latitude);
	console.log("long: " + pos.longitude);
	$(".place_field").attr("disabled", true);
	$("#city_input").val("Using geolocation info");
}

function GetPosition(){
	navigator.geolocation.getCurrentPosition(ShowPositionValues);
}