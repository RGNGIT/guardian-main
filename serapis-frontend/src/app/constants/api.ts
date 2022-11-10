
const API_VERSION = 'v1';
export const BASE_API = '/api/' + API_VERSION;

export const API_IPFS_GATEWAY_URL = 'https://ipfs.io/ipfs/';

export const API_URLS = {
  accounts: {
    login: BASE_API + '/accounts/login',
    register: BASE_API + '/accounts/register',
    confirm: BASE_API + '/accounts/confirm',
    passwordReset: BASE_API + '/accounts/reset',
    passwordChange: BASE_API + '/accounts/update-password',
    standardRegistries: BASE_API + '/accounts/standard-registries',
    balance: BASE_API + '/accounts/balance',
    all: BASE_API + '/accounts',
  },
  profile: {
    base: BASE_API + '/profiles/{username}',
    balance: BASE_API + '/profiles/{username}/balance',
    push: BASE_API + '/profiles/push/{username}'
  },
  demo: {
    random: BASE_API + '/demo/randomKey',
    pushRandom: BASE_API + '/demo/push/randomKey'
  },
  schemas: {
    allSchemas: BASE_API + '/schemas',
    entity: BASE_API + '/schemas/system/entity/{entityName}'
  },
  goals: {
    base: BASE_API + '/goals',
  },
  policies: {
    base: BASE_API + '/policies',
    push: BASE_API + '/policies/push',
    importFile: BASE_API + '/policies/import/file/preview',
    pushFile: BASE_API + '/policies/push/import/file',
    pushMessage: BASE_API + '/policies/push/import/message',
    pushIPFS: BASE_API + '/policies/push/import/message/preview',
    setActive: BASE_API + '/policies/push/{policyId}/publish',
    pushDelete: BASE_API + '/policies/push/{policyId}',
    dryRun: BASE_API + '/policies/{policyId}/dry-run',
    draft: BASE_API + '/policies/{policyId}/draft'
  },
  tasks: {
    base: BASE_API + '/tasks'
  },
  ipfs: {
    base: BASE_API + '/ipfs'
  },
  tokens: {
    base: BASE_API + '/tokens',
    pushCreate: BASE_API + '/tokens/push',
    get: BASE_API + '/tokens',
    associate: BASE_API + '/tokens/{tokenId}/associate',
    associatePush: BASE_API + '/tokens/push/{tokenId}/associate',
    dissociate: BASE_API + '/tokens/{tokenId}/dissociate',
    dissociatePush: BASE_API + '/tokens/push/{tokenId}/dissociate',
    grantKyc: BASE_API + '/tokens/{tokenId}/{username}/grantKyc',
    grantPushKyc: BASE_API + '/tokens/push/{tokenId}/{username}/grantKyc',
    revokeKyc: BASE_API + '/tokens/{tokenId}/{username}/revokeKyc',
    revokePushKyc: BASE_API + '/tokens/push/{tokenId}/{username}/revokeKyc',
    freeze: BASE_API + '/tokens/{tokenId}/{username}/freeze',
    unfreeze: BASE_API + '/tokens/{tokenId}/{username}/unfreeze',
    info: BASE_API + '/tokens/{tokenId}/{username}/info',
  },
  config: BASE_API + '/settings'
};
