---
sidebar_position: 4
title: Payment Processing
description: Complete guide to integrating Stripe payment processing with Mifty for subscriptions, one-time payments, and marketplace features
keywords: [payment, stripe, subscription, checkout, webhook, marketplace]
---

import AdapterGuide from '@site/src/components/AdapterGuide';

# Payment Processing

Mifty provides comprehensive payment processing capabilities through Stripe integration, supporting one-time payments, subscriptions, marketplace functionality, and advanced payment features with built-in security and compliance.

## Stripe Payment Integration

<AdapterGuide
  name="Stripe Payment Processing"
  command="npm run adapter install stripe"
  description="Complete Stripe integration with support for payments, subscriptions, webhooks, and marketplace features"
  category="payment"
  envVars={[
    {
      name: "STRIPE_PUBLISHABLE_KEY",
      description: "Stripe publishable key for client-side integration",
      required: true,
      example: "pk_test_51234567890abcdefghijklmnopqrstuvwxyz"
    },
    {
      name: "STRIPE_SECRET_KEY",
      description: "Stripe secret key for server-side operations",
      required: true,
      example: "sk_test_51234567890abcdefghijklmnopqrstuvwxyz"
    },
    {
      name: "STRIPE_WEBHOOK_SECRET",
      description: "Webhook endpoint secret for verifying Stripe events",
      required: true,
      example: "whsec_1234567890abcdefghijklmnopqrstuvwxyz"
    },
    {
      name: "STRIPE_SUCCESS_URL",
      description: "URL to redirect after successful payment",
      required: true,
      example: "https://yourapp.com/payment/success"
    },
    {
      name: "STRIPE_CANCEL_URL",
      description: "URL to redirect after cancelled payment",
      required: true,
      example: "https://yourapp.com/payment/cancel"
    }
  ]}
  configSteps={[
    {
      step: 1,
      title: "Create Stripe Account",
      description: "Sign up for a Stripe account and complete account verification"
    },
    {
      step: 2,
      title: "Get API Keys",
      description: "Retrieve your API keys from the Stripe Dashboard",
      code: `1. Go to Stripe Dashboard > Developers > API keys
2. Copy Publishable key (starts with pk_)
3. Copy Secret key (starts with sk_)
4. Use test keys for development, live keys for production`,
      language: "text"
    },
    {
      step: 3,
      title: "Set up Webhook Endpoint",
      description: "Configure webhook endpoint for handling Stripe events",
      code: `1. Go to Stripe Dashboard > Developers > Webhooks
2. Click 'Add endpoint'
3. Set URL: https://yourapp.com/api/stripe/webhook
4. Select events to listen for
5. Copy the webhook signing secret`,
      language: "text"
    },
    {
      step: 4,
      title: "Configure Environment Variables",
      description: "Add Stripe credentials to your .env file",
      code: `STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdefghijklmnopqrstuvwxyz
STRIPE_SECRET_KEY=sk_test_51234567890abcdefghijklmnopqrstuvwxyz
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdefghijklmnopqrstuvwxyz
STRIPE_SUCCESS_URL=https://yourapp.com/payment/success
STRIPE_CANCEL_URL=https://yourapp.com/payment/cancel`,
      language: "bash"
    }
  ]}
  examples={[
    {
      title: "One-Time Payment Checkout",
      description: "Create a checkout session for one-time payments",
      code: `// routes/payment/checkout.ts
import { StripeService } from '@mifty/stripe';

const stripeService = new StripeService();

// Create checkout session
router.post('/create-checkout', async (req, res) => {
  try {
    const { items, customerId } = req.body;
    
    const session = await stripeService.createCheckoutSession({
      customer: customerId,
      line_items: items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: item.description,
            images: [item.image]
          },
          unit_amount: item.price * 100 // Convert to cents
        },
        quantity: item.quantity
      })),
      mode: 'payment',
      success_url: process.env.STRIPE_SUCCESS_URL + '?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: process.env.STRIPE_CANCEL_URL,
      metadata: {
        orderId: req.body.orderId,
        userId: req.user.id
      }
    });
    
    res.json({ sessionId: session.id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});`,
      language: "typescript"
    },
    {
      title: "Subscription Management",
      description: "Handle subscription creation and management",
      code: `// services/payment/subscription.ts
import { StripeService } from '@mifty/stripe';

const stripeService = new StripeService();

// Create subscription
export const createSubscription = async (customerId: string, priceId: string) => {
  const subscription = await stripeService.createSubscription({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent']
  });
  
  return {
    subscriptionId: subscription.id,
    clientSecret: subscription.latest_invoice.payment_intent.client_secret
  };
};

// Update subscription
export const updateSubscription = async (subscriptionId: string, newPriceId: string) => {
  const subscription = await stripeService.retrieveSubscription(subscriptionId);
  
  return await stripeService.updateSubscription(subscriptionId, {
    items: [{
      id: subscription.items.data[0].id,
      price: newPriceId
    }],
    proration_behavior: 'create_prorations'
  });
};

// Cancel subscription
export const cancelSubscription = async (subscriptionId: string, immediately = false) => {
  if (immediately) {
    return await stripeService.cancelSubscription(subscriptionId);
  } else {
    return await stripeService.updateSubscription(subscriptionId, {
      cancel_at_period_end: true
    });
  }
};`,
      language: "typescript"
    },
    {
      title: "Webhook Event Handling",
      description: "Process Stripe webhook events securely",
      code: `// routes/payment/webhook.ts
import { StripeService } from '@mifty/stripe';
import { Database } from '../../database';

const stripeService = new StripeService();
const db = new Database();

router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripeService.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
        
      default:
        console.log(\`Unhandled event type: \${event.type}\`);
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(\`Webhook Error: \${error.message}\`);
  }
});

const handlePaymentSuccess = async (paymentIntent) => {
  // Update order status in database
  await db.query(
    'UPDATE orders SET status = ?, stripe_payment_id = ? WHERE id = ?',
    ['paid', paymentIntent.id, paymentIntent.metadata.orderId]
  );
  
  // Send confirmation email
  // Update user account
  // Trigger fulfillment process
};`,
      language: "typescript"
    },
    {
      title: "Customer Management",
      description: "Manage Stripe customers and payment methods",
      code: `// services/payment/customer.ts
import { StripeService } from '@mifty/stripe';

const stripeService = new StripeService();

// Create customer
export const createCustomer = async (userData: any) => {
  const customer = await stripeService.createCustomer({
    email: userData.email,
    name: userData.name,
    phone: userData.phone,
    address: userData.address,
    metadata: {
      userId: userData.id,
      source: 'web_app'
    }
  });
  
  // Save customer ID to user record
  await db.query(
    'UPDATE users SET stripe_customer_id = ? WHERE id = ?',
    [customer.id, userData.id]
  );
  
  return customer;
};

// Add payment method
export const addPaymentMethod = async (customerId: string, paymentMethodId: string) => {
  await stripeService.attachPaymentMethod(paymentMethodId, customerId);
  
  // Set as default payment method
  await stripeService.updateCustomer(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId
    }
  });
};

// List customer payment methods
export const getCustomerPaymentMethods = async (customerId: string) => {
  return await stripeService.listPaymentMethods({
    customer: customerId,
    type: 'card'
  });
};`,
      language: "typescript"
    }
  ]}
  troubleshooting={[
    {
      problem: "Webhook signature verification failed",
      solution: "Ensure you're using the correct webhook secret and the raw request body for signature verification"
    },
    {
      problem: "Payment declined errors",
      solution: "Implement proper error handling for different decline codes and provide clear user feedback"
    },
    {
      problem: "Subscription proration issues",
      solution: "Configure proration behavior correctly when updating subscriptions and handle edge cases"
    },
    {
      problem: "Test mode vs live mode confusion",
      solution: "Use separate API keys for test and live environments, and clearly indicate which mode you're in"
    }
  ]}
