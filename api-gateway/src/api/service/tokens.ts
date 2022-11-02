import { Users } from '@helpers/users';
import { Guardians } from '@helpers/guardians';
import { permissionHelper } from '@auth/authorization-helper';
import e, { Response, Router } from 'express';
import { IToken, ITokenInfo, UserRole } from '@guardian/interfaces';
import { AuthenticatedRequest, IAuthUser, Logger } from '@guardian/common';
import { PolicyEngine } from '@helpers/policy-engine';
import { findAllEntities } from '@helpers/utils';
import { TaskManager } from '@helpers/task-manager';
import axios from 'axios';

/**
 * Token route
 */
export const tokenAPI = Router();

/**
 * Connect policies to tokens
 * @param tokens
 * @param policies
 * @param policyId
 */
function setTokensPolicies<T>(tokens: any[], policies: any[], policyId?: any, notEmpty?: boolean): T[] {
    if (!tokens) {
        return [];
    }
    for (const policyObject of policies) {
        policyObject.tokenIds = findAllEntities(policyObject.config, 'tokenId');
    }
    for (const token of tokens) {
        token.policies = [];
        token.policyIds = [];
        for (const policyObject of policies) {
            if (policyObject.tokenIds.includes(token.tokenId)) {
                token.policies.push(`${policyObject.name} (${policyObject.version || 'DRAFT'})`);
                token.policyIds.push(policyObject.id.toString());
            }
        }
    }
    if (policyId) {
        tokens = tokens.filter(t => t.policyIds.includes(policyId));
    }
    if (notEmpty) {
        tokens = tokens.filter(t => !!t.policyIds.length);
    }
    return tokens;

}

async function setAssociatedUsersAmount(tokens: IToken[], authUser: IAuthUser): Promise<IToken[]> {
    const mirrornodeUserRequest = async (hederaAccountId) => {
        const res = await axios.get(`https://testnet.mirrornode.hedera.com/api/v1/accounts?account.id=${hederaAccountId}`);
        return res;
    };
    const checkToken = (hederaUserInfo, tokenId): boolean => {
        for(const token of hederaUserInfo['accounts'][0]['balance']['tokens']) {
            if(tokenId == token.token_id) {
                return true;
            }
        }
        return false;
    };
    if (!tokens) {
        return [];
    }
    const userRepository = new Users();
    const users = await userRepository.getAllUserAccounts() as {username}[];
    console.log(users);
    
    for(const token of tokens) {
        token.userAmount = 0;
        for(const user of users) {
            const currentUser = await userRepository.getUser(user.username) as {hederaAccountId};
            if(currentUser.hederaAccountId) {
                const hederaUserInfo = await mirrornodeUserRequest(currentUser.hederaAccountId);
                console.log(hederaUserInfo);
                if(checkToken(hederaUserInfo, token.tokenId)) {
                    token.userAmount++;
                }
            }
        }
    }
    return tokens;
}

tokenAPI.get('/shit', permissionHelper(UserRole.STANDARD_REGISTRY, UserRole.USER), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const guardians = new Guardians();
        const engineService = new PolicyEngine();

        const user = req.user;
        const policyId = req.query?.policy;

        let tokens: IToken[] = [];
        if (user.role === UserRole.STANDARD_REGISTRY) {
            tokens = await guardians.getTokens({ did: user.did });
            const { policies } = await engineService.getPolicies({ filters: { owner: user.did } });
            tokens = setTokensPolicies(tokens, policies, policyId, false);
            tokens = await setAssociatedUsersAmount(tokens, user);
        } else if (user.did) {
            tokens = await guardians.getAssociatedTokens(user.did);
            const { policies } = await engineService.getPolicies({
                filters: {
                    status: 'PUBLISH',
                    owner: user.parent
                }
            });
            tokens = setTokensPolicies(tokens, policies, policyId, true);
            tokens = await setAssociatedUsersAmount(tokens, user);
        }
        res.status(200).json(tokens);
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(500).send({ code: error.code || 500, message: error.message });
    }
});

