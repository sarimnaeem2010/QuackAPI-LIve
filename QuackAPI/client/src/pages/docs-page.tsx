import { useState } from "react";
import { Copy, CheckCheck, ArrowLeft, Code2, Send, Image, FileText, Video, Music, Link2, MapPin, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SEO from "@/components/seo";
import Navbar from "@/components/navbar";

const languages = [
  { id: "curl", label: "cURL" },
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "php", label: "PHP" },
  { id: "java", label: "Java" },
  { id: "csharp", label: "C#" },
  { id: "go", label: "Go" },
  { id: "ruby", label: "Ruby" },
  { id: "rust", label: "Rust" },
  { id: "kotlin", label: "Kotlin" },
  { id: "swift", label: "Swift" },
  { id: "dart", label: "Dart" },
  { id: "powershell", label: "PowerShell" },
];

const messageTypes = [
  { id: "text", label: "Text Message", icon: Send, description: "Send a simple text message to any WhatsApp number." },
  { id: "image", label: "Image", icon: Image, description: "Send an image with optional caption." },
  { id: "video", label: "Video", icon: Video, description: "Send a video file with optional caption." },
  { id: "audio", label: "Audio", icon: Music, description: "Send an audio or voice message." },
  { id: "document", label: "Document", icon: FileText, description: "Send PDF, DOC, or other document files." },
  { id: "link", label: "Link Preview", icon: Link2, description: "Send a URL with automatic link preview." },
  { id: "contact", label: "Contact Card", icon: UserPlus, description: "Send a vCard contact to the recipient." },
  { id: "location", label: "Location", icon: MapPin, description: "Send a GPS location with map preview." },
];

