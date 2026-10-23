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

/** Configure this service with the application's Apollo Client. */
export function configureLocationClient(
  client: AppSyncClient,
): void {
  locationClient = client;
  console.log('[LocationService] Apollo client configured:', Boolean(locationClient));
}

function getLocationClient(): AppSyncClient {
  console.log('[LocationService] Client configured:', Boolean(locationClient));

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
   VALIDATION AND NORMALIZATION
============================================================ */

function isValidCoordinates(
  latitude: number,
  longitude: number,
): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function clean(value?: string | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

function firstNonEmpty(
  ...values: Array<string | null | undefined>
): string {
  for (const value of values) {
    const normalized = clean(value);
    if (normalized) return normalized;
  }
  return '';
}

function isAddressSuggestion(
  value: unknown,
): value is AddressSuggestion {
  if (!value || typeof value !== 'object') return false;

  const item = value as Record<string, unknown>;
  return (
    typeof item.placeId === 'string' &&
    item.placeId.trim().length > 0 &&
    typeof item.description === 'string' &&
    item.description.trim().length > 0
  );
}

function isGooglePlace(value: unknown): value is GooglePlace {
  if (!value || typeof value !== 'object') return false;

  const place = value as Record<string, unknown>;
  const latitude = Number(place.latitude);
  const longitude = Number(place.longitude);

  return (
    typeof place.formattedAddress === 'string' &&
    place.formattedAddress.trim().length > 0 &&
    place.latitude !== null &&
    place.latitude !== undefined &&
    place.longitude !== null &&
    place.longitude !== undefined &&
    isValidCoordinates(latitude, longitude)
  );
}

/** Accept only valid six-digit Indian PIN codes. */
function normalizePincode(value?: string | null): string {
  const candidate = clean(value);
  return /^[1-9]\d{5}$/.test(candidate) ? candidate : '';
}

/** Use the formatted address as a fallback only when it contains exactly one standalone six-digit number. */
function extractPincodeFromAddress(
  formattedAddress?: string | null,
): string {
  if (!formattedAddress) return '';

  const matches = formattedAddress.match(/\b[1-9]\d{5}\b/g);
  return matches?.length === 1 ? normalizePincode(matches[0]) : '';
}

function normalizePlacePincode(place: GooglePlace): string {
  return (
    normalizePincode(place.pincode) ||
    extractPincodeFromAddress(place.formattedAddress)
  );
}

function buildAddressLine(place: GooglePlace): string {
  return firstNonEmpty(place.addressLine, place.formattedAddress);
}

function normalizeGooglePlace(
  place: GooglePlace,
  fallbackPlaceId?: string,
): GooglePlace {
  const formattedAddress = clean(place.formattedAddress);

  return {
    placeId: firstNonEmpty(place.placeId, fallbackPlaceId) || null,
    formattedAddress,
    addressLine: buildAddressLine({ ...place, formattedAddress }),
    city: clean(place.city),
    state: clean(place.state),
    pincode: normalizePlacePincode({ ...place, formattedAddress }),
    country: clean(place.country),
    latitude: Number(place.latitude),
    longitude: Number(place.longitude),
  };
}

/* ============================================================
   ADDRESS AUTOCOMPLETE
============================================================ */

export async function searchAddress(
  query: string,
): Promise<AddressSuggestion[]> {
  const input = clean(query);

  if (input.length < 3 || input.length > 200) return [];

  try {
    const client = getLocationClient();
    const { data } = await client.query({
      query: ADDRESS_SUGGESTIONS,
      variables: { input },
      fetchPolicy: 'no-cache',
    });

    console.log('[LocationService] Address suggestions response:',
      JSON.stringify(data?.addressSuggestions, null, 2));

    const suggestions = data?.addressSuggestions;
    if (!Array.isArray(suggestions)) return [];

    return suggestions
      .filter(isAddressSuggestion)
      .map((suggestion) => ({
        placeId: suggestion.placeId.trim(),
        description: suggestion.description.trim(),
      }))
      .filter((suggestion) => suggestion.placeId.length > 0 && suggestion.description.length > 0);
  } catch (error) {
    console.error('[LocationService] Address autocomplete error:', error);
    return [];
  }
}

/* ============================================================
   PLACE DETAILS
============================================================ */

export async function getPlaceDetails(
  placeId: string,
): Promise<GooglePlace | null> {
  const id = clean(placeId);
  if (!id) {
    console.error('[LocationService] getPlaceDetails called with an empty placeId.');
    return null;
  }

  try {
    const client = getLocationClient();
    console.log('[LocationService] Requesting place details for placeId:', id);

    const { data } = await client.query({
      query: PLACE_DETAILS,
      variables: { placeId: id },
      fetchPolicy: 'no-cache',
    });

    const place: unknown = data?.placeDetails;

    // Diagnostic output: check whether the API actually returns coordinates.
    console.log(
      '[PlaceDetails] Raw GraphQL response:',
      JSON.stringify(place, null, 2),
    );

    if (place && typeof place === 'object') {
      const p = place as Record<string, unknown>;
      console.log('[PlaceDetails] Coordinates and types:', {
        latitude: p.latitude,
        latitudeType: typeof p.latitude,
        longitude: p.longitude,
        longitudeType: typeof p.longitude,
      });
    }

    if (!isGooglePlace(place)) {
      console.error(
        '[PlaceDetails] Invalid place data; expected formattedAddress and valid latitude/longitude:',
        JSON.stringify(place, null, 2),
      );
      return null;
    }

    const normalized = normalizeGooglePlace(place, id);
    console.log('[PlaceDetails] Normalized place:', JSON.stringify(normalized, null, 2));
    return normalized;
  } catch (error) {
    console.error('[LocationService] Place details error:', error);
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
    console.warn('[LocationService] Invalid coordinates for reverse geocoding:', {
      latitude,
      longitude,
    });
    return null;
  }

  try {
    const client = getLocationClient();
    const { data } = await client.query({
      query: REVERSE_GEOCODE,
      variables: { latitude, longitude },
      fetchPolicy: 'no-cache',
    });

    const response = data?.reverseGeocode;
    console.log('[LocationService] Reverse geocode response:', JSON.stringify(response, null, 2));

    if (response?.success !== true || !isGooglePlace(response?.place)) {
      console.warn(
        '[LocationService] Reverse geocoding returned no valid address:',
        response?.message,
      );
      return null;
    }

    const place = normalizeGooglePlace(response.place);
    const pincode = normalizePlacePincode(place);
    const addressLine = buildAddressLine(place);

    const address: Record<string, string> = {
      house_number: '',
      building: '',
      road: addressLine,
      neighbourhood: '',
      suburb: '',
      quarter: '',
      residential: '',
      locality: '',
      city_district: '',
      city: clean(place.city),
      town: '',
      village: '',
      municipality: '',
      county: '',
      state: clean(place.state),
      postcode: pincode,
      pincode,
      country: clean(place.country),
    };

    return {
      formatted_address: place.formattedAddress,
      display_name: place.formattedAddress,
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
    console.error('[LocationService] Reverse geocode error:', error);
    return null;
  }
}
