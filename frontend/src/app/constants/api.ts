export const API_URLS = {
  accounts: {
    login: '/accounts/login',
    register: '/accounts/register',
    confirm: '/accounts/confirm',
    passwordReset: '/accounts/reset',
    passwordChange: '/accounts/update-password',
    standardRegistries: '/accounts/standard-registries',
    balance: '/accounts/balance',
  },
  profile: {
    base: '/profiles/{username}',
    balance: '/profiles/{username}/balance',
    push: '/profiles/push/{username}'
  },
  schemas: {
    allSchemas: '/schemas',
    entity: 'schemas/system/entity/{entityName}'
  },
  policies: {
    base: '/policies',
    push: '/policies/push'
  }
};
