
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';

const PRIMARY = '#009D94';

type DayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

type DayHours = {
  enabled: boolean;
  open: string;
  close: string;
};

type BusinessHours = {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
};

const DAYS: {
  key: DayKey;
  label: string;
}[] = [
  {
    key: 'monday',
    label: 'Monday',
  },
  {
    key: 'tuesday',
    label: 'Tuesday',
  },
  {
    key: 'wednesday',
    label: 'Wednesday',
  },
  {
    key: 'thursday',
    label: 'Thursday',
  },
  {
    key: 'friday',
    label: 'Friday',
  },
  {
    key: 'saturday',
    label: 'Saturday',
  },
  {
    key: 'sunday',
    label: 'Sunday',
  },
];

const DEFAULT_HOURS: BusinessHours = {
  monday: {
    enabled: true,
    open: '09:00',
    close: '18:00',
  },

  tuesday: {
    enabled: true,
    open: '09:00',
    close: '18:00',
  },

  wednesday: {
    enabled: true,
    open: '09:00',
    close: '18:00',
  },

  thursday: {
    enabled: true,
    open: '09:00',
    close: '18:00',
  },

  friday: {
    enabled: true,
    open: '09:00',
    close: '18:00',
  },

  saturday: {
    enabled: true,
    open: '09:00',
    close: '18:00',
  },

  sunday: {
    enabled: false,
    open: '09:00',
    close: '18:00',
  },
};

