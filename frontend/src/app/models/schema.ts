import {SchemaEntity, SchemaStatus} from "@app/enums/schema";
import {GenerateUUIDv4} from "@app/utils/utils";
import {ModelHelper} from "@app/utils/model-helper";
import {SchemaHelper} from "@app/utils/scheme-helper";

export interface SchemaField {
  /**
   * Name
   */
  name: string | null;
  /**
   * Title
   */
  title?: string | null;
  /**
   * Description
   */
  description: string | null;
  /**
   * Is required
   */
  required: boolean | null;
  /**
   * Is Array
   */
  isArray: boolean | null;
  /**
   * Is ref
   */
  isRef: boolean | null;
  /**
   * Type
   */
  type: string | null;
  /**
   * Format
   */
  format: string | null;
  /**
   * Pattern
   */
  pattern: string | null;
  /**
   * Is readonly
   */
  readOnly: boolean | null;
  /**
   * Unit
   */
  unit: string | null;
  /**
   * Unit system
   */
  unitSystem: string | null;
  /**
   * Custom Type
   */
  customType: string | null;
  /**
   * Fields
   */
  fields?: SchemaField[] | null;
  /**
   * Conditions
   */
  conditions?: SchemaCondition[] | null;
  /**
   * Context
   */
  context?: {
    /**
     * Type
     */
    type: string | null;
    /**
     * Context
     */
    context: string | string[];
  } | null;
  /**
   * Full field path
   */
  path?: string;

  /**
   * Remote link
   */
  remoteLink?: string;

  /**
   * Enum values
   */
  enum?: string[];
}

export enum SchemaCategory {
  USER = 'USER',
  SYSTEM = 'SYSTEM'
}

export enum SchemaDataTypes {
  string = 'string',
  number = 'number',
  integer = 'integer',
  boolean = 'boolean',
  null = 'null',
  object = 'object',
  array = 'array',
}

/**
 * Schema data formats
 */
export enum SchemaDataFormat {
  date = 'date',
  time = 'time',
  dateTime = 'date-time',
  duration = 'duration',
  uri = 'uri',
  email = 'email',
  ipv4 = 'ipv4',
  ipv6 = 'ipv6',
  regex = 'regex',
  uuid = 'uuid'
}

/**
 * Schema document interface
 */
export interface ISchemaDocument {
  /**
   * ID
   */
  $id?: string;
  /**
   * Comment
   */
  $comment?: string;
  /**
   * Title
   */
  title?: string;
  /**
   * Description
   */
  description?: string;
  /**
   * Type
   */
  type?: SchemaDataTypes;
  /**
   * Format
   */
  format?: SchemaDataFormat;
  /**
   * Pattern
   */
  pattern?: string;
  /**
   * Is readonly
   */
  readOnly?: boolean;
  /**
   * Unit
   */
  unit?: string;
  /**
   * Unit system
   */
  unitSystem?: string;
  /**
   * Properties
   */
  properties?: {
    [x: string]: ISchemaDocument;
  }
  /**
   * Required fields
   */
  required?: string[];
  /**
   * Additional properties
   */
  additionalProperties?: boolean;
  /**
   * Definitions
   */
  $defs?: {
    [x: string]: ISchemaDocument;
  }
  /**
   * Reference
   */
  $ref?: string;
  /**
   * Document items
   */
  items?: ISchemaDocument;
  /**
   * OneOf
   */
  oneOf?: ISchemaDocument[];
  /**
   * AllOf
   */
  allOf?: any[];
}



export interface SchemaCondition {
  /**
   * 'if' condition
   */
  ifCondition: {
    /**
     * Schema field
     */
    field: SchemaField | undefined;
    /**
     * field value
     */
    fieldValue: string;
  };
  /**
   * 'then' fields
   */
  thenFields: SchemaField[];
  /**
   * 'else' fields
   */
  elseFields: SchemaField[];
}


export interface ISchema {
  /**
   * Id
   */
  _id: any;

