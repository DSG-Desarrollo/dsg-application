
// en
import enCommon from './en/common.json';
import enAuth from './en/auth.json';
import enVehicles from './en/workOrder.json';
import enTicket from './en/ticket.json';

// es
import esCommon from './es/common.json';
import esAuth from './es/auth.json';
import esVehicles from './es/workOrder.json';
import esTicket from './es/ticket.json';

// es-LA
import esLACommon from './es-LA/common.json';
import esLAAuth from './es-LA/auth.json';
import esLAVehicles from './es-LA/workOrder.json';
import esLATicket from './es-LA/ticket.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    vehicles: enVehicles,
    ticket: enTicket,
  },

  es: {
    common: esCommon,
    auth: esAuth,
    vehicles: esVehicles,
    ticket: esTicket,
  },

  'es-LA': {
    common: esLACommon,
    auth: esLAAuth,
    vehicles: esLAVehicles,
    ticket: esLATicket,
  },
};

export default resources;