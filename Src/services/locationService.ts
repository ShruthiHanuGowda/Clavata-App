import axios from 'axios';

export const searchAddress = async (
  query: string,
) => {
  try {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return [];
    }

    const response = await axios.get(
      'https://nominatim.openstreetmap.org/search',
      {
        params: {
          q: trimmedQuery,
          format: 'jsonv2',
          addressdetails: 1,
          limit: 5,
          countrycodes: 'in',
        },
        headers: {
          'User-Agent': 'ClavataSalonApp/1.0',
        },
      },
    );

    return response.data || [];
  } catch (error) {
    console.log(
      'Address Search Error:',
      error,
    );

    return [];
  }
};

export const reverseGeocode = async (
  latitude: number,
  longitude: number,
) => {
  try {
    const response = await axios.get(
      'https://nominatim.openstreetmap.org/reverse',
      {
        params: {
          format: 'jsonv2',
          lat: latitude,
          lon: longitude,
        },
        headers: {
          'User-Agent': 'NexSalonApp',
        },
      },
    );

    return response.data;
  } catch (error) {
    console.log('Reverse Geocode Error:', error);
    return null;
  }
};