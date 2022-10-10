import nodemailer, { Transporter } from 'nodemailer';
import { IPendingUser, IUserUpdatePassword } from '@guardian/common';
import crypto from 'crypto';

const {
    NOTIFICATION_EMAIL_FROM_HOST,
    NOTIFICATION_EMAIL_FROM_PORT,
    NOTIFICATION_EMAIL_FROM_USERNAME,
    NOTIFICATION_EMAIL_FROM_PASSWORD,
    NOTIFICATION_EMAIL_FROM_SECURE,
    PORTAL_URL
} = process.env;

let pendingUsers: IPendingUser[] = [];
let pendingUpdatePassword: IUserUpdatePassword[] = [];

/**
 * Email service
 */
export class EmailCode {

    /**
     * Transport for sending email
     */
    private transporter: Transporter;

    /**
     * Random generation of code
     */
    private static generateRandom() {
        return Math.floor(Math.random() * 900000 + 100000);
    }

    constructor() {
        this.transporter = nodemailer.createTransport({
            // Public SMTP setup (outer server)
            host: NOTIFICATION_EMAIL_FROM_HOST,
            port: NOTIFICATION_EMAIL_FROM_PORT,
            secure: NOTIFICATION_EMAIL_FROM_SECURE === 'true', // true for 465, false for other ports
            auth: {
              user: NOTIFICATION_EMAIL_FROM_USERNAME,
              pass: NOTIFICATION_EMAIL_FROM_PASSWORD,
            },
            // Local SMTP setup (if Linux and local SMTP server is set up)
            /*
            sendmail: true,
            newline: 'unix',
            path: '/usr/sbin/sendmail'
            */
        });
    }

    /**
     * Add to queue of users for confirmation
     *
     * @param {Object} pendingUser - user in queue
     */
    public async addToQueue(pendingUser: IPendingUser): Promise<void> {
        pendingUser.checkSum = await this.sendCode(pendingUser.username, pendingUser.email);
        pendingUsers.push(pendingUser);
    }

    /**
     * Add to queue of users for reset password
     *
     * @param {Object} pendingUserUpdatePassword - user in queue
     */
    public async addToQueueToResetPassword(pendingUserUpdatePassword: IUserUpdatePassword): Promise<void> {
        const code = EmailCode.generateRandom().toString();
        const u = crypto.createHash('sha1').update(pendingUserUpdatePassword.email).digest('hex');
        const c = crypto.createHash('sha1').update(code).digest('hex');
        await this.transporter.sendMail({
            from: 'Serapis',
            to: pendingUserUpdatePassword.email,
            subject: 'Serapis password recovery',
            html: `<h1>Link to reset password:</h1> <br><a href="${PORTAL_URL}/auth/password-change?u=${u}&c=${c}">Reset password</a>`,
        });
        pendingUserUpdatePassword.checkSum = u + c;
        pendingUpdatePassword.push(pendingUserUpdatePassword);
    }

    /**
     * Send email with link to confirmation
     */
    private async sendCode(username: string, email: string): Promise<string> {
        const code = EmailCode.generateRandom().toString();
        const u = crypto.createHash('sha1').update(username).digest('hex');
        const c = crypto.createHash('sha1').update(code).digest('hex');
        await this.transporter.sendMail({
            from: 'Serapis',
            to: email,
            subject: 'Serapis registration confirmation',
            html: `<h1>Hello, ${username}! Your confirmation link:</h1> <br><a href="${PORTAL_URL}/accounts/confirm?">Click to confirm</a>`,
        });
        return u + c;
    }

    /**
     * Check given checkSum with checkSum of user in queue
     */
    public checkCode(checkSum: string): IPendingUser | null {
        for(const user of pendingUsers) {
            if(user.checkSum === checkSum) {
                pendingUsers = pendingUsers.filter(item => item.checkSum !== user.checkSum);
                return user;
            }
        }
        return null;
    }

    /**
     * Check given checkSum with checkSum of user in queue to reset password
     */
    public checkCodeForPassword(checkSum: string): IUserUpdatePassword | null {
        for(const user of pendingUpdatePassword) {
            if(user.checkSum === checkSum) {
                console.log(pendingUpdatePassword);
                pendingUpdatePassword = pendingUpdatePassword.filter(item => item.checkSum !== user.checkSum);
                console.log(pendingUpdatePassword);
                return user;
            }
        }
        return null;
    }
}
