function buildSeatMap(service) {
    const layout = { ...service.layout };

    ["floor1", "floor2"].forEach(floorKey => {
        const floorLayout = layout[floorKey];
        if (!floorLayout || !floorLayout.seatMap) return;

        layout[floorKey] = floorLayout.seatMap.map(row =>
            row.map(code => {
                // buscar el asiento correspondiente en service.seats
                const seat = service.seats.find(
                    s => s.code === code && s.floor === (floorKey === "floor1" ? 1 : 2)
                );
                return seat || { code, missing: true }; // fallback si no se encuentra
            })
        );
    });

    return layout;
}



module.exports = { buildSeatMap };
