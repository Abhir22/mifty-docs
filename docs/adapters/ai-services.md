---
sidebar_position: 5
title: AI & ML Services
description: Complete guide to integrating OpenAI and other AI services with Mifty for intelligent features
keywords: [ai, openai, gpt, machine learning, chatbot, content generation, image analysis]
---

import AdapterGuide from '@site/src/components/AdapterGuide';

# AI & Machine Learning Services

Mifty provides seamless integration with AI and machine learning services, enabling you to add intelligent features like content generation, chatbots, image analysis, and natural language processing to your applications.

## OpenAI Integration

<AdapterGuide
  name="OpenAI API Integration"
  command="npm run adapter install openai"
  description="Complete OpenAI integration supporting GPT models, DALL-E, Whisper, and embeddings for intelligent application features"
  category="ai"
  envVars={[
    {
      name: "OPENAI_API_KEY",
      description: "OpenAI API key from your OpenAI account",
      required: true,
      example: "sk-proj-1234567890abcdefghijklmnopqrstuvwxyz"
    },
    {
      name: "OPENAI_ORGANIZATION",
      description: "OpenAI organization ID (optional)",
      required: false,
      example: "org-1234567890abcdefghijklmnop"
    },
    {
      name: "OPENAI_DEFAULT_MODEL",
      description: "Default GPT model to use",
      required: false,
      example: "gpt-4",
      default: "gpt-3.5-turbo"
    },
    {
      name: "OPENAI_MAX_TOKENS",
      description: "Default maximum tokens for responses",
      required: false,
      example: "2000",
      default: "1000"
    }
  ]}
  configSteps={[
    {
      step: 1,
      title: "Create OpenAI Account",
      description: "Sign up for an OpenAI account and verify your phone number"
    },
    {
      step: 2,
      title: "Generate API Key",
      description: "Create an API key in your OpenAI dashboard",
      code: `1. Go to OpenAI Platform > API keys
2. Click 'Create new secret key'
3. Give it a descriptive name
4. Copy the key (starts with sk-)
5. Set usage limits if needed`,
      language: "text"
    },
    {
      step: 3,
      title: "Set up Billing",
      description: "Add payment method and set usage limits",
      note: "OpenAI requires a payment method for API access. Set reasonable usage limits to control costs."
    },
    {
      step: 4,
      title: "Configure Environment Variables",
      description: "Add OpenAI credentials to your .env file",
      code: `OPENAI_API_KEY=sk-proj-1234567890abcdefghijklmnopqrstuvwxyz
OPENAI_ORGANIZATION=org-1234567890abcdefghijklmnop
OPENAI_DEFAULT_MODEL=gpt-4
OPENAI_MAX_TOKENS=2000`,
      language: "bash"
    }
  ]}
  examples={[
    {
      title: "Text Generation and Chat",
      description: "Generate text content and implement chatbot functionality",
      code: `// services/ai/openai.ts
import { OpenAIService } from '@mifty/openai';

const openaiService = new OpenAIService({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORGANIZATION,
  defaultModel: process.env.OPENAI_DEFAULT_MODEL
});

// Generate text content
export const generateContent = async (prompt: string, options = {}) => {
  const response = await openaiService.createCompletion({
    model: options.model || 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful content writer.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: options.maxTokens || 1000,
    temperature: options.temperature || 0.7
  });
  
  return response.choices[0].message.content;
};

// Chatbot conversation
export const chatWithBot = async (messages: Array<{role: string, content: string}>) => {
  const response = await openaiService.createCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant for our application.'
      },
      ...messages
    ],
    max_tokens: 500,
    temperature: 0.8
  });
  
  return response.choices[0].message.content;
};`,
      language: "typescript"
    },
    {
      title: "Content Moderation",
      description: "Automatically moderate user-generated content",
      code: `// services/ai/moderation.ts
import { OpenAIService } from '@mifty/openai';

const openaiService = new OpenAIService();

export const moderateContent = async (text: string) => {
  const response = await openaiService.createModeration({
    input: text
  });
  
  const result = response.results[0];
  
  return {
    flagged: result.flagged,
    categories: result.categories,
    categoryScores: result.category_scores,
    safe: !result.flagged
  };
};

// Use in content submission
router.post('/submit-content', async (req, res) => {
  const { content } = req.body;
  
  const moderation = await moderateContent(content);
  
  if (!moderation.safe) {
    return res.status(400).json({
      error: 'Content violates community guidelines',
      categories: Object.keys(moderation.categories).filter(
        key => moderation.categories[key]
      )
    });
  }
  
  // Content is safe, proceed with submission
  // ... save content to database
});`,
      language: "typescript"
    },
    {
      title: "Image Generation with DALL-E",
      description: "Generate images from text descriptions",
      code: `// services/ai/image-generation.ts
import { OpenAIService } from '@mifty/openai';

const openaiService = new OpenAIService();

export const generateImage = async (prompt: string, options = {}) => {
  const response = await openaiService.createImage({
    prompt: prompt,
    n: options.count || 1,
    size: options.size || '1024x1024',
    quality: options.quality || 'standard',
    style: options.style || 'vivid'
  });
  
  return response.data.map(image => ({
    url: image.url,
    revisedPrompt: image.revised_prompt
  }));
};

// Generate product images
export const generateProductImage = async (productDescription: string) => {
  const prompt = \`Professional product photo of \${productDescription}, clean white background, high quality, commercial photography style\`;
  
  const images = await generateImage(prompt, {
    size: '1024x1024',
    quality: 'hd'
  });
  
  return images[0];
};

// Generate blog post illustrations
export const generateBlogIllustration = async (blogTitle: string, blogSummary: string) => {
  const prompt = \`Illustration for blog post titled "\${blogTitle}". \${blogSummary}. Modern, clean, professional style.\`;
  
  return await generateImage(prompt, {
    style: 'natural',
    quality: 'standard'
  });
};`,
      language: "typescript"
    },
    {
      title: "Text-to-Speech with Whisper",
      description: "Convert text to speech and transcribe audio",
      code: `// services/ai/speech.ts
import { OpenAIService } from '@mifty/openai';
import fs from 'fs';

const openaiService = new OpenAIService();

// Text to speech
export const textToSpeech = async (text: string, options = {}) => {
  const response = await openaiService.createSpeech({
    model: 'tts-1',
    voice: options.voice || 'alloy',
    input: text,
    response_format: options.format || 'mp3'
  });
  
  // Save audio file
  const audioBuffer = Buffer.from(await response.arrayBuffer());
  const filename = \`speech-\${Date.now()}.\${options.format || 'mp3'}\`;
  const filepath = \`./uploads/audio/\${filename}\`;
  
  fs.writeFileSync(filepath, audioBuffer);
  
  return {
    filename,
    filepath,
    url: \`/uploads/audio/\${filename}\`
  };
};

// Speech to text (transcription)
export const transcribeAudio = async (audioFile: Express.Multer.File) => {
  const response = await openaiService.createTranscription({
    file: fs.createReadStream(audioFile.path),
    model: 'whisper-1',
    language: 'en', // Optional: specify language
    response_format: 'json'
  });
  
  return {
    text: response.text,
    language: response.language,
    duration: response.duration
  };
};

// Generate podcast summaries
export const generatePodcastSummary = async (audioFile: Express.Multer.File) => {
  // First transcribe the audio
  const transcription = await transcribeAudio(audioFile);
  
  // Then generate summary
  const summary = await generateContent(
    \`Please provide a concise summary of this podcast transcript: \${transcription.text}\`,
    { maxTokens: 300 }
  );
  
  return {
    transcription: transcription.text,
    summary,
    duration: transcription.duration
  };
};`,
      language: "typescript"
    },
    {
      title: "Embeddings and Semantic Search",
      description: "Create embeddings for semantic search and similarity matching",
      code: `// services/ai/embeddings.ts
import { OpenAIService } from '@mifty/openai';

const openaiService = new OpenAIService();

// Generate embeddings
export const generateEmbedding = async (text: string) => {
  const response = await openaiService.createEmbedding({
    model: 'text-embedding-ada-002',
    input: text
  });
  
  return response.data[0].embedding;
};

// Semantic search implementation
export const semanticSearch = async (query: string, documents: Array<{id: string, content: string, embedding?: number[]}>) => {
  // Generate embedding for search query
  const queryEmbedding = await generateEmbedding(query);
  
  // Calculate similarity scores
  const results = documents.map(doc => {
    if (!doc.embedding) return { ...doc, similarity: 0 };
    
    const similarity = cosineSimilarity(queryEmbedding, doc.embedding);
    return { ...doc, similarity };
  });
  
  // Sort by similarity and return top results
  return results
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 10);
};

// Cosine similarity calculation
const cosineSimilarity = (a: number[], b: number[]): number => {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
};

// Index documents for search
export const indexDocuments = async (documents: Array<{id: string, content: string}>) => {
  const indexedDocs = [];
  
  for (const doc of documents) {
    const embedding = await generateEmbedding(doc.content);
    indexedDocs.push({
      ...doc,
      embedding
    });
    
    // Save to database
    await db.query(
      'INSERT INTO document_embeddings (document_id, embedding) VALUES (?, ?)',
      [doc.id, JSON.stringify(embedding)]
    );
  }
  
  return indexedDocs;
};`,
      language: "typescript"
    }
  ]}
  troubleshooting={[
    {
      problem: "Rate limit exceeded errors",
      solution: "Implement proper rate limiting and retry logic. Consider upgrading your OpenAI plan for higher limits."
    },
    {
      problem: "High API costs",
      solution: "Monitor usage, implement caching for repeated requests, and use appropriate models (GPT-3.5 is cheaper than GPT-4)."
    },
    {
      problem: "Content generation quality issues",
      solution: "Improve your prompts with more specific instructions, examples, and context. Experiment with temperature settings."
    },
    {
      problem: "Token limit exceeded",
      solution: "Break long texts into smaller chunks, implement text summarization, or use models with larger context windows."
    }
  ]}
