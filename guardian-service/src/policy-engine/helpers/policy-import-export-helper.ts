import { Policy } from '@entity/policy';
import {
    findAllEntities,
    regenerateIds,
    replaceAllEntities,
    SchemaFields
} from '@helpers/utils';
import JSZip from 'jszip';
import { Token } from '@entity/token';
import { Schema } from '@entity/schema';
import { SchemaEntity, TopicType, GenerateUUIDv4, WorkerTaskType } from '@guardian/interfaces';
import { Users } from '@helpers/users';
import { MessageAction, MessageServer, MessageType, PolicyMessage, TopicHelper } from '@hedera-modules';
import { Topic } from '@entity/topic';
import { importSchemaByFiles, publishSystemSchema } from '@api/schema.service';
import { PrivateKey } from '@hashgraph/sdk';
import { PolicyConverterUtils } from '@policy-engine/policy-converter-utils';
import { INotifier } from '@helpers/notifier';
import { DatabaseServer } from '@database-modules';
import { DataBaseHelper } from '@guardian/common';
import { Workers } from '@helpers/workers';

/**
 * Policy import export helper
 */
export class PolicyImportExportHelper {
    /**
     * Policy filename
     */
    static policyFileName = 'policy.json';

    /**
     * Generate Zip File
     * @param policy policy to pack
     *
     * @returns Zip file
     */
    static async generateZipFile(policy: Policy): Promise<JSZip> {
        const policyObject = { ...policy };
        const topicId = policyObject.topicId;

        delete policyObject._id;
        delete policyObject.id;
        delete policyObject.messageId;
        delete policyObject.status;
        delete policyObject.topicId;
        delete policyObject.createDate;

        const tokenIds = findAllEntities(policyObject.config, ['tokenId']);

        const tokens = await new DataBaseHelper(Token).find({ where: { tokenId: { $in: tokenIds } } });
        const schemas = await new DataBaseHelper(Schema).find({
            topicId,
            readonly: false
        });

        const zip = new JSZip();
        zip.folder('tokens')
        for (const token of tokens) {
            delete token.adminId;
            delete token.owner;
            token.adminKey = token.adminKey ? '...' : null;
            token.kycKey = token.kycKey ? '...' : null;
            token.wipeKey = token.wipeKey ? '...' : null;
            token.supplyKey = token.supplyKey ? '...' : null;
            token.freezeKey = token.freezeKey ? '...' : null;
            zip.file(`tokens/${token.tokenName}.json`, JSON.stringify(token));
        }
        zip.folder('schemas')
        for (const schema of schemas) {
            const item = { ...schema };
            delete item._id;
            delete item.id;
            delete item.status;
            delete item.readonly;
            zip.file(`schemas/${schema.iri}.json`, JSON.stringify(schema));
        }

        zip.file(PolicyImportExportHelper.policyFileName, JSON.stringify(policyObject));
        return zip;
    }

    /**
     * Parse zip policy file
     * @param zipFile Zip file
     * @returns Parsed policy
     */
    static async parseZipFile(zipFile: any): Promise<any> {
        const zip = new JSZip();
        const content = await zip.loadAsync(zipFile);
        if (!content.files[PolicyImportExportHelper.policyFileName] || content.files[PolicyImportExportHelper.policyFileName].dir) {
            throw new Error('Zip file is not a policy');
        }
        const policyString = await content.files[PolicyImportExportHelper.policyFileName].async('string');
        const tokensStringArray = await Promise.all(Object.entries(content.files)
            .filter(file => !file[1].dir)
            .filter(file => /^tokens\/.+/.test(file[0]))
            .map(file => file[1].async('string')));

        const schemasStringArray = await Promise.all(Object.entries(content.files)
            .filter(file => !file[1].dir)
            .filter(file => /^schem[a,e]s\/.+/.test(file[0]))
            .map(file => file[1].async('string')));

        const policy = JSON.parse(policyString);
        const tokens = tokensStringArray.map(item => JSON.parse(item));
        const schemas = schemasStringArray.map(item => JSON.parse(item));
        return { policy, tokens, schemas };
    }

