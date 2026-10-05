'use strict';

/**
 * ============================================================
 * CLAVATA - SEED NEARBY SALONS
 * ============================================================
 *
 * Creates test:
 *
 *   User
 *   Salon
 *   Service
 *
 * using the CURRENT Clavata DynamoDB structure.
 *
 * NO BUSINESS TYPE.
 * NO activeRole.
 *
 * Emulator test location:
 *
 *   Latitude:  12.9352
 *   Longitude: 77.6245
 *
 * ============================================================
 *
 * REQUIRED ENVIRONMENT VARIABLES
 *
 * AWS_REGION=ap-south-2
 * USER_TABLE=YOUR_USER_TABLE
 * SALON_TABLE=YOUR_SALON_TABLE
 * SERVICE_TABLE=YOUR_SERVICE_TABLE
 * CATEGORY_TABLE=YOUR_CATEGORY_TABLE
 * SUBCATEGORY_TABLE=YOUR_SUBCATEGORY_TABLE
 *
 * ============================================================
 *
 * RUN:
 *
 * node seed-nearby-salons.js
 *
 * ============================================================
 */

'use strict';

const {
  DynamoDBClient,
} = require('@aws-sdk/client-dynamodb');

const {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
} = require('@aws-sdk/lib-dynamodb');

const {
  randomUUID,
} = require('crypto');


// ============================================================
// CONFIGURATION
// ============================================================

const AWS_REGION =
  process.env.AWS_REGION || 'ap-south-2';

const USER_TABLE =
  process.env.USER_TABLE || 'Users';

const SALON_TABLE =
  process.env.SALON_TABLE || 'Salons';

const SERVICE_TABLE =
  process.env.SERVICE_TABLE || 'SalonServices';

const CATEGORY_TABLE =
  process.env.CATEGORY_TABLE || 'Category';

const SUBCATEGORY_TABLE =
  process.env.SUBCATEGORY_TABLE || 'Subcategories';


// ============================================================
// VALIDATE CONFIG
// ============================================================

const requiredEnvironment = {
  USER_TABLE,
  SALON_TABLE,
  SERVICE_TABLE,
  CATEGORY_TABLE,
  SUBCATEGORY_TABLE,
};