/>

## AI-Powered Features Implementation

### Intelligent Content Generation

```typescript
// Smart blog post generator
const generateBlogPost = async (topic: string, keywords: string[], targetAudience: string) => {
  const prompt = `
    Write a comprehensive blog post about "${topic}" for ${targetAudience}.
    Include these keywords naturally: ${keywords.join(', ')}.
    Structure: Introduction, 3-4 main sections, conclusion.
    Tone: Professional but engaging.
    Length: ~800 words.
  `;
  
  const content = await generateContent(prompt, {
    model: 'gpt-4',
    maxTokens: 2000,
    temperature: 0.7
  });
  
  return content;
};

// Product description generator
const generateProductDescription = async (productData: any) => {
  const prompt = `
    Create a compelling product description for:
    Name: ${productData.name}
    Category: ${productData.category}
    Features: ${productData.features.join(', ')}
    Target audience: ${productData.targetAudience}
    
    Make it persuasive, highlight benefits, and include a call-to-action.
  `;
  
  return await generateContent(prompt, { maxTokens: 300 });
};
```

### Smart Customer Support

```typescript
// AI-powered support ticket classification
const classifyTicket = async (ticketContent: string) => {
  const prompt = `
    Classify this support ticket into one of these categories:
    - Technical Issue
    - Billing Question
    - Feature Request
    - Bug Report
    - General Inquiry
    
    Also determine the urgency level (Low, Medium, High, Critical).
    
    Ticket: "${ticketContent}"
    
    Respond in JSON format: {"category": "...", "urgency": "...", "summary": "..."}
  `;
  
  const response = await generateContent(prompt, {
    temperature: 0.3 // Lower temperature for more consistent classification
  });
  
  return JSON.parse(response);
};

// Generate suggested responses
const generateSupportResponse = async (ticketContent: string, category: string) => {
  const prompt = `
    Generate a helpful, professional response to this ${category} support ticket:
    "${ticketContent}"
    
    Be empathetic, provide actionable solutions, and maintain a friendly tone.
  `;
  
  return await generateContent(prompt, { maxTokens: 400 });
};
```

