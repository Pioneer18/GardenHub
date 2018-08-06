$(document).ready(function () {
    console.log("ready!");

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyAmEw_VKQgJvGQLxvT1BbFkm6HbiZ9Qjws",
        authDomain: "garden-hub-d14e1.firebaseapp.com",
        databaseURL: "https://garden-hub-d14e1.firebaseio.com",
        projectId: "garden-hub-d14e1",
        storageBucket: "garden-hub-d14e1.appspot.com",
        messagingSenderId: "363801126348"
    };
    firebase.initializeApp(config);

    var database = firebase.database();


    //declaring values to be used for compatablie plant logic, used in the ajax promise

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
            //-----------------------(all the compatablie veggie logic happens from here on, this is where the bulk of our app logic is)----------------------------

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

    $('.window').windows({
        snapping: true,
        snapSpeed: 500,
        snapInterval: 500,
        onScroll: function (scrollPos) {
            // scrollPos:Number
        },
        onSnapComplete: function ($el) {
            // after window ($el) snaps into place
        },
        onWindowEnter: function ($el) {
            // when new window ($el) enters viewport
        }
    });



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
        if ((loamSand >= -10 && loamSand <= 10) && (loamSilt >= -10 && loamSilt <= 10) && (loamClay >= -10 && loamClay <= 10)) {
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

    var usStates = [
        { name: 'ALABAMA', abbreviation: 'AL' },
        { name: 'ALASKA', abbreviation: 'AK' },
        { name: 'AMERICAN SAMOA', abbreviation: 'AS' },
        { name: 'ARIZONA', abbreviation: 'AZ' },
        { name: 'ARKANSAS', abbreviation: 'AR' },
        { name: 'CALIFORNIA', abbreviation: 'CA' },
        { name: 'COLORADO', abbreviation: 'CO' },
        { name: 'CONNECTICUT', abbreviation: 'CT' },
        { name: 'DELAWARE', abbreviation: 'DE' },
        { name: 'DISTRICT OF COLUMBIA', abbreviation: 'DC' },
        { name: 'FEDERATED STATES OF MICRONESIA', abbreviation: 'FM' },
        { name: 'FLORIDA', abbreviation: 'FL' },
        { name: 'GEORGIA', abbreviation: 'GA' },
        { name: 'GUAM', abbreviation: 'GU' },
        { name: 'HAWAII', abbreviation: 'HI' },
        { name: 'IDAHO', abbreviation: 'ID' },
        { name: 'ILLINOIS', abbreviation: 'IL' },
        { name: 'INDIANA', abbreviation: 'IN' },
        { name: 'IOWA', abbreviation: 'IA' },
        { name: 'KANSAS', abbreviation: 'KS' },
        { name: 'KENTUCKY', abbreviation: 'KY' },
        { name: 'LOUISIANA', abbreviation: 'LA' },
        { name: 'MAINE', abbreviation: 'ME' },
        { name: 'MARSHALL ISLANDS', abbreviation: 'MH' },
        { name: 'MARYLAND', abbreviation: 'MD' },
        { name: 'MASSACHUSETTS', abbreviation: 'MA' },
        { name: 'MICHIGAN', abbreviation: 'MI' },
        { name: 'MINNESOTA', abbreviation: 'MN' },
        { name: 'MISSISSIPPI', abbreviation: 'MS' },
        { name: 'MISSOURI', abbreviation: 'MO' },
        { name: 'MONTANA', abbreviation: 'MT' },
        { name: 'NEBRASKA', abbreviation: 'NE' },
        { name: 'NEVADA', abbreviation: 'NV' },
        { name: 'NEW HAMPSHIRE', abbreviation: 'NH' },
        { name: 'NEW JERSEY', abbreviation: 'NJ' },
        { name: 'NEW MEXICO', abbreviation: 'NM' },
        { name: 'NEW YORK', abbreviation: 'NY' },
        { name: 'NORTH CAROLINA', abbreviation: 'NC' },
        { name: 'NORTH DAKOTA', abbreviation: 'ND' },
        { name: 'NORTHERN MARIANA ISLANDS', abbreviation: 'MP' },
        { name: 'OHIO', abbreviation: 'OH' },
        { name: 'OKLAHOMA', abbreviation: 'OK' },
        { name: 'OREGON', abbreviation: 'OR' },
        { name: 'PALAU', abbreviation: 'PW' },
        { name: 'PENNSYLVANIA', abbreviation: 'PA' },
        { name: 'PUERTO RICO', abbreviation: 'PR' },
        { name: 'RHODE ISLAND', abbreviation: 'RI' },
        { name: 'SOUTH CAROLINA', abbreviation: 'SC' },
        { name: 'SOUTH DAKOTA', abbreviation: 'SD' },
        { name: 'TENNESSEE', abbreviation: 'TN' },
        { name: 'TEXAS', abbreviation: 'TX' },
        { name: 'UTAH', abbreviation: 'UT' },
        { name: 'VERMONT', abbreviation: 'VT' },
        { name: 'VIRGIN ISLANDS', abbreviation: 'VI' },
        { name: 'VIRGINIA', abbreviation: 'VA' },
        { name: 'WASHINGTON', abbreviation: 'WA' },
        { name: 'WEST VIRGINIA', abbreviation: 'WV' },
        { name: 'WISCONSIN', abbreviation: 'WI' },
        { name: 'WYOMING', abbreviation: 'WY' }
    ];
    for (var i = 0; i < usStates.length; i++) {
        var option = document.createElement("option");
        option.text = usStates[i].name;
        option.value = usStates[i].abbreviation;
        inputState.add(option);
    }
});

