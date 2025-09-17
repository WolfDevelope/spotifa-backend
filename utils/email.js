import nodemailer from 'nodemailer';
import pug from 'pug';
import { htmlToText } from 'html-to-text';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.username.split(' ')[0];
    this.url = url;
    this.from = `Spotifa <${process.env.EMAIL_FROM}>`;
  }

  // Create a transporter
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Use SendGrid for production
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    // Use Mailtrap for development
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send the actual email
  async send(template, subject, context = {}) {
    try {
      // 1) Render HTML based on a pug template
      const templatePath = path.join(
        __dirname,
        '..',
        'views',
        'emails',
        `${template}.pug`
      );

      const html = pug.renderFile(templatePath, {
        firstName: this.firstName,
        url: this.url,
        subject,
        ...context,
      });

      // 2) Define email options
      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html,
        text: htmlToText(html),
      };

      // 3) Create a transport and send email
      await this.newTransport().sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to Spotifa!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for 10 minutes)'
    );
  }

  async sendEmailVerification() {
    await this.send(
      'verifyEmail',
      'Verify your email address',
      { verificationUrl: this.url }
    );
  }
}

export const sendEmail = async (options) => {
  try {
    const { email, subject, template, context } = options;
    
    const emailService = new Email({ email, username: context?.name || 'User' }, context?.verificationUrl || '');
    
    switch (template) {
      case 'welcome':
        await emailService.sendWelcome();
        break;
      case 'passwordReset':
        await emailService.sendPasswordReset();
        break;
      case 'verifyEmail':
        await emailService.sendEmailVerification();
        break;
      default:
        throw new Error('No template specified');
    }
    
    return true;
  } catch (error) {
    console.error('Error in sendEmail utility:', error);
    throw error;
  }
};

export default Email;
