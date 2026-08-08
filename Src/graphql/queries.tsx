import { gql } from '@apollo/client';

export const SEND_OTP = gql`
  mutation SendOTP($phoneNumber: String!) {
  sendOTP(phoneNumber: $phoneNumber) {
    success
    message
  }
}
`;

export const VERIFY_OTP = gql`
  mutation VerifyOTP($phoneNumber: String!, $otp: String!) {
    verifyOTP(
      phoneNumber: $phoneNumber
      otp: $otp
    ) {
      success
      message
      isExistingUser

      user {
        userId
        phoneNumber
        fullName
        
        activeRole
        providerStatus
        salonId

        roles {
          customer
          businessPartner
        }

        createdAt
        updatedAt
      }
    }
  }
`;

export const REGISTER_USER = gql`
  mutation RegisterUser($input: RegisterUserInput!) {
    registerUser(input: $input) {
      success
      message

      user {
        userId
        phoneNumber
        fullName
        salonId
        activeRole
        providerStatus

        roles {
          customer
          businessPartner
        }

        createdAt
        updatedAt
      }
    }
  }
`;

export const REGISTER_SALON_PARTNER = gql`
  mutation RegisterSalonPartner(
    $input: RegisterSalonPartnerInput!
  ) {
    registerSalonPartner(input: $input) {
      success
      message
      salonId
    }
  }
`;


export const CREATE_SERVICE = gql`
  mutation CreateService($input: CreateServiceInput!) {
    createService(input: $input) {
      success
      message
      service {
        serviceId
        salonId
        name
        category
        description
        duration
        price
        gender
        popular
        active
        createdAt
      }
    }
  }
`;

export const UPDATE_SERVICE = gql`
mutation UpdateService($input: UpdateServiceInput!) {
  updateService(input: $input) {
    success
    message
    service {
      serviceId
      name
      category
      description
      duration
      price
      gender
      popular
      active
    }
  }
}`;


export const DELETE_SERVICE = gql`
mutation DeleteService($input: DeleteServiceInput!) {
  deleteService(input: $input) {
    success
    message
  }
}`;

export const LIST_SERVICES = gql`
query ListServices($salonId: ID!) {
  listServices(salonId: $salonId) {
    serviceId
    salonId
    name
    category
    description
    duration
    price
    gender
    popular
    active
    createdAt
  }
}`

export const GET_NEARBY_SALONS = gql`
  query NearbySalons(
  $latitude: Float!
  $longitude: Float!
  $radius: Float!
) {
  nearbySalons(
    latitude: $latitude
    longitude: $longitude
    radius: $radius
  ) {
    salonId
    salonName
    averageRating
    logoUrl
    distance
     address {
      addressLine
      city
      state
      pincode
    }
  }
}
`;

export const CREATE_BOOKING = gql`
mutation CreateBooking($input: CreateBookingInput!) {
  createBooking(input: $input) {
    success
    message
    booking {
      bookingId
    }
  }
}`;

export const CUSTOMER_BOOKINGS = gql`
query CustomerBookings($customerUserId: ID!) {
  customerBookings(customerUserId: $customerUserId) {
    bookingId
    salonId
    customerUserId
    salonName
    customerName
    bookingDate
    startTime
    endTime
    reviewSubmitted
    rating
    review
    reviewedAt
    bookingStatus
    paymentMethod
    paymentStatus
    bookingFee
    bookingFeeStatus
    bookingFeePaidAt
    remainingAmount
    totalAmount
    services {
      serviceId
      name
      category
      duration
      price
    }
  }
}
`;

// export const UPDATE_BOOKING_PAYMENT_STATUS = gql`
// mutation UpdateBookingPaymentStatus(
// $bookingId:ID!,
// $paymentId:String!,
// $bookingFeeStatus:String!
// ){
// updateBookingPaymentStatus(
// bookingId:$bookingId,
// paymentId:$paymentId,
// bookingFeeStatus:$bookingFeeStatus
// ){
// bookingId
// bookingFeeStatus
// paymentId
// }
// }`;

export const CREATE_RAZORPAY_ORDER = gql`
mutation CreateRazorpayOrder(
  $input: CreateRazorpayOrderInput!
){
  createRazorpayOrder(
    input:$input
  ){
    success
    message
    order{
      orderId
      amount
      currency
      keyId
    }
  }
}
`;

export const VERIFY_RAZORPAY_PAYMENT = gql`
mutation VerifyRazorpayPayment(
  $input: VerifyRazorpayPaymentInput!
){
  verifyRazorpayPayment(
    input:$input
  ){
    success
    message
    booking{
      bookingId
      bookingFeeStatus
      paymentStatus
      bookingFeePaidAt
      razorpayOrderId
      razorpayPaymentId
    }
  }
}
`;

//list salon bookings
export const LIST_BOOKINGS = gql`query SalonBookings($salonId: ID!) {
  salonBookings(salonId: $salonId) {
    bookingId
    customerName
    customerPhone
    bookingDate
    startTime
    endTime
    bookingStatus
    totalAmount
    bookingFeeStatus
    bookingFee
    services {
      name
    }
  }
}`;

export const ACCEPT_BOOKING = gql`
mutation AcceptBooking(
  $bookingId: ID!,
  $salonNote: String
) {
  updateBookingStatus(
    input: {
      bookingId: $bookingId
      bookingStatus: CONFIRMED
      salonNote: $salonNote
    }
  ) {
    success
    message
    booking {
      bookingId
      bookingStatus
      salonNote
    }
  }
}
`;

export const REJECT_BOOKING = gql`
mutation RejectBooking(
  $bookingId: ID!,
  $salonNote: String
) {
  updateBookingStatus(
    input: {
      bookingId: $bookingId
      bookingStatus: CANCELLED
      salonNote: $salonNote
    }
  ) {
    success
    message
    booking {
      bookingStatus
      salonNote
    }
  }
}
`;

