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
    var allDaPlants = []; //if user does not select veggies or fruits. we give em both
     
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

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //--------(STEP #4 define the googleMaps function that calls the googleMaps api ajax and passes the returned lat and lon to the soilGrids api Ajax call)--------
    //google api call that will pass bind the above lat and lon and pass it to the soil api
    
    var Lat;  //the latitude that will be bound to the google api  
    var Lon; //the longitude that will be bound to the google api response

    function googleMaps() {
        // var googleLat;  //the latitude that will be bound to the google api  
        // var googleLon; //the longitude that will be bound to the google api response
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
            console.log("the google response");
            console.log(response);
            Lat = (response.results[0].geometry.location.lat);//binds the google lat to the googleLat
            Lon = (response.results[0].geometry.location.lng);//binds the google lat to the googleLon
            //call soil API function
            restSoil();//when the googleMaps function is called passes it values to to the soil api
        })
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //--------(STEP #5 define the restSoil() to call the soilGrids api Ajax; it has lat and lon paramaters to accept from google or the instant geolocation)-------
    //function for Soil API
    function restSoil() {
        //Soil API
        var soilQueryURL = "https://rest.soilgrids.org/query?&lon=" + Lon + "&lat=" + Lat + "&attributes=BLDFIE,CLYPPT,SLTPPT,SNDPPT,CRFVOL,CECSOL,PHIHOX"; 
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

            pH = pull.PHIHOX.M.sl1;  //grabs the soil ph
            pH = pH / 10;  //pushes the decimal on returned ph value to the left (e.g. 55 becomes 5.5)
            //Write soil pH to HTML 
            $("#soilpH").html(pH);
            sand = pull.SNDPPT.M.sl1;  //pulls the sand percentage of the soil
            silt = pull.SLTPPT.M.sl1;  //pulls the silt percentage of the soil
            clay = pull.CLYPPT.M.sl1;  //pulls the clay percentage of the soil
            //Write soil makeup to HTML 
            $("#soilMakeup").append("<li>" + "Sand: " + sand + "%</li>"); //appending the sand percentage to the html
            $("#soilMakeup").append("<li>" + "Silt: " + silt + "%</li>"); //appending the silt percentage to the html
            $("#soilMakeup").append("<li>" + "Clay: " + clay + "%</li>"); //appending the clay percentage to the html
            //console log the variables to check the data
            console.log("pH: " + pH);
            console.log("latitude: " + Lat);
            console.log("sand: " + sand);
            console.log("silt: " + silt);
            console.log("clay: " + clay);
            checkSoil();

            //Depending on user input, run the functions with 'vegetables' or 'fruits'
            // checkPlants(vegetables);
            // finalPlants(vegetables);
            //decide to use veggie objects or plant objects
            if(plantType === "fruits"){ //if user selected fruits
                checkPlants(fruits);
                finalPlants(fruits);
                console.log("finalPlants(fruits)");
            }
            else if(plantType === "veggies"){// if they selected veggies
                checkPlants(vegetables);
                finalPlants(vegetables);
                console.log("finalplant - veggeis");
            }
            else if(plantType === "nope") { // lets do both? can we do that...lets see
                //we would have to glue the two arrays together..i think
                allDaPlants =  vegetables.concat(fruits); //combine both arrays and put it in allDaPlants array
                console.log("this is allDaPlants " + allDaPlants);
                checkPlants(allDaPlants);
                finalPlants(allDaPlants);
            }
        })
    }//end of the soilGrids Ajax call

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //--------(STEP #7 define user's inputed address submit button to call the soilGrids api with a specfied adress)-----------------------------------------------

    //the address submit button
    $("#enter").click(function (event) {
        event.preventDefault();
        //clear the results in the html before we add more
        finalMatches = [];
        recMatches = [];
        $("#soilMakeup").text("");
        $("#soilpH").text("");
        $("#recPlants").text("");
        $("#idealPlants").text("");
        //call the google maps which will also call the soil api, ultimately adding results to the html (agian)
        googleMaps();
        matches = {
            pH: [],
            texture: [],
            latitude: [],
        };
    });

    var plantType = "nope"; //declare plant type globally so it can be used outside the onclick - think this is neccessary
    $(".form-check-input").on("click", function (event){
        //event.preventDefault(); //not needed because this is not a sumbit type button
        temp = event.target;
        plantType = $(temp).attr("data-type");
        console.log(plantType);
    })


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //function to check which plants match the user soil
    function checkPlants(plantArray) {
        //check if soil pH falls in each plant pH range
        for (i = 0; i < plantArray.length; i++) {
            if (pH >= plantArray[i].pH[0] && pH <= plantArray[i].pH[1]) {
                matches.pH.push(plantArray[i].type);
            }
            //check if user latitude falls in each plant latitude range
            if (Lat >= plantArray[i].latitude[0] && Lat <= plantArray[i].latitude[1]) {
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
        console.log("if <= 5 sand match loam levels " + loamSand);
        var loamSilt = 40 - silt;
        parseInt( loamSilt);
        console.log(" if <= 5 silt match loam levels " + loamSilt);
        var loamClay = 20 - clay;
        parseInt(loamClay);
        console.log("if <= 5 clay match loam levels " + loamClay);
        if ((loamSand >= -10 && loamSand <= 10) && (loamSilt >= -10 && loamSilt <= 10) && (loamClay >= -10 && loamClay <= 10)) {
            soilType = "loam";
            console.log(soilType);
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
        //this is if there was no ideal match, display that their soil is not ideal for our plants
        if(finalMatches.length < 1){
            $("#idealPlants").append("Sorry, our algorithm did not find any ideal plant matches for your soil.")
        }
        console.log("recommended: " + recMatches);
        console.log("final matches: " + finalMatches);
        console.log(finalMatches[0]);
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