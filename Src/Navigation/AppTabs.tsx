import React from 'react';

import { useUser } from '../context/UserContext';

import CustomerTabs from './CustomerTabs';
import SalonTabs from './SalonTabs';

export default function AppTabs() {
  const { currentUser } = useUser();

  console.log(
    '======================================',
  );

  console.log(
    'APP TABS CURRENT USER:',
    JSON.stringify(
      currentUser,
      null,
      2,
    ),
  );

  console.log(
    'ACTIVE ROLE:',
    currentUser?.activeRole,
  );

  console.log(
    '======================================',
  );

  /*
   * --------------------------------------------------------
   * PROVIDER
   * --------------------------------------------------------
   *
   * Provider accounts must always enter
   * the Salon interface.
   *
   * We use PROVIDER because this is now
   * the role used throughout the application.
   */

  if (
    currentUser?.activeRole ===
    'PROVIDER'
  ) {
    return <SalonTabs />;
  }

  /*
   * --------------------------------------------------------
   * CUSTOMER
   * --------------------------------------------------------
   */

  return <CustomerTabs />;
}