export const CANCEL_BOOKING = gql`
mutation CancelBooking(
  $bookingId: ID!,
  $salonNote: String
) {
  updateBookingStatus(
    input: {
      bookingId: $bookingId
      bookingStatus: CANCELLED
      salonNote: $salonNote
    }
  ) {
    success
    message
    booking {
      bookingId
      bookingStatus
      salonNote
    }
  }
}
`;

export const COMPLETE_BOOKING = gql`
  mutation CompleteBooking($input: UpdateBookingStatusInput!) {
    updateBookingStatus(input: $input) {
      success
      message
      booking {
        bookingId
        bookingStatus
        updatedAt
      }
    }
  }
`;

export const CREATE_REVIEW = gql`
mutation CreateReview($input: CreateReviewInput!) {
  createReview(input: $input) {
    success
    message
    review {
      reviewId
      rating
      review
    }
  }
}`;

export const SALON_DASHBOARD_QUERY = gql`
  query SalonDashboard($salonId: ID!) {
    salonBookings(salonId: $salonId) {
      bookingId
      salonId
      customerUserId
      salonName
      customerName
      customerPhone
      bookingDate
      startTime
      endTime

      services {
        serviceId
        name
        category
        duration
        price
      }

      totalDuration
      subtotal
      discount
      totalAmount

      paymentMethod
      paymentStatus
      bookingStatus

      notes
      salonNote

      bookingFee
      bookingFeeStatus
      bookingFeePaidAt
      remainingAmount

      razorpayOrderId
      razorpayPaymentId
      paymentGateway

      reviewSubmitted
      rating
      review
      reviewedAt

      createdAt
      updatedAt
    }
  }
`;

export const LIST_STAFF = gql`
    query ListStaff($salonId: ID!) {
        listStaff(salonId: $salonId) {
            staffId
            salonId
            name
            phoneNumber
            email
            gender
            profileImageUrl
            specializations
            isActive
            createdAt
            updatedAt
        }
    }
`;

export const UPDATE_STAFF = gql`
    mutation UpdateStaff($input: UpdateStaffInput!) {
        updateStaff(input: $input) {
            success
            message
            staff {
                staffId
                salonId
                name
                phoneNumber
                email
                gender
                specializations
                isActive
            }
        }
    }
`;


export const CREATE_STAFF = gql`
    mutation CreateStaff($input: CreateStaffInput!) {
        createStaff(input: $input) {
            success
            message

            staff {
                staffId
                salonId
                name
                phoneNumber
                email
                gender
                specializations
                isActive
            }
        }
    }
`;

// Define the GraphQL mutation
// export const CREATE_USER_WALLETS = gql`
//   mutation createUserWalletAddress(
//     $createuserwalletaddressinput: CreateUserWalletAddressInput!
//   ) {
//     createUserWalletAddress(input: $createuserwalletaddressinput) {
//       emailAddress
//       userWallet
//       date
//       applicantId
//       accessToken
//     }
//   }
// `;

// export const UPDATE_KYC_STATUS = gql`
//   mutation updateIsVerified(
//     $emailAddress: String!
//     $is_verified: Boolean!
//     $applicantId: String
//     $accessToken: String
//     $kycDetails: String
//   ) {
//     updateIsVerified(
//       input: {
//         emailAddress: $emailAddress
//         is_verified: $is_verified
//         applicantId: $applicantId
//         accessToken: $accessToken
//         kycDetails: $kycDetails
//       }
//     ) {
//       emailAddress
//       is_verified
//       applicantId
//       accessToken
//       kycDetails
//     }
//   }
// `;




// // export const GET_USER_WALLET_ADDRESS = gql`
// //   query getUserWalletAddress($emailAddress: String!) {
// //     getUserWalletAddress(emailAddress: $emailAddress) {
// //       emailAddress
// //       userWallet
// //       is_verified
// //       date
// //       applicantId
// //       accessToken
// //       kycDetails
// //     }
// //   }
// // `;

// export const CREATE_KYC_VERIFICATION = gql`
//   mutation createKYCVerification($email: String!, $levelName: String!) {
//     createKYCVerification(input: {email: $email, levelName: $levelName}) {
//       response
//     }
//   }
// `;

// export const CREATE_TRANSACTION_HISTORY_MOBILE = gql`
//   mutation createTransactionHistoryMobile(
//     $input: CreateTransactionHistoryMobileInput!
//   ) {
//     createTransactionHistoryMobile(input: $input) {
//       transactionHash
//       method
//       createdAt
//       from
//       to
//       amount
//       txnFee
//       coinCode
//       transactionStatus
//     }
//   }
// `;

// export const LIST_TRANSACTION_HISTORY = gql`
//   query listTransactionHistoryMobiles(
//     $filter: TableTransactionHistoryMobileFilterInput
//     $limit: Int
//     $nextToken: String
//   ) {
//     listTransactionHistoryMobiles(
//       filter: $filter
//       limit: $limit
//       nextToken: $nextToken
//     ) {
//       nextToken
//       items {
//         amount
//         coinCode
//         createdAt
//         from
//         method
//         to
//         transactionHash
//         transactionStatus
//         txnFee
//       }
//     }
//   }
// `;

// export const LIST_PLATFORM_SETTINGS = gql`
//   query ListPlatformSettings(
//     $filter: TablePlatformSettingsFilterInput
//     $limit: Int
//   ) {
//     listPlatformSettings(filter: $filter, limit: $limit) {
//       items {
//         pId
//         keyName
//         value
//       }
//     }
//   }
// `;
