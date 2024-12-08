let map, drawnDistrict, collectionPoints = [];
const districtPolygon = {}; // Giả định dữ liệu GeoJSON cho các quận

// Initialize map
function initMap() {
    map = L.map('map').setView([21.0285, 105.8542], 12); // Center Hà Nội
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
    }).addTo(map);
}

// Load district data
async function loadDistrictData(districtName) {
    if (districtPolygon[districtName]) {
        drawDistrict(districtPolygon[districtName]);
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

// Auto-route
function autoRoute() {
    // Logic để vạch tuyến tốt nhất dựa trên GeoJSON
    alert("Tính năng tự động đang được phát triển!");
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
document.getElementById('auto-route').addEventListener('click', autoRoute);

// Initialize map on load
initMap();
