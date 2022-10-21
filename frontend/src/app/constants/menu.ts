import {NavItem} from "@app/models/header.model";

export const INSTALLER_MENU: NavItem[] = [
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
export const ROOT_AUTHORITY_MENU: NavItem[] = [
  { title: 'Config', routerLink: '/config' },
  { title: 'IoT Insights', routerLink: '/iot-insights' },
  { title: 'Schemes', routerLink: '/schemas' },
  { title: 'Tokens', routerLink: '/tokens' },
  { title: 'Policies', routerLink: '/policies' },
];
export const AUDITOR_MENU: NavItem[] = [];
export const DEFAULT_MENU: NavItem[] = [
  { title: 'Config', routerLink: '/config' },
  { title: 'Policies', routerLink: '/policies' },
];
