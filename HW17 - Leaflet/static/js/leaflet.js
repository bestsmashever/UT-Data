var grayscaleMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
});

var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
});

var outdoorsMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
});

var map = L.map("map", {
    center: [40.7, -94.5], // add long and lat
    zoom: 3
});

grayscaleMap.addTo(map)

var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Grabbing out GeoJson data
d3.json(url, function(data) {
    console.log(data)
    createMap(data.features);
});

function createMap(earthquakeData) {
    
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + 
            new Date(feature.properties.time) + "</p>" +
            "<p>" + "Magnitude: " + feature.properties.mag + "</p>");
    }

    function getColor(d) {
        return d > 5 ? '#800026' :
            d > 4  ? '#E31A1C' :
            d > 3  ? '#ff6612' :
            d > 2  ? '#ffce00' :
            d > 1  ? '#e3f018' :
                    '#bdff00';
    }

    function getRadius(d) {
        return d * 4
    }

    function styleInfo(feature) {
        return {
            fillColor: getColor(feature.properties.mag),
            opacity: 1,
            fillOpacity: 0.8,
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.5,
            color: "black"
        }
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng)
        },
        onEachFeature: onEachFeature,
        style: styleInfo
    })

    earthquakes.addTo(map)
    
    // Create baseMaps
    var baseMaps = {
        grayscaleMap,
        satelliteMap,
        outdoorsMap
    }
    
    // Add tectonic layer
    var tectonicplates = new L.LayerGroup()
    
    var overlays = {
        "Tectonic Plates": tectonicplates,
        "Earthquakes": earthquakes
    }

    // Add control to the map
    L
        .control
        .layers(baseMaps, overlays)
        .addTo(map)
    
    tectonicplatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
    d3.json(tectonicplatesUrl, function(data) {
        L
            .geoJSON(data, {
                color: "orange",
                weight: 2
            })
            .addTo(tectonicplates)
        tectonicplates.addTo(map)
    })

    // Add legend to the map
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 1, 2, 3, 4, 5],
            labels = [];
    
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
    
        return div;
    };
    
    legend.addTo(map);
}