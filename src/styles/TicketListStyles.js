import { StyleSheet } from 'react-native';
import theme from '../themes/theme';

const ticketListStyles = StyleSheet.create({
  ticketCard: {
    margin: 10,
    borderRadius: 10,
    padding: 10,
  },

  ticketContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  progressText: {
    fontSize: 14,
    color: '#6b6b6b',
    marginTop: 5,
  },

  indicator: {
    width: 10,
    height: '100%',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    marginRight: 10,
  },

  cardContent: {
    flexDirection: 'row',
    flex: 1,
  },

  leftContent: {
    flex: 1,
  },

  rightContent: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  ticketCode: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  ticketInfo: {
    fontSize: 14,
  },

  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  priorityIcon: {
    marginRight: 5,
  },

  priorityText: {
    fontWeight: 'bold',
  },

  badge: {
    color: 'white',
    borderRadius: 20,
  },

  badgeColors: {
    'T': '#FF6F61',    // Un color coral para 'T'
    'P': '#3D7DFF',    // Un azul vibrante para 'P'
    'I': '#4CAF50',    // Un verde moderado para 'I'
    'C': '#00BCD4',    // Un cian brillante para 'C'
    'A': '#E57373',    // Un rojo suave para 'A'
    default: '#B0B0B0', // Gris claro para el valor por defecto
  },  

  cardColors: {
    'T': '#F5ECEB',
    'P': '#ECECF5',
    'I': '#ECF5EC',
    'C': '#EAF5F6',
    'A': '#F5E9E9',
    default: '#F3F3F3',
  },

  priorityIcons: {
    'Alta': 'flag',
    'Media': 'priority-high',
    'Baja': 'notifications',
    default: 'priority-high',
  },

  priorityIconColors: {
    'Alta': '#FF4D4D',    // Rojo brillante para alta prioridad
    'Media': '#FF9800',   // Naranja brillante para prioridad media
    'Baja': '#4CAF50',    // Verde moderado para baja prioridad
    default: '#4CAF50',   // Verde moderado para valores predeterminados
  },  
  
  progressTasks: {
    'T': 'No programados',
    'P': 'Sin iniciar',
    'I': 'Iniciados',
    'C': 'Completados',
    'A': 'Cancelado',
    default: 'Sin especificar',
  },
});

export default ticketListStyles;
