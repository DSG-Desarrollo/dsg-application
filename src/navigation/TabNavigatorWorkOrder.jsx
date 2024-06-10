import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Text } from 'react-native';
import {
    TabUnitDetail, TabInstallationType, TabWorkOrderSupplies,
    TabInstallationSignatureProof, TabEquipmentLocation
} from '../screens/App/WorkOrders/';
import { faListAlt, faTools, faClipboardCheck, faMapMarkerAlt, faWrench } from '@fortawesome/free-solid-svg-icons';

const Tab = createMaterialTopTabNavigator();

const TabNavigatorWorkOrder = ({ route }) => {
    const {
        tareaId,
        codigo,
        estado,
        empresa,
        prioridad,
        fechaCreacion,
        tipo,
        trabajo,
        servicio,
        direccionTarea,
        requeridos,
    } = route.params;
    const renderTabBarIcon = ({ route, color }) => {
        let iconName;

        if (route.name === 'TabUnitDetail') {
            iconName = faListAlt;
        } else if (route.name === 'TabInstallationType') {
            iconName = faTools;
        } else if (route.name === 'TabWorkOrderSupplies') {
            iconName = faClipboardCheck;
        } else if (route.name === 'TabInstallationSignatureProof') {
            iconName = faMapMarkerAlt;
        } else if (route.name === 'TabEquipmentLocation') {
            iconName = faWrench;
        }

        return <FontAwesomeIcon icon={iconName} color={color} size={20} />;
    };

    const renderTabBarLabel = ({ route, color }) => {
        let labelName;

        if (route.name === 'TabUnitDetail') {
            labelName = 'Detalle Unidad';
        } else if (route.name === 'TabInstallationType') {
            labelName = 'Instalación';
        } else if (route.name === 'TabWorkOrderSupplies') {
            labelName = 'Materiales';
        } else if (route.name === 'TabInstallationSignatureProof') {
            labelName = 'Comprobante';
        } else if (route.name === 'TabEquipmentLocation') {
            labelName = 'Ubicación';
        }

        return <Text style={{ color }}>{labelName}</Text>;
    };

    const sharedParams = {
        tareaId,
        codigo,
        estado,
        empresa,
        prioridad,
        fechaCreacion,
        tipo,
        trabajo,
        servicio,
        direccionTarea,
        requeridos,
    };

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarActiveTintColor: '#efb810',
                tabBarInactiveTintColor: 'black',
                tabBarStyle: [
                    {
                        display: "flex"
                    },
                    null
                ],
                tabBarIcon: ({ color }) => renderTabBarIcon({ route, color }),
                tabBarLabel: ({ focused, color }) => renderTabBarLabel({ route, color }),
            })}
        >
            <Tab.Screen
                name="TabUnitDetail"
                component={TabUnitDetail}
                options={{
                    title: 'Detalle Unidad',
                    tabBarIcon: ({ color }) => (
                        <FontAwesomeIcon icon={faListAlt} color={color} size={20} />
                    ),
                }}
            />
            <Tab.Screen
                name="TabInstallationType"
                component={TabInstallationType}
                options={{
                    title: 'Instalación',
                    tabBarIcon: ({ color }) => (
                        <FontAwesomeIcon icon={faTools} color={color} size={20} />
                    ),
                }}
                initialParams={sharedParams}
            />
            <Tab.Screen
                name="TabWorkOrderSupplies"
                component={TabWorkOrderSupplies}
                options={{
                    title: 'Materiales',
                    tabBarIcon: ({ color }) => (
                        <FontAwesomeIcon icon={faClipboardCheck} color={color} size={20} />
                    ),
                }}
            />
            <Tab.Screen
                name="TabEquipmentLocation"
                component={TabEquipmentLocation}
                options={{
                    title: 'Ubicación',
                    tabBarIcon: ({ color }) => (
                        <FontAwesomeIcon icon={faWrench} color={color} size={20} />
                    ),
                    swipeEnabled: false,
                }}
            />
            <Tab.Screen
                name="TabInstallationSignatureProof"
                component={TabInstallationSignatureProof}
                options={{
                    title: 'Comprobante',
                    tabBarIcon: ({ color }) => (
                        <FontAwesomeIcon icon={faMapMarkerAlt} color={color} size={20} />
                    ),
                    swipeEnabled: false,
                }}
            />
        </Tab.Navigator>
    );
};

export default TabNavigatorWorkOrder;
