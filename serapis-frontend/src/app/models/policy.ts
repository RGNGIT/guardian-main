export interface IPolicy {
  _id: string;
  id: string;
  uuid: string;
  name: string;
  description: string;
  topicDescription: string;
  config: {
    blockType: string;
      permissions: string[]
  },
  status: string;
  creator: string;
  owner: string;
  topicId: string;
  policyTag: string;
  codeVersion: string;
  createDate: string;
  userRoles: string[];
  userGroups: string[];
  userRole: string;
  userGroup: string;
}

export interface IPolicyUploadPreview {
  policy: IPolicy;
  schemas: any[]
  tokens: any[]
}
