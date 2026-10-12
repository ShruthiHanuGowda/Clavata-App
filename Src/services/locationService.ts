import axios from 'axios';

const NOMINATIM_BASE_URL =
  'https://nominatim.openstreetmap.org';

const NOMINATIM_HEADERS = {
  'User-Agent': 'ClavataSalonApp/1.0',
  Accept: 'application/json',
};

export const searchAddress = async (
  query: string,
) => {
  try {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return [];
    }

    const response = await axios.get(
      `${NOMINATIM_BASE_URL}/search`,
      {
        params: {
          q: trimmedQuery,
          format: 'jsonv2',
          addressdetails: 1,
          limit: 5,
          countrycodes: 'in',
        },
        headers: NOMINATIM_HEADERS,
        timeout: 15000,
      },
    );

    return Array.isArray(response.data)
      ? response.data
      : [];
  } catch (error) {
    console.error('Address Search Error:', error);
    return [];
  }
};

export const reverseGeocode = async (
  latitude: number,
  longitude: number,
) => {
  try {
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      console.warn('Invalid coordinates for reverse geocoding');
      return null;
    }

    const response = await axios.get(
      `${NOMINATIM_BASE_URL}/reverse`,
      {
        params: {
          format: 'jsonv2',
          lat: latitude,
          lon: longitude,
          addressdetails: 1,
        },
        headers: NOMINATIM_HEADERS,
        timeout: 15000,
      },
    );

    return response.data ?? null;
  } catch (error) {
    console.error('Reverse Geocode Error:', error);
    return null;
  }
};
