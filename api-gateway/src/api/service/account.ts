import { Request, Response, Router } from 'express';
import { permissionHelper, authorizationHelper } from '@auth/authorization-helper';
import { Users } from '@helpers/users';
import { AuthenticatedRequest, Logger } from '@guardian/common';
import { Guardians } from '@helpers/guardians';
import { UserRole } from '@guardian/interfaces';
import { EmailCode } from '@helpers/email-code';

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
            res.status(201).json(await users.registerNewUser(user.first_name, user.last_name, user.username, user.password, user.email, user.role));
        } else {
            res.status(201).send("Wrong link");
        }
    } catch(error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(500).send({ code: 500, message: 'Server error' });
    }
});

accountAPI.post('/register', async (req: Request, res: Response) => {
    try {
        const users = new Users();
        const {first_name, last_name, username, password, email } = req.body;
        const userWithProvidedName = await users.getUser(username);
        const userWithProvidedEmail = await users.getUserByEmail(email);
        if(userWithProvidedName || userWithProvidedEmail) {
            res.status(201).send("User with the same name or email already exists!");
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
        res.status(201).send("User added to the confirmation queue");
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(500).send({ code: 500, message: 'Server error' });
    }
});

accountAPI.post('/login', async (req: Request, res: Response) => {
    const users = new Users();
    try {
        const { username, password } = req.body;
        res.status(200).json(await users.generateNewToken(username, password));
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(error.code).send({ code: error.code, message: error.message });
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
