---
sidebar_position: 2
title: Email Service Adapters
description: Complete guide to integrating email services with Mifty including Gmail, SMTP, SendGrid, and AWS SES
keywords: [email, gmail, smtp, sendgrid, aws ses, email service, notifications]
---

import AdapterGuide from '@site/src/components/AdapterGuide';

# Email Service Adapters

Mifty provides comprehensive email service adapters that support multiple providers through a unified interface. You can easily switch between different email providers by changing environment variables, making it perfect for development, staging, and production environments.

## Universal Email Service Adapter

The universal email service adapter allows you to switch between different email providers without changing your code. Simply configure the provider in your environment variables.

<AdapterGuide
  name="Universal Email Service"
  command="npm run adapter install email-service"
  description="Universal email adapter that supports Gmail, SMTP, SendGrid, and AWS SES with provider switching via environment variables"
  category="email"
  envVars={[
    {
      name: "EMAIL_PROVIDER",
      description: "Email service provider to use",
      required: true,
      example: "gmail"
    },
    {
      name: "EMAIL_FROM_NAME",
      description: "Default sender name for all emails",
      required: true,
      example: "Your App Name"
    },
    {
      name: "EMAIL_FROM_ADDRESS",
      description: "Default sender email address",
      required: true,
      example: "noreply@yourapp.com"
    }
  ]}
  configSteps={[
    {
      step: 1,
      title: "Install the Universal Email Adapter",
      description: "Install the email service adapter that supports multiple providers",
      code: "npm run adapter install email-service",
      language: "bash"
    },
    {
      step: 2,
      title: "Choose Your Email Provider",
      description: "Configure your preferred email provider in the .env file",
      code: `# Choose one of: gmail, smtp, sendgrid, aws-ses
EMAIL_PROVIDER=gmail
EMAIL_FROM_NAME=Your App Name
EMAIL_FROM_ADDRESS=noreply@yourapp.com`,
      language: "bash"
    },
    {
      step: 3,
      title: "Configure Provider-Specific Settings",
      description: "Add the specific configuration for your chosen provider (see provider sections below)"
    }
  ]}
  examples={[
    {
      title: "Basic Email Sending",
      description: "Send emails using the universal email service",
      code: `import { EmailService } from '@mifty/email-service';

const emailService = new EmailService();

// Send a simple email
await emailService.send({
  to: 'user@example.com',
  subject: 'Welcome to Our App',
  text: 'Thank you for signing up!',
  html: '<h1>Welcome!</h1><p>Thank you for signing up!</p>'
});

// Send email with attachments
await emailService.send({
  to: 'user@example.com',
  subject: 'Your Invoice',
  html: '<p>Please find your invoice attached.</p>',
  attachments: [
    {
      filename: 'invoice.pdf',
      path: './invoices/invoice-123.pdf'
    }
  ]
});`,
      language: "typescript"
    },
    {
      title: "Email Templates",
      description: "Use email templates for consistent branding",
      code: `// Define email templates
const templates = {
  welcome: {
    subject: 'Welcome to {{appName}}',
    html: \`
      <div style="font-family: Arial, sans-serif;">
        <h1>Welcome {{userName}}!</h1>
        <p>Thank you for joining {{appName}}.</p>
        <a href="{{verificationLink}}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none;">
          Verify Your Email
        </a>
      </div>
    \`
  }
};

// Send templated email
await emailService.sendTemplate('welcome', {
  to: 'user@example.com',
  data: {
    appName: 'MyApp',
    userName: 'John Doe',
    verificationLink: 'https://myapp.com/verify/abc123'
  }
});`,
      language: "typescript"
    },
    {
      title: "Bulk Email Sending",
      description: "Send emails to multiple recipients efficiently",
      code: `// Send to multiple recipients
const recipients = [
  { email: 'user1@example.com', name: 'User One' },
  { email: 'user2@example.com', name: 'User Two' }
];

await emailService.sendBulk({
  subject: 'Monthly Newsletter',
  html: '<h1>Newsletter</h1><p>Latest updates...</p>',
  recipients: recipients
});`,
      language: "typescript"
    }
  ]}
  troubleshooting={[
    {
      problem: "Emails not being sent",
      solution: "Check that EMAIL_PROVIDER is set correctly and the provider-specific credentials are configured"
    },
    {
      problem: "Emails going to spam",
      solution: "Set up proper SPF, DKIM, and DMARC records for your domain, and use a verified sender address"
    },
    {
      problem: "Rate limiting errors",
      solution: "Implement email queuing and respect the rate limits of your email provider"
    }
  ]}
/>

## Gmail Integration

