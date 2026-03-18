import { useState, useMemo, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Send,
  Copy,
  Check,
  Loader2,
  Wifi,
  WifiOff,
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Code2,
  Settings,
  BarChart3,
  Phone,
  Globe,
  Key,
  ChevronDown,
  Webhook,
  ExternalLink,
} from "lucide-react";
import { useDevice, useDeviceQR } from "@/hooks/use-devices";
import { useAuth, authFetch } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { api } from "@shared/routes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Message } from "@shared/schema";

function useAppUrl(): string {
  const { data } = useQuery<{ appUrl: string }>({
    queryKey: ["/api/config"],
    queryFn: () => fetch("/api/config").then((r) => r.json()),
    staleTime: Infinity,
  });
  return data?.appUrl ?? "https://quackapi.com";
}

const sendTestSchema = z.object({
  toNumber: z.string().min(1, "Phone number is required"),
  content: z.string().default(""),
  type: z.enum(["text", "image", "video", "audio", "document", "link", "contact", "location"]).default("text"),
  mediaUrl: z.string().optional(),
  caption: z.string().optional(),
  filename: z.string().optional(),
  lat: z.string().optional(),
  lng: z.string().optional(),
  address: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
}).refine((data) => {
  if (data.type === "location") return true;
  return data.content && data.content.length > 0;
}, { message: "Content is required", path: ["content"] }).refine((data) => {
  if (data.type === "location") {
    return data.lat && data.lat.length > 0 && data.lng && data.lng.length > 0;
  }
  return true;
}, { message: "Latitude and longitude are required", path: ["lat"] });

export default function DeviceDetailPage() {
  const [, params] = useRoute("/devices/:id");
  const [, setLocation] = useLocation();
  const deviceId = params?.id ? Number(params.id) : 0;

  const { data: device, isLoading } = useDevice(deviceId);
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!device) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold mb-2">Device not found</h2>
        <Button variant="outline" onClick={() => setLocation("/devices")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Devices
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/devices")} data-testid="button-back">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold" data-testid="text-device-title">{device.deviceName}</h1>
            <Badge
              variant={device.status === "connected" ? "default" : device.status === "pending" ? "secondary" : "destructive"}
              className="capitalize"
              data-testid="badge-device-status"
            >
              {device.status === "connected" && <Wifi className="w-3 h-3 mr-1" />}
              {device.status === "disconnected" && <WifiOff className="w-3 h-3 mr-1" />}
              {device.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Instance #{device.id} {device.phoneNumber && `· ${device.phoneNumber}`}
          </p>
        </div>
      </div>

      <DeviceInfoBar device={device} apiKey={user?.apiKey || ""} />

      <MessageStats deviceId={deviceId} />

      <ApiDocumentation deviceId={deviceId} apiKey={user?.apiKey || ""} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SendTestMessage deviceId={deviceId} deviceStatus={device.status} />
        <QRConnectionPanel deviceId={deviceId} deviceStatus={device.status} />
      </div>

      <WebhookSettings device={device} />

      <WebhookLogs device={device} />

      <MessageHistory deviceId={deviceId} />
    </div>
  );
}

