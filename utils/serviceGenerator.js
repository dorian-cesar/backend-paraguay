const Service = require('../models/Service');
const Seat = require('../models/Seat');
const RouteMaster = require('../models/RouteMaster');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const isoWeek = require('dayjs/plugin/isoWeek');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);

const TZ = 'America/Santiago';

async function generateServicesForRoute(route) {
  try {

    // Validación básica
    if (!route || !route.schedule) {
      throw new Error('RouteMaster o schedule no definido');
    }

    // Obtener configuración con valores por defecto seguros
    const daysOfWeek = Array.isArray(route.schedule.daysOfWeek) ? route.schedule.daysOfWeek : [1, 2, 3, 4, 5];
    const horizonDays = Number(route.schedule.horizonDays) || 14;

    const today = dayjs().tz(TZ).startOf('day');
    const generationEnd = today.add(horizonDays, 'day');

    // MANEJO SEGURO DE FECHAS NULL - CORREGIDO
    let generationStart;

    if (route.schedule.startDate && !isNaN(new Date(route.schedule.startDate).getTime())) {
      // Si hay startDate válido, usarlo (pero no puede ser anterior a hoy)
      const startDate = dayjs.tz(route.schedule.startDate, TZ).startOf('day');
      generationStart = startDate.isAfter(today) ? startDate : today;
    } else {
      // Si startDate es null o inválido, empezar desde hoy
      generationStart = today;
    }

    // Si lastGeneratedDate existe y es válido, empezar desde el día siguiente
    if (route.lastGeneratedDate && !isNaN(new Date(route.lastGeneratedDate).getTime())) {
      const lastGenerated = dayjs.tz(route.lastGeneratedDate, TZ).startOf('day');
      const nextDay = lastGenerated.add(1, 'day');

      if (nextDay.isAfter(generationStart)) {
        generationStart = nextDay;
      }
    }

    console.log('Parámetros de generación:');
    console.log('   - Días de semana:', daysOfWeek);
    console.log('   - Horizonte:', horizonDays, 'días');
    console.log('   - Generar desde:', generationStart.format('YYYY-MM-DD'));
    console.log('   - Generar hasta:', generationEnd.format('YYYY-MM-DD'));
    console.log('   - StartDate en DB:', route.schedule.startDate);
    console.log('   - LastGeneratedDate:', route.lastGeneratedDate);

    // Si la fecha de inicio es después del final, no hay servicios por generar
    if (generationStart.isAfter(generationEnd)) {
      console.log('✅ No hay servicios por generar - ya está actualizado');
      return [];
    }

    const createdServices = [];
    const totalDays = generationEnd.diff(generationStart, 'day') + 1;

    console.log(`📋 Revisando ${totalDays} días...`);

    for (let i = 0; i < totalDays; i++) {
      const currentLocalDate = generationStart.add(i, 'day');
      const dayOfWeek = currentLocalDate.isoWeekday();

      console.log(`   📅 ${currentLocalDate.format('YYYY-MM-DD')} (día ${dayOfWeek})`);

      // Verificar días de la semana
      if (!daysOfWeek.includes(dayOfWeek)) {
        // console.log('      ❌ Saltando: no corresponde al día de semana');
        continue;
      }

      // Verificar excepciones
      if (hasException(route, currentLocalDate)) {
        // console.log('      ❌ Saltando: tiene excepción');
        continue;
      }

      // Verificar endDate si existe
      if (route.schedule.endDate && !isNaN(new Date(route.schedule.endDate).getTime())) {
        const endDate = dayjs.tz(route.schedule.endDate, TZ).endOf('day');
        if (currentLocalDate.isAfter(endDate)) {
          // console.log('      ❌ Saltando: después de endDate');
          continue;
        }
      }

      try {
        const service = await createServiceInstance(route, currentLocalDate, route.direction);
        createdServices.push(service);
        console.log('      ✅ Servicio creado exitosamente');
      } catch (error) {
        console.error('      ❌ Error creando servicio:', error.message);
      }
    }

    // Actualizar última generación solo si se crearon servicios
    if (createdServices.length > 0) {
      await RouteMaster.findByIdAndUpdate(route._id, {
        lastGeneratedDate: generationEnd.toDate()
      });
      console.log('✅ Actualizado lastGeneratedDate:', generationEnd.format('YYYY-MM-DD'));
    }

    console.log(`✅ Generación completada: ${createdServices.length} servicios creados`);
    return createdServices;

  } catch (error) {
    console.error('Error crítico en generateServicesForRoute:', error);
    throw error;
  }
}

