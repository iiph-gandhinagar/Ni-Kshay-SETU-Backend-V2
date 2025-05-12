import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { createTransport, Transporter } from 'nodemailer';
import * as path from 'path';

dotenv.config();

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmailWithAttachments(
    to: string,
    subject: string,
    text: string,
    html: string,
    attachments = [],
    bcc: string[] = [],
  ) {
    const msg = {
      from: `"nikshay-SETU support" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      text,
      html,
      attachments,
      bcc,
    };
    await this.transporter.sendMail(msg);
  }

  async sendEmailWithAttachment(
    to: string,
    subject: string,
    text: string,
    html: string,
    attachments: any[],
  ) {
    try {
      const msg = {
        from: `"nikshay-SETU support" <${process.env.EMAIL_FROM}>`,
        to,
        subject,
        text,
        html,
        attachments,
      };

      await this.transporter.sendMail(msg);
    } catch (error) {
      console.error('❌ Error in Mail Send:', error.message);
      throw new HttpException(
        { message: '❌ Error in Mail Send:', status: false },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async sendMail(to: string, subject: string, text: string): Promise<void> {
    await this.transporter.sendMail({
      from: `"Your App Name" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    });
  }

  async sendOTP(to: string, name: string, otp: number) {
    const subject = 'Ni-kshay SETU Support: Wellness Unlocked with OTP Access!';
    const rootDir = process.cwd();
    const header_image = path.join(rootDir, 'images', 'Frame1000005688.png');
    const header1_image = path.join(rootDir, 'images', 'header_image.png');
    const app_store_image = path.join(rootDir, 'images', 'AppStore.png');
    const play_store_image = path.join(rootDir, 'images', 'download.png');
    const attachments = {
      filename: 'header_image.png',
      path: header_image,
      cid: 'header_image',
    };

    const headerImage = {
      filename: 'header1_image.png',
      path: header1_image,
      cid: 'header1_image',
    };
    const appStoreImage = {
      filename: 'app_store_image.png',
      path: app_store_image,
      cid: 'app_store_image',
    };

    const playStoreImage = {
      filename: 'play_store_image.png',
      path: play_store_image,
      cid: 'play_store_image',
    };
    const names = name && name !== '' ? name : 'User';
    const text = `
    Hi ${names},
    Greetings from Ni-kshay SETU!
    We're thrilled to be part of your wellness journey. To ensure your experience remains secure and seamless, we're granting you exclusive access with a One-Time Password (OTP).
    Your unique key to unlock wellness: ${otp}
    Kindly use this code promptly to access our tailored services. Should you have any questions or security concerns, our dedicated support team is here to assist you at support@nikshay-setu.in.
    Thank you for choosing us as your partner in holistic health. We're eager to support you every step of the way.
    Warm Regards,
    Ni-kshay SETU
  `;
    const html = `<div style="margin:10px; padding:10px; color:black; text-align: left;font-family:Raleway;max-width: 100%;">
    <img src="cid:header_image" style="display: block; margin: auto; max-width: 100px; height: 100px;">

    <p style="font-family:Maison;font-size: 20px;line-height: 100%;text-align: center;font-weight: 700;color:#000000;">
        Ni-kshay SETU</p>
    <p style="font-family:Maison;font-size: 15px;line-height: 100%;text-align: center;font-weight:600;color: #707070;">
        Support to end Tuberculosis (SETU)</p>
    <img src="cid:header1_image" style="display: block; margin: auto; width: 100%; max-width: 600px; height: auto;">
  <h4 style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;color:#3E3E3E;"><strong>Hi ${names},</strong></h4>
  <p style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;color:#3E3E3E;">Greetings from Ni-kshay SETU!</p>
  <p style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;color:#3E3E3E;">We're thrilled to be part of your wellness journey. To ensure your experience remains secure and seamless, we're granting you exclusive access with a One-Time Password (OTP).</p>
  <p style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;color:#3E3E3E;">Your unique key to unlock wellness: <strong>${otp}</strong></p>
  <p style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;color:#3E3E3E;">Kindly use this code promptly to access our tailored services. Should you have any questions or security concerns, our dedicated support team is here to assist you at support@nikshay-setu.in.</p>
  <p style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;color:#3E3E3E;">Thank you for choosing us as your partner in holistic health. We're eager to support you every step of the way.</p>
  <p style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;">Warm regards,</p>
  <div style="display: flex; align-items: center;margin-bottom:35px">
    <!-- Image on the Left -->
    <img src="cid:header_image" style="max-width: 50px; height: 50px; margin-right: 20px;">

    <!-- Text on the Right -->
      <div>
        <p style="font-family:Maison;font-size: 20px;line-height: 100%;font-weight: 700;color:#000000; margin: auto;">
          Ni-kshay SETU
        </p>
        <p style="font-family:Maison;font-size: 15px;line-height: 100%;font-weight:600;color: #707070; margin: auto;">
          Support to end Tuberculosis (SETU)
        </p>
      </div>
    </div>
    <div
        style="max-width: 100%;margin: 0 auto;background: #F8FAFF;padding: 20px;border-radius: 8px;box-shadow: 0 0 10px darkgray;">
        <h1 style="font-size: 20px;margin-bottom: 20px;text-align: center;font-family: Maison;">Get the Ni-kshay SETU app</h1>
        <p style="font-size: 16px;line-height: 1.6;text-align: center;font-family: Maison;">Get the most of Ni-kshay SETU by installing the
            mobile app. You
            can login using your existing account.</p>

        <div style="text-align: center; coulmn-gap: 20px; align-items: center; justify-content: center; flex-wrap: wrap;">
            <a data-wow-duration="1s" href="https://apps.apple.com/by/app/nikshay-setu/id1631331386" target="_blank" rel="noreferrer" style="display: inline-block; margin:10px;">
                <img src="cid:app_store_image" alt="Icon">
            </a>
            <a data-wow-duration="2s" href="https://play.google.com/store/apps/details?id=com.iiphg.tbapp" target="_blank" rel="noreferrer" style="display: inline-block; margin:10px;">
                <img src="cid:play_store_image">
            </a>
        </div>

    </div>
    <hr style="color:gray;margin-top: 30px;">
    <div style="margin-top: 20px; font-size: 14px; color: #666; text-align: center;">
      <p style="font-size: 16px; line-height: 1.6; font-family: Maison;">©2025 Ni-kshay SETU</p>
      <div style="text-align: center; font-size: 16px; font-family: Maison;display: inline-flex; column-gap: 20px;">
        <a href="https://nikshay-setu.in/privacy-policy/" style=" text-decoration: none; margin: 0 7px; display: inline-block;">Privacy Policy</a>
        <a href="mailto:support@nikshay-setu.in" style=" text-decoration: none; margin: 0 7px; display: inline-block;">Email</a>
        <a href="mailto:info@digiflux.io" style=" text-decoration: none; margin: 0 7px; display: inline-block;">Support</a>
      </div>
    </div>
    </div>`;
    await this.sendEmailWithAttachments(to, subject, text, html, [
      attachments,
      headerImage,
      appStoreImage,
      playStoreImage,
    ]);
  }

  async sendPassword(to: string, name: string, password: string) {
    const subject = 'Important: Your Manager Account Password';
    const rootDir = process.cwd();
    const header_image = path.join(rootDir, 'images', 'Frame1000005688.png');
    const header1_image = path.join(rootDir, 'images', 'header_final.png');
    const app_store_image = path.join(rootDir, 'images', 'AppStore.png');
    const play_store_image = path.join(rootDir, 'images', 'download.png');
    const attachments = {
      filename: 'header_image.png',
      path: header_image,
      cid: 'header_image',
    };
    const headerImage = {
      filename: 'header1_image.png',
      path: header1_image,
      cid: 'header1_image',
    };

    const appStoreImage = {
      filename: 'app_store_image.png',
      path: app_store_image,
      cid: 'app_store_image',
    };

    const playStoreImage = {
      filename: 'play_store_image.png',
      path: play_store_image,
      cid: 'play_store_image',
    };
    const text = `
    Dear ${name},

    Greetings from Ni-kshay SETU!

    We hope you're doing well. As part of your onboarding process, we're sharing your account credentials to access the Manager Dashboard.

    Your Account Details:
    Username: ${to}
    Temporary Password: ${password}

    If you encounter any issues or need assistance, please don't hesitate to reach out to our support team at support@nikshay-setu.in.

    Thank you for choosing us as your partner in holistic health. We're eager to support you every step of the way.
    Warm Regards,
    Ni-kshay SETU
  `;
    const html = `<div style="margin:10px; padding:10px; color:black; text-align: left;font-family:Raleway;max-width: 100%;">
  <img src="cid:header_image" style="display: block; margin: auto; max-width: 100px; height: 100px;">

    <p style="font-family:Maison;font-size: 20px;line-height: 100%;text-align: center;font-weight: 700;color:#000000;">
        Ni-kshay SETU</p>
    <p style="font-family:Maison;font-size: 15px;line-height: 100%;text-align: center;font-weight:600;color: #707070;">
        Support to end Tuberculosis (SETU)</p>
    <img src="cid:header1_image" style="display: block; margin: auto; width: 100%; max-width: 600px; height: auto;">
  <h4 style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;color:#3E3E3E;"><strong>Dear ${name},</strong></h4>
  <p style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;color:#3E3E3E;">Greetings from Ni-kshay SETU!</p>
  <p style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;color:#3E3E3E;">We hope you're doing well. As part of your onboarding process, we're sharing your account credentials to access the Manager Dashboard.</p>
  <p style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;color:#3E3E3E;"> Your Account Details:</p>
  <p style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;color:#3E3E3E;"> Username: <strong>${to} </strong></p>
  <p style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;color:#3E3E3E;"> Temporary Password: <strong>${password} </strong></p>
  <p style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;color:#3E3E3E;"> If you encounter any issues or need assistance, please don't hesitate to reach out to our support team at support@nikshay-setu.in</p>
  <p style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;color:#3E3E3E;"> Thank you for choosing us as your partner in holistic health. We're eager to support you every step of the way.</p>
  <p style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;">Warm regards,</p>
  <div style="display: flex; align-items: center;margin-bottom:35px">
    <!-- Image on the Left -->
    <img src="cid:header_image" style="max-width: 50px; height: 50px; margin-right: 20px;">

    <!-- Text on the Right -->
      <div>
        <p style="font-family:Maison;font-size: 20px;line-height: 100%;font-weight: 700;color:#000000; margin: auto;">
          Ni-kshay SETU
        </p>
        <p style="font-family:Maison;font-size: 15px;line-height: 100%;font-weight:600;color: #707070; margin: auto;">
          Support to end Tuberculosis (SETU)
        </p>
      </div>
    </div>
    <div
        style="max-width: 100%;margin: 0 auto;background: #F8FAFF;padding: 20px;border-radius: 8px;box-shadow: 0 0 10px darkgray;">
        <h1 style="font-size: 20px;margin-bottom: 20px;text-align: center;font-family: Maison;">Get the Ni-kshay SETU app</h1>
        <p style="font-size: 16px;line-height: 1.6;text-align: center;font-family: Maison;">Get the most of Ni-kshay SETU by installing the
            mobile app. You
            can login using your existing account.</p>

        <div style="text-align: center; coulmn-gap: 20px; align-items: center; justify-content: center; flex-wrap: wrap;">
            <a data-wow-duration="1s" href="https://apps.apple.com/by/app/nikshay-setu/id1631331386" target="_blank" rel="noreferrer" style="display: inline-block; margin:10px;">
                <img src="cid:app_store_image" alt="Icon">
            </a>
            <a data-wow-duration="2s" href="https://play.google.com/store/apps/details?id=com.iiphg.tbapp" target="_blank" rel="noreferrer" style="display: inline-block; margin:10px;">
                <img src="cid:play_store_image">
            </a>
        </div>

    </div>
    <hr style="color:gray;margin-top: 30px;">
    <div style="margin-top: 20px; font-size: 14px; color: #666; text-align: center;">
      <p style="font-size: 16px; line-height: 1.6; font-family: Maison;">©2025 Ni-kshay SETU</p>
      <div style="text-align: center; font-size: 16px; font-family: Maison;display: inline-flex; column-gap: 20px;">
        <a href="https://nikshay-setu.in/privacy-policy/" style=" text-decoration: none; margin: 0 7px; display: inline-block;">Privacy Policy</a>
        <a href="mailto:support@nikshay-setu.in" style=" text-decoration: none; margin: 0 7px; display: inline-block;">Email</a>
        <a href="mailto:info@digiflux.io" style=" text-decoration: none; margin: 0 7px; display: inline-block;">Support</a>
      </div>
    </div></div>`;
    await this.sendEmailWithAttachments(to, subject, text, html, [
      attachments,
      headerImage,
      appStoreImage,
      playStoreImage,
    ]);
  }

  async sendWelcomeMember(to: string, name: string, instituteName: string) {
    const subject = `Welcome to ${instituteName} - Your Membership Details`;
    const rootDir = process.cwd();
    const header_image = path.join(rootDir, 'images', 'Frame1000005688.png');
    const header1_image = path.join(rootDir, 'images', 'header_final.png');
    const app_store_image = path.join(rootDir, 'images', 'AppStore.png');
    const play_store_image = path.join(rootDir, 'images', 'download.png');
    const attachments = {
      filename: 'header_image.png',
      path: header_image,
      cid: 'header_image',
    };
    const headerImage = {
      filename: 'header1_image.png',
      path: header1_image,
      cid: 'header1_image',
    };

    const appStoreImage = {
      filename: 'app_store_image.png',
      path: app_store_image,
      cid: 'app_store_image',
    };

    const playStoreImage = {
      filename: 'play_store_image.png',
      path: play_store_image,
      cid: 'play_store_image',
    };
    const text = `
    Dear ${name},

    Greetings from Ni-kshay SETU!

    We are thrilled to welcome you as a new member of ${instituteName}!

    We encourage you to log in to your account using the phone No. to explore the benefits and services available to you as a member.

    If you encounter any issues or need assistance, please don't hesitate to reach out to our support team at support@nikshay-setu.in.
    Warm Regards,
    Ni-kshay SETU
  `;
    const html = `<div style="margin:10px; padding:10px; color:black; text-align: left;font-family:Raleway;max-width: 100%;">
  img src="cid:header_image" style="display: block; margin: auto; max-width: 100px; height: 100px;">

    <p style="font-family:Maison;font-size: 20px;line-height: 100%;text-align: center;font-weight: 700;color:#000000;">
        Ni-kshay SETU</p>
    <p style="font-family:Maison;font-size: 15px;line-height: 100%;text-align: center;font-weight:600;color: #707070;">
        Support to end Tuberculosis (SETU)</p>
    <img src="cid:header1_image" style="display: block; margin: auto; width: 100%; max-width: 600px; height: auto;">
  <h4 style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;color:#3E3E3E;"><strong>Dear ${name},</strong></h4>
  <p style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;color:#3E3E3E;">Greetings from Ni-kshay SETU!</p>
  <p style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;color:#3E3E3E;"> We are thrilled to welcome you as a new member of ${instituteName}!</p>
  <p style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;color:#3E3E3E;"> We encourage you to log in to your account using the phone No. to explore the benefits and services available to you as a member.</p>
  <p style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;color:#3E3E3E;"> If you encounter any issues or need assistance, please don't hesitate to reach out to our support team at support@nikshay-setu.in</p>
  <p style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;">Warm regards,</p>
  <div style="display: flex; align-items: center;margin-bottom:35px">
    <!-- Image on the Left -->
    <img src="cid:header_image" style="max-width: 50px; height: 50px; margin-right: 20px;">

    <!-- Text on the Right -->
      <div>
        <p style="font-family:Maison;font-size: 20px;line-height: 100%;font-weight: 700;color:#000000; margin: auto;">
          Ni-kshay SETU
        </p>
        <p style="font-family:Maison;font-size: 15px;line-height: 100%;font-weight:600;color: #707070; margin: auto;">
          Support to end Tuberculosis (SETU)
        </p>
      </div>
    </div>
    <div
        style="max-width: 100%;margin: 0 auto;background: #F8FAFF;padding: 20px;border-radius: 8px;box-shadow: 0 0 10px darkgray;">
        <h1 style="font-size: 20px;margin-bottom: 20px;text-align: center;font-family: Maison;">Get the Ni-kshay SETU app</h1>
        <p style="font-size: 16px;line-height: 1.6;text-align: center;font-family: Maison;">Get the most of Ni-kshay SETU by installing the
            mobile app. You
            can login using your existing account.</p>

        <div style="text-align: center; coulmn-gap: 20px; align-items: center; justify-content: center; flex-wrap: wrap;">
            <a data-wow-duration="1s" href="https://apps.apple.com/by/app/nikshay-setu/id1631331386" target="_blank" rel="noreferrer" style="display: inline-block; margin:10px;">
                <img src="cid:app_store_image" alt="Icon">
            </a>
            <a data-wow-duration="2s" href="https://play.google.com/store/apps/details?id=com.iiphg.tbapp" target="_blank" rel="noreferrer" style="display: inline-block; margin:10px;">
                <img src="cid:play_store_image">
            </a>
        </div>

    </div>
    <hr style="color:gray;margin-top: 30px;">
    <div style="margin-top: 20px; font-size: 14px; color: #666; text-align: center;">
      <p style="font-size: 16px; line-height: 1.6; font-family: Maison;">©2025 Ni-kshay SETU</p>
      <div style="text-align: center; font-size: 16px; font-family: Maison;display: inline-flex; column-gap: 20px;">
        <a href="https://nikshay-setu.in/privacy-policy/" style=" text-decoration: none; margin: 0 7px; display: inline-block;">Privacy Policy</a>
        <a href="mailto:support@nikshay-setu.in" style=" text-decoration: none; margin: 0 7px; display: inline-block;">Email</a>
        <a href="mailto:info@digiflux.io" style=" text-decoration: none; margin: 0 7px; display: inline-block;">Support</a>
      </div>
    </div></div>`;
    await this.sendEmailWithAttachments(to, subject, text, html, [
      attachments,
      headerImage,
      appStoreImage,
      playStoreImage,
    ]);
  }

  async balanceReminder(to: string) {
    const subject = `🚨 Textlocal Limit Exceeded 🚨`;
    const rootDir = process.cwd();
    const header_image = path.join(rootDir, 'images', 'Frame1000005688.png');
    const attachments = [
      {
        filename: 'header_image.png',
        path: header_image,
        cid: 'header_image',
      },
    ];
    const text = `
    Dear,

    Your Textlocal SMS limit has been reached. To continue sending messages, please renew your plan.

    If you encounter any issues or need assistance, please don't hesitate to reach out to our support team at support@nikshay-setu.in.
    Warm Regards,
    Ni-kshay SETU
  `;
    const html = `<div style="margin:10px; padding:10px; color:black; text-align: left;font-family:Raleway;max-width: 100%;">
  <img src='cid:header_image' style="display: block; margin: 0 auto; max-width: 200px; height: 150px;">
  <h4 style="font-family:Raleway;font-size:20px;line-height:1.7; text-align: left;font-weight:500;color:#3E3E3E;"><strong>Dear Mehul,</strong></h4>
  <p style="font-family:Raleway;font-size:20px;line-height:1.7; text-align: left;font-weight:500;color:#3E3E3E;">Your Textlocal SMS limit has been reached. To continue sending messages, please renew your plan.</p>
  <p style="font-family:Raleway;font-size:20px;line-height:1.7; text-align: left;font-weight:500;color:#3E3E3E;"> If you encounter any issues or need assistance, please don't hesitate to reach out to our support team at support@nikshay-setu.in</p>
  <p style="font-family:Raleway;font-size:20px;line-height:1.7; text-align: left;font-weight:500;">Warm regards,</p>
  <p style="font-family:Raleway;font-size:20px;line-height:1.7; text-align: left;font-weight:500;"><strong>Ni-kshay SETU</strong></p></div>`;
    await this.sendEmailWithAttachments(to, subject, text, html, attachments);
  }

  async sendPrescription(to: string, name: string, pdfData: Buffer) {
    const subject = `Your Prescription Details`;
    const rootDir = process.cwd();
    const header_image = path.join(rootDir, 'images', 'Frame1000005688.png');
    const header1_image = path.join(rootDir, 'images', 'header_final.png');
    const app_store_image = path.join(rootDir, 'images', 'AppStore.png');
    const play_store_image = path.join(rootDir, 'images', 'download.png');
    const attachments = {
      filename: 'header_image.png',
      path: header_image,
      cid: 'header_image',
    };

    const headerImage = {
      filename: 'header1_image.png',
      path: header1_image,
      cid: 'header1_image',
    };

    const appStoreImage = {
      filename: 'app_store_image.png',
      path: app_store_image,
      cid: 'app_store_image',
    };

    const playStoreImage = {
      filename: 'play_store_image.png',
      path: play_store_image,
      cid: 'play_store_image',
    };

    const file = {
      filename: 'PrescriptionDetails.pdf', // File name for the attachment
      content: pdfData, // Pass the Buffer data
      contentType: 'application/pdf', // MIME type for the PDF
    };

    const text = `
    Dear ${name},

    Please find your prescription details attached as a PDF document.

    If you encounter any issues or need assistance, please don't hesitate to reach out to our support team at support@nikshay-setu.in.
    Warm Regards,
    Ni-kshay SETU
  `;
    const html = `<div style="margin:10px; padding:10px; color:black; text-align: left;font-family:Maison;max-width: 100%; ">
    <img src="cid:header_image" style="display: block; margin: auto; max-width: 100px; height: 100px;">

    <p style="font-family:Maison;font-size: 20px;line-height: 100%;text-align: center;font-weight: 700;color:#000000;">
        Ni-kshay SETU</p>
    <p style="font-family:Maison;font-size: 15px;line-height: 100%;text-align: center;font-weight:600;color: #707070;">
        Support to end Tuberculosis (SETU)</p>
    <img src="cid:header1_image" style="display: block; margin: auto; width: 100%; max-width: 600px; height: auto;">

    <p style="font-family: Maison;font-size:26px;line-height:30px;text-align: left;font-weight:700;color:#000000;">
      <strong>Shared a Prescription with you.</strong>
    </p>
    <h4 style="font-family: Maison;font-size:16px;line-height:1.7;text-align: left;font-weight:500;color:#3E3E3E;">
        Dear ${name},
    </h4>
    <p style="font-family: Maison;font-size:16px;line-height:1.7;text-align: left;font-weight:500;color:#3E3E3E;">
        Please find your prescription details attached as a PDF document.</p>
    <p style="font-family: Maison;font-size:16px;line-height:1.7;text-align: left;font-weight:500;color:#3E3E3E;"> If
        you encounter any issues or need assistance, please don't hesitate to reach out to our support team at
        support@nikshay-setu.in</p>
    <p style="font-family: Maison;font-size:16px;line-height:1.7;text-align: left;font-weight:500;">Warm regards,</p>
    <div style="display: flex; align-items: center;margin-bottom:35px">
    <!-- Image on the Left -->
    <img src="cid:header_image" style="max-width: 50px; height: 50px; margin-right: 20px;">

    <!-- Text on the Right -->
      <div>
        <p style="font-family:Maison;font-size: 20px;line-height: 100%;font-weight: 700;color:#000000; margin: auto;">
          Ni-kshay SETU
        </p>
        <p style="font-family:Maison;font-size: 15px;line-height: 100%;font-weight:600;color: #707070; margin: auto;">
          Support to end Tuberculosis (SETU)
        </p>
      </div>
    </div>
    <div
        style="max-width: 100%;margin: 0 auto;background: #F8FAFF;padding: 20px;border-radius: 8px;box-shadow: 0 0 10px darkgray;">
        <h1 style="font-size: 20px;margin-bottom: 20px;text-align: center;font-family: Maison;">Get the Ni-kshay SETU app</h1>
        <p style="font-size: 16px;line-height: 1.6;text-align: center;font-family: Maison;">Get the most of Ni-kshay SETU by installing the
            mobile app. You
            can login using your existing account.</p>

        <div style="text-align: center; coulmn-gap: 20px; align-items: center; justify-content: center; flex-wrap: wrap;">
            <a data-wow-duration="1s" href="https://apps.apple.com/by/app/nikshay-setu/id1631331386" target="_blank" rel="noreferrer" style="display: inline-block; margin:10px;">
                <img src="cid:app_store_image" alt="Icon">
            </a>
            <a data-wow-duration="2s" href="https://play.google.com/store/apps/details?id=com.iiphg.tbapp" target="_blank" rel="noreferrer" style="display: inline-block; margin:10px;">
                <img src="cid:play_store_image">
            </a>
        </div>

    </div>
    <hr style="color:gray;margin-top: 30px;">
    <div style="margin-top: 20px; font-size: 14px; color: #666; text-align: center;">
      <p style="font-size: 16px; line-height: 1.6; font-family: Maison;">©2025 Ni-kshay SETU</p>
      <div style="text-align: center; font-size: 16px; font-family: Maison;display: inline-flex; column-gap: 20px;">
        <a href="https://nikshay-setu.in/privacy-policy/" style=" text-decoration: none; margin: 0 7px; display: inline-block;">Privacy Policy</a>
        <a href="mailto:support@nikshay-setu.in" style=" text-decoration: none; margin: 0 7px; display: inline-block;">Email</a>
        <a href="mailto:info@digiflux.io" style=" text-decoration: none; margin: 0 7px; display: inline-block;">Support</a>
      </div>
    </div>
</div>`;
    await this.sendEmailWithAttachment(to, subject, text, html, [
      file,
      attachments,
      headerImage,
      appStoreImage,
      playStoreImage,
    ]);
  }

  async sendEnquiryDetail(to: string, subject: string, message: string) {
    const emailSubject = `Your Inquiry Received: ${subject}`;
    const rootDir = process.cwd();
    const header_image = path.join(rootDir, 'images', 'Frame1000005688.png');
    const header1_image = path.join(rootDir, 'images', 'header_final.png');
    const app_store_image = path.join(rootDir, 'images', 'AppStore.png');
    const play_store_image = path.join(rootDir, 'images', 'download.png');
    const attachments = {
      filename: 'header_image.png',
      path: header_image,
      cid: 'header_image',
    };
    const headerImage = {
      filename: 'header1_image.png',
      path: header1_image,
      cid: 'header1_image',
    };

    const appStoreImage = {
      filename: 'app_store_image.png',
      path: app_store_image,
      cid: 'app_store_image',
    };

    const playStoreImage = {
      filename: 'play_store_image.png',
      path: play_store_image,
      cid: 'play_store_image',
    };
    const text = `

      Greetings from Ni-kshay-SETU!

      Thank you for reaching out to us with your inquiry. We have received the following details:

      Subject: ${subject}
      Message: ${message}

      Our support team will review your query and get back to you shortly. If you need immediate assistance, feel free to contact us at support@nikshay-setu.in.

      Warm Regards,
      Ni-kshay SETU
    `;

    const html = `
      <div style="margin:10px; padding:10px; color:black; text-align: left; font-family:Raleway; max-width: 100%;">
        <img src="cid:header_image" style="display: block; margin: auto; max-width: 100px; height: 100px;">

    <p style="font-family:Maison;font-size: 20px;line-height: 100%;text-align: center;font-weight: 700;color:#000000;">
        Ni-kshay SETU</p>
    <p style="font-family:Maison;font-size: 15px;line-height: 100%;text-align: center;font-weight:600;color: #707070;">
        Support to end Tuberculosis (SETU)</p>
    <img src="cid:header1_image" style="display: block; margin: auto; width: 100%; max-width: 600px; height: auto;">
        <p style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;color:#3E3E3E;">
          Greetings from Ni-kshay-SETU!
        </p>
        <p style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;color:#3E3E3E;">
          Thank you for reaching out to us with your inquiry. We have received the following details:
        </p>
        <p style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;color:#3E3E3E;">
          <strong>Subject:</strong> ${subject}
        </p>
        <p style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;color:#3E3E3E;">
          <strong>Message:</strong> ${message}
        </p>
        <p style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;color:#3E3E3E;">
          Our support team will review your query and get back to you shortly. If you need immediate assistance, feel free to contact us at <a href="mailto:support@nikshay-setu.in">support@nikshay-setu.in</a>.
        </p>
        <p style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;">Warm regards,</p>
        <div style="display: flex; align-items: center;margin-bottom:35px">
    <!-- Image on the Left -->
    <img src="cid:header_image" style="max-width: 50px; height: 50px; margin-right: 20px;">

    <!-- Text on the Right -->
      <div>
        <p style="font-family:Maison;font-size: 20px;line-height: 100%;font-weight: 700;color:#000000; margin: auto;">
          Ni-kshay SETU
        </p>
        <p style="font-family:Maison;font-size: 15px;line-height: 100%;font-weight:600;color: #707070; margin: auto;">
          Support to end Tuberculosis (SETU)
        </p>
      </div>
    </div>
    <div
        style="max-width: 100%;margin: 0 auto;background: #F8FAFF;padding: 20px;border-radius: 8px;box-shadow: 0 0 10px darkgray;">
        <h1 style="font-size: 20px;margin-bottom: 20px;text-align: center;font-family: Maison;">Get the Ni-kshay SETU app</h1>
        <p style="font-size: 16px;line-height: 1.6;text-align: center;font-family: Maison;">Get the most of Ni-kshay SETU by installing the
            mobile app. You
            can login using your existing account.</p>

        <div style="text-align: center; coulmn-gap: 20px; align-items: center; justify-content: center; flex-wrap: wrap;">
            <a data-wow-duration="1s" href="https://apps.apple.com/by/app/nikshay-setu/id1631331386" target="_blank" rel="noreferrer" style="display: inline-block; margin:10px;">
                <img src="cid:app_store_image" alt="Icon">
            </a>
            <a data-wow-duration="2s" href="https://play.google.com/store/apps/details?id=com.iiphg.tbapp" target="_blank" rel="noreferrer" style="display: inline-block; margin:10px;">
                <img src="cid:play_store_image">
            </a>
        </div>

    </div>
    <hr style="color:gray;margin-top: 30px;">
    <div style="margin-top: 20px; font-size: 14px; color: #666; text-align: center;">
      <p style="font-size: 16px; line-height: 1.6; font-family: Maison;">©2025 Ni-kshay SETU</p>
      <div style="text-align: center; font-size: 16px; font-family: Maison;display: inline-flex; column-gap: 20px;">
        <a href="https://nikshay-setu.in/privacy-policy/" style=" text-decoration: none; margin: 0 7px; display: inline-block;">Privacy Policy</a>
        <a href="mailto:support@nikshay-setu.in" style=" text-decoration: none; margin: 0 7px; display: inline-block;">Email</a>
        <a href="mailto:info@digiflux.io" style=" text-decoration: none; margin: 0 7px; display: inline-block;">Support</a>
      </div>
    </div>
      </div>
    `;
    await this.sendEmailWithAttachments(
      to,
      emailSubject,
      text,
      html,
      [attachments, headerImage, appStoreImage, playStoreImage],
      [process.env.EMAIL_FROM],
    );
  }

  async sendDeleteAccountDetail(to: string, userDetails: any, reason: string) {
    const subject = `Ni-kshay-SETU: Account Deletion Confirmation`;
    const rootDir = process.cwd();
    const header_image = path.join(rootDir, 'images', 'Frame1000005688.png');
    const attachments = [
      {
        filename: 'header_image.png',
        path: header_image,
        cid: 'header_image',
      },
    ];
    const text = `Hi ${userDetails?.name},

      Greetings from Digiflux Team!

      We wanted to inform you that a request to delete an account has been received with the following user details:

      - Registered Email: ${userDetails?.email}  
      - Registered Phone No: ${userDetails?.phoneNo}  
      - Cadre Type: ${userDetails?.cadreType}  
      - Cadre Id: ${userDetails?.cadreId.title}  
      - Country Id: ${userDetails?.countryId?.title}  
      - State Id: ${userDetails?.stateId?.title}  
      - District Id: ${userDetails?.districtId?.title}  
      - Block Id: ${userDetails?.blockId?.title}  
      - Health-Facility Id: ${userDetails?.healthFacilityId?.title}  
      - Is Old User: ${userDetails?.isOldUser}  
      - Role: ${userDetails?.role}  
      - User Context: ${userDetails?.userContext} 
      - Reason: ${reason}  

      The request has been logged and is being handled with utmost care and security. The account is scheduled for permanent deletion within 48 hours.

      If this request was authorized and aligns with your expectations, no further action is required. Should there be any discrepancies or concerns, please reach out to our support team immediately at support@nikshay-setu.in.

      We value your trust and are committed to maintaining the highest level of security and professionalism.

      Warm Regards,  
      Digiflux Team
    `;

    const html = `<div style="margin:10px; padding:10px; color:black; text-align: left; font-family:Raleway; max-width: 100%;">
        <h4 style="font-family:Raleway; font-size:16px; line-height:1.7; text-align: left; font-weight:500; color:#3E3E3E;">
          <strong>Hi ${userDetails?.name},</strong>
        </h4>
        <p style="font-family:Raleway; font-size:16px; line-height:1.7; text-align: left; font-weight:500; color:#3E3E3E;">
          Greetings from  Digiflux Team!
        </p>
        <p style="font-family:Raleway; font-size:16px; line-height:1.7; text-align: left; font-weight:500; color:#3E3E3E;">
          We wanted to inform you that a request to delete an account has been received with the following user details:
        </p>
        <ul style="font-family:Raleway; font-size:16px; line-height:1.7; text-align: left; font-weight:500; color:#3E3E3E; padding-left: 16px;">
          <li><strong>Registered Email:</strong> ${userDetails?.email}</li>
          <li><strong>Registered Phone No:</strong> ${userDetails?.phoneNo}</li>
          <li><strong>Cadre Type:</strong> ${userDetails?.cadreType}</li>
          <li><strong>Cadre Id:</strong> ${userDetails?.cadreId?.title}</li>
          <li><strong>Country Id:</strong> ${userDetails?.countryId?.title}</li>
          <li><strong>State Id:</strong> ${userDetails?.stateId?.title}</li>
          <li><strong>District Id:</strong> ${userDetails?.districtId?.title}</li>
          <li><strong>Block Id:</strong> ${userDetails?.blockId?.title}</li>
          <li><strong>Health-Facility Id:</strong> ${userDetails?.healthFacilityId?.title}</li>
          <li><strong>Is Old User:</strong> ${userDetails?.isOldUser}</li>
          <li><strong>Role:</strong> ${userDetails?.role}</li>
          <li><strong>User Context:</strong> ${userDetails?.userContext}</li>
          <li><strong>Reason:</strong> ${reason}</li>
        </ul>
        <p style="font-family:Raleway; font-size:16px; line-height:1.7; text-align: left; font-weight:500; color:#3E3E3E;">
          The request has been logged and is being handled with utmost care and security. The account is scheduled for permanent deletion within 48 hours.
        </p>
        <p style="font-family:Raleway; font-size:16px; line-height:1.7; text-align: left; font-weight:500; color:#3E3E3E;">
          If this request was authorized and aligns with your expectations, no further action is required. Should there be any discrepancies or concerns, please reach out to our support team immediately at support@nikshay-setu.in.
        </p>
        <p style="font-family:Raleway; font-size:16px; line-height:1.7; text-align: left; font-weight:500; color:#3E3E3E;">
          We value your trust and are committed to maintaining the highest level of security and professionalism.
        </p>
        <p style="font-family:Raleway; font-size:16px; line-height:1.7; text-align: left; font-weight:500;">
          Warm regards,
        </p>
        <p style="font-family:Raleway; font-size:16px; line-height:1.7; text-align: left; font-weight:500;">
          <strong> Digiflux Team</strong>
        </p>
      </div>
    `;
    await this.sendEmailWithAttachments(to, subject, text, html, attachments);
  }

  async forgotPasswordEmail(to: string, temporaryToken: string) {
    const subject = 'Reset Password';
    const rootDir = process.cwd();
    const header_image = path.join(rootDir, 'images', 'Frame1000005688.png');
    const header1_image = path.join(rootDir, 'images', 'header_final.png');
    const app_store_image = path.join(rootDir, 'images', 'AppStore.png');
    const play_store_image = path.join(rootDir, 'images', 'download.png');
    const attachments = {
      filename: 'header_image.png',
      path: header_image,
      cid: 'header_image',
    };
    const headerImage = {
      filename: 'header1_image.png',
      path: header1_image,
      cid: 'header1_image',
    };

    const appStoreImage = {
      filename: 'app_store_image.png',
      path: app_store_image,
      cid: 'app_store_image',
    };

    const playStoreImage = {
      filename: 'play_store_image.png',
      path: play_store_image,
      cid: 'play_store_image',
    };
    const text = `
    Hello!
    You are receiving this email because we received a password reset request for your account.
    If you did not request a password reset, no further action is required.
    
    Warm Regards,
    Ni-kshay SETU
  `;
    const html = `<div style="margin:10px; padding:10px; color:black; text-align: left;font-family:Raleway;max-width: 100%;">
  <img src="cid:header_image" style="display: block; margin: auto; max-width: 100px; height: 100px;">

    <p style="font-family:Maison;font-size: 20px;line-height: 100%;text-align: center;font-weight: 700;color:#000000;">
        Ni-kshay SETU</p>
    <p style="font-family:Maison;font-size: 15px;line-height: 100%;text-align: center;font-weight:600;color: #707070;">
        Support to end Tuberculosis (SETU)</p>
    <img src="cid:header1_image" style="display: block; margin: auto; width: 100%; max-width: 600px; height: auto;">
  <h4 style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;color:#3E3E3E;"><strong>Hello!</strong></h4>
  <p style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;color:#3E3E3E;">You are receiving this email because we received a password reset request for your account.</p>
   <a href="https://uat-administration.nikshay-setu.in/resetpassword/${temporaryToken}" 
     style="display:inline-block; background-color:#007BFF; color:#FFFFFF; padding:10px 16px; text-decoration:none; font-family:Raleway; font-size:18px; line-height:1.5; font-weight:bold; border-radius:5px; text-align:center;">
     Reset Password
  </a>
  <p style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;color:#3E3E3E;">If you did not request a password reset, no further action is required.</p>
  
  <hr>
  <p style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;color:#3E3E3E;">If you're having trouble clicking the "Reset Password" button, copy and paste the URL below into your web browser: https://ns-v3-admin.nikshay-setu.in/password-reset/${temporaryToken}</p>
  <p style="font-family:Raleway;font-size:16px;line-height:1.7; text-align: left;font-weight:500;">Warm regards,</p>
  <div style="display: flex; align-items: center;margin-bottom:35px">
    <!-- Image on the Left -->
    <img src="cid:header_image" style="max-width: 50px; height: 50px; margin-right: 20px;">

    <!-- Text on the Right -->
      <div>
        <p style="font-family:Maison;font-size: 20px;line-height: 100%;font-weight: 700;color:#000000; margin: auto;">
          Ni-kshay SETU
        </p>
        <p style="font-family:Maison;font-size: 15px;line-height: 100%;font-weight:600;color: #707070; margin: auto;">
          Support to end Tuberculosis (SETU)
        </p>
      </div>
    </div>
    <div
        style="max-width: 100%;margin: 0 auto;background: #F8FAFF;padding: 20px;border-radius: 8px;box-shadow: 0 0 10px darkgray;">
        <h1 style="font-size: 20px;margin-bottom: 20px;text-align: center;font-family: Maison;">Get the Ni-kshay SETU app</h1>
        <p style="font-size: 16px;line-height: 1.6;text-align: center;font-family: Maison;">Get the most of Ni-kshay SETU by installing the
            mobile app. You
            can login using your existing account.</p>

        <div style="text-align: center; coulmn-gap: 20px; align-items: center; justify-content: center; flex-wrap: wrap;">
            <a data-wow-duration="1s" href="https://apps.apple.com/by/app/nikshay-setu/id1631331386" target="_blank" rel="noreferrer" style="display: inline-block; margin:10px;">
                <img src="cid:app_store_image" alt="Icon">
            </a>
            <a data-wow-duration="2s" href="https://play.google.com/store/apps/details?id=com.iiphg.tbapp" target="_blank" rel="noreferrer" style="display: inline-block; margin:10px;">
                <img src="cid:play_store_image">
            </a>
        </div>

    </div>
    <hr style="color:gray;margin-top: 30px;">
    <div style="margin-top: 20px; font-size: 14px; color: #666; text-align: center;">
      <p style="font-size: 16px; line-height: 1.6; font-family: Maison;">©2025 Ni-kshay SETU</p>
      <div style="text-align: center; font-size: 16px; font-family: Maison;display: inline-flex; column-gap: 20px;">
        <a href="https://nikshay-setu.in/privacy-policy/" style=" text-decoration: none; margin: 0 7px; display: inline-block;">Privacy Policy</a>
        <a href="mailto:support@nikshay-setu.in" style=" text-decoration: none; margin: 0 7px; display: inline-block;">Email</a>
        <a href="mailto:info@digiflux.io" style=" text-decoration: none; margin: 0 7px; display: inline-block;">Support</a>
      </div>
    </div>
  </div>`;
    await this.sendEmailWithAttachments(to, subject, text, html, [
      attachments,
      headerImage,
      appStoreImage,
      playStoreImage,
    ]);
  }
}