function DeviceInfoBar({ device, apiKey }: { device: any; apiKey: string }) {
  const [copied, setCopied] = useState<string | null>(null);
  const baseUrl = useAppUrl();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const items = [
    { label: "Auth Status", value: device.status === "connected" ? "authenticated" : device.status, badge: true },
    { label: "API URL", value: `${baseUrl}/v1/messages/chat`, copyable: true },
    { label: "Instance ID", value: String(device.id), copyable: true },
    { label: "Token", value: apiKey, copyable: true, masked: true },
  ];

  return (
    <Card className="border-border/50" data-testid="card-device-info">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.label} className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.label}</p>
              <div className="flex items-center gap-2">
                {item.badge ? (
                  <Badge variant={device.status === "connected" ? "default" : "secondary"} className="capitalize" data-testid={`badge-info-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    {item.value}
                  </Badge>
                ) : (
                  <>
                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono truncate max-w-[180px]" data-testid={`text-info-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
                      {item.masked ? `${item.value.substring(0, 8)}...` : item.value}
                    </code>
                    {item.copyable && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => copyToClipboard(item.value, item.label)}
                        data-testid={`button-copy-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {copied === item.label ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MessageStats({ deviceId }: { deviceId: number }) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/devices", deviceId, "stats"],
    queryFn: async () => {
      const res = await authFetch(`/api/devices/${deviceId}/stats`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return (await res.json()) as { sent: number; pending: number; failed: number; total: number };
    },
  });

  const statItems = [
    { label: "Sent", value: stats?.sent || 0, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Queue", value: stats?.pending || 0, icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: "Failed", value: stats?.failed || 0, icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Total", value: stats?.total || 0, icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="section-stats">
      {statItems.map((item) => (
        <Card key={item.label} className="border-border/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center`}>
              <item.icon className={`w-6 h-6 ${item.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid={`text-stat-${item.label.toLowerCase()}`}>
                {isLoading ? "—" : item.value}
              </p>
              <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SendTestMessage({ deviceId, deviceStatus }: { deviceId: number; deviceStatus: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof sendTestSchema>>({
    resolver: zodResolver(sendTestSchema),
    defaultValues: { toNumber: "", content: "", type: "text", mediaUrl: "", caption: "", filename: "", lat: "", lng: "", address: "", contactName: "", contactPhone: "" },
  });

  const selectedType = form.watch("type");

  const sendMutation = useMutation({
    mutationFn: async (data: z.infer<typeof sendTestSchema>) => {
      const res = await authFetch(`/api/devices/${deviceId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to send message");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Message Queued", description: `Message ID: ${data.messageId}` });
      form.reset({ toNumber: form.getValues("toNumber"), content: "", type: "text", mediaUrl: "", caption: "", filename: "", lat: "", lng: "", address: "", contactName: "", contactPhone: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/devices", deviceId, "stats"] });
      queryClient.invalidateQueries({ queryKey: [api.messages.list.path, deviceId] });
    },
    onError: (error) => {
      toast({ title: "Send Failed", description: error.message, variant: "destructive" });
    },
  });

  const contentLabel: Record<string, { label: string; placeholder: string }> = {
    text: { label: "Message", placeholder: "Hello from QuackAPI!" },
    image: { label: "Image URL", placeholder: "https://example.com/image.jpg" },
    video: { label: "Video URL", placeholder: "https://example.com/video.mp4" },
    audio: { label: "Audio URL", placeholder: "https://example.com/audio.mp3" },
    document: { label: "Document URL", placeholder: "https://example.com/document.pdf" },
    link: { label: "Link URL", placeholder: "https://ultramsg.com" },
    contact: { label: "Contact Phone", placeholder: "+14155552671" },
    location: { label: "Address", placeholder: "ABC Company, Sixth floor" },
  };

  const needsCaption = ["image", "video"].includes(selectedType);
  const needsFilename = selectedType === "document";
  const needsLocation = selectedType === "location";
  const needsContact = selectedType === "contact";

  return (
    <Card className="border-border/50" data-testid="card-send-test">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Send className="w-4 h-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Send Test Message</CardTitle>
            <CardDescription>Send a message through this device</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => sendMutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="toNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+14155552671" {...field} className="font-mono" data-testid="input-phone" />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">International format e.g. +14155552671</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="link">Link</SelectItem>
                      <SelectItem value="contact">Contact</SelectItem>
                      <SelectItem value="location">Location</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{contentLabel[selectedType]?.label || "Content"}</FormLabel>
                  <FormControl>
                    {selectedType === "text" ? (
                      <Textarea placeholder={contentLabel[selectedType]?.placeholder} rows={3} {...field} data-testid="input-message" />
                    ) : (
                      <Input placeholder={contentLabel[selectedType]?.placeholder} {...field} className="font-mono text-xs" data-testid="input-message" />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {needsCaption && (
              <FormField
                control={form.control}
                name="caption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Caption</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional caption" {...field} data-testid="input-caption" />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            {needsFilename && (
              <FormField
                control={form.control}
                name="filename"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Filename</FormLabel>
                    <FormControl>
                      <Input placeholder="document.pdf" {...field} data-testid="input-filename" />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            {needsContact && (
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} data-testid="input-contact-name" />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            {needsLocation && (
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="lat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input placeholder="25.197197" {...field} className="font-mono text-xs" data-testid="input-lat" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lng"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input placeholder="55.2721877" {...field} className="font-mono text-xs" data-testid="input-lng" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}
            <Button
              type="submit"
              className="w-full shadow-lg shadow-primary/20"
              disabled={sendMutation.isPending || deviceStatus !== "connected"}
              data-testid="button-send"
            >
              {sendMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
              ) : (
                <><Send className="w-4 h-4 mr-2" /> Send</>
              )}
            </Button>
            {deviceStatus !== "connected" && (
              <p className="text-xs text-destructive text-center">Device must be connected to send messages</p>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

type MsgEndpoint = {
  path: string;
  label: string;
  body: Record<string, any>;
};

function getEndpoints(deviceId: number): Record<string, MsgEndpoint> {
  return {
    chat: { path: "/v1/messages/chat", label: "Text", body: { deviceId, to: "+14155552671", body: "Hello from QuackAPI!" } },
    image: { path: "/v1/messages/image", label: "Image", body: { deviceId, to: "+14155552671", image: "https://example.com/image.jpg", caption: "Check this out" } },
    video: { path: "/v1/messages/video", label: "Video", body: { deviceId, to: "+14155552671", video: "https://example.com/video.mp4", caption: "Watch this" } },
    audio: { path: "/v1/messages/audio", label: "Audio", body: { deviceId, to: "+14155552671", audio: "https://example.com/audio.mp3" } },
    document: { path: "/v1/messages/document", label: "Document", body: { deviceId, to: "+14155552671", document: "https://example.com/doc.pdf", filename: "document.pdf" } },
    link: { path: "/v1/messages/link", label: "Link", body: { deviceId, to: "+14155552671", link: "https://ultramsg.com" } },
    contact: { path: "/v1/messages/contact", label: "Contact", body: { deviceId, to: "+14155552671", contact: "+14000000001" } },
    location: { path: "/v1/messages/location", label: "Location", body: { deviceId, to: "+14155552671", address: "ABC Company\\nSixth floor", lat: "25.197197", lng: "55.2721877" } },
  };
}

function generateSnippet(lang: string, url: string, apiKey: string, body: Record<string, any>): string {
  const jsonStr = JSON.stringify(body, null, 2);
  const bodyOneLine = JSON.stringify(body);

  switch (lang) {
    case "curl":
      return `curl -X POST "${url}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey}" \\
  -d '${jsonStr}'`;

    case "javascript":
      return `const response = await fetch("${url}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "${apiKey}"
  },
  body: JSON.stringify(${jsonStr})
});
const data = await response.json();
console.log(data);`;

    case "nodejs":
      return `const axios = require("axios");

const { data } = await axios.post("${url}", ${jsonStr}, {
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "${apiKey}"
  }
});
console.log(data);`;

    case "python":
      return `import requests

response = requests.post(
    "${url}",
    headers={
        "Content-Type": "application/json",
        "x-api-key": "${apiKey}"
    },
    json=${jsonStr.replace(/"/g, '"').replace(/: true/g, ": True").replace(/: false/g, ": False").replace(/: null/g, ": None")}
)
print(response.json())`;

    case "php":
      return `<?php
$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => "${url}",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST => "POST",
    CURLOPT_POSTFIELDS => '${bodyOneLine}',
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "x-api-key: ${apiKey}"
    ],
]);
$response = curl_exec($curl);
$err = curl_error($curl);
curl_close($curl);
echo $err ? "Error: " . $err : $response;`;

    case "java":
      return `import java.net.http.*;
import java.net.URI;

HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("${url}"))
    .header("Content-Type", "application/json")
    .header("x-api-key", "${apiKey}")
    .POST(HttpRequest.BodyPublishers.ofString("${bodyOneLine.replace(/"/g, '\\"')}"))
    .build();

HttpResponse<String> response = client.send(request,
    HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());`;

    case "ruby":
      return `require 'net/http'
require 'json'
require 'uri'

uri = URI.parse("${url}")
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = uri.scheme == "https"

request = Net::HTTP::Post.new(uri.path)
request["Content-Type"] = "application/json"
request["x-api-key"] = "${apiKey}"
request.body = '${bodyOneLine}'

response = http.request(request)
puts response.body`;

    case "csharp":
      return `using System.Net.Http;
using System.Text;

var client = new HttpClient();
client.DefaultRequestHeaders.Add("x-api-key", "${apiKey}");

var content = new StringContent(
    @"${bodyOneLine.replace(/"/g, '""')}",
    Encoding.UTF8, "application/json");

var response = await client.PostAsync("${url}", content);
var result = await response.Content.ReadAsStringAsync();
Console.WriteLine(result);`;

    case "go":
      return `package main

import (
    "bytes"
    "fmt"
    "net/http"
    "io"
)

func main() {
    body := []byte(\`${jsonStr}\`)
    req, _ := http.NewRequest("POST", "${url}",
        bytes.NewBuffer(body))
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("x-api-key", "${apiKey}")

    resp, _ := http.DefaultClient.Do(req)
    defer resp.Body.Close()
    result, _ := io.ReadAll(resp.Body)
    fmt.Println(string(result))
}`;

    case "dart":
      return `import 'package:http/http.dart' as http;
import 'dart:convert';

final response = await http.post(
  Uri.parse('${url}'),
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${apiKey}',
  },
  body: jsonEncode(${jsonStr}),
);
print(response.body);`;

    case "swift":
      return `import Foundation

let url = URL(string: "${url}")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("application/json", forHTTPHeaderField: "Content-Type")
request.setValue("${apiKey}", forHTTPHeaderField: "x-api-key")
request.httpBody = #"${bodyOneLine}"#.data(using: .utf8)

let (data, _) = try await URLSession.shared.data(for: request)
print(String(data: data, encoding: .utf8)!)`;

    case "powershell":
      return `$headers = @{
    "Content-Type" = "application/json"
    "x-api-key"    = "${apiKey}"
}
$body = '${bodyOneLine}'

$response = Invoke-RestMethod -Uri "${url}" \`
    -Method POST -Headers $headers -Body $body
$response | ConvertTo-Json`;

    case "shell":
      return `#!/bin/bash
curl -s -X POST "${url}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey}" \\
  -d '${jsonStr}' | python3 -m json.tool`;

    default:
      return "";
  }
}

const LANGUAGES = [
  { id: "curl", label: "cURL" },
  { id: "nodejs", label: "Node.js" },
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "php", label: "PHP" },
  { id: "java", label: "Java" },
  { id: "ruby", label: "Ruby" },
  { id: "csharp", label: "C#" },
  { id: "go", label: "Go" },
  { id: "dart", label: "Dart" },
  { id: "swift", label: "Swift" },
  { id: "powershell", label: "PowerShell" },
  { id: "shell", label: "Shell" },
];

function ApiDocumentation({ deviceId, apiKey }: { deviceId: number; apiKey: string }) {
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState("curl");
  const [msgType, setMsgType] = useState("chat");
  const [showAllLangs, setShowAllLangs] = useState(false);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const endpoints = useMemo(() => getEndpoints(deviceId), [deviceId]);
  const currentEndpoint = endpoints[msgType];
  const apiUrl = `${baseUrl}${currentEndpoint.path}`;
  const snippet = useMemo(() => generateSnippet(lang, apiUrl, apiKey, currentEndpoint.body), [lang, apiUrl, apiKey, currentEndpoint]);

  const copyCode = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const visibleLangs = showAllLangs ? LANGUAGES : LANGUAGES.slice(0, 6);

  return (
    <Card className="border-border/50" data-testid="card-api-docs">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Code2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <CardTitle className="text-lg">Send Message by API</CardTitle>
            <CardDescription>
              <Badge variant="outline" className="font-mono text-xs mr-2">POST</Badge>
              {currentEndpoint.path}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Message Type</p>
          <div className="flex gap-1.5 flex-wrap">
            {Object.entries(endpoints).map(([key, ep]) => (
              <Button
                key={key}
                variant={msgType === key ? "default" : "outline"}
                size="sm"
                onClick={() => setMsgType(key)}
                className="text-xs h-7 px-2.5"
                data-testid={`button-msgtype-${key}`}
              >
                {ep.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Language</p>
          <div className="flex gap-1.5 flex-wrap items-center">
            {visibleLangs.map((l) => (
              <Button
                key={l.id}
                variant={lang === l.id ? "default" : "outline"}
                size="sm"
                onClick={() => setLang(l.id)}
                className="text-xs h-7 px-2.5"
                data-testid={`button-lang-${l.id}`}
              >
                {l.label}
              </Button>
            ))}
            {!showAllLangs && LANGUAGES.length > 6 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllLangs(true)}
                className="text-xs h-7 px-2 text-muted-foreground"
                data-testid="button-show-more-langs"
              >
                +{LANGUAGES.length - 6} more
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>
        </div>

        <div className="relative group">
          <Button
            variant={copied ? "default" : "secondary"}
            size="sm"
            className={cn(
              "absolute top-3 right-3 z-10 h-8 px-3 text-xs font-medium shadow-md transition-all duration-200",
              copied
                ? "bg-green-600 text-white border-green-600"
                : "bg-zinc-800 text-zinc-200 border-zinc-700 opacity-80 group-hover:opacity-100"
            )}
            onClick={copyCode}
            data-testid="button-copy-code"
          >
            {copied ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
          <pre className="bg-zinc-950 text-zinc-100 p-4 pt-5 rounded-lg text-xs font-mono overflow-x-auto max-h-80 leading-relaxed" data-testid="code-snippet">
            {snippet}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}

function WebhookSettings({ device }: { device: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [webhookUrl, setWebhookUrl] = useState(device.webhookUrl || "");
  const [webhookRetries, setWebhookRetries] = useState(3);
  const [webhookOnReceived, setWebhookOnReceived] = useState(true);
  const [webhookOnAck, setWebhookOnAck] = useState(false);
  const [webhookDownloadMedia, setWebhookDownloadMedia] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await authFetch(`/api/devices/${device.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl: webhookUrl || null }),
      });
      if (!res.ok) throw new Error("Failed to update webhook");
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Saved", description: "Webhook settings updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/devices/:id", device.id] });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <Card className="border-border/50" data-testid="card-webhook">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Globe className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <CardTitle className="text-lg">Webhook Settings</CardTitle>
            <CardDescription>Configure incoming message notifications</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Webhook URL</Label>
          <Input
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://your-api.com/webhook"
            className="font-mono text-xs"
            data-testid="input-webhook-url"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Webhook Retries</Label>
          <Input
            type="number"
            value={webhookRetries}
            onChange={(e) => setWebhookRetries(Number(e.target.value))}
            min={0}
            max={10}
            className="w-24"
            data-testid="input-webhook-retries"
          />
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Webhook on Received</Label>
            <Switch checked={webhookOnReceived} onCheckedChange={setWebhookOnReceived} data-testid="switch-on-received" />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Webhook on ACK</Label>
            <Switch checked={webhookOnAck} onCheckedChange={setWebhookOnAck} data-testid="switch-on-ack" />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Webhook Download Media</Label>
            <Switch checked={webhookDownloadMedia} onCheckedChange={setWebhookDownloadMedia} data-testid="switch-download-media" />
          </div>
        </div>

        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="w-full"
          data-testid="button-save-webhook"
        >
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
}

function QRConnectionPanel({ deviceId, deviceStatus }: { deviceId: number; deviceStatus: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: qrData } = useDeviceQR(deviceId);
  const [isConnecting, setIsConnecting] = useState(false);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const liveStatus = qrData?.status || deviceStatus;

  useEffect(() => {
    if (liveStatus === "connected" && isConnecting) {
      setIsConnecting(false);
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    }
  }, [liveStatus, isConnecting]);

  const handleReconnect = async () => {
    setIsConnecting(true);
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    safetyTimerRef.current = setTimeout(() => setIsConnecting(false), 30000);
    try {
      await authFetch(`/api/devices/${deviceId}/reconnect`, { method: "POST" });
      queryClient.invalidateQueries({ queryKey: [api.devices.qr.path, deviceId] });
      queryClient.invalidateQueries({ queryKey: [api.devices.get.path, deviceId] });
      toast({ title: "Reconnecting", description: "Generating new QR code..." });
    } catch {
      setIsConnecting(false);
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
      toast({ title: "Error", description: "Failed to start reconnection", variant: "destructive" });
    }
  };

  const handleDisconnect = async () => {
    setIsConnecting(false);
    await authFetch(`/api/devices/${deviceId}/disconnect`, { method: "POST" });
    queryClient.invalidateQueries({ queryKey: [api.devices.get.path, deviceId] });
    queryClient.invalidateQueries({ queryKey: [api.devices.list.path] });
    toast({ title: "Disconnected", description: "Device disconnected from WhatsApp" });
  };

  return (
    <Card className="border-border/50" data-testid="card-connection">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Phone className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <CardTitle className="text-lg">Connection</CardTitle>
            <CardDescription>Manage WhatsApp connection</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {liveStatus === "connected" ? (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-green-600">Connected</h3>
              <p className="text-xs text-muted-foreground mt-1">Your WhatsApp is linked and active</p>
            </div>
            <Button variant="destructive" size="sm" onClick={handleDisconnect} data-testid="button-disconnect">
              <WifiOff className="w-4 h-4 mr-2" /> Disconnect
            </Button>
          </div>
        ) : qrData?.qrCode ? (
          <div className="text-center space-y-3">
            <div className="bg-white p-3 rounded-xl shadow-inner border inline-block mx-auto">
              <img src={qrData.qrCode} alt="QR Code" className="w-48 h-48 object-contain" data-testid="img-qr" />
            </div>
            <p className="text-xs text-muted-foreground">Scan with WhatsApp &gt; Linked Devices</p>
          </div>
        ) : isConnecting || liveStatus === "pending" ? (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
              <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
            </div>
            <div>
              <h3 className="font-semibold">Generating QR Code...</h3>
              <p className="text-xs text-muted-foreground mt-1">This may take a few seconds...</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Status: <span className="capitalize font-medium text-foreground">{liveStatus}</span>
            </p>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
              <WifiOff className="w-10 h-10 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Disconnected</h3>
              <p className="text-xs text-muted-foreground mt-1">Connect to start sending messages</p>
            </div>
            <Button onClick={handleReconnect} disabled={isConnecting} data-testid="button-reconnect">
              <RefreshCw className="w-4 h-4 mr-2" />
              Connect
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function WebhookLogs({ device }: { device: any }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data: logs, isLoading } = useQuery({
    queryKey: ["/api/devices", device.id, "webhook-logs"],
    queryFn: async () => {
      const res = await authFetch(`/api/devices/${device.id}/webhook-logs?limit=50`);
      if (!res.ok) throw new Error("Failed to fetch webhook logs");
      return res.json() as Promise<Array<{
        id: number;
        event: string;
        url: string;
        payload: any;
        success: boolean;
        statusCode: number | null;
        errorMessage: string | null;
        createdAt: string;
      }>>;
    },
    refetchInterval: 30000,
    enabled: !!device.webhookUrl,
  });

  const eventColor: Record<string, string> = {
    "message.received": "bg-blue-500/10 text-blue-600 border-blue-500/20",
    "message.sent": "bg-green-500/10 text-green-600 border-green-500/20",
    "message.failed": "bg-red-500/10 text-red-600 border-red-500/20",
  };

  return (
    <Card className="border-border/50" data-testid="card-webhook-logs">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
            <Webhook className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <CardTitle className="text-lg">Webhook Delivery Logs</CardTitle>
            <CardDescription>Recent webhook delivery attempts for this device</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!device.webhookUrl ? (
          <div className="text-center py-10 text-muted-foreground">
            <Webhook className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No webhook URL configured</p>
            <p className="text-xs mt-1">Configure a webhook URL above to start receiving events.</p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !logs || logs.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <RefreshCw className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No webhook events yet</p>
            <p className="text-xs mt-1">Events will appear here when messages are sent or received.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="rounded-lg border border-border/50 overflow-hidden" data-testid={`row-webhook-log-${log.id}`}>
                <div
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                >
                  <div className="shrink-0">
                    {log.success
                      ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                      : <XCircle className="w-4 h-4 text-red-500" />}
                  </div>
                  <Badge variant="outline" className={`text-[10px] shrink-0 ${eventColor[log.event] || ""}`}>
                    {log.event}
                  </Badge>
                  {log.statusCode && (
                    <span className={`text-xs font-mono font-medium shrink-0 ${log.success ? "text-green-600" : "text-red-600"}`}>
                      {log.statusCode}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground truncate flex-1 min-w-0 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span className="truncate">{log.url}</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {log.createdAt ? formatDistanceToNow(new Date(log.createdAt), { addSuffix: true }) : ""}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-muted-foreground shrink-0 transition-transform ${expanded === log.id ? "rotate-180" : ""}`} />
                </div>
                {expanded === log.id && (
                  <div className="border-t border-border/50 bg-muted/20 p-3 space-y-2">
                    {log.errorMessage && (
                      <div className="text-xs text-red-500 font-medium">{log.errorMessage}</div>
                    )}
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide font-semibold">Payload</p>
                      <pre className="text-[11px] font-mono bg-background/50 border border-border/40 rounded p-2 overflow-x-auto text-foreground/80 max-h-40">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MessageHistory({ deviceId }: { deviceId: number }) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: messages, isLoading } = useQuery({
    queryKey: ["/api/messages", deviceId],
    queryFn: async () => {
      const res = await authFetch(`/api/messages?deviceId=${deviceId}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return (await res.json()) as Message[];
    },
    refetchInterval: 5000,
  });

  const filtered = useMemo(() => {
    if (!messages) return [];
    if (statusFilter === "all") return messages;
    return messages.filter((m) => m.status === statusFilter);
  }, [messages, statusFilter]);

  const sortedMessages = useMemo(() => {
    return [...filtered].sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }, [filtered]);

  return (
    <Card className="border-border/50" data-testid="card-messages">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Message History</CardTitle>
              <CardDescription>Recent messages sent from this device</CardDescription>
            </div>
          </div>
          <div className="flex gap-1 flex-wrap">
            {["all", "sent", "pending", "failed"].map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "ghost"}
                size="sm"
                onClick={() => setStatusFilter(s)}
                className="text-xs capitalize"
                data-testid={`button-filter-${s}`}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : sortedMessages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No messages found</p>
            <p className="text-xs mt-1">Send a test message to see it here</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {sortedMessages.map((msg) => (
              <div key={msg.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors" data-testid={`row-message-${msg.id}`}>
                <div className="shrink-0">
                  {msg.status === "sent" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  {msg.status === "pending" && <Clock className="w-4 h-4 text-yellow-500" />}
                  {msg.status === "failed" && <XCircle className="w-4 h-4 text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-medium">{msg.toNumber}</span>
                    <Badge variant="outline" className="text-[10px] capitalize">{msg.type}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{msg.content}</p>
                  {msg.errorReason && <p className="text-xs text-red-500 mt-0.5">{msg.errorReason}</p>}
                </div>
                <div className="text-right shrink-0">
                  <Badge variant={msg.status === "sent" ? "default" : msg.status === "pending" ? "secondary" : "destructive"} className="text-[10px] capitalize">
                    {msg.status}
                  </Badge>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {msg.createdAt ? format(new Date(msg.createdAt), "MMM d, HH:mm") : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
