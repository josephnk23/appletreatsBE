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

        // Handle empty or non-JSON responses
        const text = await response.text();
        let data: any = null;

        if (text) {
            try {
                data = JSON.parse(text);
            } catch {
                console.log(`Emmisor ${method} ${endpoint} non-JSON response:`, text);
                if (!response.ok) {
                    throw new Error(`Emmisor request failed: ${response.status} - ${text}`);
                }
                return { success: true, rawResponse: text };
            }
        }

        console.log(`Emmisor ${method} ${endpoint} response:`, data);

        if (!response.ok) {
            const error = new Error(data?.error || `Emmisor request failed: ${response.status}`);
            (error as any).code = data?.code;
            throw error;
        }
        return data ?? { success: true };
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

    async sendBulkEmail({ subject, html, text, recipients }: {
        subject: string;
        html: string;
        text?: string;
        recipients: Array<{ email: string; variables?: Record<string, string> }>;
    }) {
        return this.request('/email/send-bulk', 'POST', { subject, html, text, recipients });
    }

    // Service-slug contact management
    async subscribeContact(serviceSlug: string, { email, firstName, lastName, phone }: {
        email: string;
        firstName: string;
        lastName: string;
        phone?: string;
    }) {
        return this.request(`/${serviceSlug}/contacts/subscribe`, 'POST', {
            email,
            firstName,
            lastName,
            phone,
        });
    }

    async unsubscribeContact(serviceSlug: string, email: string) {
        return this.request(`/${serviceSlug}/contacts/unsubscribe`, 'POST', { email });
    }

    async sendEmailToList(serviceSlug: string, { subject, html, text, variables }: {
        subject: string;
        html: string;
        text?: string;
        variables?: Record<string, string>;
    }) {
        return this.request(`/${serviceSlug}/email/send`, 'POST', { subject, html, text, variables });
    }

    async getListInfo(serviceSlug: string) {
        return this.request(`/${serviceSlug}/lists`);
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
