import axios from "axios";

// Split API bases: Geo/Alerts (FastAPI) and EFIR/Admin (Node)
const GEO_API_BASE_URL = process.env.REACT_APP_GEO_API_BASE_URL || "http://localhost:8000/api/v1";
const NODE_API_BASE_URL = process.env.REACT_APP_NODE_API_BASE_URL || "http://localhost:5000";

export const geoApi = axios.create({ baseURL: GEO_API_BASE_URL });
export const nodeApi = axios.create({ baseURL: NODE_API_BASE_URL });

const attachAuth = (config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Optional helper kept for compatibility with main
export const createEfir = async (efirData) => {
  try {
    const response = await nodeApi.post('/efir', {
      filedBy: efirData.filedBy,
      description: efirData.description,
      phone: efirData.phone,
      useRandomLocation: true
    });
    return response.data;
  } catch (error) {
    console.error('Error creating EFIR:', error);
    throw error;
  }
};

geoApi.interceptors.request.use(attachAuth);
nodeApi.interceptors.request.use(attachAuth);

export const endpointsGeo = {
  alerts: "/alerts",
  nearestStations: (lat, lng, limit = 5) => `/police_stations/nearest?latitude=${lat}&longitude=${lng}&limit=${limit}`,
  assignAlert: (alertId, stationId) => `/alerts/${alertId}/assign?station_id=${stationId}`,
};

export const endpointsNode = {
  efirPending: "/efir/pending",
  efirVerify: (id) => `/efir/verify/${id}`,
  assignAlert: (alertId) => `/alerts/${alertId}/assign`,
};

export default { geoApi, nodeApi, endpointsGeo, endpointsNode };


