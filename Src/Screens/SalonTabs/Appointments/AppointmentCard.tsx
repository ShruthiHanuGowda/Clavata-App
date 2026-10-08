import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import {COLORS} from '../../../constants/constants';

const THEME_COLOR =
  COLORS?.themeColor || '#009D94';

// ============================================================
// TYPES
// ============================================================

export type Service = {
  serviceId?: string;
  name?: string | null;
  serviceName?: string | null;

  audience?:
    | 'FEMALE'
    | 'MALE'
    | 'KIDS'
    | string
    | null;

  category?: string | null;
  categoryName?: string | null;

  subcategory?: string | null;
  subcategoryName?: string | null;

  categoryId?: string | null;
  subcategoryId?: string | null;

  duration?: number | null;
  durationMinutes?: number | null;

  price?: number | null;
};

export type Booking = {
  bookingId: string;

  salonId?: string | null;
  customerUserId?: string | null;

  salonName?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;

  bookingDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;

  services?: Service[] | null;

  totalDuration?: number | null;
  subtotal?: number | null;
  discount?: number | null;
  totalAmount?: number | null;

  paymentMethod?: string | null;
  paymentStatus?: string | null;
  bookingStatus?: string | null;

  notes?: string | null;
  salonNote?: string | null;

  // ==========================================================
  // CLAVATA BOOKING FEE
  // ==========================================================

  bookingFee?: number | null;
  bookingFeeStatus?: string | null;
  bookingFeePaidAt?: string | null;

  remainingAmount?: number | null;

  bookingFeePaymentDeadline?: string | null;
  bookingFeePaymentWindowMinutes?: number | null;

  // ==========================================================
  // PAYMENT GATEWAY
  // ==========================================================

  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  paymentGateway?: string | null;

  // ==========================================================
  // REVIEW
  // ==========================================================

  reviewSubmitted?: boolean | null;
  rating?: number | null;
  review?: string | null;
  reviewedAt?: string | null;

  // ==========================================================
  // SALON RESPONSE WINDOW
  // ==========================================================

  salonResponseStatus?: string | null;
  salonResponseDeadline?: string | null;
  salonResponseWindowMinutes?: number | null;

  // ==========================================================
  // TIMESTAMPS
  // ==========================================================

  createdAt?: string | null;
  updatedAt?: string | null;
};

// ============================================================
// PROPS
// ============================================================

type AppointmentCardProps = {
  booking: Booking;

  onAccept: () => Promise<void>;

  onReject: () => Promise<void>;

  onComplete: () => Promise<void>;

  onTimerExpired?: () => void | Promise<void>;
};

// ============================================================
// HELPERS
// ============================================================

const formatAudience = (
  audience?: string | null,
) => {
  if (!audience) {
    return 'UNKNOWN';
  }

  switch (
    String(audience).toUpperCase()
  ) {
    case 'FEMALE':
      return 'Female';

    case 'MALE':
      return 'Male';

    case 'KIDS':
      return 'Kids';

    default:
      return audience;
  }
};

const formatDate = (
  date?: string | null,
) => {
  if (!date) {
    return 'Date not available';
  }

  try {
    return new Date(
      `${date}T00:00:00`,
    ).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return date;
  }
};

const formatPrice = (
  price?: number | null,
) => {
  const value = Number(price);

  if (!Number.isFinite(value)) {
    return '₹0';
  }

  return `₹${value.toLocaleString(
    'en-IN',
  )}`;
};

const formatDuration = (
  duration?: number | null,
) => {
  const value = Number(duration);

  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return '—';
  }

  if (value < 60) {
    return `${value} min`;
  }

  const hours =
    Math.floor(value / 60);

  const minutes =
    value % 60;

  if (minutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${minutes} min`;
};

const getStatusColor = (
  status?: string | null,
) => {
  switch (
    String(status || '').toUpperCase()
  ) {
    case 'CONFIRMED':
      return '#2E7D32';

    case 'COMPLETED':
      return '#1565C0';

    case 'CANCELLED':
    case 'REJECTED':
    case 'EXPIRED':
      return '#C62828';

    case 'PENDING':
      return '#EF6C00';

    default:
      return THEME_COLOR;
  }
};

// ============================================================
// DEADLINE HELPERS
// ============================================================

const getDeadlineMs = (
  deadline?: string | number | null,
): number => {
  if (
    deadline === null ||
    deadline === undefined ||
    deadline === ''
  ) {
    return 0;
  }

  if (
    typeof deadline === 'number' &&
    Number.isFinite(deadline)
  ) {
    return deadline;
  }

  const value =
    String(deadline);

  if (/^\d+$/.test(value)) {
    const numericValue =
      Number(value);

    if (
      Number.isFinite(
        numericValue,
      )
    ) {
      return numericValue;
    }
  }

  const parsed =
    new Date(value).getTime();

  return Number.isFinite(parsed)
    ? parsed
    : 0;
};

const getRemainingSeconds = (
  deadline?: string | number | null,
  nowMs: number = Date.now(),
): number => {
  const deadlineMs =
    getDeadlineMs(deadline);

  if (!deadlineMs) {
    return 0;
  }

  const remainingMs =
    deadlineMs - nowMs;

  if (remainingMs <= 0) {
    return 0;
  }

  return Math.ceil(
    remainingMs / 1000,
  );
};

const formatCountdown = (
  totalSeconds: number,
): string => {
  const seconds =
    Math.max(
      0,
      Math.floor(
        Number(totalSeconds) || 0,
      ),
    );

  const hours =
    Math.floor(
      seconds / 3600,
    );

  const minutes =
    Math.floor(
      (seconds % 3600) / 60,
    );

  const remainingSeconds =
    seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(
      minutes,
    ).padStart(2, '0')}:${String(
      remainingSeconds,
    ).padStart(2, '0')}`;
  }

  return `${String(
    minutes,
  ).padStart(2, '0')}:${String(
    remainingSeconds,
  ).padStart(2, '0')}`;
};

// ============================================================
// COMPONENT
// ============================================================

const AppointmentCard: React.FC<
  AppointmentCardProps
