const cron = require('node-cron');
const Seat = require('../models/Seat');

function startReleaseSeatsCron() {
    // Ejecutar cada minuto
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();

            const result = await Seat.updateMany(
                {
                    status: 'reserved',
                    holdUntil: { $lte: now }
                },
                {
                    $set: {
                        isAvailable: true,
                        status: 'available',
                        holdUntil: null
                    },
                    $unset: { passenger: "" }
                }
            );

            if (result.modifiedCount > 0) {
                console.log(`[CRON-SEATS] Liberados ${result.modifiedCount} asientos con reserva expirada`);
            }

        } catch (err) {
            console.error('[CRON-SEATS] Error liberando asientos expirados:', err);
        }
    });

    console.log('[CRON-SEATS] Cron de limpieza de asientos iniciado');
}

module.exports = startReleaseSeatsCron;