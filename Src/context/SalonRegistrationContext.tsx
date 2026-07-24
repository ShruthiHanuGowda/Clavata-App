import React, { createContext, useContext, useState } from 'react';

type SalonRegistrationData = {
  userId: string;
  phoneNumber: string;

  salonName: string;
  ownerName: string;
  email: string;
  businessType: string;

  addressLine: string;
  city: string;
  state: string;
  pincode: string;

  gstNumber: string;
  panNumber: string;
  aadhaarNumber: string;

  bankAccount: string;
  ifsc: string;
};

const initialData: SalonRegistrationData = {
  userId: '',
  phoneNumber: '',

  salonName: '',
  ownerName: '',
  email: '',
  businessType: '',

  addressLine: '',
  city: '',
  state: '',
  pincode: '',

  gstNumber: '',
  panNumber: '',
  aadhaarNumber: '',

  bankAccount: '',
  ifsc: '',
};

type SalonRegistrationContextType = {
    data: SalonRegistrationData;
    updateData: (values: Partial<SalonRegistrationData>) => void;
    reset: () => void;
};

const SalonRegistrationContext =
    createContext<SalonRegistrationContextType | null>(null);

export const SalonRegistrationProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [data, setData] = useState(initialData);

    const updateData = (values: Partial<SalonRegistrationData>) => {
        console.log('updateData called with:', values);
        setData(prev => ({
            ...prev,
            ...values,
        }));
    };

    const reset = () => setData(initialData);

    return (
        <SalonRegistrationContext.Provider
            value={{
                data,
                updateData,
                reset,
            }}>
            {children}
        </SalonRegistrationContext.Provider>
    );
};

export const useSalonRegistration = () => {
    const context = useContext(SalonRegistrationContext);

    if (!context) {
        throw new Error(
            'useSalonRegistration must be used inside SalonRegistrationProvider'
        );
    }

    return context;
};