import React from 'react';
import Modal from 'react-native-modal';

type Props = React.ComponentProps<typeof Modal>;

export default function AppModal(props: Props) {
    return <Modal {...props} />;
}