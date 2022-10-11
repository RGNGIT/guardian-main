import { Request, Response, Router } from 'express';
import { permissionHelper, authorizationHelper } from '@auth/authorization-helper';
import { Users } from '@helpers/users';
import { AuthenticatedRequest, Logger } from '@guardian/common';
import { Guardians } from '@helpers/guardians';
import { UserRole } from '@guardian/interfaces';
import { EmailCode } from '@helpers/email-code';
import { ResponseCode, HTTPCodeResponse } from '@helpers/error-codes';

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
            res.status(200).json(await users.getUserByToken(token));
        } else {
            res.sendStatus(401);
        }
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(500).send({ code: 500, message: error.message });
    }
});

accountAPI.get('/confirm', async (req: Request, res: Response) => {
    try {
        const users = new Users();
        const {c, u} = req.query;
        const user = await new EmailCode().checkCode(u.toString() + c.toString());
        if(user) {
            res.status(201).json({
                code: ResponseCode.REGISTRATION_CONFIRMED, 
                alias: 'REGISTRATION_CONFIRMED', 
                message: await users.registerNewUser(user.first_name, user.last_name, user.username, user.password, user.email, user.role)} as HTTPCodeResponse);
        } else {
            res.status(201).json({
                code: ResponseCode.REGISTRATION_CONFIRMATION_WRONG_LINK, 
                alias: 'REGISTRATION_CONFIRMATION_WRONG_LINK', 
                message: 'Wrong link provided'} as HTTPCodeResponse);
        }
    } catch(error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(500).json({ code: 500, message: 'Server error' } as HTTPCodeResponse);
    }
});

accountAPI.post('/register', async (req: Request, res: Response) => {
    try {
        const users = new Users();
        const {first_name, last_name, username, password, email } = req.body;
        const userWithProvidedName = await users.getUser(username);
        // const userWithProvidedEmail = await users.getUserByEmail(email);
        if(userWithProvidedName /*|| userWithProvidedEmail*/) {
            res.status(201).send({
                code: ResponseCode.USER_EXISTS, 
                alias: 'USER_EXISTS', 
                message: 'User with the same name or email already exists!'} as HTTPCodeResponse);
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
        res.status(201).json({
            code: ResponseCode.REGISTRATION_QUEUE_UPDATED, 
            alias: 'REGISTRATION_QUEUE_UPDATED', 
            message: 'User added to the confirmation queue'} as HTTPCodeResponse);
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(500).json({ code: 500, message: 'Server error' } as HTTPCodeResponse);
    }
});

accountAPI.post('/login', async (req: Request, res: Response) => {
    const users = new Users();
    try {
        const { username, password } = req.body;
        res.status(200).json({
            code: ResponseCode.LOGIN_SUCCESS, 
            alias: 'LOGIN_SUCCESS', 
            message: await users.generateNewToken(username, password)} as HTTPCodeResponse);
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(error.code).json({ code: error.code, message: error.message } as HTTPCodeResponse);
    }
});

accountAPI.post('/reset', async (req: Request, res: Response) => {
    const users = new Users();
    try {
        const { email } = req.body;
        const user =  await users.getUserByEmail(email);
        if (!user) {
            res.status(404).json({
                code: ResponseCode.RESET_PASSWORD_USER_NOT_FOUND, 
                alias: 'RESET_PASSWORD_USER_NOT_FOUND', 
                message: 'User with provided email cannot be found'} as HTTPCodeResponse);
        }
        await new EmailCode().addToQueueToResetPassword({ email, checkSum: null});
        res.status(200).json({
            code: ResponseCode.RESET_PASSWORD_QUEUE_UPDATED, 
            alias: 'RESET_PASSWORD_QUEUE_UPDATED', 
            message: 'User added to the reset queue'} as HTTPCodeResponse);
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(error.code).json({ code: error.code, message: error.message } as HTTPCodeResponse);
    }
});

accountAPI.post('/update-password', async (req: Request, res: Response) => {
    const users = new Users();
    try {
        const { c, u } = req.query;
        const { password } = req.body;
        const user = await new EmailCode().checkCodeForPassword(u.toString() + c.toString());
        if(user) {
            res.status(201).json({
                code: ResponseCode.RESET_PASSWORD_UPDATED, 
                alias: 'RESET_PASSWORD_UPDATED', 
                message: await users.updateUserPassword(user.email, password)} as HTTPCodeResponse);
        } else {
            res.status(201).send({
                code: ResponseCode.RESET_PASSWORD_WRONG_LINK, 
                alias: 'RESET_PASSWORD_WRONG_LINK', 
                message: 'Wrong link provided'} as HTTPCodeResponse);
        }
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(error.code).json({ code: error.code, message: error.message } as HTTPCodeResponse);
    }
});

accountAPI.get('/', authorizationHelper, permissionHelper(UserRole.STANDARD_REGISTRY),async (req: AuthenticatedRequest, res: Response) => {
    try {
        const users = new Users();
        res.status(200).json(await users.getAllUserAccounts());
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(500).send({ code: 500, message: 'Server error' });
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
        res.json(standardRegistries);
    } catch (error) {
        new Logger().error(error.message, ['API_GATEWAY']);
        res.json('null');
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
                    res.json(balance);
                    return;
                } else {
                    res.json('null');
                    return;
                }
            } catch (error) {
                res.json('null');
                return;
            }
        }
        res.json('null');
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.json('null');
    }
});
