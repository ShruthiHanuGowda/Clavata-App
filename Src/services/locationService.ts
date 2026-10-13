import {
  ApolloClient,
  NormalizedCacheObject,
  gql,
} from '@apollo/client';

/* ============================================================
   TYPES
============================================================ */

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type AddressSuggestion = {
  placeId: string;
  description: string;
};

export type GooglePlace = {
  placeId?: string | null;
  formattedAddress: string;
  addressLine?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country?: string | null;
  latitude: number;
  longitude: number;
};

export type GoogleAddress = {
  formatted_address?: string;
  display_name?: string;
  address?: Record<string, string>;
  address_components?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
};

/* ============================================================
   APOLLO CLIENT
============================================================ */

type AppSyncClient = ApolloClient<NormalizedCacheObject>;

let locationClient: AppSyncClient | null = null;

export function configureLocationClient(
  client: AppSyncClient,
): void {
  locationClient = client;
}

function getLocationClient(): AppSyncClient {
  if (!locationClient) {
    throw new Error(
      'Location service is not configured. ' +
        'Call configureLocationClient() with your Apollo Client.',
    );
  }

  return locationClient;
}

/* ============================================================
   GRAPHQL QUERIES
============================================================ */

const ADDRESS_SUGGESTIONS = gql`
  query AddressSuggestions($input: String!) {
    addressSuggestions(input: $input) {
      placeId
      description
    }
  }
`;

const PLACE_DETAILS = gql`
  query PlaceDetails($placeId: String!) {
    placeDetails(placeId: $placeId) {
      placeId
      formattedAddress
      addressLine
      city
      state
      pincode
      country
      latitude
      longitude
    }
  }
`;

const REVERSE_GEOCODE = gql`
  query ReverseGeocode(
    $latitude: Float!
    $longitude: Float!
  ) {
    reverseGeocode(
      latitude: $latitude
      longitude: $longitude
    ) {
      success
      message
      place {
        placeId
        formattedAddress
        addressLine
        city
        state
        pincode
        country
        latitude
        longitude
      }
    }
  }
`;

/* ============================================================
   VALIDATION
============================================================ */

const isValidCoordinates = (
  latitude: number,
  longitude: number,
): boolean =>
  Number.isFinite(latitude) &&
  Number.isFinite(longitude) &&
  latitude >= -90 &&
  latitude <= 90 &&
  longitude >= -180 &&
  longitude <= 180;

function isAddressSuggestion(
  value: unknown,
): value is AddressSuggestion {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.placeId === 'string' &&
    typeof item.description === 'string'
  );
}

function isGooglePlace(
  value: unknown,
): value is GooglePlace {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const place = value as Record<string, unknown>;

  return (
    typeof place.formattedAddress === 'string' &&
    typeof place.latitude === 'number' &&
    Number.isFinite(place.latitude) &&
    typeof place.longitude === 'number' &&
    Number.isFinite(place.longitude)
  );
}

/**
 * Accept only a valid six-digit Indian PIN code.
 * Google may return null, empty strings, or non-postal text.
 */
function normalizePincode(value?: string | null): string {
  const candidate = (value ?? '').trim();
  return /^[1-9]\d{5}$/.test(candidate) ? candidate : '';
}

/**
 * Fallback only: look for a standalone six-digit PIN in the
 * formatted address. This cannot guarantee that the number
 * is a postal code, so prefer the backend's pincode field.
 */
function extractPincodeFromAddress(
  formattedAddress?: string | null,
): string {
  if (!formattedAddress) {
    return '';
  }

  const matches = formattedAddress.match(/\b[1-9]\d{5}\b/g);

  return matches?.length === 1
    ? normalizePincode(matches[0])
    : '';
}

/* ============================================================
   ADDRESS AUTOCOMPLETE
============================================================ */

export async function searchAddress(
  query: string,
): Promise<AddressSuggestion[]> {
  const input = query.trim();

  if (input.length < 3 || input.length > 200) {
    return [];
  }

  try {
    const client = getLocationClient();

    const { data } = await client.query({
      query: ADDRESS_SUGGESTIONS,
      variables: { input },
      fetchPolicy: 'no-cache',
    });

    const suggestions = data?.addressSuggestions;

    if (!Array.isArray(suggestions)) {
      return [];
    }

    return suggestions.filter(isAddressSuggestion);
  } catch (error) {
    console.error('Address autocomplete error:', error);
    return [];
  }
}

/* ============================================================
   PLACE DETAILS
============================================================ */

export async function getPlaceDetails(
  placeId: string,
): Promise<GooglePlace | null> {
  const id = placeId.trim();

  if (!id) {
    return null;
  }

  try {
    const client = getLocationClient();

    const { data } = await client.query({
      query: PLACE_DETAILS,
      variables: { placeId: id },
      fetchPolicy: 'no-cache',
    });

    const place = data?.placeDetails;

    if (!isGooglePlace(place)) {
      console.warn('Place details returned incomplete data.');
      return null;
    }

    const backendPincode = normalizePincode(place.pincode);
    const fallbackPincode = extractPincodeFromAddress(
      place.formattedAddress,
    );

    return {
      ...place,
      pincode: backendPincode || fallbackPincode,
    };
  } catch (error) {
    console.error('Place details error:', error);
    return null;
  }
}

/* ============================================================
   REVERSE GEOCODING
============================================================ */

export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<GoogleAddress | null> {
  if (!isValidCoordinates(latitude, longitude)) {
    console.warn('Invalid coordinates for reverse geocoding.');
    return null;
  }

  try {
    const client = getLocationClient();

    const { data } = await client.query({
      query: REVERSE_GEOCODE,
      variables: {
        latitude,
        longitude,
      },
      fetchPolicy: 'no-cache',
    });

    const response = data?.reverseGeocode;

    if (response?.success !== true || !response?.place) {
      console.warn(
        'Reverse geocoding returned no address:',
        response?.message,
      );
      return null;
    }

    const place = response.place as GooglePlace;

    const pincode =
      normalizePincode(place.pincode) ||
      extractPincodeFromAddress(place.formattedAddress);

    const address: Record<string, string> = {
      house_number: '',
      road: place.addressLine || '',
      neighbourhood: '',
      suburb: '',
      city: place.city || '',
      town: '',
      village: '',
      municipality: '',
      county: '',
      state: place.state || '',
      postcode: pincode,
      pincode,
      country: place.country || '',
    };

    return {
      formatted_address: place.formattedAddress || '',
      display_name: place.formattedAddress || '',
      address,
      address_components: [],
      geometry: {
        location: {
          lat: place.latitude,
          lng: place.longitude,
        },
      },
    };
  } catch (error) {
    console.error('Reverse geocode error:', error);
    return null;
  }
}
