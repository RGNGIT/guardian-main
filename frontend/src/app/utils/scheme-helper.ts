import {ISchema, ISchemaDocument, SchemaCondition, SchemaDataTypes, SchemaField, Schema} from "@app/models/schema";
import {ModelHelper} from "@app/utils/model-helper";

export class SchemaHelper {
  /**
   * Parse Field
   * @param name
   * @param property
   * @param required
   * @param url
   */
  public static parseField(name: string, property: any, required: boolean, url: string): [SchemaField, number] {
    const field: SchemaField = {
      name: null,
      title: null,
      description: null,
      type: null,
      format: null,
      pattern: null,
      unit: null,
      unitSystem: null,
      isArray: null,
      isRef: null,
      readOnly: null,
      required: null,
      fields: null,
      conditions: null,
      context: null,
      customType: null,
    };
    let _property = property;
    const readonly = _property.readOnly;
    if (_property.oneOf && _property.oneOf.length) {
      _property = _property.oneOf[0];
    }
    field.name = name;
    field.title = _property.title || name;
    field.description = _property.description || name;
    field.isArray = _property.type === SchemaDataTypes.array;
    const {
      unit,
      unitSystem,
      customType,
      orderPosition
    } = SchemaHelper.parseFieldComment(_property.$comment);
    if (field.isArray) {
      _property = _property.items;
    }
    field.isRef = !!(_property.$ref && !_property.type);
    if (field.isRef) {
      field.type = _property.$ref;
      const { type } = SchemaHelper.parseRef(field.type);
      field.context = {
        type,
        context: [url]
      };
    } else {
      field.type = _property.type ? String(_property.type) : null;
      field.format = _property.format ? String(_property.format) : null;
      field.pattern = _property.pattern ? String(_property.pattern) : null;
      field.unit = unit ? String(unit) : null;
      field.unitSystem = unitSystem ? String(unitSystem) : null;
      field.customType = customType ? String(customType) : null;
      field.enum = _property.enum;
      field.remoteLink = _property.$ref;
    }
    field.readOnly = !!(_property.readOnly || readonly);
    field.required = required;
    return [field, orderPosition];
  }

  /**
   * Build Field
   * @param field
   * @param name
   * @param contextURL
   */
  public static buildField(field: SchemaField, name: string, contextURL: string, orderPosition?: number): any {
    let item: any;
    const property: any = {};

    property.title = field.title || name;
    property.description = field.description || name;
    property.readOnly = !!field.readOnly;

    if (field.isArray) {
      property.type = SchemaDataTypes.array;
      property.items = {};
      item = property.items;
    } else {
      item = property;
    }

    if (field.isRef) {
      item.$ref = field.type;
    } else {
      item.type = field.type;
      if (field.remoteLink) {
        item.$ref = field.remoteLink;
      }
      if (field.enum) {
        item.enum = field.enum;
      }
      if (field.format) {
        item.format = field.format;
      }
      if (field.pattern) {
        item.pattern = field.pattern;
      }
    }

    property.$comment = SchemaHelper.buildFieldComment(field, name, contextURL, orderPosition);

    return property;
  }

  /**
   * Parse reference
   * @param data
   */
  public static parseRef(data: string | ISchema | null): {
    /**
     * Schema iri
     */
    iri: string | null;
    /**
     * Schema type
     */
    type: string | null;
    /**
     * Schema UUID
     */
    uuid: string | null;
    /**
     * Schema version
     */
    version: string | null;
  } {
    try {
      let ref: string;
      if (typeof data === 'string') {
        ref = data;
      } else {
        // @ts-ignore
        let document = data.document;
        if (typeof document === 'string') {
          document = JSON.parse(document) as ISchemaDocument;
        }
        // @ts-ignore
        ref = document.$id;
      }
      if (ref) {
        const id = ref.split('#');
        const keys = id[id.length - 1].split('&');
        return {
          iri: ref,
          type: id[id.length - 1],
          uuid: keys[0] || null,
          version: keys[1] || null
        };
      }
      return {
        iri: null,
        type: null,
        uuid: null,
        version: null
      };
    } catch (error) {
      return {
        iri: null,
        type: null,
        uuid: null,
        version: null
      };
    }
  }

