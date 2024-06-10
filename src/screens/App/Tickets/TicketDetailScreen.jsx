import React, { useRef } from 'react';
import { TouchableOpacity, StyleSheet, View, VirtualizedList, Text, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import Toolbar from '../../../components/atoms/Toolbar';
import { Ionicons } from '@expo/vector-icons';
import style from '../../../styles/TicketDetailScreenStyles';
import useFetchUnitWorkOrders from '../../../hooks/useFetchUnitWorkOrders';
import { useNavigation } from '@react-navigation/native';

const TicketDetailScreen = ({ route, navigation }) => {
  const { tareaId, codigo, estado, empresa, prioridad, fechaCreacion, tipo, trabajo, servicio, direccionTarea, requeridos } = route.params;
  const { unitsData, loading, error } = useFetchUnitWorkOrders(tareaId);
  const navigationRef = useRef();
  // Extracción de parámetros de la ruta
  const titleWithCode = `Detalle Ticket - ${codigo}`;
  // Función para manejar el botón de retroceso
  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleItemClick = () => {
    navigation.navigate('TabNavigatorWorkOrder', {
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
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={style.orderItem} onPress={() => handleItemClick()}>
      <View style={style.itemRow}>
        <Text style={[style.labelList, style.dynamicFontSize]}>Matrícula:</Text>
        <Text style={[style.info, style.dynamicFontSize]} numberOfLines={1} ellipsizeMode="tail">
          {item.unidad}
        </Text>
        <Text style={[style.labelList, style.dynamicFontSize]}> Marca:</Text>
        <Text style={[style.info, style.dynamicFontSize]} numberOfLines={1} ellipsizeMode="tail">
          {item.unidad_marca}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Barra de herramientas */}
      <Toolbar title={titleWithCode} onBackPress={handleBackPress} />
      <FlatList

        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>

            {/* Sección GENERAL */}
            <View style={style.section}>
              <View style={style.sectionContent}>
                <Text style={style.sectionTitle}>GENERAL</Text>
                <Ionicons name="person" size={24} color="#0045AD" style={style.icon} />
              </View>
              <View style={style.field}>
                <Text style={style.label}>Cliente:</Text>
                <Text style={style.value}>{empresa}</Text>
              </View>
              <View style={style.field}>
                <Text style={style.label}>Trabajo:</Text>
                <Text style={style.value}>{trabajo}</Text>
              </View>
              <View style={style.field}>
                <Text style={style.label}>Servicios:</Text>
                <Text style={style.value}>{servicio}</Text>
              </View>
              <View style={style.field}>
                <Text style={style.label}>Requeridos:</Text>
                <Text style={style.value}>{requeridos}</Text>
              </View>
              <View style={style.field}>
                <Text style={style.label}>Completado:</Text>
                <Text style={style.value}>{estado}</Text>
              </View>
            </View>

            {/* Sección PROGRAMACIÓN */}
            <View style={style.section}>
              <View style={style.sectionContent}>
                <Text style={style.sectionTitle}>PROGRAMACIÓN</Text>
                <Ionicons name="calendar" size={24} color="#0045AD" style={style.icon} />
              </View>
              <View style={style.field}>
                <Text style={style.label}>Fecha:</Text>
                <Text style={style.value}>{fechaCreacion}</Text>
              </View>
              <View style={style.field}>
                <Text style={style.label}>Dirección:</Text>
                <Text style={style.value}>{direccionTarea}</Text>
              </View>
            </View>

            {/* Sección PROGRESO */}
            <View style={style.section}>
              <View style={style.sectionContent}>
                <Text style={style.sectionTitle}>PROGRESO</Text>
                <Ionicons name="stats-chart" size={24} color="#0045AD" style={style.icon} />
              </View>
              <View style={style.field}>
                <Text style={style.label}>Progreso:</Text>
                <Text style={style.value}>{prioridad}</Text>
              </View>
              <View style={style.field}>
                <Text style={style.label}>Inicio:</Text>
                <Text style={style.value}>{prioridad}</Text>
              </View>
              <View style={style.field}>
                <Text style={style.label}>Completado:</Text>
                <Text style={style.value}>{prioridad}</Text>
              </View>
            </View>
          </View>
        }
        ListFooterComponent={
          <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            {/* Sección ORDENES */}
            <View style={style.ordersContainer}>
              <View style={style.sectionContent}>
                <Text style={style.sectionTitle}>ORDENES</Text>
                <Ionicons name="clipboard" size={24} color="#0045AD" style={style.icon} />
              </View>
              {unitsData.length > 0 ? (
                <VirtualizedList
                  data={unitsData}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.id_unidad.toString()}
                  getItemCount={() => unitsData.length}
                  getItem={(data, index) => data[index]}
                  style={{ flex: 1 }}
                />
              ) : (
                <Text style={style.noDataText}>No hay unidades que listar</Text>
              )}
            </View>
          </View>
        }
      />
    </View>
  );
};

export default TicketDetailScreen;
