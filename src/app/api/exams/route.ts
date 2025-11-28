import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTallyForm } from '@/lib/tally';

export async function GET() {
    try {
        const exams = await prisma.exam.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(exams);
    } catch (error) {
        console.error('Error fetching exams:', error);
        return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { tallyFormId, title, description } = body;

        if (!tallyFormId || !title) {
            return NextResponse.json(
                { error: 'Missing required fields: tallyFormId, title' },
                { status: 400 }
            );
        }

        // Fetch form structure from Tally
        const tallyForm = await getTallyForm(tallyFormId);

        const exam = await prisma.exam.create({
            data: {
                tallyFormId,
                title,
                description,
                questions: JSON.stringify(tallyForm),
            },
        });

        return NextResponse.json(exam);
    } catch (error) {
        console.error('Error creating exam:', error);
        // Check for unique constraint violation
        if ((error as any).code === 'P2002') {
            return NextResponse.json(
                { error: 'Exam with this Tally Form ID already exists' },
                { status: 409 }
            );
        }
        return NextResponse.json({ error: 'Failed to create exam' }, { status: 500 });
    }
}
