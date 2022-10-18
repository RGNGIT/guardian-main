import {NavItem} from "@app/models/header.model";

export const installerMenuItems: NavItem[] = [
  { title: 'Dashboard', routerLink: '/dashboard', icon: 'homeIcon' },
  { title: 'Goals', routerLink: '/goals', icon: 'trophyIcon' },
  { title: 'Scorecard', routerLink: '/scorecard', icon: 'trendingUpIcon' },
  { title: 'Token Claim', routerLink: '/token-claim', icon: 'suitcaseIcon' },
  {
    title: 'Policy Questions',
    routerLink: '/policy-questions',
    icon: 'questionCircleIcon'
  }
];
export const rootAuthorityMenuItems: NavItem[] = [
  { title: 'Config', routerLink: '/config' },
  { title: 'IoT Insights', routerLink: '/iot-insights' },
  { title: 'Schemes', routerLink: '/config' },
  { title: 'Tokens', routerLink: '/config' },
  { title: 'Policies', routerLink: '/config' },
];
export const auditorMenuItems: NavItem[] = [];
export const defaultMenuItems: NavItem[] = [];
