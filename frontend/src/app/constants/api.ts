export const API_URLS = {
  accounts: {
    login: '/accounts/login',
    register: '/accounts/register',
    confirm: '/accounts/confirm',
    passwordReset: '/accounts/reset',
    passwordChange: '/accounts/update-password',
    standardRegistries: '/accounts/standard-registries'
  },
  profile: {
    base: '/profiles/{username}',
    balance: '/profiles/{username}/balance'
  },
  schemas: {
    entity: 'schemas/system/entity/{entityName}'
  }
}
