import fetch from 'node-fetch';

async function verifyWebhook() {
    const baseUrl = 'http://localhost:3000';

    // 1. Create an exam first (or get existing one)
    console.log('Creating test exam...');
    const examRes = await fetch(`${baseUrl}/api/exams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            tallyFormId: 'm6DkX9', // Example ID
            title: 'Test Exam',
            description: 'This is a test exam created by verification script',
        }),
    });

    let examId;
    if (examRes.ok) {
        const exam = await examRes.json();
        examId = exam.id;
        console.log('Exam created:', examId);
    } else {
        // Maybe it already exists, let's fetch list
        console.log('Exam might already exist, fetching list...');
        const listRes = await fetch(`${baseUrl}/api/exams`);
        const exams = await listRes.json();
        const found = exams.find((e: any) => e.tallyFormId === 'm6DkX9');
        if (found) {
            examId = found.id;
            console.log('Found existing exam:', examId);
        } else {
            console.error('Failed to create or find exam');
            return;
        }
    }

    // 2. Simulate Webhook
    console.log('Simulating webhook submission...');
    const webhookUrl = `${baseUrl}/api/webhooks/tally/${examId}`;

    const payload = {
        eventId: 'evt_123',
        createdAt: new Date().toISOString(),
        data: {
            responseId: 'resp_123',
            submissionId: 'sub_123',
            respondentId: 'res_123',
            formId: 'm6DkX9',
            formName: 'Test Exam',
            createdAt: new Date().toISOString(),
            fields: [
                {
                    key: 'question_1',
                    label: 'What is the capital of France?',
                    type: 'MULTIPLE_CHOICE',
                    value: 'opt_1',
                    options: [{ id: 'opt_1', text: 'Paris' }]
                },
                {
                    key: 'email',
                    label: 'Email',
                    type: 'EMAIL',
                    value: 'student@example.com'
                }
            ]
        }
    };

    const webhookRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (webhookRes.ok) {
        const data = await webhookRes.json();
        console.log('Webhook processed successfully:', data);
    } else {
        console.error('Webhook failed:', await webhookRes.text());
    }
}

verifyWebhook().catch(console.error);
