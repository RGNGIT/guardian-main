
const API_VERSION = 'v1'
const BASE_API = '/api/' + API_VERSION;

export const API_URLS = {
  accounts: {
    login: BASE_API + '/accounts/login',
    register: BASE_API + '/accounts/register',
    confirm: BASE_API + '/accounts/confirm',
    passwordReset: BASE_API + '/accounts/reset',
    passwordChange: BASE_API + '/accounts/update-password',
    standardRegistries: BASE_API + '/accounts/standard-registries',
    balance: BASE_API + '/accounts/balance',
  },
  profile: {
    base: BASE_API + '/profiles/{username}',
    balance: BASE_API + '/profiles/{username}/balance',
    push: BASE_API + '/profiles/push/{username}'
  },
  schemas: {
    allSchemas: BASE_API + '/schemas',
    entity: BASE_API + 'schemas/system/entity/{entityName}'
  },
  policies: {
    base: BASE_API + '/policies',
    push: BASE_API + '/policies/push'
  },
  tasks: {
    base: BASE_API + '/tasks'
  },
  ipfs: {
    base: BASE_API + '/ipfs'
  }
};
