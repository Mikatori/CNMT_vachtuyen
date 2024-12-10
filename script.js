document.getElementById('districtForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const districtName = document.getElementById('district').value.trim();
    if (!districtName) {
        alert('Vui lòng nhập tên quận!');
        return;
    }

    const overpassApiUrl = 'https://lz4.overpass-api.de/api/interpreter';
    const query = `
        [out:json];
        area["name"="Hà Nội"]["boundary"="administrative"]->.hanoi;
        relation["name"="${districtName}"]["boundary"="administrative"](area.hanoi);
        out body;
        >;
        out skel qt;
    `;

    try {
        // Gửi yêu cầu đến Overpass API
        const response = await fetch(overpassApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `data=${encodeURIComponent(query)}`
        });

        if (!response.ok) {
            throw new Error('Không thể tải dữ liệu từ Overpass API.');
        }

        const data = await response.json();

        // Xử lý dữ liệu GeoJSON
        const geoJson = osmtogeojson(data);

        // Vẽ bản đồ
        displayMap(geoJson, districtName);
    } catch (error) {
        console.error(error);
        alert('Đã xảy ra lỗi khi tải dữ liệu. Kiểm tra lại kết nối hoặc tên quận.');
    }
});

function displayMap(geoJson, districtName) {
    const mapContainer = document.getElementById('map');

    // Xóa bản đồ cũ nếu đã tồn tại
    if (mapContainer._leaflet_id) {
        mapContainer.innerHTML = '';
    }

    const map = L.map('map').setView([21.0285, 105.8542], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
    }).addTo(map);

    // Thêm dữ liệu GeoJSON vào bản đồ
    L.geoJSON(geoJson, {
        style: {
            color: 'red',
            weight: 2,
            fillOpacity: 0.1,
        }
    }).addTo(map);

    alert(`Đã tải dữ liệu của quận ${districtName}!`);
}