> = ({
  booking,
  onAccept,
  onReject,
  onComplete,
  onTimerExpired,
}) => {

  // ==========================================================
  // MODAL
  // ==========================================================

  const [
    detailsVisible,
    setDetailsVisible,
  ] = React.useState(false);

  // ==========================================================
  // ACTION LOADING
  // ==========================================================

  const [
    actionLoading,
    setActionLoading,
  ] = React.useState(false);

  // ==========================================================
  // LOCAL CLOCK
  // ==========================================================

  const [
    nowMs,
    setNowMs,
  ] = React.useState(
    () => Date.now(),
  );

  React.useEffect(() => {
    const timer =
      setInterval(() => {
        setNowMs(Date.now());
      }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // ==========================================================
  // SERVICES
  // ==========================================================

  const services =
    React.useMemo(() => {
      const rawServices =
        Array.isArray(
          booking?.services,
        )
          ? booking.services
          : [];

      return rawServices.map(
        (
          service: Service,
        ) => ({
          serviceId:
            service?.serviceId ??
            '',

          name:
            service?.name ??
            service?.serviceName ??
            '',

          audience:
            service?.audience ??
            null,

          category:
            service?.category ??
            service?.categoryName ??
            null,

          subcategory:
            service?.subcategory ??
            service?.subcategoryName ??
            null,

          categoryId:
            service?.categoryId ??
            null,

          subcategoryId:
            service?.subcategoryId ??
            null,

          duration:
            service?.duration ??
            service?.durationMinutes ??
            null,

          price:
            service?.price ??
            null,
        }),
      );
    }, [
      booking?.services,
    ]);

  // ==========================================================
  // STATUS
  // ==========================================================

  const bookingStatus =
    String(
      booking?.bookingStatus ||
        '',
    ).toUpperCase();

  const bookingFeeStatus =
    String(
      booking?.bookingFeeStatus ||
        '',
    ).toUpperCase();

  const salonResponseStatus =
    String(
      booking?.salonResponseStatus ||
        '',
    ).toUpperCase();

  const statusColor =
    getStatusColor(
      bookingStatus,
    );

  // ==========================================================
  // COMPLETION
  // ==========================================================

  const bookingFeePaid =
    bookingFeeStatus === 'PAID';

  const canMarkCompleted =
    bookingStatus ===
      'CONFIRMED' &&
    bookingFeePaid;

  // ==========================================================
  // SALON RESPONSE DEADLINE
  // ==========================================================

  const salonResponseDeadline =
    booking?.salonResponseDeadline;

  // ==========================================================
  // SALON RESPONSE TIMER
  // ==========================================================

  const salonResponseRemainingSeconds =
    React.useMemo(() => {

      if (
        bookingStatus !==
        'PENDING'
      ) {
        return 0;
      }

      if (
        salonResponseStatus !==
        'PENDING'
      ) {
        return 0;
      }

      if (
        !salonResponseDeadline
      ) {
        return 0;
      }

      return getRemainingSeconds(
        salonResponseDeadline,
        nowMs,
      );

    }, [
      bookingStatus,
      salonResponseStatus,
      salonResponseDeadline,
      nowMs,
    ]);

  const hasSalonResponseTimer =
    !!salonResponseDeadline;

  const salonResponseExpired =
    bookingStatus ===
      'PENDING' &&
    salonResponseStatus ===
      'PENDING' &&
    hasSalonResponseTimer &&
    salonResponseRemainingSeconds <=
      0;

  const showSalonResponseTimer =
    bookingStatus ===
      'PENDING' &&
    salonResponseStatus ===
      'PENDING' &&
    hasSalonResponseTimer &&
    salonResponseRemainingSeconds >
      0;

  const salonResponseTimerUnavailable =
    bookingStatus ===
      'PENDING' &&
    salonResponseStatus ===
      'PENDING' &&
    !hasSalonResponseTimer;

  // ==========================================================
  // TIMER EXPIRY CALLBACK
  // ==========================================================

  const timerExpiryNotifiedRef =
    React.useRef(false);

  React.useEffect(() => {
    timerExpiryNotifiedRef.current =
      false;
  }, [
    booking?.bookingId,
    salonResponseDeadline,
    salonResponseStatus,
    bookingStatus,
  ]);

  React.useEffect(() => {

    if (
      bookingStatus !==
      'PENDING'
    ) {
      return;
    }

    if (
      salonResponseStatus !==
      'PENDING'
    ) {
      return;
    }

    if (
      !salonResponseDeadline
    ) {
      return;
    }

    if (
      salonResponseRemainingSeconds >
      0
    ) {
      return;
    }

    if (
      timerExpiryNotifiedRef.current
    ) {
      return;
    }

    timerExpiryNotifiedRef.current =
      true;

    console.log(
      '[AppointmentCard] salon response timer expired:',
      booking?.bookingId,
    );

    if (onTimerExpired) {
      Promise.resolve(
        onTimerExpired(),
      ).catch(
        error => {
          console.log(
            '[AppointmentCard] timer expiry callback error:',
            error,
          );
        },
      );
    }

  }, [
    booking?.bookingId,
    bookingStatus,
    salonResponseStatus,
    salonResponseDeadline,
    salonResponseRemainingSeconds,
    onTimerExpired,
  ]);

  // ==========================================================
  // CUSTOMER ₹9 PAYMENT TIMER
  // ==========================================================

  const paymentDeadline =
    booking?.bookingFeePaymentDeadline;

  const paymentRemainingSeconds =
    React.useMemo(() => {

      if (
        bookingStatus !==
        'CONFIRMED'
      ) {
        return 0;
      }

      if (
        bookingFeeStatus !==
        'PENDING'
      ) {
        return 0;
      }

      if (
        !paymentDeadline
      ) {
        return 0;
      }

      return getRemainingSeconds(
        paymentDeadline,
        nowMs,
      );

    }, [
      bookingStatus,
      bookingFeeStatus,
      paymentDeadline,
      nowMs,
    ]);

  const hasPaymentDeadline =
    !!paymentDeadline;

  const paymentWindowExpired =
    bookingStatus ===
      'CONFIRMED' &&
    bookingFeeStatus ===
      'PENDING' &&
    hasPaymentDeadline &&
    paymentRemainingSeconds <=
      0;

  const showPaymentTimer =
    bookingStatus ===
      'CONFIRMED' &&
    bookingFeeStatus ===
      'PENDING' &&
    hasPaymentDeadline &&
    paymentRemainingSeconds >
      0;

  const showPaymentPendingWithoutDeadline =
    bookingStatus ===
      'CONFIRMED' &&
    bookingFeeStatus ===
      'PENDING' &&
    !hasPaymentDeadline;

  // ==========================================================
  // ACTION HANDLER
  // ==========================================================

  const handleAction =
    async (
      action: () => Promise<void>,
    ) => {

      if (actionLoading) {
        return;
      }

      try {

        setActionLoading(true);

        await action();

        setDetailsVisible(false);

      } catch (error) {

        console.log(
          '[AppointmentCard] ACTION ERROR:',
          error,
        );

      } finally {

        setActionLoading(false);

      }
    };

  // ==========================================================
  // ACCEPT
  // ==========================================================

  const handleAccept =
    async () => {

      console.log(
        '====================================================',
      );

      console.log(
        '[AppointmentCard] ACCEPT BUTTON PRESSED',
      );

      console.log(
        '[AppointmentCard] bookingId:',
        booking?.bookingId,
      );

      console.log(
        '[AppointmentCard] bookingStatus:',
        bookingStatus,
      );

      console.log(
        '[AppointmentCard] salonResponseStatus:',
        salonResponseStatus,
      );

      console.log(
        '[AppointmentCard] salonResponseDeadline:',
        salonResponseDeadline,
      );

      console.log(
        '[AppointmentCard] salonResponseRemainingSeconds:',
        salonResponseRemainingSeconds,
      );

      console.log(
        '[AppointmentCard] salonResponseExpired:',
        salonResponseExpired,
      );

      console.log(
        '[AppointmentCard] salonResponseTimerUnavailable:',
        salonResponseTimerUnavailable,
      );

      console.log(
        '[AppointmentCard] actionLoading:',
        actionLoading,
      );

      console.log(
        '====================================================',
      );

      if (
        bookingStatus !==
        'PENDING'
      ) {

        console.log(
          '[AppointmentCard] ACCEPT BLOCKED: booking is not PENDING',
        );

        return;
      }

      if (
        salonResponseExpired
      ) {

        console.log(
          '[AppointmentCard] ACCEPT BLOCKED: response timer expired',
        );

        return;
      }

      if (
        salonResponseTimerUnavailable
      ) {

        console.log(
          '[AppointmentCard] ACCEPT BLOCKED: response timer unavailable',
        );

        return;
      }

      if (actionLoading) {

        console.log(
          '[AppointmentCard] ACCEPT BLOCKED: action already loading',
        );

        return;
      }

      console.log(
        '[AppointmentCard] CALLING onAccept()',
      );

      await handleAction(
        onAccept,
      );

    };

  // ==========================================================
  // REJECT
  // ==========================================================

  const handleReject =
    async () => {

      console.log(
        '[AppointmentCard] REJECT BUTTON PRESSED:',
        booking?.bookingId,
      );

      if (
        bookingStatus !==
        'PENDING'
      ) {

        console.log(
          '[AppointmentCard] REJECT BLOCKED: booking is not PENDING',
        );

        return;
      }

      if (
        salonResponseExpired
      ) {

        console.log(
          '[AppointmentCard] REJECT BLOCKED: timer expired',
        );

        return;
      }

      if (
        salonResponseTimerUnavailable
      ) {

        console.log(
          '[AppointmentCard] REJECT BLOCKED: timer unavailable',
        );

        return;
      }

      if (actionLoading) {
        return;
      }

      await handleAction(
        onReject,
      );

    };

  // ==========================================================
  // COMPLETE
  // ==========================================================

  const handleComplete =
    async () => {

      console.log(
        '[AppointmentCard] COMPLETE PRESSED:',
        booking?.bookingId,
      );

      if (
        !canMarkCompleted
      ) {

        console.log(
          '[AppointmentCard] COMPLETE BLOCKED:',
          {
            bookingStatus,
            bookingFeeStatus,
          },
        );

        return;
      }

      await handleAction(
        onComplete,
      );

    };

  // ==========================================================
  // SERVICE COUNT
  // ==========================================================

  const serviceCount =
    services.length;

  // ==========================================================
  // MAIN CARD
  // ==========================================================

  return (
    <>
      <View
        style={styles.card}
      >

        {/* TOP ROW */}

        <View
          style={styles.topRow}
        >

          <View
            style={
              styles.customerSection
            }
          >

            <Text
              style={
                styles.customerName
              }
              numberOfLines={1}
            >
              {booking?.customerName ||
                'Customer'}
            </Text>

            <Text
              style={
                styles.bookingId
              }
            >
              #{booking?.bookingId ||
                '—'}
            </Text>

          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  `${statusColor}18`,
              },
            ]}
          >

            <Text
              style={[
                styles.statusText,
                {
                  color:
                    statusColor,
                },
              ]}
            >
              {bookingStatus ||
                'UNKNOWN'}
            </Text>

          </View>

        </View>

        {/* DATE / TIME */}

        <View
          style={styles.infoRow}
        >

          <View
            style={styles.infoItem}
          >

            <Text
              style={
                styles.infoLabel
              }
            >
              Date
            </Text>

            <Text
              style={
                styles.infoValue
              }
            >
              {formatDate(
                booking?.bookingDate,
              )}
            </Text>

          </View>

          <View
            style={styles.infoItem}
          >

            <Text
              style={
                styles.infoLabel
              }
            >
              Time
            </Text>

            <Text
              style={
                styles.infoValue
              }
            >
              {booking?.startTime ||
                '—'}

              {booking?.endTime
                ? ` - ${booking.endTime}`
                : ''}
            </Text>

          </View>

        </View>

        {/* SUMMARY */}

        <View
          style={
            styles.summaryRow
          }
        >

          <View>

            <Text
              style={
                styles.infoLabel
              }
            >
              Services
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              {serviceCount}{' '}
              {serviceCount === 1
                ? 'service'
                : 'services'}
            </Text>

          </View>

          <View
            style={
              styles.totalSection
            }
          >

            <Text
              style={
                styles.infoLabel
              }
            >
              Total
            </Text>

            <Text
              style={
                styles.totalAmount
              }
            >
              {formatPrice(
                booking?.totalAmount,
              )}
            </Text>

          </View>

        </View>

        {/* SALON RESPONSE TIMER */}

        {showSalonResponseTimer && (
          <View
            style={
              styles.salonResponseTimerBox
            }
          >

            <View
              style={
                styles.salonResponseTimerHeader
              }
            >

              <View
                style={
                  styles.salonResponseTimerDot
                }
              />

              <Text
                style={
                  styles.salonResponseTimerTitle
                }
              >
                Accept this booking
              </Text>

            </View>

            <View
              style={
                styles.salonResponseTimerContent
              }
            >

              <Text
                style={
                  styles.salonResponseTimerLabel
                }
              >
                Time remaining
              </Text>

              <Text
                style={
                  styles.salonResponseTimerValue
                }
              >
                {formatCountdown(
                  salonResponseRemainingSeconds,
                )}
              </Text>

            </View>

            <Text
              style={
                styles.salonResponseTimerHint
              }
            >
              Please accept or reject this
              booking before the timer expires.
            </Text>

          </View>
        )}

        {/* SALON RESPONSE EXPIRED */}

        {salonResponseExpired && (
          <View
            style={
              styles.salonResponseExpiredBox
            }
          >

            <Text
              style={
                styles.salonResponseExpiredTitle
              }
            >
              Booking request expired
            </Text>

            <Text
              style={
                styles.salonResponseExpiredText
              }
            >
              The response window has expired.
              This booking can no longer be
              accepted.
            </Text>

          </View>
        )}

        {/* SALON RESPONSE UNAVAILABLE */}

        {salonResponseTimerUnavailable && (
          <View
            style={
              styles.salonResponseUnavailableBox
            }
          >

            <Text
              style={
                styles.salonResponseUnavailableTitle
              }
            >
              Response timer unavailable
            </Text>

            <Text
              style={
                styles.salonResponseUnavailableText
              }
            >
              The booking response deadline
              was not provided. Please refresh
              the appointments.
            </Text>

          </View>
        )}

        {/* CUSTOMER PAYMENT TIMER */}

        {showPaymentTimer && (
          <View
            style={
              styles.paymentTimerBox
            }
          >

            <View
              style={
                styles.paymentTimerHeader
              }
            >

              <View
                style={
                  styles.paymentTimerDot
                }
              />

              <Text
                style={
                  styles.paymentTimerTitle
                }
              >
                ₹9 booking fee pending
              </Text>

            </View>

            <View
              style={
                styles.paymentTimerContent
              }
            >

              <Text
                style={
                  styles.paymentTimerLabel
                }
              >
                Customer payment window
              </Text>

              <Text
                style={
                  styles.paymentTimerValue
                }
              >
                {formatCountdown(
                  paymentRemainingSeconds,
                )}
              </Text>

            </View>

          </View>
        )}

        {/* PAYMENT WINDOW EXPIRED */}

        {paymentWindowExpired && (
          <View
            style={
              styles.paymentExpiredBox
            }
          >

            <Text
              style={
                styles.paymentExpiredTitle
              }
            >
              ₹9 payment window expired
            </Text>

            <Text
              style={
                styles.paymentExpiredText
              }
            >
              The customer did not complete
              the booking fee payment within
              the allowed time.
            </Text>

          </View>
        )}

        {/* CONFIRMED BUT NO PAYMENT DEADLINE */}

        {showPaymentPendingWithoutDeadline && (
          <View
            style={
              styles.paymentWaitingBox
            }
          >

            <Text
              style={
                styles.paymentWaitingTitle
              }
            >
              Waiting for customer payment
            </Text>

            <Text
              style={
                styles.paymentWaitingText
              }
            >
              The booking fee payment window
              is currently unavailable.
            </Text>

          </View>
        )}

        {/* VIEW DETAILS */}

        <TouchableOpacity
          style={
            styles.detailsButton
          }
          activeOpacity={0.8}
          onPress={() =>
            setDetailsVisible(true)
          }
        >

          <Text
            style={[
              styles.detailsButtonText,
              {
                color:
                  THEME_COLOR,
              },
            ]}
          >
            View Details
          </Text>

        </TouchableOpacity>

        {/* MAIN ACTIONS */}

        {bookingStatus ===
          'PENDING' &&
          !salonResponseExpired &&
          !salonResponseTimerUnavailable && (
            <View
              style={
                styles.actionsRow
              }
            >

              {/* REJECT */}

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.rejectButton,
                ]}
                activeOpacity={0.8}
                disabled={
                  actionLoading
                }
                onPress={
                  handleReject
                }
              >

                {actionLoading ? (
                  <ActivityIndicator
                    size="small"
                  />
                ) : (
                  <Text
                    style={
                      styles.rejectText
                    }
                  >
                    Reject
                  </Text>
                )}

              </TouchableOpacity>

              {/* ACCEPT */}

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor:
                      THEME_COLOR,
                  },
                ]}
                activeOpacity={0.8}
                disabled={
                  actionLoading
                }
                onPress={
                  handleAccept
                }
              >

                {actionLoading ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    style={
                      styles.acceptText
                    }
                  >
                    Accept
                  </Text>
                )}

              </TouchableOpacity>

            </View>
          )}

        {/* CONFIRMED + PAID */}

        {canMarkCompleted && (
          <TouchableOpacity
            style={[
              styles.completeButton,
              {
                backgroundColor:
                  THEME_COLOR,
              },
            ]}
            activeOpacity={0.8}
            disabled={
              actionLoading
            }
            onPress={
              handleComplete
            }
          >

            {actionLoading ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <Text
                style={
                  styles.completeText
                }
              >
                Mark as Completed
              </Text>
            )}

          </TouchableOpacity>
        )}

        {/* CONFIRMED BUT NOT PAID */}

        {bookingStatus ===
          'CONFIRMED' &&
          !bookingFeePaid &&
          !showPaymentTimer &&
          !paymentWindowExpired &&
          !showPaymentPendingWithoutDeadline && (
            <View
              style={
                styles.paymentWaitingBox
              }
            >

              <Text
                style={
                  styles.paymentWaitingTitle
                }
              >
                Waiting for customer payment
              </Text>

              <Text
                style={
                  styles.paymentWaitingText
                }
              >
                Mark as Completed will be
                available after the customer
                pays the booking fee.
              </Text>

            </View>
          )}

      </View>

      {/* ======================================================
          DETAILS MODAL
      ====================================================== */}

      <Modal
        visible={
          detailsVisible
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setDetailsVisible(false)
        }
      >

        <View
          style={
            styles.modalOverlay
          }
        >

          <View
            style={
              styles.modalContainer
            }
          >

            {/* HEADER */}

            <View
              style={
                styles.modalHeader
              }
            >

              <Text
                style={
                  styles.modalTitle
                }
              >
                Appointment Details
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setDetailsVisible(
                    false,
                  )
                }
              >

                <Text
                  style={[
                    styles.closeText,
                    {
                      color:
                        THEME_COLOR,
                    },
                  ]}
                >
                  ✕
                </Text>

              </TouchableOpacity>

            </View>

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.modalContent
              }
            >

              {/* CUSTOMER */}

              <View
                style={
                  styles.section
                }
              >

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Customer
                </Text>

                <Text
                  style={
                    styles.detailValue
                  }
                >
                  {booking?.customerName ||
                    '—'}
                </Text>

                {!!booking?.customerPhone && (
                  <Text
                    style={
                      styles.detailSubValue
                    }
                  >
                    {
                      booking.customerPhone
                    }
                  </Text>
                )}

              </View>

              {/* APPOINTMENT */}

              <View
                style={
                  styles.section
                }
              >

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Appointment
                </Text>

                <Text
                  style={
                    styles.detailValue
                  }
                >
                  {formatDate(
                    booking?.bookingDate,
                  )}
                </Text>

                <Text
                  style={
                    styles.detailSubValue
                  }
                >
                  {booking?.startTime ||
                    '—'}

                  {booking?.endTime
                    ? ` - ${booking.endTime}`
                    : ''}
                </Text>

              </View>

              {/* SALON TIMER */}

              {showSalonResponseTimer && (
                <View
                  style={
                    styles.modalSalonTimerBox
                  }
                >

                  <Text
                    style={
                      styles.modalSalonTimerTitle
                    }
                  >
                    Salon response required
                  </Text>

                  <Text
                    style={
                      styles.modalSalonTimerValue
                    }
                  >
                    {formatCountdown(
                      salonResponseRemainingSeconds,
                    )}
                  </Text>

                  <Text
                    style={
                      styles.modalSalonTimerText
                    }
                  >
                    Accept or reject this booking
                    before the response window
                    expires.
                  </Text>

                </View>
              )}

              {salonResponseExpired && (
                <View
                  style={
                    styles.modalSalonExpiredBox
                  }
                >

                  <Text
                    style={
                      styles.salonResponseExpiredTitle
                    }
                  >
                    Booking request expired
                  </Text>

                  <Text
                    style={
                      styles.salonResponseExpiredText
                    }
                  >
                    The salon response window has
                    expired.
                  </Text>

                </View>
              )}

              {salonResponseTimerUnavailable && (
                <View
                  style={
                    styles.modalSalonExpiredBox
                  }
                >

                  <Text
                    style={
                      styles.salonResponseUnavailableTitle
                    }
                  >
                    Response timer unavailable
                  </Text>

                  <Text
                    style={
                      styles.salonResponseUnavailableText
                    }
                  >
                    The booking response deadline
                    was not provided. Please
                    refresh the appointments.
                  </Text>

                </View>
              )}

              {/* SERVICES */}

              <View
                style={
                  styles.section
                }
              >

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Services
                </Text>

                {services.length === 0 ? (
                  <Text
                    style={
                      styles.emptyText
                    }
                  >
                    No services available
                  </Text>
                ) : (
                  services.map(
                    (
                      service,
                      index,
                    ) => (
                      <View
                        key={
                          service?.serviceId ||
                          `${service?.name}-${index}`
                        }
                        style={
                          styles.serviceItem
                        }
                      >

                        <Text
                          style={
                            styles.categoryPath
                          }
                        >
                          {service?.category ||
                            'Category not available'}

                          {' > '}

                          {service?.subcategory ||
                            'Subcategory not available'}
                        </Text>

                        <View
                          style={
                            styles.serviceHeader
                          }
                        >

                          <View
                            style={
                              styles.serviceNameSection
                            }
                          >

                            <Text
                              style={
                                styles.serviceName
                              }
                            >
                              {service?.name ||
                                'Service'}
                            </Text>

                            <View
                              style={[
                                styles.audienceBadge,
                                {
                                  backgroundColor:
                                    `${THEME_COLOR}18`,
                                },
                              ]}
                            >

                              <Text
                                style={[
                                  styles.audienceText,
                                  {
                                    color:
                                      THEME_COLOR,
                                  },
                                ]}
                              >
                                {formatAudience(
                                  service?.audience,
                                )}
                              </Text>

                            </View>

                          </View>

                          <Text
                            style={
                              styles.servicePrice
                            }
                          >
                            {formatPrice(
                              service?.price,
                            )}
                          </Text>

                        </View>

                        <Text
                          style={
                            styles.durationText
                          }
                        >
                          {formatDuration(
                            service?.duration,
                          )}
                        </Text>

                      </View>
                    ),
                  )
                )}

              </View>

              {/* PRICE */}

              <View
                style={
                  styles.section
                }
              >

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Payment Details
                </Text>

                <View
                  style={
                    styles.priceRow
                  }
                >

                  <Text
                    style={
                      styles.priceLabel
                    }
                  >
                    Subtotal
                  </Text>

                  <Text
                    style={
                      styles.priceValue
                    }
                  >
                    {formatPrice(
                      booking?.subtotal,
                    )}
                  </Text>

                </View>

                <View
                  style={
                    styles.priceRow
                  }
                >

                  <Text
                    style={
                      styles.priceLabel
                    }
                  >
                    Discount
                  </Text>

                  <Text
                    style={
                      styles.priceValue
                    }
                  >
                    -{formatPrice(
                      booking?.discount,
                    )}
                  </Text>

                </View>

                <View
                  style={[
                    styles.priceRow,
                    styles.totalRow,
                  ]}
                >

                  <Text
                    style={
                      styles.totalLabel
                    }
                  >
                    Total
                  </Text>

                  <Text
                    style={
                      styles.modalTotal
                    }
                  >
                    {formatPrice(
                      booking?.totalAmount,
                    )}
                  </Text>

                </View>

                <View
                  style={
                    styles.priceRow
                  }
                >

                  <Text
                    style={
                      styles.priceLabel
                    }
                  >
                    Booking Fee
                  </Text>

                  <Text
                    style={
                      styles.priceValue
                    }
                  >
                    {formatPrice(
                      booking?.bookingFee,
                    )}
                  </Text>

                </View>

                <View
                  style={
                    styles.priceRow
                  }
                >

                  <Text
                    style={
                      styles.priceLabel
                    }
                  >
                    Remaining at Salon
                  </Text>

                  <Text
                    style={
                      styles.priceValue
                    }
                  >
                    {formatPrice(
                      booking?.remainingAmount,
                    )}
                  </Text>

                </View>

                {!!booking?.bookingFeeStatus && (
                  <Text
                    style={[
                      styles.paymentStatus,
                      bookingFeePaid
                        ? styles.paymentStatusPaid
                        : styles.paymentStatusPending,
                    ]}
                  >
                    Booking Fee Status:{' '}
                    {
                      booking.bookingFeeStatus
                    }
                  </Text>
                )}

                {showPaymentTimer && (
                  <View
                    style={
                      styles.modalPaymentTimerBox
                    }
                  >

                    <Text
                      style={
                        styles.modalPaymentTimerTitle
                      }
                    >
                      ₹9 booking fee payment
                      pending
                    </Text>

                    <Text
                      style={
                        styles.modalPaymentTimerValue
                      }
                    >
                      {formatCountdown(
                        paymentRemainingSeconds,
                      )}
                    </Text>

                    <Text
                      style={
                        styles.modalPaymentTimerText
                      }
                    >
                      Customer must complete
                      the payment before the
                      payment window expires.
                    </Text>

                  </View>
                )}

                {paymentWindowExpired && (
                  <View
                    style={
                      styles.modalPaymentExpiredBox
                    }
                  >

                    <Text
                      style={
                        styles.paymentExpiredTitle
                      }
                    >
                      ₹9 payment window expired
                    </Text>

                    <Text
                      style={
                        styles.paymentExpiredText
                      }
                    >
                      The customer did not
                      complete the booking fee
                      payment within the allowed
                      time.
                    </Text>

                  </View>
                )}

                {bookingStatus ===
                  'CONFIRMED' &&
                  !bookingFeePaid &&
                  !showPaymentTimer &&
                  !paymentWindowExpired && (
                    <View
                      style={
                        styles.modalPaymentWaitingBox
                      }
                    >

                      <Text
                        style={
                          styles.modalPaymentWaitingTitle
                        }
                      >
                        Customer payment pending
                      </Text>

                      <Text
                        style={
                          styles.modalPaymentWaitingText
                        }
                      >
                        The customer must pay
                        the booking fee before
                        this appointment can be
                        marked as completed.
                      </Text>

                    </View>
                  )}

              </View>

              {/* PAYMENT METHOD */}

              {!!booking?.paymentMethod && (
                <View
                  style={
                    styles.section
                  }
                >

                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    Payment Method
                  </Text>

                  <Text
                    style={
                      styles.detailValue
                    }
                  >
                    {
                      booking.paymentMethod
                    }
                  </Text>

                </View>
              )}

              {/* NOTES */}

              {!!booking?.notes && (
                <View
                  style={
                    styles.section
                  }
                >

                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    Customer Note
                  </Text>

                  <Text
                    style={
                      styles.noteText
                    }
                  >
                    {booking.notes}
                  </Text>

                </View>
              )}

              {/* SALON NOTE */}

              {!!booking?.salonNote && (
                <View
                  style={
                    styles.section
                  }
                >

                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    Salon Note
                  </Text>

                  <Text
                    style={
                      styles.noteText
                    }
                  >
                    {booking.salonNote}
                  </Text>

                </View>
              )}

              {/* REVIEW */}

              {!!booking?.reviewSubmitted && (
                <View
                  style={
                    styles.section
                  }
                >

                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    Customer Review
                  </Text>

                  {!!booking?.rating && (
                    <Text
                      style={
                        styles.ratingText
                      }
                    >
                      {'★'.repeat(
                        booking.rating,
                      )}
                    </Text>
                  )}

                  {!!booking?.review && (
                    <Text
                      style={
                        styles.noteText
                      }
                    >
                      {booking.review}
                    </Text>
                  )}

                </View>
              )}

            </ScrollView>

            {/* MODAL ACTIONS */}

            {bookingStatus ===
              'PENDING' &&
              !salonResponseExpired &&
              !salonResponseTimerUnavailable && (
                <View
                  style={
                    styles.modalActions
                  }
                >

                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      styles.rejectButton,
                    ]}
                    disabled={
                      actionLoading
                    }
                    onPress={
                      handleReject
                    }
                  >

                    {actionLoading ? (
                      <ActivityIndicator
                        size="small"
                      />
                    ) : (
                      <Text
                        style={
                          styles.rejectText
                        }
                      >
                        Reject
                      </Text>
                    )}

                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      {
                        backgroundColor:
                          THEME_COLOR,
                      },
                    ]}
                    disabled={
                      actionLoading
                    }
                    onPress={
                      handleAccept
                    }
                  >

                    {actionLoading ? (
                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                      />
                    ) : (
                      <Text
                        style={
                          styles.acceptText
                        }
                      >
                        Accept
                      </Text>
                    )}

                  </TouchableOpacity>

                </View>
              )}

            {/* CONFIRMED + PAID */}

            {canMarkCompleted && (
              <TouchableOpacity
                style={[
                  styles.completeButton,
                  {
                    backgroundColor:
                      THEME_COLOR,
                  },
                ]}
                disabled={
                  actionLoading
                }
                onPress={
                  handleComplete
                }
              >

                {actionLoading ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    style={
                      styles.completeText
                    }
                  >
                    Mark as Completed
                  </Text>
                )}

              </TouchableOpacity>
            )}

            {/* CONFIRMED + NOT PAID */}

            {bookingStatus ===
              'CONFIRMED' &&
              !bookingFeePaid && (
                <View
                  style={
                    styles.disabledCompleteContainer
                  }
                >

                  <TouchableOpacity
                    style={[
                      styles.completeButton,
                      styles.disabledCompleteButton,
                    ]}
                    disabled={true}
                  >

                    <Text
                      style={
                        styles.disabledCompleteText
                      }
                    >
                      Mark as Completed
                    </Text>

                  </TouchableOpacity>

                  <Text
                    style={
                      styles.disabledCompleteHint
                    }
                  >
                    Waiting for customer to
                    pay the booking fee
                  </Text>

                </View>
              )}

          </View>

        </View>

      </Modal>
    </>
  );
};

