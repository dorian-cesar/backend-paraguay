const { DateTime } = require('luxon');

const ZONA_CHILE = 'America/Santiago';

function validDate(now) {
    const dt = now
        ? (DateTime.isDateTime(now) ? now : DateTime.fromJSDate(now)).setZone(ZONA_CHILE)
        : DateTime.now().setZone(ZONA_CHILE);
    return dt.day >= 21;
}

module.exports = { ZONA_CHILE, validDate };
