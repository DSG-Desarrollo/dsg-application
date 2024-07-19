import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Badge } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import ticketListStyles from '../../styles/TicketListStyles';

const TicketList = (props) => {
  const {
    tareaId,
    codigo,
    estado,
    empresa,
    prioridad,
    fechaInicioTarea,
    fechaCreacion,
    tipo,
    progresoTarea,
    trabajo,
    servicio,
    colorTipoTarea,
    direccionTarea,
    requeridos,
    ordenRequerida,
    ordenCompletada,
    progresoTareaDescripcion,
    clienteId
  } = props;

  const navigation = useNavigation();

  const handleTicketPress = () => {
    console.log(progresoTareaDescripcion);
    navigation.navigate('TicketDetailScreen', {
      tareaId,
      codigo,
      estado,
      empresa,
      prioridad,
      fechaInicioTarea,
      fechaCreacion,
      tipo,
      trabajo,
      servicio,
      direccionTarea,
      requeridos,
      ordenRequerida,
      ordenCompletada,
      progresoTareaDescripcion,
      clienteId
    });
  };

  const badgeColor = ticketListStyles.badgeColors[progresoTarea] || ticketListStyles.badgeColors.default;
  const cardColor = ticketListStyles.cardColors[progresoTarea] || ticketListStyles.cardColors.default;

  const priorityIconName = ticketListStyles.priorityIcons[prioridad] || 'priority-high';
  const priorityIconColor = ticketListStyles.priorityIconColors[prioridad] || '#399866';

  const progressTask = ticketListStyles.progressTasks[progresoTarea] || 'Sin especificar';

  // Calcula el progreso basado en la fase actual (0 a 4)
  const progressValue = progresoTarea / 4;

  return (
    <TouchableOpacity onPress={handleTicketPress}>
      <Card elevation={4} style={[ticketListStyles.ticketCard, { backgroundColor: cardColor }]}>
        <View style={ticketListStyles.ticketContainer}>
          <View style={[ticketListStyles.indicator, { backgroundColor: badgeColor }]} />
          <View style={ticketListStyles.cardContent}>
            <View style={ticketListStyles.leftContent}>
              <Title style={ticketListStyles.ticketCode}>{codigo}</Title>
              <Paragraph style={ticketListStyles.ticketInfo}>{empresa}</Paragraph>
              <View style={ticketListStyles.priorityContainer}>
                <Icon
                  name={priorityIconName}
                  size={20}
                  color={priorityIconColor}
                  style={ticketListStyles.priorityIcon}
                />
                <Paragraph style={[ticketListStyles.ticketInfo, ticketListStyles.priorityText]}>
                  {prioridad}
                </Paragraph>
              </View>
            </View>
            <View style={ticketListStyles.rightContent}>
              <View style={ticketListStyles.topRight}>
                <Badge
                  size={24}
                  style={[ticketListStyles.badge, { backgroundColor: badgeColor }]}
                >
                  {progressTask}
                </Badge>
              </View>
              <View style={ticketListStyles.bottomRight}>
                <Paragraph style={ticketListStyles.ticketInfo}>{fechaCreacion}</Paragraph>
              </View>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

export default TicketList;
