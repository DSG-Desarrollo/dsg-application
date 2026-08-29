'use strict';

import Constants from 'expo-constants';
import FetchManager from '@managers/FetchManager.js';

const BASE_URL = Constants.expoConfig.extra.wsERPURL;
const api = new FetchManager(`${BASE_URL}/api`);

// Listado las órdenes de trabajo asociadas a una tarea
async function getWorkOrdersByTaskId(id) {
    return api.get(`work-orders/${id}`);
}

export default {
    getWorkOrdersByTaskId,
};