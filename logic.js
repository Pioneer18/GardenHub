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
});