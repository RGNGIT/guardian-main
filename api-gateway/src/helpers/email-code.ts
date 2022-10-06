import nodemailer, { Transporter } from 'nodemailer';
import { IPendingUser } from '@guardian/common';
import crypto from 'crypto';

const {
    NOTIFICATION_EMAIL_FROM_HOST,
    NOTIFICATION_EMAIL_FROM_PORT,
    NOTIFICATION_EMAIL_FROM_USERNAME,
    NOTIFICATION_EMAIL_FROM_PASSWORD,
    NOTIFICATION_EMAIL_FROM_SECURE,
    PORTAL_URL
} = process.env;

let pendingUsers: Array<IPendingUser> = [];

export class EmailCode {

    private transporter: Transporter;

    private generateRandom() {
        return Math.floor(100000 + Math.random() * 900000);
    }

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: NOTIFICATION_EMAIL_FROM_HOST,
            port: NOTIFICATION_EMAIL_FROM_PORT,
            secure: NOTIFICATION_EMAIL_FROM_SECURE === 'true', // true for 465, false for other ports
            auth: {
              user: NOTIFICATION_EMAIL_FROM_USERNAME,
              pass: NOTIFICATION_EMAIL_FROM_PASSWORD,
            },
        });
    }

    public async addToQueue(pendingUser: IPendingUser): Promise<void> {
        const checkSum = await this.sendCode(pendingUser.username, pendingUser.email);
        pendingUser.checkSum = checkSum;
        pendingUsers.push(pendingUser);
    }

    private async sendCode(username: string, email: string): Promise<string> {
        const code = this.generateRandom().toString();
        const u = crypto.createHash('sha1').update(username).digest('hex');
        const c = crypto.createHash('sha1').update(code).digest('hex');
        await this.transporter.sendMail({
            from: 'Serapis',
            to: email,
            subject: "Serapis registration confirmation",
            html: `<h1>Hello, ${username}! Your confirmation link:</h1> <br><a href="${PORTAL_URL}/accounts/confirm?u=${u}&c=${c}">Click to confirm</a>`,
        });
        return u + c;
    }

    public checkCode(checkSum: string): IPendingUser | null {
        for(const user of pendingUsers) {
            if(user.checkSum === checkSum) {
                pendingUsers.filter(item => item.checkSum !== user.checkSum);
                return user;
            }
        }
        return null;
    }

}