// Constants for API endpoints

export const API = {
  SHOP: {
    CREATE: '/api/shops',
    GET_ALL: '/api/shops',
    GET_BY_ID: id => `/api/shops/${id}`,
    UPDATE: id => `/api/shops/${id}`,
    DELETE: id => `/api/shops/${id}`
  },
  LOCATION: {
    TYPES: '/api/locations/types',
    CREATE_TYPE: '/api/locations/types',
    CREATE: '/api/locations',
    GET_ALL: '/api/locations',
    GET_BY_TYPE: typeId => `/api/locations/type/${typeId}`,
    GET_BY_ID: id => `/api/locations/${id}`,
    UPDATE: id => `/api/locations/${id}`,
    DELETE: id => `/api/locations/${id}`,
    UPDATE_TYPE: id => `/api/locations/types/${id}`
  }
}
