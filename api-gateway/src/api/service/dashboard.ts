import { Request, Response, Router } from 'express';
import { Guardians } from '@helpers/guardians';

/**
 * Dashboard route
 */
export const dashboardAPI = Router();

dashboardAPI.get('/test', (req: Request, res: Response) => {
    res.send('Dashboard works');
});