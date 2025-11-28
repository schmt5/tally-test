export interface TallyForm {
    id: string;
    name: string;
    fields: TallyField[];
}

export interface TallyField {
    key: string;
    label: string;
    type: string;
    options?: { id: string; text: string }[];
}

const TALLY_API_URL = 'https://api.tally.so';

export async function getTallyForm(formId: string): Promise<any> {
    const apiKey = process.env.TALLY_API_KEY;

    if (!apiKey) {
        console.warn('No TALLY_API_KEY found, returning mock data');
        return getMockForm(formId);
    }

    try {
        // Use the /forms endpoint to get full blocks with answer options
        const response = await fetch(`${TALLY_API_URL}/forms/${formId}`, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch form: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Tally form:', error);
        throw error;
    }
}

function getMockForm(formId: string): TallyForm {
    return {
        id: formId,
        name: 'Mock Exam',
        fields: [
            {
                key: 'question_1',
                label: 'What is the capital of France?',
                type: 'MULTIPLE_CHOICE',
                options: [
                    { id: 'opt_1', text: 'Paris' },
                    { id: 'opt_2', text: 'London' },
                    { id: 'opt_3', text: 'Berlin' },
                ],
            },
            {
                key: 'question_2',
                label: 'What is 2 + 2?',
                type: 'MULTIPLE_CHOICE',
                options: [
                    { id: 'opt_4', text: '3' },
                    { id: 'opt_5', text: '4' },
                    { id: 'opt_6', text: '5' },
                ],
            },
            {
                key: 'email',
                label: 'Email',
                type: 'EMAIL',
            },
        ],
    };
}
