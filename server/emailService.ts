import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY not found - email verification will not work");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = 'noreply@fixconnect.ae';

interface EmailVerificationData {
  firstName: string;
  email: string;
  verificationLink: string;
  userType: 'homeowner' | 'company';
}

export async function sendVerificationEmail(data: EmailVerificationData): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('Email verification skipped - no SendGrid API key');
    return true; // Return true for development to not block registration
  }

  const userTypeText = data.userType === 'company' ? 'company' : 'homeowner';
  const subject = `Verify your ${userTypeText} account - FixConnect`;
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification - FixConnect</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">FixConnect</h1>
    <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">UAE's Premier Home Maintenance Platform</p>
  </div>
  
  <div style="background: white; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none;">
    <h2 style="color: #333; margin-bottom: 20px;">Welcome to FixConnect, ${data.firstName}!</h2>
    
    <p style="margin-bottom: 20px;">
      Thank you for registering as a ${userTypeText} on FixConnect. To complete your registration and start ${data.userType === 'company' ? 'offering your services' : 'booking maintenance services'}, please verify your email address.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.verificationLink}" 
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 15px 30px; 
                text-decoration: none; 
                border-radius: 8px; 
                font-weight: bold; 
                display: inline-block;
                font-size: 16px;">
        Verify Email Address
      </a>
    </div>
    
    <p style="margin-top: 30px; font-size: 14px; color: #666;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 14px;">
      ${data.verificationLink}
    </p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="font-size: 14px; color: #666; margin-bottom: 5px;">
      <strong>What's next?</strong>
    </p>
    <ul style="font-size: 14px; color: #666; padding-left: 20px;">
      ${data.userType === 'company' ? `
        <li>Complete your company profile with trade license details</li>
        <li>Wait for admin approval (usually within 2-3 business days)</li>
        <li>Start receiving service requests from homeowners</li>
      ` : `
        <li>Complete your profile setup</li>
        <li>Browse trusted maintenance companies</li>
        <li>Request services for your property</li>
      `}
    </ul>
    
    <p style="font-size: 12px; color: #999; margin-top: 30px;">
      This verification link will expire in 24 hours. If you didn't create this account, please ignore this email.
    </p>
  </div>
  
  <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666;">
    <p style="margin: 0;">
      © 2024 FixConnect UAE. Connecting homeowners with trusted maintenance professionals.
    </p>
  </div>
</body>
</html>
  `;

  const textContent = `
Welcome to FixConnect, ${data.firstName}!

Thank you for registering as a ${userTypeText} on FixConnect. To complete your registration and start ${data.userType === 'company' ? 'offering your services' : 'booking maintenance services'}, please verify your email address.

Verify your email by visiting: ${data.verificationLink}

This verification link will expire in 24 hours. If you didn't create this account, please ignore this email.

© 2024 FixConnect UAE - Connecting homeowners with trusted maintenance professionals.
  `;

  try {
    await mailService.send({
      to: data.email,
      from: FROM_EMAIL,
      subject,
      text: textContent,
      html: htmlContent,
    });
    
    console.log(`Verification email sent to ${data.email}`);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}