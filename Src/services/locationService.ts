import axios from 'axios';

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