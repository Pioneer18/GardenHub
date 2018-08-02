$(document).ready(function () {
    console.log("ready!");

var lat = 28.53;
var long = -81.37;

var queryURL = "https://rest.soilgrids.org/query?lon=" + long + "&lat=" + lat;

 //AJAX method 
 $.ajax({
    url: queryURL,
    method: "GET"
    //promise event
}).then(function (response) {
    console.log(response);
})


// GOOGLE MAPS API
var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=AIzaSyD2LArc3HQsicIEJKTcAH0wIDKXJtq9Fg0";
    
    
    
    
// Performing  AJAX GET request
$.ajax({
   url: queryURL,
   method: "GET"
 }).then(function(response) {
   console.log(response);
 });



});