// Función para verificar excepciones (mejorada)
function hasException(route, date) {
  try {
    const exceptions = route.schedule?.exceptions || [];
    const dateStr = date.format('YYYY-MM-DD');

    const exception = exceptions.find(ex => {
      if (!ex.date || isNaN(new Date(ex.date).getTime())) return false;
      const exDate = dayjs(ex.date).format('YYYY-MM-DD');
      return exDate === dateStr;
    });

    return exception && exception.type === 'unavailable';
  } catch (error) {
    console.error('Error verificando excepciones:', error);
    return false;
  }
}

// La función createServiceInstance con mejor manejo de errores
async function createServiceInstance(route, currentLocalDate, direction) {
  try {
    if (!currentLocalDate || !currentLocalDate.tz) {
      currentLocalDate = dayjs.tz(currentLocalDate, TZ).startOf('day');
    }

    // Determinar baseDeparture
    let baseDeparture;
    if (typeof route.startTime === 'number') {
      const hour = Math.floor(route.startTime / 60);
      const minute = route.startTime % 60;
      baseDeparture = currentLocalDate.hour(hour).minute(minute).second(0).millisecond(0);
    } else {
      throw new Error('RouteMaster necesita startTime (minutos)');
    }

    let existingService = await Service.findOne({
      routeMaster: route._id,
      date: baseDeparture.toDate(),
      direction
    });

    if (existingService) {
      console.log('⚠️ Servicio ya existe para esta fecha, se devuelve existente');
      return existingService;
    }

    // Generar departures
    const stops = Array.isArray(route.stops) ? route.stops : [];
    const departureTimes = stops.map(stop => {
      const offset = Number(stop.offsetMinutes) || 0;
      const stopTime = baseDeparture.add(offset, 'minute');
      return {
        order: stop.order,
        stop: stop.name,
        time: stopTime.toDate(),
        price: stop.price != null ? Number(stop.price) : 0
      };
    });

    // Crear Service
    const service = new Service({
      routeMaster: route._id,
      date: baseDeparture.toDate(),
      direction,
      origin: route.origin,
      destination: route.destination,
      layout: route.layout,
      departures: departureTimes,
    });

    await service.save();

    // ⚠️ Validar layout antes de crear asientos
    const layout = route.layout && typeof route.layout === 'object' ? route.layout : null;
    if (!layout) {
      console.log('⚠️ Layout no poblado, no se crearán asientos');
      return service;
    }

    const seats = [];

    if (layout.floor1 && Array.isArray(layout.floor1.seatMap)) {
      layout.floor1.seatMap.forEach(row => {
        row.forEach(code => {
          if (code) seats.push({ service: service._id, code, floor: 1, type: layout.tipo_Asiento_piso_1 });
        });
      });
    }

    if (layout.floor2 && Array.isArray(layout.floor2.seatMap)) {
      layout.floor2.seatMap.forEach(row => {
        row.forEach(code => {
          if (code) seats.push({ service: service._id, code, floor: 2, type: layout.tipo_Asiento_piso_2 });
        });
      });
    }

    if (seats.length > 0) {
      const createdSeats = await Seat.insertMany(seats);
      service.seats = createdSeats.map(s => s._id);
      await service.save();
    }

    return service;

  } catch (error) {
    console.error('Error en createServiceInstance:', error);
    throw error;
  }
}


module.exports = { generateServicesForRoute, createServiceInstance };