for (
  const [name, value]
  of Object.entries(requiredEnvironment)
) {
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}`,
    );
  }
}


// ============================================================
// DYNAMODB
// ============================================================

const dynamoClient =
  new DynamoDBClient({
    region: AWS_REGION,
  });

const ddb =
  DynamoDBDocumentClient.from(
    dynamoClient,
  );


// ============================================================
// HELPERS
// ============================================================

function now() {
  return new Date().toISOString();
}


function normalizeString(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return '';
  }

  return String(value).trim();
}


function normalizeStatus(value) {
  return normalizeString(value)
    .toUpperCase();
}


function normalizeAudience(value) {
  const result =
    normalizeString(value)
      .toUpperCase();

  if (
    result === 'FEMALE' ||
    result === 'MALE' ||
    result === 'KIDS'
  ) {
    return result;
  }

  return null;
}


function getCategoryId(category) {
  return (
    category.categoryId ||
    category.id ||
    null
  );
}


function getCategoryName(category) {
  return (
    category.name ||
    category.categoryName ||
    'Unknown Category'
  );
}


function getSubcategoryId(
  subcategory,
) {
  return (
    subcategory.subcategoryId ||
    subcategory.id ||
    null
  );
}


function getSubcategoryName(
  subcategory,
) {
  return (
    subcategory.name ||
    subcategory.subcategoryName ||
    'Unknown Subcategory'
  );
}


function getAudiences(
  subcategory,
) {
  if (
    !Array.isArray(
      subcategory.audiences,
    )
  ) {
    return [];
  }

  return [
    ...new Set(
      subcategory.audiences
        .map(normalizeAudience)
        .filter(Boolean),
    ),
  ];
}


// ============================================================
// SCAN ENTIRE TABLE
// ============================================================

async function scanAll(
  tableName,
) {
  const items = [];

  let lastEvaluatedKey;

  do {
    const response =
      await ddb.send(
        new ScanCommand({
          TableName:
            tableName,

          ExclusiveStartKey:
            lastEvaluatedKey,
        }),
      );

    if (
      Array.isArray(
        response.Items,
      )
    ) {
      items.push(
        ...response.Items,
      );
    }

    lastEvaluatedKey =
      response.LastEvaluatedKey;

  } while (
    lastEvaluatedKey
  );

  return items;
}


// ============================================================
// TEST PROVIDERS
// ============================================================
//
// Reference location:
//
//   12.9352
//   77.6245
//
// Several salons are deliberately very close.
//
// This allows testing:
//
//   2 km
//   5 km
//   10 km
//   15 km
//   25 km
//
// filters.
// ============================================================

const PROVIDERS = [
  // ----------------------------------------------------------
  // ~0 km
  // ----------------------------------------------------------

  {
    phoneNumber: '919900000001',
    fullName: 'Sneha Patel',
    ownerName: 'Sneha Patel',
    email: 'sneha.test@clavatademo.com',
    salonName: 'Blush Beauty Lounge',

    latitude: 12.9352,
    longitude: 77.6245,

    targetAudiences: [
      'FEMALE',
    ],
  },

  // ----------------------------------------------------------
  // ~0.2 km
  // ----------------------------------------------------------

  {
    phoneNumber: '919900000002',
    fullName: 'Priya Gowda',
    ownerName: 'Priya Gowda',
    email: 'priya.test@clavatademo.com',
    salonName: 'Priya Family Salon',

    latitude: 12.9365,
    longitude: 77.6258,

    targetAudiences: [
      'FEMALE',
      'MALE',
      'KIDS',
    ],
  },

  // ----------------------------------------------------------
  // ~0.6 km
  // ----------------------------------------------------------

  {
    phoneNumber: '919900000003',
    fullName: 'Rahul Kumar',
    ownerName: 'Rahul Kumar',
    email: 'rahul.test@clavatademo.com',
    salonName: 'Urban Men Studio',

    latitude: 12.9315,
    longitude: 77.6295,

    targetAudiences: [
      'MALE',
    ],
  },

  // ----------------------------------------------------------
  // ~1 km
  // ----------------------------------------------------------

  {
    phoneNumber: '919900000004',
    fullName: 'Meera Rao',
    ownerName: 'Meera Rao',
    email: 'meera.test@clavatademo.com',
    salonName: 'Glow & Grace Salon',

    latitude: 12.9420,
    longitude: 77.6180,

    targetAudiences: [
      'FEMALE',
      'KIDS',
    ],
  },

  // ----------------------------------------------------------
  // ~1.6 km
  // ----------------------------------------------------------

  {
    phoneNumber: '919900000005',
    fullName: 'Kiran Rao',
    ownerName: 'Kiran Rao',
    email: 'kiran.test@clavatademo.com',
    salonName: 'Style Street Unisex',

    latitude: 12.9480,
    longitude: 77.6320,

    targetAudiences: [
      'FEMALE',
      'MALE',
    ],
  },

  // ----------------------------------------------------------
  // ~1.8 km
  // ----------------------------------------------------------

  {
    phoneNumber: '919900000006',
    fullName: 'Ananya Sharma',
    ownerName: 'Ananya Sharma',
    email: 'ananya.test@clavatademo.com',
    salonName: 'Ananya Beauty Studio',

    latitude: 12.9250,
    longitude: 77.6150,

    targetAudiences: [
      'FEMALE',
    ],
  },

  // ----------------------------------------------------------
  // ~2.7 km
  // ----------------------------------------------------------

  {
    phoneNumber: '919900000007',
    fullName: 'Arjun Shetty',
    ownerName: 'Arjun Shetty',
    email: 'arjun.test@clavatademo.com',
    salonName: 'The Gentlemen Hub',

    latitude: 12.9550,
    longitude: 77.6400,

    targetAudiences: [
      'MALE',
      'KIDS',
    ],
  },

  // ----------------------------------------------------------
  // ~3 km
  // ----------------------------------------------------------

  {
    phoneNumber: '919900000008',
    fullName: 'Vikram Singh',
    ownerName: 'Vikram Singh',
    email: 'vikram.test@clavatademo.com',
    salonName: 'Classic Cuts',

    latitude: 12.9150,
    longitude: 77.6500,

    targetAudiences: [
      'MALE',
    ],
  },

  // ----------------------------------------------------------
  // ~5 km
  // ----------------------------------------------------------

  {
    phoneNumber: '919900000009',
    fullName: 'Divya Nair',
    ownerName: 'Divya Nair',
    email: 'divya.test@clavatademo.com',
    salonName: 'Divya Spa & Wellness',

    latitude: 12.9700,
    longitude: 77.6050,

    targetAudiences: [
      'FEMALE',
      'MALE',
    ],
  },

  // ----------------------------------------------------------
  // ~6-7 km
  // ----------------------------------------------------------

  {
    phoneNumber: '919900000010',
    fullName: 'Nandini Hegde',
    ownerName: 'Nandini Hegde',
    email: 'nandini.test@clavatademo.com',
    salonName: 'Nandini Family Beauty',

    latitude: 12.9900,
    longitude: 77.6500,

    targetAudiences: [
      'FEMALE',
      'MALE',
      'KIDS',
    ],
  },
];


// ============================================================
// LOAD CATEGORY + SUBCATEGORY CATALOG
// ============================================================

async function loadCatalog() {
  console.log('');
  console.log(
    '============================================================',
  );
  console.log(
    'LOADING CATEGORY / SUBCATEGORY CATALOG',
  );
  console.log(
    '============================================================',
  );

  const [
    categories,
    subcategories,
  ] = await Promise.all([
    scanAll(
      CATEGORY_TABLE,
    ),

    scanAll(
      SUBCATEGORY_TABLE,
    ),
  ]);

  console.log(
    `Total categories: ${categories.length}`,
  );

  console.log(
    `Total subcategories: ${subcategories.length}`,
  );

  // ----------------------------------------------------------
  // ACTIVE CATEGORIES
  // ----------------------------------------------------------

  const activeCategories =
    categories.filter(
      category =>
        normalizeStatus(
          category.status,
        ) === 'ACTIVE',
    );

  // ----------------------------------------------------------
  // CATEGORY MAP
  // ----------------------------------------------------------

  const categoryMap =
    new Map();

  for (
    const category
    of activeCategories
  ) {
    const categoryId =
      getCategoryId(
        category,
      );

    if (!categoryId) {
      continue;
    }

    categoryMap.set(
      String(categoryId),
      category,
    );
  }

  // ----------------------------------------------------------
  // ACTIVE SUBCATEGORIES
  // ----------------------------------------------------------

  const usableSubcategories =
    [];

  for (
    const subcategory
    of subcategories
  ) {
    if (
      normalizeStatus(
        subcategory.status,
      ) !== 'ACTIVE'
    ) {
      continue;
    }

    const categoryId =
      normalizeString(
        subcategory.categoryId,
      );

    const subcategoryId =
      getSubcategoryId(
        subcategory,
      );

    if (
      !categoryId ||
      !subcategoryId
    ) {
      continue;
    }

    const category =
      categoryMap.get(
        categoryId,
      );

    if (!category) {
      continue;
    }

    const audiences =
      getAudiences(
        subcategory,
      );

    if (
      audiences.length === 0
    ) {
      continue;
    }

    usableSubcategories.push({
      categoryId,

      categoryName:
        getCategoryName(
          category,
        ),

      subcategoryId,

      subcategoryName:
        getSubcategoryName(
          subcategory,
        ),

      audiences,
    });
  }

  console.log(
    `Usable active subcategories: ${usableSubcategories.length}`,
  );

  if (
    usableSubcategories.length === 0
  ) {
    throw new Error(
      'No ACTIVE subcategories with audiences were found.',
    );
  }

  console.log('');
  console.log(
    'CATALOG AVAILABLE FOR SEEDING:',
  );

  usableSubcategories.forEach(
    item => {
      console.log(
        `  ${item.categoryName} > ${item.subcategoryName} [${item.audiences.join(', ')}]`,
      );
    },
  );

  return usableSubcategories;
}


// ============================================================
// SELECT SERVICES FOR PROVIDER
// ============================================================
//
// IMPORTANT:
//
// Your current Subcategory table contains:
//
//   subcategoryId
//   categoryId
//   name
//   audiences
//
// It does NOT contain actual service names.
//
// Therefore this seed creates test service names from the
// existing subcategory names.
//
// Example:
//
// Hair > Hair Care
//
// becomes:
//
// Hair Care - Women
//
// The actual provider registration flow continues to use the
// real service name entered by the provider.
// ============================================================

function createServicesForProvider(
  provider,
  catalog,
  providerIndex,
) {
  const eligible =
    catalog.filter(
      item =>
        item.audiences.some(
          audience =>
            provider.targetAudiences.includes(
              audience,
            ),
        ),
    );

  if (
    eligible.length === 0
  ) {
    throw new Error(
      `No eligible catalog entries for ${provider.salonName}`,
    );
  }

  /*
   * Rotate catalog position for every provider so
   * providers don't all receive identical services.
   */
  const services = [];

  const desiredCount =
    Math.min(
      5 +
        (
          providerIndex %
          3
        ),
      eligible.length,
    );

  for (
    let i = 0;
    i < desiredCount;
    i++
  ) {
    const catalogIndex =
      (
        providerIndex +
        i
      ) % eligible.length;

    const item =
      eligible[catalogIndex];

    const possibleAudiences =
      item.audiences.filter(
        audience =>
          provider.targetAudiences.includes(
            audience,
          ),
      );

    if (
      possibleAudiences.length === 0
    ) {
      continue;
    }

    const audience =
      possibleAudiences[
        (
          providerIndex +
          i
        ) %
        possibleAudiences.length
      ];

    const audienceLabel =
      audience === 'FEMALE'
        ? 'Women'
        : audience === 'MALE'
          ? 'Men'
          : 'Kids';

    const serviceName =
      `${item.subcategoryName} - ${audienceLabel}`;

    /*
     * Price distribution for testing:
     *
     * < ₹500
     * ₹500-₹1K
     * ₹1K-₹2K
     * ₹2K+
     */
    const prices = [
      299,
      399,
      450,
      499,
      599,
      699,
      799,
      999,
      1299,
      1599,
      1999,
      2499,
    ];

    const price =
      prices[
        (
          providerIndex * 2 +
          i
        ) %
        prices.length
      ];

    const durations = [
      20,
      30,
      40,
      45,
      60,
      75,
      90,
    ];

    const duration =
      durations[
        (
          providerIndex +
          i
        ) %
        durations.length
      ];

    services.push({
      categoryId:
        item.categoryId,

      categoryName:
        item.categoryName,

      subcategoryId:
        item.subcategoryId,

      subcategoryName:
        item.subcategoryName,

      name:
        serviceName,

      description:
        '',

      audience,

      price,

      duration,
    });
  }

  return services;
}


// ============================================================
// CREATE USER
// ============================================================

async function createUser(
  provider,
  userId,
  salonId,
) {
  const timestamp =
    now();

  const user = {
    phoneNumber:
      provider.phoneNumber,

    userId,

    fullName:
      provider.fullName,

    role:
      'PROVIDER',

    providerStatus:
      'APPROVED',

    salonId,

    businessPartner:
      true,

    createdAt:
      timestamp,

    updatedAt:
      timestamp,
  };

  await ddb.send(
    new PutCommand({
      TableName:
        USER_TABLE,

      Item:
        user,

      ConditionExpression:
        'attribute_not_exists(phoneNumber)',
    }),
  );

  return user;
}


// ============================================================
// CREATE SALON
// ============================================================

async function createSalon(
  provider,
  userId,
  salonId,
  services,
  providerIndex,
) {
  const timestamp =
    now();

  const ratings = [
    4.1,
    4.3,
    4.5,
    4.7,
    4.8,
    4.0,
    4.6,
    4.2,
    4.9,
    4.4,
  ];

  const reviews = [
    14,
    27,
    41,
    8,
    63,
    22,
    35,
    11,
    76,
    49,
  ];

  const averageRating =
    ratings[
      providerIndex
    ];

  const totalReviews =
    reviews[
      providerIndex
    ];

  /*
   * ----------------------------------------------------------
   * Salon-level services
   *
   * Your existing DynamoDB record has:
   *
   * services: [...]
   *
   * so we preserve that structure.
   * ----------------------------------------------------------
   */

  const salonServices =
    services.map(
      service => ({
        audience:
          service.audience,

        categoryId:
          service.categoryId,

        categoryName:
          service.categoryName,

        description:
          service.description,

        duration:
          service.duration,

        name:
          service.name,

        price:
          service.price,

        subcategoryId:
          service.subcategoryId,

        subcategoryName:
          service.subcategoryName,
      }),
    );

  /*
   * ----------------------------------------------------------
   * serviceSelections
   *
   * Your GraphQL schema exposes this field.
   * ----------------------------------------------------------
   */

  const serviceSelections =
    services.map(
      service => ({
        categoryId:
          service.categoryId,

        categoryName:
          service.categoryName,

        subcategoryId:
          service.subcategoryId,

        subcategoryName:
          service.subcategoryName,

        serviceName:
          service.name,

        audience:
          service.audience,

        price:
          service.price,

        duration:
          service.duration,
      }),
    );

  const salon = {
    salonId,

    ownerUserId:
      userId,

    salonName:
      provider.salonName,

    ownerName:
      provider.ownerName,

    targetAudiences:
      provider.targetAudiences,

    ownerPhoneNumber:
      provider.phoneNumber,

    alternatePhone:
      null,

    email:
      provider.email,

    address: {
      addressLine:
        'Bengaluru, Karnataka',

      city:
        'Bengaluru',

      state:
        'Karnataka',

      pincode:
        '560001',
    },

    latitude:
      provider.latitude,

    longitude:
      provider.longitude,

    /*
     * Exact structure from your existing DynamoDB record.
     */
    services:
      salonServices,

    serviceSelections:
      serviceSelections,

    gstNumber:
      null,

    panNumber:
      'ABCDE1234E',

    aadhaarNumber:
      '456432456786',

    shopEstablishmentNumber:
      `TEST-${String(
        providerIndex + 1,
      ).padStart(3, '0')}`,

    udyamNumber:
      null,

    documents: {
      pan: null,
      aadhaar: null,
      shopEstablishment: null,
      gst: null,
      udyam: null,
    },

    accountHolderName:
      provider.ownerName,

    razorpayAccountId:
      null,

    razorpayAccountStatus:
      null,

    logoUrl:
      null,

    coverImageUrl:
      null,

    galleryImages:
      [],

    logoMedia:
      null,

    coverMedia:
      null,

    galleryMedia:
      [],

    businessHours: {
      MONDAY: {
        close: '19:00',
        isOpen: true,
        open: '09:00',
      },

      TUESDAY: {
        close: '19:00',
        isOpen: true,
        open: '09:00',
      },

      WEDNESDAY: {
        close: '19:00',
        isOpen: true,
        open: '09:00',
      },

      THURSDAY: {
        close: '19:00',
        isOpen: true,
        open: '09:00',
      },

      FRIDAY: {
        close: '19:00',
        isOpen: true,
        open: '09:00',
      },

      SATURDAY: {
        close: '18:00',
        isOpen: true,
        open: '10:00',
      },

      SUNDAY: {
        close: '18:00',
        isOpen: false,
        open: '10:00',
      },
    },

    /*
     * Legacy field.
     *
     * Current approval logic should use
     * verificationStatus instead.
     */
    kycStatus:
      'PENDING',

    /*
     * Third-party verification.
     */
    panVerification: {
      completedAt:
        timestamp,

      message:
        'Mock PAN verification successful.',

      referenceId:
        `MOCK-CASHFREE-${salonId}-PAN`,

      status:
        'VERIFIED',
    },

    aadhaarVerification: {
      completedAt:
        timestamp,

      message:
        'Mock Aadhaar verification successful.',

      referenceId:
        `MOCK-CASHFREE-${salonId}-AADHAAR`,

      status:
        'VERIFIED',
    },

    verificationStatus:
      'VERIFIED',

    verificationSubmittedAt:
      timestamp,

    verificationCompletedAt:
      timestamp,

    verificationProvider:
      'CASHFREE',

    verificationReferenceId:
      `MOCK-CASHFREE-${salonId}`,

    verificationRejectionReason:
      null,

    /*
     * Clavata admin approval.
     */
    adminApprovalStatus:
      'APPROVED',

    /*
     * Legacy field retained because
     * your existing DynamoDB records contain it.
     */
    approvalStatus:
      'PENDING',

    approvedBy:
      'SEED_SCRIPT',

    approvedAt:
      timestamp,

    rejectedBy:
      null,

    rejectedAt:
      null,

    rejectionReason:
      null,

    /*
     * IMPORTANT:
     *
     * Use OPEN so the salon can be returned
     * by nearby-salon searches that consider
     * salonStatus.
     */
    salonStatus:
      'OPEN',

    isActive:
      true,

    isVisible:
      true,

    isDeleted:
      false,

    averageRating,

    totalReviews,

    totalAppointments:
      0,

    totalCompletedAppointments:
      0,

    totalCancelledAppointments:
      0,

    totalRevenue:
      0,

    stats: {
      averageRating,

      totalAppointments:
        0,

      totalBookings:
        0,

      totalCancelledAppointments:
        0,

      totalCompletedAppointments:
        0,

      totalRevenue:
        0,

      totalReviews:
        0,
    },

    lastUpdatedBy:
      'SEED_SCRIPT',

    createdAt:
      timestamp,

    updatedAt:
      timestamp,
  };

  await ddb.send(
    new PutCommand({
      TableName:
        SALON_TABLE,

      Item:
        salon,

      ConditionExpression:
        'attribute_not_exists(salonId)',
    }),
  );

  return salon;
}


// ============================================================
// CREATE SERVICE RECORDS
// ============================================================

async function createServices(
  salonId,
  services,
) {
  const created =
    [];

  for (
    const service
    of services
  ) {
    const timestamp =
      now();

    const serviceId =
      `SERVICE#${randomUUID()}`;

    const item = {
      salonId,

      serviceId,

      active:
        true,

      audience:
        service.audience,

      categoryId:
        service.categoryId,

      categoryName:
        service.categoryName,

      createdAt:
        timestamp,

      description:
        service.description,

      duration:
        service.duration,

      isActive:
        true,

      isDeleted:
        false,

      name:
        service.name,

      popular:
        false,

      price:
        service.price,

      subcategoryId:
        service.subcategoryId,

      subcategoryName:
        service.subcategoryName,

      updatedAt:
        timestamp,
    };

    await ddb.send(
      new PutCommand({
        TableName:
          SERVICE_TABLE,

        Item:
          item,

        ConditionExpression:
          'attribute_not_exists(serviceId)',
      }),
    );

    created.push(
      item,
    );
  }

  return created;
}


