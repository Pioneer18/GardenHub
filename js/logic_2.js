$(document).ready(function () {
    console.log("ready!");
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //--------(STEP #1 Declare all the global variables)-----------------------------------------------------------------------------------------------------------
    //declaring values to be used for compatablie plant logic, used in the ajax promiset
    var pH;
    var sand;
    var silt;
    var clay;
    var soilType = "";
    var count;
    var finalMatches = [];
    var recMatches = [];
    var matches = {
        pH: [],
        texture: [],
        latitude: [],
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //--------(STEP #2 grab users input of how they will be planting; seed or transplant, so we know what soild depth value to pull from the soilGrids api)--------
    //the user will select a radio button inside of a div of id #soil_level
    //the below click() captures the users button selection and its data-type attribute; seed or plant
    $("#soil_level").on("click", function (event) {
        console.log("hello?");
        //bind the variable soil_level to the selected inputs data-type attr(seed or plant)
        var soil_level = $(event.target).attr("data-type");
        console.log(soil_level);
    });

    var depth;
    if (soil_level === "seed") { //then pass a var depth of sl1 to the query's depth argument
        depth = "sl1";
        console.log(depth);
    }
    else {//then pass sl4 to the query's depth argument
        depth = "sl4"
        console.log(depth);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //--------(STEP #4 define the googleMaps function that calls the googleMaps api ajax and passes the returned lat and lon to the soilGrids api Ajax call)--------
    //google api call that will pass bind the above lat and lon and pass it to the soil api
    function googleMaps() {
        var googleLat;  //the latitude that will be bound to the google api response
        var googleLon; //the longitude that will be bound to the google api response
        var street = $("#street_input").val();  //grabs the street for the goolge ajax
        console.log(street);
        var city = $("#inputCity").val(); //grabs the city for the google ajax
        console.log(city);
        var state = $("#inputState").val(); //grabs the state for the google ajax
        console.log(state);
        // GOOGLE MAPS API
        var mapQueryURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + street + "," + city + "," + state + "&key=AIzaSyD2LArc3HQsicIEJKTcAH0wIDKXJtq9Fg0";
        // Performing  AJAX GET request
        $.ajax({
            url: mapQueryURL,
            method: "GET"
        }).then(function (response) {
            console.log(response);
            googleLat = (response.results[0].geometry.location.lat);//binds the google lat to the googleLat
            googlegLon = (response.results[0].geometry.location.lng);//binds the google lat to the googleLon
            //call soil API function
            restSoil(googleLat, googleLon);//when the googleMaps function is called passes it values to to the soil api
        })
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //--------(STEP #5 define the restSoil() to call the soilGrids api Ajax; it has lat and lon paramaters to accept from google or the instant geolocation)-------
    //function for Soil API
    function restSoil(lat, long) {
        //Soil API
        var soilQueryURL = "https://rest.soilgrids.org/query?lon=" + long + "&lat=" + lat + "&attributes=BLDFIE,CLYPPT,SLTPPT,SNDPPT,CRFVOL,CECSOL,PHIHOX" + "&depths=" + depth; //NOTE: !! need to add the arguments and depth to the end of the call still
        //AJAX method 
        $.ajax({
            url: soilQueryURL,
            method: "GET"
            //promise event
        }).then(function (response) { //this is the promise that holds the core logic that determines what grows in this location

            //---------------------(this pull the values out of the object)----------------------------

            console.log(response);
            //storing soil data in variables
            var pull = response.properties;  //shortens the commands to grab variables from the response object

            //NOTE: all the pulls end with depth, this is so we get the value at the same depth that the user specified (either sl1 or sl4 for now; see lines 39-47)

            pH = pull.PHIHOX.M.depth;  //grabs the soil ph
            pH = pH / 10;  //pushes the decimal on returned ph value to the left (e.g. 55 becomes 5.5)
            //Write soil pH to HTML 
            $("#soilpH").html(pH);
            sand = pull.SNDPPT.M.depth;  //pulls the sand percentage of the soil
            silt = pull.SLTPPT.M.depth;  //pulls the silt percentage of the soil
            clay = pull.CLYPPT.M.depth;  //pulls the clay percentage of the soil
            //Write soil makeup to HTML 
            $("#soilMakeup").append("<li>" + "Sand: " + sand + "%</li>");
            $("#soilMakeup").append("<li>" + "Silt: " + silt + "%</li>");
            $("#soilMakeup").append("<li>" + "Clay: " + clay + "%</li>");
            //console log the variables to check the data
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
    }//end of the soilGrids Ajax call

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //--------(STEP #7 define user's inputed address submit button to call the soilGrids api with a specfied adress)-----------------------------------------------

    //the address submit button
    $("#enter").click(function (event) {
        depth = "sl1";
        googleMaps();
        //gotta prevent the form from reloading the page
        event.preventDefault(); //this works, no problem
        //when this button is clicked the googleMaps() is called which calls the soil api with the google lat and lon
        //if(depth === "sl1" || depth === "sl4"){
        // googleMaps();
        //}else{
        // $("#error_box").html("please select seed or plant transplant so we can give you the correct info!");
        //console.log("didn't select depth");
        // }
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


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
    //function to determine the final plants array. 
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
            //Checks which plants meet 2 out of 3 requirements 
            if (count >= 2) {
                $("#recPlants").append("<li>" + plantArray[i].type + "</li>")
                recMatches.push(plantArray[i].type);
            }
            //Checks which plants meet 3 out of 3 requirements 
            if (count === 3) {

                $("#idealPlants").append("<li>" + plantArray[i].type + "</li>")
                finalMatches.push(plantArray[i].type);
                count = 0;
            }
            else { count = 0; }
            count = 0;
        }
        console.log("recommended: " + recMatches);
        console.log("final matches: " + finalMatches);
    }

    //vegetable objects

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

    //fruits Objects

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