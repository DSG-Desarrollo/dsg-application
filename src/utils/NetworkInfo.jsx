import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import i18n from '../../i18n';
import { NetworkInfoStyles } from '../styles';
import useNetworkState from '../hooks/useNetworkState';

const NetworkInfo = ({ children }) => {
    const insets = useSafeAreaInsets();
    const { networkState, showNetworkInfo } = useNetworkState();

    const getIconName = () => {
        switch (networkState.type) {
            case 'wifi':
                return 'wifi-outline';
            case 'cellular':
                return 'cellular-outline';
            default:
                return 'warning-outline';
        }
    };

    const renderActivityIndicator = networkState.isLoading && <ActivityIndicator size="small" color="#0000ff" />;
    const statusText = (
        <>
            <Icon name={getIconName()} size={24} color="white" />
            <Text style={[NetworkInfoStyles.statusText]}>{i18n.t('connected')} {networkState.isConnected ? 'Yes' : 'No'}</Text>
            <Text style={[NetworkInfoStyles.statusText]}>{i18n.t('networkState')} {networkState.isInternetReachable ? 'Yes' : 'No'}</Text>
            <Text style={[NetworkInfoStyles.statusText]}>{i18n.t('networkType')} {networkState.type}</Text>
        </>
    );

    return (
        <View style={{ ...NetworkInfoStyles.container, paddingTop: insets.top }}>
            <View style={[NetworkInfoStyles.innerContainer, showNetworkInfo ? (networkState.isConnected ? NetworkInfoStyles.successContainer : NetworkInfoStyles.errorContainer) : { display: 'none' }]}>
                {renderActivityIndicator}
                <View style={NetworkInfoStyles.statusTextContainer}>
                    {statusText}
                </View>
            </View>
            {children}
        </View>
    );
};

export default NetworkInfo;
