var map = L.map('map').setView([40.73,-73.93], 11);


var CartoDBTiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',{
  attribution: 'Map Data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> Contributors, Map Tiles &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
});

map.addLayer(CartoDBTiles);


//create variables 
var greenmarketsGeoJSON;
var hoodsGeoJSON;

// add green market data
$.getJSON( "geojson/greenmarkets.geojson", function(data) {
    var greenmarkets = data;
    
    // make the markers for greenmarkets
    var greenmarketsPointToLayer = function (feature, latlng){
        var greenmarketsMarker = L.circle(latlng, 150, {
            stroke: false,
            fillColor: '#00b300',
            fillOpacity: 0.8
        });
        
        return greenmarketsMarker;  
    }

    var greenmarketsClick = function (feature, layer) {
        layer.bindPopup("<strong>Drop-off Location:</strong> " + feature.properties["Market Nam"] + "<br /><strong>Days:</strong> " + feature.properties["Day(s)"] + "<br /><strong>Hours:</strong> " + feature.properties["Hours"]);
    }

    greenmarketsGeoJSON = L.geoJson(greenmarkets, {
        pointToLayer: greenmarketsPointToLayer,
        onEachFeature: greenmarketsClick
    }).addTo(map);

});

    
// add neighborhood pilot program data and filter colors by the year they started the pilot program
$.getJSON("geojson/hoods_project.geojson", function(data) {
    var hoods = data;
    console.log(hoods)

    var HoodStyle = function (feature) {
        var value = feature.properties.Year;
        var fillColor = null;
        if(value === "Fall '13") {
            fillColor = "#fef0d9";
        }

        if(value === "Spring '14") {
            fillColor = "#fdcc8a";
        }

        if(value === "Fall '15") {
            fillColor = "#fc8d59";
        }

        if(value === "Spring '15") {
            fillColor = "#d7301f";
        }

    var style = {
            weight: 1,
            opacity: .1,
            color: 'white',
            fillOpacity: 0.75,
            fillColor: fillColor
        };

        return style;
    }

     var HoodClick = function (feature, layer) {
        var hood = feature.properties.Year;
        layer.bindPopup("<strong>Neighborhood(s):</strong> " + feature.properties.NTAName + "<br /><strong>Pilot Year: </strong>" + feature.properties.Year);
    }


    hoodsGeoJSON = L.geoJson(hoods, {
        style: HoodStyle,
        onEachFeature: HoodClick
    }).addTo(map);
   

    // create layer controls
    createLayerControls(); 

});


function createLayerControls(){

    // add in layer controls
    var baseMaps = {
        "CartoDB": CartoDBTiles,
       
    };

    var overlayMaps = {
        "Green Markets": greenmarketsGeoJSON,
        "Pilot Neighborhoods": hoodsGeoJSON
        
    };

    // add control
    L.control.layers(baseMaps, overlayMaps).addTo(map);
   
}


//make a legend
var legend = L.control({position: 'bottomright'});

// using a function, create a div element for the legend and return that div
legend.onAdd = function (map) {

    // a method in Leaflet for creating new divs and setting classes
    var div = L.DomUtil.create('div', 'info legend');
    
        div.innerHTML += 
            '<b>Organics Collection Program</b><br />' +
            '<svg class="left" width="22" height="18"><rect x="0" y="4" width="12" height="12" class="legendSvg1"/></svg><span>Fall 2013</span><br />' +
            '<svg class="left" width="22" height="18"><rect x="0" y="4" width="12" height="12" class="legendSvg2"/></svg><span>Spring 2014</span><br />' +
            '<svg class="left" width="22" height="18"><rect x="0" y="4" width="12" height="12" class="legendSvg3"/></svg><span>Fall 2015</span><br />' +
            '<svg class="left" width="22" height="18"><rect x="0" y="4" width="12" height="12" class="legendSvg4"/></svg><span>Spring 2015</span><br />' + 
            '<b>Compost Drop-off Sites</b><br />' +
            '<svg class="left" width="22" height="18"><circle x="0" y="4" cx="9" cy="9" r="7" class="legendSvg5"/></svg><span>Greenmarkets</span><br />'  
;          
          
    return div;
};


// add the legend to the map
legend.addTo(map);



    // add in leaflet geocoder plugin and save result
    var geocoder = L.Control.geocoder().addTo(map);

    geocoder.markGeocode = function(result) {
        console.log(result.center);
        var marker = L.marker (result.center).addTo(map);

    // Using PointinPolygon, input geocode result to find out if point is within a participating pilot neighborhood 
    // If it isn't within a neighborhood, explain that you can drop it off at a greenmarket
        var results = leafletPip.pointInLayer(result.center, hoodsGeoJSON, true);
        
            if (results.length) {
                    marker.bindPopup("Your neightborhood is part of the NYC Organics Collection Program! Learn more <a href=\"http://www1.nyc.gov/assets/dsny/zerowaste/residents/food-scraps-and-yard-waste.shtml\">here.</a>")
                    .openPopup();
                    
            }
             
             else {
                    marker.bindPopup("Your neightborhood is not part of the NYC Organics Collection Program, but you can drop off your food scraps at a nearby Greenmarket.").openPopup();
            }  
                    
    console.log(result);
};


    
            
    



