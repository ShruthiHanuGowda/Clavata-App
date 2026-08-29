import React from 'react';

type MapViewProps = {
    children?: React.ReactNode;
    style?: any;
};

const MapView: React.FC<MapViewProps> = ({
    children,
    style,
}) => {
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                minHeight: 300,
                backgroundColor: '#E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...style,
            }}
        >
            <span
                style={{
                    color: '#666666',
                    fontSize: 14,
                }}
            >
                Map is available on mobile
            </span>

            {children}
        </div>
    );
};

export default MapView;

