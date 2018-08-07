$(document).ready(function () {
    console.log("ready!");
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
    var rockyMatches = [];

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

    var Lat; //the latitude that will be bound to the google api  
    var Lon; //the longitude that will be bound to the google api response

    //--------(STEP #4 define the googleMaps function that calls the googleMaps api ajax and passes the returned lat and lon to the soilGrids api Ajax call)--------
    //google api call that will pass bind the above lat and lon and pass it to the soil api

    var Lat;  //the latitude that will be bound to the google api  
    var Lon; //the longitude that will be bound to the google api response

    function googleMaps() {
        // var googleLat;  //the latitude that will be bound to the google api  
        // var googleLon; //the longitude that will be bound to the google api response
        var street = $("#street_input").val(); //grabs the street for the goolge ajax
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
            Lat = (response.results[0].geometry.location.lat); //binds the google lat to the googleLat
            Lon = (response.results[0].geometry.location.lng); //binds the google lat to the googleLon
            //call soil API function
            restSoil(); //when the googleMaps function is called passes it values to to the soil api
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
            var pull = response.properties; //shortens the commands to grab variables from the response object

            //NOTE: all the pulls end with depth, this is so we get the value at the same depth that the user specified (either sl1 or sl4 for now; see lines 39-47)

            pH = pull.PHIHOX.M.sl1; //grabs the soil ph
            pH = pH / 10; //pushes the decimal on returned ph value to the left (e.g. 55 becomes 5.5)
            //Write soil pH to HTML
            $("#soilpH").html(pH);
            sand = pull.SNDPPT.M.sl1; //pulls the sand percentage of the soil
            silt = pull.SLTPPT.M.sl1; //pulls the silt percentage of the soil
            clay = pull.CLYPPT.M.sl1; //pulls the clay percentage of the soil
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

            if (plantType === "fruits") { //if user selected fruits
                checkPlants(fruits);
                finalPlants(fruits);
                console.log("finalPlants(fruits)");
            }
            else if (plantType === "veggies") {// if they selected veggies
                checkPlants(vegetables);
                finalPlants(vegetables);
                console.log("finalplant - veggeis");
            }
            else if (plantType === "nope") { // lets do both? can we do that...lets see
                //we would have to glue the two arrays together..i think
                allDaPlants = vegetables.concat(fruits); //combine both arrays and put it in allDaPlants array
                console.log("this is allDaPlants " + allDaPlants);
                checkPlants(allDaPlants);
                finalPlants(allDaPlants);
            }
        })
    } //end of the soilGrids Ajax call

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //--------(STEP #7 define user's inputed address submit button to call the soilGrids api with a specfied adress)-----------------------------------------------

    //the address submit button
    $("#enter").click(function (event) {
        event.preventDefault();
        //clear the results in the html before we add more
        finalMatches = [];
        recMatches = [];
        rockyMatches = [];
        $("#soilMakeup").text("");
        $("#soilpH").text("");
        $("#recPlants").text("");
        $("#idealPlants").text("");
        $("#Tips").text("");
        //call the google maps which will also call the soil api, ultimately adding results to the html (agian)
        googleMaps();
        matches = {
            pH: [],
            texture: [],
            latitude: [],
        };
    });

    var plantType = "nope"; //declare plant type globally so it can be used outside the onclick - think this is neccessary
    $(".form-check-input").on("click", function (event) {
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
        parseInt(loamSilt);
        console.log(" if <= 5 silt match loam levels " + loamSilt);
        var loamClay = 20 - clay;
        parseInt(loamClay);
        console.log("if <= 5 clay match loam levels " + loamClay);
        if ((loamSand >= -10 && loamSand <= 10) && (loamSilt >= -10 && loamSilt <= 10) && (loamClay >= -10 && loamClay <= 10)) {
            soilType = "loam";
            console.log(soilType);
        } else {
            parseInt(sand);
            parseInt(silt);
            parseInt(clay);
            var high = Math.max(sand, silt, clay);
            console.log("high = " + high);

            //determine if soil type is sandy, silt, or clay
            if (high = sand) {
                soilType = "sandy"
            } else if (high = silt) {
                soilType = "silt"
            } else if (high = clay) {
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
                rockyMatches.push(plantArray[i])
                count = 0;
            } else {
                count = 0;
            }
            count = 0;
        }
        for (var i = 0; i < rockyMatches.length; i++) {
            $("#Tips").append("<h5>" + rockyMatches[i].type + "<br>" + "</h5>" + "<br>" + rockyMatches[i].tip1 + " " + "<br>" + rockyMatches[i].tip2 + "</p>" + "<br>");

            //this is if there was no ideal match, display that their soil is not ideal for our plants
            if (finalMatches.length < 1) {
                $("#idealPlants").append("Sorry, our algorithm did not find any ideal plant matches for your soil.")

            }

            //create temporary object to store data and push to firebase
            var plantData = {
                recMatches: recMatches,
                finalMatches: finalMatches,
                latitude: Lat,
                longitude: Lon,
            };

            //pushing data to firebase
            database.ref().push(plantData);
            console.log("recommended: " + recMatches);
            console.log("final matches: " + finalMatches);
            console.log(finalMatches[0]);
        }}

        //vegetable objects

        var vegetables = [{
            type: "tomato",
            pH: [5.5, 7.5],
            texture: ["sandy", "loam"],
            latitude: [25, 40],
            tip1: ["Select a site with full sun and well-drained soil. For northern regions, it is VERY important that your site receives at least 6 hours of daily sunlight. For southern regions, light afternoon shade will help tomatoes survive and thrive.If you’re planting seeds (versus transplants), you’ll want to start your seeds indoors 6 to 8 weeks before the average  last spring frost date."],
            tip2: ["Water generously the first few days.Water well throughout the growing season, about 2 inches per week during the summer. Water deeply for a strong root system.Water in the early morning. This gives plant the moisture it needs to make it through a hot day. Avoid watering late afternoon or evening. Mulch five weeks after transplanting to retain moisture and to control weeds. Mulch also keeps soil from splashing the lower tomato leaves."]
        },
        {
            type: "cucumber",
            pH: [5.5, 7.0],
            texture: ["sandy", "loam"],
            latitude: [25, 40],
            tip1: ["Before you plant outside, select a site with full sun.Soil should be neutral or slightly alkaline with a pH of 7.0.Cucumbers require fertile soil. Mix in compost and/or aged manure before planting to a depth of 2 inches and work into the soil 6 to 8 inches deep. Make sure that soil is moist and well-drained, not soggy."],
            tip2: ["The main plant care requirement for cucumbers is water—consistent watering! They need one inch of water per week (more if temperatures are sky high). Put your finger in the soil and when it is dry past the first joint of your finger, it is time to water. Inconsistent watering leads to bitter-tasting fruit.Water slowly in the morning or early afternoon, avoiding the leaves so that you don’t get leaf diseases which will ruin the plant. If possible, water your cucumbers with a soaker hose or drip irrigation to keep the foliage dry. Mulch to hold in soil moisture. Cover seeds with netting or a berry basket if you have pests; this will keep them from digging out the seeds."]
        },
        {
            type: "lettuce",
            pH: [6.0, 7.0],
            texture: ["sandy", "loam"],
            latitude: [25, 45],
            tip1: ["Before you plant your lettuce seeds, make sure the soil is prepared. It should be loose and drain well so it’s moist without staying soggy. To keep the soil fertile, feed it with organic matter about one week before you seed or transplant.Direct sowing is recommended as soon as the ground can be worked. Plant seeds ½ inch deep. Snow won’t hurt them, but a desiccating cold wind will."],
            tip2: ["Fertilize 3 weeks after transplanting. Lettuce prefers soil that is high in humus, with plenty of compost and a steady supply of nitrogen to keep if growing fast. Use organic alfalfa meal or a slow-release fertilizer. To plant a fall crop, create cool soil in August by moistening the ground and covering it with a bale of straw. A week later, the soil under the bale will be about 10°F (6°C) cooler than the rest of the garden. Sow a three-foot row of lettuce seeds every couple of weeks—just rotate the straw bale around the garden."]
        },
        {
            type: "kale",
            pH: [6.0, 7.5],
            texture: "loam",
            latitude: [25, 35],
            tip1: ["You can plant kale at any time, from early spring to early summer. If you plant kale late in the summer, you can harvest it from fall until the ground freezes in winter. Mix 1-½ cups of 5-10-10 fertilizer per 25 feet of row into the top 3 to 4 inches of soil.Plant the seeds ¼ to ½ inch deep into well-drained, light soil.After about 2 weeks, thin the seedlings so that they are spaced 8 to 12 inches apart."],
            tip2: ["Water the plants regularly, but be sure not to overwater them. Mulch the soil heavily after the first hard freeze; the plants may continue to produce leaves throughout the winter."]
        },
        {
            type: "okra",
            pH: [6.0, 7.0],
            texture: ["sandy", "loam"],
            latitude: [25, 40],
            tip1: ["You can start okra seeds indoors in peat pots under full light 3 to 4 weeks before the last spring frost date. You can also start okra directly in your garden 3 to 4 weeks before the last spring frost date as long as you cover the plants with a cold fram or grow tunnel until the weather warms up. Make sure that the covering is 2 to 3 feet tall so that the plants have room to grow. If you do not start your okra plants early, wait until there is stable warm weather. You can plant okra in the garden when the soil has warmed to 65° to 70°F.Plant okra in fertile, well-drained soil in full light about ½ to 1 inch deep and 12 to 18 inches apart. You can soak the seeds overnight in tepid water to help speed up germination. If you are planting okra transplants, be sure to space them 1 to 2 feet apart to give them ample room to grow."],
            tip2: ["When the seedlings are about 3 inches tall, thin the plants so that they are 10 to 18 inches apart.Keep the plants well watered throughout the summer months; 1 inch of water per week is ideal, but use more if you are in a hot, arid region.After the first harvest, remove the lower leaves to help speed up production."]
        },
        {
            type: "potato",
            pH: [6.0, 6.5],
            texture: "loam",
            latitude: [25, 45],
            tip1: ["With a hoe or round-point shovel, dig a trench about 6 inches wide and 8 inches deep, tapering the bottom to about 3 inches wide. Potatoes are best grown in rows. Space rows about 3 feet apart. Spread and mix in rotted manure or organic compost in the bottom of the trench before planting. In the trench, place a seed potato piece, cut side down, every 12 to 14 inches and cover with 3 to 4 inches of soil. The best starters are seed potatoes from which eyes (buds) protrude. (Do not confuse seed potatoes with potato seeds or grocery produce.) Use a clean, sharp paring knife to cut large potatoes into pieces that are roughly the size of a golf ball, making sure that there are at least 2 eyes on each piece. (Potatoes that are smaller than a hen’s egg should be planted whole.)"],
            tip2: ["Do not allow sunlight to fall on the tubers, which develop under the surface of the soil, or they will turn green. Do the hilling in the morning, when plants are at their tallest. During the heat of the day, plants start drooping. Maintain even moisture, especially from the time when sprouts appear until several weeks after they blossom. The plants need 1 to 2 inches of water per week. If you water too much right after planting and not enough as the potatoes begin to form, the tubers can become misshapen."]


        },
        {
            type: "squash",
            pH: [5.5, 6.8],
            texture: ["clay", "sandy"],
            latitude: [25, 45],
            tip1: ["require full sun, warm weather, and good air circulation to mature. Squash grows best in growing zones 3-10. If your growing season is short, choose a bush variety squash which will mature more quickly. Plant squash in humus-rich, well-drained soil; work in organic compost the autumn before planting or spread compost in the growing bed during the growing season. Bush-types varieties can be grown in containers."],
            tip2: ["Squash requires regular and even watering. Keep the soil just moist. Avoid overhead watering. Squash are heavy feeders; apply lots of compost to the soil and they should do well. You can feed squash with compost tea every couple of weeks during the growing season."]
        },
        {
            type: "asparagus",
            pH: [6.5, 7.0],
            texture: "loam",
            latitude: [25, 45],
            tip1: ["The most common way to plant asparagus crowns is in a trench. In the spring, dig a trench about 8-10 in. deep and 18-20 inches wide. Work in your compost or other organic matter at this time. Plants can be started from seed about 4 weeks before the last expected frost. However, seeds will add several years to your wait. Most people find it easier to grow from crowns, which are readily available in the spring. They look like a worn out string mop, but they are very much alive. Unlike many plants, the roots of asparagus crowns can withstand some air exposure and you will usually find them for sale loose. They should still look firm and fresh, not withered or mushy."],
            tip2: ["Asparagus needs regular watering, especially while young.This is when the plants are gaining strength and becoming established. Give them a good start when you first plant them and you'll have fewer problems in future years."]
        },
        {
            type: "carrot",
            pH: [5.5, 7.5],
            texture: ["sandy", "loam", "silt"],
            latitude: [30, 45],
            tip1: ["Plan to plant seeds outdoors 3 to 5 weeks before the last spring frost date. Carrots are slow to germinate. They may take 3 or more weeks to show any signs of life, so don’t panic if your carrots don’t appear right away! Keep the soil moist, not wet, but don’t let it dry out, either. Carrots are best grown in full sunlight, but can tolerate a moderate amount of shade."],
            tip2: ["Gently mulch to retain moisture, speed germination, and block the sun from hitting the roots directly. Once plants are an inch tall, thin so that they stand 3 inches apart. Snip them with scissors instead of pulling them out to prevent damage to the roots of the remaining plants. Water at least one inch per week. Weed diligently. Fertilize with a balanced fertilizer 5-6 weeks after sowing."]
        }
        ]

        //fruits Objects

        var fruits = [{
            type: "watermelon",
            pH: [6.0, 6.8],
            texture: ["sandy", "loam"],
            latitude: [25, 45],
            tip1: ["If you live in warmer climes, you can sow seeds directly outdoors, but wait until the soil temperature warms to at least 70°F to avoid poor germination. Watermelon vines are very tender and should not be transplanted until all danger of frost has passed. (To be safe, wait at least two weeks past your last frost date.) If you are in a cooler zone, start seeds indoors about a month before transplanting.  Amend soil with aged manure, seaweed, and/or compost before planting."],
            tip2: ["Mulching with black plastic will serve multiple purposes: it will warm the soil, hinder weed growth, and keep developing fruits clean.Watering is very important—from planting until fruit begins to form. While melon plants are growing, blooming, and setting fruit, they need 1 to 2 inches of water per week. Keep soil moist, but not waterlogged. Water at the vine’s base in the morning, and try to avoid wetting the leaves and avoid overhead watering. Reduce watering once fruit are growing. Dry weather produces the sweetest melon."]
        },
        {
            type: "strawberry",
            pH: [5.5, 6.5],
            texture: "sandy",
            latitude: [25, 45],
            tip1: ["Plan to plant as soon as the ground can be worked in the Spring. See your local frost dates. Strawberries are sprawling plants. Seedlings will send out runners, or ‘daughter’ plants, which in turn will send out their own runners.Make planting holes deep and wide enough to accommodate the entire root system without bending it. However, don’t plant too deep: The roots should be covered, but the crown should be right at the soil surface."],
            tip2: ["In the first year, pick off blossoms to discourage strawberry plants from fruiting. If not allowed to bear fruit, they will spend their food reserves on developing healthy roots. The yields will be much greater in the second year."]
        },
        {
            type: "pineapple",
            pH: [4.5, 6.5],
            texture: ["sandy", "loam", "clay"],
            latitude: [25, 30],
            tip1: ["When growing pineapple tops, you’ll need to provide at least six hours of bright light. Water your plant as needed, allowing it to dry out some between watering. You can also fertilize the pineapple plant with a soluble houseplant fertilizer once or twice a month during spring and summer."],
            tip2: ["Keep it moist until roots develop. It should take about two months (6-8 weeks) for roots to establish. You can check for rooting by gently pulling the top to see the roots. Once significant root growth has occurred, you can start giving the plant additional light. "]

        },
        {
            type: "blackberry",
            pH: [5.5, 7.0],
            texture: ["sandy", "loam"],
            latitude: [25, 45],
            tip1: ["When planting blackberries find a spot in the yard that has sunshine and good drainage. Also, be sure to avoid areas with heavy clay soil or sandy areas. If you are afraid your soil isn’t up to par for growing blackberry bushes, you should add organic soil matter to improve aeration and facilitate drainage."],
            tip2: ["Water the plants after you put them into the ground. Also, cut the plants back to about 6 inches after you plant them. These new plants will not produce berries the first year. However, they require fertilizer and water. Growing blackberry bushes will start producing the following year if you have cared for the plant as you should."]

        },
        {
            type: "orange",
            pH: [6.0, 7.5],
            texture: "loam",
            latitude: [25, 30],
            tip1: ["Citrus trees should be planted in a sunny and wind-protected area. In the citrus belt (a loosely defined area stretching from southern California to Florida), trees can be planted at any time, however, spring is the best time for container-grown plants.  Standard-size citrus trees should be spaced 12 to 25 feet apart and dwarf citrus trees should be set 6 to 10 feet apart. The exact distance depends on the variety. The bigger the fruit, the farther the distance. If the soil is not well-drained, plant the trees on a slight mound to prevent waterlogging. To plant citrus trees inside from seeds, remove the seeds from the desired fruit. Soak the seeds overnight in water and plant them ½ inch deep in moist potting soil. Cover the pot with a plastic bag or wrap and let it sit in a warm and sunny spot for a few weeks until the seeds start to grow. Then, remove the plastic but keep the pot near a warm and sunny window."],
            tip2: ["A few weeks after planting, and for the first few years (before bearing age), feed the tree a balanced (such as 6-6-6) fertilizer. Learn more about soil amendments and preparing soil for planting. For newly bearing trees, provide nutrients to continue branch and leaf growth, but also to replace nutrients lost by fruit forming. A citrus blend is ideal."]
        },
        {
            type: "pear",
            pH: [6.0, 6.5],
            texture: ["sandy", "loam"],
            latitude: [25, 45],
            tip1: ["Plant pear trees in late winter or early spring. You’ll need full sun for best fruit set and fertile, well-drained soil as well as good air circulation. If you live outside of the dry western regions, you should choose fire blight–resistant types and rootstocks.Plan to plant at least two varieties of pear trees, as they will need to be cross-pollinated to produce fruit. Make sure the varieties are compatible with each other. Space standard-size trees 20 to 25 feet apart. Space dwarf trees 12 to 15 feet apart."],
            tip2: ["Water the young trees well during dry spells to help establish the roots. "]
        },
        {
            type: "cherry",
            pH: [6.0, 6.5],
            texture: ["silt", "clay", "sandy", "loam"],
            latitude: [30, 45],
            tip1: ["Plant cherries in the late fall or early spring (when the ground is soft and has a higher moisture content). For sweet cherries, make sure the different varieties will pollinate each other. Plant in a sunny site with good air circulation; avoid planting near trees or buildings that shade. Cherry trees need deep, well-drained soil. Space sweet cherries 35 to 40 feet apart; dwarfs, 5 to 10 feet apart. Space tart cherries 20 to 25 feet apart; dwarfs, 8 to 10 feet apart. "]
        },
        {
            type: "plum",
            pH: [5.5, 6.5],
            texture: ["sandy", "clay", "loam"],
            latitude: [30, 45],
            tip1: ["Be prepared to plant more than one type of plum tree because many types require cross-pollination to produce fruit, although there are some varieties that can produce fruit on their own.It is also important to choose a type that will work with your location. There are three categories of plum trees: European, Japanese, and Damson. The hardy European types work in most regions across the U.S., whereas the Japanese types flourish where peach trees thrive. There are also American hybrids that work well in regions where neither European or Japanese types survive."],
            tip2: ["Thinning plum trees is important to prevent branches from breaking under the weight of the fruit. If branches do break, prune them back to undamaged wood, ideally cutting back to a natural fork to avoid leaving stubs.Be sure to water the young trees heavily every week during the first growing season to help promote growth. Then, water regularly. It’s best to water the plant deeply at the soil line, then let the soil dry out (though not completely) and water again. Water your tree well into mid-October to give it plenty of moisture through the winter months.Do not fertilize young fruit trees until they have set a crop. Once established, fruit production requires regular fertilizing all year long. If there’s good fruit set, fertilize with one pound calcium nitrate per tree or 1½ lb. 10-10-10. Cut back the nitrogen in fall and winter to avoid encouraging new growth in those seasons."]

        },
        {
            type: "fig",
            pH: [6.0, 6.5],
            texture: ["sandy", "loam", "clay"],
            latitude: [25, 35],
            tip1: ["Figs can be planted outdoors in Zone 8 and warmer. In zones where winter temperatures get colder than 10°F (-12°C) for periods of time, figs are best grown in containers and kept inside for the winter. For outdoor fig trees, plant the tree in the spring or early fall in full sun. Fig trees can grow in most types of soil as long as the soil is well-drained and contains plenty of organic material. Space fig trees at least 20 feet away from any buildings or other trees. Fig trees put down deep roots if given the chance, so bear that in mind when choosing a planting spot. "],
            tip2: ["Water young fig trees regularly to help them become established. In areas with dry climates, water fig trees deeply at least once a week. Unless grown in containers, most fig trees do not require regular fertilization. However, if your fig tree is not growing much (less than 12 inches in one growing season), you can add ½ to 1 pound of nitrogen supplement. Divide up the nitrogen into 3 to 4 feedings. Start applying the nitrogen in late winter and end in midsummer. You can also apply a layer of mulch around the tree to help prevent weeds and keep in moisture for the roots."]
        }
        ]

        var usStates = [{
            name: 'ALABAMA',
            abbreviation: 'AL'
        },
        {
            name: 'ALASKA',
            abbreviation: 'AK'
        },
        {
            name: 'AMERICAN SAMOA',
            abbreviation: 'AS'
        },
        {
            name: 'ARIZONA',
            abbreviation: 'AZ'
        },
        {
            name: 'ARKANSAS',
            abbreviation: 'AR'
        },
        {
            name: 'CALIFORNIA',
            abbreviation: 'CA'
        },
        {
            name: 'COLORADO',
            abbreviation: 'CO'
        },
        {
            name: 'CONNECTICUT',
            abbreviation: 'CT'
        },
        {
            name: 'DELAWARE',
            abbreviation: 'DE'
        },
        {
            name: 'DISTRICT OF COLUMBIA',
            abbreviation: 'DC'
        },
        {
            name: 'FEDERATED STATES OF MICRONESIA',
            abbreviation: 'FM'
        },
        {
            name: 'FLORIDA',
            abbreviation: 'FL'
        },
        {
            name: 'GEORGIA',
            abbreviation: 'GA'
        },
        {
            name: 'GUAM',
            abbreviation: 'GU'
        },
        {
            name: 'HAWAII',
            abbreviation: 'HI'
        },
        {
            name: 'IDAHO',
            abbreviation: 'ID'
        },
        {
            name: 'ILLINOIS',
            abbreviation: 'IL'
        },
        {
            name: 'INDIANA',
            abbreviation: 'IN'
        },
        {
            name: 'IOWA',
            abbreviation: 'IA'
        },
        {
            name: 'KANSAS',
            abbreviation: 'KS'
        },
        {
            name: 'KENTUCKY',
            abbreviation: 'KY'
        },
        {
            name: 'LOUISIANA',
            abbreviation: 'LA'
        },
        {
            name: 'MAINE',
            abbreviation: 'ME'
        },
        {
            name: 'MARSHALL ISLANDS',
            abbreviation: 'MH'
        },
        {
            name: 'MARYLAND',
            abbreviation: 'MD'
        },
        {
            name: 'MASSACHUSETTS',
            abbreviation: 'MA'
        },
        {
            name: 'MICHIGAN',
            abbreviation: 'MI'
        },
        {
            name: 'MINNESOTA',
            abbreviation: 'MN'
        },
        {
            name: 'MISSISSIPPI',
            abbreviation: 'MS'
        },
        {
            name: 'MISSOURI',
            abbreviation: 'MO'
        },
        {
            name: 'MONTANA',
            abbreviation: 'MT'
        },
        {
            name: 'NEBRASKA',
            abbreviation: 'NE'
        },
        {
            name: 'NEVADA',
            abbreviation: 'NV'
        },
        {
            name: 'NEW HAMPSHIRE',
            abbreviation: 'NH'
        },
        {
            name: 'NEW JERSEY',
            abbreviation: 'NJ'
        },
        {
            name: 'NEW MEXICO',
            abbreviation: 'NM'
        },
        {
            name: 'NEW YORK',
            abbreviation: 'NY'
        },
        {
            name: 'NORTH CAROLINA',
            abbreviation: 'NC'
        },
        {
            name: 'NORTH DAKOTA',
            abbreviation: 'ND'
        },
        {
            name: 'NORTHERN MARIANA ISLANDS',
            abbreviation: 'MP'
        },
        {
            name: 'OHIO',
            abbreviation: 'OH'
        },
        {
            name: 'OKLAHOMA',
            abbreviation: 'OK'
        },
        {
            name: 'OREGON',
            abbreviation: 'OR'
        },
        {
            name: 'PALAU',
            abbreviation: 'PW'
        },
        {
            name: 'PENNSYLVANIA',
            abbreviation: 'PA'
        },
        {
            name: 'PUERTO RICO',
            abbreviation: 'PR'
        },
        {
            name: 'RHODE ISLAND',
            abbreviation: 'RI'
        },
        {
            name: 'SOUTH CAROLINA',
            abbreviation: 'SC'
        },
        {
            name: 'SOUTH DAKOTA',
            abbreviation: 'SD'
        },
        {
            name: 'TENNESSEE',
            abbreviation: 'TN'
        },
        {
            name: 'TEXAS',
            abbreviation: 'TX'
        },
        {
            name: 'UTAH',
            abbreviation: 'UT'
        },
        {
            name: 'VERMONT',
            abbreviation: 'VT'
        },
        {
            name: 'VIRGIN ISLANDS',
            abbreviation: 'VI'
        },
        {
            name: 'VIRGINIA',
            abbreviation: 'VA'
        },
        {
            name: 'WASHINGTON',
            abbreviation: 'WA'
        },
        {
            name: 'WEST VIRGINIA',
            abbreviation: 'WV'
        },
        {
            name: 'WISCONSIN',
            abbreviation: 'WI'
        },
        {
            name: 'WYOMING',
            abbreviation: 'WY'
        }

        ];
        for (var i = 0; i < usStates.length; i++) {
            var option = document.createElement("option");
            option.text = usStates[i].name;
            option.value = usStates[i].abbreviation;
            inputState.add(option);
        }

    });