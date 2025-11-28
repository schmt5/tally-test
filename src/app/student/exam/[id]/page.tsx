'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

interface Exam {
    id: string;
    title: string;
    tallyFormId: string;
    description: string;
}

export default function TakeExam({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [exam, setExam] = useState<Exam | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Unwrap params using React.use()
    const { id } = use(params);

    useEffect(() => {
        // Fetch exam details
        fetch('/api/exams') // Ideally we should have a single exam endpoint, but list is fine for now or filter client side
            .then((res) => res.json())
            .then((data: Exam[]) => {
                const foundExam = data.find((e) => e.id === id);
                if (foundExam) {
                    setExam(foundExam);

                    // Check for duplicate submission (mock check for now)
                    // In a real app, we'd check against the user's session/ID
                    const submittedExams = JSON.parse(localStorage.getItem('submittedExams') || '[]');
                    if (submittedExams.includes(foundExam.id)) {
                        setError('You have already submitted this exam.');
                    }
                } else {
                    setError('Exam not found');
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError('Failed to load exam');
                setLoading(false);
            });
    }, [id]);

    // Listen for Tally form submission
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // Tally sends a message when form is submitted
            // Format: { event: 'Tally.FormSubmitted', payload: { ... } }
            if (event.data?.event === 'Tally.FormSubmitted') {
                // Mark as submitted locally
                const submittedExams = JSON.parse(localStorage.getItem('submittedExams') || '[]');
                if (id && !submittedExams.includes(id)) {
                    submittedExams.push(id);
                    localStorage.setItem('submittedExams', JSON.stringify(submittedExams));
                }

                // Redirect or show success
                alert('Exam submitted successfully!');
                router.push('/student');
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [id, router]);

    if (loading) return <div className="text-center py-12">Loading...</div>;
    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow text-center">
                <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
                <p className="text-gray-700 mb-6">{error}</p>
                <button
                    onClick={() => router.push('/student')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );

    if (!exam) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900">{exam.title}</h1>
                    {exam.description && <p className="mt-2 text-gray-600">{exam.description}</p>}
                </div>
            </div>

            <div className="flex-grow container mx-auto p-4">
                <div className="bg-white shadow rounded-lg overflow-hidden h-full min-h-[600px]">
                    <iframe
                        src={`https://tally.so/embed/${exam.tallyFormId}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        marginHeight={0}
                        marginWidth={0}
                        title={exam.title}
                        className="w-full h-full min-h-[800px]"
                    ></iframe>
                </div>
            </div>
        </div>
    );
}