  /**
   * Parse conditions
   * @param document
   * @param context
   * @param fields
   * @param defs
   */
  public static parseConditions(document: ISchemaDocument, context: string, fields: SchemaField[], defs: any = null): SchemaCondition[] {
    const conditions: SchemaCondition[] = [];

    if (!document || !document.allOf) {
      return conditions;
    }

    const allOf = Object.keys(document.allOf);
    for (const oneOf of allOf) {
      // @ts-ignore
      const condition = document.allOf[oneOf];
      if (!condition.if) {
        continue;
      }

      const ifConditionFieldName = Object.keys(condition.if.properties)[0];

      const conditionToAdd: SchemaCondition = {
        ifCondition: {
          field: fields.find(field => field.name === ifConditionFieldName),
          fieldValue: condition.if.properties[ifConditionFieldName].const
        },
        thenFields: SchemaHelper.parseFields(condition.then, context, document.$defs || defs) as SchemaField[],
        elseFields: SchemaHelper.parseFields(condition.else, context, document.$defs || defs) as SchemaField[]
      };

      conditions.push(conditionToAdd);
    }

    return conditions;
  }

  /**
   * Parse fields
   * @param document
   * @param contextURL
   * @param defs
   */
  public static parseFields(document: ISchemaDocument, contextURL: string, defs?: any, includeSystemProperties: boolean = false): SchemaField[] {
    const fields: SchemaField[] = [];

    if (!document || !document.properties) {
      return fields;
    }

    const required = {};
    if (document.required) {
      for (const element of document.required) {
        // @ts-ignore
        required[element] = true;
      }
    }

    const fieldsWithPositions = [];
    const properties = Object.keys(document.properties);
    for (const name of properties) {
      const property = document.properties[name];
      if (!includeSystemProperties && property.readOnly) {
        continue;
      }
      // @ts-ignore
      const [field, orderPosition] = SchemaHelper.parseField(name, property, !!required[name], contextURL);
      if (field.isRef) {
        const subSchemas = defs || document.$defs;
        // @ts-ignore
        const subDocument = subSchemas[field.type];
        const subFields = SchemaHelper.parseFields(subDocument, contextURL, subSchemas);
        const conditions = SchemaHelper.parseConditions(subDocument, contextURL, subFields, subSchemas);
        field.fields = subFields;
        field.conditions = conditions;
      }
      if (orderPosition) {
        fieldsWithPositions.push({field, orderPosition});
      } else {
        fields.push(field);
      }

    }

    return fields.concat(
      fieldsWithPositions
        .sort((a,b) => a.orderPosition - b.orderPosition)
        .map(item => item.field)
    );
  }

  /**
   * Build document from schema
   * @param schema
   * @param fields
   * @param conditions
   */
  public static buildDocument(schema: Schema, fields: SchemaField[], conditions: SchemaCondition[]): ISchemaDocument {
    // @ts-ignore
    const type = SchemaHelper.buildType(schema.uuid, schema.version);
    const ref = SchemaHelper.buildRef(type);
    const document = {
      $id: ref,
      $comment: SchemaHelper.buildSchemaComment(
        // @ts-ignore
        type, SchemaHelper.buildUrl(schema.contextURL, ref), schema.previousVersion
      ),
      title: schema.name,
      description: schema.description,
      type: SchemaDataTypes.object,
      properties: {
        '@context': {
          oneOf: [
            { type: SchemaDataTypes.string },
            {
              type: SchemaDataTypes.array,
              items: { type: SchemaDataTypes.string }
            },
          ],
          readOnly: true
        },
        type: {
          oneOf: [
            {
              type: SchemaDataTypes.string
            },
            {
              type: SchemaDataTypes.array,
              items: {
                type: SchemaDataTypes.string
              }
            },
          ],
          readOnly: true
        },
        id: {
          type: SchemaDataTypes.string,
          readOnly: true
        }
      },
      required: ['@context', 'type'],
      additionalProperties: false,
      allOf: []
    };

    if (conditions.length === 0) {
      // @ts-ignore
      delete document.allOf;
    }

    const documentConditions = document.allOf;
    for (const element of conditions) {
      // @ts-ignore
      const insertingPosition = fields.indexOf(fields.find(item => element.ifCondition.field.name === item.name)) + 1;
      const ifCondition = {};
      // @ts-ignore
      ifCondition[element.ifCondition.field.name] = { 'const': element.ifCondition.fieldValue };
      const condition = {
        'if': {
          'properties': ifCondition
        },
        'then': {},
        'else': {}
      };
      // @ts-ignore
      let req: any[] = []
      let props = {}

      // @ts-ignore
      SchemaHelper.getFieldsFromObject(element.thenFields, req, props, schema.contextURL);
      fields.splice(insertingPosition, 0, ...element.thenFields);
      if (Object.keys(props).length > 0) {

        condition.then = {
          'properties': props,
          'required': req
        }
      }
      else {
        // @ts-ignore
        delete condition.then;
      }

      req = []
      props = {}
      // @ts-ignore
      SchemaHelper.getFieldsFromObject(element.elseFields, req, props, schema.contextURL);
      fields.splice(insertingPosition + element.thenFields.length, 0, ...element.elseFields);
      if (Object.keys(props).length > 0) {
        condition.else = {
          'properties': props,
          'required': req
        }
      }
      else {
        // @ts-ignore
        delete condition.else;
      }
      // @ts-ignore
      documentConditions.push(condition);
    }
    // @ts-ignore
    SchemaHelper.getFieldsFromObject(fields, document.required, document.properties, schema.contextURL);

    return document;
  }