// ============================================================
// STYLES
// ============================================================

const styles =
  StyleSheet.create({

    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      marginBottom: 14,
      padding: 14,

      shadowColor: '#000',

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity: 0.08,
      shadowRadius: 5,

      elevation: 3,
    },

    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    customerSection: {
      flex: 1,
      marginRight: 10,
    },

    customerName: {
      fontSize: 16,
      fontWeight: '700',
      color: '#222222',
    },

    bookingId: {
      fontSize: 11,
      color: '#888888',
      marginTop: 2,
    },

    statusBadge: {
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },

    statusText: {
      fontSize: 10,
      fontWeight: '700',
    },

    infoRow: {
      flexDirection: 'row',
      marginTop: 12,
    },

    infoItem: {
      flex: 1,
    },

    infoLabel: {
      fontSize: 10,
      color: '#888888',
      marginBottom: 2,
    },

    infoValue: {
      fontSize: 13,
      fontWeight: '600',
      color: '#333333',
    },

    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',

      marginTop: 12,

      paddingTop: 10,

      borderTopWidth: 1,
      borderTopColor: '#EEEEEE',
    },

    summaryValue: {
      fontSize: 13,
      fontWeight: '600',
      color: '#333333',
    },

    totalSection: {
      alignItems: 'flex-end',
    },

    totalAmount: {
      fontSize: 16,
      fontWeight: '800',
      color: '#222222',
    },

    detailsButton: {
      marginTop: 11,

      alignItems: 'center',

      paddingVertical: 8,

      borderWidth: 1,

      borderColor:
        THEME_COLOR,

      borderRadius: 9,
    },

    detailsButtonText: {
      fontSize: 12,
      fontWeight: '700',
    },

    actionsRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 10,
    },

    actionButton: {
      flex: 1,

      minHeight: 40,

      borderRadius: 9,

      alignItems: 'center',
      justifyContent: 'center',
    },

    rejectButton: {
      backgroundColor: '#FFFFFF',

      borderWidth: 1,

      borderColor: '#C62828',
    },

    rejectText: {
      color: '#C62828',

      fontSize: 13,

      fontWeight: '700',
    },

    acceptText: {
      color: '#FFFFFF',

      fontSize: 13,

      fontWeight: '700',
    },

    completeButton: {
      marginTop: 10,

      minHeight: 40,

      borderRadius: 9,

      alignItems: 'center',
      justifyContent: 'center',
    },

    completeText: {
      color: '#FFFFFF',

      fontSize: 13,

      fontWeight: '700',
    },

    salonResponseTimerBox: {
      marginTop: 11,

      paddingHorizontal: 12,
      paddingVertical: 11,

      borderRadius: 11,

      backgroundColor: '#FFF7E6',

      borderWidth: 1,

      borderColor: '#FFE0A3',
    },

    salonResponseTimerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    salonResponseTimerDot: {
      width: 7,
      height: 7,

      borderRadius: 4,

      backgroundColor: '#D99100',

      marginRight: 7,
    },

    salonResponseTimerTitle: {
      fontSize: 12,

      fontWeight: '800',

      color: '#8D6200',
    },

    salonResponseTimerContent: {
      marginTop: 7,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',
    },

    salonResponseTimerLabel: {
      flex: 1,

      fontSize: 11,

      color: '#8A7A42',
    },

    salonResponseTimerValue: {
      fontSize: 20,

      fontWeight: '900',

      color: '#B77900',

      letterSpacing: 0.5,
    },

    salonResponseTimerHint: {
      fontSize: 10,

      lineHeight: 15,

      color: '#8A7A42',

      marginTop: 5,
    },

    salonResponseExpiredBox: {
      marginTop: 10,

      paddingHorizontal: 12,
      paddingVertical: 10,

      borderRadius: 9,

      backgroundColor: '#FFF0F0',

      borderWidth: 1,

      borderColor: '#F2C2C2',
    },

    salonResponseExpiredTitle: {
      fontSize: 12,

      fontWeight: '800',

      color: '#C62828',
    },

    salonResponseExpiredText: {
      fontSize: 11,

      lineHeight: 16,

      color: '#8A5555',

      marginTop: 3,
    },

    salonResponseUnavailableBox: {
      marginTop: 10,

      paddingHorizontal: 12,
      paddingVertical: 10,

      borderRadius: 9,

      backgroundColor: '#FFF8E1',

      borderWidth: 1,

      borderColor: '#FFE082',
    },

    salonResponseUnavailableTitle: {
      fontSize: 12,

      fontWeight: '800',

      color: '#8D6E00',
    },

    salonResponseUnavailableText: {
      fontSize: 11,

      lineHeight: 16,

      color: '#8A7A42',

      marginTop: 3,
    },

    paymentTimerBox: {
      marginTop: 11,

      paddingHorizontal: 12,
      paddingVertical: 10,

      borderRadius: 11,

      backgroundColor: '#FFF7E6',

      borderWidth: 1,

      borderColor: '#FFE0A3',
    },

    paymentTimerHeader: {
      flexDirection: 'row',

      alignItems: 'center',
    },

    paymentTimerDot: {
      width: 7,
      height: 7,

      borderRadius: 4,

      backgroundColor: '#D99100',

      marginRight: 7,
    },

    paymentTimerTitle: {
      fontSize: 12,

      fontWeight: '800',

      color: '#8D6200',
    },

    paymentTimerContent: {
      marginTop: 7,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',
    },

    paymentTimerLabel: {
      flex: 1,

      fontSize: 11,

      color: '#8A7A42',
    },

    paymentTimerValue: {
      fontSize: 17,

      fontWeight: '900',

      color: '#B77900',

      letterSpacing: 0.5,
    },

    paymentExpiredBox: {
      marginTop: 10,

      paddingHorizontal: 12,
      paddingVertical: 10,

      borderRadius: 9,

      backgroundColor: '#FFF0F0',

      borderWidth: 1,

      borderColor: '#F2C2C2',
    },

    paymentExpiredTitle: {
      fontSize: 12,

      fontWeight: '800',

      color: '#C62828',
    },

    paymentExpiredText: {
      fontSize: 11,

      lineHeight: 16,

      color: '#8A5555',

      marginTop: 3,
    },

    paymentWaitingBox: {
      marginTop: 10,

      paddingHorizontal: 12,
      paddingVertical: 10,

      borderRadius: 9,

      backgroundColor: '#FFF8E1',

      borderWidth: 1,

      borderColor: '#FFE082',
    },

    paymentWaitingTitle: {
      fontSize: 12,

      fontWeight: '800',

      color: '#8D6E00',
    },

    paymentWaitingText: {
      fontSize: 11,

      lineHeight: 16,

      color: '#8A7A42',

      marginTop: 3,
    },

    modalOverlay: {
      flex: 1,

      backgroundColor:
        'rgba(0,0,0,0.45)',

      justifyContent:
        'flex-end',
    },

    modalContainer: {
      backgroundColor: '#FFFFFF',

      borderTopLeftRadius: 22,

      borderTopRightRadius: 22,

      maxHeight: '90%',

      paddingTop: 18,

      paddingHorizontal: 18,

      paddingBottom: 18,
    },

    modalHeader: {
      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',

      paddingBottom: 14,

      borderBottomWidth: 1,

      borderBottomColor:
        '#EEEEEE',
    },

    modalTitle: {
      fontSize: 18,

      fontWeight: '800',

      color: '#222222',
    },

    closeText: {
      fontSize: 22,

      fontWeight: '500',
    },

    modalContent: {
      paddingVertical: 8,

      paddingBottom: 20,
    },

    section: {
      paddingVertical: 12,

      borderBottomWidth: 1,

      borderBottomColor:
        '#EEEEEE',
    },

    sectionTitle: {
      fontSize: 13,

      fontWeight: '800',

      color: '#222222',

      marginBottom: 7,
    },

    detailValue: {
      fontSize: 14,

      fontWeight: '600',

      color: '#333333',
    },

    detailSubValue: {
      fontSize: 12,

      color: '#777777',

      marginTop: 3,
    },

    modalSalonTimerBox: {
      marginTop: 12,

      paddingHorizontal: 12,
      paddingVertical: 11,

      borderRadius: 10,

      backgroundColor: '#FFF7E6',

      borderWidth: 1,

      borderColor: '#FFE0A3',
    },

    modalSalonTimerTitle: {
      fontSize: 12,

      fontWeight: '800',

      color: '#8D6200',
    },

    modalSalonTimerValue: {
      fontSize: 22,

      fontWeight: '900',

      color: '#B77900',

      marginTop: 4,
    },

    modalSalonTimerText: {
      fontSize: 11,

      lineHeight: 16,

      color: '#8A7A42',

      marginTop: 4,
    },

    modalSalonExpiredBox: {
      marginTop: 12,

      paddingHorizontal: 12,
      paddingVertical: 11,

      borderRadius: 10,

      backgroundColor: '#FFF0F0',

      borderWidth: 1,

      borderColor: '#F2C2C2',
    },

    serviceItem: {
      paddingVertical: 9,

      borderBottomWidth: 1,

      borderBottomColor:
        '#F1F1F1',
    },

    categoryPath: {
      fontSize: 11,

      color: '#777777',

      marginBottom: 5,
    },

    serviceHeader: {
      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',
    },

    serviceNameSection: {
      flex: 1,

      marginRight: 10,
    },

    serviceName: {
      fontSize: 14,

      fontWeight: '700',

      color: '#222222',
    },

    audienceBadge: {
      alignSelf:
        'flex-start',

      marginTop: 5,

      borderRadius: 10,

      paddingHorizontal: 7,

      paddingVertical: 3,
    },

    audienceText: {
      fontSize: 9,

      fontWeight: '700',
    },

    servicePrice: {
      fontSize: 14,

      fontWeight: '800',

      color: '#222222',
    },

    durationText: {
      fontSize: 11,

      color: '#888888',

      marginTop: 4,
    },

    emptyText: {
      fontSize: 13,

      color: '#888888',
    },

    priceRow: {
      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',

      marginTop: 7,
    },

    priceLabel: {
      fontSize: 12,

      color: '#777777',
    },

    priceValue: {
      fontSize: 12,

      fontWeight: '600',

      color: '#333333',
    },

    totalRow: {
      marginTop: 11,

      paddingTop: 10,

      borderTopWidth: 1,

      borderTopColor:
        '#EEEEEE',
    },

    totalLabel: {
      fontSize: 14,

      fontWeight: '800',

      color: '#222222',
    },

    modalTotal: {
      fontSize: 16,

      fontWeight: '800',

      color: '#222222',
    },

    paymentStatus: {
      fontSize: 11,

      marginTop: 9,
    },

    paymentStatusPaid: {
      color: '#2E7D32',
    },

    paymentStatusPending: {
      color: '#EF6C00',
    },

    modalPaymentTimerBox: {
      marginTop: 12,

      paddingHorizontal: 12,
      paddingVertical: 11,

      borderRadius: 10,

      backgroundColor: '#FFF7E6',

      borderWidth: 1,

      borderColor: '#FFE0A3',
    },

    modalPaymentTimerTitle: {
      fontSize: 12,

      fontWeight: '800',

      color: '#8D6200',
    },

    modalPaymentTimerValue: {
      fontSize: 22,

      fontWeight: '900',

      color: '#B77900',

      marginTop: 4,
    },

    modalPaymentTimerText: {
      fontSize: 11,

      lineHeight: 16,

      color: '#8A7A42',

      marginTop: 4,
    },

    modalPaymentExpiredBox: {
      marginTop: 12,

      paddingHorizontal: 12,
      paddingVertical: 11,

      borderRadius: 10,

      backgroundColor: '#FFF0F0',

      borderWidth: 1,

      borderColor: '#F2C2C2',
    },

    modalPaymentWaitingBox: {
      marginTop: 12,

      paddingHorizontal: 12,
      paddingVertical: 11,

      borderRadius: 10,

      backgroundColor: '#FFF8E1',

      borderWidth: 1,

      borderColor: '#FFE082',
    },

    modalPaymentWaitingTitle: {
      fontSize: 12,

      fontWeight: '800',

      color: '#8D6E00',
    },

    modalPaymentWaitingText: {
      fontSize: 11,

      lineHeight: 16,

      color: '#8A7A42',

      marginTop: 4,
    },

    disabledCompleteContainer: {
      marginTop: 10,
    },

    disabledCompleteButton: {
      backgroundColor: '#D6D6D6',
    },

    disabledCompleteText: {
      color: '#888888',

      fontSize: 13,

      fontWeight: '700',
    },

    disabledCompleteHint: {
      textAlign: 'center',

      fontSize: 10,

      color: '#888888',

      marginTop: 5,
    },

    noteText: {
      fontSize: 13,

      lineHeight: 19,

      color: '#555555',
    },

    ratingText: {
      fontSize: 16,

      color: '#E5A500',

      marginBottom: 5,
    },

    modalActions: {
      flexDirection: 'row',

      gap: 10,

      paddingTop: 10,
    },
  });

export default AppointmentCard;