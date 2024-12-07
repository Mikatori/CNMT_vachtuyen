let map, boundaryLayer, routeControl;
let points = [];

// Khởi tạo bản đồ
map = L.map('map').setView([21.0285, 105.8542], 12); // Tọa độ Hà Nội
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Lấy địa phận quận từ OpenStreetMap
document.getElementById('get-boundary').addEventListener('click', async () => {
    const districtName = document.getElementById('district').value.trim();
    if (!districtName) {
        alert('Vui lòng nhập tên quận.');
        return;
    }

    const url = `https://nominatim.openstreetmap.org/search?city=Hà Nội&district=${districtName}&format=geojson`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.features.length === 0) {
            alert('Không tìm thấy quận.');
            return;
        }

        const boundary = data.features[0].geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
        if (boundaryLayer) map.removeLayer(boundaryLayer);
        boundaryLayer = L.polygon(boundary, { color: 'red' }).addTo(map);
        map.fitBounds(boundaryLayer.getBounds());
    } catch (error) {
        alert('Lỗi khi lấy dữ liệu quận.');
    }
});

// Thêm điểm thu gom
document.getElementById('add-point').addEventListener('click', () => {
    const pointInput = document.getElementById('point').value.trim();
    if (!pointInput) {
        alert('Vui lòng nhập tọa độ điểm.');
        return;
    }

    const [lat, lng] = pointInput.split(',').map(Number);
    if (!lat || !lng) {
        alert('Tọa độ không hợp lệ.');
        return;
    }

    points.push([lat, lng]);
    L.marker([lat, lng]).addTo(map).bindPopup(`Điểm thu gom: ${lat}, ${lng}`).openPopup();
});

// Tạo tuyến đường
document.getElementById('generate-route').addEventListener('click', () => {
    if (routeControl) map.removeControl(routeControl);

    if (points.length === 0) {
        alert('Không có điểm thu gom nào.');
        return;
    }

    routeControl = L.Routing.control({
        waypoints: points.map(coord => L.latLng(coord[0], coord[1])),
        routeWhileDragging: true,
        show: false
    }).addTo(map);
});
