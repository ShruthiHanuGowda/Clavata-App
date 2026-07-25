import React from 'react';
import { useUser } from '../context/UserContext';
import CustomerTabs from './CustomerTabs';
import SalonTabs from './SalonTabs';

export default function AppTabs() {
  const { currentUser } = useUser();

   console.log('AppTabs:', currentUser);

  if (currentUser?.activeRole === 'SALON') {
    return <SalonTabs />;
  }

  return <CustomerTabs />;
}