// ============================================================
// CREATE ONE PROVIDER + SALON + SERVICES
// ============================================================

async function seedProvider(
  provider,
  providerIndex,
  catalog,
) {
  console.log('');
  console.log(
    '============================================================',
  );

  console.log(
    `PROVIDER ${providerIndex + 1}/${PROVIDERS.length}`,
  );

  console.log(
    '============================================================',
  );

  console.log(
    `Salon       : ${provider.salonName}`,
  );

  console.log(
    `Owner       : ${provider.ownerName}`,
  );

  console.log(
    `Phone       : ${provider.phoneNumber}`,
  );

  console.log(
    `Location    : ${provider.latitude}, ${provider.longitude}`,
  );

  console.log(
    `Audiences   : ${provider.targetAudiences.join(', ')}`,
  );

  /*
   * ----------------------------------------------------------
   * IDs
   * ----------------------------------------------------------
   */

  const userId =
    randomUUID();

  const salonId =
    `SALON#${randomUUID()}`;

  console.log(
    `User ID     : ${userId}`,
  );

  console.log(
    `Salon ID    : ${salonId}`,
  );

  /*
   * ----------------------------------------------------------
   * SERVICES
   * ----------------------------------------------------------
   */

  const services =
    createServicesForProvider(
      provider,
      catalog,
      providerIndex,
    );

  console.log('');
  console.log(
    `Services    : ${services.length}`,
  );

  for (
    const service
    of services
  ) {
    console.log(
      `  ${service.categoryName} > ${service.subcategoryName} > ${service.name}`,
    );

    console.log(
      `  ${service.audience} | ₹${service.price} | ${service.duration} min`,
    );
  }

  /*
   * ----------------------------------------------------------
   * USER
   * ----------------------------------------------------------
   */

  console.log('');
  console.log(
    'Creating user...',
  );

  await createUser(
    provider,
    userId,
    salonId,
  );

  console.log(
    'User created.',
  );

  /*
   * ----------------------------------------------------------
   * SALON
   * ----------------------------------------------------------
   */

  console.log(
    'Creating salon...',
  );

  await createSalon(
    provider,
    userId,
    salonId,
    services,
    providerIndex,
  );

  console.log(
    'Salon created.',
  );

  /*
   * ----------------------------------------------------------
   * SERVICE TABLE
   * ----------------------------------------------------------
   */

  console.log(
    'Creating service records...',
  );

  const createdServices =
    await createServices(
      salonId,
      services,
    );

  console.log(
    `Created ${createdServices.length} service records.`,
  );

  console.log('');
  console.log(
    `✓ ${provider.salonName} completed`,
  );
}


// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('');
  console.log(
    '############################################################',
  );

  console.log(
    '# CLAVATA NEARBY SALON SEED',
  );

  console.log(
    '############################################################',
  );

  console.log('');

  console.log(
    `AWS Region       : ${AWS_REGION}`,
  );

  console.log(
    `User table       : ${USER_TABLE}`,
  );

  console.log(
    `Salon table      : ${SALON_TABLE}`,
  );

  console.log(
    `Service table    : ${SERVICE_TABLE}`,
  );

  console.log(
    `Category table   : ${CATEGORY_TABLE}`,
  );

  console.log(
    `Subcategory table: ${SUBCATEGORY_TABLE}`,
  );

  console.log('');

  console.log(
    'TEST LOCATION',
  );

  console.log(
    'Latitude : 12.9352',
  );

  console.log(
    'Longitude: 77.6245',
  );

  /*
   * ----------------------------------------------------------
   * LOAD CATALOG
   * ----------------------------------------------------------
   */

  const catalog =
    await loadCatalog();

  /*
   * ----------------------------------------------------------
   * SEED PROVIDERS
   * ----------------------------------------------------------
   */

  let successful =
    0;

  let failed =
    0;

  for (
    let i = 0;
    i < PROVIDERS.length;
    i++
  ) {
    try {
      await seedProvider(
        PROVIDERS[i],
        i,
        catalog,
      );

      successful++;

    } catch (error) {
      failed++;

      console.error('');
      console.error(
        'FAILED:',
        PROVIDERS[i].salonName,
      );

      console.error(
        error?.message ||
        error,
      );

      console.error('');
      console.error(
        'Continuing with next provider...',
      );
    }
  }

  /*
   * ----------------------------------------------------------
   * SUMMARY
   * ----------------------------------------------------------
   */

  console.log('');
  console.log(
    '############################################################',
  );

  console.log(
    '# SEED FINISHED',
  );

  console.log(
    '############################################################',
  );

  console.log('');

  console.log(
    `Successful providers: ${successful}`,
  );

  console.log(
    `Failed providers    : ${failed}`,
  );

  console.log(
    `Requested providers : ${PROVIDERS.length}`,
  );

  console.log('');

  console.log(
    'Distance test distribution:',
  );

  console.log(
    '  ~0 km     Blush Beauty Lounge',
  );

  console.log(
    '  ~0.2 km   Priya Family Salon',
  );

  console.log(
    '  ~0.6 km   Urban Men Studio',
  );

  console.log(
    '  ~1 km     Glow & Grace Salon',
  );

  console.log(
    '  ~1.6 km   Style Street Unisex',
  );

  console.log(
    '  ~1.8 km   Ananya Beauty Studio',
  );

  console.log(
    '  ~2.7 km   The Gentlemen Hub',
  );

  console.log(
    '  ~3 km     Classic Cuts',
  );

  console.log(
    '  ~5 km     Divya Spa & Wellness',
  );

  console.log(
    '  ~6-7 km   Nandini Family Beauty',
  );

  console.log('');
  console.log(
    'Nearby salon seed completed.',
  );
}


// ============================================================
// EXECUTE
// ============================================================

main()
  .catch(error => {
    console.error('');
    console.error(
      '############################################################',
    );

    console.error(
      '# FATAL ERROR',
    );

    console.error(
      '############################################################',
    );

    console.error('');

    console.error(
      error,
    );

    process.exit(1);
  });