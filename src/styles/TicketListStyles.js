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
    borderRadius: 12, // Hacer el borde un poco más sutil
    fontSize: 14, // Tamaño de fuente moderno y legible
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    textTransform: 'capitalize', // Opcional: hacer el texto más estilizado
  },
  
  badgeColors: {
    'A': '#E57373',    // Un rojo suave para 'A'
    'C': '#00BCD4',    // Un cian brillante para 'C'
    'I': '#4CAF50',    // Un verde moderado para 'I'
    'P': '#3D7DFF',    // Un azul vibrante para 'P'
    'T': '#FF6F61',    // Un color coral para 'T'
    default: '#B0B0B0', // Gris claro para el valor por defecto
  },  
  
  cardColors: {
    'A': '#F5E9E9',    // Un rojo suave para 'A'
    'C': '#EAF5F6',    // Un cian brillante para 'C'
    'I': '#ECF5EC',    // Un verde moderado para 'I'
    'P': '#ECECF5',    // Un azul vibrante para 'P'
    'T': '#F5ECEB',    // Un color coral para 'T'
    default: '#F3F3F3', // Gris claro para el valor por defecto
  },  

  cardColorsV2Adapted: {
    '1': '#F5C6C4',    // Instalación de GPS (rojo suave)
    '2': '#AEE2F6',    // Homologación GPS (azul claro)
    '3': '#D5A8D0',    // Cambio de SIM (morado suave)
    '4': '#A9B2E1',    // Traslado de GPS (azul pálido)
    '5': '#F5AEB4',    // Cambio de Relay (rojo coral suave)
    '6': '#F5E8A6',    // Reinstalación GPS (amarillo pálido)
    '7': '#B9D89A',    // Cambio Base de Relay (verde suave)
    '8': '#A4D2C3',    // Cambio de GPS por garantía (verde azulado suave)
    '9': '#C0D68E',    // Desinstalación GPS (verde amarillento claro)
    '10': '#9B9EC6',   // Mantenimiento Correctivo (azul grisáceo suave)
    '11': '#FECF9F',   // Mantenimiento Preventivo (naranja suave)
    '12': '#BCC0D3',   // Cambio Pánico Alambrico (gris azulado claro)
    '13': '#BCC6C8',   // Cambio de Pánico Inalámbrico (gris azulado claro)
    '14': '#A2D9D9',   // Cambio de GPS (cian pálido)
    '15': '#A2C8D6',   // Instalación De Accesorio (azul pálido)
    '16': '#A5D4B6',   // Activación de unidades (verde menta suave)
    '17': '#A8D9C8',   // Desactivación de unidades (verde agua suave)
    '18': '#E3F6F4',   // Instalación Alarma (sin color especificado, gris claro)
    '19': '#D5A3D2',   // Pérdida de GPS (morado suave)
    '20': '#A3E2E2',   // Retiro de equipo desinstalado x cliente (cian pálido)
    default: '#F3F3F3' // Gris claro para el valor por defecto
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
