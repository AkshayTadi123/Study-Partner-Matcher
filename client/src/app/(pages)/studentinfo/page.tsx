"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type TimeBlock = { start: Date; end: Date };

const StudentInfoPage = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dates, setDates] = useState<TimeBlock[]>([]);
  const [courseInput, setCourseInput] = useState("");
  const [course, setCourse] = useState<string | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [studyHabit, setStudyHabit] = useState("");
  const [studyHabits, setStudyHabits] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const convertToDate = (timeString: string): Date => {
    const date = new Date(selectedDate!.getTime());
    const [hours, minutes] = timeString.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const handleAddTimeBlock = () => {
    if (!startTime || !endTime) return;
    setDates([...dates, { start: convertToDate(startTime), end: convertToDate(endTime) }]);
    setStartTime("");
    setEndTime("");
  };

  const handleStudyHabitEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && studyHabit.trim()) {
      setStudyHabits((prev) => [...prev, studyHabit.trim()]);
      setStudyHabit("");
    }
  };

  const handleSubmit = async () => {
    if (!user) { router.push("/login"); return; }
    if (!course) { setError("Please add a course."); return; }
    if (dates.length === 0) { setError("Please add at least one time block."); return; }

    setError(null);
    setLoading(true);
    try {
      // Ensure the course exists (create if it doesn't)
      let courseDoc: { _id: string };
      const courses = await api.get<{ _id: string; courseCode: string }[]>("/api/course");
      const existing = courses.find(c => c.courseCode === course);

      if (existing) {
        courseDoc = existing;
      } else {
        courseDoc = await api.post<{ _id: string }>("/api/course", { courseCode: course });
      }

      if (!user._id) throw new Error("User ID not found. Please log in again.");

      await api.post("/api/course/addStudent", {
        courseID: courseDoc._id,
        userID: user._id,
      });

      await api.patch(`/api/user/${user._id}`, {
        timeIntervals: dates,
        studyHabits: studyHabits.join(", "),
      });

      router.push("/matching-students");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-semibold text-gray-900 text-center mb-6">
          Weekly Study Information
        </h1>

        {error && <p className="mb-4 text-sm text-red-600 text-center">{error}</p>}

        {/* Course Input */}
        <div className="flex items-center mb-6">
          <label className="text-lg text-gray-800 w-1/3">Course</label>
          <input
            value={courseInput}
            onChange={(e) => setCourseInput(e.target.value)}
            className="rounded-md border-2 border-gray-300 p-2 flex-grow"
            placeholder="Enter course code (e.g. EECS3101)"
          />
          <button
            onClick={course ? () => setCourse(null) : () => { if (courseInput) { setCourse(courseInput); setCourseInput(""); } }}
            className={`ml-4 px-4 py-2 rounded-md ${course ? "bg-red-500" : "bg-blue-500"} text-white`}
          >
            {course ? "Remove" : "Add"}
          </button>
        </div>
        {course && (
          <p className="text-gray-600 text-center mb-6">Current Course: {course}</p>
        )}

        {/* Calendar and Time Block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="flex flex-col items-center p-4 border border-gray-300 rounded-md shadow-sm bg-gray-50">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Choose a Date</h2>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border p-4 w-full"
            />
          </div>

          <div className="flex flex-col items-center p-4 border border-gray-300 rounded-md shadow-sm bg-gray-50">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Select Time Block</h2>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="rounded-md border-2 border-gray-300 p-2 w-full mb-4"
            />
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="rounded-md border-2 border-gray-300 p-2 w-full mb-4"
            />
            <button
              onClick={handleAddTimeBlock}
              className="bg-blue-500 text-white px-6 py-2 rounded-md"
            >
              Add Time Block
            </button>
          </div>
        </div>

        {dates.length > 0 && (
          <div className="mb-8 text-center">
            <h3 className="text-lg font-semibold text-gray-800">Added Time Blocks</h3>
            {dates.map((d, i) => (
              <p key={i} className="text-gray-700">
                {d.start.toLocaleString()} → {d.end.toLocaleString()}
              </p>
            ))}
          </div>
        )}

        {/* Study Habits */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-800 mb-2">Study Habits</h2>
          <input
            value={studyHabit}
            onChange={(e) => setStudyHabit(e.target.value)}
            onKeyDown={handleStudyHabitEnter}
            className="rounded-md border-2 border-gray-300 p-2 w-full mb-4"
            placeholder="Enter a study habit and press Enter"
          />
          {studyHabits.length > 0 && (
            <ul className="list-disc list-inside text-gray-600 ml-4">
              {studyHabits.map((h, i) => <li key={i}>{h}</li>)}
            </ul>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-green-500 text-white py-3 rounded-md text-xl disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit & Find Matches"}
        </button>
      </div>
    </div>
  );
};

export default StudentInfoPage;
