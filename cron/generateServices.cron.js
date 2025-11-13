const cron = require('node-cron');
const RouteMaster = require('../models/RouteMaster');
const { generateServicesForRoute } = require('../utils/serviceGenerator');

function startGenerateServicesCron() {
    cron.schedule('0 1 * * *', async () => {
        try {
            console.log('[CRON-SERVICES] Proceso de creación iniciado', new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' }));

            const activeRoutes = await RouteMaster.find({
                'schedule.active': true
            })
                .populate('origin')
                .populate('destination')
                .populate('stops.city')
                .populate('layout');

            let totalServicesCreated = 0;

            for (const route of activeRoutes) {
                try {
                    console.log(`[CRON-SERVICES] Procesando ruta: ${route.name}`);
                    const services = await generateServicesForRoute(route);
                    totalServicesCreated += services.length;
                    console.log(`[CRON-SERVICES] Ruta "${route.name}" : ${services.length} servicios generados`);
                } catch (error) {
                    console.error(`[CRON-SERVICES] Error en la ruta "${route.name}":`, error.message);
                }
            }

            console.log(`[CRON-SERVICES] Proceso de creación finalizado, total de servicios creados: ${totalServicesCreated}`)
        } catch (err) {
            console.error('[CRON-SERVICES] Error creando servicios: ', err);
        }
    }, {
        timezone: "America/Santiago"
    });
    console.log("[CRON-SERVICES] Cron de creación de servicios iniciado");
}

module.exports = startGenerateServicesCron;