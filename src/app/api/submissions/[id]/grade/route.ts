import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const body = await request.json();
        const { score, feedback } = body;

        const submission = await prisma.submission.update({
            where: { id },
            data: {
                score: Number(score),
                feedback,
                status: 'GRADED',
            },
        });

        return NextResponse.json(submission);
    } catch (error) {
        console.error('Error grading submission:', error);
        return NextResponse.json({ error: 'Failed to grade submission' }, { status: 500 });
    }
}