function getCodeExamples(type: string) {
  const bodies: Record<string, object> = {
    text: { deviceId: 1, to: "923001234567", content: "Hello from QuackAPI!", type: "text" },
    image: { deviceId: 1, to: "923001234567", content: "https://example.com/image.jpg", type: "image", caption: "Check this out!" },
    video: { deviceId: 1, to: "923001234567", content: "https://example.com/video.mp4", type: "video", caption: "Watch this video" },
    audio: { deviceId: 1, to: "923001234567", content: "https://example.com/audio.mp3", type: "audio" },
    document: { deviceId: 1, to: "923001234567", content: "https://example.com/document.pdf", type: "pdf", filename: "invoice.pdf" },
    link: { deviceId: 1, to: "923001234567", content: "https://quackapi.com - Check out QuackAPI!", type: "text" },
    contact: { deviceId: 1, to: "923001234567", content: "BEGIN:VCARD\\nVERSION:3.0\\nFN:John Doe\\nTEL:+1234567890\\nEND:VCARD", type: "text" },
    location: { deviceId: 1, to: "923001234567", content: "https://maps.google.com/?q=33.6844,73.0479", type: "text" },
  };
  const body = bodies[type] || bodies.text;
  const jsonBody = JSON.stringify(body, null, 2);

  return {
    curl: `curl -X POST "https://your-domain.com/api/messages/send" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: wa_your_api_key_here" \\
  -d '${JSON.stringify(body)}'`,

    javascript: `const response = await fetch(
  "https://your-domain.com/api/messages/send",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "wa_your_api_key_here"
    },
    body: JSON.stringify(${jsonBody})
  }
);

const result = await response.json();
console.log(result);`,

    python: `import requests

url = "https://your-domain.com/api/messages/send"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "wa_your_api_key_here"
}
payload = ${jsonBody.replace(/"/g, '"')}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`,

    php: `<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://your-domain.com/api/messages/send");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "x-api-key: wa_your_api_key_here"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(${jsonBody.replace(/"/g, "'")}));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);
echo $response;
?>`,

    java: `import java.net.http.*;
import java.net.URI;

HttpClient client = HttpClient.newHttpClient();
String body = """
    ${jsonBody}
    """;

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://your-domain.com/api/messages/send"))
    .header("Content-Type", "application/json")
    .header("x-api-key", "wa_your_api_key_here")
    .POST(HttpRequest.BodyPublishers.ofString(body))
    .build();

HttpResponse<String> response = client.send(
    request, HttpResponse.BodyHandlers.ofString()
);
System.out.println(response.body());`,

    csharp: `using var client = new HttpClient();
client.DefaultRequestHeaders.Add("x-api-key", "wa_your_api_key_here");

var content = new StringContent(
    @"${jsonBody.replace(/\n/g, "\\n")}",
    System.Text.Encoding.UTF8,
    "application/json"
);

var response = await client.PostAsync(
    "https://your-domain.com/api/messages/send",
    content
);
var result = await response.Content.ReadAsStringAsync();
Console.WriteLine(result);`,

    go: `package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
    "io"
)

func main() {
    payload := map[string]interface{}{
        ${Object.entries(body).map(([k, v]) => `"${k}": ${JSON.stringify(v)},`).join("\n        ")}
    }
    jsonData, _ := json.Marshal(payload)

    req, _ := http.NewRequest("POST",
        "https://your-domain.com/api/messages/send",
        bytes.NewBuffer(jsonData))
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("x-api-key", "wa_your_api_key_here")

    resp, _ := http.DefaultClient.Do(req)
    defer resp.Body.Close()
    body, _ := io.ReadAll(resp.Body)
    fmt.Println(string(body))
}`,

    ruby: `require 'net/http'
require 'json'
require 'uri'

uri = URI("https://your-domain.com/api/messages/send")
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Post.new(uri)
request["Content-Type"] = "application/json"
request["x-api-key"] = "wa_your_api_key_here"
request.body = ${jsonBody}.to_json

response = http.request(request)
puts response.body`,

    rust: `use reqwest::Client;
use serde_json::json;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::new();
    let body = json!(${jsonBody});

    let response = client
        .post("https://your-domain.com/api/messages/send")
        .header("Content-Type", "application/json")
        .header("x-api-key", "wa_your_api_key_here")
        .json(&body)
        .send()
        .await?;

    println!("{}", response.text().await?);
    Ok(())
}`,

    kotlin: `import java.net.http.*
import java.net.URI

fun main() {
    val client = HttpClient.newHttpClient()
    val body = """${jsonBody}"""

    val request = HttpRequest.newBuilder()
        .uri(URI.create("https://your-domain.com/api/messages/send"))
        .header("Content-Type", "application/json")
        .header("x-api-key", "wa_your_api_key_here")
        .POST(HttpRequest.BodyPublishers.ofString(body))
        .build()

    val response = client.send(request, HttpResponse.BodyHandlers.ofString())
    println(response.body())
}`,

    swift: `import Foundation

let url = URL(string: "https://your-domain.com/api/messages/send")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("application/json", forHTTPHeaderField: "Content-Type")
request.setValue("wa_your_api_key_here", forHTTPHeaderField: "x-api-key")

let payload: [String: Any] = ${jsonBody.replace(/"/g, '"')}
request.httpBody = try? JSONSerialization.data(withJSONObject: payload)

let task = URLSession.shared.dataTask(with: request) { data, _, _ in
    if let data = data,
       let result = String(data: data, encoding: .utf8) {
        print(result)
    }
}
task.resume()`,

    dart: `import 'dart:convert';
import 'package:http/http.dart' as http;

void main() async {
  final url = Uri.parse("https://your-domain.com/api/messages/send");
  final headers = {
    "Content-Type": "application/json",
    "x-api-key": "wa_your_api_key_here",
  };
  final body = jsonEncode(${jsonBody});

  final response = await http.post(url, headers: headers, body: body);
  print(response.body);
}`,

    powershell: `$headers = @{
    "Content-Type" = "application/json"
    "x-api-key" = "wa_your_api_key_here"
}

$body = @"
${jsonBody}
"@

$response = Invoke-RestMethod ` + "`" + `
    -Uri "https://your-domain.com/api/messages/send" ` + "`" + `
    -Method POST ` + "`" + `
    -Headers $headers ` + "`" + `
    -Body $body

$response | ConvertTo-Json`,
  };
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-[#1e1e2e] rounded-xl overflow-hidden border border-white/10">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <span className="text-white/40 text-xs font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="text-white/40 hover:text-white/80 transition-colors p-1"
          data-testid={`button-copy-${language}`}
        >
          {copied ? <CheckCheck className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <pre className="p-4 text-sm overflow-x-auto max-h-[500px]">
        <code className="text-green-300 font-mono whitespace-pre leading-relaxed">{code}</code>
      </pre>
    </div>
  );
}

export default function DocsPage() {
  const [selectedType, setSelectedType] = useState("text");
  const examples = getCodeExamples(selectedType);

  const docsJsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: "QuackAPI API Documentation",
    description: "Complete API reference for QuackAPI WhatsApp API with code examples in 13+ programming languages.",
    author: { "@type": "Organization", name: "QuackAPI" },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: typeof window !== "undefined" ? window.location.origin : "" },
      { "@type": "ListItem", position: 2, name: "API Documentation" },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="API Documentation - WhatsApp API Reference"
        description="Complete QuackAPI API documentation with code examples in JavaScript, Python, PHP, Java, Go, Ruby, C#, Rust, Kotlin, Swift, Dart, cURL, and PowerShell. Send text, images, videos, documents, locations, and contacts via WhatsApp API."
        canonical="/docs"
        ogImage="/og-docs.png"
        jsonLd={[docsJsonLd, breadcrumbJsonLd]}
      />

      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8" aria-label="Breadcrumb" data-testid="breadcrumb">
          <a href="/" className="hover:text-foreground transition-colors">Home</a>
          <span>/</span>
          <span className="text-foreground font-medium">API Documentation</span>
        </nav>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Code2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold">API Documentation</h1>
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Send WhatsApp messages programmatically using our REST API. Choose your programming language 
            and message type below to get started with code examples you can copy and paste.
          </p>
        </div>

        <section className="mb-12" id="authentication">
          <h2 className="font-display text-2xl font-bold mb-4">Authentication</h2>
          <div className="bg-card border border-border/50 rounded-xl p-6">
            <p className="text-muted-foreground mb-4">
              All API requests require authentication via your API key. Include the key in the <code className="bg-muted px-2 py-0.5 rounded text-sm font-mono">x-api-key</code> header with every request.
            </p>
            <CodeBlock
              language="HTTP Header"
              code={`x-api-key: wa_your_api_key_here`}
            />
            <p className="text-sm text-muted-foreground mt-4">
              You can find your API key in your <a href="/profile" className="text-primary hover:underline">Profile Settings</a> after logging in. 
              Each account gets a unique API key starting with <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">wa_</code>.
            </p>
          </div>
        </section>

        <section className="mb-12" id="base-url">
          <h2 className="font-display text-2xl font-bold mb-4">Base URL</h2>
          <div className="bg-card border border-border/50 rounded-xl p-6">
            <CodeBlock
              language="Base URL"
              code={`POST https://your-domain.com/api/messages/send`}
            />
            <p className="text-sm text-muted-foreground mt-4">
              All message sending requests use a single endpoint. The message type is specified in the request body.
            </p>
          </div>
        </section>

        <section className="mb-12" id="response-format">
          <h2 className="font-display text-2xl font-bold mb-4">Response Format</h2>
          <div className="bg-card border border-border/50 rounded-xl p-6">
            <p className="text-muted-foreground mb-4">All API responses are returned in JSON format:</p>
            <CodeBlock
              language="JSON Response"
              code={`// Success Response
{
  "id": 42,
  "deviceId": 1,
  "to": "923001234567",
  "content": "Hello from QuackAPI!",
  "type": "text",
  "status": "sent",
  "createdAt": "2026-01-15T10:30:00.000Z"
}

// Error Response
{
  "message": "Device not connected",
  "error": "DEVICE_OFFLINE"
}`}
            />
          </div>
        </section>

        <section id="message-types">
          <h2 className="font-display text-2xl font-bold mb-6">Message Types</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
            {messageTypes.map((mt) => (
              <button
                key={mt.id}
                onClick={() => setSelectedType(mt.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  selectedType === mt.id
                    ? "bg-primary/10 border-primary/30 text-primary shadow-sm"
                    : "bg-card border-border/50 text-muted-foreground hover:border-primary/20 hover:bg-accent/50"
                }`}
                data-testid={`button-type-${mt.id}`}
              >
                <mt.icon className="w-5 h-5" />
                <span className="text-xs font-medium text-center">{mt.label}</span>
              </button>
            ))}
          </div>

          <div className="bg-card border border-border/50 rounded-xl p-6 mb-6">
            <h3 className="font-display text-xl font-semibold mb-2">
              {messageTypes.find(m => m.id === selectedType)?.label}
            </h3>
            <p className="text-muted-foreground mb-4">
              {messageTypes.find(m => m.id === selectedType)?.description}
            </p>

            <h4 className="font-semibold text-sm uppercase text-muted-foreground mb-3 tracking-wider">Request Body</h4>
            <CodeBlock
              language="JSON"
              code={JSON.stringify(
                selectedType === "text" ? { deviceId: 1, to: "923001234567", content: "Hello from QuackAPI!", type: "text" } :
                selectedType === "image" ? { deviceId: 1, to: "923001234567", content: "https://example.com/image.jpg", type: "image", caption: "Check this out!" } :
                selectedType === "video" ? { deviceId: 1, to: "923001234567", content: "https://example.com/video.mp4", type: "video", caption: "Watch this video" } :
                selectedType === "audio" ? { deviceId: 1, to: "923001234567", content: "https://example.com/audio.mp3", type: "audio" } :
                selectedType === "document" ? { deviceId: 1, to: "923001234567", content: "https://example.com/document.pdf", type: "pdf", filename: "invoice.pdf" } :
                selectedType === "link" ? { deviceId: 1, to: "923001234567", content: "https://quackapi.com - Check out QuackAPI!", type: "text" } :
                selectedType === "contact" ? { deviceId: 1, to: "923001234567", content: "BEGIN:VCARD\\nVERSION:3.0\\nFN:John Doe\\nTEL:+1234567890\\nEND:VCARD", type: "text" } :
                { deviceId: 1, to: "923001234567", content: "https://maps.google.com/?q=33.6844,73.0479", type: "text" },
                null, 2
              )}
            />
          </div>

          <h3 className="font-display text-xl font-semibold mb-4">Code Examples</h3>
          <Tabs defaultValue="curl" className="w-full">
            <div className="overflow-x-auto mb-4">
              <TabsList className="inline-flex h-auto p-1 bg-muted/50 rounded-lg flex-wrap gap-1">
                {languages.map((lang) => (
                  <TabsTrigger
                    key={lang.id}
                    value={lang.id}
                    className="text-xs px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    data-testid={`tab-${lang.id}`}
                  >
                    {lang.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {languages.map((lang) => (
              <TabsContent key={lang.id} value={lang.id}>
                <CodeBlock code={examples[lang.id as keyof typeof examples]} language={lang.label} />
              </TabsContent>
            ))}
          </Tabs>
        </section>

        <section className="mt-16 mb-12" id="webhooks">
          <h2 className="font-display text-2xl font-bold mb-4">Webhook Events</h2>
          <div className="bg-card border border-border/50 rounded-xl p-6 space-y-8">
            <div>
              <p className="text-muted-foreground mb-4">
                Configure a webhook URL for each device to receive real-time notifications. QuackAPI sends
                a <code className="bg-muted px-2 py-0.5 rounded text-sm font-mono">POST</code> request
                with <code className="bg-muted px-2 py-0.5 rounded text-sm font-mono">Content-Type: application/json</code> to
                your webhook URL whenever a message is received, sent, or fails. Set up your webhook URL
                in the device settings page after connecting your WhatsApp device.
              </p>
              <p className="text-sm text-muted-foreground">
                Use the <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">event</code> field
                in the payload to determine the type of notification.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-sm uppercase text-muted-foreground mb-1 tracking-wider">Event 1</h4>
              <h3 className="font-display text-lg font-semibold mb-2">Incoming Message Received</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Triggered when your connected WhatsApp device receives a new message from someone.
                Media messages include a type prefix in the content field (e.g. <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">[Image]</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">[Video]</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">[Document]</code>) followed by the caption or filename.
              </p>
              <CodeBlock
                language="message.received"
                code={`{
  "event": "message.received",
  "deviceId": 1,
  "from": "923001234567@s.whatsapp.net",
  "content": "Hi there! I'd like to place an order.",
  "timestamp": 1708531200,
  "messageId": "BAE5F4A2C1D3E6F7"
}`}
              />
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm" data-testid="table-webhook-received">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Field</th>
                      <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Type</th>
                      <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/30">
                      <td className="py-2 px-3 font-mono text-xs">event</td>
                      <td className="py-2 px-3 text-muted-foreground">string</td>
                      <td className="py-2 px-3 text-muted-foreground">Always <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">"message.received"</code></td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="py-2 px-3 font-mono text-xs">deviceId</td>
                      <td className="py-2 px-3 text-muted-foreground">number</td>
                      <td className="py-2 px-3 text-muted-foreground">The ID of your connected device that received the message</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="py-2 px-3 font-mono text-xs">from</td>
                      <td className="py-2 px-3 text-muted-foreground">string</td>
                      <td className="py-2 px-3 text-muted-foreground">Sender's WhatsApp JID (phone number with <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">@s.whatsapp.net</code> suffix)</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="py-2 px-3 font-mono text-xs">content</td>
                      <td className="py-2 px-3 text-muted-foreground">string</td>
                      <td className="py-2 px-3 text-muted-foreground">Message text content. Media messages are prefixed with type (e.g. <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">[Image] caption</code>)</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="py-2 px-3 font-mono text-xs">timestamp</td>
                      <td className="py-2 px-3 text-muted-foreground">number</td>
                      <td className="py-2 px-3 text-muted-foreground">Unix timestamp (seconds) when the message was sent</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono text-xs">messageId</td>
                      <td className="py-2 px-3 text-muted-foreground">string</td>
                      <td className="py-2 px-3 text-muted-foreground">WhatsApp's unique message identifier</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t border-border/50 pt-8">
              <h4 className="font-semibold text-sm uppercase text-muted-foreground mb-1 tracking-wider">Event 2</h4>
              <h3 className="font-display text-lg font-semibold mb-2">Message Sent Successfully</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Triggered when a message you sent via the API is successfully delivered to WhatsApp.
              </p>
              <CodeBlock
                language="message.sent"
                code={`{
  "event": "message.sent",
  "messageId": 42,
  "to": "923001234567",
  "deviceId": 1,
  "status": "sent"
}`}
              />
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm" data-testid="table-webhook-sent">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Field</th>
                      <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Type</th>
                      <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/30">
                      <td className="py-2 px-3 font-mono text-xs">event</td>
                      <td className="py-2 px-3 text-muted-foreground">string</td>
                      <td className="py-2 px-3 text-muted-foreground">Always <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">"message.sent"</code></td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="py-2 px-3 font-mono text-xs">messageId</td>
                      <td className="py-2 px-3 text-muted-foreground">number</td>
                      <td className="py-2 px-3 text-muted-foreground">Your QuackAPI message ID (from the send API response)</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="py-2 px-3 font-mono text-xs">to</td>
                      <td className="py-2 px-3 text-muted-foreground">string</td>
                      <td className="py-2 px-3 text-muted-foreground">Recipient's phone number</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="py-2 px-3 font-mono text-xs">deviceId</td>
                      <td className="py-2 px-3 text-muted-foreground">number</td>
                      <td className="py-2 px-3 text-muted-foreground">The device that sent the message</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono text-xs">status</td>
                      <td className="py-2 px-3 text-muted-foreground">string</td>
                      <td className="py-2 px-3 text-muted-foreground">Always <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">"sent"</code></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t border-border/50 pt-8">
              <h4 className="font-semibold text-sm uppercase text-muted-foreground mb-1 tracking-wider">Event 3</h4>
              <h3 className="font-display text-lg font-semibold mb-2">Message Failed</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Triggered when a message you sent via the API fails to deliver (e.g. device disconnected, invalid number).
              </p>
              <CodeBlock
                language="message.failed"
                code={`{
  "event": "message.failed",
  "messageId": 42,
  "to": "923001234567",
  "deviceId": 1,
  "error": "Device not connected"
}`}
              />
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm" data-testid="table-webhook-failed">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Field</th>
                      <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Type</th>
                      <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/30">
                      <td className="py-2 px-3 font-mono text-xs">event</td>
                      <td className="py-2 px-3 text-muted-foreground">string</td>
                      <td className="py-2 px-3 text-muted-foreground">Always <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">"message.failed"</code></td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="py-2 px-3 font-mono text-xs">messageId</td>
                      <td className="py-2 px-3 text-muted-foreground">number</td>
                      <td className="py-2 px-3 text-muted-foreground">Your QuackAPI message ID</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="py-2 px-3 font-mono text-xs">to</td>
                      <td className="py-2 px-3 text-muted-foreground">string</td>
                      <td className="py-2 px-3 text-muted-foreground">Recipient's phone number</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="py-2 px-3 font-mono text-xs">deviceId</td>
                      <td className="py-2 px-3 text-muted-foreground">number</td>
                      <td className="py-2 px-3 text-muted-foreground">The device that attempted to send</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono text-xs">error</td>
                      <td className="py-2 px-3 text-muted-foreground">string</td>
                      <td className="py-2 px-3 text-muted-foreground">Human-readable error message describing why the send failed</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 mb-12" id="rate-limits">
          <h2 className="font-display text-2xl font-bold mb-4">Rate Limits</h2>
          <div className="bg-card border border-border/50 rounded-xl p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Plan</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Messages/Day</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Devices</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Rate Limit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/30">
                    <td className="py-3 px-4 font-medium">Starter (Free)</td>
                    <td className="py-3 px-4">100</td>
                    <td className="py-3 px-4">1</td>
                    <td className="py-3 px-4">10 req/min</td>
                  </tr>
                  <tr className="border-b border-border/30">
                    <td className="py-3 px-4 font-medium">Professional</td>
                    <td className="py-3 px-4">Unlimited</td>
                    <td className="py-3 px-4">5</td>
                    <td className="py-3 px-4">60 req/min</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Enterprise</td>
                    <td className="py-3 px-4">Unlimited</td>
                    <td className="py-3 px-4">Unlimited</td>
                    <td className="py-3 px-4">300 req/min</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mt-16 mb-12" id="learn-more">
          <h2 className="font-display text-2xl font-bold mb-4">Learn More</h2>
          <div className="bg-card border border-border/50 rounded-xl p-6">
            <p className="text-muted-foreground mb-4">Dive deeper with step-by-step tutorials and guides for building with QuackAPI.</p>
            <div className="flex flex-wrap gap-3">
              <a href="/blog/send-whatsapp-messages-python" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline" data-testid="link-tutorial-python">Python Tutorial</a>
              <span className="text-border">|</span>
              <a href="/blog/send-whatsapp-messages-php" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline" data-testid="link-tutorial-php">PHP Tutorial</a>
              <span className="text-border">|</span>
              <a href="/blog/send-whatsapp-messages-nodejs" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline" data-testid="link-tutorial-nodejs">Node.js Tutorial</a>
              <span className="text-border">|</span>
              <a href="/blog/whatsapp-webhook-setup-guide" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline" data-testid="link-tutorial-webhooks">Webhook Setup Guide</a>
              <span className="text-border">|</span>
              <a href="/blog/whatsapp-otp-verification-nodejs" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline" data-testid="link-tutorial-otp">OTP Verification Guide</a>
              <span className="text-border">|</span>
              <a href="/use-cases" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline" data-testid="link-tutorial-usecases">See Use Cases</a>
            </div>
          </div>
        </section>
      </div>

      <footer className="bg-foreground text-background py-12" data-testid="docs-footer">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-background/60 mb-4">Need help integrating? Check out our <a href="/blog" className="text-primary hover:underline">tutorials</a> or <a href="/contact" className="text-primary hover:underline">contact us</a>.</p>
          <div className="flex items-center justify-center gap-6 text-sm text-background/40">
            <a href="/terms" className="hover:text-background/80 transition-colors">Terms</a>
            <a href="/privacy" className="hover:text-background/80 transition-colors">Privacy</a>
            <a href="/contact" className="hover:text-background/80 transition-colors">Contact</a>
          </div>
          <p className="text-background/30 text-sm mt-4">&copy; {new Date().getFullYear()} QuackAPI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