/>

## Advanced Payment Features

### Marketplace Payments

```typescript
// Handle marketplace payments with Stripe Connect
const createMarketplacePayment = async (orderData) => {
  const paymentIntent = await stripeService.createPaymentIntent({
    amount: orderData.totalAmount,
    currency: 'usd',
    application_fee_amount: orderData.platformFee,
    transfer_data: {
      destination: orderData.sellerStripeAccountId
    },
    metadata: {
      orderId: orderData.id,
      sellerId: orderData.sellerId
    }
  });
  
  return paymentIntent;
};
```

### Recurring Billing with Usage-Based Pricing

```typescript
// Set up metered billing
const createUsageBasedSubscription = async (customerId, basePriceId, meteredPriceId) => {
  const subscription = await stripeService.createSubscription({
    customer: customerId,
    items: [
      { price: basePriceId }, // Base monthly fee
      { price: meteredPriceId } // Usage-based pricing
    ]
  });
  
  return subscription;
};

// Report usage
const reportUsage = async (subscriptionItemId, quantity) => {
  await stripeService.createUsageRecord(subscriptionItemId, {
    quantity: quantity,
    timestamp: Math.floor(Date.now() / 1000)
  });
};
```

### Payment Security Best Practices

```typescript
// Implement payment security measures
const securePaymentFlow = {
  // 1. Validate payment amounts server-side
  validatePayment: (clientAmount, serverAmount) => {
    if (clientAmount !== serverAmount) {
      throw new Error('Payment amount mismatch');
    }
  },
  
  // 2. Implement rate limiting
  rateLimiter: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 payment attempts per windowMs
    message: 'Too many payment attempts, please try again later'
  }),
  
  // 3. Log all payment activities
  logPaymentActivity: (userId, action, details) => {
    console.log({
      timestamp: new Date().toISOString(),
      userId,
      action,
      details,
      ip: req.ip
    });
  }
};
```

