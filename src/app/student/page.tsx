'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Exam {
    id: string;
    title: string;
    description: string;
    createdAt: string;
}

export default function StudentDashboard() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/exams')
            .then((res) => res.json())
            .then((data) => {
                setExams(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Available Exams</h1>

                {loading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : exams.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-gray-500">No exams available.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {exams.map((exam) => (
                            <div key={exam.id} className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        {exam.title}
                                    </h3>
                                    <div className="mt-2 max-w-xl text-sm text-gray-500">
                                        <p>{exam.description || 'No description provided.'}</p>
                                    </div>
                                    <div className="mt-5">
                                        <Link
                                            href={`/student/exam/${exam.id}`}
                                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 sm:text-sm"
                                        >
                                            Start Exam
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