  /**
   * Serialized Id
   */
  id: string | undefined;
  /**
   * UUID
   */
  uuid?: string | null;
  /**
   * Hash
   */
  hash?: string | null;
  /**
   * Name
   */
  name?: string | null;
  /**
   * Description
   */
  description?: string | null;
  /**
   * Entity
   */
  entity?: SchemaEntity;
  /**
   * Schema status
   */
  status?: SchemaStatus;
  /**
   * Is readonly
   */
  readonly?: boolean | null;
  /**
   * Schema document instance
   */
  document?: ISchemaDocument | undefined | null;
  /**
   * Context
   */
  context?: any | null;
  /**
   * Version
   */
  version?: string | null;
  /**
   * Creator
   */
  creator?: string | null;
  /**
   * Owner
   */
  owner?: string | null;
  /**
   * Topic ID
   */
  topicId?: string | null;
  /**
   * Message ID
   */
  messageId?: string | null;
  /**
   * Document URL
   */
  documentURL?: string | null;
  /**
   * Context URL
   */
  contextURL?: string | null;
  /**
   * IRI
   */
  iri?: string | null;
  /**
   * Is owner
   */
  isOwner?: boolean | null;
  /**
   * Is creator
   */
  isCreator?: boolean | null;
  /**
   * Relationships
   */
  relationships?: string | null;
  /**
   * Schema category
   */
  category?: SchemaCategory;
  /**
   * Is system schema
   */
  system?: boolean | null;
  /**
   * Is active schema
   */
  active?: boolean | null;
}

export class Schema implements ISchema {
  /**
   * Id
   */
  public _id: string | undefined;

  /**
   * Serialized Id
   */
  public id: string | undefined;
  /**
   * UUID
   */
  public uuid?: string;
  /**
   * Hash
   */
  public hash?: string;
  /**
   * Name
   */
  public name?: string;
  /**
   * Description
   */
  public description?: string;
  /**
   * Entity
   */
  public entity?: SchemaEntity;
  /**
   * Status
   */
  public status?: SchemaStatus;
  /**
   * Readonly
   */
  public readonly?: boolean;
  /**
   * Schema document instance
   */
  public document?: ISchemaDocument | null | undefined;
  /**
   * Context
   */
  public context?: any;
  /**
   * Version
   */
  public version?: string;
  /**
   * Creator
   */
  public creator?: string;
  /**
   * Owner
   */
  public owner?: string;
  /**
   * Topic ID
   */
  public topicId?: string;
  /**
   * Message ID
   */
  public messageId?: string;
  /**
   * Document URL
   */
  public documentURL?: string;
  /**
   * Context URL
   */
  public contextURL?: string;
  /**
   * IRI
   */
  public iri?: string;
  /**
   * Type
   */
  public type?: string;
  /**
   * Fields
   */
  public fields: SchemaField[] = [];
  /**
   * Conditions
   */
  public conditions: SchemaCondition[] = [];
  /**
   * Previous version
   */
  public previousVersion: string | undefined;
  /**
   * Active
   */
  public active?: boolean;
  /**
   * System
   */
  public system?: boolean;
  /**
   * User DID
   * @private
   */
  private userDID: string | null;

  /**
   * Schema constructor
   * @param schema
   * @constructor
   */
  constructor(schema?: ISchema, includeSystemProperties: boolean = false) {
    this.userDID = null;
    if (schema) {
      this._id = schema._id || undefined;
      this.id = schema.id || undefined;
      this.uuid = schema.uuid || GenerateUUIDv4();
      this.hash = schema.hash || '';
      this.name = schema.name || '';
      this.description = schema.description || '';
      this.entity = schema.entity || SchemaEntity.NONE;
      this.status = schema.status || SchemaStatus.DRAFT;
      this.readonly = schema.readonly || false;
      this.system = schema.system || false;
      this.active = schema.active || false;
      this.version = schema.version || '';
      this.creator = schema.creator || '';
      this.owner = schema.owner || '';
      this.topicId = schema.topicId || '';
      this.messageId = schema.messageId || '';
      this.documentURL = schema.documentURL || '';
      this.contextURL = schema.contextURL || '';
      this.iri = schema.iri || '';
      if (schema.isOwner) {
        this.userDID = this.owner;
      }
      if (schema.isCreator) {
        this.userDID = this.creator;
      }
      if (schema.document) {
        if (typeof schema.document === 'string') {
          this.document = JSON.parse(schema.document);
        } else {
          this.document = schema.document;
        }
      } else {
        this.document = null;
      }
      if (schema.context) {
        if (typeof schema.context === 'string') {
          this.context = JSON.parse(schema.context);
        } else {
          this.context = schema.context;
        }
      } else {
        this.context = null;
      }
    } else {
      this._id = undefined;
      this.id = undefined;
      this.uuid = GenerateUUIDv4();
      this.hash = '';
      this.name = '';
      this.description = '';
      this.entity = SchemaEntity.NONE;
      this.status = SchemaStatus.DRAFT;
      this.readonly = false;
      this.system = false;
      this.active = false;
      this.document = null;
      this.context = null;
      this.version = '';
      this.creator = '';
      this.owner = '';
      this.topicId = '';
      this.messageId = '';
      this.documentURL = '';
      this.contextURL = '';
      this.iri = '';
    }
    if (this.document) {
      this.parseDocument(includeSystemProperties);
    }
  }