## Testing Payments

### Test Card Numbers

Use Stripe's test card numbers for development:

```bash
# Successful payments
4242424242424242  # Visa
4000056655665556  # Visa (debit)
5555555555554444  # Mastercard

# Declined payments
4000000000000002  # Generic decline
4000000000009995  # Insufficient funds
4000000000009987  # Lost card

# 3D Secure authentication
4000002760003184  # Requires authentication
4000002500003155  # Authentication fails
```

### Webhook Testing

```bash
# Install Stripe CLI for local webhook testing
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
```

## Compliance and Security

### PCI Compliance

- Never store card details on your servers
- Use Stripe Elements for secure card input
- Implement proper HTTPS everywhere
- Regular security audits and updates

### GDPR Compliance

```typescript
// Handle data deletion requests
const deleteCustomerData = async (customerId) => {
  // Delete customer from Stripe
  await stripeService.deleteCustomer(customerId);
  
  // Remove from your database
  await db.query('DELETE FROM customers WHERE stripe_id = ?', [customerId]);
};
```

## Monitoring and Analytics

### Payment Analytics

```typescript
// Track payment metrics
const paymentAnalytics = {
  successRate: async (timeframe) => {
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'succeeded' THEN 1 ELSE 0 END) as successful
      FROM payments 
      WHERE created_at >= ?
    `, [timeframe]);
    
    return (stats.successful / stats.total) * 100;
  },
  
  averageOrderValue: async (timeframe) => {
    const result = await db.query(`
      SELECT AVG(amount) as aov 
      FROM payments 
      WHERE status = 'succeeded' AND created_at >= ?
    `, [timeframe]);
    
    return result.aov;
  }
};
```

## Next Steps

After setting up payment processing, you might want to:

- [Configure email services](./email-services.md) for payment confirmations
- [Set up authentication adapters](./authentication.md) for secure customer accounts
- [Implement storage solutions](./storage-solutions.md) for invoice and receipt storage
- [Add AI services](./ai-services.md) for fraud detection and analytics