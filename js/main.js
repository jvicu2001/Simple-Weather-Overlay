$(document).ready( function() {
	$.ajax({
		url: "https://gist.githubusercontent.com/ssskip/5a94bfcd2835bf1dea52/raw/aeed5b0cb3a7eda19e614915c3d88ce113e4a914/ISO3166-1.alpha2.json",
		type: "GET",
		dataType: "json"
	})
	.done(function( json ){
		for ( var country in json ) {
			$("#country-list").append($("<option value=" + country + ">" + json[country] + "</option>"));
		}
	});
	$.ajax({
		url: "https://gist.githubusercontent.com/jvicu2001/666fc491228453a8f1981167bb6c8912/raw/24b3e3155a0b9f398b629c7f907f2cbc52d36766/openweather_languages.json",
		type: "GET",
		dataType: "json"
	})
	.done(function( json ){
		for ( var language in json ) {
			$("#language-list").append($("<option value=" + language + ">" + json[language] + "</option>"));
		}
	});
} );
function makeURL() {
	var params = $( "form" ).serialize();
	$( "#preview-iframe" ).attr( "src", window.location.origin + "/weather.html?" + params );
	$( "#result-url" ).text( window.location.origin + "/weather.html?" + params );
}
function previewSize() {
	$( "#preview-width ").text($( "#preview" ).width());
	$( "#preview-height ").text($( "#preview" ).height());
}