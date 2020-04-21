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
	if (parameters.get("country") !== "") {
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
	var midday = 0;
		
	
	function PlaceData() {
		$.ajax({
			url: "https://api.openweathermap.org/data/2.5/weather",
			data: {
				"q": place,
				"APPID": API_key,
				"units": units,
				"lang": lang
			},
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
		.fail(function( json ) {
			console.log("city not found");
			$( ".CurrentTemp" ).text("City not found.");
		});
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
			var condition_type = "";
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
			if (json.daily[0].dt > (midday + 43200) || lastCondition.min === ""){
				/*
				The "dt" value indicates the current day's midday time in epoch, and it (should) change when the day passes.
				Because of this, we determine when to get the next day's data when the "dt" value changes at least by 12 hours,
				or if there was no previous data.
				*/
				if (minMaxText == "on"){
					$( ".MinTemp" ).text("Min "+Math.round(json.daily[0].temp.min) + unitsSymbol);
					$( ".MaxTemp" ).text("Max "+Math.round(json.daily[0].temp.max) + unitsSymbol);
				}
				else{
					$( ".MinTemp" ).text(Math.round(json.daily[0].temp.min) + unitsSymbol);
					$( ".MaxTemp" ).text(Math.round(json.daily[0].temp.max) + unitsSymbol);					
				}
				lastCondition.min = json.daily[0].temp.min;
				lastCondition.max = json.daily[0].temp.max;
			}
		})
		.always(function() {
				setTimeout(CurrentData, 5*60000);
		});
	}
	
	PlaceData();
});
