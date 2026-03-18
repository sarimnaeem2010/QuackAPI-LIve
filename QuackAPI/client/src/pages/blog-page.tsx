import { useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { Calendar, Clock, ArrowLeft, ChevronRight, BookOpen, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/seo";
import Navbar from "@/components/navbar";

interface FaqItem {
  question: string;
  answer: string;
}

interface ArticleTable {
  headers: string[];
  rows: string[][];
}

interface ArticleSection {
  heading: string;
  headingLevel: "h2" | "h3";
  content: string[];
  code?: { language: string; snippet: string };
  faq?: FaqItem[];
  table?: ArticleTable;
}

interface Article {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  readTime: string;
  sections: ArticleSection[];
}

const articles: Article[] = [
  {
    slug: "send-whatsapp-messages-python",
    title: "How to Send WhatsApp Messages with Python",
    description: "Learn how to integrate WhatsApp messaging into your Python applications using the QuackAPI REST API. Covers text, image, and document messages with complete code examples.",
    category: "Tutorial",
    date: "2026-02-15",
    readTime: "5 min read",
    sections: [
      {
        heading: "Prerequisites & Installation",
        headingLevel: "h2",
        content: [
          "Before you start sending WhatsApp messages with Python, you need to install the requests library and set up your QuackAPI account. The requests library makes HTTP calls simple and intuitive.",
          "Make sure you have Python 3.7 or higher installed on your system. You can verify your Python version by running python --version in your terminal.",
        ],
        code: {
          language: "bash",
          snippet: `pip install requests`,
        },
      },
      {
        heading: "Getting Your API Key",
        headingLevel: "h2",
        content: [
          "After creating your QuackAPI account, navigate to your Profile Settings page. Your unique API key starts with wa_ and is used to authenticate all API requests.",
          "Store your API key securely as an environment variable. Never hardcode API keys directly in your source code or commit them to version control.",
        ],
        code: {
          language: "python",
          snippet: `import os

API_KEY = os.environ.get("WAPISTACK_API_KEY")
BASE_URL = "https://your-domain.com/api/messages/send"`,
        },
      },
      {
        heading: "Sending Text Messages",
        headingLevel: "h2",
        content: [
          "The simplest message type is a plain text message. You need to specify the device ID, recipient phone number in international format, the message content, and the message type.",
        ],
        code: {
          language: "python",
          snippet: `import requests

headers = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY
}

payload = {
    "deviceId": 1,
    "to": "923001234567",
    "content": "Hello from Python!",
    "type": "text"
}

response = requests.post(BASE_URL, json=payload, headers=headers)
print(response.json())`,
        },
      },
      {
        heading: "Sending Images and Documents",
        headingLevel: "h2",
        content: [
          "QuackAPI supports sending images with optional captions, as well as PDF and other document files. For images, set the type to image and provide the image URL in the content field. For documents, use the pdf type and include a filename.",
        ],
        code: {
          language: "python",
          snippet: `# Send an image with caption
image_payload = {
    "deviceId": 1,
    "to": "923001234567",
    "content": "https://example.com/photo.jpg",
    "type": "image",
    "caption": "Check out this photo!"
}
requests.post(BASE_URL, json=image_payload, headers=headers)

# Send a PDF document
doc_payload = {
    "deviceId": 1,
    "to": "923001234567",
    "content": "https://example.com/invoice.pdf",
    "type": "pdf",
    "filename": "invoice.pdf"
}
requests.post(BASE_URL, json=doc_payload, headers=headers)`,
        },
      },
      {
        heading: "Error Handling",
        headingLevel: "h2",
        content: [
          "Production applications should always include proper error handling. Check the HTTP status code and parse the error response to handle common issues like invalid API keys, offline devices, or rate limiting.",
        ],
        code: {
          language: "python",
          snippet: `try:
    response = requests.post(BASE_URL, json=payload, headers=headers)
    response.raise_for_status()
    result = response.json()
    print(f"Message sent! ID: {result['id']}")
except requests.exceptions.HTTPError as e:
    error_data = e.response.json()
    print(f"API Error: {error_data.get('message', 'Unknown error')}")
except requests.exceptions.ConnectionError:
    print("Failed to connect to the API server")`,
        },
      },
      {
        heading: "Complete Working Example",
        headingLevel: "h2",
        content: [
          "Here is a complete, production-ready Python script that wraps the QuackAPI API in a reusable class. You can import this module into any Python project to start sending WhatsApp messages immediately.",
          "If you are evaluating providers before setting up, see [how QuackAPI compares to Twilio for WhatsApp](/compare/twilio) — especially on pricing and whether Meta Business approval is required.",
        ],
        code: {
          language: "python",
          snippet: `import os
import requests

class QuackAPIClient:
    def __init__(self, api_key=None):
        self.api_key = api_key or os.environ.get("WAPISTACK_API_KEY")
        self.base_url = "https://your-domain.com/api/messages/send"
        self.headers = {
            "Content-Type": "application/json",
            "x-api-key": self.api_key
        }

    def send_text(self, device_id, to, message):
        payload = {"deviceId": device_id, "to": to, "content": message, "type": "text"}
        return self._send(payload)

    def send_image(self, device_id, to, image_url, caption=""):
        payload = {"deviceId": device_id, "to": to, "content": image_url, "type": "image", "caption": caption}
        return self._send(payload)

    def _send(self, payload):
        response = requests.post(self.base_url, json=payload, headers=self.headers)
        response.raise_for_status()
        return response.json()

# Usage
client = QuackAPIClient()
result = client.send_text(1, "923001234567", "Hello from QuackAPI!")
print(result)`,
        },
      },
    ],
  },
  {
    slug: "whatsapp-api-vs-sms",
    title: "WhatsApp API vs SMS: Which is Better for Business?",
    description: "A detailed comparison of WhatsApp API and traditional SMS for business messaging. Compare delivery rates, costs, features, and engagement to choose the right channel.",
    category: "Comparison",
    date: "2026-02-10",
    readTime: "7 min read",
    sections: [
      {
        heading: "Delivery Rates and Reliability",
        headingLevel: "h2",
        content: [
          "WhatsApp messages boast a delivery rate of over 95% globally, significantly higher than SMS which averages around 82% in many regions. WhatsApp messages are delivered over the internet, bypassing carrier networks that can filter or delay SMS messages.",
          "SMS delivery depends heavily on carrier agreements, regional regulations, and spam filters. Messages can be silently dropped without notification. WhatsApp provides delivery receipts and read confirmations, giving you full visibility into message status.",
        ],
      },
      {
        heading: "Cost Comparison",
        headingLevel: "h2",
        content: [
          "SMS pricing varies dramatically by country. Sending messages to international numbers can cost anywhere from $0.01 to $0.15 per message. These costs add up quickly for businesses sending thousands of messages daily.",
          "WhatsApp API pricing through platforms like QuackAPI is typically flat-rate or subscription-based, making costs more predictable. With the Professional plan at $29/month for unlimited messages, high-volume senders save significantly compared to per-message SMS pricing.",
        ],
      },
      {
        heading: "Rich Media Support",
        headingLevel: "h2",
        content: [
          "SMS is limited to 160 characters of plain text per segment. Multimedia messaging (MMS) exists but has inconsistent support across carriers and devices, and costs significantly more per message.",
          "WhatsApp supports rich media natively including images, videos, documents (PDF, DOC), audio messages, location sharing, and contact cards. Messages can be up to 65,536 characters long. Interactive buttons and quick replies further enhance the messaging experience.",
        ],
      },
      {
        heading: "Global Reach and Adoption",
        headingLevel: "h2",
        content: [
          "WhatsApp has over 2 billion active users across 180+ countries, making it the most popular messaging platform globally. In regions like South America, Southeast Asia, Europe, and Africa, WhatsApp is the primary communication tool.",
          "SMS has universal device compatibility since it works on every phone with cellular service. However, in markets where WhatsApp dominates, users are far more likely to read and respond to WhatsApp messages than SMS.",
        ],
      },
      {
        heading: "User Engagement Metrics",
        headingLevel: "h2",
        content: [
          "WhatsApp messages achieve open rates of 90-98%, compared to SMS open rates of around 90%. However, the key difference is in response rates: WhatsApp messages see 40-60% response rates versus 6-8% for SMS.",
          "The rich media capabilities of WhatsApp drive significantly higher click-through rates on links and calls to action. Businesses report 3-5x higher conversion rates when using WhatsApp compared to SMS for promotional messages.",
        ],
      },
      {
        heading: "When to Use Each Channel",
        headingLevel: "h2",
        content: [
          "Use WhatsApp API when you need rich media support, high engagement rates, cost-effective international messaging, or when targeting markets where WhatsApp is dominant. It is ideal for customer support, marketing campaigns, and transactional notifications.",
          "Use SMS when you need to reach users who may not have WhatsApp installed, for time-critical alerts where internet connectivity might be an issue, or for markets where SMS remains the primary messaging channel like parts of North America.",
        ],
      },
    ],
  },
  {
    slug: "whatsapp-webhook-setup-guide",
    title: "Complete Guide to WhatsApp Webhooks",
    description: "Learn how to set up and configure WhatsApp webhooks to receive real-time incoming messages. Covers endpoint setup, message handling, security, and testing.",
    category: "Guide",
    date: "2026-02-05",
    readTime: "6 min read",
    sections: [
      {
        heading: "What Are Webhooks?",
        headingLevel: "h2",
        content: [
          "Webhooks are HTTP callbacks that send real-time data to your application when specific events occur. Instead of continuously polling an API for new messages, webhooks push data to your server the moment a new message arrives.",
          "In the context of WhatsApp API, webhooks notify your application whenever a connected device receives an incoming message. This enables you to build real-time chatbots, support systems, and automated workflows.",
        ],
      },
      {
        heading: "Setting Up Your Webhook Endpoint",
        headingLevel: "h2",
        content: [
          "Your webhook endpoint needs to be a publicly accessible HTTPS URL that can receive POST requests. The endpoint should respond with a 200 status code quickly to acknowledge receipt of the webhook payload.",
          "Here is a basic Express.js endpoint that receives incoming WhatsApp messages:",
        ],
        code: {
          language: "javascript",
          snippet: `const express = require("express");
const app = express();

app.use(express.json());

app.post("/webhook/whatsapp", (req, res) => {
  const { event, deviceId, from, message } = req.body;
  
  console.log(\`New message from \${from} on device \${deviceId}\`);
  console.log(\`Type: \${message.type}, Content: \${message.content}\`);
  
  // Process the message (save to DB, trigger response, etc.)
  
  res.status(200).json({ received: true });
});

app.listen(3000, () => console.log("Webhook server running on port 3000"));`,
        },
      },
      {
        heading: "Handling Incoming Messages",
        headingLevel: "h2",
        content: [
          "The webhook payload contains the event type, device ID, sender phone number, and message details including type, content, timestamp, and a unique message ID. You should validate and parse this data before processing.",
          "Different message types require different handling. Text messages contain plain string content, while media messages include URLs to the media files. Build a message handler that routes each type appropriately.",
        ],
        code: {
          language: "javascript",
          snippet: `function handleMessage(payload) {
  const { event, from, message } = payload;
  
  switch (message.type) {
    case "text":
      handleTextMessage(from, message.content);
      break;
    case "image":
      handleImageMessage(from, message.content);
      break;
    default:
      console.log(\`Unhandled message type: \${message.type}\`);
  }
}

function handleTextMessage(from, content) {
  // Auto-reply, save to database, forward to support agent
  if (content.toLowerCase().includes("help")) {
    sendAutoReply(from, "How can we assist you today?");
  }
}`,
        },
      },
      {
        heading: "Security Best Practices",
        headingLevel: "h2",
        content: [
          "Always use HTTPS for your webhook endpoint to encrypt data in transit. Validate the incoming request to ensure it originates from QuackAPI by checking request headers or implementing a shared secret.",
          "Rate-limit your webhook endpoint to prevent abuse. Implement request validation to reject malformed payloads. Store webhook data in a queue for async processing to avoid blocking the response and causing timeout issues.",
        ],
        code: {
          language: "javascript",
          snippet: `// Validate webhook requests
app.post("/webhook/whatsapp", (req, res) => {
  const signature = req.headers["x-webhook-signature"];
  
  if (!isValidSignature(signature, req.body)) {
    return res.status(401).json({ error: "Invalid signature" });
  }
  
  // Queue for async processing
  messageQueue.add(req.body);
  
  // Respond quickly
  res.status(200).json({ received: true });
});`,
        },
      },
      {
        heading: "Testing Your Webhooks",
        headingLevel: "h2",
        content: [
          "During development, use tools like ngrok to expose your local server to the internet. This lets you test webhook delivery without deploying to a production server. Run ngrok http 3000 and use the generated HTTPS URL as your webhook endpoint.",
          "Configure your webhook URL in the QuackAPI device settings. Send a test message to the connected WhatsApp number and verify that your endpoint receives the payload correctly. Check your server logs to confirm the data structure matches your expectations.",
          "Evaluating which provider to use for your webhook integration? See [how QuackAPI compares to UltraMsg](/compare/ultramsg) — including webhook reliability and multi-device support differences.",
        ],
        code: {
          language: "bash",
          snippet: `# Expose local server via ngrok
ngrok http 3000

# Test with curl
curl -X POST http://localhost:3000/webhook/whatsapp \\
  -H "Content-Type: application/json" \\
  -d '{"event":"message.received","deviceId":1,"from":"923001234567","message":{"type":"text","content":"Test message"}}'`,
        },
      },
    ],
  },
  {
    slug: "whatsapp-otp-verification-nodejs",
    title: "Implement WhatsApp OTP Verification in Node.js",
    description: "Build a complete WhatsApp OTP verification system in Node.js. Generate secure codes, send them via the QuackAPI API, verify user input, and handle code expiry.",
    category: "Tutorial",
    date: "2026-01-28",
    readTime: "8 min read",
    sections: [
      {
        heading: "Why WhatsApp OTP?",
        headingLevel: "h2",
        content: [
          "WhatsApp OTP verification offers higher delivery rates than SMS-based OTP, reaching 95%+ globally. Users are more likely to see and act on WhatsApp messages quickly, reducing verification drop-off rates.",
          "WhatsApp OTP is also more cost-effective than SMS OTP for international users. With QuackAPI, you can send OTP messages at a flat subscription rate rather than paying per-message carrier fees.",
        ],
      },
      {
        heading: "Generating Secure OTP Codes",
        headingLevel: "h2",
        content: [
          "Use cryptographically secure random number generation for OTP codes. Never use Math.random() as it is not cryptographically secure. The crypto module in Node.js provides the randomInt function for generating secure random integers.",
        ],
        code: {
          language: "javascript",
          snippet: `const crypto = require("crypto");

function generateOTP(length = 6) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return crypto.randomInt(min, max).toString();
}

// Generate a 6-digit OTP
const otp = generateOTP();
console.log(otp); // e.g., "847293"`,
        },
      },
      {
        heading: "Sending OTP via QuackAPI API",
        headingLevel: "h2",
        content: [
          "Once you have generated the OTP code, send it to the user via the QuackAPI messaging API. Format the message clearly so users can easily identify and copy the verification code.",
        ],
        code: {
          language: "javascript",
          snippet: `const axios = require("axios");

async function sendOTP(phoneNumber, otpCode) {
  const message = \`Your verification code is: \${otpCode}\\n\\nThis code expires in 5 minutes. Do not share this code with anyone.\`;
  
  const response = await axios.post(
    "https://your-domain.com/api/messages/send",
    {
      deviceId: 1,
      to: phoneNumber,
      content: message,
      type: "text"
    },
    {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.WAPISTACK_API_KEY
      }
    }
  );
  
  return response.data;
}`,
        },
      },
      {
        heading: "Storing and Verifying Codes",
        headingLevel: "h2",
        content: [
          "Store OTP codes with their associated phone number, creation timestamp, and attempt count. Use an in-memory store like Redis for fast lookups, or a database if you need persistence. Hash the OTP before storing for added security.",
        ],
        code: {
          language: "javascript",
          snippet: `const otpStore = new Map();

function storeOTP(phoneNumber, otpCode) {
  otpStore.set(phoneNumber, {
    code: otpCode,
    createdAt: Date.now(),
    attempts: 0,
    maxAttempts: 3
  });
}

function verifyOTP(phoneNumber, inputCode) {
  const stored = otpStore.get(phoneNumber);
  
  if (!stored) {
    return { valid: false, error: "No OTP found for this number" };
  }
  
  stored.attempts += 1;
  
  if (stored.attempts > stored.maxAttempts) {
    otpStore.delete(phoneNumber);
    return { valid: false, error: "Maximum attempts exceeded" };
  }
  
  if (stored.code === inputCode) {
    otpStore.delete(phoneNumber);
    return { valid: true };
  }
  
  return { valid: false, error: "Invalid code" };
}`,
        },
      },
      {
        heading: "Handling Code Expiry",
        headingLevel: "h2",
        content: [
          "OTP codes should expire after a short time window, typically 5 to 10 minutes. Check the creation timestamp against the current time during verification. Implement automatic cleanup to prevent stale entries from accumulating in your store.",
        ],
        code: {
          language: "javascript",
          snippet: `const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

function verifyOTPWithExpiry(phoneNumber, inputCode) {
  const stored = otpStore.get(phoneNumber);
  
  if (!stored) {
    return { valid: false, error: "No OTP found" };
  }
  
  if (Date.now() - stored.createdAt > OTP_EXPIRY_MS) {
    otpStore.delete(phoneNumber);
    return { valid: false, error: "OTP has expired" };
  }
  
  return verifyOTP(phoneNumber, inputCode);
}

// Cleanup expired OTPs every minute
setInterval(() => {
  const now = Date.now();
  for (const [phone, data] of otpStore.entries()) {
    if (now - data.createdAt > OTP_EXPIRY_MS) {
      otpStore.delete(phone);
    }
  }
}, 60000);`,
        },
      },
      {
        heading: "Complete Express API",
        headingLevel: "h2",
        content: [
          "Here is a complete Express.js API with endpoints for requesting and verifying OTPs. This example ties together all the previous sections into a production-ready service.",
        ],
        code: {
          language: "javascript",
          snippet: `const express = require("express");
const app = express();
app.use(express.json());

app.post("/api/otp/request", async (req, res) => {
  const { phoneNumber } = req.body;
  
  if (!phoneNumber) {
    return res.status(400).json({ error: "Phone number required" });
  }
  
  const otp = generateOTP();
  storeOTP(phoneNumber, otp);
  
  try {
    await sendOTP(phoneNumber, otp);
    res.json({ success: true, message: "OTP sent via WhatsApp" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

app.post("/api/otp/verify", (req, res) => {
  const { phoneNumber, code } = req.body;
  const result = verifyOTPWithExpiry(phoneNumber, code);
  
  if (result.valid) {
    res.json({ success: true, message: "Phone number verified" });
  } else {
    res.status(400).json({ success: false, error: result.error });
  }
});

app.listen(3000);`,
        },
      },
    ],
  },
  {
    slug: "send-whatsapp-messages-php",
    title: "How to Send WhatsApp Messages Using PHP",
    description: "Step-by-step guide to sending WhatsApp messages with PHP using the QuackAPI REST API. Includes cURL and Guzzle examples for text, image, and document messages.",
    category: "Tutorial",
    date: "2026-02-18",
    readTime: "6 min read",
    sections: [
      {
        heading: "Prerequisites & Installation",
        headingLevel: "h2",
        content: [
          "Before sending WhatsApp messages with PHP, you need PHP 7.4 or higher and Composer installed. We will use the Guzzle HTTP client for cleaner request handling, though we also cover native cURL.",
          "Install Guzzle via Composer by running the following command in your project directory:",
        ],
        code: {
          language: "bash",
          snippet: `composer require guzzlehttp/guzzle`,
        },
      },
      {
        heading: "Getting Your API Key",
        headingLevel: "h2",
        content: [
          "Log into your QuackAPI dashboard and navigate to Profile Settings. Your API key starts with wa_ and is required for authenticating all API requests.",
          "Store your API key as an environment variable or in a secure configuration file. Never hardcode API keys in your PHP source files or commit them to version control.",
        ],
        code: {
          language: "php",
          snippet: `<?php
// Load API key from environment variable
$apiKey = getenv('WAPISTACK_API_KEY');
$baseUrl = 'https://your-domain.com/api/messages/send';`,
        },
      },
      {
        heading: "Sending Text Messages with cURL",
        headingLevel: "h2",
        content: [
          "PHP's built-in cURL extension is the most portable way to make HTTP requests. Here is how to send a text message using native cURL functions with proper headers and JSON payload.",
        ],
        code: {
          language: "php",
          snippet: `<?php
$apiKey = getenv('WAPISTACK_API_KEY');
$url = 'https://your-domain.com/api/messages/send';

$payload = json_encode([
    'deviceId' => 1,
    'to' => '923001234567',
    'content' => 'Hello from PHP!',
    'type' => 'text'
]);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'x-api-key: ' . $apiKey
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$result = json_decode($response, true);
echo "Status: $httpCode\\n";
print_r($result);`,
        },
      },
      {
        heading: "Sending with Guzzle",
        headingLevel: "h2",
        content: [
          "Guzzle provides a much cleaner and more modern API for HTTP requests in PHP. It supports promises, middleware, and automatic JSON encoding, making it ideal for production applications.",
        ],
        code: {
          language: "php",
          snippet: `<?php
require 'vendor/autoload.php';

use GuzzleHttp\\Client;

$client = new Client([
    'base_uri' => 'https://your-domain.com',
    'headers' => [
        'Content-Type' => 'application/json',
        'x-api-key' => getenv('WAPISTACK_API_KEY')
    ]
]);

try {
    $response = $client->post('/api/messages/send', [
        'json' => [
            'deviceId' => 1,
            'to' => '923001234567',
            'content' => 'Hello from Guzzle!',
            'type' => 'text'
        ]
    ]);

    $body = json_decode($response->getBody(), true);
    echo "Message sent! ID: " . $body['id'] . "\\n";
} catch (\\GuzzleHttp\\Exception\\RequestException $e) {
    echo "Error: " . $e->getMessage() . "\\n";
}`,
        },
      },
      {
        heading: "Sending Images and Documents",
        headingLevel: "h2",
        content: [
          "QuackAPI supports sending images with captions and documents like PDFs. Set the type field to image or pdf and provide the file URL in the content field. For documents, include a filename parameter.",
        ],
        code: {
          language: "php",
          snippet: `<?php
// Send an image with caption
$client->post('/api/messages/send', [
    'json' => [
        'deviceId' => 1,
        'to' => '923001234567',
        'content' => 'https://example.com/photo.jpg',
        'type' => 'image',
        'caption' => 'Check out this photo!'
    ]
]);

// Send a PDF document
$client->post('/api/messages/send', [
    'json' => [
        'deviceId' => 1,
        'to' => '923001234567',
        'content' => 'https://example.com/invoice.pdf',
        'type' => 'pdf',
        'filename' => 'invoice.pdf'
    ]
]);`,
        },
      },
      {
        heading: "Complete PHP Class",
        headingLevel: "h2",
        content: [
          "Here is a complete, reusable PHP class that wraps the QuackAPI API. You can include this in any PHP project to start sending WhatsApp messages with minimal setup.",
        ],
        code: {
          language: "php",
          snippet: `<?php
require 'vendor/autoload.php';

use GuzzleHttp\\Client;
use GuzzleHttp\\Exception\\RequestException;

class QuackAPIClient
{
    private Client $client;

    public function __construct(?string $apiKey = null)
    {
        $key = $apiKey ?? getenv('WAPISTACK_API_KEY');
        $this->client = new Client([
            'base_uri' => 'https://your-domain.com',
            'headers' => [
                'Content-Type' => 'application/json',
                'x-api-key' => $key
            ]
        ]);
    }

    public function sendText(int $deviceId, string $to, string $message): array
    {
        return $this->send([
            'deviceId' => $deviceId,
            'to' => $to,
            'content' => $message,
            'type' => 'text'
        ]);
    }

    public function sendImage(int $deviceId, string $to, string $url, string $caption = ''): array
    {
        return $this->send([
            'deviceId' => $deviceId,
            'to' => $to,
            'content' => $url,
            'type' => 'image',
            'caption' => $caption
        ]);
    }

    public function sendDocument(int $deviceId, string $to, string $url, string $filename): array
    {
        return $this->send([
            'deviceId' => $deviceId,
            'to' => $to,
            'content' => $url,
            'type' => 'pdf',
            'filename' => $filename
        ]);
    }

    private function send(array $payload): array
    {
        try {
            $response = $this->client->post('/api/messages/send', ['json' => $payload]);
            return json_decode($response->getBody(), true);
        } catch (RequestException $e) {
            throw new \\RuntimeException('QuackAPI API error: ' . $e->getMessage());
        }
    }
}

// Usage
$wa = new QuackAPIClient();
$result = $wa->sendText(1, '923001234567', 'Hello from QuackAPI PHP!');
print_r($result);`,
        },
      },
    ],
  },
  {
    slug: "send-whatsapp-messages-nodejs",
    title: "How to Send WhatsApp Messages with Node.js",
    description: "Complete Node.js tutorial for sending WhatsApp messages via the QuackAPI API. Covers axios, fetch, and native https with async/await patterns.",
    category: "Tutorial",
    date: "2026-02-16",
    readTime: "5 min read",
    sections: [
      {
        heading: "Prerequisites & Installation",
        headingLevel: "h2",
        content: [
          "You need Node.js 18 or higher installed on your system. We will primarily use axios for HTTP requests, but also demonstrate the built-in fetch API available in modern Node.js versions.",
          "Install axios in your project using npm:",
        ],
        code: {
          language: "bash",
          snippet: `npm install axios`,
        },
      },
      {
        heading: "Setting Up",
        headingLevel: "h2",
        content: [
          "Configure your API key and base URL as environment variables. Create a .env file or export them in your shell. The API key authenticates every request to the QuackAPI API.",
          "Never hardcode your API key in source files. Use environment variables or a secrets manager in production.",
        ],
        code: {
          language: "javascript",
          snippet: `const axios = require("axios");

const API_KEY = process.env.WAPISTACK_API_KEY;
const BASE_URL = "https://your-domain.com/api/messages/send";

const headers = {
  "Content-Type": "application/json",
  "x-api-key": API_KEY
};`,
        },
      },
      {
        heading: "Sending Text Messages with Axios",
        headingLevel: "h2",
        content: [
          "Axios makes it simple to send JSON POST requests. The following example sends a text message to a WhatsApp number using async/await syntax for clean, readable code.",
        ],
        code: {
          language: "javascript",
          snippet: `async function sendTextMessage(to, message) {
  try {
    const response = await axios.post(BASE_URL, {
      deviceId: 1,
      to: to,
      content: message,
      type: "text"
    }, { headers });

    console.log("Message sent:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    throw error;
  }
}

// Usage
sendTextMessage("923001234567", "Hello from Node.js!");`,
        },
      },
      {
        heading: "Using Native Fetch",
        headingLevel: "h2",
        content: [
          "Node.js 18+ includes a built-in fetch API, so you can send messages without any third-party dependencies. This is great for lightweight scripts and serverless functions.",
        ],
        code: {
          language: "javascript",
          snippet: `async function sendWithFetch(to, message) {
  const response = await fetch("https://your-domain.com/api/messages/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.WAPISTACK_API_KEY
    },
    body: JSON.stringify({
      deviceId: 1,
      to: to,
      content: message,
      type: "text"
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Request failed");
  }

  return await response.json();
}

sendWithFetch("923001234567", "Hello via fetch!");`,
        },
      },
      {
        heading: "Sending Media Messages",
        headingLevel: "h2",
        content: [
          "Send images, documents, and other media by changing the type and content fields. Images support optional captions, and documents require a filename parameter.",
        ],
        code: {
          language: "javascript",
          snippet: `// Send an image with caption
await axios.post(BASE_URL, {
  deviceId: 1,
  to: "923001234567",
  content: "https://example.com/photo.jpg",
  type: "image",
  caption: "Check out this photo!"
}, { headers });

// Send a PDF document
await axios.post(BASE_URL, {
  deviceId: 1,
  to: "923001234567",
  content: "https://example.com/report.pdf",
  type: "pdf",
  filename: "report.pdf"
}, { headers });`,
        },
      },
      {
        heading: "Building a Reusable Module",
        headingLevel: "h2",
        content: [
          "Wrap all messaging functionality into a reusable module that you can import across your Node.js project. This class handles authentication, error handling, and supports all message types.",
          "Need to justify your choice of WhatsApp API provider to stakeholders? Check our [QuackAPI vs WATI comparison](/compare/wati) — covering pricing, setup time, and REST API flexibility for Node.js developers.",
        ],
        code: {
          language: "javascript",
          snippet: `const axios = require("axios");

class QuackAPI {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.WAPISTACK_API_KEY;
    this.client = axios.create({
      baseURL: "https://your-domain.com",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey
      }
    });
  }

  async sendText(deviceId, to, message) {
    const { data } = await this.client.post("/api/messages/send", {
      deviceId, to, content: message, type: "text"
    });
    return data;
  }

  async sendImage(deviceId, to, imageUrl, caption = "") {
    const { data } = await this.client.post("/api/messages/send", {
      deviceId, to, content: imageUrl, type: "image", caption
    });
    return data;
  }

  async sendDocument(deviceId, to, docUrl, filename) {
    const { data } = await this.client.post("/api/messages/send", {
      deviceId, to, content: docUrl, type: "pdf", filename
    });
    return data;
  }
}

module.exports = QuackAPI;

// Usage
const wa = new QuackAPI();
wa.sendText(1, "923001234567", "Hello from QuackAPI!").then(console.log);`,
        },
      },
    ],
  },
  {
    slug: "build-whatsapp-chatbot-python",
    title: "Build a WhatsApp Chatbot with Python and Flask",
    description: "Learn to build an automated WhatsApp chatbot using Python, Flask, and the QuackAPI API. Handle incoming messages via webhooks and send intelligent auto-replies.",
    category: "Tutorial",
    date: "2026-02-12",
    readTime: "8 min read",
    sections: [
      {
        heading: "What You'll Build",
        headingLevel: "h2",
        content: [
          "In this tutorial, you will build a fully functional WhatsApp chatbot that receives incoming messages via webhooks, processes commands like help, pricing, and hours, and sends intelligent auto-replies using the QuackAPI API.",
          "The chatbot will include a menu system, keyword-based routing, and proper error handling. By the end, you will have a deployable Flask application ready for production use.",
        ],
      },
      {
        heading: "Setting Up Flask",
        headingLevel: "h2",
        content: [
          "Install Flask and the requests library for making API calls. Create a new project directory and set up your Flask application with the basic structure needed for webhook handling.",
        ],
        code: {
          language: "bash",
          snippet: `pip install flask requests`,
        },
      },
      {
        heading: "Receiving Messages via Webhook",
        headingLevel: "h2",
        content: [
          "Create a POST endpoint that QuackAPI will call whenever your connected device receives a message. The webhook payload includes the sender number, message type, content, and device ID.",
          "Always respond with a 200 status code quickly to acknowledge receipt. Process messages asynchronously if your logic takes time.",
        ],
        code: {
          language: "python",
          snippet: `from flask import Flask, request, jsonify
import requests
import os

app = Flask(__name__)

API_KEY = os.environ.get("WAPISTACK_API_KEY")
API_URL = "https://your-domain.com/api/messages/send"

@app.route("/webhook/whatsapp", methods=["POST"])
def webhook():
    data = request.json
    event = data.get("event")
    sender = data.get("from")
    message = data.get("message", {})
    device_id = data.get("deviceId")

    if event == "message.received" and message.get("type") == "text":
        content = message.get("content", "").strip().lower()
        handle_command(device_id, sender, content)

    return jsonify({"received": True}), 200`,
        },
      },
      {
        heading: "Building a Command Handler",
        headingLevel: "h2",
        content: [
          "Route incoming messages to the appropriate handler based on keywords. This pattern makes it easy to add new commands as your chatbot grows. Each command maps to a specific response or action.",
        ],
        code: {
          language: "python",
          snippet: `def handle_command(device_id, sender, content):
    if content in ["help", "?"]:
        reply = (
            "Available commands:\\n"
            "1. *pricing* - View our plans\\n"
            "2. *hours* - Business hours\\n"
            "3. *menu* - Show main menu\\n"
            "4. *help* - Show this message"
        )
    elif content == "pricing":
        reply = (
            "Our Plans:\\n\\n"
            "Starter: $9/month - 3 devices\\n"
            "Professional: $29/month - 10 devices\\n"
            "Enterprise: $79/month - Unlimited\\n\\n"
            "Visit our website to sign up!"
        )
    elif content == "hours":
        reply = (
            "Business Hours:\\n"
            "Monday - Friday: 9AM - 6PM\\n"
            "Saturday: 10AM - 2PM\\n"
            "Sunday: Closed"
        )
    elif content == "menu":
        reply = show_menu()
    else:
        reply = "I didn't understand that. Type *help* to see available commands."

    send_reply(device_id, sender, reply)`,
        },
      },
      {
        heading: "Sending Auto-Replies",
        headingLevel: "h2",
        content: [
          "Use the QuackAPI API to send replies back to the user. This function handles the HTTP request with proper authentication headers and error handling.",
        ],
        code: {
          language: "python",
          snippet: `def send_reply(device_id, to, message):
    headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
    }
    payload = {
        "deviceId": device_id,
        "to": to,
        "content": message,
        "type": "text"
    }
    try:
        response = requests.post(API_URL, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Failed to send reply: {e}")
        return None`,
        },
      },
      {
        heading: "Adding a Menu System",
        headingLevel: "h2",
        content: [
          "A menu system gives users a structured way to interact with your chatbot. Present numbered options that users can select by replying with the corresponding number or keyword.",
        ],
        code: {
          language: "python",
          snippet: `def show_menu():
    return (
        "Welcome to QuackAPI Support!\\n\\n"
        "Please choose an option:\\n"
        "1. View Pricing\\n"
        "2. Business Hours\\n"
        "3. Technical Support\\n"
        "4. Talk to a Human\\n\\n"
        "Reply with the number or keyword."
    )`,
        },
      },
      {
        heading: "Deploying Your Chatbot",
        headingLevel: "h2",
        content: [
          "Deploy your Flask chatbot to a cloud platform like Heroku, Railway, or any VPS. Make sure your server is accessible via HTTPS, as QuackAPI requires a secure webhook URL.",
          "Set the WAPISTACK_API_KEY environment variable on your hosting platform. Configure the webhook URL in your QuackAPI device settings to point to your deployed endpoint, for example https://your-app.com/webhook/whatsapp.",
          "For production, consider using Gunicorn as your WSGI server and adding rate limiting to prevent abuse of your webhook endpoint.",
        ],
        code: {
          language: "bash",
          snippet: `# Run with Gunicorn for production
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app:app`,
        },
      },
    ],
  },
  {
    slug: "avoid-whatsapp-number-ban",
    title: "How to Avoid Getting Your WhatsApp Number Banned",
    description: "Essential tips and best practices to prevent your WhatsApp number from being banned when using WhatsApp API for business messaging. Learn the rules and stay compliant.",
    category: "Best Practices",
    date: "2026-02-08",
    readTime: "6 min read",
    sections: [
      {
        heading: "Why Numbers Get Banned",
        headingLevel: "h2",
        content: [
          "WhatsApp actively monitors messaging patterns and user reports to maintain platform quality. Numbers get banned for sending unsolicited bulk messages, being reported by multiple recipients, sending identical content to many users, or violating WhatsApp's Terms of Service.",
          "A ban can be temporary (24 hours to 7 days) or permanent depending on the severity. Permanent bans are extremely difficult to reverse, so prevention is critical for any business relying on WhatsApp messaging.",
        ],
      },
      {
        heading: "WhatsApp's Messaging Policies",
        headingLevel: "h2",
        content: [
          "WhatsApp requires that all business messaging be opt-in. Users must explicitly consent to receive messages from your business before you send them anything. This applies to both promotional and transactional messages.",
          "You must provide a clear way for users to opt out at any time. Messages must be relevant to the user and the context in which they opted in. Misleading content, spam, and scam messages are strictly prohibited and will result in immediate bans.",
        ],
      },
      {
        heading: "Best Practices for Safe Messaging",
        headingLevel: "h2",
        content: [
          "Warm up new numbers gradually. Start by sending 50-100 messages per day in the first week, then increase by 20-30% each week. Sudden spikes in messaging volume trigger WhatsApp's anti-spam systems.",
          "Personalize your messages. Avoid sending the exact same message to hundreds of recipients. Include the recipient's name, reference their specific order or inquiry, and vary your message templates.",
          "Respect opt-outs immediately. When a user asks to stop receiving messages, honor that request within seconds, not hours. Maintain an opt-out list and check it before every send.",
          "Implement rate limiting in your application. Space out messages with at least 1-2 second delays between sends. Avoid sending more than 1,000 messages per hour from a single number.",
        ],
      },
      {
        heading: "Handling User Opt-In and Opt-Out",
        headingLevel: "h2",
        content: [
          "Build a proper opt-in and opt-out system into your application. Store consent records with timestamps and the context of opt-in. Check consent status before every message send to ensure compliance.",
        ],
        code: {
          language: "javascript",
          snippet: `const optOutList = new Set();

function handleOptOut(phoneNumber) {
  optOutList.add(phoneNumber);
  // Send confirmation
  sendMessage(phoneNumber, "You have been unsubscribed. You will no longer receive messages from us.");
}

function canSendMessage(phoneNumber) {
  return !optOutList.has(phoneNumber);
}

// Check before every send
async function safeSend(deviceId, to, message) {
  if (!canSendMessage(to)) {
    console.log("User has opted out, skipping:", to);
    return null;
  }
  // Proceed with sending
  return await sendMessage(to, message);
}`,
        },
      },
      {
        heading: "What to Do If You Get Banned",
        headingLevel: "h2",
        content: [
          "If your number receives a temporary ban, stop all messaging immediately. Wait for the ban period to expire before resuming. When you start again, significantly reduce your messaging volume and review your content for potential triggers.",
          "For permanent bans, you can try to appeal through WhatsApp's support channels, but success rates are low. The best approach is to register a new number and apply all the best practices from the start to avoid a repeat ban.",
          "Keep detailed logs of all messages sent, including timestamps, recipient numbers, and content. These logs are invaluable for diagnosing what triggered a ban and for any appeal process.",
        ],
      },
      {
        heading: "Monitoring Message Quality",
        headingLevel: "h2",
        content: [
          "Track your message delivery rates, read rates, and user report rates. A declining delivery rate or increasing block rate are early warning signs that your number may be at risk.",
          "Monitor the ratio of messages sent versus messages delivered. If more than 5% of your messages are failing to deliver, investigate the cause immediately. High failure rates often precede bans.",
          "Set up alerts for unusual patterns such as sudden spikes in opt-out requests or user blocks. These indicators help you catch problems before they escalate to a ban.",
        ],
      },
    ],
  },
  {
    slug: "connect-whatsapp-api-crm-integration",
    title: "How to Integrate WhatsApp API with Your CRM System",
    description: "Guide to connecting the QuackAPI WhatsApp API with popular CRM systems like HubSpot, Salesforce, and Zoho. Automate customer communication and sync conversations.",
    category: "Integration",
    date: "2026-02-03",
    readTime: "7 min read",
    sections: [
      {
        heading: "Why Integrate WhatsApp with Your CRM",
        headingLevel: "h2",
        content: [
          "Integrating WhatsApp with your CRM creates a unified view of customer interactions. Sales and support teams can see complete conversation histories alongside deal stages, tickets, and contact information.",
          "Automated WhatsApp messages triggered by CRM events like deal stage changes, ticket updates, or follow-up reminders ensure timely and consistent customer communication without manual effort.",
        ],
      },
      {
        heading: "Architecture Overview",
        headingLevel: "h2",
        content: [
          "The integration works in two directions. Inbound: QuackAPI webhooks forward incoming WhatsApp messages to your server, which then creates or updates CRM records. Outbound: CRM events trigger your server to send WhatsApp messages through the QuackAPI API.",
          "Your server acts as a middleware layer between QuackAPI and your CRM. This gives you full control over data transformation, filtering, and business logic before data flows in either direction.",
        ],
      },
      {
        heading: "Using Webhooks for CRM Sync",
        headingLevel: "h2",
        content: [
          "Set up a webhook endpoint to receive incoming WhatsApp messages and sync them to your CRM. The following example receives messages and creates a new contact or updates conversation history in your CRM.",
        ],
        code: {
          language: "javascript",
          snippet: `const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const CRM_API_URL = "https://api.your-crm.com";
const CRM_API_KEY = process.env.CRM_API_KEY;

app.post("/webhook/whatsapp", async (req, res) => {
  const { event, from, message, deviceId } = req.body;

  if (event === "message.received") {
    try {
      // Search for existing contact in CRM
      let contact = await findCRMContact(from);

      if (!contact) {
        // Create new contact
        contact = await createCRMContact(from);
      }

      // Log the conversation in CRM
      await logConversation(contact.id, {
        direction: "inbound",
        channel: "whatsapp",
        content: message.content,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("CRM sync failed:", error.message);
    }
  }

  res.status(200).json({ received: true });
});

async function findCRMContact(phone) {
  const { data } = await axios.get(
    \`\${CRM_API_URL}/contacts/search?phone=\${phone}\`,
    { headers: { "Authorization": \`Bearer \${CRM_API_KEY}\` } }
  );
  return data.results[0] || null;
}

async function createCRMContact(phone) {
  const { data } = await axios.post(
    \`\${CRM_API_URL}/contacts\`,
    { phone, source: "whatsapp" },
    { headers: { "Authorization": \`Bearer \${CRM_API_KEY}\` } }
  );
  return data;
}

async function logConversation(contactId, entry) {
  await axios.post(
    \`\${CRM_API_URL}/contacts/\${contactId}/conversations\`,
    entry,
    { headers: { "Authorization": \`Bearer \${CRM_API_KEY}\` } }
  );
}`,
        },
      },
      {
        heading: "Sending CRM-Triggered Messages",
        headingLevel: "h2",
        content: [
          "Trigger WhatsApp messages from CRM events such as deal stage changes, appointment reminders, or follow-up tasks. Use CRM webhooks or polling to detect events and send messages via the QuackAPI API.",
        ],
        code: {
          language: "javascript",
          snippet: `const WAPISTACK_URL = "https://your-domain.com/api/messages/send";
const WAPISTACK_KEY = process.env.WAPISTACK_API_KEY;

// CRM webhook: deal stage changed
app.post("/crm/webhook/deal-update", async (req, res) => {
  const { dealId, stage, contact } = req.body;

  const messages = {
    "proposal_sent": "Hi! We have sent you a proposal. Please review and let us know if you have any questions.",
    "won": "Congratulations! Your order has been confirmed. We will begin processing it right away.",
    "follow_up": "Hi! Just checking in. Do you have any questions about our proposal?"
  };

  const messageText = messages[stage];
  if (messageText && contact.phone) {
    try {
      await axios.post(WAPISTACK_URL, {
        deviceId: 1,
        to: contact.phone,
        content: messageText,
        type: "text"
      }, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": WAPISTACK_KEY
        }
      });
      console.log(\`Sent \${stage} message to \${contact.phone}\`);
    } catch (error) {
      console.error("Failed to send CRM message:", error.message);
    }
  }

  res.status(200).json({ processed: true });
});`,
        },
      },
      {
        heading: "Popular CRM Integrations",
        headingLevel: "h2",
        content: [
          "HubSpot: Use the HubSpot CRM API to create contacts, log engagements, and track deals. HubSpot supports custom properties where you can store the WhatsApp number and conversation metadata. Use HubSpot webhooks to trigger outbound messages on deal stage changes.",
          "Salesforce: Leverage the Salesforce REST API to sync WhatsApp conversations as Activity records. Map WhatsApp contacts to Salesforce Leads or Contacts. Use Salesforce Process Builder or Flow to trigger WhatsApp notifications on record updates.",
          "Zoho CRM: The Zoho CRM API supports contact management and custom modules where you can store WhatsApp conversation logs. Use Zoho's workflow rules to trigger API calls to your middleware when CRM events occur.",
        ],
      },
      {
        heading: "Building a Custom Integration",
        headingLevel: "h2",
        content: [
          "For CRMs without built-in integrations, build a custom middleware service. Define a standard interface for CRM operations like contact lookup, creation, and conversation logging. Implement this interface for each CRM you need to support.",
          "Use a message queue like Redis or RabbitMQ to decouple webhook processing from CRM API calls. This ensures webhook responses are fast and CRM sync happens reliably even if the CRM API is temporarily slow or unavailable.",
          "Test your integration thoroughly with realistic data volumes. Implement retry logic for failed CRM API calls and set up monitoring to detect sync failures early.",
        ],
      },
    ],
  },
  {
    slug: "whatsapp-api-messaging-best-practices",
    title: "WhatsApp API Messaging Best Practices for Developers",
    description: "Developer guide to WhatsApp API best practices covering rate limiting, error handling, message formatting, media optimization, and building reliable messaging systems.",
    category: "Best Practices",
    date: "2026-01-25",
    readTime: "7 min read",
    sections: [
      {
        heading: "Rate Limiting and Throttling",
        headingLevel: "h2",
        content: [
          "Implement a message queue to control the rate at which messages are sent. Sending too many messages too quickly can overwhelm the API and trigger rate limits or bans. A simple queue with configurable delay ensures smooth, compliant delivery.",
        ],
        code: {
          language: "javascript",
          snippet: `class MessageQueue {
  constructor(delayMs = 1000) {
    this.queue = [];
    this.delayMs = delayMs;
    this.processing = false;
  }

  add(message) {
    this.queue.push(message);
    if (!this.processing) this.process();
  }

  async process() {
    this.processing = true;
    while (this.queue.length > 0) {
      const msg = this.queue.shift();
      try {
        await this.send(msg);
      } catch (error) {
        console.error("Send failed:", error.message);
        // Re-queue with backoff if needed
      }
      await this.delay(this.delayMs);
    }
    this.processing = false;
  }

  async send(msg) {
    const axios = require("axios");
    return axios.post("https://your-domain.com/api/messages/send", msg, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.WAPISTACK_API_KEY
      }
    });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const queue = new MessageQueue(1500);
queue.add({ deviceId: 1, to: "923001234567", content: "Hello!", type: "text" });`,
        },
      },
      {
        heading: "Error Handling Patterns",
        headingLevel: "h2",
        content: [
          "Robust error handling is essential for production messaging systems. Categorize errors into retriable (network timeouts, 500 errors) and non-retriable (invalid API key, malformed request). Handle each category differently to avoid wasting resources on permanent failures.",
        ],
        code: {
          language: "javascript",
          snippet: `async function sendWithErrorHandling(payload) {
  try {
    const response = await axios.post(BASE_URL, payload, { headers });
    return { success: true, data: response.data };
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    if (status === 401) {
      console.error("Invalid API key. Check WAPISTACK_API_KEY.");
      return { success: false, retriable: false, error: message };
    }

    if (status === 429) {
      console.warn("Rate limited. Slowing down...");
      return { success: false, retriable: true, error: message };
    }

    if (status >= 500) {
      console.warn("Server error. Will retry.");
      return { success: false, retriable: true, error: message };
    }

    console.error("Request failed:", message);
    return { success: false, retriable: false, error: message };
  }
}`,
        },
      },
      {
        heading: "Message Formatting Tips",
        headingLevel: "h2",
        content: [
          "WhatsApp supports basic text formatting that can improve readability. Use *bold* for emphasis, _italic_ for subtle highlights, and ~strikethrough~ for corrections. Combine these to create well-structured, scannable messages.",
          "Keep messages concise and action-oriented. Break long content into multiple shorter messages rather than one wall of text. Use line breaks and bullet points to organize information logically.",
          "Include clear calls to action in every message. Tell the user exactly what you want them to do next, whether it is replying with a keyword, clicking a link, or calling a number.",
        ],
      },
      {
        heading: "Media Optimization",
        headingLevel: "h2",
        content: [
          "Optimize images before sending to reduce delivery time and data usage. Compress images to under 1MB when possible. WhatsApp supports JPEG, PNG, and WebP formats. JPEG is recommended for photographs, while PNG is better for graphics with text.",
          "For documents, keep PDF files under 10MB. Use descriptive filenames that help users identify the document content. Supported document types include PDF, DOC, DOCX, XLS, XLSX, and PPT.",
          "Video files should be compressed to under 16MB and use MP4 format with H.264 encoding for maximum compatibility. Keep videos under 3 minutes for optimal user engagement.",
        ],
      },
      {
        heading: "Retry Logic with Exponential Backoff",
        headingLevel: "h2",
        content: [
          "Implement exponential backoff for retrying failed requests. This prevents overwhelming the API during outages and gives the server time to recover. Cap the maximum number of retries and the maximum delay to avoid indefinite waits.",
        ],
        code: {
          language: "javascript",
          snippet: `async function sendWithRetry(payload, maxRetries = 3) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await axios.post(
        "https://your-domain.com/api/messages/send",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.WAPISTACK_API_KEY
          },
          timeout: 10000
        }
      );
      return response.data;
    } catch (error) {
      lastError = error;
      const status = error.response?.status;

      // Don't retry client errors (except rate limiting)
      if (status && status >= 400 && status < 500 && status !== 429) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delayMs = Math.min(1000 * Math.pow(2, attempt), 10000);
      console.log(\`Retry \${attempt + 1}/\${maxRetries} in \${delayMs}ms\`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}`,
        },
      },
      {
        heading: "Monitoring and Logging",
        headingLevel: "h2",
        content: [
          "Log every API request and response with timestamps, recipient numbers (masked for privacy), message types, and status codes. This data is invaluable for debugging delivery issues and optimizing your messaging strategy.",
          "Track key metrics like delivery success rate, average response time, and error frequency. Set up alerts when error rates exceed thresholds, for example if more than 5% of messages fail in a 10-minute window.",
          "Use structured logging with JSON format so you can easily search and aggregate logs. Include correlation IDs to trace a single message through your entire pipeline from creation to delivery confirmation.",
        ],
      },
    ],
  },
  {
    slug: "whatsapp-api-without-meta-approval",
    title: "How to Use WhatsApp API Without Meta Business Verification",
    description: "Discover how to access a WhatsApp API without waiting for Meta Business approval. Learn the QR-based approach used by QuackAPI and compare it with the official Meta Cloud API.",
    category: "Guide",
    date: "2026-02-20",
    readTime: "7 min read",
    sections: [
      {
        heading: "The Two Paths to WhatsApp API Access",
        headingLevel: "h2",
        content: [
          "If you have searched for a WhatsApp API, you have likely hit a wall: the official Meta WhatsApp Business API requires your business to be verified by Meta, approved as a Business Solution Provider (BSP), and often takes days or weeks before you can send a single message.",
          "But there is a second path — one that developers have been using for years. QR-based WhatsApp APIs work by connecting your existing personal or business WhatsApp account the same way WhatsApp Web does: scan a QR code with your phone and you are live within seconds.",
          "QuackAPI uses this QR-based approach. No Meta Business Manager account. No waiting. No per-message conversation fees from Meta. Just scan and send.",
        ],
      },
      {
        heading: "Why the Official Meta API Requires Approval",
        headingLevel: "h2",
        content: [
          "Meta's WhatsApp Business Platform is designed for large enterprises sending messages at scale using pre-approved message templates. To access it, you must: create a Meta Business Manager account, get your business verified by Meta (requires legal documents), apply for access through a BSP like Twilio or 360dialog, create and get message templates pre-approved before sending.",
          "This process makes sense for enterprises sending millions of marketing messages but is overkill for developers who need to send order confirmations, OTP codes, internal notifications, or customer support messages.",
        ],
      },
      {
        heading: "How QR-Based WhatsApp APIs Work",
        headingLevel: "h2",
        content: [
          "QR-based APIs like QuackAPI use the WhatsApp Web protocol to connect your phone to the cloud. When you scan a QR code in the QuackAPI dashboard, the platform establishes a persistent WebSocket session with WhatsApp's servers — exactly the same as WhatsApp Web in your browser, but hosted and managed by QuackAPI.",
          "Once connected, you get a REST API endpoint to send messages, receive webhooks for incoming messages, and manage multiple WhatsApp numbers independently. The entire setup takes under two minutes.",
        ],
        code: {
          language: "bash",
          snippet: `# Step 1: Create a QuackAPI account at quackapi.com
# Step 2: Add a device in the dashboard
# Step 3: Scan the QR code with your WhatsApp
# Step 4: Copy your API key from Profile Settings
# Step 5: Send your first message

curl -X POST https://quackapi.com/api/messages/send \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: wa_your_api_key_here" \\
  -d '{
    "deviceId": 1,
    "to": "12025551234",
    "content": "Hello from QuackAPI — no Meta approval needed!",
    "type": "text"
  }'`,
        },
      },
      {
        heading: "QR-Based vs Official Meta API: Key Differences",
        headingLevel: "h2",
        content: [
          "Here is a direct comparison to help you choose the right approach for your use case:",
          "Setup time — QR-based (QuackAPI): 2 minutes. Official Meta API: Days to weeks. Business verification — QR-based: None required. Official Meta API: Required (legal documents). Cost — QR-based: Flat monthly ($0-$99). Official Meta API: Per-conversation fees from Meta + BSP markup. Message templates — QR-based: Send any message freely. Official Meta API: Pre-approved templates required for outbound. Multi-device — QR-based: Yes, unlimited. Official Meta API: One number per account.",
          "The official Meta API is the right choice if you are sending high-volume marketing campaigns to opted-in users and need Meta's verified business badge. For everything else — notifications, OTP, support bots, CRM integrations — a QR-based API is faster, cheaper, and simpler.",
        ],
      },
      {
        heading: "Sending Messages with QuackAPI (Node.js Example)",
        headingLevel: "h2",
        content: [
          "Once your WhatsApp is connected via QR, you can send messages from any language or platform using a standard HTTP POST request. Here is a complete Node.js example:",
        ],
        code: {
          language: "javascript",
          snippet: `const axios = require('axios');

async function sendWhatsAppMessage(to, message) {
  const response = await axios.post(
    'https://quackapi.com/api/messages/send',
    {
      deviceId: 1,        // Your connected device ID
      to: to,             // Recipient number with country code
      content: message,
      type: 'text'
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.QUACKAPI_KEY
      }
    }
  );

  console.log('Message sent:', response.data);
  return response.data;
}

// Send an order notification
sendWhatsAppMessage('12025551234', 'Your order #9871 has shipped! Track at: https://track.example.com/9871');`,
        },
      },
      {
        heading: "Receiving Incoming Messages with Webhooks",
        headingLevel: "h2",
        content: [
          "QuackAPI forwards incoming WhatsApp messages to a webhook URL you configure per device. This means you can build support bots, auto-responders, and two-way conversations without any additional setup.",
        ],
        code: {
          language: "javascript",
          snippet: `const express = require('express');
const app = express();
app.use(express.json());

app.post('/webhook/whatsapp', (req, res) => {
  const { from, message } = req.body;

  console.log(\`Message from \${from}: \${message.content}\`);

  // Auto-reply example
  if (message.content.toLowerCase().includes('order')) {
    // Fetch order status and reply
    replyToMessage(from, 'Checking your order status...');
  }

  res.sendStatus(200);
});

app.listen(3000);`,
        },
      },
      {
        heading: "Is Using a QR-Based WhatsApp API Safe?",
        headingLevel: "h2",
        content: [
          "QR-based APIs work through the same encrypted WhatsApp Web protocol your phone uses. Messages are end-to-end encrypted exactly as they would be on your phone. Your session credentials are stored securely by QuackAPI and never shared.",
          "To keep your account in good standing: only message users who have opted in or who have previously contacted you, keep your messaging volume reasonable and consistent with normal usage patterns, avoid sending identical bulk messages to large lists, and respond to replies to maintain healthy engagement signals.",
          "QuackAPI provides a free tier to get started with up to 100 messages per day, which is perfect for testing and low-volume production use. Paid plans unlock higher limits and additional devices.",
        ],
      },
      {
        heading: "Get Started in 2 Minutes",
        headingLevel: "h2",
        content: [
          "Ready to skip the Meta approval queue? Create a free QuackAPI account, scan your QR code, and send your first message in under two minutes. No credit card required, no business verification, no waiting.",
          "Visit quackapi.com to create your free account and get your API key instantly.",
        ],
      },
    ],
  },
  {
    slug: "whatsapp-api-free-alternatives",
    title: "Best Free WhatsApp API Alternatives in 2026 (No Business Account Needed)",
    description: "Compare the best free WhatsApp API options in 2026 including self-hosted open-source solutions and managed services. Find the right fit for your project without requiring a Meta Business account.",
    category: "Comparison",
    date: "2026-02-22",
    readTime: "8 min read",
    sections: [
      {
        heading: "Why Developers Search for Free WhatsApp API Alternatives",
        headingLevel: "h2",
        content: [
          "The official Meta WhatsApp Business API is powerful, but it comes with significant friction: you need a verified Meta Business account, pay per-conversation fees, get messages pre-approved as templates, and wait days or weeks for access. For individual developers, startups, and small businesses, this is a non-starter.",
          "Fortunately, there are several free and low-cost WhatsApp API alternatives available in 2026. This guide covers three categories: self-hosted open-source libraries, managed free-tier services, and when the official Meta API makes sense.",
        ],
      },
      {
        heading: "Option 1: Self-Hosted Open-Source (Free, Technical Setup Required)",
        headingLevel: "h2",
        content: [
          "These are open-source projects you install and run on your own server. They connect to WhatsApp using the same protocol as WhatsApp Web.",
          "whatsapp-web.js (21,000+ GitHub stars) — The most popular Node.js library. Uses Puppeteer to run a headless Chrome browser connected to WhatsApp Web. Great for hobby projects but resource-heavy (needs 500MB+ RAM for Chrome).",
          "Evolution API — A full REST API built on the Baileys library. Supports multi-session, webhooks, media sending, and integrates with tools like Chatwoot and Typebot. Requires Docker knowledge to self-host.",
          "WAHA (WhatsApp HTTP API) — Offers three engine options (browser-based, Node.js WebSocket, Go WebSocket) and a REST API. Simpler setup than Evolution API but still requires a VPS.",
          "The catch: you manage the server, SSL certificates, uptime monitoring, updates, and backups. A basic VPS costs $5–$20/month. If your server goes down, so do your WhatsApp connections.",
        ],
        code: {
          language: "bash",
          snippet: `# Example: Running WAHA with Docker
docker run -it --rm \\
  -p 3000:3000/tcp \\
  devlikeapro/waha

# Send a message via WAHA REST API
curl -X POST http://localhost:3000/api/sendText \\
  -H "Content-Type: application/json" \\
  -d '{
    "chatId": "12025551234@c.us",
    "text": "Hello from WAHA!",
    "session": "default"
  }'`,
        },
      },
      {
        heading: "Option 2: Managed Free Tier — QuackAPI",
        headingLevel: "h2",
        content: [
          "QuackAPI offers a permanently free tier with 100 messages per day and 1 connected WhatsApp device. No credit card required, no Meta Business account, no server management.",
          "You get: a full REST API with examples in 13+ programming languages, per-device webhook configuration for incoming messages, QR-based device linking in under 2 minutes, a web dashboard to monitor messages and devices, and upgrade paths to paid plans when you need more volume.",
          "Compared to self-hosted options, QuackAPI removes all the DevOps overhead. You do not manage a server, handle SSL, or worry about uptime — QuackAPI handles all of that. For most developers, this is the best starting point.",
        ],
        code: {
          language: "python",
          snippet: `import requests
import os

# QuackAPI free tier — 100 messages/day
API_KEY = os.environ['QUACKAPI_KEY']

def send_whatsapp(to: str, message: str):
    response = requests.post(
        'https://quackapi.com/api/messages/send',
        headers={
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
        },
        json={
            'deviceId': 1,
            'to': to,
            'content': message,
            'type': 'text'
        }
    )
    return response.json()

# Works immediately after QR scan — no Meta approval
result = send_whatsapp('12025551234', 'Hello from QuackAPI free tier!')
print(result)  # {"id": 1, "status": "sent"}`,
        },
      },
      {
        heading: "Option 3: Official Meta WhatsApp Cloud API (Free Tier)",
        headingLevel: "h2",
        content: [
          "Meta offers 1,000 free user-initiated conversations per month on the WhatsApp Cloud API. This is genuinely free for low-volume use, but the setup process is complex and time-consuming.",
          "To get started with Meta's official API: create a Meta Business account, add a phone number to WhatsApp Business Platform (must be a number not already on WhatsApp), create message templates and submit for Meta approval (24–72 hours), and integrate using Meta's REST API or an approved BSP.",
          "The official API is ideal if you need a verified green tick badge, access to WhatsApp Flows (interactive in-chat forms), or plan to run large-scale marketing campaigns that require Meta compliance.",
        ],
      },
      {
        heading: "Comparison Table: Free WhatsApp API Options",
        headingLevel: "h2",
        content: [
          "Here is a quick summary to help you choose:",
          "QuackAPI Free Tier — Setup: 2 minutes (QR scan), Requires Meta account: No, Free limit: 100 msg/day, Server management: None, Support: Email, Best for: Developers and startups.",
          "Self-Hosted (WAHA/Evolution API) — Setup: 1–4 hours (Docker/VPS), Requires Meta account: No, Free limit: Unlimited (you pay for server), Server management: Full, Support: GitHub/community, Best for: Technical teams who want full control.",
          "Meta Cloud API — Setup: Days to weeks (verification), Requires Meta account: Yes, Free limit: 1,000 conversations/month, Server management: None, Support: Meta support, Best for: Enterprise marketing campaigns.",
          "For most developers starting out, QuackAPI's free tier is the fastest path from zero to a working WhatsApp integration. Self-hosting makes sense when you have DevOps resources and want maximum control. The official Meta API makes sense when you need scale and compliance.",
        ],
      },
      {
        heading: "Getting Started with QuackAPI for Free",
        headingLevel: "h2",
        content: [
          "Sign up at quackapi.com — no credit card required. Add a device, scan the QR code with your phone, and copy your API key from the Profile Settings page. You will be sending messages within 2 minutes.",
          "The free tier includes 100 messages per day, which is sufficient for testing, low-volume production use, and most personal projects. When you need more, plans start at $29/month with unlimited messages and up to 5 devices.",
        ],
      },
    ],
  },
  {
    slug: "whatsapp-abandoned-cart-recovery",
    title: "WhatsApp Abandoned Cart Recovery: Boost E-commerce Sales by 35%",
    description: "Learn how to implement WhatsApp abandoned cart recovery for your e-commerce store using QuackAPI. See why WhatsApp outperforms email with 98% open rates and step-by-step code examples.",
    category: "E-commerce",
    date: "2026-02-24",
    readTime: "9 min read",
    sections: [
      {
        heading: "Why WhatsApp Abandoned Cart Recovery Works",
        headingLevel: "h2",
        content: [
          "The average e-commerce cart abandonment rate is 70%. That means 7 out of 10 shoppers who add items to their cart leave without buying. Recovering even a fraction of those lost sales has a massive impact on revenue.",
          "Email abandoned cart sequences have been the standard recovery tool for years, but their effectiveness has declined sharply. Email open rates average 21% for e-commerce. WhatsApp open rates average 98%. A message that gets read is a message that can convert.",
          "Studies from businesses using WhatsApp for cart recovery report 25–35% recovery rates on abandoned carts — compared to 5–10% for email sequences. The combination of high visibility, personal feel, and instant delivery makes WhatsApp the most effective channel for cart recovery in 2026.",
        ],
      },
      {
        heading: "How the WhatsApp Cart Recovery Flow Works",
        headingLevel: "h2",
        content: [
          "A typical WhatsApp cart recovery flow has three touchpoints. The first message goes out 30–60 minutes after abandonment: a friendly reminder with the cart contents and a direct link back to checkout. The second message goes out 24 hours later if the cart is still unpurchased: add a small incentive like free shipping or a 5% discount code. The third message goes out 48–72 hours later: create urgency with low stock warnings or a final discount expiry.",
          "The key difference from email: WhatsApp messages feel personal and conversational. Customers can reply directly to ask questions, which creates an engagement loop that further increases conversion.",
        ],
      },
      {
        heading: "Prerequisites: Setting Up QuackAPI for Cart Recovery",
        headingLevel: "h2",
        content: [
          "Before writing any code, connect a WhatsApp device to QuackAPI. This is the number your cart recovery messages will be sent from — ideally your business WhatsApp number.",
          "Log in to quackapi.com, go to Devices, click Add Device, and scan the QR code with your business WhatsApp. This takes about 60 seconds. Then copy your API key from Profile Settings.",
        ],
        code: {
          language: "bash",
          snippet: `# Install required packages
npm install axios

# Set your environment variables
export QUACKAPI_KEY="wa_your_api_key_here"
export QUACKAPI_DEVICE_ID="1"`,
        },
      },
      {
        heading: "Implementing Cart Recovery with Node.js",
        headingLevel: "h2",
        content: [
          "Here is a complete cart recovery implementation. This example assumes you store abandoned carts in your database and have collected the customer's WhatsApp number at checkout entry.",
        ],
        code: {
          language: "javascript",
          snippet: `const axios = require('axios');

const QUACKAPI_KEY = process.env.QUACKAPI_KEY;
const DEVICE_ID = parseInt(process.env.QUACKAPI_DEVICE_ID);

async function sendWhatsApp(to, message) {
  return axios.post(
    'https://quackapi.com/api/messages/send',
    { deviceId: DEVICE_ID, to, content: message, type: 'text' },
    { headers: { 'Content-Type': 'application/json', 'x-api-key': QUACKAPI_KEY } }
  );
}

async function sendCartRecoveryMessage(cart, attempt) {
  const { customerPhone, customerName, items, total, checkoutUrl } = cart;
  const itemList = items.map(i => \`• \${i.name} (x\${i.qty}) — $\${i.price}\`).join('\\n');

  let message;

  if (attempt === 1) {
    message = \`Hi \${customerName}! 👋

You left some items in your cart:
\${itemList}

Total: $\${total}

Your cart is saved — complete your order here:
\${checkoutUrl}

Reply HELP if you have any questions!\`;
  } else if (attempt === 2) {
    message = \`Hi \${customerName}! Your cart is still waiting 🛒

We'd love to offer you FREE SHIPPING on your order of $\${total}.

Use code FREESHIP at checkout:
\${checkoutUrl}

Offer expires in 24 hours.\`;
  } else {
    message = \`Last chance \${customerName}! ⏰

Your cart expires soon. Items are selling fast!

Complete your order now: \${checkoutUrl}

Reply STOP to unsubscribe from cart reminders.\`;
  }

  await sendWhatsApp(customerPhone, message);
  console.log(\`Cart recovery attempt \${attempt} sent to \${customerPhone}\`);
}

// Schedule recovery messages
async function scheduleCartRecovery(cart) {
  // Attempt 1: 30 minutes after abandonment
  setTimeout(() => sendCartRecoveryMessage(cart, 1), 30 * 60 * 1000);

  // Attempt 2: 24 hours later
  setTimeout(() => sendCartRecoveryMessage(cart, 2), 24 * 60 * 60 * 1000);

  // Attempt 3: 72 hours later
  setTimeout(() => sendCartRecoveryMessage(cart, 3), 72 * 60 * 60 * 1000);
}`,
        },
      },
      {
        heading: "Implementing Cart Recovery with Python (Django/Flask)",
        headingLevel: "h2",
        content: [
          "For Python backends using Django or Flask, here is the equivalent implementation using Celery for task scheduling:",
        ],
        code: {
          language: "python",
          snippet: `import requests
import os
from celery import shared_task
from datetime import timedelta

QUACKAPI_KEY = os.environ['QUACKAPI_KEY']
DEVICE_ID = int(os.environ['QUACKAPI_DEVICE_ID'])

def send_whatsapp(phone: str, message: str):
    response = requests.post(
        'https://quackapi.com/api/messages/send',
        headers={'Content-Type': 'application/json', 'x-api-key': QUACKAPI_KEY},
        json={'deviceId': DEVICE_ID, 'to': phone, 'content': message, 'type': 'text'}
    )
    return response.json()

@shared_task
def cart_recovery_attempt_1(cart_id: int):
    from shop.models import Cart
    cart = Cart.objects.get(id=cart_id)
    if cart.is_purchased:
        return  # Already converted, skip

    items = '\\n'.join([f'• {i.name} x{i.qty} — \${i.price}' for i in cart.items.all()])
    message = (
        f"Hi {cart.customer_name}! You left items in your cart:\\n\\n"
        f"{items}\\n\\nTotal: \${cart.total}\\n\\n"
        f"Complete your order: {cart.checkout_url}"
    )
    send_whatsapp(cart.customer_phone, message)

# In your view when a cart is abandoned:
def on_cart_abandoned(cart):
    cart_recovery_attempt_1.apply_async(
        args=[cart.id],
        countdown=1800  # 30 minutes
    )`,
        },
      },
      {
        heading: "Handling Replies and Opt-Outs",
        headingLevel: "h2",
        content: [
          "Set up a webhook in your QuackAPI device settings to receive customer replies. When someone replies STOP, cancel any pending recovery tasks and mark them as opted out. This is both good practice and essential for maintaining trust.",
        ],
        code: {
          language: "javascript",
          snippet: `app.post('/webhook/whatsapp', async (req, res) => {
  const { from, message } = req.body;

  if (message.content.toUpperCase().trim() === 'STOP') {
    await db.optOutFromCartRecovery(from);
    await sendWhatsApp(from, "You've been unsubscribed from cart reminders. Reply START to re-enable.");
  } else if (message.content.toUpperCase().trim() === 'HELP') {
    await sendWhatsApp(from, "Need help with your order? Our team will contact you within 1 hour. Or email us at support@yourstore.com");
  }

  res.sendStatus(200);
});`,
        },
      },
      {
        heading: "Expected Results and Benchmarks",
        headingLevel: "h2",
        content: [
          "Based on industry data from businesses running WhatsApp cart recovery in 2026: message open rate averages 94–98% (vs 21% for email), click-through rate on recovery links averages 35–45% (vs 8–12% for email), cart recovery rate averages 25–35% of abandoned carts (vs 5–10% for email), and ROI typically exceeds 10x the cost of the WhatsApp API subscription within the first month.",
          "Start with the free QuackAPI tier (100 messages/day) to test your recovery flow before scaling. Once you validate the conversion rate with your audience, upgrade to a paid plan to send unlimited recovery messages.",
          "Sign up free at quackapi.com — no credit card, no Meta Business account, start sending in 2 minutes.",
        ],
      },
    ],
  },
  {
    slug: "best-whatsapp-api-provider-2026",
    title: "Best WhatsApp API Provider in 2026: Full Comparison",
    description: "We compared 6 WhatsApp API providers on pricing, setup speed, features, and reliability. Here is which platform wins for developers, startups, and growing businesses.",
    category: "Comparison",
    date: "2026-03-14",
    readTime: "8 min read",
    sections: [
      {
        heading: "What Makes a Great WhatsApp API Provider?",
        headingLevel: "h2",
        content: [
          "Choosing the right WhatsApp API provider in 2026 comes down to four factors: how fast you can get started, how predictably it is priced, how well it handles multiple devices, and how much developer support you get. Most providers fail on at least two of these.",
          "The Official WhatsApp Business API (via Meta) requires business verification that takes days or weeks, per-conversation pricing that scales unpredictably, and template approval for every message type. For small teams and startups, that is a conversion killer.",
          "Alternative providers use the WhatsApp Web protocol — the same technology your browser uses — to offer instant setup, flat monthly pricing, and no Meta approval requirement. Let us compare the best options available right now.",
        ],
      },
      {
        heading: "Comparison Table: Top WhatsApp API Providers 2026",
        headingLevel: "h2",
        content: [
          "Here is how the top providers compare across the criteria that matter most. Prices reflect the entry-level paid tier as of March 2026:",
          "QuackAPI: $0 free / $29 Pro / $99 Enterprise — Setup in 2 minutes via QR — No Meta approval — 8 message types — 13+ language docs — Multi-device — Flat pricing",
          "Twilio: Pay-per-message ($0.005–$0.05) — Requires Meta Business approval — Template restrictions — Excellent docs — No multi-device — Variable pricing",
          "WATI: From $49/mo + conversation fees — Requires Meta approval — Good no-code tools — Limited API access — No multi-device",
          "UltraMsg: From $13/mo — No free tier — 6 message types — Limited docs — Basic multi-device",
          "AiSensy: From $19/mo + Meta conversation fees — Meta required — No-code marketing tools — Limited REST API",
          "Evolution API: Free open-source — Self-hosted (you manage servers) — Community support — Full API — Multi-device",
          "For developers who need a quick start, predictable billing, and solid API documentation, [QuackAPI](/pricing) consistently ranks first. For no-code marketers with existing Meta Business accounts, WATI or AiSensy may fit better.",
        ],
      },
      {
        heading: "QuackAPI: Best for Developers and Startups",
        headingLevel: "h2",
        content: [
          "QuackAPI stands out as the best WhatsApp API for developers in 2026 because it eliminates the two biggest friction points: approval delays and variable pricing. You scan a QR code, get an API key, and start sending in under 2 minutes.",
          "The free Starter plan (100 messages/day, 1 device) lets you build and validate before spending anything. The Professional plan at $29/month gives you 5 devices and 1,000 messages/day — enough for most production workloads. Enterprise at $99/month provides unlimited everything with a guaranteed SLA.",
          "The API documentation covers 13 programming languages including Python, Node.js, PHP, Go, Ruby, Java, and more. See the [Python integration guide](/blog/send-whatsapp-messages-python) and [Node.js guide](/blog/send-whatsapp-messages-nodejs) for quick-start examples.",
        ],
      },
      {
        heading: "Twilio: Best for Enterprise With Existing Meta Approval",
        headingLevel: "h2",
        content: [
          "Twilio's WhatsApp API is excellent if you already have Meta Business Manager approval and send high volumes where per-message costs are predictable. The platform documentation is world-class, and Twilio's reliability and global support are unmatched.",
          "The downside: per-message pricing can hit $0.05+ per conversation in some regions, approval takes days, and you can only use pre-approved message templates until you reach certain usage tiers. For a direct cost analysis, see our [QuackAPI vs Twilio comparison](/compare/twilio).",
        ],
      },
      {
        heading: "Evolution API: Best for Self-Hosters",
        headingLevel: "h2",
        content: [
          "Evolution API is the leading open-source WhatsApp API project in 2026. It is fully free, supports multiple devices, and has a growing community. The catch: you manage your own server, SSL, uptime, database backups, and software updates.",
          "If you have DevOps capacity and want zero software cost, Evolution API is compelling. If you want managed infrastructure and support SLAs, QuackAPI is the better choice. Read our [QuackAPI vs Evolution API comparison](/compare/evolution-api) for the detailed breakdown.",
        ],
      },
      {
        heading: "Provider Comparison at a Glance",
        headingLevel: "h2",
        content: [
          "The table below summarizes the most important dimensions across the five providers covered in this guide. Use it to make a quick decision before reading the detailed sections.",
        ],
        table: {
          headers: ["Provider", "Setup Time", "Meta Approval?", "Pricing Model", "Best For"],
          rows: [
            ["QuackAPI", "< 2 min (QR code)", "No", "Flat $0–$99/mo", "Developers, SMBs, agencies"],
            ["Twilio", "1–3 days (API key)", "Yes (required)", "Per-conversation", "Enterprise, high compliance"],
            ["UltraMsg", "~5 min (QR code)", "No", "Flat $14–$57/mo", "Single-device, budget use"],
            ["WATI", "2–5 days (Meta)", "Yes (required)", "Per-seat + Meta fees", "Sales/support teams"],
            ["Evolution API", "1–2 hours (self-host)", "No", "Free (self-hosted)", "DevOps teams, cost-zero"],
          ],
        },
      },
      {
        heading: "How to Get Started with QuackAPI in Under 5 Minutes",
        headingLevel: "h2",
        content: [
          "The fastest path to a working WhatsApp API in 2026 is QuackAPI. Here is the exact process: (1) Create a free account at quackapi.com — no credit card required. (2) Click 'Add Device' and scan the QR code with WhatsApp on your phone or business number. (3) Copy your API key from the dashboard. (4) Send your first message with a single HTTP POST request.",
          "The API follows REST conventions with JSON request and response bodies. Authentication uses an API key in the `x-api-key` header. Message sending, receiving webhooks, multi-device management, and media uploads are all covered in the [API documentation](/docs).",
          "Most developers have their integration sending real messages within 10 minutes of account creation. Compare that with the 1–5 day approval process required for Twilio and Meta-based providers. For e-commerce automation use cases, see [WhatsApp e-commerce flows](/use-cases/ecommerce).",
          "Once your integration is validated on the free tier, upgrading to Professional ($29/month) takes one click — there is no re-approval process, no new QR scan required, and your existing device and API key continue working at the higher limits.",
        ],
      },
      {
        heading: "Our Recommendation",
        headingLevel: "h2",
        content: [
          "For most developers and startups in 2026: start with QuackAPI's free tier, validate your use case, then upgrade to Professional. The combination of instant setup, flat pricing, multi-device support, and 13-language API documentation makes it the most developer-friendly choice available.",
          "For large enterprises with existing Meta Business verification who need SLA guarantees and are comfortable with per-message pricing: Twilio is the safe choice.",
          "For technically capable teams that want full control and zero software cost: Evolution API, knowing you will invest engineering time in infrastructure management.",
        ],
      },
      {
        heading: "Frequently Asked Questions",
        headingLevel: "h2",
        content: [],
        faq: [
          { question: "Is there a free WhatsApp API?", answer: "Yes — QuackAPI offers a permanent free Starter plan with 100 messages/day and 1 device. No credit card required. See our [WhatsApp API pricing guide](/blog/whatsapp-api-pricing-2026) for the full breakdown." },
          { question: "Do I need a Meta Business account?", answer: "Not with QuackAPI, UltraMsg, or Evolution API. These providers use the WhatsApp Web protocol, so you connect any personal or business WhatsApp number via QR code. Twilio, WATI, and AiSensy require Meta Business verification." },
          { question: "How reliable are non-official WhatsApp API providers?", answer: "QuackAPI, UltraMsg, and Evolution API all use the same WhatsApp Web protocol your browser uses. Reliability depends on the provider's infrastructure. QuackAPI maintains 99.9% uptime on its Enterprise plan. See [WhatsApp automation use cases](/use-cases/automation) for real-world deployments." },
          { question: "Can I send bulk messages via WhatsApp API?", answer: "Yes, but you should follow anti-spam best practices to avoid account bans. Read our [bulk WhatsApp messaging guide](/blog/send-bulk-whatsapp-messages) for safe limits and best practices." },
        ],
      },
    ],
  },
  {
    slug: "whatsapp-api-pricing-2026",
    title: "WhatsApp API Pricing in 2026: Complete Cost Breakdown",
    description: "Full breakdown of WhatsApp API costs in 2026. Covers official Meta pricing, third-party providers, free tiers, and which option is cheapest for your message volume.",
    category: "Guide",
    date: "2026-03-15",
    readTime: "7 min read",
    sections: [
      {
        heading: "The Two WhatsApp API Pricing Models",
        headingLevel: "h2",
        content: [
          "There are two fundamentally different pricing models for WhatsApp API in 2026: conversation-based pricing (official Meta Business API) and flat monthly subscription pricing (third-party providers like QuackAPI).",
          "Understanding which model fits your use case can save you thousands of dollars per year — especially as your message volume grows.",
        ],
      },
      {
        heading: "Official Meta WhatsApp Business API Pricing",
        headingLevel: "h2",
        content: [
          "Meta charges per 24-hour conversation window, not per message. A conversation is opened when you send or receive a message and remains open for 24 hours. Additional messages within that window do not incur extra charges.",
          "Pricing varies by country and conversation type (marketing, utility, authentication, service). In the US, marketing conversations cost approximately $0.025 each. In India, they cost approximately $0.004 each. Authentication conversations (OTP) cost approximately $0.014 in the US.",
          "Meta also offers 1,000 free service conversations per month (when the customer initiates the conversation). Business-initiated conversations (marketing, utility, authentication) are not free.",
          "For a business sending 10,000 marketing conversations per month in the US, the Meta API cost alone is ~$250/month — before Twilio or BSP markup, which typically adds 30–100% on top.",
        ],
      },
      {
        heading: "Third-Party WhatsApp API Pricing (Flat Monthly)",
        headingLevel: "h2",
        content: [
          "Providers like QuackAPI use the WhatsApp Web protocol, which allows flat monthly pricing with no per-message or per-conversation fees. You pay a fixed amount per month regardless of how many messages you send (up to the plan limit).",
          "QuackAPI pricing tiers in 2026: Free Starter ($0/month — 100 messages/day, 1 device), Professional ($29/month — 1,000 messages/day, 5 devices), Enterprise ($99/month — unlimited messages, unlimited devices).",
          "For most small-to-medium businesses, $29/month flat covers far more usage than equivalent Meta API costs. A business sending 5,000 messages/month through the Meta API in the US would pay ~$125/month — versus $29/month with QuackAPI.",
          "See our [full comparison of providers](/blog/best-whatsapp-api-provider-2026) for a side-by-side breakdown of all options.",
        ],
      },
      {
        heading: "Is There a Free WhatsApp API?",
        headingLevel: "h2",
        content: [
          "Yes. QuackAPI offers a permanent free Starter plan — not a trial — with 100 messages/day and 1 device. This is enough to build and test your integration, run low-volume use cases like OTP verification, or send alerts to a small team.",
          "Meta also offers free service conversations (1,000/month) for inbound-initiated conversations, but this requires completing the Meta Business verification process first. If you want to skip the Meta approval process entirely, see our [WhatsApp API without Meta approval guide](/blog/whatsapp-api-without-meta-approval). For a comparison of all free and low-cost options, see [WhatsApp API free alternatives](/blog/whatsapp-api-free-alternatives).",
          "Evolution API is free open-source software with no message limits, but you pay for your own server (typically $5–20/month for a VPS) and handle all infrastructure yourself.",
        ],
      },
      {
        heading: "Calculating Your WhatsApp API Cost",
        headingLevel: "h2",
        content: [
          "To estimate your monthly cost: first determine your monthly message volume and device count. If you need fewer than 1,000 messages/day across up to 5 WhatsApp numbers, the [QuackAPI Professional plan at $29/month](/pricing) covers you with full REST API access and webhooks.",
          "If you send fewer than 100 messages/day and only need 1 device, the free tier is sufficient. Start there and upgrade only when you hit the limits.",
          "If your use case requires Meta Business API specifically (for template messages, green tick verification, or WhatsApp Pay), budget for Meta conversation fees plus a BSP (Business Solution Provider) fee, typically $50–500/month depending on volume.",
        ],
      },
      {
        heading: "WhatsApp API Pricing Comparison Table (2026)",
        headingLevel: "h2",
        content: [
          "The table below compares the most popular WhatsApp API providers on pricing, limits, and key capabilities to help you choose the right plan for your volume and budget.",
        ],
        table: {
          headers: ["Provider", "Free Tier", "Entry Paid Plan", "Per-Message Fee", "Devices", "Meta Approval?"],
          rows: [
            ["QuackAPI Starter", "100 msg/day, 1 device", "—", "None", "1", "No"],
            ["QuackAPI Professional", "—", "$29/month", "None", "5", "No"],
            ["QuackAPI Enterprise", "—", "$99/month", "None", "Unlimited", "No"],
            ["Meta Cloud API", "1,000 service conv/mo", "Meta fee only", "$0.01–$0.05/conv", "N/A (Business ID)", "Yes"],
            ["Twilio WhatsApp", "None", "~$15/month base", "$0.005–$0.05/msg", "N/A (Business ID)", "Yes"],
            ["UltraMsg", "None", "$14/month", "None", "1", "No"],
            ["Evolution API (self-host)", "Unlimited (self-hosted)", "Free", "None", "Unlimited", "No"],
          ],
        },
      },
      {
        heading: "Hidden Costs to Watch For",
        headingLevel: "h2",
        content: [
          "With Meta API providers: conversation fees stack up quickly during marketing campaigns. A single blast to 10,000 contacts in the US costs ~$250 in Meta fees alone, before BSP markup.",
          "With self-hosted solutions (Evolution API): server costs, SSL certificate management, database backups, monitoring, and software update time are real costs that rarely show up in comparisons.",
          "With flat-rate providers: watch the message/day limits. Sending 1,001 messages on a 1,000/day plan may throttle or block your account depending on the provider. QuackAPI queues excess messages for the next day.",
        ],
      },
      {
        heading: "ROI: When Does WhatsApp API Pay for Itself?",
        headingLevel: "h2",
        content: [
          "For e-commerce: a store with 200 orders/month and a 70% cart abandonment rate has ~140 abandoned carts. Recovering 15% of those via WhatsApp at an average order value of $85 generates $1,785 in additional revenue — against a $29/month API cost. The ROI is over 60x.",
          "For customer support: a support team handling 500 tickets/month via WhatsApp instead of phone calls reduces average handle time by 40% because agents can manage multiple conversations simultaneously. If each agent handles 20% more tickets per day, the team effectively gains 1 additional FTE of capacity.",
          "For appointment-based businesses: WhatsApp appointment reminders reduce no-shows by 30–50%. For a dentist with 200 appointments/month at $150 each and a 20% no-show rate, reducing no-shows by half saves 20 appointments — $3,000/month in recovered revenue against $29 API cost.",
          "For SaaS onboarding: automated WhatsApp sequences for new trial users that prompt feature adoption and offer live support convert 12–18% higher than email-only onboarding flows, according to internal data from QuackAPI customers on the Professional plan.",
          "See [WhatsApp automation use cases](/use-cases/automation) for more ROI examples across industries.",
        ],
      },
      {
        heading: "Frequently Asked Questions",
        headingLevel: "h2",
        content: [],
        faq: [
          { question: "What is the cheapest WhatsApp API for a startup?", answer: "QuackAPI's free Starter plan (100 msg/day) is the cheapest entry point. For higher volumes, $29/month Professional beats Meta API costs for most use cases. See [e-commerce WhatsApp use cases](/use-cases/ecommerce) for how businesses justify the cost." },
          { question: "Does WhatsApp charge per message?", answer: "The official Meta API charges per conversation (24-hour window), not per individual message. Third-party providers like QuackAPI charge a flat monthly fee with no per-message costs." },
          { question: "Can I use WhatsApp API for free forever?", answer: "Yes, with QuackAPI's free tier (100 messages/day, 1 device). There is no expiry or forced trial conversion." },
          { question: "Is WhatsApp API worth the cost?", answer: "For businesses, yes — WhatsApp messages have a 98% open rate versus 21% for email. A single recovered abandoned cart or confirmed appointment often covers the entire monthly API cost. See our [WhatsApp marketing guide](/blog/whatsapp-marketing-api-guide) for ROI data." },
        ],
      },
    ],
  },
  {
    slug: "send-bulk-whatsapp-messages",
    title: "How to Send Bulk WhatsApp Messages via API (2026 Guide)",
    description: "Complete guide to bulk WhatsApp messaging via REST API. Covers rate limits, anti-ban best practices, code examples in Python and Node.js, and scheduling strategies.",
    category: "Tutorial",
    date: "2026-03-16",
    readTime: "9 min read",
    sections: [
      {
        heading: "What Is Bulk WhatsApp Messaging?",
        headingLevel: "h2",
        content: [
          "Bulk WhatsApp messaging means sending a large number of messages — promotions, notifications, alerts, or updates — to many recipients in a short time. Unlike email blasts, WhatsApp messages have a 98% open rate and typically get read within 3 minutes.",
          "However, WhatsApp actively monitors for spam behavior and will ban accounts that send bulk messages without following best practices. This guide covers how to send bulk messages safely and effectively using QuackAPI's REST API.",
          "Before you start: read our [WhatsApp API pricing guide](/blog/whatsapp-api-pricing-2026) to understand the cost structure, and our [best practices guide](/blog/whatsapp-api-messaging-best-practices) for safe messaging.",
        ],
      },
      {
        heading: "Setting Up for Bulk Messaging",
        headingLevel: "h2",
        content: [
          "You need a QuackAPI account and at least one connected WhatsApp device. For high-volume bulk sends (10,000+ messages/day), use the Professional or Enterprise plan with multiple devices — spreading messages across 5 devices reduces the per-device rate and lowers ban risk.",
          "Get your API key from your QuackAPI dashboard and note your device IDs. You will rotate messages across devices in your bulk send script.",
        ],
        code: {
          language: "python",
          snippet: `import os
import time
import requests

API_KEY = os.environ["QUACKAPI_KEY"]
BASE_URL = "https://quackapi.com/api/messages/send"
DEVICE_IDS = [1, 2, 3]  # Your connected device IDs

headers = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY
}`,
        },
      },
      {
        heading: "Rate-Limited Bulk Send with Device Rotation",
        headingLevel: "h2",
        content: [
          "The safest approach rotates messages across multiple devices and adds a small random delay between sends. WhatsApp's algorithm looks for unnaturally uniform send patterns — randomizing delays (1–5 seconds between messages) mimics human behavior and significantly reduces ban risk.",
        ],
        code: {
          language: "python",
          snippet: `import random

def send_bulk(recipients: list[str], message: str):
    """Send a message to a list of phone numbers with rate limiting."""
    for i, phone in enumerate(recipients):
        device_id = DEVICE_IDS[i % len(DEVICE_IDS)]
        payload = {
            "deviceId": device_id,
            "to": phone,
            "content": message,
            "type": "text"
        }
        try:
            resp = requests.post(BASE_URL, json=payload, headers=headers)
            resp.raise_for_status()
            print(f"Sent to {phone} via device {device_id}")
        except Exception as e:
            print(f"Failed for {phone}: {e}")

        # Random delay: 1–5 seconds between messages
        time.sleep(random.uniform(1, 5))

# Example: send to 500 contacts
contacts = ["+15551234567", "+15559876543"]  # your list
send_bulk(contacts, "Hello! Your order has shipped.")`,
        },
      },
      {
        heading: "Node.js Bulk Messaging with Queue",
        headingLevel: "h2",
        content: [
          "For production Node.js applications, use a queue-based approach to avoid overwhelming the API and to handle retries automatically. This example uses a simple promise chain for sequential sending:",
        ],
        code: {
          language: "javascript",
          snippet: `const axios = require('axios');

const API_KEY = process.env.QUACKAPI_KEY;
const BASE_URL = 'https://quackapi.com/api/messages/send';
const DEVICE_IDS = [1, 2, 3];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function sendBulk(recipients, message) {
  for (let i = 0; i < recipients.length; i++) {
    const deviceId = DEVICE_IDS[i % DEVICE_IDS.length];
    try {
      await axios.post(BASE_URL, {
        deviceId,
        to: recipients[i],
        content: message,
        type: 'text'
      }, {
        headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' }
      });
      console.log(\`Sent to \${recipients[i]}\`);
    } catch (err) {
      console.error(\`Failed: \${recipients[i]} — \${err.message}\`);
    }
    // Random delay 1–4 seconds
    await sleep(1000 + Math.random() * 3000);
  }
}`,
        },
      },
      {
        heading: "Anti-Ban Best Practices for Bulk WhatsApp",
        headingLevel: "h2",
        content: [
          "Only message people who have opted in to receive WhatsApp messages from you. Sending to cold lists is the fastest way to get reported and banned.",
          "Start slowly: if you have a new WhatsApp number, warm it up by sending 50–100 messages on day 1, 200–300 on day 2, and gradually increasing. Do not send thousands of messages from a fresh number.",
          "Personalize messages. Generic broadcast messages get reported at higher rates. Include the recipient's name at minimum.",
          "Honor opt-outs immediately. Include a reply keyword like 'STOP' and remove anyone who uses it from future sends.",
          "Spread sends across devices. The [QuackAPI Professional plan](/pricing) supports 5 devices — use all of them to distribute your daily volume.",
          "Avoid sending at unusual hours. Local daytime hours (9am–7pm in the recipient's timezone) have lower report rates than middle-of-night sends.",
        ],
      },
      {
        heading: "Scheduling Bulk Sends with Cron",
        headingLevel: "h2",
        content: [
          "For recurring bulk sends (daily promotions, weekly newsletters), schedule your bulk send function using a cron job. This approach ensures you stay within daily limits and sends at optimal times.",
        ],
        code: {
          language: "python",
          snippet: `# Using APScheduler for timed bulk sends
from apscheduler.schedulers.blocking import BlockingScheduler

scheduler = BlockingScheduler()

@scheduler.scheduled_job('cron', hour=10, minute=0)
def daily_promo():
    """Run every day at 10am."""
    contacts = load_contacts_from_db()
    send_bulk(contacts, "Today's offer: 20% off all orders!")

scheduler.start()`,
        },
      },
      {
        heading: "High-Converting Bulk Message Templates",
        headingLevel: "h2",
        content: [
          "The message template you use dramatically affects delivery, open, and conversion rates. Generic broadcast messages get reported and ignored. Personalized, relevant, well-timed messages convert 3–5x better.",
          "Abandoned cart recovery template (highest ROI): 'Hi {first_name}! You left {product} in your cart. It's still available for the next 24 hours: {cart_url}. Reply HELP for assistance.' This template converts at 25–35% — far higher than email equivalents. Use the [QuackAPI API](/docs) to send this immediately when your cart abandonment webhook fires.",
          "Order confirmation template: 'Hi {first_name}! Order #{order_id} confirmed. Total: {currency}{amount}. We'll message you when it ships! — {store_name}.' Customers actually read these — 98% open rate means nearly every confirmation is seen.",
          "Promotional announcement template: 'Hi {first_name}! {discount}% off today only for members. Use code {promo_code} at checkout: {link}. Reply STOP to unsubscribe.' Always include an opt-out mechanism. This alone reduces your report rate by 60% versus messages without it.",
          "Reactivation campaign template: 'Hi {first_name}! It's been 30 days since your last visit. Here's 15% off to welcome you back: {link}. Expires in 48 hours.' Reactivation campaigns via WhatsApp see 20–30% conversion rates versus 3–5% via email.",
        ],
      },
      {
        heading: "Monitoring and Rate Limit Management",
        headingLevel: "h2",
        content: [
          "Configure a QuackAPI webhook to receive delivery receipts for every sent message. A delivery receipt tells you whether the message was delivered to the device and read. Track these metrics: delivery rate (target 95%+), read rate (WhatsApp averages 80%+), and reply rate.",
          "If delivery rate drops below 90%, slow down your send rate — WhatsApp may be throttling your number. If you see a spike in undelivered messages, check whether the recipient numbers are valid WhatsApp accounts before sending. See [WhatsApp notification use cases](/use-cases/notifications) for monitoring dashboard examples.",
          "For the QuackAPI Professional plan (5 devices, 1,000 msg/day/device), the maximum daily throughput is 5,000 messages. Spread sends evenly across devices using round-robin selection in your code. If you exceed the daily limit, QuackAPI queues the overflow for the following day rather than dropping messages — this protects your campaigns without data loss.",
          "Set up alerting in your application for failed sends. Log each API response and alert your team if the failure rate exceeds 5% over a 30-minute window. This indicates a potential account issue that needs prompt attention.",
        ],
      },
      {
        heading: "Frequently Asked Questions",
        headingLevel: "h2",
        content: [],
        faq: [
          { question: "How many WhatsApp messages can I send per day?", answer: "QuackAPI's Professional plan allows 1,000 messages/day per device. With 5 devices, that is 5,000 messages/day. Enterprise allows unlimited sends. See [WhatsApp notification use cases](/use-cases/notifications) for typical volume benchmarks." },
          { question: "Will WhatsApp ban my account for bulk messaging?", answer: "Only if you send to non-opted-in recipients, send at inhuman speeds, or receive high report rates. Follow the best practices above and the risk is low." },
          { question: "Can I send the same message to 10,000 people?", answer: "Yes, but spread it over multiple days for new accounts. Established accounts with good engagement history can send more per day." },
          { question: "Do I need separate WhatsApp numbers for bulk sends?", answer: "Using multiple numbers (devices) distributes load and reduces per-device volume. The [Professional plan at $29/month](/pricing) includes 5 devices — enough for most bulk campaigns." },
        ],
      },
    ],
  },
  {
    slug: "whatsapp-api-shopify-integration",
    title: "WhatsApp API Shopify Integration: Order Notifications & Abandoned Cart",
    description: "Step-by-step guide to integrating WhatsApp API with Shopify. Send order confirmations, shipping updates, and abandoned cart recovery messages via QuackAPI webhooks.",
    category: "Integration",
    date: "2026-03-17",
    readTime: "10 min read",
    sections: [
      {
        heading: "Why WhatsApp for Shopify?",
        headingLevel: "h2",
        content: [
          "Email open rates for Shopify order notifications average 21%. WhatsApp open rates average 98%. Switching your order notifications to WhatsApp means your customers actually see their shipping updates, order confirmations, and delivery alerts.",
          "More importantly, abandoned cart recovery via WhatsApp converts at 25–35% (vs 5–10% for email). For a store doing $50,000/month with a 70% cart abandonment rate, recovering even 10% of abandoned carts adds $5,000 in monthly revenue.",
          "This guide shows you how to connect QuackAPI to Shopify using Shopify Webhooks — no extra app needed, just a few lines of code on your server. For full bulk messaging details, see [how to send bulk WhatsApp messages](/blog/send-bulk-whatsapp-messages).",
        ],
      },
      {
        heading: "Architecture Overview",
        headingLevel: "h2",
        content: [
          "The integration works via Shopify Webhooks → your server → QuackAPI. Shopify fires an HTTP webhook to your server whenever an order is placed, shipped, or cancelled, and whenever a cart is abandoned. Your server receives the webhook, extracts the customer's phone number, and calls QuackAPI to send a WhatsApp message.",
          "You need: a QuackAPI account (free tier works for testing), a connected WhatsApp device, and a server to receive Shopify webhooks (Node.js, Python, PHP — all work). The [QuackAPI REST API](/docs) makes sending the message a single HTTP POST request.",
        ],
      },
      {
        heading: "Step 1: Set Up Your Shopify Webhook Receiver",
        headingLevel: "h2",
        content: [
          "Create a webhook endpoint on your server that Shopify can POST to. This Node.js example using Express handles order creation and sends a WhatsApp confirmation:",
        ],
        code: {
          language: "javascript",
          snippet: `const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const QUACKAPI_KEY = process.env.QUACKAPI_KEY;
const DEVICE_ID = process.env.QUACKAPI_DEVICE_ID;

// Shopify sends order data to this endpoint
app.post('/webhooks/shopify/order-created', async (req, res) => {
  const order = req.body;

  const phone = order.shipping_address?.phone
    || order.billing_address?.phone;

  if (!phone) {
    return res.status(200).json({ skipped: 'no phone' });
  }

  const orderNumber = order.order_number;
  const firstName = order.shipping_address?.first_name || 'there';
  const total = order.total_price;
  const currency = order.currency;

  const message = \`Hi \${firstName}! Your order #\${orderNumber} has been confirmed. Total: \${currency} \${total}. We will send you tracking info as soon as it ships! — Your Store\`;

  await axios.post('https://quackapi.com/api/messages/send', {
    deviceId: parseInt(DEVICE_ID),
    to: phone.replace(/[^0-9]/g, ''),
    content: message,
    type: 'text'
  }, {
    headers: { 'x-api-key': QUACKAPI_KEY }
  });

  res.status(200).json({ sent: true });
});

app.listen(3000);`,
        },
      },
      {
        heading: "Step 2: Register Webhooks in Shopify Admin",
        headingLevel: "h2",
        content: [
          "Go to Shopify Admin → Settings → Notifications → Webhooks. Click 'Create webhook' and register these events pointing to your server's HTTPS endpoint:",
          "orders/create → https://yourdomain.com/webhooks/shopify/order-created",
          "orders/fulfilled → https://yourdomain.com/webhooks/shopify/order-fulfilled",
          "checkouts/create → https://yourdomain.com/webhooks/shopify/cart-created (for abandoned cart tracking)",
          "Make sure your server is accessible via HTTPS. If developing locally, use ngrok to expose your local port publicly for testing.",
        ],
      },
      {
        heading: "Step 3: Abandoned Cart Recovery",
        headingLevel: "h2",
        content: [
          "Abandoned cart recovery requires a time-delayed message. When Shopify fires the `checkouts/create` webhook, store the cart data and phone number. After 1 hour without an order, send a recovery WhatsApp message.",
        ],
        code: {
          language: "javascript",
          snippet: `const pendingCarts = new Map();

app.post('/webhooks/shopify/cart-created', async (req, res) => {
  const checkout = req.body;
  const phone = checkout.shipping_address?.phone;
  if (!phone) return res.json({ skipped: true });

  // Store the cart, check back in 1 hour
  pendingCarts.set(checkout.token, { phone, checkout });

  setTimeout(async () => {
    const pending = pendingCarts.get(checkout.token);
    if (!pending) return; // Cart was purchased — cleared

    const { phone, checkout } = pending;
    const total = checkout.total_price;
    const firstName = checkout.shipping_address?.first_name || 'there';

    await axios.post('https://quackapi.com/api/messages/send', {
      deviceId: parseInt(DEVICE_ID),
      to: phone.replace(/[^0-9]/g, ''),
      content: \`Hi \${firstName}, you left \${total} worth of items in your cart! Complete your order here: \${checkout.abandoned_checkout_url}\`,
      type: 'text'
    }, {
      headers: { 'x-api-key': QUACKAPI_KEY }
    });
  }, 60 * 60 * 1000); // 1 hour delay

  res.json({ queued: true });
});

// When an order is placed, cancel the recovery message
app.post('/webhooks/shopify/order-created', async (req, res) => {
  const token = req.body.checkout_token;
  pendingCarts.delete(token); // Cancel recovery
  // ... send confirmation message
  res.json({ ok: true });
});`,
        },
      },
      {
        heading: "Step 4: Shipping Notifications",
        headingLevel: "h2",
        content: [
          "Register a webhook for `orders/fulfilled` and send a tracking link message. Shopify includes the tracking URL in the fulfillment data:",
        ],
        code: {
          language: "javascript",
          snippet: `app.post('/webhooks/shopify/order-fulfilled', async (req, res) => {
  const order = req.body;
  const phone = order.shipping_address?.phone;
  if (!phone) return res.json({ skipped: true });

  const trackingUrl = order.fulfillments?.[0]?.tracking_url || '';
  const firstName = order.shipping_address?.first_name || 'there';

  await axios.post('https://quackapi.com/api/messages/send', {
    deviceId: parseInt(DEVICE_ID),
    to: phone.replace(/[^0-9]/g, ''),
    content: \`Hi \${firstName}! Your order has shipped. Track it here: \${trackingUrl}\`,
    type: 'text'
  }, { headers: { 'x-api-key': QUACKAPI_KEY } });

  res.json({ sent: true });
});`,
        },
      },
      {
        heading: "WhatsApp Message Templates for Shopify",
        headingLevel: "h2",
        content: [
          "Your message copy is as important as the technical integration. Here are proven templates for each Shopify notification type, optimized for WhatsApp's conversational format.",
          "Order confirmation: 'Hi {first_name}! Your order #{order_number} has been confirmed. Total: {currency} {total}. We will message you when it ships. Thank you for shopping with {store_name}!'",
          "Shipping notification with tracking: 'Hi {first_name}! Great news — your order has shipped! Track your package here: {tracking_url}. Expected delivery: {estimated_date}. Questions? Just reply to this message.'",
          "Abandoned cart recovery (sent 1 hour after abandonment): 'Hi {first_name}! You left something in your cart. Your {product_name} is still available: {cart_url}. Need help choosing? Reply and we'll assist. This link expires in 24 hours.'",
          "Post-purchase review request (sent 7 days after delivery): 'Hi {first_name}! We hope you are loving your {product_name}! Would you mind leaving us a quick review? It takes 30 seconds and really helps: {review_url}. Thank you!'",
          "Keep messages under 1,024 characters for optimal display. Test templates in the [WhatsApp preview tool](/docs) before deploying to production. See [WhatsApp marketing best practices](/blog/whatsapp-marketing-api-guide) for additional template guidance.",
        ],
      },
      {
        heading: "Compliance: GDPR, TCPA, and WhatsApp ToS",
        headingLevel: "h2",
        content: [
          "Before sending any WhatsApp messages to Shopify customers, you need explicit opt-in consent. The safest approach is to add a checkbox to your Shopify checkout: 'Send me order updates and offers via WhatsApp' — unchecked by default. Store the consent timestamp in your order metadata.",
          "Under GDPR (EU/UK), you must be able to prove consent on request. Under TCPA (US), you must honor opt-outs within 24 hours. Under WhatsApp ToS, messaging contacts who have not opted in can result in your WhatsApp number being banned.",
          "Implement a simple opt-out flow: if a customer replies 'STOP', 'UNSUBSCRIBE', or 'OPT OUT', immediately add them to a do-not-contact list and reply with 'You have been unsubscribed and will receive no further messages from {store_name} on WhatsApp.' Remove them from all future campaign lists. See [e-commerce use cases](/use-cases/ecommerce) for fully compliant workflow examples.",
          "Store opt-in status in your database alongside the order. Before sending any message, check the opt-in status. This single check prevents the vast majority of compliance issues.",
        ],
      },
      {
        heading: "Frequently Asked Questions",
        headingLevel: "h2",
        content: [],
        faq: [
          { question: "Does Shopify send customer phone numbers in webhooks?", answer: "Shopify includes the phone number from the shipping or billing address if the customer provided it. You cannot message customers who did not provide a phone number. See our [WhatsApp marketing guide](/blog/whatsapp-marketing-api-guide) for opt-in best practices." },
          { question: "Is a Shopify app needed?", answer: "No — you can register webhooks directly in Shopify Admin without installing any third-party app. Your own Node.js or Python server handles the messages via [QuackAPI's REST API](/docs). Check our [e-commerce use cases](/use-cases/ecommerce) for full implementation examples." },
          { question: "What about GDPR and customer consent?", answer: "Only message customers who have opted in to WhatsApp communications during checkout. Add a checkbox to your checkout flow: 'Send me shipping updates via WhatsApp.'" },
          { question: "How many messages can I send with the free plan?", answer: "QuackAPI's free Starter plan allows 100 messages/day — fine for testing and small stores. A store getting 50–100 orders/day should use the [$29/month Professional plan](/pricing)." },
        ],
      },
    ],
  },
  {
    slug: "whatsapp-api-wordpress-woocommerce",
    title: "WhatsApp API for WordPress & WooCommerce (No Plugin Required)",
    description: "Send WooCommerce order notifications via WhatsApp without a plugin. Complete PHP and Node.js code to integrate QuackAPI with WordPress webhooks.",
    category: "Integration",
    date: "2026-03-18",
    readTime: "8 min read",
    sections: [
      {
        heading: "WhatsApp + WooCommerce: The Plugin-Free Approach",
        headingLevel: "h2",
        content: [
          "Most WhatsApp WooCommerce plugins cost $50–200/year and add bloat to your WordPress installation. QuackAPI lets you integrate directly using WooCommerce action hooks — a few lines of PHP in your theme's functions.php or a tiny custom plugin.",
          "This approach gives you full control, no recurring plugin fees, and works on any WordPress hosting. The only external cost is [QuackAPI's subscription](/pricing) (free tier available).",
          "For similar integration with Shopify, see our [WhatsApp Shopify integration guide](/blog/whatsapp-api-shopify-integration). For bulk messaging beyond order notifications, see [sending bulk WhatsApp messages](/blog/send-bulk-whatsapp-messages).",
        ],
      },
      {
        heading: "Method 1: PHP Hook in functions.php",
        headingLevel: "h2",
        content: [
          "Add this code to your theme's functions.php or create a simple WordPress plugin. It hooks into WooCommerce's order status change events and sends a WhatsApp notification:",
        ],
        code: {
          language: "php",
          snippet: `<?php
// Add to functions.php or a custom plugin file

define('QUACKAPI_KEY', getenv('QUACKAPI_KEY') ?: 'your-api-key');
define('QUACKAPI_DEVICE_ID', 1);

function send_whatsapp_via_quackapi($phone, $message) {
    $response = wp_remote_post('https://quackapi.com/api/messages/send', [
        'headers' => [
            'Content-Type' => 'application/json',
            'x-api-key'    => QUACKAPI_KEY,
        ],
        'body' => json_encode([
            'deviceId' => QUACKAPI_DEVICE_ID,
            'to'       => preg_replace('/[^0-9]/', '', $phone),
            'content'  => $message,
            'type'     => 'text',
        ]),
        'timeout' => 10,
    ]);
    return !is_wp_error($response);
}

// Hook: order placed
add_action('woocommerce_order_status_pending', function($order_id) {
    $order = wc_get_order($order_id);
    $phone = $order->get_billing_phone();
    if (!$phone) return;

    $name  = $order->get_billing_first_name();
    $num   = $order->get_order_number();
    $total = $order->get_formatted_order_total();

    send_whatsapp_via_quackapi(
        $phone,
        "Hi {$name}! Your order #{$num} has been received. Total: {$total}. We'll notify you when it ships!"
    );
});

// Hook: order shipped (processing → completed)
add_action('woocommerce_order_status_completed', function($order_id) {
    $order = wc_get_order($order_id);
    $phone = $order->get_billing_phone();
    if (!$phone) return;

    $name = $order->get_billing_first_name();
    $num  = $order->get_order_number();

    send_whatsapp_via_quackapi(
        $phone,
        "Hi {$name}, great news! Order #{$num} has been shipped and is on its way to you!"
    );
});`,
        },
      },
      {
        heading: "Method 2: WooCommerce Webhooks → External Server",
        headingLevel: "h2",
        content: [
          "If you prefer to keep the WhatsApp logic off your WordPress server, use WooCommerce's built-in Webhook system to forward order events to an external Node.js or Python server, which then calls QuackAPI.",
          "Go to WooCommerce → Settings → Advanced → Webhooks → Add Webhook. Set Topic to 'Order Created', Delivery URL to your server endpoint, and Status to Active.",
        ],
        code: {
          language: "javascript",
          snippet: `// Node.js receiver for WooCommerce webhooks
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.post('/woo-webhook', async (req, res) => {
  const order = req.body;
  const phone = order.billing?.phone;
  if (!phone) return res.json({ ok: true });

  const name  = order.billing?.first_name;
  const num   = order.number;
  const total = order.total;

  await axios.post('https://quackapi.com/api/messages/send', {
    deviceId: 1,
    to: phone.replace(/[^0-9]/g, ''),
    content: \`Hi \${name}! Order #\${num} confirmed. Total: \${total}. We'll send tracking soon!\`,
    type: 'text'
  }, {
    headers: { 'x-api-key': process.env.QUACKAPI_KEY }
  });

  res.json({ sent: true });
});

app.listen(3000);`,
        },
      },
      {
        heading: "Setting Your API Key Securely",
        headingLevel: "h2",
        content: [
          "Never hardcode your QuackAPI API key in functions.php — it will be visible in version control. Use WordPress's environment variable support or a secrets plugin.",
          "If you are on a hosting provider that supports .env files or server environment variables, set QUACKAPI_KEY there. Otherwise, store it in wp-config.php (which should be outside your web root) using `define('QUACKAPI_KEY', 'wa_your_key_here');`.",
        ],
        code: {
          language: "php",
          snippet: `// In wp-config.php (above the "That's all" comment):
define('QUACKAPI_KEY', 'wa_your_actual_key_here');
define('QUACKAPI_DEVICE_ID', 1);

// Then in functions.php, use:
$key = defined('QUACKAPI_KEY') ? QUACKAPI_KEY : '';`,
        },
      },
      {
        heading: "WooCommerce WhatsApp Message Templates",
        headingLevel: "h2",
        content: [
          "The right message template converts browsers into buyers and keeps existing customers coming back. Here are proven WooCommerce notification templates optimized for WhatsApp:",
          "Order placed: 'Hi {name}! Order #{order_id} received. Total: {total}. We'll confirm payment and send shipping updates here. Questions? Just reply!' This reassures the customer immediately after checkout, reducing support contacts by up to 30%.",
          "Payment confirmed: 'Great news, {name}! Payment for order #{order_id} confirmed. We're preparing your items now. Estimated dispatch: {dispatch_date}.'",
          "Order shipped: 'Your order is on its way, {name}! Tracking: {tracking_link}. Estimated delivery: {delivery_date}. Reply TRACK for updates.'",
          "Order delivered (+ review request): 'Hi {name}! Your order should have arrived. Hope you love it! If you have a moment, a quick review means a lot: {review_link}. Need anything? Just reply.'",
          "Subscription renewal reminder (7 days before): 'Hi {name}! Your {product_name} subscription renews in 7 days. No action needed — we'll charge the card on file. To update payment details: {account_link}.'",
          "These templates use WooCommerce order data available directly in the webhook payload. For e-commerce WhatsApp automation patterns, see [our e-commerce use cases](/use-cases/ecommerce). For advanced bulk messaging techniques, see the [bulk WhatsApp messaging guide](/blog/send-bulk-whatsapp-messages).",
        ],
      },
      {
        heading: "Handling Errors and Retries",
        headingLevel: "h2",
        content: [
          "Network errors and API rate limits are normal in production. Your WordPress integration must handle failures gracefully to avoid losing important customer notifications.",
          "Wrap every `wp_remote_post` call in a try-catch equivalent and check the response code. A 429 response from QuackAPI means you have hit your daily message limit. Log the failure and retry the next day using `wp_schedule_single_event`.",
          "For critical messages (order confirmations), implement a retry mechanism: if the first send fails, queue a retry for 15 minutes later using WordPress cron. After 3 failed attempts, log the failure to a custom WooCommerce order note so your support team can follow up manually.",
          "Store the QuackAPI API response for each notification in WooCommerce order meta. This gives you a complete audit trail: order ID, customer phone, message sent, timestamp, and delivery status. In the QuackAPI dashboard, configure a webhook callback to receive delivery receipts and update the order meta accordingly.",
        ],
      },
      {
        heading: "Frequently Asked Questions",
        headingLevel: "h2",
        content: [],
        faq: [
          { question: "Does this work on any WordPress hosting?", answer: "Yes. The `wp_remote_post` function is built into WordPress and uses your server's HTTP capabilities — it works on shared hosting, VPS, and managed WordPress hosts like WP Engine or Kinsta. See our [Shopify integration guide](/blog/whatsapp-api-shopify-integration) for a similar approach on Shopify." },
          { question: "What WooCommerce version is required?", answer: "WooCommerce 3.0+ supports the action hooks used above. Any site running WooCommerce in 2024 or later should work. See [e-commerce WhatsApp use cases](/use-cases/ecommerce) for more implementation ideas." },
          { question: "Can I send WhatsApp messages for subscription renewals?", answer: "Yes — hook into `woocommerce_subscription_renewal_payment_complete` or similar subscription hooks. The `send_whatsapp_via_quackapi` function works for any event." },
          { question: "What is the cost?", answer: "QuackAPI's free Starter plan (100 messages/day) is enough for stores with fewer than 100 orders/day. For larger stores, [see pricing options](/pricing)." },
        ],
      },
    ],
  },
  {
    slug: "whatsapp-marketing-api-guide",
    title: "WhatsApp Marketing API Guide: 98% Open Rates in 2026",
    description: "How to use WhatsApp as a marketing channel in 2026. Covers legal compliance, message templates, campaign strategy, open rates, and code examples via QuackAPI.",
    category: "Guide",
    date: "2026-03-18",
    readTime: "8 min read",
    sections: [
      {
        heading: "Why WhatsApp Is the Best Marketing Channel in 2026",
        headingLevel: "h2",
        content: [
          "WhatsApp has 3 billion active users as of 2026, making it the world's largest messaging platform. More importantly, messages are read. The average WhatsApp open rate is 98% — compared to 21% for email and 19% for SMS.",
          "Response rates are equally impressive: WhatsApp gets a 45–60% response rate vs 6% for email. For marketing, this means a campaign to 1,000 people on WhatsApp will get 450–600 replies, versus 60 for email.",
          "Businesses that switch even 20% of their email marketing to WhatsApp typically see a 3–4x increase in engagement and a significant improvement in conversion rates.",
        ],
      },
      {
        heading: "Legal Compliance: WhatsApp Marketing Rules",
        headingLevel: "h2",
        content: [
          "WhatsApp marketing is legal and effective — but only when recipients have opted in. Sending unsolicited promotional messages violates WhatsApp's terms of service and risks account bans.",
          "Collect opt-ins explicitly: add a checkbox to your signup forms ('I agree to receive WhatsApp marketing messages'), collect phone numbers at checkout with a WhatsApp marketing consent box, or run opt-in campaigns via SMS or email.",
          "Include an easy opt-out in every message ('Reply STOP to unsubscribe') and honor it immediately. This is both legally required in most jurisdictions (GDPR, TCPA) and practically necessary for maintaining your WhatsApp account health.",
        ],
      },
      {
        heading: "WhatsApp Marketing Message Types",
        headingLevel: "h2",
        content: [
          "QuackAPI supports 8 message types you can use in marketing campaigns: text (for promotions and announcements), image (product photos and banners), video (product demos and testimonials), PDF (catalogues and brochures), audio (voice messages), stickers (for engagement), location (for event invites with venue pins), and buttons (for interactive messages).",
          "For highest conversion, use image messages with a compelling offer image and short descriptive text, followed by a URL in the next text message. Image + link combos get 2–3x higher clicks than text-only messages.",
          "See our [bulk messaging guide](/blog/send-bulk-whatsapp-messages) for how to send campaigns efficiently without triggering spam filters.",
        ],
      },
      {
        heading: "Campaign Strategy: What to Send and When",
        headingLevel: "h2",
        content: [
          "Promotional blasts: Flash sales, new product launches, and limited-time offers perform best on WhatsApp. Send these to your opted-in subscriber list. The 98% open rate means almost everyone sees your offer.",
          "Welcome sequences: When someone opts in, send a welcome message immediately, a product highlight on day 3, and a discount code on day 7. This 3-message sequence typically converts 15–25% of new subscribers into buyers.",
          "Re-engagement: Users who haven't purchased in 60+ days can be re-engaged with a 'We miss you' message and a personalized discount. WhatsApp re-engagement campaigns convert at 8–12% vs 1–2% for email.",
          "Timing matters: Send between 10am and 6pm in the recipient's local timezone. Avoid Mondays and Sundays. Tuesday through Thursday between 11am and 3pm consistently shows the highest open and click rates.",
        ],
      },
      {
        heading: "Sending a Marketing Campaign via QuackAPI",
        headingLevel: "h2",
        content: [
          "Here is a complete Python example that sends a promotional campaign to a list of opted-in subscribers, with image attachment and rate limiting:",
        ],
        code: {
          language: "python",
          snippet: `import time
import random
import requests

API_KEY = "your-quackapi-key"
DEVICE_ID = 1

headers = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY
}

# Personalized promo with image
def send_promo(phone: str, name: str):
    # Send image first
    requests.post("https://quackapi.com/api/messages/send", json={
        "deviceId": DEVICE_ID,
        "to": phone,
        "content": "https://yourstore.com/promo-banner.jpg",
        "type": "image",
        "caption": f"Hi {name}! Our biggest sale of the year is HERE. 40% off everything."
    }, headers=headers)

    time.sleep(1)  # Small gap between messages

    # Follow up with link
    requests.post("https://quackapi.com/api/messages/send", json={
        "deviceId": DEVICE_ID,
        "to": phone,
        "content": f"Shop now: https://yourstore.com/sale?ref=whatsapp",
        "type": "text"
    }, headers=headers)

# Send to subscriber list with rate limiting
subscribers = [
    {"phone": "15551234567", "name": "Alice"},
    {"phone": "15559876543", "name": "Bob"},
]

for sub in subscribers:
    send_promo(sub["phone"], sub["name"])
    time.sleep(random.uniform(2, 5))  # 2-5 second delay`,
        },
      },
      {
        heading: "Measuring Campaign Performance",
        headingLevel: "h2",
        content: [
          "Track WhatsApp marketing performance by setting up a QuackAPI webhook to receive delivery confirmations and replies. Measure delivery rate (should be 95%+), open rate (estimated from link clicks if you use UTM-tagged URLs), reply rate, and conversion rate.",
          "Include unique UTM parameters in your WhatsApp links: `?utm_source=whatsapp&utm_medium=campaign&utm_campaign=spring-sale`. Google Analytics will then show you exactly how much revenue comes from each WhatsApp campaign.",
          "See our [webhook setup guide](/blog/whatsapp-webhook-setup-guide) for how to configure reply and delivery status callbacks.",
        ],
      },
      {
        heading: "Building Your WhatsApp Subscriber List",
        headingLevel: "h2",
        content: [
          "The most valuable WhatsApp marketing asset is a list of opted-in subscribers. Unlike email lists which degrade at 22% annually, WhatsApp numbers are tied to SIM cards — they stay valid much longer. Here's how to grow your list compliantly.",
          "Website opt-in widget: Add a 'Get updates on WhatsApp' widget to your homepage, pricing page, and blog posts. Include a phone number field and a clear consent checkbox: 'I agree to receive WhatsApp messages from {brand}. Reply STOP to unsubscribe.' This typically converts at 3–7% of page visitors.",
          "Post-purchase enrollment: After an e-commerce order is placed, send a confirmation email that says 'Prefer WhatsApp updates? Click here to receive your shipping notifications via WhatsApp.' This captures 15–25% of buyers who missed the checkout checkbox.",
          "Lead magnets: Offer a valuable download (e-book, coupon, checklist) in exchange for a WhatsApp opt-in. These convert at 10–30% because the value exchange is explicit. Use a dedicated landing page with a simple form.",
          "Existing customer import: If you have phone numbers from previous purchases, you can message them once with an opt-in invitation: 'Hi {name}, {brand} here. We're launching WhatsApp updates. Want to join? Reply YES to subscribe, NO to opt out.' Never assume consent — always ask explicitly.",
          "Track subscriber acquisition source in your database. This lets you measure which opt-in channel produces the highest-value subscribers — a critical insight for optimizing your growth strategy. For automation use case examples, see [WhatsApp marketing automation](/use-cases/automation).",
        ],
      },
      {
        heading: "WhatsApp Marketing Campaign Calendar",
        headingLevel: "h2",
        content: [
          "Consistency beats intensity in WhatsApp marketing. A subscriber who receives one high-value message per week for 3 months is worth more than one who receives 20 messages in a week and then unsubscribes. Here's a sustainable campaign calendar framework:",
          "Week 1 after opt-in — Welcome sequence: Send a 3-message welcome sequence over 3 days. Day 1: warm welcome and what to expect. Day 3: your best content or offer. Day 7: a question to engage ('What are you trying to achieve with {product}?').",
          "Ongoing — Weekly value: Send one valuable message per week. Alternate between promotions (40%), education (40%), and community/behind-the-scenes (20%). This 40/40/20 ratio keeps engagement high while preventing list fatigue.",
          "Seasonal — Campaign bursts: During high-intent periods (Black Friday, New Year, seasonal sales), increase frequency to 3x per week for 2 weeks. Subscribers who have been engaged for 60+ days tolerate higher frequency without unsubscribing.",
          "Monthly — Re-engagement: At the end of each month, identify subscribers who have not opened or replied in 30 days. Send a re-engagement message: 'Hi {name}! It's been a while. Are you still interested in WhatsApp updates from us? Reply YES to stay, or NO to unsubscribe.' Remove non-responders after 7 days.",
          "Use the [QuackAPI scheduling API](/docs) to automate this entire calendar. Pair it with a simple CRM or database to track subscription date, last interaction date, and campaign preferences.",
        ],
      },
      {
        heading: "Frequently Asked Questions",
        headingLevel: "h2",
        content: [],
        faq: [
          { question: "Is WhatsApp marketing legal?", answer: "Yes, if recipients have explicitly opted in. Unsolicited messages violate WhatsApp ToS and applicable laws (GDPR, TCPA). Always get consent first. See [WhatsApp automation use cases](/use-cases/automation) for compliant campaign examples." },
          { question: "What open rate can I expect?", answer: "Industry data consistently shows 94–98% open rates for WhatsApp business messages sent to opted-in subscribers." },
          { question: "Can I send promotional images via WhatsApp API?", answer: "Yes — QuackAPI supports image, video, PDF, and audio message types in addition to text. See the [API documentation](/docs) for all supported formats." },
          { question: "How do I avoid my account being banned?", answer: "Only message opted-in contacts, include opt-out instructions, use realistic send rates, and personalize messages. See our [WhatsApp messaging best practices guide](/blog/whatsapp-api-messaging-best-practices) for full guidelines." },
        ],
      },
    ],
  },
  {
    slug: "whatsapp-api-customer-support-automation",
    title: "WhatsApp API for Customer Support Automation",
    description: "How businesses cut support tickets by 40% using WhatsApp API automation. Covers webhook-driven auto-replies, chatbot integration, CRM sync, and escalation workflows.",
    category: "Use Case",
    date: "2026-03-18",
    readTime: "9 min read",
    sections: [
      {
        heading: "The Customer Support Problem WhatsApp Solves",
        headingLevel: "h2",
        content: [
          "The average customer support ticket takes 12 hours to resolve via email. Via WhatsApp, the same issue resolves in under 2 hours — because messages are seen immediately, responses feel more personal, and the back-and-forth happens in real time.",
          "Businesses that move even 30% of support volume to WhatsApp report a 40–60% reduction in average resolution time and a measurable increase in customer satisfaction scores (CSAT). More importantly, WhatsApp support reduces repeat contacts — customers who get a fast WhatsApp reply rarely email again.",
          "This guide covers how to build a WhatsApp customer support system using QuackAPI's webhook API. For the marketing side, see our [WhatsApp marketing guide](/blog/whatsapp-marketing-api-guide). For automating e-commerce specifically, see our [Shopify integration guide](/blog/whatsapp-api-shopify-integration).",
        ],
      },
      {
        heading: "Architecture: Receiving Support Messages via Webhook",
        headingLevel: "h2",
        content: [
          "QuackAPI sends an HTTP POST to your webhook URL whenever a customer replies to your WhatsApp number. Your server processes the incoming message and decides how to respond — either with an automated reply, a CRM ticket creation, or a handoff to a live agent.",
          "The webhook payload includes the sender's phone number, message content, message type, and device ID. This gives you everything you need to: look up the customer in your CRM, generate an automated response, create a support ticket, or route to the right team.",
          "See our [webhook setup guide](/blog/whatsapp-webhook-setup-guide) for how to configure and validate webhook endpoints.",
        ],
      },
      {
        heading: "Setting Up the Webhook Receiver",
        headingLevel: "h2",
        content: [
          "Register your webhook URL in the QuackAPI dashboard under Device Settings → Webhook URL. QuackAPI will POST all incoming messages to this URL in real time.",
        ],
        code: {
          language: "javascript",
          snippet: `const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const QUACKAPI_KEY = process.env.QUACKAPI_KEY;
const DEVICE_ID = parseInt(process.env.QUACKAPI_DEVICE_ID);

// Auto-reply with smart routing
const AUTO_REPLIES = {
  'order':   'To check your order status, reply with your order number (e.g., #12345).',
  'refund':  'For refund requests, please visit https://yourstore.com/refunds or reply with your order number.',
  'hours':   'We are open Monday-Friday 9am-6pm EST. For urgent issues, reply URGENT.',
  'pricing': 'See our full pricing at https://yourstore.com/pricing',
};

app.post('/webhook/whatsapp', async (req, res) => {
  const { from, body, type } = req.body;
  if (type !== 'text') return res.json({ ok: true });

  const text = body.toLowerCase().trim();

  // Check for keyword match
  const matchedKey = Object.keys(AUTO_REPLIES).find(k => text.includes(k));

  if (matchedKey) {
    // Send auto-reply
    await axios.post('https://quackapi.com/api/messages/send', {
      deviceId: DEVICE_ID,
      to: from,
      content: AUTO_REPLIES[matchedKey],
      type: 'text'
    }, { headers: { 'x-api-key': QUACKAPI_KEY } });
  } else {
    // No keyword match — create support ticket
    await createSupportTicket(from, body);
    await axios.post('https://quackapi.com/api/messages/send', {
      deviceId: DEVICE_ID,
      to: from,
      content: "Thanks for reaching out! A support agent will respond within 2 hours.",
      type: 'text'
    }, { headers: { 'x-api-key': QUACKAPI_KEY } });
  }

  res.json({ ok: true });
});`,
        },
      },
      {
        heading: "CRM Integration: Creating Tickets Automatically",
        headingLevel: "h2",
        content: [
          "When a customer message does not match any auto-reply keyword, create a ticket in your CRM. This example integrates with a generic REST API CRM (works with Freshdesk, Zendesk, or any ticket system with an API):",
        ],
        code: {
          language: "javascript",
          snippet: `async function createSupportTicket(phone, message) {
  // Example: Freshdesk API
  await axios.post('https://yourdomain.freshdesk.com/api/v2/tickets', {
    name: \`WhatsApp: \${phone}\`,
    phone: phone,
    source: 7, // WhatsApp source
    status: 2, // Open
    priority: 1,
    subject: \`WhatsApp Support Request from \${phone}\`,
    description: message,
    tags: ['whatsapp']
  }, {
    auth: { username: process.env.FRESHDESK_KEY, password: 'X' },
    headers: { 'Content-Type': 'application/json' }
  });
}`,
        },
      },
      {
        heading: "Escalation to Live Agents",
        headingLevel: "h2",
        content: [
          "When a customer replies URGENT or when a conversation has not been resolved after multiple exchanges, escalate to a live agent by sending an internal Slack or email notification:",
        ],
        code: {
          language: "javascript",
          snippet: `async function escalateToAgent(phone, message) {
  // Notify agent via Slack
  await axios.post(process.env.SLACK_WEBHOOK_URL, {
    text: \`🚨 Urgent WhatsApp support request from \${phone}:\n\${message}\n\nReply at: https://yourdashboard.com/whatsapp/\${phone}\`
  });
}

// In the webhook handler, check for URGENT keyword
if (text.includes('urgent') || text.includes('emergency')) {
  await escalateToAgent(from, body);
  await axios.post('https://quackapi.com/api/messages/send', {
    deviceId: DEVICE_ID,
    to: from,
    content: "Your request has been escalated to our senior support team. You will hear back within 30 minutes.",
    type: 'text'
  }, { headers: { 'x-api-key': QUACKAPI_KEY } });
}`,
        },
      },
      {
        heading: "Results: What to Expect",
        headingLevel: "h2",
        content: [
          "Based on QuackAPI customers who have deployed WhatsApp support automation: auto-reply keyword matching resolves 35–50% of inbound contacts without human intervention. Average response time drops from 12+ hours (email) to under 3 minutes (WhatsApp auto-reply).",
          "CSAT scores typically improve by 15–25 points after switching support to WhatsApp, primarily because customers feel heard faster. Repeat contact rates (same customer opening multiple tickets for the same issue) drop by 60% because issues are resolved in the same conversation thread.",
          "Start with [QuackAPI's free plan](/pricing) to handle up to 100 incoming/outgoing messages per day — enough for a small support team to validate the workflow before committing to a paid plan.",
        ],
      },
      {
        heading: "Escalation Workflow Design",
        headingLevel: "h2",
        content: [
          "Not every support request can be automated. Design your escalation workflow before you launch, so customers always reach a human when needed. Here is a proven 3-tier escalation framework for WhatsApp support:",
          "Tier 1 — Automated response (0–30 seconds): Your webhook server immediately replies with a keyword-matched answer or a structured menu. Example: 'Hi! I'm a QuackDuck assistant. Reply: 1 for order status, 2 for returns, 3 for billing, 4 to speak with a human.'",
          "Tier 2 — Senior bot or FAQ lookup (30 seconds–2 minutes): For requests that don't match keywords, query your knowledge base or FAQ database and return the best match. If confidence is below 80%, escalate to Tier 3. This tier handles approximately 20% of contacts.",
          "Tier 3 — Live agent handoff (2–10 minute response): Create a ticket in your CRM and notify the appropriate agent via Slack or email. The agent replies directly through your support platform, which sends the message via QuackAPI. The customer sees a seamless WhatsApp conversation.",
          "Key design principle: never leave a customer in limbo. If escalation takes more than 5 minutes, send an intermediate message: 'Thanks for your patience, {name}. A member of our team will be with you shortly.' This single message reduces CSAT impact from long waits by 40%.",
          "Track escalation rates per tier over time. If Tier 1 is escalating more than 40% of contacts, your keyword library needs expansion. If Tier 3 wait times exceed 10 minutes during business hours, you need more agent capacity. See [WhatsApp customer support use cases](/use-cases/customer-support) for real-world benchmarks.",
        ],
      },
      {
        heading: "WhatsApp Support Metrics and Reporting",
        headingLevel: "h2",
        content: [
          "Measure the right metrics from day one to prove ROI and continuously improve your WhatsApp support operation. The five most important metrics are: first response time (FRT), resolution time, CSAT score, automation rate, and cost per ticket.",
          "First response time target: under 3 minutes for automated responses, under 10 minutes for human responses during business hours. WhatsApp sets a high expectation — customers expect faster replies than email. Track FRT per channel and per agent.",
          "Resolution time: measure from first customer message to marked-resolved. WhatsApp support should resolve 80% of tickets in under 1 hour versus 80% in under 24 hours for email. Any ticket open longer than 4 hours should trigger an escalation alert.",
          "Automation rate: the percentage of contacts resolved without human intervention. A healthy automated WhatsApp support system should reach 40–60% automation within 3 months of launch. Above 60% often means you are deflecting contacts that would benefit from human touch.",
          "Cost per ticket: total support cost divided by tickets resolved. WhatsApp typically reduces cost per ticket by 30–50% versus phone support because agents handle more concurrent conversations. Track this monthly to demonstrate ROI to stakeholders.",
          "Use QuackAPI's webhook delivery receipts and the [WhatsApp webhook guide](/blog/whatsapp-webhook-setup-guide) to capture the data needed for these reports. Store raw events in your database and build a simple dashboard in your preferred BI tool.",
        ],
      },
      {
        heading: "Frequently Asked Questions",
        headingLevel: "h2",
        content: [],
        faq: [
          { question: "Can multiple support agents share one WhatsApp number?", answer: "Yes — with QuackAPI's webhook system, all incoming messages come to your server, which can route them to the right agent dashboard. Multiple agents can send replies via the same QuackAPI device. See [customer support use cases](/use-cases/customer-support) for architecture examples." },
          { question: "Does this work with existing CRM software?", answer: "Yes — any CRM with a REST API (Freshdesk, Zendesk, HubSpot, Salesforce) can receive ticket creation calls from the webhook handler shown above." },
          { question: "How do I handle non-text messages (images, voice notes)?", answer: "The QuackAPI webhook includes the message type. For image and audio messages, store the media URL and create a ticket for an agent to review. See the [API documentation](/docs) for all webhook payload fields." },
          { question: "What is the cost to run WhatsApp customer support?", answer: "QuackAPI's [Professional plan at $29/month](/pricing) supports 1,000 messages/day and 5 devices — enough for a small to medium support team. Enterprise is $99/month for unlimited volume." },
        ],
      },
    ],
  },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}


function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50" data-testid="blog-footer">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20">
              W
            </div>
            <span className="font-display font-bold text-lg">QuackAPI</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <a href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-terms">Terms</a>
            <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-privacy">Privacy</a>
            <a href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-contact">Contact</a>
            <a href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-docs">API Docs</a>
            <a href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-blog">Blog</a>
          </div>
          <p className="text-sm text-muted-foreground">2026 QuackAPI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-[#1e1e2e] rounded-xl overflow-hidden border border-white/10 my-4">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <span className="text-white/40 text-xs font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="text-white/40 hover:text-white/80 transition-colors p-1"
          data-testid={`button-copy-${language}`}
        >
          {copied ? (
            <span className="text-green-400 text-xs">Copied</span>
          ) : (
            <span className="text-xs">Copy</span>
          )}
        </button>
      </div>
      <pre className="p-4 text-sm overflow-x-auto">
        <code className="text-green-300 font-mono whitespace-pre leading-relaxed">{code}</code>
      </pre>
    </div>
  );
}

function BlogListing() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Blog - WhatsApp API Tutorials & Guides"
        description="Tutorials, guides, and insights for WhatsApp API developers. Learn how to send messages, set up webhooks, implement OTP verification, and more with QuackAPI."
        canonical="/blog"
        ogImage="/og-blog.png"
      />
      <Navbar />

      <section className="relative py-16 md:py-24" data-testid="section-blog-hero">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <BookOpen className="w-4 h-4" />
            Developer Resources
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4" data-testid="text-blog-title">
            QuackAPI Blog
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-blog-subtitle">
            Tutorials, guides, and insights for WhatsApp API developers
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24" data-testid="section-blog-grid">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link key={article.slug} href={`/blog/${article.slug}`} className="block group" data-testid={`card-article-${article.slug}`}>
              <Card className="h-full border-border/50 transition-all duration-300 hover:shadow-lg hover:border-primary/20 bg-background">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <Badge variant="secondary" data-testid={`badge-category-${article.slug}`}>
                      <Tag className="w-3 h-3 mr-1" />
                      {article.category}
                    </Badge>
                  </div>
                  <h2 className="font-display text-lg font-semibold mb-2 group-hover:text-primary transition-colors" data-testid={`text-title-${article.slug}`}>
                    {article.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4 flex-1 leading-relaxed" data-testid={`text-desc-${article.slug}`}>
                    {article.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border/50 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(article.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24" data-testid="section-explore-more">
        <h2 className="font-display text-2xl font-bold mb-6">Explore More</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card border border-border/50 rounded-xl p-6">
            <h3 className="font-display text-lg font-semibold mb-2">API Documentation</h3>
            <p className="text-sm text-muted-foreground mb-4">Complete API reference with code examples in 13+ programming languages.</p>
            <a href="/docs" className="text-sm font-medium text-primary hover:underline" data-testid="link-explore-docs">View API Docs &rarr;</a>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-6">
            <h3 className="font-display text-lg font-semibold mb-2">Use Cases</h3>
            <p className="text-sm text-muted-foreground mb-4">See how businesses use QuackAPI for notifications, OTP, support, and automation.</p>
            <a href="/use-cases" className="text-sm font-medium text-primary hover:underline" data-testid="link-explore-usecases">Explore Use Cases &rarr;</a>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-6">
            <h3 className="font-display text-lg font-semibold mb-2">QuackAPI vs UltraMSG</h3>
            <p className="text-sm text-muted-foreground mb-4">Compare QuackAPI with UltraMSG on features, pricing, and developer experience.</p>
            <a href="/compare/ultramsg" className="text-sm font-medium text-primary hover:underline" data-testid="link-explore-compare">See Comparison &rarr;</a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ArticlePage({ slug }: { slug: string }) {
  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">The article you are looking for does not exist.</p>
          <Link href="/blog">
            <Button data-testid="button-back-to-blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedArticles = articles.filter((a) => a.slug !== slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={article.title}
        description={article.description}
        canonical={`/blog/${article.slug}`}
        ogType="article"
        ogImage="/og-image.png"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: article.title,
            description: article.description,
            datePublished: article.date,
            dateModified: article.date,
            wordCount: article.sections.reduce((acc, s) => acc + s.content.join(" ").split(" ").length, 0),
            author: { "@type": "Organization", name: "QuackAPI", url: "https://quackapi.com" },
            publisher: { "@type": "Organization", name: "QuackAPI", url: "https://quackapi.com", logo: { "@type": "ImageObject", url: "https://quackapi.com/favicon.png" } },
            mainEntityOfPage: { "@type": "WebPage", "@id": `https://quackapi.com/blog/${article.slug}` },
            url: `https://quackapi.com/blog/${article.slug}`,
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://quackapi.com" },
              { "@type": "ListItem", position: 2, name: "Blog", item: "https://quackapi.com/blog" },
              { "@type": "ListItem", position: 3, name: article.title },
            ],
          },
        ]}
      />
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8 flex-wrap" aria-label="Breadcrumb" data-testid="breadcrumb">
          <a href="/" className="hover:text-foreground transition-colors" data-testid="breadcrumb-home">Home</a>
          <ChevronRight className="w-3 h-3" />
          <Link href="/blog" className="hover:text-foreground transition-colors" data-testid="breadcrumb-blog">Blog</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium" data-testid="breadcrumb-current">{article.title}</span>
        </nav>

        <article data-testid={`article-${article.slug}`}>
          <header className="mb-10">
            <Badge variant="secondary" className="mb-4" data-testid="badge-article-category">
              <Tag className="w-3 h-3 mr-1" />
              {article.category}
            </Badge>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4" data-testid="text-article-title">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap" data-testid="article-meta">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(article.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {article.readTime}
              </span>
            </div>
          </header>

          <div className="prose-container space-y-8">
            {article.sections.map((section, idx) => (
              <section key={idx} data-testid={`section-${idx}`}>
                {section.headingLevel === "h2" ? (
                  <h2 className="font-display text-2xl font-bold mb-4 mt-8">{section.heading}</h2>
                ) : (
                  <h3 className="font-display text-xl font-semibold mb-3 mt-6">{section.heading}</h3>
                )}
                {section.content.map((paragraph, pIdx) => (
                  <p key={pIdx} className="text-muted-foreground leading-relaxed mb-4">
                    {paragraph.split(/(`[^`]+`|\[[^\]]+\]\([^)]+\))/).map((part, partIdx) => {
                      if (part.startsWith("`") && part.endsWith("`")) {
                        return (
                          <code key={partIdx} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">
                            {part.slice(1, -1)}
                          </code>
                        );
                      }
                      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                      if (linkMatch) {
                        return (
                          <a key={partIdx} href={linkMatch[2]} className="text-primary underline hover:no-underline">
                            {linkMatch[1]}
                          </a>
                        );
                      }
                      return <span key={partIdx}>{part}</span>;
                    })}
                  </p>
                ))}
                {section.table && (
                  <div className="overflow-x-auto mt-4 rounded-lg border border-border/50">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/60 border-b border-border/50">
                          {section.table.headers.map((h, hIdx) => (
                            <th key={hIdx} className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.rows.map((row, rIdx) => (
                          <tr key={rIdx} className={rIdx % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-4 py-3 text-muted-foreground border-b border-border/30 last:border-b-0">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {section.code && (
                  <CodeBlock code={section.code.snippet} language={section.code.language} />
                )}
                {section.faq && section.faq.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {section.faq.map((item, fIdx) => (
                      <details key={fIdx} className="group border border-border/50 rounded-lg overflow-hidden">
                        <summary className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer font-medium text-sm list-none hover:bg-muted/50 transition-colors">
                          <span>{item.question}</span>
                          <ChevronRight className="w-4 h-4 flex-shrink-0 transition-transform group-open:rotate-90 text-muted-foreground" />
                        </summary>
                        <div className="px-4 pb-4 pt-2 text-sm text-muted-foreground leading-relaxed border-t border-border/30">
                          {item.answer.split(/(\[[^\]]+\]\([^)]+\))/).map((part, idx) => {
                            const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                            if (linkMatch) return <a key={idx} href={linkMatch[2]} className="text-primary underline hover:no-underline">{linkMatch[1]}</a>;
                            return <span key={idx}>{part}</span>;
                          })}
                        </div>
                      </details>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        </article>

        <section className="mt-16 pt-12 border-t border-border/50" data-testid="section-conversion-cta">
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 p-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Ready to get started?</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
              Send WhatsApp Messages via API — Free
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              No Meta Business verification. No credit card. Connect your WhatsApp in under 2 minutes and start sending messages through the REST API.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/auth" className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold px-6 py-3 text-sm shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity" data-testid="cta-get-started">
                Get Started Free →
              </a>
              <a href="/pricing" className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-6 py-3 text-sm font-medium hover:bg-muted transition-colors" data-testid="cta-view-pricing">
                View Pricing →
              </a>
            </div>
          </div>
        </section>

        <section className="mt-12 pt-12 border-t border-border/50" data-testid="section-related-articles">
          <h2 className="font-display text-2xl font-bold mb-6">Related Articles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedArticles.map((related) => (
              <Link key={related.slug} href={`/blog/${related.slug}`} className="block group" data-testid={`card-related-${related.slug}`}>
                <Card className="h-full border-border/50 transition-all duration-300 hover:shadow-lg hover:border-primary/20 bg-background">
                  <CardContent className="p-5">
                    <Badge variant="secondary" className="mb-3">
                      {related.category}
                    </Badge>
                    <h3 className="font-display font-semibold mb-2 group-hover:text-primary transition-colors">
                      {related.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(related.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {related.readTime}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="mt-8 p-5 bg-muted/40 rounded-xl border border-border/50" data-testid="section-compare-usecases">
            <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">Compare &amp; Use Cases</h3>
            <div className="flex flex-wrap gap-3">
              <a href="/compare/twilio" className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-background border border-border/60 hover:border-primary/40 hover:text-primary transition-colors" data-testid="link-compare-twilio">QuackAPI vs Twilio →</a>
              <a href="/compare/ultramsg" className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-background border border-border/60 hover:border-primary/40 hover:text-primary transition-colors" data-testid="link-compare-ultramsg">QuackAPI vs UltraMsg →</a>
              <a href="/compare/evolution-api" className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-background border border-border/60 hover:border-primary/40 hover:text-primary transition-colors" data-testid="link-compare-evolution">QuackAPI vs Evolution API →</a>
              <a href="/use-cases/ecommerce" className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-background border border-border/60 hover:border-primary/40 hover:text-primary transition-colors" data-testid="link-usecase-ecommerce">E-commerce Use Cases →</a>
              <a href="/use-cases/automation" className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-background border border-border/60 hover:border-primary/40 hover:text-primary transition-colors" data-testid="link-usecase-automation">Automation Use Cases →</a>
              <a href="/use-cases/customer-support" className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-background border border-border/60 hover:border-primary/40 hover:text-primary transition-colors" data-testid="link-usecase-support">Customer Support →</a>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

export default function BlogPage() {
  const [matched, params] = useRoute("/blog/:slug");

  if (matched && params?.slug) {
    return <ArticlePage slug={params.slug} />;
  }

  return <BlogListing />;
}
