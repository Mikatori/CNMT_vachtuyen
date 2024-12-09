let map, drawnDistrict, collectionPoints = [];

// Dữ liệu điểm thu gom mặc định
const defaultCollectionPoints = {
    "Hoàn Kiếm": [
        [21.0285, 105.8533],
        [21.0302, 105.8556],
        [21.0271, 105.8505],
    ],
    "Ba Đình": [
        [21.0333, 105.8143],
        [21.0345, 105.8180],
        [21.0312, 105.8112],
    ]
};

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
    if (collectionPoints.length === 0) {
        const districtName = document.getElementById('district').value;

        if (defaultCollectionPoints[districtName]) {
            alert("Không có điểm thu gom được thêm, sử dụng các điểm mặc định!");

            // Thêm các điểm thu gom mặc định vào bản đồ
            defaultCollectionPoints[districtName].forEach(coords => {
                const marker = L.marker(coords).addTo(map).bindPopup("Điểm thu gom mặc định").openPopup();
                collectionPoints.push(marker);
            });
        } else {
            alert("Không tìm thấy các điểm thu gom mặc định cho quận này!");
            return;
        }
    }

    // Vạch tuyến đường giữa các điểm thu gom
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

    // Xóa các điểm thu gom cũ
    collectionPoints.forEach(marker => map.removeLayer(marker));
    collectionPoints = [];

    loadDistrictData(districtName);

    // Tự động thêm các điểm thu gom mặc định (nếu cần)
    if (defaultCollectionPoints[districtName]) {
        defaultCollectionPoints[districtName].forEach(coords => {
            const marker = L.marker(coords).addTo(map).bindPopup("Điểm thu gom mặc định").openPopup();
            collectionPoints.push(marker);
        });
    }
});

document.getElementById('add-collection-point').addEventListener('click', () => {
    map.once('click', (e) => addCollectionPoint(e.latlng));
});

document.getElementById('generate-route').addEventListener('click', generateRoute);

// Initialize map
initMap();
