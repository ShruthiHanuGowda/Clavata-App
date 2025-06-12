import {gql} from '@apollo/client';

export const CREATE_ADDRESS_BOOK = gql`
  mutation createAddressBook($createaddressbookinput: CreateAddressBookInput!) {
    createAddressBook(input: $createaddressbookinput) {
      beneficiaryAddress
      name
      walletAddress
      chain
    }
  }
`;

export const LIST_ADDRESS_BOOKS = gql`
  query listAddressBooks {
    listAddressBooks {
      items {
        beneficiaryAddress
        name
        walletAddress
        chain
      }
    }
  }
`;
