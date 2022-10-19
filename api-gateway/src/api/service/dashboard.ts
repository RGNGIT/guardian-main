import { Request, Response, Router } from 'express';

/**
 * Dashboard route
 */
export const dashboardAPI = Router();

dashboardAPI.get('/test', (req: Request, res: Response) => {
    res.send('Dashboard works');
});