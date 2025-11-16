---
sidebar_position: 1
title: Authentication Adapters
description: Complete guide to integrating OAuth providers and OTP authentication with Mifty
keywords: [authentication, oauth, github, google, linkedin, facebook, otp, email, mobile]
---

import AdapterGuide from '@site/src/components/AdapterGuide';

# Authentication Adapters

Mifty provides comprehensive authentication adapters for popular OAuth providers and OTP-based authentication methods. These adapters handle the complete authentication flow, token management, and user profile integration.

## OAuth Authentication Adapters

### GitHub OAuth

<AdapterGuide
  name="GitHub OAuth"
  command="npm run auth:install auth-github"
  description="Integrate GitHub OAuth authentication with automatic user profile synchronization"
  category="auth"
  envVars={[
    {
      name: "GITHUB_CLIENT_ID",
      description: "GitHub OAuth application client ID from GitHub Developer Settings",
      required: true,
      example: "Iv1.a629723000000000"
    },
    {
      name: "GITHUB_CLIENT_SECRET",
      description: "GitHub OAuth application client secret from GitHub Developer Settings",
      required: true,
      example: "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    },
    {
      name: "GITHUB_CALLBACK_URL",
      description: "OAuth callback URL configured in your GitHub application",
      required: true,
      example: "http://localhost:3000/auth/github/callback"
    }
  ]}
  configSteps={[
    {
      step: 1,
      title: "Create GitHub OAuth Application",
      description: "Go to GitHub Settings > Developer settings > OAuth Apps and create a new OAuth application",
      note: "Set the Authorization callback URL to match your GITHUB_CALLBACK_URL environment variable"
    },
    {
      step: 2,
      title: "Configure Environment Variables",
      description: "Add the GitHub OAuth credentials to your .env file",
      code: `GITHUB_CLIENT_ID=Iv1.a629723000000000
GITHUB_CLIENT_SECRET=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback`,
      language: "bash"
    },
    {
      step: 3,
      title: "Test Authentication Flow",
      description: "Start your development server and navigate to /auth/github to test the OAuth flow",
      code: "npm run dev",
      language: "bash"
    }
  ]}
  examples={[
    {
      title: "Basic GitHub Authentication Route",
      description: "Example of how to use GitHub authentication in your routes",
      code: `// routes/auth.ts
import { Router } from 'express';
import { githubAuth } from '../services/auth/github';

const router = Router();

// Initiate GitHub OAuth
router.get('/github', githubAuth.authenticate);

// Handle OAuth callback
router.get('/github/callback', githubAuth.callback);

// Get authenticated user profile
router.get('/profile', githubAuth.requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;`,
      language: "typescript"
    },
    {
      title: "Custom User Model Integration",
      description: "Install with custom user model and table configuration",
      code: "npm run auth:install auth-github --model User --table users",
      language: "bash"
    }
  ]}
  troubleshooting={[
    {
      problem: "OAuth callback URL mismatch error",
      solution: "Ensure the GITHUB_CALLBACK_URL in your .env matches exactly with the callback URL configured in your GitHub OAuth application settings"
    },
    {
      problem: "Invalid client credentials error",
      solution: "Verify that GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are correctly copied from your GitHub OAuth application"
    },
    {
      problem: "User profile not saving to database",
      solution: "Check that your User model has the required fields: githubId, email, name, and avatar_url"
    }
  ]}
/>

### Google OAuth

<AdapterGuide
  name="Google OAuth"
  command="npm run auth:install auth-google"
  description="Integrate Google OAuth authentication with Google profile and email access"
  category="auth"
  envVars={[
    {
      name: "GOOGLE_CLIENT_ID",
      description: "Google OAuth client ID from Google Cloud Console",
      required: true,
      example: "123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com"
    },
    {
      name: "GOOGLE_CLIENT_SECRET",
      description: "Google OAuth client secret from Google Cloud Console",
      required: true,
      example: "GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx"
    },
    {
      name: "GOOGLE_CALLBACK_URL",
      description: "OAuth callback URL configured in Google Cloud Console",
      required: true,
      example: "http://localhost:3000/auth/google/callback"
    }
  ]}
  configSteps={[
    {
      step: 1,
      title: "Create Google Cloud Project",
      description: "Go to Google Cloud Console, create a new project or select an existing one",
      note: "Enable the Google+ API for your project"
    },
    {
      step: 2,
      title: "Configure OAuth Consent Screen",
      description: "Set up the OAuth consent screen with your application details and authorized domains"
    },
    {
      step: 3,
      title: "Create OAuth Credentials",
      description: "Create OAuth 2.0 client credentials and add authorized redirect URIs",
      code: `Authorized redirect URIs:
http://localhost:3000/auth/google/callback
https://yourdomain.com/auth/google/callback`,
      language: "text"
    },
    {
      step: 4,
      title: "Configure Environment Variables",
      description: "Add the Google OAuth credentials to your .env file",
      code: `GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback`,
      language: "bash"
    }
  ]}
  examples={[
    {
      title: "Google Authentication with Scopes",
      description: "Configure Google OAuth with specific scopes for profile and email access",
      code: `// services/auth/google.ts
import { GoogleOAuthService } from '@mifty/auth-google';

const googleAuth = new GoogleOAuthService({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  scopes: ['profile', 'email']
});

export default googleAuth;`,
      language: "typescript"
    },
    {
      title: "Access Google User Profile",
      description: "Example of accessing Google user profile data after authentication",
      code: `// After successful authentication
const userProfile = {
  googleId: profile.id,
  email: profile.emails[0].value,
  name: profile.displayName,
  firstName: profile.name.givenName,
  lastName: profile.name.familyName,
  avatar: profile.photos[0].value
};`,
      language: "typescript"
    }
  ]}
  troubleshooting={[
    {
      problem: "Error 400: redirect_uri_mismatch",
      solution: "Add your callback URL to the authorized redirect URIs in Google Cloud Console OAuth credentials"
    },
    {
      problem: "Access blocked: This app's request is invalid",
      solution: "Complete the OAuth consent screen configuration and verify your authorized domains"
    },
    {
      problem: "Token refresh issues",
      solution: "Ensure you're storing and using refresh tokens properly for long-term access"
    }
  ]}
/>

### LinkedIn OAuth

<AdapterGuide
  name="LinkedIn OAuth"
  command="npm run auth:install auth-linkedin"
  description="Integrate LinkedIn OAuth authentication for professional networking features"
  category="auth"
  envVars={[
    {
      name: "LINKEDIN_CLIENT_ID",
      description: "LinkedIn OAuth application client ID from LinkedIn Developer Portal",
      required: true,
      example: "78xxxxxxxxxxxxxxxx"
    },
    {
      name: "LINKEDIN_CLIENT_SECRET",
      description: "LinkedIn OAuth application client secret from LinkedIn Developer Portal",
      required: true,
      example: "xxxxxxxxxxxxxxxx"
    },
    {
      name: "LINKEDIN_CALLBACK_URL",
      description: "OAuth callback URL configured in LinkedIn application settings",
      required: true,
      example: "http://localhost:3000/auth/linkedin/callback"
    }
  ]}
  configSteps={[
    {
      step: 1,
      title: "Create LinkedIn Application",
      description: "Go to LinkedIn Developer Portal and create a new application",
      note: "You'll need a LinkedIn Company Page to create an application"
    },
    {
      step: 2,
      title: "Configure OAuth Settings",
      description: "Add authorized redirect URLs and request necessary permissions",
      code: `Required permissions:
- r_liteprofile (basic profile info)
- r_emailaddress (email access)

Authorized Redirect URLs:
http://localhost:3000/auth/linkedin/callback`,
      language: "text"
    },
    {
      step: 3,
      title: "Configure Environment Variables",
      description: "Add LinkedIn OAuth credentials to your .env file",
      code: `LINKEDIN_CLIENT_ID=78xxxxxxxxxxxxxxxx
LINKEDIN_CLIENT_SECRET=xxxxxxxxxxxxxxxx
LINKEDIN_CALLBACK_URL=http://localhost:3000/auth/linkedin/callback`,
      language: "bash"
    }
  ]}
  examples={[
    {
      title: "LinkedIn Profile Integration",
      description: "Access LinkedIn profile data including professional information",
      code: `// services/auth/linkedin.ts
const linkedinProfile = {
  linkedinId: profile.id,
  email: profile.emailAddress,
  firstName: profile.localizedFirstName,
  lastName: profile.localizedLastName,
  headline: profile.headline,
  industry: profile.industry,
  location: profile.location?.name,
  profilePicture: profile.profilePicture?.displayImage
};`,
      language: "typescript"
    }
  ]}
  troubleshooting={[
    {
      problem: "Invalid redirect URI error",
      solution: "Ensure your callback URL exactly matches the authorized redirect URLs in your LinkedIn application settings"
    },
    {
      problem: "Insufficient permissions error",
      solution: "Request the necessary permissions (r_liteprofile, r_emailaddress) in your LinkedIn application settings"
    }
  ]}
/>

### Facebook OAuth

<AdapterGuide
  name="Facebook OAuth"
  command="npm run auth:install auth-facebook"
  description="Integrate Facebook OAuth authentication with Facebook profile access"
  category="auth"
  envVars={[
    {
      name: "FACEBOOK_APP_ID",
      description: "Facebook application ID from Facebook Developers Console",
      required: true,
      example: "1234567890123456"
    },
    {
      name: "FACEBOOK_APP_SECRET",
      description: "Facebook application secret from Facebook Developers Console",
      required: true,
      example: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    },
    {
      name: "FACEBOOK_CALLBACK_URL",
      description: "OAuth callback URL configured in Facebook application settings",
      required: true,
      example: "http://localhost:3000/auth/facebook/callback"
    }
  ]}
  configSteps={[
    {
      step: 1,
      title: "Create Facebook Application",
      description: "Go to Facebook Developers Console and create a new application",
      note: "Choose 'Consumer' as the application type for authentication features"
    },
    {
      step: 2,
      title: "Configure Facebook Login Product",
      description: "Add Facebook Login product to your application and configure settings",
      code: `Valid OAuth Redirect URIs:
http://localhost:3000/auth/facebook/callback
https://yourdomain.com/auth/facebook/callback`,
      language: "text"
    },
    {
      step: 3,
      title: "Configure Environment Variables",
      description: "Add Facebook OAuth credentials to your .env file",
      code: `FACEBOOK_APP_ID=1234567890123456
FACEBOOK_APP_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FACEBOOK_CALLBACK_URL=http://localhost:3000/auth/facebook/callback`,
      language: "bash"
    }
  ]}
  examples={[
    {
      title: "Facebook Profile with Permissions",
      description: "Request specific permissions for accessing Facebook user data",
      code: `// services/auth/facebook.ts
const facebookAuth = new FacebookOAuthService({
  appId: process.env.FACEBOOK_APP_ID,
  appSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL,
  permissions: ['email', 'public_profile']
});`,
      language: "typescript"
    }
  ]}
  troubleshooting={[
    {
      problem: "URL blocked error",
      solution: "Add your callback URL to the Valid OAuth Redirect URIs in Facebook Login settings"
    },
    {
      problem: "App not approved for public use",
      solution: "Submit your app for review if you need permissions beyond basic profile and email"
    }
  ]}
/>

## OTP Authentication Adapters

### Email OTP Authentication

<AdapterGuide
  name="Email OTP Authentication"
  command="npm run auth:install auth-email-otp"
  description="Implement secure email-based OTP authentication with customizable templates"
  category="auth"
  envVars={[
    {
      name: "OTP_EMAIL_PROVIDER",
      description: "Email service provider for sending OTP codes",
      required: true,
      example: "gmail",
      default: "smtp"
    },
    {
      name: "OTP_CODE_LENGTH",
      description: "Length of the generated OTP code",
      required: false,
      example: "6",
      default: "6"
    },
    {
      name: "OTP_EXPIRY_MINUTES",
      description: "OTP code expiration time in minutes",
      required: false,
      example: "10",
      default: "5"
    },
    {
      name: "OTP_MAX_ATTEMPTS",
      description: "Maximum number of OTP verification attempts",
      required: false,
      example: "3",
      default: "3"
    }
  ]}
  configSteps={[
    {
      step: 1,
      title: "Install Email Service Adapter",
      description: "First install an email service adapter for sending OTP codes",
      code: "npm run adapter install email-service",
      language: "bash"
    },
    {
      step: 2,
      title: "Configure Email Provider",
      description: "Set up your email provider credentials (Gmail, SMTP, etc.)",
      code: `# For Gmail
EMAIL_PROVIDER=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_app_password`,
      language: "bash"
    },
    {
      step: 3,
      title: "Configure OTP Settings",
      description: "Add OTP-specific configuration to your .env file",
      code: `OTP_EMAIL_PROVIDER=gmail
OTP_CODE_LENGTH=6
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=3`,
      language: "bash"
    }
  ]}
  examples={[
    {
      title: "Send OTP Code",
      description: "Example of sending an OTP code to a user's email",
      code: `// routes/auth/otp.ts
import { EmailOTPService } from '@mifty/auth-email-otp';

const otpService = new EmailOTPService();

// Send OTP code
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  
  try {
    const result = await otpService.sendOTP(email);
    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      expiresIn: result.expiresIn 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});`,
      language: "typescript"
    },
    {
      title: "Verify OTP Code",
      description: "Example of verifying an OTP code and authenticating the user",
      code: `// Verify OTP code
router.post('/verify-otp', async (req, res) => {
  const { email, code } = req.body;
  
  try {
    const result = await otpService.verifyOTP(email, code);
    
    if (result.valid) {
      // Generate JWT token or create session
      const token = generateAuthToken(result.user);
      res.json({ 
        success: true, 
        token,
        user: result.user 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP code' 
      });
    }
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});`,
      language: "typescript"
    },
    {
      title: "Custom OTP Email Template",
      description: "Customize the OTP email template with your branding",
      code: `// services/auth/otp-templates.ts
const customOTPTemplate = {
  subject: 'Your Login Code - {{appName}}',
  html: \`
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Your Login Code</h2>
      <p>Use this code to complete your login:</p>
      <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
        {{otpCode}}
      </div>
      <p>This code will expire in {{expiryMinutes}} minutes.</p>
      <p>If you didn't request this code, please ignore this email.</p>
    </div>
  \`
};

// Use custom template
const otpService = new EmailOTPService({
  template: customOTPTemplate
});`,
      language: "typescript"
    }
  ]}
  troubleshooting={[
    {
      problem: "OTP emails not being sent",
      solution: "Verify that your email service adapter is properly configured and test email sending separately"
    },
    {
      problem: "OTP codes expiring too quickly",
      solution: "Increase the OTP_EXPIRY_MINUTES value in your environment variables"
    },
    {
      problem: "Users locked out after failed attempts",
      solution: "Implement a cooldown period or increase OTP_MAX_ATTEMPTS, and provide clear error messages"
    }
  ]}
/>

### Mobile OTP Authentication

<AdapterGuide
  name="Mobile OTP Authentication"
  command="npm run auth:install auth-mobile-otp"
  description="Implement SMS-based OTP authentication using Twilio or other SMS providers"
  category="auth"
  envVars={[
    {
      name: "SMS_PROVIDER",
      description: "SMS service provider for sending OTP codes",
      required: true,
      example: "twilio"
    },
    {
      name: "TWILIO_ACCOUNT_SID",
      description: "Twilio Account SID from Twilio Console",
      required: true,
      example: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    },
    {
      name: "TWILIO_AUTH_TOKEN",
      description: "Twilio Auth Token from Twilio Console",
      required: true,
      example: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    },
    {
      name: "TWILIO_PHONE_NUMBER",
      description: "Twilio phone number for sending SMS",
      required: true,
      example: "+1234567890"
    },
    {
      name: "OTP_SMS_LENGTH",
      description: "Length of the SMS OTP code",
      required: false,
      example: "4",
      default: "4"
    }
  ]}
  configSteps={[
    {
      step: 1,
      title: "Set up Twilio Account",
      description: "Create a Twilio account and get your Account SID and Auth Token",
      note: "You'll also need to purchase a phone number for sending SMS messages"
    },
    {
      step: 2,
      title: "Install SMS Adapter",
      description: "Install the Twilio SMS adapter if not already installed",
      code: "npm run adapter install twilio",
      language: "bash"
    },
    {
      step: 3,
      title: "Configure SMS Settings",
      description: "Add Twilio credentials and SMS OTP settings to your .env file",
      code: `SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
OTP_SMS_LENGTH=4`,
      language: "bash"
    }
  ]}
  examples={[
    {
      title: "Send SMS OTP",
      description: "Example of sending an OTP code via SMS",
      code: `// routes/auth/sms-otp.ts
import { MobileOTPService } from '@mifty/auth-mobile-otp';

const smsOTPService = new MobileOTPService();

router.post('/send-sms-otp', async (req, res) => {
  const { phoneNumber } = req.body;
  
  try {
    const result = await smsOTPService.sendOTP(phoneNumber);
    res.json({ 
      success: true, 
      message: 'OTP sent to your phone',
      expiresIn: result.expiresIn 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});`,
      language: "typescript"
    },
    {
      title: "Phone Number Validation",
      description: "Validate and format phone numbers before sending OTP",
      code: `import { parsePhoneNumber } from 'libphonenumber-js';

const validatePhoneNumber = (phoneNumber: string) => {
  try {
    const parsed = parsePhoneNumber(phoneNumber);
    return {
      valid: parsed.isValid(),
      formatted: parsed.format('E.164'),
      country: parsed.country
    };
  } catch (error) {
    return { valid: false };
  }
};

// Use in your route
const phoneValidation = validatePhoneNumber(req.body.phoneNumber);
if (!phoneValidation.valid) {
  return res.status(400).json({ 
    success: false, 
    message: 'Invalid phone number format' 
  });
}`,
      language: "typescript"
    }
  ]}
  troubleshooting={[
    {
      problem: "SMS messages not being delivered",
      solution: "Check your Twilio account balance and verify the phone number format is correct (E.164 format)"
    },
    {
      problem: "Invalid phone number errors",
      solution: "Implement phone number validation using libphonenumber-js before sending OTP"
    },
    {
      problem: "High SMS costs",
      solution: "Implement rate limiting and consider using shorter OTP codes or longer expiry times to reduce resend requests"
    }
  ]}
/>

## General Authentication Commands

Here are the general commands for managing authentication adapters:

```bash
# List all available authentication adapters
npm run auth:list

# Install any authentication adapter
npm run auth:install <adapter-name>

# Install with custom model and table configuration
npm run auth:install <adapter-name> --model CustomUser --table custom_users

# List installed authentication adapters
npm run adapter installed

# Uninstall an authentication adapter
npm run adapter uninstall <adapter-name>
```

## Next Steps

After setting up authentication adapters, you might want to:

- [Configure email services](./email-services.md) for sending authentication emails
- [Set up storage solutions](./storage-solutions.md) for user profile images
- [Implement payment processing](./payment-processing.md) for premium features
- [Add AI services](./ai-services.md) for enhanced user experiences

## Security Best Practices

1. **Environment Variables**: Always store sensitive credentials in environment variables, never in code
2. **HTTPS**: Use HTTPS in production for all OAuth callbacks
3. **Token Storage**: Implement secure token storage and refresh mechanisms
4. **Rate Limiting**: Implement rate limiting for OTP requests to prevent abuse
5. **Validation**: Always validate and sanitize user input, especially phone numbers and email addresses
6. **Monitoring**: Monitor authentication attempts and implement alerting for suspicious activity