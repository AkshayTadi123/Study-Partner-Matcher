"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface Match {
  userName: string;
  studyHabits: string;
  score: number;
  commonInterval: { start: string; end: string };
}

const MatchingStudentsPage = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }

    const fetchMatches = async () => {
      try {
        if (!user._id) throw new Error("User ID missing. Please log in again.");

        const me = await api.get<{ courses: { courseCode: string }[] }>(`/api/user/${user._id}`);
        if (!me.courses.length) {
          setError("No courses found. Go back and add a course first.");
          return;
        }

        const courseCode = me.courses[0].courseCode;
        const results = await api.post<Match[]>("/api/match", {
          courseCode,
          referenceStudentId: user._id,
        });
        setMatches(results);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load matches");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [user, router]);

  const compatibilityPercent = (score: number) => Math.round((score / 10000) * 100);

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <button
        onClick={() => router.back()}
        className="mb-6 px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600"
      >
        Back
      </button>

      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Your Study Matches</h1>

      {loading && <p className="text-center text-gray-500">Finding your best matches...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && matches.length === 0 && (
        <p className="text-center text-gray-500">No compatible study partners found for your course.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {matches.map((match, index) => {
          const pct = compatibilityPercent(match.score);
          return (
            <div
              key={index}
              className="transform transition duration-200 hover:scale-105 p-6 bg-white border rounded-lg shadow-md text-center cursor-pointer"
              onClick={() => router.push("/usermatching")}
            >
              <div className="w-24 h-24 rounded-full bg-indigo-200 mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-indigo-700">
                {match.userName[0].toUpperCase()}
              </div>

              <h3 className="text-lg font-bold">{match.userName}</h3>

              <p
                className={`text-2xl font-semibold mt-2 ${
                  pct >= 90 ? "text-green-500" : pct >= 70 ? "text-yellow-500" : "text-red-500"
                }`}
              >
                Compatibility: {pct}%
              </p>

              <p className="text-sm text-gray-500 mt-2 italic line-clamp-2">{match.studyHabits}</p>

              <p className="text-xs text-gray-400 mt-2">
                Common time: {new Date(match.commonInterval.start).toLocaleString()} →{" "}
                {new Date(match.commonInterval.end).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MatchingStudentsPage;
