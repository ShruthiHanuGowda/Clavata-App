import {gql} from '@apollo/client';

export const CREATE_ADDRESS_BOOK = gql`
  mutation createAddressBook($createaddressbookinput: CreateAddressBookInput!) {
    createAddressBook(input: $createaddressbookinput) {
      id
      beneficiaryAddress
      name
      walletAddress
      chain
    }
  }
`;

export const UPDATE_ADDRESS_BOOK = gql`
  mutation updateAddressBook($updateaddressbookinput: UpdateAddressBookInput!) {
    updateAddressBook(input: $updateaddressbookinput) {
      id
      beneficiaryAddress
      name
      walletAddress
      chain
    }
  }
`;

export const DELETE_ADDRESS_BOOK = gql`
  mutation deleteAddressBook($deleteaddressbookinput: DeleteAddressBookInput!) {
    deleteAddressBook(input: $deleteaddressbookinput) {
      id
      name
      beneficiaryAddress
      walletAddress
      chain
    }
  }
`;

export const LIST_ADDRESS_BOOKS_BY_WALLET = gql`
  query listAddressBooksByWallet($walletAddress: String!) {
    listAddressBooks(filter: {walletAddress: {eq: $walletAddress}}) {
      items {
        id
        name
        beneficiaryAddress
        walletAddress
        chain
      }
    }
  }
`;