  /**
   * Get fields from object
   * @param fields
   * @param required
   * @param properties
   * @param contextURL
   * @param condition
   * @private
   */
  private static getFieldsFromObject(fields: SchemaField[], required: string[], properties: any, contextURL: string) {
    const fieldsWithoutSystemFields = fields.filter(item => !item.readOnly);
    for (const field of fields) {
      // @ts-ignore
      const property = SchemaHelper.buildField(field, field.name, contextURL, fieldsWithoutSystemFields.indexOf(field));
      // @ts-ignore
      if (/\s/.test(field.name)) {
        throw new Error(`Field key '${field.name}' must not contain spaces`);
      }
      // @ts-ignore
      if (properties[field.name]) {
        continue;
      }
      if (field.required) {
        // @ts-ignore
        required.push(field.name);
      }
      // @ts-ignore
      properties[field.name] = property;
    }
  }

  /**
   * Build type
   * @param uuid
   * @param version
   */
  public static buildType(uuid: string, version?: string): string {
    const type = uuid;
    if (version) {
      return `${type}&${version}`;
    }
    return type;
  }

  /**
   * Build reference
   * @param type
   */
  public static buildRef(type: string): string {
    return `#${type}`;
  }

  /**
   * Build URL
   * @param contextURL
   * @param ref
   */
  public static buildUrl(contextURL: string, ref: string): string {
    return `${contextURL || ''}${ref || ''}`;
  }

  /**
   * Get version
   * @param data
   */
  public static getVersion(data: ISchema) {
    try {
      let document = data.document;
      if (typeof document === 'string') {
        document = JSON.parse(document) as ISchemaDocument;
      }
      // @ts-ignore
      const { version } = SchemaHelper.parseRef(document.$id);
      // @ts-ignore
      const { previousVersion } = SchemaHelper.parseSchemaComment(document.$comment);
      return { version, previousVersion };
    } catch (error) {
      return { version: null, previousVersion: null }
    }
  }

  /**
   * Set version
   * @param data
   * @param version
   * @param previousVersion
   */
  public static setVersion(data: ISchema, version: string, previousVersion: string) {
    let document = data.document;
    if (typeof document === 'string') {
      document = JSON.parse(document) as ISchemaDocument;
    }
    const uuid = data.uuid;
    // @ts-ignore
    const type = SchemaHelper.buildType(uuid, version);
    const ref = SchemaHelper.buildRef(type);
    // @ts-ignore
    document.$id = ref;
    // @ts-ignore
    document.$comment = SchemaHelper.buildSchemaComment(
      // @ts-ignore
      type, SchemaHelper.buildUrl(data.contextURL, ref), previousVersion
    );
    data.version = version;
    data.document = document;
    return data;
  }

  /**
   * Update version
   * @param data
   * @param newVersion
   */
  public static updateVersion(data: ISchema, newVersion: string) {
    let document = data.document;
    if (typeof document === 'string') {
      document = JSON.parse(document) as ISchemaDocument;
    }
    // @ts-ignore
    const { uuid } = SchemaHelper.parseRef(document.$id);
    // @ts-ignore
    const { previousVersion } = SchemaHelper.parseSchemaComment(document.$comment);

    const _owner = data.creator || data.owner;
    const _uuid = data.uuid || uuid;

    if (!ModelHelper.checkVersionFormat(newVersion)) {
      throw new Error('Invalid version format');
    }

    if (ModelHelper.versionCompare(newVersion, previousVersion) <= 0) {
      throw new Error('Version must be greater than ' + previousVersion);
    }

    data.version = newVersion;
    data.owner = _owner;
    data.creator = _owner;
    data.uuid = _uuid;
    // @ts-ignore
    const type = SchemaHelper.buildType(_uuid, newVersion);
    const ref = SchemaHelper.buildRef(type);
    // @ts-ignore
    document.$id = ref;
    // @ts-ignore
    document.$comment = SchemaHelper.buildSchemaComment(
      // @ts-ignore
      type, SchemaHelper.buildUrl(data.contextURL, ref), previousVersion
    );
    data.document = document;
    return data;
  }