    /**
     * Get system schemas
     *
     * @returns Array of schemas
     */
    static async getSystemSchemas(): Promise<Schema[]> {
        const schemas = await Promise.all([
            DatabaseServer.getSystemSchema(SchemaEntity.POLICY),
            DatabaseServer.getSystemSchema(SchemaEntity.MINT_TOKEN),
            DatabaseServer.getSystemSchema(SchemaEntity.MINT_NFTOKEN),
            DatabaseServer.getSystemSchema(SchemaEntity.WIPE_TOKEN),
            DatabaseServer.getSystemSchema(SchemaEntity.ISSUER),
            DatabaseServer.getSystemSchema(SchemaEntity.USER_ROLE)
        ]);

        for (const schema of schemas) {
            if (!schema) {
                throw new Error('One of system schemas is not exist');
            }
        }
        return schemas;
    }

    /**
     * Import policy
     * @param policyToImport
     * @param policyOwner
     * @param versionOfTopicId
     * @param notifier
     * @param additionalPolicyConfig
     *
     * @returns Policies by owner
     */
    static async importPolicy(
        policyToImport: any,
        policyOwner: string,
        versionOfTopicId: string,
        notifier: INotifier,
        additionalPolicyConfig?: Partial<Policy>
    ): Promise<Policy> {
        const { policy, tokens, schemas } = policyToImport;

        delete policy._id;
        delete policy.id;
        delete policy.messageId;
        delete policy.version;
        delete policy.previousVersion;
        delete policy.createDate;

        policy.policyTag = additionalPolicyConfig?.policyTag || 'Tag_' + Date.now();
        policy.uuid = GenerateUUIDv4();
        policy.creator = policyOwner;
        policy.owner = policyOwner;
        policy.status = 'DRAFT';
        policy.instanceTopicId = null;
        policy.name = additionalPolicyConfig?.name || policy.name;
        policy.topicDescription = additionalPolicyConfig?.topicDescription || policy.topicDescription;
        policy.description = additionalPolicyConfig?.description || policy.description;

        const users = new Users();
        notifier.start('Resolve Hedera account');
        const root = await users.getHederaAccount(policyOwner);
        notifier.completedAndStart('Resolve topic');
        const parent = await new DataBaseHelper(Topic).findOne({ owner: policyOwner, type: TopicType.UserTopic });
        const topicHelper = new TopicHelper(root.hederaAccountId, root.hederaAccountKey);

        let topicRow: Topic;
        if (versionOfTopicId) {
            topicRow = await new DataBaseHelper(Topic).findOne({ topicId: versionOfTopicId })
        } else {
            topicRow = await topicHelper.create({
                type: TopicType.PolicyTopic,
                name: policy.name || TopicType.PolicyTopic,
                description: policy.topicDescription || TopicType.PolicyTopic,
                owner: policyOwner,
                policyId: null,
                policyUUID: null
            });
            topicRow = await new DataBaseHelper(Topic).save(topicRow);
        }

        notifier.completed();
        policy.topicId = topicRow.topicId;
        notifier.start('Publish Policy in Hedera');
        const messageServer = new MessageServer(root.hederaAccountId, root.hederaAccountKey);
        const message = new PolicyMessage(MessageType.Policy, MessageAction.CreatePolicy);
        message.setDocument(policy);
        const messageStatus = await messageServer
            .setTopicObject(parent)
            .sendMessage(message);
        notifier.completedAndStart('Link topic and policy');
        await topicHelper.twoWayLink(topicRow, parent, messageStatus.getId());
        notifier.completedAndStart('Publishing schemas');
        const systemSchemas = await PolicyImportExportHelper.getSystemSchemas();
        notifier.info(`Found ${systemSchemas.length} schemas`);
        let num: number = 0;
        for (const schema of systemSchemas) {
            messageServer.setTopicObject(topicRow);
            let name: string;
            if(schema) {
                schema.creator = policyOwner;
                schema.owner = policyOwner;
                const item = await publishSystemSchema(schema, messageServer, MessageAction.PublishSystemSchema);
                const newItem = new DataBaseHelper(Schema).create(item);
                await new DataBaseHelper(Schema).save(item);
                name = newItem.name;
            }
            num++;
            notifier.info(`Schema ${num} (${name || '-'}) published`);
        }

        notifier.completed();

        // Import Tokens
        if (tokens) {
            notifier.start('Import tokens');
            const rootHederaAccountKey = PrivateKey.fromString(root.hederaAccountKey);
            const tokenRepository = new DataBaseHelper(Token);
            for (const token of tokens) {
                const tokenName = token.tokenName;
                const tokenSymbol = token.tokenSymbol;
                const tokenType = token.tokenType;
                const nft = tokenType === 'non-fungible';
                const decimals = nft ? 0 : token.decimals;
                const initialSupply = nft ? 0 : token.initialSupply;
                const adminKey = token.adminKey ? rootHederaAccountKey.toString() : null;
                const kycKey = token.kycKey ? rootHederaAccountKey.toString() : null;
                const freezeKey = token.freezeKey ? rootHederaAccountKey.toString() : null;
                const wipeKey = token.wipeKey ? rootHederaAccountKey.toString() : null;
                const supplyKey = token.supplyKey ? rootHederaAccountKey.toString() : null;

                const workers = new Workers();
                const tokenId = await workers.addTask({
                    type: WorkerTaskType.NEW_TOKEN,
                    data: {
                        operatorId: root.hederaAccountId,
                        operatorKey: root.hederaAccountKey,
                        tokenName,
                        tokenSymbol,
                        nft,
                        decimals,
                        initialSupply,
                        tokenMemo: '',
                        adminKey,
                        kycKey,
                        freezeKey,
                        wipeKey,
                        supplyKey,
                    }
                }, 1);

                const tokenObject = tokenRepository.create({
                    tokenId,
                    tokenName,
                    tokenSymbol,
                    tokenType,
                    decimals,
                    initialSupply,
                    adminId: root.hederaAccountId,
                    adminKey: adminKey ? adminKey.toString() : null,
                    kycKey: kycKey ? kycKey.toString() : null,
                    freezeKey: freezeKey ? freezeKey.toString() : null,
                    wipeKey: wipeKey ? wipeKey.toString() : null,
                    supplyKey: supplyKey ? supplyKey.toString() : null,
                    owner: root.did
                });
                await tokenRepository.save(tokenObject);
                replaceAllEntities(policy.config, ['tokenId'], token.tokenId, tokenId);
            }
            notifier.completed();
        }

        // Import Schemas
        const schemasMap = await importSchemaByFiles(policyOwner, schemas, topicRow.topicId, notifier);

        notifier.start('Saving in DB');
        // Replace id
        await PolicyImportExportHelper.replaceConfig(policy, schemasMap);

        // Save
        const model = new DataBaseHelper(Policy).create(policy as Policy);
        const result = await new DataBaseHelper(Policy).save(model);

        topicRow.policyId = result.id.toString();
        topicRow.policyUUID = result.uuid;
        await new DataBaseHelper(Topic).update(topicRow);

        notifier.completed();
        return result;
    }

    /**
     * Replace config
     * @param policy
     * @param schemasMap
     */
    static async replaceConfig(policy: Policy, schemasMap: any) {
        if (await new DataBaseHelper(Policy).findOne({ name: policy.name })) {
            policy.name = policy.name + '_' + Date.now();
        }

        for (const item of schemasMap) {
            replaceAllEntities(policy.config, SchemaFields, item.oldIRI, item.newIRI);
        }

        // compatibility with older versions
        policy = PolicyConverterUtils.PolicyConverter(policy);
        policy.codeVersion = PolicyConverterUtils.VERSION;
        regenerateIds(policy.config);
    }
}
