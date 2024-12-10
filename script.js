document.addEventListener('DOMContentLoaded', function () {
    const map = L.map('map').setView([21.03065, 105.84881], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
    }).addTo(map);

    let collectionPoints = []; // Danh sách các điểm thu gom

    // Tải dữ liệu ranh giới quận Hoàn Kiếm
    const overpassApiUrl = 'https://lz4.overpass-api.de/api/interpreter';
    const query = `
        [out:json];
        relation(9421131);
        out body;
        >;
        out skel qt;
    `;
    fetch(overpassApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`
    })
        .then(response => response.json())
        .then(data => {
            const geoJson = osmtogeojson(data);
            L.geoJSON(geoJson, {
                style: {
                    color: 'red',
                    weight: 2,
                    fillOpacity: 0.1,
                }
            }).addTo(map);
        })
        .catch(error => {
            console.error('Error fetching Overpass API data:', error);
            alert('Không thể tải dữ liệu. Vui lòng thử lại sau!');
        });

    // Nhập tọa độ điểm thu gom
    document.getElementById('addPoints').addEventListener('click', function () {
        const addPoint = () => {
            const lat = prompt('Nhập vĩ độ (latitude):');
            const lng = prompt('Nhập kinh độ (longitude):');
            if (lat && lng) {
                const point = [parseFloat(lat), parseFloat(lng)];
                collectionPoints.push(point);

                // Hiển thị điểm thu gom trên bản đồ (dấu chấm xanh)
                L.circleMarker(point, {
                    color: 'blue',
                    radius: 6,
                }).addTo(map).bindPopup(`Điểm thu gom: ${lat}, ${lng}`).openPopup();

                const continueAdding = confirm('Bạn có muốn nhập thêm điểm không?');
                if (continueAdding) {
                    addPoint();
                } else {
                    drawRoute(collectionPoints); // Vẽ tuyến đường sau khi hoàn tất nhập
                }
            }
        };
        addPoint();
    });

    // Vạch tuyến đường từ các điểm thu gom
    function drawRoute(points) {
        if (points.length > 1) {
            const polyline = L.polyline(points, { color: 'blue' }).addTo(map);
            map.fitBounds(polyline.getBounds());
        } else {
            alert('Cần ít nhất 2 điểm để vạch tuyến!');
        }
    }

    // Vạch tuyến tự động
    document.getElementById('autoRoute').addEventListener('click', function () {
        const numPoints = prompt('Nhập số lượng điểm thu gom:');
        if (numPoints && parseInt(numPoints) > 0) {
            fetch(`https://router.project-osrm.org/route/v1/driving/105.84881,21.03065;105.85381,21.03365?overview=full&geometries=geojson`)
                .then(response => response.json())
                .then(data => {
                    const route = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
                    L.polyline(route, { color: 'green', weight: 3 }).addTo(map);
                    map.fitBounds(route);
                    alert(`Tuyến đường tự động đã được tạo với ${numPoints} điểm!`);
                })
                .catch(error => {
                    console.error('Error fetching route:', error);
                    alert('Không thể tạo tuyến đường tự động.');
                });
        } else {
            alert('Số lượng điểm không hợp lệ.');
        }
    });
});