  /**
   * Update owner
   * @param data
   * @param newOwner
   */
  public static updateOwner(data: ISchema, newOwner: string) {
    let document = data.document;
    if (typeof document === 'string') {
      document = JSON.parse(document) as ISchemaDocument;
    }
    // @ts-ignore
    const { version, uuid } = SchemaHelper.parseRef(document.$id);
    // @ts-ignore
    const { previousVersion } = SchemaHelper.parseSchemaComment(document.$comment);
    data.version = data.version || version;
    data.uuid = data.uuid || uuid;
    data.owner = newOwner;
    data.creator = newOwner;
    // @ts-ignore
    const type = SchemaHelper.buildType(data.uuid, data.version);
    const ref = SchemaHelper.buildRef(type);
    // @ts-ignore
    document.$id = ref;
    // @ts-ignore
    document.$comment = SchemaHelper.buildSchemaComment(
      // @ts-ignore
      type, SchemaHelper.buildUrl(data.contextURL, ref), previousVersion
    );
    data.document = document;
    return data;
  }

  /**
   * Update permission
   * @param data
   * @param did
   */
  public static updatePermission(data: ISchema[], did: string) {
    for (const element of data) {
      // @ts-ignore
      element.isOwner = element.owner && element.owner === did;
      // @ts-ignore
      element.isCreator = element.creator && element.creator === did;
    }
  }

  /**
   * Map schemas
   * @param data
   */
  public static map(data: ISchema[]): Schema[] {
    if (data) {
      return data.map(e => new Schema(e));
    }
    return [];
  }

  /**
   * Validate schema
   * @param schema
   */
  public static validate(schema: ISchema) {
    try {
      if (!schema.name) {
        return false;
      }
      if (!schema.uuid) {
        return false;
      }
      if (!schema.document) {
        return false;
      }
      let doc = schema.document;
      if (typeof doc === 'string') {
        doc = JSON.parse(doc) as ISchemaDocument;
      }
      if (!doc.$id) {
        return false;
      }
    } catch (error) {
      return false;
    }
    return true;
  }

  /**
   * Find references
   * @param target
   * @param schemas
   */
  public static findRefs(target: Schema, schemas: Schema[]) {
    const map = {};
    const schemaMap = {};
    for (const element of schemas) {
      // @ts-ignore
      schemaMap[element.iri] = element.document;
    }
    for (const field of target.fields) {
      // @ts-ignore
      if (field.isRef && schemaMap[field.type]) {
        // @ts-ignore
        map[field.type] = schemaMap[field.type];
      }
    }
    return SchemaHelper.uniqueRefs(map, {});
  }

  /**
   * Get unique refs
   * @param map
   * @param newMap
   * @private
   */
  private static uniqueRefs(map: any, newMap: any) {
    const keys = Object.keys(map);
    for (const iri of keys) {
      if (!newMap[iri]) {
        const oldSchema = map[iri];
        const newSchema = { ...oldSchema };
        delete newSchema.$defs;
        newMap[iri] = newSchema;
        if (oldSchema.$defs) {
          SchemaHelper.uniqueRefs(oldSchema.$defs, newMap);
        }
      }
    }
    return newMap;
  }

  /**
   * Get context
   * @param item
   */
  public static getContext(item: ISchema): {
    /**
     * Type
     */
    'type': string,
    /**
     * Context
     */
    '@context': string[]
  } {
    try {
      // @ts-ignore
      const { type } = SchemaHelper.parseRef(item.iri);
      return {
        // @ts-ignore
        'type': type,
        // @ts-ignore
        '@context': [item.contextURL]
      };
    } catch (error) {
      // @ts-ignore
      return null;
    }
  }

