import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import AppGradient from '../../common/AppGradient';
import { FONTS, GRADIENTS } from '../../constants/constants';
import { useSalonRegistration } from '../../context/SalonRegistrationContext';
import {
  getPlaceDetails,
  reverseGeocode,
  searchAddress,
  Coordinates,
  AddressSuggestion,
} from '../../services/locationService';
import { Header } from '../../components';

/* ============================================================
   TYPES
============================================================ */

type AddressFields = {
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
};

type RegistrationData = Record<string, any>;

type DropdownType = 'state' | 'city' | null;

type Props = {
  navigation: {
    navigate: (
      screen: string,
      params?: Record<string, any>,
    ) => void;
    goBack?: () => void;
  };
  route?: {
    params?: {
      registrationData?: RegistrationData;
      initialStep?: number;
      completedSteps?: number[];
      resumeDraft?: boolean;
    };
  };
};

/* ============================================================
   CONFIGURATION
============================================================ */

const NEXT_REGISTRATION_ROUTE = 'SalonBusinessHours';

const CURRENT_STEP = 2;
const NEXT_STEP = 3;
const TOTAL_STEPS = 6;

const DEFAULT_COORDINATES: Coordinates = {
  latitude: 12.9716,
  longitude: 77.5946,
};

const DEFAULT_REGION: Region = {
  ...DEFAULT_COORDINATES,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

const COLORS = {
  primary: '#7652D8',
  primaryDark: '#5B3BB5',
  background: '#F8F6FC',
  surface: '#FFFFFF',
  text: '#242033',
  secondaryText: '#777184',
  border: '#E8E2F0',
  placeholder: '#A7A1B2',
  error: '#D64545',
  success: '#21865B',
  lightPurple: '#F0EAFE',
  white: '#FFFFFF',
};

/* ============================================================
   INDIAN STATES AND UNION TERRITORIES
============================================================ */

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

/* ============================================================
   CITIES BY STATE / UNION TERRITORY
============================================================ */

const CITIES_BY_STATE: Record<string, string[]> = {
  'Andhra Pradesh': [
    'Amaravati', 'Anantapur', 'Chittoor', 'Eluru', 'Guntur',
    'Kadapa', 'Kakinada', 'Kurnool', 'Machilipatnam', 'Nandyal',
    'Nellore', 'Ongole', 'Rajahmundry', 'Tirupati', 'Vijayawada',
    'Visakhapatnam', 'Vizianagaram',
  ],
  'Arunachal Pradesh': [
    'Anini', 'Bomdila', 'Itanagar', 'Naharlagun', 'Pasighat',
    'Roing', 'Tawang', 'Tezu', 'Ziro',
  ],
  Assam: [
    'Barpeta', 'Bongaigaon', 'Dibrugarh', 'Diphu', 'Goalpara',
    'Golaghat', 'Guwahati', 'Jorhat', 'Karimganj', 'Lakhimpur',
    'Nagaon', 'Silchar', 'Sivasagar', 'Tezpur', 'Tinsukia',
  ],
  Bihar: [
    'Arrah', 'Aurangabad', 'Begusarai', 'Bhagalpur', 'Bihar Sharif',
    'Buxar', 'Darbhanga', 'Gaya', 'Hajipur', 'Katihar', 'Madhubani',
    'Motihari', 'Muzaffarpur', 'Patna', 'Purnia', 'Saharsa',
    'Samastipur', 'Sitamarhi', 'Siwan',
  ],
  Chhattisgarh: [
    'Ambikapur', 'Bhilai', 'Bilaspur', 'Dhamtari', 'Durg',
    'Jagdalpur', 'Korba', 'Raigarh', 'Raipur', 'Rajnandgaon',
  ],
  Goa: [
    'Bicholim', 'Canacona', 'Mapusa', 'Margao', 'Panaji',
    'Ponda', 'Porvorim', 'Quepem', 'Sanguem', 'Vasco da Gama',
  ],
  Gujarat: [
    'Ahmedabad', 'Anand', 'Bharuch', 'Bhavnagar', 'Bhuj',
    'Gandhinagar', 'Godhra', 'Jamnagar', 'Junagadh', 'Mehsana',
    'Morbi', 'Nadiad', 'Navsari', 'Porbandar', 'Rajkot', 'Surat',
    'Surendranagar', 'Vadodara', 'Valsad', 'Vapi',
  ],
  Haryana: [
    'Ambala', 'Bahadurgarh', 'Bhiwani', 'Faridabad', 'Gurugram',
    'Hisar', 'Jind', 'Kaithal', 'Karnal', 'Kurukshetra',
    'Panipat', 'Rewari', 'Rohtak', 'Sirsa', 'Sonipat', 'Yamunanagar',
  ],
  'Himachal Pradesh': [
    'Baddi', 'Bilaspur', 'Chamba', 'Dharamshala', 'Hamirpur',
    'Kullu', 'Mandi', 'Manali', 'Shimla', 'Solan', 'Una',
  ],
  Jharkhand: [
    'Bokaro', 'Chaibasa', 'Deoghar', 'Dhanbad', 'Dumka',
    'Giridih', 'Hazaribagh', 'Jamshedpur', 'Medininagar', 'Ranchi',
  ],
  Karnataka: [
    'Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru', 'Bidar',
    'Bijapur', 'Chikkamagaluru', 'Chitradurga', 'Davangere',
    'Dharwad', 'Gadag', 'Hassan', 'Haveri', 'Kalaburagi',
    'Karwar', 'Kodagu', 'Kolar', 'Koppal', 'Madikeri', 'Mandya',
    'Mangaluru', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga',
    'Tumakuru', 'Udupi', 'Vijayapura', 'Yadgir',
  ],
  Kerala: [
    'Alappuzha', 'Ernakulam', 'Kannur', 'Kasaragod', 'Kochi',
    'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad',
    'Pathanamthitta', 'Thalassery', 'Thiruvananthapuram',
    'Thrissur', 'Wayanad',
  ],
  'Madhya Pradesh': [
    'Bhopal', 'Burhanpur', 'Chhindwara', 'Dewas', 'Gwalior',
    'Indore', 'Jabalpur', 'Katni', 'Khandwa', 'Morena',
    'Ratlam', 'Rewa', 'Sagar', 'Satna', 'Ujjain', 'Vidisha',
  ],
  Maharashtra: [
    'Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Chandrapur',
    'Dhule', 'Jalgaon', 'Kolhapur', 'Latur', 'Mumbai', 'Nagpur',
    'Nanded', 'Nashik', 'Navi Mumbai', 'Panvel', 'Pune',
    'Ratnagiri', 'Sangli', 'Satara', 'Solapur', 'Thane', 'Vasai-Virar',
  ],
  Manipur: [
    'Bishnupur', 'Churachandpur', 'Imphal', 'Kakching',
    'Senapati', 'Thoubal', 'Ukhrul',
  ],
  Meghalaya: [
    'Baghmara', 'Jowai', 'Nongpoh', 'Shillong', 'Tura',
    'Williamnagar',
  ],
  Mizoram: [
    'Aizawl', 'Champhai', 'Kolasib', 'Lawngtlai', 'Lunglei',
    'Mamit', 'Saiha', 'Serchhip',
  ],
  Nagaland: [
    'Dimapur', 'Kiphire', 'Kohima', 'Longleng', 'Mokokchung',
    'Mon', 'Phek', 'Tuensang', 'Wokha', 'Zunheboto',
  ],
  Odisha: [
    'Angul', 'Balasore', 'Baripada', 'Berhampur', 'Bhadrak',
    'Bhubaneswar', 'Cuttack', 'Dhenkanal', 'Jharsuguda', 'Puri',
    'Rourkela', 'Sambalpur',
  ],
  Punjab: [
    'Amritsar', 'Bathinda', 'Faridkot', 'Firozpur', 'Gurdaspur',
    'Hoshiarpur', 'Jalandhar', 'Kapurthala', 'Ludhiana', 'Moga',
    'Mohali', 'Pathankot', 'Patiala', 'Rupnagar', 'Sangrur',
  ],
  Rajasthan: [
    'Ajmer', 'Alwar', 'Banswara', 'Barmer', 'Bharatpur',
    'Bhilwara', 'Bikaner', 'Bundi', 'Chittorgarh', 'Churu',
    'Jaipur', 'Jaisalmer', 'Jodhpur', 'Kota', 'Pali', 'Sikar',
    'Sri Ganganagar', 'Udaipur',
  ],
  Sikkim: [
    'Gangtok', 'Geyzing', 'Mangan', 'Namchi', 'Pakyong',
    'Rangpo', 'Singtam',
  ],
  'Tamil Nadu': [
    'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
    'Dharmapuri', 'Dindigul', 'Erode', 'Hosur', 'Kanchipuram',
    'Kanniyakumari', 'Karur', 'Madurai', 'Nagapattinam',
    'Nagercoil', 'Salem', 'Thanjavur', 'Theni', 'Thoothukudi',
    'Tiruchirappalli', 'Tirunelveli', 'Tiruppur', 'Vellore',
  ],
  Telangana: [
    'Adilabad', 'Hyderabad', 'Karimnagar', 'Khammam',
    'Mahabubnagar', 'Nalgonda', 'Nizamabad', 'Ramagundam',
    'Siddipet', 'Suryapet', 'Warangal',
  ],
  Tripura: [
    'Agartala', 'Ambassa', 'Belonia', 'Dharmanagar',
    'Kailashahar', 'Khowai', 'Udaipur',
  ],
  'Uttar Pradesh': [
    'Agra', 'Aligarh', 'Ayodhya', 'Bareilly', 'Etawah',
    'Firozabad', 'Ghaziabad', 'Gorakhpur', 'Jhansi', 'Kanpur',
    'Lucknow', 'Mathura', 'Meerut', 'Moradabad', 'Noida',
    'Prayagraj', 'Saharanpur', 'Shahjahanpur', 'Varanasi',
  ],
  Uttarakhand: [
    'Almora', 'Dehradun', 'Haldwani', 'Haridwar', 'Kashipur',
    'Mussoorie', 'Nainital', 'Pithoragarh', 'Rishikesh',
    'Roorkee', 'Rudrapur',
  ],
  'West Bengal': [
    'Asansol', 'Bardhaman', 'Berhampore', 'Durgapur', 'Howrah',
    'Jalpaiguri', 'Kharagpur', 'Kolkata', 'Malda', 'Siliguri',
  ],
  'Andaman and Nicobar Islands': [
    'Car Nicobar', 'Diglipur', 'Mayabunder', 'Port Blair', 'Rangat',
  ],
  Chandigarh: ['Chandigarh'],
  'Dadra and Nagar Haveli and Daman and Diu': [
    'Daman', 'Diu', 'Silvassa',
  ],
  Delhi: ['Delhi', 'New Delhi'],
  'Jammu and Kashmir': [
    'Anantnag', 'Baramulla', 'Doda', 'Jammu', 'Kathua',
    'Pulwama', 'Sopore', 'Srinagar', 'Udhampur',
  ],
  Ladakh: ['Kargil', 'Leh'],
  Lakshadweep: ['Agatti', 'Andrott', 'Kavaratti', 'Minicoy'],
  Puducherry: ['Karaikal', 'Mahe', 'Puducherry', 'Yanam'],
};

/* ============================================================
   HELPERS
============================================================ */

const clean = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

const findIndianState = (value: string): string => {
  const normalized = clean(value).toLowerCase();

  if (!normalized) return '';

  const aliases: Record<string, string> = {
    'nct of delhi': 'Delhi',
    'national capital territory of delhi': 'Delhi',
    'jammu & kashmir': 'Jammu and Kashmir',
    'jammu and kashmir': 'Jammu and Kashmir',
    orissa: 'Odisha',
    pondicherry: 'Puducherry',
    'dadra and nagar haveli':
      'Dadra and Nagar Haveli and Daman and Diu',
    'daman and diu':
      'Dadra and Nagar Haveli and Daman and Diu',
  };

  return (
    aliases[normalized] ??
    INDIAN_STATES.find(
      item => item.toLowerCase() === normalized,
    ) ??
    ''
  );
};

const findIndianCity = (
  stateValue: string,
  cityValue: string,
): string => {
  const normalizedCity = clean(cityValue).toLowerCase();

  if (!stateValue || !normalizedCity) return '';

  return (
    (CITIES_BY_STATE[stateValue] ?? []).find(
      item => item.toLowerCase() === normalizedCity,
    ) ?? ''
  );
};

const isValidCoordinates = (
  coordinates: Coordinates | null | undefined,
): boolean => {
  if (!coordinates) return false;

  return (
    Number.isFinite(coordinates.latitude) &&
    Number.isFinite(coordinates.longitude) &&
    coordinates.latitude >= -90 &&
    coordinates.latitude <= 90 &&
    coordinates.longitude >= -180 &&
    coordinates.longitude <= 180
  );
};

const extractCoordinates = (result: any): Coordinates | null => {
  if (!result) return null;

  const latitude = Number(
    result.latitude ??
    result.lat ??
    result.geometry?.location?.lat ??
    result.geometry?.location?.latitude,
  );

  const longitude = Number(
    result.longitude ??
    result.lng ??
    result.lon ??
    result.geometry?.location?.lng ??
    result.geometry?.location?.longitude,
  );

  const coordinates = { latitude, longitude };

  return isValidCoordinates(coordinates) ? coordinates : null;
};

const getComponentValue = (
  components: any,
  keys: string[],
): string => {
  if (Array.isArray(components)) {
    for (const key of keys) {
      const match = components.find((component: any) => {
        const types = component?.types ?? [];
        return types.includes(key) || component?.type === key;
      });

      const value = clean(
        match?.long_name ??
        match?.longName ??
        match?.name ??
        match?.value,
      );

      if (value) return value;
    }

    return '';
  }

  if (!components || typeof components !== 'object') {
    return '';
  }

  for (const key of keys) {
    const value = clean(components[key]);
    if (value) return value;
  }

  return '';
};

const extractAddressFields = (result: any): AddressFields => {
  const components =
    result?.address ??
    result?.components ??
    result?.address_components ??
    {};

  const addressLine = clean(
    result?.display_name ??
    result?.formatted_address ??
    result?.formattedAddress ??
    result?.description ??
    result?.name,
  );

  const city = getComponentValue(components, [
    'city',
    'locality',
    'town',
    'village',
    'municipality',
    'city_district',
    'administrative_area_level_2',
    'suburb',
    'county',
  ]);

  const state = getComponentValue(components, [
    'state',
    'administrative_area_level_1',
    'state_district',
    'region',
  ]);

  const pincode = getComponentValue(components, [
    'postcode',
    'postal_code',
    'postalCode',
    'pincode',
  ]);

  return { addressLine, city, state, pincode };
};

const getSavedCoordinates = (
  data: RegistrationData,
): Coordinates | null => {
  const latitude = data?.latitude;
  const longitude = data?.longitude;

  if (
    latitude === null ||
    latitude === undefined ||
    latitude === '' ||
    longitude === null ||
    longitude === undefined ||
    longitude === ''
  ) {
    return null;
  }

  const coordinates = {
    latitude: Number(latitude),
    longitude: Number(longitude),
  };

  return isValidCoordinates(coordinates) ? coordinates : null;
};

const getSuggestionDescription = (
  suggestion: AddressSuggestion,
): string => {
  const item = suggestion as any;

  return clean(
    item?.description ??
    item?.formattedAddress ??
    item?.display_name ??
    item?.name,
  );
};

const getSuggestionPlaceId = (
  suggestion: AddressSuggestion,
): string => {
  const item = suggestion as any;

  return clean(
    item?.placeId ??
    item?.place_id ??
    item?.id,
  );
};

/* ============================================================
   SCREEN
============================================================ */

const SalonAddressScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const {
    data,
    updateData,
    completedSteps,
    setCurrentStep,
    markStepCompleted,
    saveDraft,
    isDraftLoading,
    isDraftSaving,
  } = useSalonRegistration();

  const routeData = route?.params?.registrationData ?? {};

  /* FORM STATE */

  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const [activeDropdown, setActiveDropdown] =
    useState<DropdownType>(null);

  const [coordinates, setCoordinates] =
    useState<Coordinates>(DEFAULT_COORDINATES);

  const [mapRegion, setMapRegion] =
    useState<Region>(DEFAULT_REGION);

  const [searchText, setSearchText] = useState('');

  const [suggestions, setSuggestions] =
    useState<AddressSuggestion[]>([]);

  const [isSearching, setIsSearching] = useState(false);
  const [isResolvingLocation, setIsResolvingLocation] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationFound, setLocationFound] = useState(false);

  // New: controls the full-screen map.
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

  /* REFS */

  const searchTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const mountedRef = useRef(false);
  const draftRestoredRef = useRef(false);

  const searchRequestIdRef = useRef(0);
  const addressRequestIdRef = useRef(0);
  const locationRequestIdRef = useRef(0);

  const busy =
    isDraftLoading ||
    isDraftSaving ||
    isSubmitting;

  const cityOptions = state
    ? CITIES_BY_STATE[state] ?? []
    : [];

  const dropdownOptions =
    activeDropdown === 'state'
      ? INDIAN_STATES
      : activeDropdown === 'city'
        ? cityOptions
        : [];

  /* MOUNT / CLEANUP */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      searchRequestIdRef.current += 1;
      addressRequestIdRef.current += 1;
      locationRequestIdRef.current += 1;

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
  }, []);

  /* RESTORE DRAFT */

  useEffect(() => {
    if (isDraftLoading || draftRestoredRef.current) return;

    const restoredData: RegistrationData = {
      ...routeData,
      ...(data ?? {}),
    };

    const restoredAddressLine = clean(
      restoredData.addressLine,
    );

    const restoredState = findIndianState(
      clean(restoredData.state),
    );

    const restoredCity = findIndianCity(
      restoredState,
      clean(restoredData.city),
    );

    const restoredPincode = clean(restoredData.pincode);
    const restoredCoordinates = getSavedCoordinates(restoredData);

    setAddressLine(restoredAddressLine);
    setCity(restoredCity);
    setState(restoredState);
    setPincode(restoredPincode);

    if (restoredCoordinates) {
      setCoordinates(restoredCoordinates);
      setMapRegion({
        ...restoredCoordinates,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      });
      setLocationFound(true);
      setSearchText(restoredAddressLine);
    } else {
      setCoordinates(DEFAULT_COORDINATES);
      setMapRegion(DEFAULT_REGION);
      setLocationFound(false);
    }

    draftRestoredRef.current = true;
    setCurrentStep(CURRENT_STEP);
  }, [isDraftLoading, data, routeData, setCurrentStep]);

  /* APPLY A GEOCODED ADDRESS */

  const applyAddressFields = useCallback(
    (fields: AddressFields) => {
      if (fields.addressLine) {
        setAddressLine(fields.addressLine);
      }

      const matchedState = findIndianState(fields.state);

      if (matchedState) {
        setState(matchedState);

        const matchedCity = findIndianCity(
          matchedState,
          fields.city,
        );

        setCity(matchedCity || '');
      } else if (fields.city) {
        const matchedCity = findIndianCity(state, fields.city);

        if (matchedCity) setCity(matchedCity);
      }

      if (fields.pincode) {
        setPincode(
          fields.pincode.replace(/[^0-9]/g, '').slice(0, 6),
        );
      }
    },
    [state],
  );

  /* DROPDOWN SELECTION */

  const handleSelectState = useCallback((selectedState: string) => {
    setState(selectedState);
    setCity('');
    setActiveDropdown(null);
  }, []);

  const handleSelectCity = useCallback((selectedCity: string) => {
    setCity(selectedCity);
    setActiveDropdown(null);
  }, []);

  /* RESOLVE ADDRESS FROM COORDINATES */

  const resolveAddressFromCoordinates = useCallback(
    async (
      nextCoordinates: Coordinates,
      options?: {
        showError?: boolean;
        requestId?: number;
      },
    ) => {
      if (!isValidCoordinates(nextCoordinates)) return;

      const requestId =
        options?.requestId ?? ++addressRequestIdRef.current;

      setCoordinates(nextCoordinates);
      setMapRegion(previous => ({
        ...previous,
        ...nextCoordinates,
      }));
      setLocationFound(true);
      setIsResolvingLocation(true);

      try {
        const result = await reverseGeocode(
          nextCoordinates.latitude,
          nextCoordinates.longitude,
        );

        if (
          !mountedRef.current ||
          requestId !== addressRequestIdRef.current
        ) {
          return;
        }

        if (result) {
          const fields = extractAddressFields(result);
          applyAddressFields(fields);

          if (fields.addressLine) {
            setSearchText(fields.addressLine);
          }
        }
      } catch (error) {
        console.warn(
          '[SalonAddressScreen] Reverse geocoding failed.',
          error,
        );

        if (
          options?.showError &&
          mountedRef.current &&
          requestId === addressRequestIdRef.current
        ) {
          Alert.alert(
            'Address unavailable',
            'We could not retrieve the address for this location. You can enter the address details manually.',
          );
        }
      } finally {
        if (
          mountedRef.current &&
          requestId === addressRequestIdRef.current
        ) {
          setIsResolvingLocation(false);
        }
      }
    },
    [applyAddressFields],
  );

  /* ADDRESS SEARCH */

  const handleSearchChange = useCallback((value: string) => {
    setSearchText(value);

    addressRequestIdRef.current += 1;
    locationRequestIdRef.current += 1;

    setIsResolvingLocation(false);
    setLocationFound(false);
    setSuggestions([]);

    searchRequestIdRef.current += 1;
    const requestId = searchRequestIdRef.current;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    if (!value.trim()) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchAddress(value.trim());

        if (
          !mountedRef.current ||
          requestId !== searchRequestIdRef.current
        ) {
          return;
        }

        setSuggestions(Array.isArray(results) ? results : []);
      } catch (error) {
        console.warn(
          '[SalonAddressScreen] Address search failed.',
          error,
        );

        if (
          mountedRef.current &&
          requestId === searchRequestIdRef.current
        ) {
          setSuggestions([]);
        }
      } finally {
        if (
          mountedRef.current &&
          requestId === searchRequestIdRef.current
        ) {
          setIsSearching(false);
        }
      }
    }, 450);
  }, []);

  /* SELECT SEARCH RESULT */

  const handleSelectSuggestion = useCallback(
    async (suggestion: AddressSuggestion) => {
      Keyboard.dismiss();

      const placeId = getSuggestionPlaceId(suggestion);
      const description = getSuggestionDescription(suggestion);

      if (!placeId) {
        Alert.alert(
          'Location unavailable',
          'This search result does not contain a valid place identifier. Please choose another result.',
        );
        return;
      }

      searchRequestIdRef.current += 1;
      locationRequestIdRef.current += 1;

      const requestId = ++addressRequestIdRef.current;

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }

      setIsSearching(true);
      setIsResolvingLocation(true);
      setSuggestions([]);

      try {
        const result = await getPlaceDetails(placeId);

        if (
          !mountedRef.current ||
          requestId !== addressRequestIdRef.current
        ) {
          return;
        }

        const selectedCoordinates = extractCoordinates(result);

        if (!selectedCoordinates) {
          throw new Error(
            'Selected place did not return valid coordinates.',
          );
        }

        setCoordinates(selectedCoordinates);
        setMapRegion({
          ...selectedCoordinates,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        });
        setLocationFound(true);

        let fields = extractAddressFields(result);

        if (
          !fields.addressLine ||
          !fields.city ||
          !fields.state ||
          !fields.pincode
        ) {
          try {
            const reverseResult = await reverseGeocode(
              selectedCoordinates.latitude,
              selectedCoordinates.longitude,
            );

            if (
              !mountedRef.current ||
              requestId !== addressRequestIdRef.current
            ) {
              return;
            }

            const reverseFields =
              extractAddressFields(reverseResult);

            fields = {
              addressLine:
                fields.addressLine || reverseFields.addressLine,
              city: fields.city || reverseFields.city,
              state: fields.state || reverseFields.state,
              pincode: fields.pincode || reverseFields.pincode,
            };
          } catch (error) {
            console.warn(
              '[SalonAddressScreen] Address fallback failed.',
              error,
            );
          }
        }

        if (
          !mountedRef.current ||
          requestId !== addressRequestIdRef.current
        ) {
          return;
        }

        applyAddressFields({
          ...fields,
          addressLine: fields.addressLine || description,
        });

        setSearchText(fields.addressLine || description);
      } catch (error) {
        console.warn(
          '[SalonAddressScreen] Place selection failed.',
          error,
        );

        if (
          mountedRef.current &&
          requestId === addressRequestIdRef.current
        ) {
          setLocationFound(false);

          Alert.alert(
            'Unable to select address',
            'We could not load this address. Please choose another search result or use your current location.',
          );
        }
      } finally {
        if (
          mountedRef.current &&
          requestId === addressRequestIdRef.current
        ) {
          setIsSearching(false);
          setIsResolvingLocation(false);
        }
      }
    },
    [applyAddressFields],
  );

  /* LOCATION PERMISSION */

  const requestLocationPermission =
    useCallback(async (): Promise<boolean> => {
      if (Platform.OS !== 'android') return true;

      try {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location permission',
            message:
              'Allow location access to automatically fill in your business address.',
            buttonPositive: 'Allow',
            buttonNegative: 'Cancel',
          },
        );

        return result === PermissionsAndroid.RESULTS.GRANTED;
      } catch (error) {
        console.warn(
          '[SalonAddressScreen] Location permission failed.',
          error,
        );

        return false;
      }
    }, []);

  /* USE CURRENT LOCATION */

  const handleUseCurrentLocation = useCallback(async () => {
    Keyboard.dismiss();

    const hasPermission = await requestLocationPermission();

    if (!mountedRef.current) return;

    if (!hasPermission) {
      Alert.alert(
        'Location permission required',
        'Allow location access in your device settings, or search for your business address manually',
      );
      return;
    }

    const requestId = ++locationRequestIdRef.current;

    addressRequestIdRef.current += 1;
    searchRequestIdRef.current += 1;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    setSuggestions([]);
    setIsSearching(false);
    setIsResolvingLocation(true);

    Geolocation.getCurrentPosition(
      async position => {
        if (
          !mountedRef.current ||
          requestId !== locationRequestIdRef.current
        ) {
          return;
        }

        const nextCoordinates: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        if (!isValidCoordinates(nextCoordinates)) {
          setIsResolvingLocation(false);

          Alert.alert(
            'Invalid location',
            'Your device did not return valid coordinates. Please search for your address.',
          );
          return;
        }

        const addressRequestId =
          ++addressRequestIdRef.current;

        setCoordinates(nextCoordinates);
        setMapRegion({
          ...nextCoordinates,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        });
        setLocationFound(true);

        try {
          const result = await reverseGeocode(
            nextCoordinates.latitude,
            nextCoordinates.longitude,
          );

          if (
            !mountedRef.current ||
            requestId !== locationRequestIdRef.current ||
            addressRequestId !== addressRequestIdRef.current
          ) {
            return;
          }

          if (result) {
            const fields = extractAddressFields(result);
            applyAddressFields(fields);
            setSearchText(fields.addressLine || '');
          } else {
            Alert.alert(
              'Address details unavailable',
              'Your location is selected on the map, but the address could not be retrieved. Please enter the address details manually.',
            );
          }
        } catch (error) {
          console.warn(
            '[SalonAddressScreen] Current location lookup failed.',
            error,
          );

          if (
            mountedRef.current &&
            requestId === locationRequestIdRef.current &&
            addressRequestId === addressRequestIdRef.current
          ) {
            Alert.alert(
              'Address lookup failed',
              'Your coordinates were found, but we could not retrieve the address. Please enter the address details manually.',
            );
          }
        } finally {
          if (
            mountedRef.current &&
            requestId === locationRequestIdRef.current &&
            addressRequestId === addressRequestIdRef.current
          ) {
            setIsResolvingLocation(false);
          }
        }
      },
      error => {
        console.warn(
          '[SalonAddressScreen] Device location failed.',
          error,
        );

        if (
          !mountedRef.current ||
          requestId !== locationRequestIdRef.current
        ) {
          return;
        }

        setIsResolvingLocation(false);

        Alert.alert(
          'Unable to get location',
          'Check that your device location services are enabled, or search for your business address manually',
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 10000,
      },
    );
  }, [requestLocationPermission, applyAddressFields]);

  /* FULL-SCREEN MAP */

  const openFullscreenMap = useCallback(() => {
    Keyboard.dismiss();
    setActiveDropdown(null);
    setIsMapFullscreen(true);
  }, []);

  const closeFullscreenMap = useCallback(() => {
    setIsMapFullscreen(false);
  }, []);

  /* MAP TAP / MARKER DRAG */

  const handleMapLocationChange = useCallback(
    (nextCoordinates: Coordinates) => {
      if (!isValidCoordinates(nextCoordinates)) return;

      // Cancel any pending location request so stale results cannot
      // overwrite the location the user has just selected.
      locationRequestIdRef.current += 1;

      const requestId = ++addressRequestIdRef.current;

      setCoordinates(nextCoordinates);
      setMapRegion(previous => ({
        ...previous,
        ...nextCoordinates,
      }));
      setLocationFound(true);

      void resolveAddressFromCoordinates(nextCoordinates, {
        requestId,
        showError: false,
      });
    },
    [resolveAddressFromCoordinates],
  );

  const handleMapPress = useCallback(
    (event: any) => {
      const nextCoordinates =
        event?.nativeEvent?.coordinate;

      if (nextCoordinates) {
        handleMapLocationChange(nextCoordinates);
      }
    },
    [handleMapLocationChange],
  );

  const handleMarkerDragEnd = useCallback(
    (event: any) => {
      const nextCoordinates =
        event?.nativeEvent?.coordinate;

      if (nextCoordinates) {
        handleMapLocationChange(nextCoordinates);
      }
    },
    [handleMapLocationChange],
  );

  const handleMapRegionChangeComplete = useCallback(
    (region: Region) => {
      setMapRegion(region);
    },
    [],
  );

  /* FORM VALIDATION */

  const validateAddress = useCallback((): boolean => {
    if (!locationFound) {
      Alert.alert(
        'Select your business location',
        'First use your current location or search for your business address',
      );
      return false;
    }

    if (!addressLine.trim()) {
      Alert.alert(
        'Address required',
        'Please select an address or enter the full address.',
      );
      return false;
    }

    if (!city.trim() || !cityOptions.includes(city)) {
      Alert.alert(
        'City required',
        'Please select a city from the dropdown.',
      );
      return false;
    }

    if (!state.trim() || !INDIAN_STATES.includes(state)) {
      Alert.alert(
        'State required',
        'Please select a state or union territory from the dropdown.',
      );
      return false;
    }

    if (!/^[1-9][0-9]{5}$/.test(pincode.trim())) {
      Alert.alert(
        'Invalid PIN code',
        'Enter a valid six-digit Indian PIN code.',
      );
      return false;
    }

    if (!isValidCoordinates(coordinates)) {
      Alert.alert(
        'Location required',
        'Please select a valid location on the map.',
      );
      return false;
    }

    return true;
  }, [
    locationFound,
    addressLine,
    city,
    state,
    cityOptions,
    pincode,
    coordinates,
  ]);

  /* SAVE AND CONTINUE */

  const handleConfirmAddress = useCallback(async () => {
    if (busy || isResolvingLocation || isSearching) return;

    Keyboard.dismiss();

    if (!validateAddress()) return;

    const nextCompletedSteps = Array.from(
      new Set([
        ...(completedSteps ?? []),
        1,
        CURRENT_STEP,
      ]),
    ).sort((a, b) => a - b);

    const latestData: RegistrationData = {
      ...(data ?? {}),
      addressLine: addressLine.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    };

    setIsSubmitting(true);

    try {
      updateData(latestData);

      const saved = await saveDraft(
        NEXT_STEP,
        nextCompletedSteps,
        latestData,
      );

      if (saved === false) {
        if (mountedRef.current) {
          Alert.alert(
            'Unable to save progress',
            'Your registration details could not be saved. Please try again.',
          );
        }
        return;
      }

      if (!mountedRef.current) return;

      markStepCompleted(CURRENT_STEP);
      setCurrentStep(NEXT_STEP);

      navigation.navigate(NEXT_REGISTRATION_ROUTE, {
        initialStep: NEXT_STEP,
        resumeDraft: true,
        completedSteps: nextCompletedSteps,
        registrationData: latestData,
      });
    } catch (error) {
      console.error(
        '[SalonAddressScreen] Save failed.',
        error,
      );

      if (mountedRef.current) {
        Alert.alert(
          'Unable to continue',
          'We could not save your registration progress. Please check your connection and try again.',
        );
      }
    } finally {
      if (mountedRef.current) {
        setIsSubmitting(false);
      }
    }
  }, [
    busy,
    isResolvingLocation,
    isSearching,
    validateAddress,
    completedSteps,
    data,
    addressLine,
    city,
    state,
    pincode,
    coordinates,
    updateData,
    saveDraft,
    markStepCompleted,
    setCurrentStep,
    navigation,
  ]);

  const progressPercentage =
    (CURRENT_STEP / TOTAL_STEPS) * 100;

  /* LOADING */

  if (isDraftLoading || !draftRestoredRef.current) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />

        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text style={styles.loadingText}>
          Please wait...
        </Text>
      </SafeAreaView>
    );
  }

  /* RENDER */

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header headerTitle="Business Address" />

      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* REGISTRATION STEP INDICATOR */}

          <View style={styles.stepHeader}>
            <View>
              <Text style={styles.stepLabel}>
                STEP {String(CURRENT_STEP).padStart(2, '0')} OF{' '}
                {String(TOTAL_STEPS).padStart(2, '0')}
              </Text>
            </View>

            <Text style={styles.stepPercentage}>
              {Math.round(progressPercentage)}%
            </Text>
          </View>

          <View
            style={styles.progressTrack}
            accessibilityRole="progressbar"
            accessibilityLabel="Registration progress"
            accessibilityValue={{
              min: 0,
              max: TOTAL_STEPS,
              now: CURRENT_STEP,
            }}
          >
            <AppGradient
              colors={[...GRADIENTS.SOFT_PURPLE]}
              style={[
                styles.progressFill,
                { width: `${progressPercentage}%` },
              ]}
            >
              <View style={styles.progressFillContent} />
            </AppGradient>
          </View>

          {/* CURRENT LOCATION AND SEARCH */}

          <View style={styles.card}>
            <TouchableOpacity
              style={styles.currentLocationButton}
              activeOpacity={0.8}
              onPress={handleUseCurrentLocation}
              disabled={isResolvingLocation}
            >
              {isResolvingLocation ? (
                <ActivityIndicator
                  size="small"
                  color={COLORS.primary}
                />
              ) : (
                <Text style={styles.currentLocationIcon}>◎</Text>
              )}

              <View style={styles.currentLocationCopy}>
                <Text style={styles.currentLocationText}>
                  Use my current location
                </Text>

                <Text style={styles.currentLocationSubtext}>
                  Automatically detect and fill your address
                </Text>
              </View>

              <Text style={styles.buttonChevron}>›</Text>
            </TouchableOpacity>

            <View style={styles.orDivider}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>OR SEARCH ADDRESS</Text>
              <View style={styles.orLine} />
            </View>

            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>⌕</Text>

              <TextInput
                style={styles.searchInput}
                value={searchText}
                onChangeText={handleSearchChange}
                placeholder="Search street, area or landmark"
                placeholderTextColor={COLORS.placeholder}
                returnKeyType="search"
                autoCorrect={false}
              />

              {isSearching && (
                <ActivityIndicator
                  size="small"
                  color={COLORS.primary}
                />
              )}
            </View>

            {suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {suggestions.map((suggestion, index) => {
                  const description =
                    getSuggestionDescription(suggestion);

                  const key =
                    getSuggestionPlaceId(suggestion) ||
                    `${description}-${index}`;

                  return (
                    <TouchableOpacity
                      key={key}
                      style={styles.suggestionRow}
                      activeOpacity={0.75}
                      onPress={() =>
                        handleSelectSuggestion(suggestion)
                      }
                    >
                      <View style={styles.suggestionIconWrap}>
                        <Text style={styles.suggestionIcon}>⌖</Text>
                      </View>

                      <Text
                        style={styles.suggestionText}
                        numberOfLines={3}
                      >
                        {description}
                      </Text>

                      <Text style={styles.suggestionChevron}>›</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {isResolvingLocation && (
              <View style={styles.resolvingRow}>
                <ActivityIndicator
                  size="small"
                  color={COLORS.primary}
                />
                <Text style={styles.resolvingText}>
                  Finding your address...
                </Text>
              </View>
            )}
          </View>

          {/* ADDRESS DETAILS */}

          <View style={styles.card}>
            <Text style={styles.formTitle}>Address details</Text>

            <Text style={styles.formDescription}>
              These details fill automatically when you select
              a location. You can edit them if needed
            </Text>

            <Text style={styles.label}>Full address *</Text>

            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={addressLine}
              onChangeText={setAddressLine}
              placeholder="Building, street, area and landmark"
              placeholderTextColor={COLORS.placeholder}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />

            <View style={styles.twoColumnRow}>
              <View style={styles.halfColumn}>
                <Text style={styles.label}>City *</Text>

                <TouchableOpacity
                  style={[
                    styles.input,
                    styles.dropdownInput,
                    !state && styles.dropdownInputDisabled,
                  ]}
                  activeOpacity={0.75}
                  disabled={!state}
                  onPress={() => setActiveDropdown('city')}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      !city && styles.dropdownPlaceholder,
                    ]}
                    numberOfLines={1}
                  >
                    {city ||
                      (state
                        ? 'Select city'
                        : 'Select state first')}
                  </Text>

                  <Text style={styles.dropdownChevron}>⌄</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.halfColumn}>
                <Text style={styles.label}>PIN code *</Text>

                <TextInput
                  style={styles.input}
                  value={pincode}
                  onChangeText={value =>
                    setPincode(
                      value.replace(/[^0-9]/g, '').slice(0, 6),
                    )
                  }
                  placeholder="6-digit PIN"
                  placeholderTextColor={COLORS.placeholder}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
            </View>

            <Text style={styles.label}>State *</Text>

            <TouchableOpacity
              style={[styles.input, styles.dropdownInput]}
              activeOpacity={0.75}
              onPress={() => setActiveDropdown('state')}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !state && styles.dropdownPlaceholder,
                ]}
                numberOfLines={1}
              >
                {state || 'Select state / union territory'}
              </Text>

              <Text style={styles.dropdownChevron}>⌄</Text>
            </TouchableOpacity>

            {locationFound && (
              <View style={styles.selectedAddressBanner}>
                <View style={styles.locationStatusDot} />

                <View style={styles.selectedAddressCopy}>
                  <Text style={styles.selectedAddressTitle}>
                    Location selected
                  </Text>

                  <Text style={styles.selectedAddressSubtitle}>
                    Check the details and confirm the map below.
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* MAP PREVIEW */}

          <View style={styles.card}>
            <View style={styles.sectionHeading}>
              <View style={styles.sectionIcon}>
                <Text style={styles.sectionIconText}>⌖</Text>
              </View>

              <View style={styles.sectionHeadingText}>
                <Text style={styles.sectionTitle}>
                  Confirm on the map
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Open the map to place or move the pin to your
                  exact business location
                </Text>
              </View>
            </View>

            <View style={styles.mapContainer}>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                region={mapRegion}
                onRegionChangeComplete={handleMapRegionChangeComplete}
                onPress={openFullscreenMap}
                showsUserLocation
                showsMyLocationButton={false}
                toolbarEnabled={false}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
              >
                {locationFound && (
                  <Marker
                    coordinate={coordinates}
                    title="Your business location"
                    description={addressLine}
                  />
                )}
              </MapView>
              {!locationFound && (
                <View
                  pointerEvents="none"
                  style={styles.mapEmptyOverlay}
                >
                  <View style={styles.mapEmptyMessage}>
                    <Text style={styles.mapEmptyTitle}>
                      Your location will appear here
                    </Text>

                    <Text style={styles.mapEmptySubtitle}>
                      Search an address or use your current
                      location to get started.
                    </Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={styles.expandMapButton}
                activeOpacity={0.85}
                onPress={openFullscreenMap}
              >
                <Text style={styles.expandMapButtonText}>
                  ⛶  Open full-screen map
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mapCurrentLocationButton}
                activeOpacity={0.8}
                onPress={handleUseCurrentLocation}
                disabled={isResolvingLocation}
              >
                <Text style={styles.mapCurrentLocationText}>◎</Text>
              </TouchableOpacity>
            </View>

            {locationFound && (
              <View style={styles.coordinatesContainer}>
                <View style={styles.coordinatesHeader}>
                  <View style={styles.locationStatusDot} />
                  <Text style={styles.coordinatesLabel}>
                    Selected coordinates
                  </Text>
                </View>

                <Text style={styles.coordinatesText}>
                  {coordinates.latitude.toFixed(6)},{' '}
                  {coordinates.longitude.toFixed(6)}
                </Text>

                {isResolvingLocation && (
                  <View style={styles.resolvingRow}>
                    <ActivityIndicator
                      size="small"
                      color={COLORS.primary}
                    />
                    <Text style={styles.resolvingText}>
                      Updating address details...
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* SAVE AND CONTINUE */}

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={busy || isResolvingLocation || isSearching}
            onPress={handleConfirmAddress}
            style={[
              styles.continueButton,
              (busy || isResolvingLocation || isSearching) &&
              styles.continueButtonDisabled,
            ]}
          >
            <AppGradient
              colors={[...GRADIENTS.SOFT_PURPLE]}
              style={styles.continueGradient}
            >
              {isSubmitting || isDraftSaving ? (
                <ActivityIndicator
                  color={COLORS.white}
                  size="small"
                />
              ) : (
                <>
                  <Text style={styles.continueButtonText}>
                    Save and continue
                  </Text>
                  <Text style={styles.continueArrow}>→</Text>
                </>
              )}
            </AppGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* STATE / CITY DROPDOWN MODAL */}

      <Modal
        visible={activeDropdown !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveDropdown(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setActiveDropdown(null)}
          />

          <View style={styles.dropdownModal}>
            <View style={styles.dropdownModalHeader}>
              <Text style={styles.dropdownModalTitle}>
                {activeDropdown === 'state'
                  ? 'Select state / union territory'
                  : 'Select city'}
              </Text>

              <TouchableOpacity
                onPress={() => setActiveDropdown(null)}
                hitSlop={{
                  top: 10,
                  bottom: 10,
                  left: 10,
                  right: 10,
                }}
              >
                <Text style={styles.dropdownClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.dropdownList}
            >
              {dropdownOptions.map(option => {
                const selected =
                  activeDropdown === 'state'
                    ? state === option
                    : city === option;

                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.dropdownOption,
                      selected && styles.dropdownOptionSelected,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (activeDropdown === 'state') {
                        handleSelectState(option);
                      } else {
                        handleSelectCity(option);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        selected &&
                        styles.dropdownOptionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>

                    {selected && (
                      <Text style={styles.dropdownCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              })}

              {dropdownOptions.length === 0 && (
                <Text style={styles.dropdownEmptyText}>
                  Please select a state first.
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* FULL-SCREEN MAP MODAL */}

      <Modal
        visible={isMapFullscreen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeFullscreenMap}
        statusBarTranslucent={false}
      >
        <SafeAreaView style={styles.fullscreenMapScreen}>
          <StatusBar
            barStyle="dark-content"
            backgroundColor={COLORS.white}
          />

          {/* MAP HEADER */}

          <View style={styles.fullscreenMapHeader}>
            <TouchableOpacity
              style={styles.fullscreenMapCloseButton}
              activeOpacity={0.8}
              onPress={closeFullscreenMap}
              accessibilityRole="button"
              accessibilityLabel="Close full-screen map"
            >
              <Text style={styles.fullscreenMapCloseText}>✕</Text>
            </TouchableOpacity>

            <View style={styles.fullscreenMapHeaderCopy}>
              <Text style={styles.fullscreenMapTitle}>
                Pin your business location
              </Text>

              <Text style={styles.fullscreenMapSubtitle}>
                Tap the map or drag the pin to set the exact
                location
              </Text>
            </View>
          </View>

          {/* INTERACTIVE MAP */}

          <View style={styles.fullscreenMapContainer}>

            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={DEFAULT_REGION}
              onPress={openFullscreenMap}
              toolbarEnabled={false}
            >
              {locationFound && (
                <Marker
                  coordinate={coordinates}
                  title="Your business location"
                  description={addressLine}
                />
              )}
            </MapView>


            {!locationFound && (
              <View
                pointerEvents="none"
                style={styles.fullscreenMapEmptyOverlay}
              >
                <View style={styles.fullscreenMapEmptyCard}>
                  <Text style={styles.fullscreenMapEmptyTitle}>
                    Choose your business location
                  </Text>

                  <Text style={styles.fullscreenMapEmptySubtitle}>
                    Tap anywhere on the map to place your pin
                  </Text>
                </View>
              </View>
            )}

            {/* CURRENT LOCATION BUTTON */}

            <TouchableOpacity
              style={styles.fullscreenCurrentLocationButton}
              activeOpacity={0.85}
              onPress={handleUseCurrentLocation}
              disabled={isResolvingLocation}
              accessibilityRole="button"
              accessibilityLabel="Use current location"
            >
              {isResolvingLocation ? (
                <ActivityIndicator
                  size="small"
                  color={COLORS.primary}
                />
              ) : (
                <Text style={styles.fullscreenCurrentLocationIcon}>
                  ◎
                </Text>
              )}
            </TouchableOpacity>

            {/* SELECTED ADDRESS CARD */}

            <View style={styles.fullscreenAddressCard}>
              <View style={styles.fullscreenAddressCardHeader}>
                <View style={styles.locationStatusDot} />

                <Text style={styles.fullscreenAddressCardLabel}>
                  {locationFound
                    ? 'Selected business location'
                    : 'Choose your business location'}
                </Text>
              </View>

              <Text
                style={styles.fullscreenAddressText}
                numberOfLines={3}
              >
                {addressLine ||
                  (locationFound
                    ? 'Getting address details...'
                    : 'Tap the map to place a pin, or use your current location.')}
              </Text>

              {locationFound && (
                <Text style={styles.fullscreenCoordinatesText}>
                  {coordinates.latitude.toFixed(6)},{' '}
                  {coordinates.longitude.toFixed(6)}
                </Text>
              )}

              {isResolvingLocation && (
                <View style={styles.fullscreenResolvingRow}>
                  <ActivityIndicator
                    size="small"
                    color={COLORS.primary}
                  />
                  <Text style={styles.fullscreenResolvingText}>
                    Updating address...
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* MAP FOOTER */}

          <View style={styles.fullscreenMapFooter}>
            <Text style={styles.fullscreenMapHint}>
              Place the pin as close as possible to your business
              entrance. Your address details will update automatically
            </Text>

            <TouchableOpacity
              style={[
                styles.fullscreenConfirmButton,
                (!locationFound || isResolvingLocation) &&
                styles.fullscreenConfirmButtonDisabled,
              ]}
              activeOpacity={0.85}
              disabled={!locationFound || isResolvingLocation}
              onPress={closeFullscreenMap}
            >
              <AppGradient
                colors={[...GRADIENTS.SOFT_PURPLE]}
                style={styles.fullscreenConfirmGradient}
              >
                {isResolvingLocation ? (
                  <ActivityIndicator
                    color={COLORS.white}
                    size="small"
                  />
                ) : (
                  <Text style={styles.fullscreenConfirmText}>
                    Confirm location
                  </Text>
                )}
              </AppGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 14,
    fontSize: 14,
    color: COLORS.secondaryText,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  backButtonText: {
    fontSize: 30,
    lineHeight: 32,
    color: COLORS.text,
    marginTop: -3,
  },

  headerTextContainer: {
    flex: 1,
    paddingTop: 1,
  },

  eyebrow: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 5,
  },

  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  subtitle: {
    color: COLORS.secondaryText,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
    paddingRight: 4,
  },

  stepBadge: {
    backgroundColor: COLORS.lightPurple,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 11,
    marginLeft: 8,
  },

  stepBadgeText: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: '800',
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },

  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.lightPurple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  sectionIconText: {
    color: COLORS.primary,
    fontSize: 25,
    fontWeight: '700',
  },

  sectionHeadingText: {
    flex: 1,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
  },

  sectionSubtitle: {
    color: COLORS.secondaryText,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },

  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FDFCFF',
    paddingHorizontal: 13,
    paddingVertical: 14,
    gap: 11,
  },

  currentLocationIcon: {
    color: COLORS.primary,
    fontSize: 25,
    fontWeight: '700',
  },

  currentLocationCopy: {
    flex: 1,
  },

  currentLocationText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: '800',
  },

  currentLocationSubtext: {
    color: COLORS.secondaryText,
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },

  buttonChevron: {
    fontSize: 25,
    color: COLORS.primary,
  },

  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 17,
  },

  orLine: {
    height: 1,
    backgroundColor: COLORS.border,
    flex: 1,
  },

  orText: {
    color: COLORS.secondaryText,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  searchContainer: {
    minHeight: 49,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FDFCFF',
    paddingHorizontal: 12,
  },

  searchIcon: {
    color: COLORS.primary,
    fontSize: 24,
    marginRight: 9,
  },

  searchInput: {
    flex: 1,
    minHeight: 47,
    paddingVertical: 8,
    color: COLORS.text,
    fontSize: 13,
  },

  suggestionsContainer: {
    marginTop: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },

  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    gap: 9,
  },

  suggestionIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: COLORS.lightPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },

  suggestionIcon: {
    color: COLORS.primary,
    fontSize: 19,
  },

  suggestionText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 18,
  },

  suggestionChevron: {
    fontSize: 22,
    color: COLORS.secondaryText,
  },

  resolvingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },

  resolvingText: {
    color: COLORS.secondaryText,
    fontSize: 11,
  },

  formTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
  },

  formDescription: {
    color: COLORS.secondaryText,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
    marginBottom: 10,
  },

  label: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 7,
    marginTop: 13,
  },

  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FDFCFF',
    paddingHorizontal: 13,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 13,
  },

  multilineInput: {
    minHeight: 84,
    paddingTop: 13,
  },

  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
  },

  halfColumn: {
    flex: 1,
  },

  dropdownInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 0,
  },

  dropdownInputDisabled: {
    opacity: 0.6,
  },

  dropdownText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    marginRight: 8,
  },

  dropdownPlaceholder: {
    color: COLORS.placeholder,
  },

  dropdownChevron: {
    color: COLORS.primary,
    fontSize: 20,
    marginTop: -3,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
    backgroundColor: 'rgba(20, 15, 35, 0.45)',
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  dropdownModal: {
    width: '100%',
    maxHeight: '75%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },

  dropdownModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  dropdownModalTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
    paddingRight: 12,
  },

  dropdownClose: {
    color: COLORS.secondaryText,
    fontSize: 18,
    paddingHorizontal: 3,
  },

  dropdownList: {
    flexGrow: 0,
    marginTop: 6,
  },

  dropdownOption: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderRadius: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },

  dropdownOptionSelected: {
    backgroundColor: COLORS.lightPurple,
  },

  dropdownOptionText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
  },

  dropdownOptionTextSelected: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },

  dropdownCheck: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: '800',
    marginLeft: 10,
  },

  dropdownEmptyText: {
    color: COLORS.secondaryText,
    fontSize: 13,
    paddingVertical: 22,
    textAlign: 'center',
  },

  selectedAddressBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 17,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F0FAF5',
    borderWidth: 1,
    borderColor: '#D7EFE2',
  },

  selectedAddressCopy: {
    flex: 1,
  },

  selectedAddressTitle: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '800',
  },

  selectedAddressSubtitle: {
    color: COLORS.secondaryText,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },

  locationStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },

  /* MAP PREVIEW */

  mapContainer: {
    height: 245,
    overflow: 'hidden',
    borderRadius: 15,
    backgroundColor: '#EAE7F0',
    position: 'relative',
  },

  map: {
    ...StyleSheet.absoluteFillObject,
  },

  mapEmptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  mapEmptyMessage: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  mapEmptyTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },

  mapEmptySubtitle: {
    color: COLORS.secondaryText,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 6,
  },

  expandMapButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 62,
    minHeight: 40,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },

  expandMapButtonText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '800',
  },

  mapCurrentLocationButton: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },

  mapCurrentLocationText: {
    color: COLORS.primary,
    fontSize: 25,
    fontWeight: '700',
  },

  coordinatesContainer: {
    marginTop: 13,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FDFCFF',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  coordinatesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  coordinatesLabel: {
    color: COLORS.secondaryText,
    fontSize: 11,
    fontWeight: '600',
  },

  coordinatesText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 6,
  },

  mapHint: {
    color: COLORS.secondaryText,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 12,
  },

  /* FULL-SCREEN MAP */

  fullscreenMapScreen: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  fullscreenMapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  fullscreenMapCloseButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  fullscreenMapCloseText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },

  fullscreenMapHeaderCopy: {
    flex: 1,
  },

  fullscreenMapTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },

  fullscreenMapSubtitle: {
    color: COLORS.secondaryText,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },

  fullscreenMapContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#EAE7F0',
  },

  fullscreenMap: {
    ...StyleSheet.absoluteFillObject,
  },

  fullscreenMapEmptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },

  fullscreenMapEmptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
  },

  fullscreenMapEmptyTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },

  fullscreenMapEmptySubtitle: {
    color: COLORS.secondaryText,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 7,
  },

  fullscreenCurrentLocationButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },

  fullscreenCurrentLocationIcon: {
    color: COLORS.primary,
    fontSize: 27,
    fontWeight: '700',
  },

  fullscreenAddressCard: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 16,
    padding: 16,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 5,
  },

  fullscreenAddressCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  fullscreenAddressCardLabel: {
    flex: 1,
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '800',
  },

  fullscreenAddressText: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 9,
  },

  fullscreenCoordinatesText: {
    color: COLORS.secondaryText,
    fontSize: 11,
    marginTop: 8,
  },

  fullscreenResolvingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },

  fullscreenResolvingText: {
    color: COLORS.secondaryText,
    fontSize: 11,
  },

  fullscreenMapFooter: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  fullscreenMapHint: {
    color: COLORS.secondaryText,
    fontSize: 11,
    lineHeight: 17,
    marginBottom: 12,
  },

  fullscreenConfirmButton: {
    overflow: 'hidden',
    borderRadius: 15,
  },

  fullscreenConfirmButtonDisabled: {
    opacity: 0.55,
  },

  fullscreenConfirmGradient: {
    minHeight: 54,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fullscreenConfirmText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },

  /* CONTINUE */

  continueButton: {
    overflow: 'hidden',
    borderRadius: 15,
  },

  continueButtonDisabled: {
    opacity: 0.65,
  },

  continueGradient: {
    minHeight: 54,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  continueButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },

  continueArrow: {
    color: COLORS.white,
    fontSize: 22,
    marginLeft: 8,
    marginTop: -6,
  },

  footerNote: {
    textAlign: 'center',
    color: COLORS.secondaryText,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 13,
    paddingHorizontal: 12,
  },

  /* STEP PROGRESS */

  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  stepLabel: {
    fontSize: 11,
    fontFamily: FONTS?.bold,
    color: COLORS.primary,
    letterSpacing: 1,
  },

  stepPercentage: {
    fontSize: 12,
    fontFamily: FONTS?.medium,
    color: COLORS.primary,
  },

  progressTrack: {
    width: '100%',
    height: 5,
    backgroundColor: '#EAE5F3',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 22,
  },

  progressFill: {
    height: '100%',
    borderRadius: 10,
  },

  progressFillContent: {
    flex: 1,
  },
});

export default SalonAddressScreen;