// Create the map object and set the default view
let map = L.map("map").setView([37.09, -95.71], 5);

// Add a tile layer to the map 
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Define the URL for the USGS GeoJSON data (All Earthquakes from the Past 7 Days)
let earthquakeDataUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// Fetch earthquake data using D3
d3.json(earthquakeDataUrl).then(function(data) {
    // Function to style each earthquake point
    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.geometry.coordinates[2]), // Depth
            color: "#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }

    // Function to determine marker radius based on magnitude
    function getRadius(magnitude) {
        return magnitude === 0 ? 1 : magnitude * 4;
    }

    // Function to determine marker color based on depth
    function getColor(depth) {
        if (depth > 90) return "#EA2C2C";
        else if (depth > 70) return "#EA822C";
        else if (depth > 50) return "#EE9C00";
        else if (depth > 30) return "#EECC00";
        else if (depth > 10) return "#D4EE00";
        else return "#98EE00";
    }

    // Add earthquake data to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        onEachFeature: function(feature, layer) {
            layer.bindPopup(
                "Magnitude: " + feature.properties.mag +
                "<br>Location: " + feature.properties.place +
                "<br>Depth: " + feature.geometry.coordinates[2] + " km"
            );
        }
    }).addTo(map);
});

// Add a legend to the map
let legend = L.control({ position: "bottomright" });

legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");
    let grades = [-10, 10, 30, 50, 70, 90];
    let colors = ["#98EE00", "#D4EE00", "#EECC00", "#EE9C00", "#EA822C", "#EA2C2C"];

    for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
            "<i style='background: " + colors[i] + "'></i> " +
            grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
};

legend.addTo(map);
