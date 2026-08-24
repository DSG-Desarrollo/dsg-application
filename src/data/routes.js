import { 
  Dashboard, 
  ProfileScreen, 
  TicketsScreen 
} from '@screens';
import { faHome, faTicketAlt, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import i18n from '@i18n/i18n';

export const routes = {
  Dashboard: {
    screen: Dashboard,
    iconName: faHome,
    title: i18n.t('ui:dashboard'),
    name: 'Dashboard',
    requiredLevel: [1, 5],
    order: 1,
    isActive: 1,
  },
  TicketsScreen: {
    screen: TicketsScreen,
    iconName: faTicketAlt,
    title: i18n.t('ui:tickets'),
    name: 'Listado de Tickets',
    requiredLevel: [5, 7],
    order: 2,
    isActive: 1,
  },
  ProfileScreen: {
    screen: ProfileScreen,
    iconName: faUserCircle,
    title: i18n.t('ui:profile'),
    name: 'Perfil',
    requiredLevel: [2, 5],
    order: 3,
    isActive: 1,
  },
};
