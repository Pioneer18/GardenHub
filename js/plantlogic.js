$(document).ready(function () {
    console.log("ready!");

    var lat;
    var long;
    var pH;
    var sand;
    var silt;
    var clay;
    var soilType = "";
    var count;
    var finalMatches = [];
    var matches = {
        pH: [],
        texture: [],
        latitude: [],
    }


    //function for Google Maps API
    function googleMaps() {
        // GOOGLE MAPS API
        var street = "7700 E Bayaud Ave";
        var city = "denver";
        var state = "colorado";

        var mapQueryURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + street + "," + city + "," + state + "&key=AIzaSyD2LArc3HQsicIEJKTcAH0wIDKXJtq9Fg0";


        // Performing  AJAX GET request
        $.ajax({
            url: mapQueryURL,
            method: "GET"
        }).then(function (response) {
            lat = (response.results[0].geometry.location.lat);
            long = (response.results[0].geometry.location.lng);
            console.log(lat);
            console.log(long);
            //call soil API function
            restSoil();
        })
    }

    //call google Maps function
    googleMaps();

    //function for Soil API
    function restSoil() {
        //Soil API
        var soilQueryURL = "https://rest.soilgrids.org/query?lon=" + long + "&lat=" + lat;

        //AJAX method 
        $.ajax({
            url: soilQueryURL,
            method: "GET"
            //promise event
        }).then(function (response) {
            console.log(response);
            //storing soil data in variables
            var pull = response.properties;
            pH = pull.PHIHOX.M.sl1;
            pH = pH / 10;
            sand = pull.SNDPPT.M.sl1;
            silt = pull.SLTPPT.M.sl1;
            clay = pull.CLYPPT.M.sl1;
            //console log the variables
            console.log("pH: " + pH);
            console.log("latitude: " + lat);
            console.log("sand: " + sand);
            console.log("silt: " + silt);
            console.log("clay: " + clay);
            checkSoil();
            //Depending on user input, run the functions with 'vegetables' or 'fruits'
            // checkPlants(vegetables);
            // finalPlants(vegetables);
            checkPlants(fruits);
            finalPlants(fruits);
        })
    }

    //function to check which plants match the user soil
    function checkPlants(plantArray) {
        //check if soil pH falls in each plant pH range
        for (i = 0; i < plantArray.length; i++) {
            if (pH >= plantArray[i].pH[0] && pH <= plantArray[i].pH[1]) {
                matches.pH.push(plantArray[i].type);
            }
            //check if user latitude falls in each plant latitude range
            if (lat >= plantArray[i].latitude[0] && lat <= plantArray[i].latitude[1]) {
                matches.latitude.push(plantArray[i].type);
            }
            //check if user soil type matches plant soil type
            for (j = 0; j < plantArray[i].texture.length; j++) {
                if (soilType === plantArray[i].texture[j]) {
                    matches.texture.push(plantArray[i].type);
                }
            }
        }
        console.log("pH matches: " + matches.pH);
        console.log("latitude matches: " + matches.latitude);
        console.log("soil texture matches: " + matches.texture);
    }

    //function to determine the soil type at location
    function checkSoil() {
        //determine if soil type is loam
        var loamSand = 40 - sand;
        parseInt(loamSand);
        console.log(loamSand);
        var loamSilt = 40 - silt;
        parseInt(loamSilt);
        var loamClay = 20 - clay;
        parseInt(loamClay);
        if ((loamSand >= -10 && loamSand <= 10) && (loamSilt >= -10 && loamSilt <= 10) && (loamClay >= -10 && loamClay <= 10)){
            soilType = "loam";
        }
        else {
            parseInt(sand);
            parseInt(silt);
            parseInt(clay);
            var high = Math.max(sand, silt, clay);
            console.log("high = " + high);
            //determine if soil type is sandy, silt, or clay
            if (high = sand) {
                soilType = "sandy"
            }
            else if (high = silt) {
                soilType = "silt"
            }
            else if (high = clay) {
                soilType = "clay"
            }
        }
        console.log("Soil type: " + soilType)
    }
    //function to determine the final plants array. Checks which plants meet 2 out of 3 requirements
    function finalPlants(plantArray) {
        for (i = 0; i < plantArray.length; i++) {
            for (j = 0; j < matches.pH.length; j++) {
                if (plantArray[i].type === matches.pH[j]) {
                    count++
                }
            }
            for (k = 0; k < matches.texture.length; k++) {
                if (plantArray[i].type === matches.texture[k]) {
                    count++
                }
            }
            for (l = 0; l < matches.latitude.length; l++) {
                if (plantArray[i].type === matches.latitude[l]) {
                    count++
                }
            }
            if (count >= 2) {
                finalMatches.push(plantArray[i].type);
                count = 0;
            }
            else { count = 0; }
        }
        console.log("final matches: " + finalMatches);
    }


    //veg JSON Object
    var vegetables = [{
        type: "tomato",
        pH: [5.5, 7.5],
        texture: ["sandy", "loam"],
        latitude: [25, 40]
    },
    {
        type: "cucumber",
        pH: [5.5, 7.0],
        texture: ["sandy", "loam"],
        latitude: [25, 40]
    },
    {
        type: "lettuce",
        pH: [6.0, 7.0],
        texture: ["sandy", "loam"],
        latitude: [25, 45]
    },
    {
        type: "kale",
        pH: [6.0, 7.5],
        texture: "loam",
        latitude: [25, 35]
    },
    {
        type: "okra",
        pH: [6.0, 7.0],
        texture: ["sandy", "loam"],
        latitude: [25, 40]
    },
    {
        type: "potato",
        pH: [6.0, 6.5],
        texture: "loam",
        latitude: [25, 45]
    },
    {
        type: "squash",
        pH: [5.5, 6.8],
        texture: ["clay", "sandy"],
        latitude: [25, 45]
    },
    {
        type: "asparagus",
        pH: [6.5, 7.0],
        texture: "loam",
        latitude: [25, 45]
    },
    {
        type: "carrot",
        pH: [5.5, 7.5],
        texture: ["sandy", "loam", "silt"],
        latitude: [30, 45]
    }]
    //fruits JSON object
    var fruits = [{
        type: "watermelon",
        pH: [6.0, 6.8],
        texture: ["sandy", "loam"],
        latitude: [25, 45],
    },
    {
        type: "strawberry",
        pH: [5.5, 6.5],
        texture: "sandy",
        latitude: [25, 45]
    },
    {
        type: "pineapple",
        pH: [4.5, 6.5],
        texture: ["sandy", "loam", "clay"],
        latitude: [25, 30]
    },
    {
        type: "blackberry",
        pH: [5.5, 7.0],
        texture: ["sandy", "loam"],
        latitude: [25, 45]
    },
    {
        type: "orange",
        pH: [6.0, 7.5],
        texture: "loam",
        latitude: [25, 30]
    },
    {
        type: "pear",
        pH: [6.0, 6.5],
        texture: ["sandy", "loam"],
        latitude: [25, 45]
    },
    {
        type: "cherry",
        pH: [6.0, 6.5],
        texture: ["silt", "clay", "sandy", "loam"],
        latitude: [30, 45]
    },
    {
        type: "plum",
        pH: [5.5, 6.5],
        texture: ["sandy", "clay", "loam"],
        latitude: [30, 45]
    },
    {
        type: "fig",
        pH: [6.0, 6.5],
        texture: ["sandy", "loam", "clay"],
        latitude: [25, 35]
    }]


});