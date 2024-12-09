let map, drawnDistrict;

// Khởi tạo bản đồ
function initMap() {
    map = L.map('map').setView([21.0285, 105.8542], 12); // Tâm bản đồ Hà Nội
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
    }).addTo(map);
}

// Tải dữ liệu từ file JSON và hiển thị quận
async function loadDistrictData(districtName) {
    try {
        const response = await fetch('hanoi_districts.json'); // Đường dẫn đến file JSON
        const data = await response.json();

        // Tìm dữ liệu quận Hà Nội
        const hanoi = data.find(city => city.FullName === "Thành phố Hà Nội");
        if (!hanoi) {
            alert("Không tìm thấy dữ liệu Hà Nội!");
            return;
        }

        // Tìm quận theo tên
        const district = hanoi.District.find(d => d.FullName.includes(districtName));
        if (!district) {
            alert(`Không tìm thấy dữ liệu cho quận ${districtName}!`);
            return;
        }

        drawDistrict(district);
    } catch (error) {
        alert("Không thể tải dữ liệu quận!");
        console.error("Lỗi khi tải dữ liệu:", error);
    }
}

// Vẽ ranh giới quận lên bản đồ
function drawDistrict(district) {
    if (drawnDistrict) map.removeLayer(drawnDistrict);

    // Dữ liệu GeoJSON để vẽ ranh giới (tạm thời giả lập dữ liệu ranh giới từ tọa độ các phường)
    const coordinates = district.Ward.map(ward => [
        parseFloat(ward.Code) / 10000, // Tạo dữ liệu tọa độ giả lập
        parseFloat(ward.Code) / 10000
    ]);

    const geoJson = {
        type: "Feature",
        properties: { name: district.FullName },
        geometry: {
            type: "Polygon",
            coordinates: [coordinates]
        }
    };

    drawnDistrict = L.geoJSON(geoJson, { color: "red" }).addTo(map);
    map.fitBounds(drawnDistrict.getBounds());
}

// Xử lý sự kiện khi chọn quận
document.getElementById('load-map').addEventListener('click', () => {
    const districtName = document.getElementById('district').value;
    loadDistrictData(districtName);
});

// Khởi tạo bản đồ khi tải trang
initMap();
