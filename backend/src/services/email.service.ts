import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set in environment variables');
}

export class EmailService {
    private static instance: EmailService;
    private resend: Resend;

    private constructor() {
        this.resend = new Resend(process.env.RESEND_API_KEY);
    }

    static getInstance(): EmailService {
        if (!EmailService.instance) {
            EmailService.instance = new EmailService();
        }
        return EmailService.instance;
    }

    async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
        const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

        try {
            await this.resend.emails.send({
                from: 'onboarding@resend.dev', // Update this with your verified domain
                to: email,
                subject: 'Reset Your Password - Lex Vocabulary App',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>Reset Your Password</h2>
                        <p>You recently requested to reset your password. Click the link below to reset it:</p>
                        <p>
                            <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">
                                Reset Password
                            </a>
                        </p>
                        <p>This link will expire in 1 hour for security reasons.</p>
                        <p>If you didn't request this reset, you can safely ignore this email.</p>
                        <p>Best regards,<br>The Lex Team</p>
                    </div>
                `
            });
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Failed to send password reset email');
        }
    }
}

export default EmailService;