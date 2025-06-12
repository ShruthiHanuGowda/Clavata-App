export interface AddressBook {
  beneficiaryAddress: string;
  name: string;
  walletAddress: string;
  chain: string;
}

export interface ListAddressBooksData {
  listAddressBooks: {
    items: AddressBook[];
  };
}

export interface CreateAddressBookInput {
  beneficiaryAddress: string;
  name: string;
  walletAddress: string;
  chain: string;
}

export interface CreateAddressBookData {
  createAddressBook: AddressBook;
}
