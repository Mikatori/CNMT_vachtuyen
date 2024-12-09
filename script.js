let map, drawnDistrict, collectionPoints = [];

// Initialize map
function initMap() {
    map = L.map('map').setView([21.0285, 105.8542], 12); // Center Hà Nội
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
    }).addTo(map);
}

// Load district data (temporary solution)
async function loadDistrictData(districtName) {
    const districts = {
        "Hoàn Kiếm": {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": { "name": "Hoàn Kiếm" },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [
                            [
                                [105.851, 21.029],
                                [105.853, 21.029],
                                [105.853, 21.027],
                                [105.851, 21.027],
                                [105.851, 21.029]
                            ]
                        ]
                    }
                }
            ]
        }
    };

    if (districts[districtName]) {
        drawDistrict(districts[districtName]);
    } else {
        alert("Không tìm thấy dữ liệu cho quận này!");
    }
}

// Draw district boundary
function drawDistrict(geoJson) {
    if (drawnDistrict) map.removeLayer(drawnDistrict);
    drawnDistrict = L.geoJSON(geoJson, { color: "red" }).addTo(map);
    map.fitBounds(drawnDistrict.getBounds());
}

// Add collection points
function addCollectionPoint(latlng) {
    const marker = L.marker(latlng).addTo(map).bindPopup("Điểm thu gom").openPopup();
    collectionPoints.push(marker);
}

// Generate route
function generateRoute() {
    if (collectionPoints.length < 2) {
        alert("Cần ít nhất 2 điểm để vạch tuyến đường!");
        return;
    }

    const waypoints = collectionPoints.map(marker => L.latLng(marker.getLatLng()));
    L.Routing.control({
        waypoints: waypoints,
        lineOptions: {
            styles: [{ color: 'blue', weight: 4 }]
        }
    }).addTo(map);
}

// Event listeners
document.getElementById('load-map').addEventListener('click', () => {
    const districtName = document.getElementById('district').value;
    loadDistrictData(districtName);
});

document.getElementById('add-collection-point').addEventListener('click', () => {
    map.once('click', (e) => addCollectionPoint(e.latlng));
});

document.getElementById('generate-route').addEventListener('click', generateRoute);

// Initialize map
initMap();
