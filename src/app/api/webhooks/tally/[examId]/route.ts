import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ examId: string }> }
) {
    const { examId } = await params;

    try {
        const body = await request.json();

        // Tally webhook payload structure verification needed
        // Assuming body contains fields and answers
        // For now, we store the entire body as answers
        // We need to extract student email if possible. 
        // Tally sends 'data' object with fields.

        const { data } = body;

        if (!data) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        // Find the exam to ensure it exists
        const exam = await prisma.exam.findUnique({
            where: { id: examId },
        });

        if (!exam) {
            return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
        }

        // Try to find an email field
        let studentId = 'anonymous';
        const emailField = data.fields?.find((f: any) => f.type === 'EMAIL');
        if (emailField && emailField.value) {
            studentId = emailField.value;
        } else {
            // Fallback: check if there is a question with key 'email' or label containing 'email'
            const emailKeyField = data.fields?.find((f: any) => f.key === 'email' || f.label.toLowerCase().includes('email'));
            if (emailKeyField && emailKeyField.value) {
                studentId = emailKeyField.value;
            }
        }

        // Check for duplicate submission if needed (though requirement says check BEFORE taking, 
        // but we should also handle re-submissions or duplicates here if we want to enforce it strict)
        // For now, we just create a new submission.

        const submission = await prisma.submission.create({
            data: {
                examId: exam.id,
                studentId,
                answers: JSON.stringify(data),
                status: 'PENDING',
            },
        });

        return NextResponse.json({ success: true, submissionId: submission.id });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