tokenAPI.get('/', permissionHelper(UserRole.STANDARD_REGISTRY, UserRole.USER), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const guardians = new Guardians();
        const engineService = new PolicyEngine();

        const user = req.user;
        const policyId = req.query?.policy;

        let tokens: IToken[] = [];
        if (user.role === UserRole.STANDARD_REGISTRY) {
            tokens = await guardians.getTokens({ did: user.did });
            const { policies } = await engineService.getPolicies({ filters: { owner: user.did } });
            tokens = setTokensPolicies(tokens, policies, policyId, false);
            // tokens = await setAssociatedUsersAmount(tokens, user);
        } else if (user.did) {
            tokens = await guardians.getAssociatedTokens(user.did);
            const { policies } = await engineService.getPolicies({
                filters: {
                    status: 'PUBLISH',
                    owner: user.parent
                }
            });
            tokens = setTokensPolicies(tokens, policies, policyId, true);
            // tokens = await setAssociatedUsersAmount(tokens, user);
        }
        res.status(200).json(tokens);
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(500).send({ code: error.code || 500, message: error.message });
    }
});

tokenAPI.post('/', permissionHelper(UserRole.STANDARD_REGISTRY), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const guardians = new Guardians();
        const engineService = new PolicyEngine();
        const user = req.user;

        if (!user.did) {
            res.status(500).json({ code: 500, message: 'User not registered' });
            return;
        }

        let tokens = (await guardians.setToken({
            token: req.body,
            owner: user.did
        }));

        tokens = await guardians.getTokens({ did: user.did });
        const { policies } = await engineService.getPolicies({ filters: { owner: user.did } });
        tokens = setTokensPolicies(tokens, policies);

        res.status(201).json(tokens);
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(500).send({ code: error.code || 500, message: error.message });
    }
});

tokenAPI.post('/push/', permissionHelper(UserRole.STANDARD_REGISTRY), async (req: AuthenticatedRequest, res: Response) => {
    const taskManager = new TaskManager();
    const { taskId, expectation } = taskManager.start('Create token');
    const user = req.user;
    if (!user.did) {
        res.status(500).json({ code: 500, message: 'User not registered' });
        return;
    }

    const token = req.body;
    setImmediate(async () => {
        try {
            const guardians = new Guardians();
            await guardians.setTokenAsync(token, user.did, taskId);
        } catch (error) {
            new Logger().error(error, ['API_GATEWAY']);
            taskManager.addError(taskId, { code: error.code || 500, message: error.message });
        }
    });

    res.status(201).send({ taskId, expectation });
});

tokenAPI.put('/:tokenId/associate', permissionHelper(UserRole.USER), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const guardians = new Guardians();
        const tokenId = req.params.tokenId;
        const userDID = req.user.did;
        if (!userDID) {
            res.status(500).json({ code: 500, message: 'User not registered' });
            return;
        }
        const status = await guardians.associateToken(tokenId, userDID);
        res.status(200).json(status);
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(500).json({ code: error.code || 500, message: error.message });
    }
});

tokenAPI.put('/push/:tokenId/associate', permissionHelper(UserRole.USER), async (req: AuthenticatedRequest, res: Response) => {
    const taskManager = new TaskManager();
    const { taskId, expectation } = taskManager.start('Associate/dissociate token');

    const tokenId = req.params.tokenId;
    const userDID = req.user.did;
    if (!userDID) {
        res.status(500).json({ code: 500, message: 'User not registered' });
        return;
    }

    setImmediate(async () => {
        try {
            const guardians = new Guardians();
            await guardians.associateTokenAsync(tokenId, userDID, taskId);
        } catch (error) {
            new Logger().error(error, ['API_GATEWAY']);
            taskManager.addError(taskId, { code: error.code || 500, message: error.message });
        }
    });

    res.status(200).send({ taskId, expectation });
});

tokenAPI.put('/:tokenId/dissociate', permissionHelper(UserRole.USER), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const guardians = new Guardians();
        const tokenId = req.params.tokenId;
        const userDID = req.user.did;
        if (!userDID) {
            res.status(500).json({ code: 500, message: 'User not registered' });
            return;
        }
        const status = await guardians.dissociateToken(tokenId, userDID);
        res.status(200).json(status);
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(500).json({ code: error.code || 500, message: error.message });
    }
});

tokenAPI.put('/push/:tokenId/dissociate', permissionHelper(UserRole.USER), async (req: AuthenticatedRequest, res: Response) => {
    const taskManager = new TaskManager();
    const { taskId, expectation } = taskManager.start('Associate/dissociate token');

    const tokenId = req.params.tokenId;
    const userDID = req.user.did;
    if (!userDID) {
        res.status(500).json({ code: 500, message: 'User not registered' });
        return;
    }
    setImmediate(async () => {
        try {
            const guardians = new Guardians();
            await guardians.dissociateTokenAsync(tokenId, userDID, taskId);
        } catch (error) {
            new Logger().error(error, ['API_GATEWAY']);
            taskManager.addError(taskId, { code: error.code || 500, message: error.message });
        }
    });

    res.status(200).send({ taskId, expectation });
});