export default function SalonBusinessHoursScreen() {
  const [hours, setHours] =
    useState<BusinessHours>(
      DEFAULT_HOURS,
    );

  const [saving, setSaving] =
    useState(false);

  // ============================================================
  // UPDATE DAY
  // ============================================================

  const updateDay = (
    day: DayKey,
    field: keyof DayHours,
    value: boolean | string,
  ) => {
    setHours(previous => ({
      ...previous,

      [day]: {
        ...previous[day],
        [field]: value,
      },
    }));
  };

  // ============================================================
  // VALIDATE TIME
  // ============================================================

  const isValidTime = (
    value: string,
  ): boolean => {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(
      value,
    );
  };

  // ============================================================
  // CONVERT TIME TO MINUTES
  // ============================================================

  const timeToMinutes = (
    value: string,
  ): number => {
    const parts =
      value.split(':');

    const hours =
      Number(parts[0]);

    const minutes =
      Number(parts[1]);

    return (
      hours * 60 +
      minutes
    );
  };

  // ============================================================
  // SAVE
  // ============================================================

  const handleSave = async () => {
    try {
      setSaving(true);

      // --------------------------------------------------------
      // VALIDATE
      // --------------------------------------------------------

      for (const day of DAYS) {
        const schedule =
          hours[day.key];

        if (!schedule.enabled) {
          continue;
        }

        if (
          !isValidTime(
            schedule.open,
          ) ||
          !isValidTime(
            schedule.close,
          )
        ) {
          Alert.alert(
            'Invalid time',
            `Please enter valid opening and closing times for ${day.label}.`,
          );

          return;
        }

        const openingMinutes =
          timeToMinutes(
            schedule.open,
          );

        const closingMinutes =
          timeToMinutes(
            schedule.close,
          );

        if (
          openingMinutes >=
          closingMinutes
        ) {
          Alert.alert(
            'Invalid business hours',
            `${day.label}: closing time must be later than opening time.`,
          );

          return;
        }
      }

      // --------------------------------------------------------
      // LOG
      // --------------------------------------------------------

      console.log(
        '======================================',
      );

      console.log(
        'SALON BUSINESS HOURS',
      );

      console.log(
        JSON.stringify(
          hours,
          null,
          2,
        ),
      );

      console.log(
        '======================================',
      );

      // --------------------------------------------------------
      // TODO
      // --------------------------------------------------------
      //
      // If your Android/iOS screen already has a GraphQL
      // mutation for saving business hours, put that mutation
      // here.
      //
      // Example:
      //
      // await updateBusinessHours({
      //   variables: {
      //     businessHours: hours,
      //   },
      // });
      //
      // --------------------------------------------------------

      Alert.alert(
        'Success',
        'Business hours saved successfully.',
      );
    } catch (error) {
      console.error(
        'Save business hours error:',
        error,
      );

      Alert.alert(
        'Error',
        'Unable to save business hours.',
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // COPY MONDAY
  // ============================================================

  const copyMondayToAll = () => {
    const monday =
      hours.monday;

    setHours({
      monday: {
        ...monday,
      },

      tuesday: {
        ...monday,
      },

      wednesday: {
        ...monday,
      },

      thursday: {
        ...monday,
      },

      friday: {
        ...monday,
      },

      saturday: {
        ...monday,
      },

      sunday: {
        ...monday,
      },
    });
  };

  // ============================================================
  // RESET
  // ============================================================

  const handleReset = () => {
    setHours(
      DEFAULT_HOURS,
    );
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <View
      style={
        styles.container
      }
    >

      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={
          styles.header
        }
      >

        <Text
          style={
            styles.title
          }
        >
          Business Hours
        </Text>

        <Text
          style={
            styles.subtitle
          }
        >
          Set your salon's opening and closing hours.
        </Text>

      </View>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >

        {/* ====================================================
            QUICK ACTIONS
        ==================================================== */}

        <View
          style={
            styles.actionsCard
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Quick Actions
          </Text>

          <View
            style={
              styles.actionsRow
            }
          >

            <TouchableOpacity
              style={
                styles.copyButton
              }
              onPress={
                copyMondayToAll
              }
              activeOpacity={
                0.8
              }
            >

              <Text
                style={
                  styles.copyButtonText
                }
              >
                Copy Monday to all days
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.resetButton
              }
              onPress={
                handleReset
              }
              activeOpacity={
                0.8
              }
            >

              <Text
                style={
                  styles.resetButtonText
                }
              >
                Reset
              </Text>

            </TouchableOpacity>

          </View>

        </View>

        {/* ====================================================
            DAYS
        ==================================================== */}

        {DAYS.map(day => {
          const schedule =
            hours[day.key];

          return (
            <View
              key={
                day.key
              }
              style={
                styles.dayCard
              }
            >

              {/* DAY HEADER */}

              <View
                style={
                  styles.dayHeader
                }
              >

                <View
                  style={
                    styles.dayInfo
                  }
                >

                  <Text
                    style={
                      styles.dayTitle
                    }
                  >
                    {day.label}
                  </Text>

                  <Text
                    style={[
                      styles.statusText,

                      schedule.enabled
                        ? styles.openStatus
                        : styles.closedStatus,
                    ]}
                  >
                    {schedule.enabled
                      ? 'Open'
                      : 'Closed'}
                  </Text>

                </View>

                <Switch
                  value={
                    schedule.enabled
                  }
                  onValueChange={value =>
                    updateDay(
                      day.key,
                      'enabled',
                      value,
                    )
                  }
                  trackColor={{
                    false: '#D5D5D5',
                    true: PRIMARY,
                  }}
                  thumbColor="#FFFFFF"
                />

              </View>

              {/* TIME INPUTS */}

              {schedule.enabled && (
                <View
                  style={
                    styles.timeContainer
                  }
                >

                  {/* OPENING */}

                  <View
                    style={
                      styles.timeField
                    }
                  >

                    <Text
                      style={
                        styles.timeLabel
                      }
                    >
                      Opening time
                    </Text>

                    <TextInput
                      value={
                        schedule.open
                      }
                      onChangeText={value =>
                        updateDay(
                          day.key,
                          'open',
                          value,
                        )
                      }
                      placeholder="09:00"
                      maxLength={
                        5
                      }
                      keyboardType={
                        'numbers-and-punctuation'
                      }
                      style={
                        styles.timeInput
                      }
                    />

                    <Text
                      style={
                        styles.timeHint
                      }
                    >
                      HH:MM
                    </Text>

                  </View>

                  {/* ARROW */}

                  <View
                    style={
                      styles.arrowContainer
                    }
                  >

                    <Text
                      style={
                        styles.arrow
                      }
                    >
                      →
                    </Text>

                  </View>

                  {/* CLOSING */}

                  <View
                    style={
                      styles.timeField
                    }
                  >

                    <Text
                      style={
                        styles.timeLabel
                      }
                    >
                      Closing time
                    </Text>

                    <TextInput
                      value={
                        schedule.close
                      }
                      onChangeText={value =>
                        updateDay(
                          day.key,
                          'close',
                          value,
                        )
                      }
                      placeholder="18:00"
                      maxLength={
                        5
                      }
                      keyboardType={
                        'numbers-and-punctuation'
                      }
                      style={
                        styles.timeInput
                      }
                    />

                    <Text
                      style={
                        styles.timeHint
                      }
                    >
                      HH:MM
                    </Text>

                  </View>

                </View>
              )}

              {/* CLOSED MESSAGE */}

              {!schedule.enabled && (
                <View
                  style={
                    styles.closedContainer
                  }
                >

                  <Text
                    style={
                      styles.closedText
                    }
                  >
                    Salon is closed on this day
                  </Text>

                </View>
              )}

            </View>
          );
        })}

        {/* ====================================================
            SAVE BUTTON
        ==================================================== */}

        <TouchableOpacity
          style={[
            styles.saveButton,

            saving &&
              styles.saveButtonDisabled,
          ]}
          onPress={
            handleSave
          }
          disabled={
            saving
          }
          activeOpacity={
            0.8
          }
        >

          <Text
            style={
              styles.saveButtonText
            }
          >
            {saving
              ? 'Saving...'
              : 'Save Business Hours'}
          </Text>

        </TouchableOpacity>

        <View
          style={
            styles.bottomSpace
          }
        />

      </ScrollView>
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor: '#F7F8FA',
      padding: 24,
    },

    header: {
      marginBottom: 24,
    },

    title: {
      fontSize: 30,
      fontWeight: '700',
      color: '#111111',
    },

    subtitle: {
      marginTop: 6,
      fontSize: 14,
      color: '#777777',
    },

    scrollContent: {
      width: '100%',
      maxWidth: 900,
      alignSelf: 'center',
      paddingBottom: 40,
    },

    // ========================================================
    // QUICK ACTIONS
    // ========================================================

    actionsCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,

      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 6,

      elevation: 2,
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: '#111111',
      marginBottom: 14,
    },

    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },

    copyButton: {
      backgroundColor: '#F0FAF8',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 10,
      marginRight: 10,
      marginBottom: 5,
    },

    copyButtonText: {
      color: PRIMARY,
      fontSize: 14,
      fontWeight: '600',
    },

    resetButton: {
      backgroundColor: '#F5F5F5',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 10,
      marginBottom: 5,
    },

    resetButtonText: {
      color: '#555555',
      fontSize: 14,
      fontWeight: '600',
    },

    // ========================================================
    // DAY CARD
    // ========================================================

    dayCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      marginBottom: 12,

      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.04,
      shadowRadius: 5,

      elevation: 2,
    },

    dayHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    dayInfo: {
      flex: 1,
    },

    dayTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: '#111111',
    },

    statusText: {
      marginTop: 4,
      fontSize: 13,
      fontWeight: '500',
    },

    openStatus: {
      color: PRIMARY,
    },

    closedStatus: {
      color: '#999999',
    },

    // ========================================================
    // TIME
    // ========================================================

    timeContainer: {
      marginTop: 20,
      flexDirection: 'row',
      alignItems: 'flex-end',
    },

    timeField: {
      flex: 1,
    },

    timeLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: '#555555',
      marginBottom: 7,
    },

    timeInput: {
      height: 48,
      borderWidth: 1,
      borderColor: '#E1E1E1',
      borderRadius: 10,
      paddingHorizontal: 14,
      fontSize: 16,
      color: '#111111',
      backgroundColor: '#FFFFFF',
      outlineStyle: 'none',
    } as any,

    timeHint: {
      marginTop: 5,
      fontSize: 11,
      color: '#999999',
    },

    arrowContainer: {
      width: 50,
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 15,
    },

    arrow: {
      fontSize: 20,
      color: '#777777',
    },

    // ========================================================
    // CLOSED
    // ========================================================

    closedContainer: {
      marginTop: 16,
      padding: 12,
      borderRadius: 10,
      backgroundColor: '#F7F7F7',
    },

    closedText: {
      fontSize: 13,
      color: '#888888',
    },

    // ========================================================
    // SAVE
    // ========================================================

    saveButton: {
      marginTop: 10,
      backgroundColor: PRIMARY,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },

    saveButtonDisabled: {
      opacity: 0.6,
    },

    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },

    // ========================================================
    // BOTTOM
    // ========================================================

    bottomSpace: {
      height: 30,
    },
  });

