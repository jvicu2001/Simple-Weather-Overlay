var lastCondition = {
	icon: "",
	condition: "",
	current: "",
	min: "",
	max: ""
};

// Coordinates obtained from geolocation
var placeCoordinates = {
	lat: "",
	lon: ""
}
$(document).ready(function(){
	// Get parameters from URL
	var parameters = new URL(window.location.href).searchParams;

	// Get API key from parameters
	var API_key = parameters.get("api_key");

	// Get theme from parameters
	if (parameters.get("theme") === "on"){
		$(".WeatherInfo").addClass("Dark");
	}
	else {
		$(".WeatherInfo").addClass("Light");
	}

	// Get place from parameters
	var place = "";
	if (parameters.get("country")) {
		place = parameters.get("city") + "," + parameters.get("country").toLowerCase();
	}
	else {
		place = parameters.get("city");
	}

	// Get temperature units from parameters
	var units = parameters.get("units");
	var unitsSymbol = "K";
	if (units === "metric") {
		unitsSymbol = "°C";
	}
	else if (units === "imperial") {
		unitsSymbol = "°F";
	}
	// Get language from parameters
	var lang = parameters.get("lang");

	// Check if the place name should be shown
	var showPlace = parameters.get("show-place");

	// check if the full weather description or the simple one should be shown
	var fullDescription = parameters.get("full-description");

	// Check if the "min-max" text should be shown
	var minMaxText = parameters.get("min-max_text");

	// Check if we should show the next day's min temperature
	var nextMin = parameters.get("next-min");
	
	var tempMin;
	var tempMax;

	// Get the time of today's noon
	var midday = GetMidday();

	// If coordinates are used, get them from parameters
	if (parameters.get("lat")){
		placeCoordinates.lat = parameters.get("lat");
		placeCoordinates.lon = parameters.get("lon");
	}
		
	// Get and display the location's data
	function PlaceData() {
		let params = {};

		// If coordinates were provided, get the weather data using them
		// Otherwise, use the place name
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
		$.ajax({	// Get weather data from OpenWeather API. this is used only to get the place's name
			url: "https://api.openweathermap.org/data/2.5/weather",
			data: params,
			type: "GET",
			dataType: "json"
		})
		.done(function( json ) {	// If the request was successful
			// Get the coordinates of the place
			placeCoordinates = json.coord;
			if (showPlace === "on") { // If the place name should be shown, display it
				$("#PlaceName").text(json.name);
			}
			CurrentData();	// Get the rest of the weather data

		})
		.fail(function( jqXHR ) {	// If the request failed, disolay the error and possible solutions
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
	
	function GetMidday(){	// Get the time of today's noon
		let timeValue =  new Date;	// Get the current time
		timeValue.setHours(12,0,0,0);	// Set the time to noon
		return timeValue.getTime();	// Return today's noon time
	}
	
	function CurrentData() {	// Get and display the current weather data
		$.ajax({	// Get weather data from OpenWeather API
			url: "https://api.openweathermap.org/data/2.5/onecall",	// TODO: update to v3.0
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
		.done(function( json ) {	// If the request was successful
			let condition_type = "";
			if (fullDescription === "on") {	// If the full weather description should be shown, display it
				condition_type = json.current.weather[0].description;
			}
			else {	// else, display the simple description
				condition_type = json.current.weather[0].main;
			}
			if (json.current.weather[0].icon !== lastCondition.icon) { 		// If the icon has changed, update it
				$( "#icon" ).attr( "src", "https://openweathermap.org/img/wn/" + json.current.weather[0].icon + "@2x.png" );
				lastCondition.icon = json.current.weather[0].icon;
			}
			if (condition_type !== lastCondition.condition) {	// If the weather condition has changed, update it
				$( ".WeatherCondition" ).text(condition_type);
				lastCondition.condition = condition_type;
			}
			if (json.current.temp !== lastCondition.current) {	// If the current temperature has changed, update it
				$( ".CurrentTemp" ).text(Math.round(json.current.temp) + unitsSymbol);
				lastCondition.current = json.current.temp;
			}
			if (Date.now() > (midday + 43200000) || lastCondition.min === ""){	// If a day has passed, update the min and max temperatures
				/*
				The "midday" value indicates the current day's midday time in epoch, obtained with the function GetMidday().
				We compare this value and the current time to check if a day has passed.
				Here, we also check the nextMin boolean and change the values acordingly.
				*/
				if (nextMin == "on"){	// If the next day's min temperature should be shown, show it instead of today's
					tempMin = json.daily[1].temp.min;
				}
				else{
					tempMin = json.daily[0].temp.min;
				}
				tempMax = json.daily[0].temp.max;	// Update the max temperature
				
				if (minMaxText == "on"){	// If the "min" and "max" text should be shown, show it
					$( ".MinTemp" ).text("Min "+Math.round(tempMin) + unitsSymbol);
					$( ".MaxTemp" ).text("Max "+Math.round(tempMax) + unitsSymbol);
				}
				else{	// Else, show only the temperature values
					$( ".MinTemp" ).text(Math.round(tempMin) + unitsSymbol);
					$( ".MaxTemp" ).text(Math.round(tempMax) + unitsSymbol);					
				}
				lastCondition.min = tempMin;	// Update the lastCondition's min temperature
				lastCondition.max = tempMax;	// Update the lastCondition's max temperature
				midday = GetMidday(); 	// Update the midday value
			}
		})
		.always(function() {	// After the request is done, set a timeout to call this function again 
				setTimeout(CurrentData, 5*60000);
		});
	}
	
	PlaceData(); 	// Get the place data
});