  /**
   * Increment version
   * @param previousVersion
   * @param versions
   */
  public static incrementVersion(previousVersion: string, versions: string[]) {
    const map = {};
    versions.push(previousVersion);
    for (const element of versions) {
      if (!element) {
        continue
      }
      const _index = element.lastIndexOf('.');
      const _max = element.slice(0, _index);
      const _min = parseInt(element.slice(_index + 1), 10);
      // @ts-ignore
      if (map[_max]) {
        // @ts-ignore
        map[_max] = Math.max(map[_max], _min);
      } else {
        // @ts-ignore
        map[_max] = _min;
      }
    }
    if (!previousVersion) {
      previousVersion = '1.0.0';
    }
    const index = previousVersion.lastIndexOf('.');
    const max = previousVersion.slice(0, index);
    // @ts-ignore
    return max + '.' + (map[max] + 1);
  }

  /**
   * Update IRI
   * @param schema
   */
  public static updateIRI(schema: ISchema): ISchema {
    try {
      if (schema.document) {
        let document = schema.document;
        if (typeof document === 'string') {
          document = JSON.parse(document) as ISchemaDocument;
        }
        schema.iri = document.$id || null;
      } else {
        schema.iri = null;
      }
      return schema;
    } catch (error) {
      schema.iri = null;
      return schema;
    }
  }

  /**
   * Clear fields context
   * @param json
   * @private
   */
  private static _clearFieldsContext(json: any): any {
    delete json.type;
    delete json['@context'];

    const keys = Object.keys(json);
    for (const key of keys) {
      if (Object.prototype.toString.call(json[key]) === '[object Object]') {
        json[key] = SchemaHelper._clearFieldsContext(json[key]);
      }
    }

    return json;
  }

  /**
   * Update fields context
   * @param fields
   * @param json
   * @private
   */
  private static _updateFieldsContext(fields: SchemaField[], json: any): any {
    if (Object.prototype.toString.call(json) !== '[object Object]') {
      return json;
    }
    for (const field of fields) {
      // @ts-ignore
      const value = json[field.name];
      if (field.isRef && value) {
        // @ts-ignore
        SchemaHelper._updateFieldsContext(field.fields, value);
        // @ts-ignore
        value.type = field.context.type;
        // @ts-ignore
        value['@context'] = field.context.context;
      }
    }
    return json;
  }

  /**
   * Update object context
   * @param schema
   * @param json
   */
  public static updateObjectContext(schema: Schema, json: any): any {
    json = SchemaHelper._clearFieldsContext(json);
    json = SchemaHelper._updateFieldsContext(schema.fields, json);
    json.type = schema.type;
    json['@context'] = [schema.contextURL];
    return json;
  }

  /**
   * Build Field comment
   * @param field
   * @param name
   * @param url
   */
  public static buildFieldComment(field: SchemaField, name: string, url: string, orderPosition?: number): string {
    const comment: any = {};
    comment.term = name;
    // @ts-ignore
    comment['@id'] = field.isRef ? SchemaHelper.buildUrl(url, field.type) :
      'https://www.schema.org/text';
    if (field.unit) {
      comment.unit = field.unit;
    }
    if (field.unitSystem) {
      comment.unitSystem = field.unitSystem;
    }
    if (field.customType) {
      comment.customType = field.customType;
    }
    // @ts-ignore
    if (Number.isInteger(orderPosition) && orderPosition >= 0) {
      comment.orderPosition = orderPosition;
    }
    return JSON.stringify(comment);
  }

  /**
   * Parse Field comment
   * @param comment
   */
  public static parseFieldComment(comment: string): any {
    try {
      const item = JSON.parse(comment);
      return item || {};
    } catch (error) {
      return {};
    }
  }

  /**
   * Build Schema comment
   * @param type
   * @param url
   * @param version
   */
  public static buildSchemaComment(type: string, url: string, version?: string): string {
    if (version) {
      return `{ "@id": "${url}", "term": "${type}", "previousVersion": "${version}" }`;
    }
    return `{ "@id": "${url}", "term": "${type}" }`;
  }

  /**
   * Parse Schema comment
   * @param comment
   */
  public static parseSchemaComment(comment: string): any {
    try {
      const item = JSON.parse(comment);
      return item || {};
    } catch (error) {
      return {};
    }
  }

  /**
   * Check Schema Key
   * @param schema
   * @private
   */
  public static checkSchemaKey(schema: ISchema): boolean {
    if (schema?.document?.properties) {
      for (const key in schema?.document?.properties) {
        if (/\s/.test(key)) {
          throw new Error(`Field key '${key}' must not contain spaces`);
        }
      }
    }
    return true;
  }
}
