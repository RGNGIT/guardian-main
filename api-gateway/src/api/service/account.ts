import { Request, Response, Router } from 'express';
import { permissionHelper, authorizationHelper } from '@auth/authorization-helper';
import { Users } from '@helpers/users';
import { AuthenticatedRequest, Logger } from '@guardian/common';
import { Guardians } from '@helpers/guardians';
import { UserRole } from '@guardian/interfaces';
import { EmailCode } from '@helpers/email-code';
import { ResponseCode, formResponse } from '@helpers/response-manager';

/**
 * User account route
 */
export const accountAPI = Router();

accountAPI.get('/session', async (req: Request, res: Response) => {
    const users = new Users();
    try {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            res.status(200).json(formResponse(ResponseCode.SESSION_GET_SUCCESS, await users.getUserByToken(token), 'SESSION_GET_SUCCESS'));
        } else {
            res.sendStatus(401);
        }
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(500).send(formResponse(ResponseCode.SESSION_GET_FAIL, error.message, 'SESSION_GET_FAIL'));
    }
});

accountAPI.get('/confirm', async (req: Request, res: Response) => {
    try {
        const users = new Users();
        const {c, u} = req.query;
        const user = await new EmailCode().checkCode(u.toString() + c.toString());
        if(user) {
            res.status(201).json(formResponse(
                ResponseCode.REGISTRATION_CONFIRMED, 
                await users.registerNewUser(user.first_name, user.last_name, user.username, user.password, user.email, user.role), 
                'REGISTRATION_CONFIRMED'));
        } else {
            res.status(201).json(formResponse(ResponseCode.REGISTRATION_CONFIRMATION_WRONG_LINK, 'Wrong link provided', 'REGISTRATION_CONFIRMATION_WRONG_LINK'));
        }
    } catch(error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(500).json(formResponse(500, 'Server error'));
    }
});

accountAPI.post('/register', async (req: Request, res: Response) => {
    try {
        const users = new Users();
        const {first_name, last_name, username, password, email } = req.body;
        const userWithProvidedName = await users.getUser(username);
        // const userWithProvidedEmail = await users.getUserByEmail(email);
        if(userWithProvidedName /*|| userWithProvidedEmail*/) {
            res.status(201).json(formResponse(ResponseCode.USER_EXISTS, 'User with the same name or email already exists!', 'USER_EXISTS'));
            return;
        }
        // Role meant to be get by body, but now USER by default
        // let { role } = req.body;
        const role = UserRole.USER;
        // @deprecated 2022-10-01
        /*
        if (role === 'ROOT_AUTHORITY') {
            role = UserRole.STANDARD_REGISTRY;
        }
        */
        await new EmailCode().addToQueue({first_name, last_name, username, password, role, email, checkSum: null});
        res.status(201).json(formResponse(ResponseCode.REGISTRATION_QUEUE_UPDATED, 'User added to the confirmation queue', 'REGISTRATION_QUEUE_UPDATED'));
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(500).json(formResponse(500, 'Server error'));
    }
});

accountAPI.post('/login', async (req: Request, res: Response) => {
    const users = new Users();
    try {
        const { email, password } = req.body;
        res.status(200).json(formResponse(ResponseCode.LOGIN_SUCCESS, await users.generateNewToken(email, password), 'LOGIN_SUCCESS'));
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(error.code).json(formResponse(error.code, error.message));
    }
});

accountAPI.post('/reset', async (req: Request, res: Response) => {
    const users = new Users();
    try {
        const { email } = req.body;
        const user =  await users.getUserByEmail(email);
        if (!user) {
            res.status(404).json(formResponse(ResponseCode.RESET_PASSWORD_USER_NOT_FOUND, 'User with provided email cannot be found', 'RESET_PASSWORD_USER_NOT_FOUND'));
        }
        await new EmailCode().addToQueueToResetPassword({ email, checkSum: null});
        res.status(200).json(formResponse(ResponseCode.RESET_PASSWORD_QUEUE_UPDATED, 'User added to the reset queue', 'RESET_PASSWORD_QUEUE_UPDATED'));
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(error.code).json(formResponse(error.code, error.message));
    }
});

accountAPI.post('/update-password', async (req: Request, res: Response) => {
    const users = new Users();
    try {
        const { c, u } = req.query;
        const { password } = req.body;
        const user = await new EmailCode().checkCodeForPassword(u.toString() + c.toString());
        if(user) {
            res.status(201).json(formResponse(ResponseCode.RESET_PASSWORD_UPDATED, await users.updateUserPassword(user.email, password), 'RESET_PASSWORD_UPDATED'));
        } else {
            res.status(201).json(formResponse(ResponseCode.RESET_PASSWORD_WRONG_LINK, 'Wrong link provided', 'RESET_PASSWORD_WRONG_LINK'));
        }
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(error.code).json(formResponse(error.code, error.message));
    }
});

accountAPI.get('/', authorizationHelper, permissionHelper(UserRole.STANDARD_REGISTRY), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const users = new Users();
        res.status(200).json(formResponse(ResponseCode.GET_ALL_USERS_SUCCESS, await users.getAllUserAccounts(), 'GET_ALL_USERS_SUCCESS'));
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(500).send(formResponse(ResponseCode.GET_ALL_USERS_FAIL, 'Server error', 'GET_ALL_USERS_FAIL'));
    }
});

/**
 * @deprecated 2022-10-01
 */
accountAPI.get('/root-authorities', authorizationHelper, async (req: Request, res: Response) => {
    try {
        const users = new Users();
        const standardRegistries = await users.getAllStandardRegistryAccounts();
        res.json(standardRegistries);
    } catch (error) {
        new Logger().error(error.message, ['API_GATEWAY']);
        res.json('null');
    }
});

accountAPI.get('/standard-registries', authorizationHelper, async (req: Request, res: Response) => {
    try {
        const users = new Users();
        const standardRegistries = await users.getAllStandardRegistryAccounts();
        res.json(formResponse(ResponseCode.GET_STANDARD_REGISTRY_SUCCESS, standardRegistries, 'GET_STANDARD_REGISTRY_SUCCESS'));
    } catch (error) {
        new Logger().error(error.message, ['API_GATEWAY']);
        res.json(formResponse(ResponseCode.GET_STANDARD_REGISTRY_FAIL, error.message, 'GET_STANDARD_REGISTRY_FAIL'));
    }
});

accountAPI.get('/balance', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        const users = new Users();
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            try {
                const user = await users.getUserByToken(token) as any;
                if (user) {
                    const guardians = new Guardians();
                    const balance = await guardians.getBalance(user.username);
                    res.json(formResponse(ResponseCode.GET_BALANCE_SUCCESS, balance, 'GET_BALANCE_SUCCESS'));
                    return;
                } else {
                    res.json(formResponse(ResponseCode.GET_BALANCE_FAIL, 'User cannot be found', 'GET_BALANCE_FAIL'));
                    return;
                }
            } catch (error) {
                res.json(formResponse(ResponseCode.GET_BALANCE_FAIL, error.message, 'GET_BALANCE_FAIL'));
                return;
            }
        }
        res.json(formResponse(ResponseCode.GET_BALANCE_FAIL, 'Balance cannot be fetched', 'GET_BALANCE_FAIL'));
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.json(formResponse(ResponseCode.GET_BALANCE_FAIL, error.message, 'GET_BALANCE_FAIL'));
    }
});