<AdapterGuide
  name="Gmail Email Service"
  command="npm run adapter install email-gmail"
  description="Send emails through Gmail using App Passwords for secure authentication"
  category="email"
  envVars={[
    {
      name: "EMAIL_PROVIDER",
      description: "Set to 'gmail' to use Gmail service",
      required: true,
      example: "gmail"
    },
    {
      name: "GMAIL_USER",
      description: "Your Gmail email address",
      required: true,
      example: "your-email@gmail.com"
    },
    {
      name: "GMAIL_APP_PASSWORD",
      description: "Gmail App Password (not your regular password)",
      required: true,
      example: "abcd efgh ijkl mnop"
    }
  ]}
  configSteps={[
    {
      step: 1,
      title: "Enable 2-Factor Authentication",
      description: "Enable 2FA on your Gmail account (required for App Passwords)",
      note: "Go to Google Account settings > Security > 2-Step Verification"
    },
    {
      step: 2,
      title: "Generate App Password",
      description: "Create an App Password specifically for your application",
      code: `1. Go to Google Account settings
2. Security > 2-Step Verification > App passwords
3. Select 'Mail' and your device
4. Copy the generated 16-character password`,
      language: "text"
    },
    {
      step: 3,
      title: "Configure Environment Variables",
      description: "Add Gmail credentials to your .env file",
      code: `EMAIL_PROVIDER=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM_NAME=Your App Name
EMAIL_FROM_ADDRESS=your-email@gmail.com`,
      language: "bash"
    }
  ]}
  examples={[
    {
      title: "Gmail-Specific Configuration",
      description: "Configure Gmail with custom settings",
      code: `// services/email/gmail.ts
import { GmailService } from '@mifty/email-gmail';

const gmailService = new GmailService({
  user: process.env.GMAIL_USER,
  appPassword: process.env.GMAIL_APP_PASSWORD,
  defaultFrom: {
    name: process.env.EMAIL_FROM_NAME,
    address: process.env.EMAIL_FROM_ADDRESS
  }
});

export default gmailService;`,
      language: "typescript"
    }
  ]}
  troubleshooting={[
    {
      problem: "Authentication failed error",
      solution: "Ensure 2FA is enabled and you're using an App Password, not your regular Gmail password"
    },
    {
      problem: "Less secure app access error",
      solution: "Use App Passwords instead of enabling 'Less secure app access' which is deprecated"
    },
    {
      problem: "Daily sending limit exceeded",
      solution: "Gmail has a daily sending limit of 500 emails. Consider upgrading to Google Workspace or using a dedicated email service"
    }
  ]}
/>

## SMTP Configuration

<AdapterGuide
  name="SMTP Email Service"
  command="npm run adapter install email-smtp"
  description="Connect to any SMTP server for email delivery with full customization options"
  category="email"
  envVars={[
    {
      name: "EMAIL_PROVIDER",
      description: "Set to 'smtp' to use SMTP service",
      required: true,
      example: "smtp"
    },
    {
      name: "SMTP_HOST",
      description: "SMTP server hostname",
      required: true,
      example: "smtp.yourdomain.com"
    },
    {
      name: "SMTP_PORT",
      description: "SMTP server port",
      required: true,
      example: "587"
    },
    {
      name: "SMTP_SECURE",
      description: "Use TLS/SSL encryption",
      required: false,
      example: "true",
      default: "false"
    },
    {
      name: "SMTP_USER",
      description: "SMTP authentication username",
      required: true,
      example: "your-email@yourdomain.com"
    },
    {
      name: "SMTP_PASSWORD",
      description: "SMTP authentication password",
      required: true,
      example: "your-smtp-password"
    }
  ]}
  configSteps={[
    {
      step: 1,
      title: "Get SMTP Credentials",
      description: "Obtain SMTP server details from your email provider or hosting service"
    },
    {
      step: 2,
      title: "Configure SMTP Settings",
      description: "Add SMTP configuration to your .env file",
      code: `EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-email@yourdomain.com
SMTP_PASSWORD=your-smtp-password
EMAIL_FROM_NAME=Your App Name
EMAIL_FROM_ADDRESS=your-email@yourdomain.com`,
      language: "bash"
    },
    {
      step: 3,
      title: "Test Connection",
      description: "Test your SMTP configuration by sending a test email",
      code: "npm run email:test",
      language: "bash"
    }
  ]}
  examples={[
    {
      title: "Common SMTP Providers",
      description: "Configuration examples for popular SMTP providers",
      code: `# Outlook/Hotmail
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=true

# Yahoo Mail
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=true

# Custom hosting (cPanel)
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=true`,
      language: "bash"
    },
    {
      title: "SMTP with Connection Pooling",
      description: "Configure SMTP with connection pooling for better performance",
      code: `// services/email/smtp.ts
import { SMTPService } from '@mifty/email-smtp';

const smtpService = new SMTPService({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  },
  pool: true, // Enable connection pooling
  maxConnections: 5,
  maxMessages: 100
});`,
      language: "typescript"
    }
  ]}
  troubleshooting={[
    {
      problem: "Connection timeout errors",
      solution: "Check firewall settings and ensure the SMTP port is not blocked. Try different ports (25, 465, 587)"
    },
    {
      problem: "Authentication failed",
      solution: "Verify SMTP username and password. Some providers require app-specific passwords"
    },
    {
      problem: "TLS/SSL errors",
      solution: "Try toggling SMTP_SECURE between true and false, or use a different port"
    }
  ]}
