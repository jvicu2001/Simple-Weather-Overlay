var lastCondition = {
	icon: "",
	condition: "",
	current: "",
	min: "",
	max: ""
};
var placeCoordinates = {
	lat: "",
	lon: ""
}
$(document).ready(function(){
	var parameters = new URL(window.location.href).searchParams;
	var API_key = parameters.get("api_key");
	if (parameters.get("theme") === "on"){
		$(".WeatherInfo").addClass("Dark");
	}
	else {
		$(".WeatherInfo").addClass("Light");
	}
	var place = "";
	if (parameters.get("country")) {
		place = parameters.get("city") + "," + parameters.get("country").toLowerCase();
	}
	else {
		place = parameters.get("city");
	}
	var units = parameters.get("units");
	var unitsSymbol = "°K";
	if (units === "metric") {
		unitsSymbol = "°C";
	}
	else if (units === "imperial") {
		unitsSymbol = "°F";
	}
	var lang = parameters.get("lang");
	var showPlace = parameters.get("show-place");
	var fullDescription = parameters.get("full-description");
	var minMaxText = parameters.get("min-max_text");
	var nextMin = parameters.get("next-min");
	var tempMin;
	var tempMax;
	var midday = GetMidday();
	if (parameters.get("lat")){
		placeCoordinates.lat = parameters.get("lat");
		placeCoordinates.lon = parameters.get("lon");
	}
		
	
	function PlaceData() {
		let params = {};
		if (placeCoordinates.lat){
			params = {
				"lat": placeCoordinates.lat,
				"lon": placeCoordinates.lon,
				"appid": API_key
			}
		}
		else{
			params = {
				"q": place,
				"APPID": API_key,
				"units": units,
				"lang": lang
			}
		}
		$.ajax({
			url: "https://api.openweathermap.org/data/2.5/weather",
			data: params,
			type: "GET",
			dataType: "json"
		})
		.done(function( json ) {
			placeCoordinates = json.coord;
			if (showPlace === "on") {
				$("#PlaceName").text(json.name);
			}
			CurrentData();

		})
		.fail(function( jqXHR ) {
			let status = jqXHR.status;
			console.log(jqXHR.responseText);
			if (status == 401){
				$( ".CurrentTemp" ).text("Bad API key.");
			}
			else if (status == 404){
				$( ".CurrentTemp" ).text("City not found.");
			}
			else if (status == 408){
				$( ".CurrentTemp" ).text("Response timeout. Check your internet connection.");
			}
			else if (status == 418){
				console.log("The mythical taepot has been found.");
				$( ".CurrentTemp" ).text("TEAPOT");
			}
			else if (status == 500){
				$( ".CurrentTemp" ).text("Internal server (OpenWeather) error (500)\nContact website mantainer.");
			}
			else if (status == 502){
				$( ".CurrentTemp" ).text("Bad Gateway\n Try again later.");
			}
			else if (status == 503){
				$( ".CurrentTemp" ).text("OpenWeather service unavailable.\n Try again later.");
			}
			else{
				$( ".CurrentTemp" ).text("Error " + status + "\nCheck console for more info");
			}
		});
	}
	
	function GetMidday(){
		let timeValue =  new Date;
		timeValue.setHours(12,0,0,0);
		return timeValue.getTime();
	}
	
	function CurrentData() {
		$.ajax({
			url: "https://api.openweathermap.org/data/2.5/onecall",
			data: {
				"lat": placeCoordinates.lat,
				"lon": placeCoordinates.lon,
				"APPID": API_key,
				"units": units,
				"lang": lang
			},
			type: "GET",
			dataType: "json"
		})
		.done(function( json ) {
			let condition_type = "";
			if (fullDescription === "on") {
				condition_type = json.current.weather[0].description;
			}
			else {
				condition_type = json.current.weather[0].main;
			}
			if (json.current.weather[0].icon !== lastCondition.icon) {
				$( "#icon" ).attr( "src", "https://openweathermap.org/img/wn/" + json.current.weather[0].icon + "@2x.png" );
				lastCondition.icon = json.current.weather[0].icon;
			}
			if (condition_type !== lastCondition.condition) {
				$( ".WeatherCondition" ).text(condition_type);
				lastCondition.condition = condition_type;
			}
			if (json.current.temp !== lastCondition.current) {
				$( ".CurrentTemp" ).text(Math.round(json.current.temp) + unitsSymbol);
				lastCondition.current = json.current.temp;
			}
			if (Date.now() > (midday + 43200000) || lastCondition.min === ""){
				/*
				The "midday" value indicates the current day's midday time in epoch, obtained with the function GetMidday().
				We compare this value and the current time to check if a day has passed.
				Here, we also check the nextMin boolean and change the values acordingly.
				*/
				if (nextMin == "on"){
					tempMin = json.daily[1].temp.min;
				}
				else{
					tempMin = json.daily[0].temp.min;
				}
				tempMax = json.daily[0].temp.max;
				
				if (minMaxText == "on"){
					$( ".MinTemp" ).text("Min "+Math.round(tempMin) + unitsSymbol);
					$( ".MaxTemp" ).text("Max "+Math.round(tempMax) + unitsSymbol);
				}
				else{
					$( ".MinTemp" ).text(Math.round(tempMin) + unitsSymbol);
					$( ".MaxTemp" ).text(Math.round(tempMax) + unitsSymbol);					
				}
				lastCondition.min = tempMin;
				lastCondition.max = tempMax;
				midday = GetMidday();
			}
		})
		.always(function() {
				setTimeout(CurrentData, 5*60000);
		});
	}
	
	PlaceData();
});
