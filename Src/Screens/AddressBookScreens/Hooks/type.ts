// Type definitions for the dynamic wallet address query

export interface AddressBook {
  id: string;
  name: string;
  beneficiaryAddress: string;
  walletAddress: string;
  chain: string;
}

export interface ListAddressBooksData {
  listAddressBooks: {
    items: AddressBook[];
  };
}

export interface ListAddressBooksVariables {
  walletAddress: string;
}

export interface CreateAddressBookInput {
  id: string; // Add id field for UUID generation
  name: string;
  beneficiaryAddress: string;
  walletAddress: string;
  chain: string;
}

export interface CreateAddressBookData {
  createAddressBook: AddressBook;
}

// Update types for edit functionality
export interface UpdateAddressBookInput {
  id: string;
  name: string;
  beneficiaryAddress: string;
  walletAddress: string;
  chain: string;
}

export interface UpdateAddressBookData {
  updateAddressBook: AddressBook;
}

export interface DeleteAddressBookInput {
  id: string;
}

export interface DeleteAddressBookData {
  deleteAddressBook: AddressBook;
}

// Navigation params for screens
export type AddressBookStackParamList = {
  AddressBook: undefined;
  CreateAddress:
    | {
        editMode?: boolean;
        contactToEdit?: AddressBook | null;
      }
    | undefined;
};

// Contact type alias (using existing AddressBook interface)
export type Contact = AddressBook;