### Personalization Engine

```typescript
// Content personalization based on user behavior
const personalizeContent = async (userId: string, contentType: string) => {
  // Get user preferences and behavior
  const userProfile = await getUserProfile(userId);
  const userBehavior = await getUserBehavior(userId);
  
  const prompt = `
    Personalize ${contentType} content for a user with these characteristics:
    - Interests: ${userProfile.interests.join(', ')}
    - Previous interactions: ${userBehavior.topCategories.join(', ')}
    - Engagement level: ${userBehavior.engagementLevel}
    - Preferred content length: ${userProfile.preferredLength}
    
    Generate 3 personalized content suggestions with titles and brief descriptions.
  `;
  
  const suggestions = await generateContent(prompt, { maxTokens: 500 });
  return suggestions;
};
```

## Cost Optimization Strategies

### Caching and Efficiency

```typescript
// Implement intelligent caching
import Redis from 'redis';

const redis = Redis.createClient();

const cachedGeneration = async (prompt: string, options: any) => {
  // Create cache key from prompt and options
  const cacheKey = `ai:${Buffer.from(prompt + JSON.stringify(options)).toString('base64')}`;
  
  // Check cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Generate new content
  const result = await generateContent(prompt, options);
  
  // Cache for 24 hours
  await redis.setex(cacheKey, 86400, JSON.stringify(result));
  
  return result;
};

// Batch processing for efficiency
const batchProcess = async (items: string[], processor: Function) => {
  const batchSize = 5;
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => processor(item))
    );
    results.push(...batchResults);
    
    // Rate limiting delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
};
```

