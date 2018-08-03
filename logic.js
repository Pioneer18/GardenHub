$(document).ready(function () {
    console.log("ready!");

var lat = 28.53;
var long = -81.37;

var soilQueryURL = "https://rest.soilgrids.org/query?lon=" + long + "&lat=" + lat;

 //AJAX method 
 $.ajax({
    url: soilQueryURL,
    method: "GET"
    //promise event
}).then(function (response) {
    console.log(response);
})


// GOOGLE MAPS API
var street = "4000 Central Florida Blvd";
var city = "Orlando";
var state = "florida";

var mapQueryURL = "https://maps.googleapis.com/maps/api/geocode/json?address="+ street + "," + city + "," + state + "&key=AIzaSyD2LArc3HQsicIEJKTcAH0wIDKXJtq9Fg0";
    

// Performing  AJAX GET request
$.ajax({
   url: mapQueryURL,
   method: "GET"
 }).then(function(response) {
   console.log(response);
 });



});