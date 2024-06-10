import { StyleSheet } from 'react-native';

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
    'T': '#FE9365',
    'P': '#7480CB',
    'I': '#97C661',
    'C': '#4EA198',
    'A': '#EE5351',
    default: '#868E96',
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
    'Alta': 'priority-high',
    'Media': 'priority-high',
    'Baja': 'low-priority',
    default: 'priority-high',
  },
  priorityIconColors: {
    'Alta': '#FF4D3D',
    'Media': '#DB8030',
    'Baja': '#399866',
    default: '#399866',
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