/>

## SendGrid Integration

<AdapterGuide
  name="SendGrid Email Service"
  command="npm run adapter install sendgrid"
  description="Professional email delivery service with advanced analytics and deliverability features"
  category="email"
  envVars={[
    {
      name: "EMAIL_PROVIDER",
      description: "Set to 'sendgrid' to use SendGrid service",
      required: true,
      example: "sendgrid"
    },
    {
      name: "SENDGRID_API_KEY",
      description: "SendGrid API key from your SendGrid dashboard",
      required: true,
      example: "SG.xxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    },
    {
      name: "SENDGRID_FROM_EMAIL",
      description: "Verified sender email address in SendGrid",
      required: true,
      example: "noreply@yourdomain.com"
    }
  ]}
  configSteps={[
    {
      step: 1,
      title: "Create SendGrid Account",
      description: "Sign up for a SendGrid account and verify your email address"
    },
    {
      step: 2,
      title: "Create API Key",
      description: "Generate an API key with appropriate permissions",
      code: `1. Go to SendGrid Dashboard > Settings > API Keys
2. Click 'Create API Key'
3. Choose 'Restricted Access'
4. Grant 'Mail Send' permissions
5. Copy the generated API key`,
      language: "text"
    },
    {
      step: 3,
      title: "Verify Sender Identity",
      description: "Verify your sender email address or domain",
      note: "Go to Settings > Sender Authentication to verify your email or set up domain authentication"
    },
    {
      step: 4,
      title: "Configure Environment Variables",
      description: "Add SendGrid credentials to your .env file",
      code: `EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
EMAIL_FROM_NAME=Your App Name`,
      language: "bash"
    }
  ]}
  examples={[
    {
      title: "SendGrid with Templates",
      description: "Use SendGrid dynamic templates for professional emails",
      code: `// services/email/sendgrid.ts
import { SendGridService } from '@mifty/sendgrid';

const sendgridService = new SendGridService({
  apiKey: process.env.SENDGRID_API_KEY,
  defaultFrom: process.env.SENDGRID_FROM_EMAIL
});

// Send with dynamic template
await sendgridService.sendTemplate({
  to: 'user@example.com',
  templateId: 'd-1234567890abcdef',
  dynamicTemplateData: {
    userName: 'John Doe',
    verificationUrl: 'https://app.com/verify/abc123'
  }
});`,
      language: "typescript"
    },
    {
      title: "SendGrid with Categories and Tags",
      description: "Organize emails with categories and tags for better analytics",
      code: `await sendgridService.send({
  to: 'user@example.com',
  subject: 'Welcome to Our App',
  html: '<h1>Welcome!</h1>',
  categories: ['onboarding', 'welcome'],
  customArgs: {
    userId: '12345',
    campaignId: 'welcome-series'
  }
});`,
      language: "typescript"
    }
  ]}
  troubleshooting={[
    {
      problem: "Forbidden error (403)",
      solution: "Ensure your API key has 'Mail Send' permissions and your sender email is verified"
    },
    {
      problem: "Emails not delivered",
      solution: "Check SendGrid's Activity Feed for delivery status and any bounce/spam reports"
    },
    {
      problem: "Template not found error",
      solution: "Verify the template ID exists in your SendGrid account and is active"
    }
  ]}
/>

## AWS SES Integration

<AdapterGuide
  name="AWS SES Email Service"
  command="npm run adapter install aws-ses"
  description="Amazon Simple Email Service for scalable, cost-effective email delivery with AWS integration"
  category="email"
  envVars={[
    {
      name: "EMAIL_PROVIDER",
      description: "Set to 'aws-ses' to use AWS SES service",
      required: true,
      example: "aws-ses"
    },
    {
      name: "AWS_REGION",
      description: "AWS region for SES service",
      required: true,
      example: "us-east-1"
    },
    {
      name: "AWS_ACCESS_KEY_ID",
      description: "AWS access key ID with SES permissions",
      required: true,
      example: "AKIAIOSFODNN7EXAMPLE"
    },
    {
      name: "AWS_SECRET_ACCESS_KEY",
      description: "AWS secret access key",
      required: true,
      example: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
    },
    {
      name: "SES_FROM_EMAIL",
      description: "Verified sender email address in AWS SES",
      required: true,
      example: "noreply@yourdomain.com"
    }
  ]}
  configSteps={[
    {
      step: 1,
      title: "Set up AWS Account",
      description: "Create an AWS account and access the SES console"
    },
    {
      step: 2,
      title: "Verify Email Address or Domain",
      description: "Verify your sender email address or entire domain in SES",
      code: `1. Go to AWS SES Console > Verified identities
2. Click 'Create identity'
3. Choose 'Email address' or 'Domain'
4. Follow verification instructions`,
      language: "text"
    },
    {
      step: 3,
      title: "Request Production Access",
      description: "Move out of SES sandbox mode for production use",
      note: "In sandbox mode, you can only send to verified email addresses"
    },
    {
      step: 4,
      title: "Create IAM User",
      description: "Create an IAM user with SES permissions",
      code: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    }
  ]
}`,
      language: "json"
    },
    {
      step: 5,
      title: "Configure Environment Variables",
      description: "Add AWS SES credentials to your .env file",
      code: `EMAIL_PROVIDER=aws-ses
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
SES_FROM_EMAIL=noreply@yourdomain.com
EMAIL_FROM_NAME=Your App Name`,
      language: "bash"
    }
  ]}
  examples={[
    {
      title: "AWS SES with Configuration Sets",
      description: "Use SES configuration sets for advanced tracking and analytics",
      code: `// services/email/aws-ses.ts
import { AWSSESService } from '@mifty/aws-ses';

const sesService = new AWSSESService({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  defaultFrom: process.env.SES_FROM_EMAIL,
  configurationSet: 'my-config-set' // Optional
});

// Send with tracking
await sesService.send({
  to: 'user@example.com',
  subject: 'Welcome',
  html: '<h1>Welcome!</h1>',
  tags: [
    { Name: 'campaign', Value: 'welcome' },
    { Name: 'environment', Value: 'production' }
  ]
});`,
      language: "typescript"
    },
    {
      title: "SES with SNS Notifications",
      description: "Set up bounce and complaint handling with SNS",
      code: `// Handle SES notifications
import { SNSEvent } from 'aws-lambda';

export const handleSESNotification = async (event: SNSEvent) => {
  for (const record of event.Records) {
    const message = JSON.parse(record.Sns.Message);
    
    if (message.notificationType === 'Bounce') {
      // Handle bounce
      console.log('Email bounced:', message.bounce);
      // Update user email status in database
    } else if (message.notificationType === 'Complaint') {
      // Handle complaint
      console.log('Spam complaint:', message.complaint);
      // Unsubscribe user from emails
    }
  }
};`,
      language: "typescript"
    }
  ]}
  troubleshooting={[
    {
      problem: "Email address not verified error",
      solution: "Verify your sender email address in the AWS SES console before sending emails"
    },
    {
      problem: "Sending quota exceeded",
      solution: "Check your SES sending limits and request a quota increase if needed"
    },
    {
      problem: "Account in sandbox mode",
      solution: "Request production access through the AWS SES console to send to any email address"
    }
  ]}
/>

## Email Testing and Development

### Local Email Testing

For development and testing, you can use tools like MailHog or Ethereal Email to capture emails without actually sending them.

```bash
# Install MailHog for local email testing
npm install -g mailhog

# Start MailHog server
mailhog

# Configure for local testing
EMAIL_PROVIDER=smtp
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=""
SMTP_PASSWORD=""
```

### Email Queue Management

For production applications, implement email queuing to handle high volumes and retry failed sends:

```typescript
// services/email/queue.ts
import { EmailQueue } from '@mifty/email-queue';

const emailQueue = new EmailQueue({
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  },
  concurrency: 5,
  retryAttempts: 3
});

// Queue an email
await emailQueue.add('send-email', {
  to: 'user@example.com',
  subject: 'Welcome',
  template: 'welcome',
  data: { userName: 'John' }
});
```

## Best Practices

1. **Provider Redundancy**: Configure multiple email providers for failover
2. **Rate Limiting**: Respect provider rate limits to avoid suspension
3. **List Management**: Implement proper unsubscribe and bounce handling
4. **Authentication**: Set up SPF, DKIM, and DMARC records for better deliverability
5. **Monitoring**: Track delivery rates, bounces, and complaints
6. **Testing**: Always test email functionality in staging environments
7. **Compliance**: Follow CAN-SPAM, GDPR, and other email regulations

## Next Steps

After setting up email services, you might want to:

- [Configure authentication adapters](./authentication.md) for email-based login
- [Set up storage solutions](./storage-solutions.md) for email attachments
- [Implement AI services](./ai-services.md) for email content generation
- [Add payment processing](./payment-processing.md) for premium email features