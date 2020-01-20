var lastCondition = {
	icon: "",
	condition: "",
	current: "",
	min: "",
	max: ""
};
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
		
	
	function CurrentData() {
		$.ajax({
			url: "http://api.openweathermap.org/data/2.5/weather",
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
			var condition_type = "";
			if (fullDescription === "on") {
				condition_type = json.weather[0].description;
			}
			else {
				condition_type = json.weather[0].main;
			}
			if (json.weather[0].icon !== lastCondition.icon) {
				$( "#icon" ).attr( "src", "http://openweathermap.org/img/wn/" + json.weather[0].icon + "@2x.png" );
				lastCondition.icon = json.weather[0].icon;
			}
			if (condition_type !== lastCondition.condition) {
				$( ".WeatherCondition" ).text(condition_type);
				lastCondition.condition = condition_type;
			}
			if (json.main.temp !== lastCondition.current) {
				$( ".CurrentTemp" ).text(Math.round(json.main.temp) + unitsSymbol);
				lastCondition.current = json.main.temp;
			}
			if (showPlace === "on") {
				$("#PlaceName").text(json.name);
			}

		})
		.fail(function( json ) {
			console.log(json.message);
			$( ".CurrentTemp" ).text("City not found.");
		})
		.always(function() {
				setTimeout(CurrentData, 5*60000);
		});
	}
	function DailyData() {
		$.ajax({
			url: "http://api.openweathermap.org/data/2.5/forecast",
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

			var allMin = [];
			var allMax = [];
			/* var allMin = json.list.slice(0, 7).map(function(i){return parseFloat(i.main.temp_min);});
			var allMax = json.list.slice(0, 7).map(function(i){return parseFloat(i.main.temp_min);}); */
			for (i = 0; i < 8; i++) {
				allMin.push(json.list[i].main.temp_min);
				allMax.push(json.list[i].main.temp_max);
			}
			var temp_min = Math.min(...allMin);
			var temp_max = Math.max(...allMax);
			if (temp_min !== lastCondition.min) {
				$( ".MinTemp" ).html("Min " + Math.round(temp_min) + unitsSymbol);
				lastCondition.min = temp_min;
			}
			if (temp_max !== lastCondition.max) {
				$( ".MaxTemp" ).html("Max " + Math.round(temp_max) + unitsSymbol);
				lastCondition.max = temp_max;
			}

			
		})
		.always(function() {
				setTimeout(CurrentData, 86400000); //Check everyday (Why would you stream for more than a day?)
		});
	}
	CurrentData();
	DailyData();
});