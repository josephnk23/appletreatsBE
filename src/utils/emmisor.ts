import { env } from '../config/env.js';

class EmmisorClient {
    private apiKey: string;
    private baseUrl: string;

    constructor(apiKey: string, baseUrl: string) {
        this.apiKey = apiKey;
        this.baseUrl = `${baseUrl}/api/v1/external`;
    }

    private async request(endpoint: string, method: string = 'GET', body: any = null) {
        const options: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
            },
        };
        if (body) options.body = JSON.stringify(body);

        const response = await fetch(`${this.baseUrl}${endpoint}`, options);
        const data: any = await response.json();

        console.log(`Emmisor ${method} ${endpoint} response:`, data);

        if (!response.ok) {
            throw new Error(data.error || `Emmisor request failed: ${response.status}`);
        }
        return data;
    }

    async sendEmail({ to, subject, html, text, variables }: {
        to: string | string[];
        subject: string;
        html: string;
        text?: string;
        variables?: Record<string, string>;
    }) {
        return this.request('/email/send', 'POST', { to, subject, html, text, variables });
    }

    async getStatus() {
        return this.request('/status');
    }
}

// Singleton — only instantiated if env vars are present
let client: EmmisorClient | null = null;

export function getEmmisorClient(): EmmisorClient | null {
    if (client) return client;
    if (!env.EMMISOR_API_KEY || !env.EMMISOR_URL) return null;
    client = new EmmisorClient(env.EMMISOR_API_KEY, env.EMMISOR_URL);
    return client;
}
