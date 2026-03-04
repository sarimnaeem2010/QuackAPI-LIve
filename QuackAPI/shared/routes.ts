import { z } from 'zod';
import { 
  insertUserSchema, 
  insertDeviceSchema, 
  insertPaymentSchema,
  users, devices, messages, payments 
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/auth/register' as const,
      input: insertUserSchema,
      responses: {
        201: z.object({ user: z.any(), token: z.string() }),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: z.object({ email: z.string(), password: z.string() }),
      responses: {
        200: z.object({ user: z.any(), token: z.string() }),
        401: errorSchemas.unauthorized,
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: {
        200: z.object({ user: z.any() }),
        401: errorSchemas.unauthorized,
      },
    },
  },
  devices: {
    list: {
      method: 'GET' as const,
      path: '/api/devices' as const,
      responses: {
        200: z.array(z.any()), // DeviceResponse[]
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/devices' as const,
      input: z.object({ deviceName: z.string() }),
      responses: {
        201: z.any(),
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/devices/:id' as const,
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/devices/:id' as const,
      input: z.object({ webhookUrl: z.string().url().optional() }),
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/devices/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    qr: {
      method: 'GET' as const,
      path: '/api/devices/:id/qr' as const,
      responses: {
        200: z.object({ qrCode: z.string().nullable(), status: z.string() }),
        404: errorSchemas.notFound,
      },
    }
  },
  payments: {
    list: {
      method: 'GET' as const,
      path: '/api/payments' as const,
      responses: {
        200: z.array(z.any()),
        401: errorSchemas.unauthorized,
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/payments' as const,
      input: z.object({
        gateway: z.enum(["jazzcash", "easypaisa", "stripe"]),
        plan: z.enum(["monthly", "yearly"])
      }),
      responses: {
        201: z.object({ paymentUrl: z.string(), paymentId: z.number() }),
        401: errorSchemas.unauthorized,
      }
    }
  },
  messages: {
    list: {
      method: 'GET' as const,
      path: '/api/messages' as const,
      input: z.object({ deviceId: z.coerce.number().optional() }).optional(),
      responses: {
        200: z.array(z.any()),
        401: errorSchemas.unauthorized,
      }
    }
  },
  deviceActions: {
    stats: {
      method: 'GET' as const,
      path: '/api/devices/:id/stats' as const,
      responses: {
        200: z.object({ sent: z.number(), pending: z.number(), failed: z.number(), total: z.number() }),
        404: errorSchemas.notFound,
      }
    },
    send: {
      method: 'POST' as const,
      path: '/api/devices/:id/send' as const,
      input: z.object({
        toNumber: z.string(),
        content: z.string().optional().default(""),
        type: z.enum(["text", "image", "video", "audio", "document", "link", "contact", "location"]).optional().default("text"),
        mediaUrl: z.string().url().optional(),
        caption: z.string().optional(),
        filename: z.string().optional(),
        lat: z.string().optional(),
        lng: z.string().optional(),
        address: z.string().optional(),
        contactName: z.string().optional(),
        contactPhone: z.string().optional(),
      }),
      responses: {
        200: z.object({ success: z.boolean(), messageId: z.number(), status: z.string() }),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      }
    },
    disconnect: {
      method: 'POST' as const,
      path: '/api/devices/:id/disconnect' as const,
      responses: {
        200: z.object({ message: z.string() }),
        404: errorSchemas.notFound,
      }
    },
    reconnect: {
      method: 'POST' as const,
      path: '/api/devices/:id/reconnect' as const,
      responses: {
        200: z.object({ message: z.string() }),
        404: errorSchemas.notFound,
      }
    },
  },
  external: {
    sendMessage: {
      method: 'POST' as const,
      path: '/v1/messages/send' as const,
      input: z.object({
        deviceId: z.number(),
        toNumber: z.string(),
        content: z.string(),
        type: z.enum(["text", "image", "video", "audio", "document", "link", "contact", "location"]).optional().default("text"),
        mediaUrl: z.string().url().optional(),
        caption: z.string().optional(),
        filename: z.string().optional(),
        lat: z.string().optional(),
        lng: z.string().optional(),
        address: z.string().optional(),
        contactName: z.string().optional(),
        contactPhone: z.string().optional(),
      }),
      responses: {
        200: z.object({ success: z.boolean(), messageId: z.number() }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      }
    },
    chat: {
      method: 'POST' as const,
      path: '/v1/messages/chat' as const,
      input: z.object({
        deviceId: z.number(),
        to: z.string(),
        body: z.string(),
      }),
    },
    image: {
      method: 'POST' as const,
      path: '/v1/messages/image' as const,
      input: z.object({
        deviceId: z.number(),
        to: z.string(),
        image: z.string(),
        caption: z.string().optional(),
      }),
    },
    video: {
      method: 'POST' as const,
      path: '/v1/messages/video' as const,
      input: z.object({
        deviceId: z.number(),
        to: z.string(),
        video: z.string(),
        caption: z.string().optional(),
      }),
    },
    audio: {
      method: 'POST' as const,
      path: '/v1/messages/audio' as const,
      input: z.object({
        deviceId: z.number(),
        to: z.string(),
        audio: z.string(),
      }),
    },
    document: {
      method: 'POST' as const,
      path: '/v1/messages/document' as const,
      input: z.object({
        deviceId: z.number(),
        to: z.string(),
        document: z.string(),
        filename: z.string().optional(),
      }),
    },
    link: {
      method: 'POST' as const,
      path: '/v1/messages/link' as const,
      input: z.object({
        deviceId: z.number(),
        to: z.string(),
        link: z.string(),
      }),
    },
    contact: {
      method: 'POST' as const,
      path: '/v1/messages/contact' as const,
      input: z.object({
        deviceId: z.number(),
        to: z.string(),
        contact: z.string(),
      }),
    },
    location: {
      method: 'POST' as const,
      path: '/v1/messages/location' as const,
      input: z.object({
        deviceId: z.number(),
        to: z.string(),
        address: z.string().optional(),
        lat: z.string(),
        lng: z.string(),
      }),
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
