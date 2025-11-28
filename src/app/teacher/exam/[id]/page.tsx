'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';

interface Submission {
    id: string;
    studentId: string;
    answers: string;
    status: string;
    score: number | null;
    feedback: string | null;
    submittedAt: string;
}

interface Exam {
    id: string;
    title: string;
    tallyFormId: string;
    questions: string;
    submissions: Submission[];
}

export default function ExamDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [exam, setExam] = useState<Exam | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [gradeData, setGradeData] = useState({ score: '', feedback: '' });
    const [grading, setGrading] = useState(false);

    useEffect(() => {
        fetchExam();
    }, [id]);

    const fetchExam = () => {
        fetch(`/api/exams/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setExam(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    };

    const handleGrade = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSubmission) return;

        setGrading(true);
        try {
            const res = await fetch(`/api/submissions/${selectedSubmission.id}/grade`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(gradeData),
            });

            if (res.ok) {
                // Refresh data
                fetchExam();
                setSelectedSubmission(null);
                setGradeData({ score: '', feedback: '' });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setGrading(false);
        }
    };

    if (loading) return <div className="text-center py-12">Loading...</div>;
    if (!exam) return <div className="text-center py-12">Exam not found</div>;

    // Parse questions to display labels if needed, but for now we just show raw answers
    // const questions = JSON.parse(exam.questions); 

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <Link href="/teacher" className="text-indigo-600 hover:text-indigo-800 mb-2 inline-block">
                            &larr; Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">{exam.title}</h1>
                        <p className="text-gray-500">Form ID: {exam.tallyFormId}</p>
                    </div>
                    <div className="bg-white p-4 rounded shadow">
                        <p className="text-sm text-gray-500">Webhook URL</p>
                        <code className="text-xs bg-gray-100 p-1 rounded block mt-1">
                            {typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/tally/${exam.id}` : `/api/webhooks/tally/${exam.id}`}
                        </code>
                    </div>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Exam Questions</h3>
                        <div className="mt-4 space-y-4">
                            {exam.questions && (() => {
                                const formData = JSON.parse(exam.questions);

                                // Get unique question groups
                                const questionGroups = new Map();
                                formData.blocks?.forEach((block: any) => {
                                    if (block.groupType === 'QUESTION' || block.groupType === 'CHECKBOXES') {
                                        if (!questionGroups.has(block.groupUuid)) {
                                            questionGroups.set(block.groupUuid, {
                                                uuid: block.groupUuid,
                                                type: block.groupType,
                                                blocks: []
                                            });
                                        }
                                    }
                                });

                                // Group all blocks by their groupUuid
                                formData.blocks?.forEach((block: any) => {
                                    if (questionGroups.has(block.groupUuid)) {
                                        questionGroups.get(block.groupUuid).blocks.push(block);
                                    }
                                });

                                return Array.from(questionGroups.values()).map((group: any, index: number) => {
                                    const titleBlock = group.blocks.find((b: any) => b.type === 'TITLE');
                                    const optionBlocks = group.blocks.filter((b: any) =>
                                        b.type === 'CHECKBOX' || b.type === 'RADIO_BUTTON'
                                    );

                                    const questionText = titleBlock?.payload?.safeHTMLSchema?.[0]?.[0] || 'Question';

                                    return (
                                        <div key={group.uuid} className="bg-gray-50 p-3 rounded">
                                            <p className="font-medium text-gray-900">
                                                {index + 1}. {questionText}
                                            </p>
                                            <p className="text-sm text-gray-500">Type: {group.type}</p>
                                            {optionBlocks.length > 0 && (
                                                <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                                                    {optionBlocks.map((opt: any) => (
                                                        <li key={opt.uuid}>
                                                            {opt.payload?.text || opt.payload?.safeHTMLSchema?.[0]?.[0] || opt.payload?.label || 'Option'}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>

                <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Submissions</h3>
                    </div>
                    <ul className="divide-y divide-gray-200">
                        {exam.submissions.length === 0 ? (
                            <li className="px-4 py-4 text-center text-gray-500">No submissions yet.</li>
                        ) : (
                            exam.submissions.map((submission) => (
                                <li key={submission.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-indigo-600">
                                                    {submission.studentId}
                                                </p>
                                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${submission.status === 'GRADED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {submission.status}
                                                </p>
                                            </div>
                                            <div className="mt-2 text-sm text-gray-500">
                                                <p>Submitted: {new Date(submission.submittedAt).toLocaleString()}</p>
                                                {submission.score !== null && <p>Score: {submission.score}</p>}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedSubmission(submission);
                                                setGradeData({
                                                    score: submission.score?.toString() || '',
                                                    feedback: submission.feedback || ''
                                                });
                                            }}
                                            className="ml-4 px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Grade / View
                                        </button>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                {selectedSubmission && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                            <h2 className="text-xl font-bold mb-4">Grading Submission</h2>
                            <div className="mb-6">
                                <h3 className="font-medium text-gray-900 mb-2">Answers</h3>
                                <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap">
                                    {JSON.stringify(JSON.parse(selectedSubmission.answers), null, 2)}
                                </pre>
                            </div>

                            <form onSubmit={handleGrade} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Score</label>
                                    <input
                                        type="number"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                        value={gradeData.score}
                                        onChange={(e) => setGradeData({ ...gradeData, score: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Feedback</label>
                                    <textarea
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                        value={gradeData.feedback}
                                        onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                                    />
                                </div>
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedSubmission(null)}
                                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={grading}
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        {grading ? 'Saving...' : 'Save Grade'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}
