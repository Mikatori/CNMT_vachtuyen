let map, drawnDistrict, collectionPoints = [];

// Initialize map
function initMap() {
    map = L.map('map').setView([21.0285, 105.8542], 12); // Center Hà Nội
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
    }).addTo(map);
}

// Load district data from Overpass API
async function loadDistrictData(districtName) {
    try {
        // Overpass API query to fetch district boundary
        const query = `
            [out:json];
            area[name="Hà Nội"]->.searchArea;
            relation["name"="${districtName}"](area.searchArea);
            out geom;
        `;
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.elements.length > 0) {
            const geoJson = convertToGeoJSON(data);
            drawDistrict(geoJson);
        } else {
            alert("Không tìm thấy dữ liệu cho quận này!");
        }
    } catch (error) {
        alert("Lỗi khi tải dữ liệu từ Overpass API!");
        console.error(error);
    }
}

// Convert Overpass API data to GeoJSON format
function convertToGeoJSON(data) {
    const features = data.elements.map(element => ({
        type: "Feature",
        properties: {
            id: element.id,
            name: element.tags.name || "Unknown"
        },
        geometry: {
            type: "Polygon",
            coordinates: [element.geometry.map(coord => [coord.lon, coord.lat])]
        }
    }));

    return {
        type: "FeatureCollection",
        features: features
    };
}

// Draw district boundary on the map
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

// Generate route between collection points
async function generateRoute() {
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

// Auto-route feature (placeholder for future implementation)
function autoRoute() {
    alert("Tính năng tự động đang được phát triển!");
}

// Event listeners for user actions
document.getElementById('load-map').addEventListener('click', () => {
    const districtName = document.getElementById('district').value;
    loadDistrictData(districtName);
});

document.getElementById('add-collection-point').addEventListener('click', () => {
    map.once('click', (e) => addCollectionPoint(e.latlng));
});

document.getElementById('generate-route').addEventListener('click', generateRoute);
document.getElementById('auto-route').addEventListener('click', autoRoute);

// Initialize map on page load
initMap();
