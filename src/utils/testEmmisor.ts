import { config } from 'dotenv';

// Load environment variables
config();

const API_KEY = process.env.EMMISOR_API_KEY || '';
const BASE_URL = process.env.EMMISOR_URL || 'http://localhost:8000';
const FULL_URL = `${BASE_URL}/api/v1/external`;

async function test() {
    console.log('='.repeat(50));
    console.log('EMMISOR EXTERNAL API TEST');
    console.log('='.repeat(50));

    console.log('\nConfiguration:');
    console.log('  BASE_URL:', BASE_URL);
    console.log('  FULL_URL:', FULL_URL);
    console.log('  API_KEY:', API_KEY ? `${API_KEY.slice(0, 8)}...` : 'NOT SET');

    if (!API_KEY) {
        console.error('\n❌ EMMISOR_API_KEY is not set in .env file!');
        return;
    }

    // Test 1: Status (no key - should fail)
    console.log('\n1. Testing without API key (should fail with 401)...');
    try {
        const res = await fetch(`${FULL_URL}/status`);
        console.log('   Status:', res.status);
        const text = await res.text();
        console.log('   Response:', text ? tryParseJSON(text) : '(empty)');
    } catch (err: any) {
        console.error('   Error:', err.message);
    }

    // Test 2: Status with key
    console.log('\n2. Testing /status with API key...');
    try {
        const res = await fetch(`${FULL_URL}/status`, {
            headers: { 'x-api-key': API_KEY },
        });
        console.log('   Status:', res.status);
        const text = await res.text();
        console.log('   Response:', text ? tryParseJSON(text) : '(empty)');
    } catch (err: any) {
        console.error('   Error:', err.message);
    }

    // Test 3: Send Email
    console.log('\n3. Testing /email/send...');
    try {
        const res = await fetch(`${FULL_URL}/email/send`, {
            method: 'POST',
            headers: {
                'x-api-key': API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: 'danieltesla746@gmail.com',
                subject: 'Test from External API',
                html: '<h1>Hello!</h1><p>This is a test email from Emmisor External API.</p>',
            }),
        });
        console.log('   Status:', res.status);
        const text = await res.text();
        console.log('   Response:', text ? tryParseJSON(text) : '(empty)');
    } catch (err: any) {
        console.error('   Error:', err.message);
    }

    // Test 4: Send Email with Variables
    console.log('\n4. Testing /email/send with variables...');
    try {
        const res = await fetch(`${FULL_URL}/email/send`, {
            method: 'POST',
            headers: {
                'x-api-key': API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: 'danieltesla746@gmail.com',
                subject: 'Hello {{name}}!',
                html: '<h1>Welcome, {{name}}!</h1><p>Your order #{{orderId}} has been confirmed.</p>',
                variables: {
                    name: 'John',
                    orderId: '12345',
                },
            }),
        });
        console.log('   Status:', res.status);
        const text = await res.text();
        console.log('   Response:', text ? tryParseJSON(text) : '(empty)');
    } catch (err: any) {
        console.error('   Error:', err.message);
    }

    console.log('\n' + '='.repeat(50));
    console.log('TESTS COMPLETE');
    console.log('='.repeat(50));
}

function tryParseJSON(text: string): string {
    try {
        const parsed = JSON.parse(text);
        return JSON.stringify(parsed, null, 2);
    } catch {
        return text;
    }
}

test();
