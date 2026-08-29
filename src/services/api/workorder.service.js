'use strict';

import Constants from 'expo-constants';
import FetchManager from '@managers/FetchManager.js';
import { HTTP_CODES } from '@constants';

const { OK, CREATED, BAD_REQUEST, NOT_FOUND } = HTTP_CODES;
const BASE_URL = Constants.expoConfig.extra.wsERPURL;

const api = new FetchManager(`${BASE_URL}/api`);

async function getWorkOrdersByTaskId(id) {
    return api.get(`work-orders/${id}`);
}

export default {
    getWorkOrdersByTaskId,
};