  /**
   * Parse document
   * @private
   */
  private parseDocument(includeSystemProperties: boolean): void {
    // @ts-ignore
    this.type = SchemaHelper.buildType(this.uuid, this.version);
    // @ts-ignore
    const { previousVersion } = SchemaHelper.parseSchemaComment(this.document.$comment);
    this.previousVersion = previousVersion;
    // @ts-ignore
    this.fields = SchemaHelper.parseFields(this.document, this.contextURL, null, includeSystemProperties);
    // @ts-ignore
    this.conditions = SchemaHelper.parseConditions(this.document, this.contextURL, this.fields);
  }

  /**
   * Set user
   * @param userDID
   */
  public setUser(userDID: string): void {
    this.userDID = userDID;
  }

  /**
   * Is owner
   */
  public get isOwner(): boolean {
    // @ts-ignore
    return this.owner && this.owner === this.userDID;
  }

  /**
   * Is creator
   */
  public get isCreator(): boolean {
    // @ts-ignore
    return this.creator && this.creator === this.userDID;
  }

  /**
   * Set version
   * @param version
   */
  public setVersion(version: string): void {
    const currentVersion = this.version;
    if (!ModelHelper.checkVersionFormat(version)) {
      throw new Error('Invalid version format');
    }
    // @ts-ignore
    if (ModelHelper.versionCompare(version, currentVersion) > 0) {
      this.version = version;
      this.previousVersion = currentVersion;
    } else {
      throw new Error('Version must be greater than ' + currentVersion);
    }
  }

  /**
   * Clone
   */
  public clone(): Schema {
    const clone = new Schema();
    clone._id = this._id;
    clone.id = this.id;
    clone.uuid = this.uuid;
    clone.hash = this.hash;
    clone.name = this.name;
    clone.description = this.description;
    clone.entity = this.entity;
    clone.status = this.status;
    clone.readonly = this.readonly;
    clone.system = this.system;
    clone.active = this.active;
    clone.document = this.document;
    clone.context = this.context;
    clone.version = this.version;
    clone.creator = this.creator;
    clone.owner = this.owner;
    clone.topicId = this.topicId;
    clone.messageId = this.messageId;
    clone.documentURL = this.documentURL;
    clone.contextURL = this.contextURL;
    clone.iri = this.iri;
    clone.type = this.type;
    clone.previousVersion = this.previousVersion;
    clone.fields = this.fields;
    clone.conditions = this.conditions;
    clone.userDID = this.userDID;
    return clone;
  }

  /**
   * Update
   * @param fields
   * @param conditions
   */
  public update(fields?: SchemaField[], conditions?: SchemaCondition[]): void | null {
    if (fields) {
      this.fields = fields;
    }

    if (!this.fields) {
      return null;
    }
    // @ts-ignore
    this.document = SchemaHelper.buildDocument(this, fields, conditions);
  }

  /**
   * Update refs
   * @param schemas
   */
  public updateRefs(schemas: Schema[]): void {
    // @ts-ignore
    this.document.$defs = SchemaHelper.findRefs(this, schemas);
  }

  /**
   * Search Fields
   * @param filter
   */
  public searchFields(filter: (field: SchemaField) => boolean): SchemaField[] {
    const result: SchemaField[] = [];
    if (this.fields) {
      this._searchFields(this.fields, filter, result, '');
    }
    return result;
  }

  /**
   * Search Fields
   * @param filter
   */
  private _searchFields(
    fields: SchemaField[],
    filter: (field: SchemaField) => boolean,
    result: SchemaField[],
    path: string
  ): void {
    for (const f of fields) {
      f.path = path + f.name;
      if (filter(f)) {
        result.push(f);
        if (f.fields) {
          this._searchFields(f.fields, filter, result, f.path + '.');
        }
      }
    }
  }
}

