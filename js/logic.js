$(document).ready(function () {
    console.log("ready!");
//declaring values to be used for compatablie plant logic, used in the ajax promise
    var lat;
    var long;
    var pH;
    var sand;
    var silt;
    var clay;
    var soilType = "";
    var count;
    var finalVegMatches = [];
    var vegMatches = {
        pH: [],
        texture: [],
        latitude: [],
    }


    //function for Google Maps API
    //google api call that will pass bind the above lat and lon and pass it to the soil api
    function googleMaps() {
        // GOOGLE MAPS API
        var street = "4000 Central Florida Blvd";
        var city = "Orlando";
        var state = "florida";

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
///////////////////////////////////////////////////////////////////////////////////////////////////
//-----------------------(all the compatablie veggie logic happesn from here on, this is where the bulk of our app logic is)----------------------------
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
            checkVegetables();
            finalVegArray();
        })
    }

    //function to check which vegetables match the user soil
    function checkVegetables() {
        //check if soil pH falls in each veg pH range
        for (i = 0; i < vegetables.length; i++) {
            if (pH >= vegetables[i].pH[0] && pH <= vegetables[i].pH[1]) {
                vegMatches.pH.push(vegetables[i].type);
            }
            //check if user latitude falls in each veg latitude range
            if (lat >= vegetables[i].latitude[0] && lat <= vegetables[i].latitude[1]) {
                vegMatches.latitude.push(vegetables[i].type);
            }
            //check if user soil type matches veg soil type
            for (j = 0; j < vegetables[i].texture.length; j++) {
                if (soilType === vegetables[i].texture[j]) {
                    vegMatches.texture.push(vegetables[i].type);
                }
            }
        }
        console.log("pH veg matches: " + vegMatches.pH);
        console.log("latitude veg matches: " + vegMatches.latitude);
        console.log("soil texture veg matches: " + vegMatches.texture);
    }

    //function to determine the soil type at location
    function checkSoil() {
        //determine if soil type is loam
        var loamSand = 40 - sand;
        var loamSilt = 40 - silt;
        var loamClay = 20 - clay;
        if ((loamSand > 0 && loamSand <= 5) && (loamSilt > 0 && loamSilt <= 5) && (loamClay > 0 && loamClay <= 5)) {
            soilType = "loam";
        }
        else {
            parseInt(sand);
            parseInt(silt);
            parseInt(clay);
            var high = Math.max(sand, silt, clay);
            console.log("high = " + high);
        }
        //determin if soil type is sandy, silt, or clay
        if (high = sand) {
            soilType = "sandy"
        }
        else if (high = silt) {
            soilType = "silt"
        }
        else if (high = clay) {
            soilType = "clay"
        }
        console.log("Soil type: " + soilType)
    }
    //function to determine the final veg array. Checks if veg meets 2 out of 3 requirements
    function finalVegArray() {
        for (i = 0; i < vegetables.length; i++) {
            for (j = 0; j < vegMatches.pH.length; j++) {
                if (vegetables[i].type === vegMatches.pH[j]) {
                    count++
                }
            }
            for (k = 0; k < vegMatches.texture.length; k++) {
                if (vegetables[i].type === vegMatches.texture[k]) {
                    count++
                }
            }
            for (l = 0; l < vegMatches.latitude.length; l++) {
                if (vegetables[i].type === vegMatches.latitude[l]) {
                    count++
                }
            }
            if (count >= 2) {
                finalVegMatches.push(vegetables[i].type);
                count = 0;
            }
            else {count = 0;}
        }
        console.log("final veggies: " + finalVegMatches);
    }


    //Plant JSON Object
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