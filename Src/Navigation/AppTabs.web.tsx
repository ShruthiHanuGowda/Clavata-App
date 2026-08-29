import React from 'react';

import { useUser } from '../context/UserContext';

import CustomerTabs from './CustomerTabs.web';
import SalonTabs from './SalonTabs.web';

export default function AppTabs() {
  const { currentUser } = useUser();

  console.log(
    'WEB APP TABS CURRENT USER:',
    JSON.stringify(currentUser, null, 2),
  );

  console.log(
    'WEB ACTIVE ROLE:',
    currentUser?.activeRole,
  );

  if (currentUser?.activeRole === 'PROVIDER') {
    return <SalonTabs />;
  }

  return <CustomerTabs />;
}