### Usage Monitoring

```typescript
// Track AI service usage and costs
const trackUsage = async (service: string, operation: string, tokens: number, cost: number) => {
  await db.query(`
    INSERT INTO ai_usage_logs (service, operation, tokens_used, cost, timestamp)
    VALUES (?, ?, ?, ?, NOW())
  `, [service, operation, tokens, cost]);
};

// Generate usage reports
const generateUsageReport = async (timeframe: string) => {
  const report = await db.query(`
    SELECT 
      service,
      operation,
      SUM(tokens_used) as total_tokens,
      SUM(cost) as total_cost,
      COUNT(*) as request_count
    FROM ai_usage_logs 
    WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
    GROUP BY service, operation
  `, [timeframe === 'week' ? 7 : 30]);
  
  return report;
};
```

## Security and Privacy

### Data Protection

```typescript
// Sanitize data before sending to AI services
const sanitizeForAI = (text: string) => {
  // Remove PII patterns
  return text
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]') // SSN
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD]') // Credit card
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]') // Email
    .replace(/\b\d{3}[\s-]?\d{3}[\s-]?\d{4}\b/g, '[PHONE]'); // Phone
};

// Audit AI interactions
const auditAIInteraction = async (userId: string, prompt: string, response: string) => {
  await db.query(`
    INSERT INTO ai_audit_log (user_id, prompt_hash, response_hash, timestamp)
    VALUES (?, ?, ?, NOW())
  `, [
    userId,
    crypto.createHash('sha256').update(prompt).digest('hex'),
    crypto.createHash('sha256').update(response).digest('hex')
  ]);
};
```

## Testing AI Features

### Unit Testing AI Functions

```typescript
// Mock OpenAI responses for testing
jest.mock('@mifty/openai');

describe('AI Content Generation', () => {
  beforeEach(() => {
    (OpenAIService as jest.Mocked<typeof OpenAIService>).mockClear();
  });
  
  test('should generate blog post content', async () => {
    const mockResponse = {
      choices: [{ message: { content: 'Generated blog post content...' } }]
    };
    
    OpenAIService.prototype.createCompletion = jest.fn().mockResolvedValue(mockResponse);
    
    const result = await generateBlogPost('AI in Healthcare', ['AI', 'healthcare'], 'doctors');
    
    expect(result).toContain('Generated blog post content');
    expect(OpenAIService.prototype.createCompletion).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-4',
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user' })
        ])
      })
    );
  });
});
```

## Performance Monitoring

### AI Service Health Checks

```typescript
// Monitor AI service performance
const healthCheck = async () => {
  try {
    const start = Date.now();
    await generateContent('Test prompt', { maxTokens: 10 });
    const responseTime = Date.now() - start;
    
    return {
      status: 'healthy',
      responseTime,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Set up monitoring alerts
setInterval(async () => {
  const health = await healthCheck();
  
  if (health.status === 'unhealthy' || health.responseTime > 10000) {
    // Send alert to monitoring system
    console.error('AI service health check failed:', health);
  }
}, 60000); // Check every minute
```

## Next Steps

After setting up AI services, you might want to:

- [Configure authentication adapters](./authentication.md) for user-specific AI features
- [Set up storage solutions](./storage-solutions.md) for generated content and media
- [Implement email services](./email-services.md) for AI-generated notifications
- [Add payment processing](./payment-processing.md) for premium AI features

## Best Practices

1. **Prompt Engineering**: Craft clear, specific prompts with examples and context
2. **Cost Management**: Monitor usage, implement caching, and use appropriate models
3. **Error Handling**: Implement robust error handling and fallback mechanisms
4. **Privacy**: Sanitize sensitive data before sending to AI services
5. **Testing**: Create comprehensive tests with mocked AI responses
6. **Monitoring**: Track performance, costs, and quality metrics
7. **User Experience**: Provide loading states and graceful degradation