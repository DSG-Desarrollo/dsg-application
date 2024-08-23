import { Dashboard, ProfileScreen, TicketsScreen, TicketDetailScreen } from '../screens';
import { faHome, faTicketAlt, faUserCircle, faCog } from '@fortawesome/free-solid-svg-icons';

export const routes = {
  Dashboard: {
    screen: Dashboard,
    iconName: faHome,
    title: 'Dashboard',
    name: 'Dashboard',
    requiredLevel: [1, 5],
    order: 1,
    isActive: 1,
  },
  TicketsScreen: {
    screen: TicketsScreen,
    iconName: faTicketAlt,
    title: 'Tickets',
    name: 'Listado de Tickets',
    requiredLevel: [5, 7],
    order: 2,
    isActive: 1,
  },
  ProfileScreen: {
    screen: ProfileScreen,
    iconName: faUserCircle,
    title: 'Perfil',
    name: 'Perfil',
    requiredLevel: [2, 5],
    order: 3,
    isActive: 0,
  },
};