tokenAPI.put('/:tokenId/:username/grantKyc', permissionHelper(UserRole.STANDARD_REGISTRY), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const guardians = new Guardians();
        const tokenId = req.params.tokenId;
        const username = req.params.username;
        const owner = req.user.did;
        if (!owner) {
            res.status(500).json({ code: 500, message: 'User not registered' });
            return;
        }
        const result = await guardians.grantKycToken(tokenId, username, owner);
        res.status(200).json(result);
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(500).json({ code: error.code || 500, message: error.message });
    }
});

tokenAPI.put('/push/:tokenId/:username/grantKyc', permissionHelper(UserRole.STANDARD_REGISTRY), async (req: AuthenticatedRequest, res: Response) => {
    const taskManager = new TaskManager();
    const { taskId, expectation } = taskManager.start('Grant/revoke KYC');

    const tokenId = req.params.tokenId;
    const username = req.params.username;
    const owner = req.user.did;
    if (!owner) {
        res.status(500).json({ code: 500, message: 'User not registered' });
        return;
    }

    setImmediate(async () => {
        try {
            const guardians = new Guardians();
            await guardians.grantKycTokenAsync(tokenId, username, owner, taskId);
        } catch (error) {
            new Logger().error(error, ['API_GATEWAY']);
            taskManager.addError(taskId, { code: error.code || 500, message: error.message });
        }
    });

    res.status(200).send({ taskId, expectation });
});

tokenAPI.put('/:tokenId/:username/revokeKyc', permissionHelper(UserRole.STANDARD_REGISTRY), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const guardians = new Guardians();
        const tokenId = req.params.tokenId;
        const username = req.params.username;
        const owner = req.user.did;
        if (!owner) {
            res.status(500).json({ code: 500, message: 'User not registered' });
            return;
        }
        const result = await guardians.revokeKycToken(tokenId, username, owner);
        res.status(200).json(result);
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(500).json({ code: error.code || 500, message: error.message });
    }
});

tokenAPI.put('/push/:tokenId/:username/revokeKyc', permissionHelper(UserRole.STANDARD_REGISTRY), async (req: AuthenticatedRequest, res: Response) => {
    const taskManager = new TaskManager();
    const { taskId, expectation } = taskManager.start('Grant/revoke KYC');

    const tokenId = req.params.tokenId;
    const username = req.params.username;
    const owner = req.user.did;
    if (!owner) {
        res.status(500).json({ code: 500, message: 'User not registered' });
        return;
    }

    setImmediate(async () => {
        try {
            const guardians = new Guardians();
            await guardians.revokeKycTokenAsync(tokenId, username, owner, taskId);
        } catch (error) {
            new Logger().error(error, ['API_GATEWAY']);
            taskManager.addError(taskId, { code: error.code || 500, message: error.message });
        }
    });

    res.status(200).send({ taskId, expectation });
});

tokenAPI.put('/:tokenId/:username/freeze', permissionHelper(UserRole.STANDARD_REGISTRY), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const guardians = new Guardians();
        const tokenId = req.params.tokenId;
        const username = req.params.username;
        const owner = req.user.did;
        if (!owner) {
            res.status(500).json({ code: 500, message: 'User not registered' });
            return;
        }
        const result = await guardians.freezeToken(tokenId, username, owner);
        res.status(200).json(result);
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(500).json({ code: error.code || 500, message: error.message });
    }
});

tokenAPI.put('/:tokenId/:username/unfreeze', permissionHelper(UserRole.STANDARD_REGISTRY), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const guardians = new Guardians();
        const tokenId = req.params.tokenId;
        const username = req.params.username;
        const owner = req.user.did;
        if (!owner) {
            res.status(500).json({ code: 500, message: 'User not registered' });
            return;
        }
        const result = await guardians.unfreezeToken(tokenId, username, owner);
        res.status(200).json(result);
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(500).json({ code: error.code || 500, message: error.message });
    }
});

tokenAPI.get('/:tokenId/:username/info', permissionHelper(UserRole.STANDARD_REGISTRY), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const guardians = new Guardians();
        const tokenId = req.params.tokenId;
        const username = req.params.username;
        const owner = req.user.did;
        if (!owner) {
            res.status(500).json({ code: 500, message: 'User not registered' });
            return;
        }
        const result = await guardians.getInfoToken(tokenId, username, owner);
        res.status(200).json(result as ITokenInfo);
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(500).json({ code: error.code || 500, message: error.message });
    }
});
