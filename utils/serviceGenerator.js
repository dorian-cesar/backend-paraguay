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
    if (!route || !route.schedule) {
      throw new Error('RouteMaster o schedule no definido');
    }

    const daysOfWeek = Array.isArray(route.schedule.daysOfWeek) ? route.schedule.daysOfWeek : [1, 2, 3, 4, 5];
    const horizonDays = Number(route.schedule.horizonDays) || 14;

    const today = dayjs().tz(TZ).startOf('day');
    const generationEnd = today.add(horizonDays, 'day');

    let generationStart;

    if (route.schedule.startDate && !isNaN(new Date(route.schedule.startDate).getTime())) {
      const startDate = dayjs.tz(route.schedule.startDate, TZ).startOf('day');
      generationStart = startDate.isAfter(today) ? startDate : today;
    } else {
      generationStart = today;
    }

    if (route.lastGeneratedDate && !isNaN(new Date(route.lastGeneratedDate).getTime())) {
      const lastGenerated = dayjs.tz(route.lastGeneratedDate, TZ).startOf('day');
      const nextDay = lastGenerated.add(1, 'day');
      if (nextDay.isAfter(generationStart)) {
        generationStart = nextDay;
      }
    }

    console.log('Parámetros de generación:');
    console.log('   - Ruta:', route.name);
    console.log('   - Días de semana:', daysOfWeek);
    console.log('   - Horizonte:', horizonDays, 'días');
    console.log('   - Generar desde:', generationStart.format('YYYY-MM-DD'));
    console.log('   - Generar hasta:', generationEnd.format('YYYY-MM-DD'));

    if (generationStart.isAfter(generationEnd)) {
      console.log('✅ No hay servicios por generar - ya está actualizado');
      return [];
    }

    const createdServices = [];
    const totalDays = generationEnd.diff(generationStart, 'day') + 1;

    for (let i = 0; i < totalDays; i++) {
      const currentLocalDate = generationStart.add(i, 'day');
      const dayOfWeek = currentLocalDate.isoWeekday();

      if (!daysOfWeek.includes(dayOfWeek)) continue;
      if (hasException(route, currentLocalDate)) continue;

      if (route.schedule.endDate && !isNaN(new Date(route.schedule.endDate).getTime())) {
        const endDate = dayjs.tz(route.schedule.endDate, TZ).endOf('day');
        if (currentLocalDate.isAfter(endDate)) continue;
      }

      try {
        const service = await createServiceInstance(route, currentLocalDate);
        createdServices.push(service);
      } catch (error) {
        console.error('Error creando servicio:', error.message);
      }
    }

    if (createdServices.length > 0) {
      await RouteMaster.findByIdAndUpdate(route._id, {
        lastGeneratedDate: generationEnd.toDate()
      });
    }

    console.log(`✅ Generación completada: ${createdServices.length} servicios creados`);
    return createdServices;

  } catch (error) {
    console.error('Error crítico en generateServicesForRoute:', error);
    throw error;
  }
}

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
    return false;
  }
}

async function createServiceInstance(route, currentLocalDate) {
  try {
    if (!currentLocalDate || !currentLocalDate.tz) {
      currentLocalDate = dayjs.tz(currentLocalDate, TZ).startOf('day');
    }

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
      date: baseDeparture.toDate()
    });

    if (existingService) {
      return existingService;
    }

    const stops = Array.isArray(route.stops) ? route.stops : [];
    const departureTimes = [];

    if (route.origin && typeof route.origin === 'object') {
      departureTimes.push({
        order: 0,
        stop: route.origin.name,
        time: baseDeparture.toDate(),
        price: 0
      });
    }

    stops.forEach(stop => {
      if (stop.city && typeof stop.city === 'object') {
        const offset = Number(stop.offsetMinutes) || 0;
        const stopTime = baseDeparture.add(offset, 'minute');
        departureTimes.push({
          order: stop.order,
          stop: stop.city.name,
          time: stopTime.toDate(),
          price: stop.price != null ? Number(stop.price) : 0
        });
      }
    });

    if (route.destination && typeof route.destination === 'object') {
      const destinationTime = baseDeparture.add(route.durationMinutes || 0, 'minute');
      departureTimes.push({
        order: stops.length + 1,
        stop: route.destination.name,
        time: destinationTime.toDate(),
        price: 0
      });
    }

    departureTimes.sort((a, b) => a.order - b.order);

    const service = new Service({
      routeMaster: route._id,
      date: baseDeparture.toDate(),
      origin: route.origin.name,
      destination: route.destination.name,
      layout: route.layout,
      departures: departureTimes,
    });

    await service.save();

    const seats = await createSeatsForService(service, route.layout);
    service.seats = seats.map(s => s._id);
    await service.save();

    return service;

  } catch (error) {
    console.error('Error en createServiceInstance:', error);
    throw error;
  }
}

async function createSeatsForService(service, layout) {
  try {
    if (!layout) {
      console.log('⚠️ Layout no disponible, no se crearán asientos');
      return [];
    }

    const seats = [];

    if (layout.floor1 && Array.isArray(layout.floor1.seatMap)) {
      layout.floor1.seatMap.forEach(row => {
        row.forEach(code => {
          if (code && code.trim() !== '') {
            seats.push({
              service: service._id,
              code: code.trim(),
              floor: 1,
              type: layout.tipo_Asiento_piso_1 || 'standard',
              isAvailable: true
            });
          }
        });
      });
    }

    if (layout.floor2 && Array.isArray(layout.floor2.seatMap)) {
      layout.floor2.seatMap.forEach(row => {
        row.forEach(code => {
          if (code && code.trim() !== '') {
            seats.push({
              service: service._id,
              code: code.trim(),
              floor: 2,
              type: layout.tipo_Asiento_piso_2 || 'standard',
              isAvailable: true
            });
          }
        });
      });
    }

    if (seats.length > 0) {
      const createdSeats = await Seat.insertMany(seats);
      return createdSeats;
    }

    return [];
  } catch (error) {
    console.error('Error creando asientos:', error);
    return [];
  }
}

async function generateAllServices() {
  try {
    console.log('🚀 Iniciando generación de servicios para todas las rutas...');

    const routes = await RouteMaster.find({ 'schedule.active': true })
      .populate('origin')
      .populate('destination')
      .populate('stops.city')
      .populate('layout');

    const allCreatedServices = [];

    for (const route of routes) {
      try {
        const services = await generateServicesForRoute(route);
        allCreatedServices.push(...services);
      } catch (error) {
        console.error(`Error generando servicios para ruta ${route.name}:`, error.message);
      }
    }

    console.log(`🎉 Generación completada: ${allCreatedServices.length} servicios creados en total`);
    return allCreatedServices;

  } catch (error) {
    console.error('Error en generateAllServices:', error);
    throw error;
  }
}

module.exports = {
  generateServicesForRoute,
  createServiceInstance,
  generateAllServices
};