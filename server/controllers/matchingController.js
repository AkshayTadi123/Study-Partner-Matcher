const { OpenAI } = require('openai');
const Course = require('../models/courseModel');
const User = require('../models/userModel');

let _openai;
const getOpenAI = () => {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
};

function findOverlap(intervals1, intervals2) {
  for (const a of intervals1) {
    for (const b of intervals2) {
      const start = new Date(Math.max(new Date(a.start), new Date(b.start)));
      const end = new Date(Math.min(new Date(a.end), new Date(b.end)));
      if (start < end) return { start, end };
    }
  }
  return null;
}

const getMatchedStudents = async (req, res) => {
  const { courseCode, referenceStudentId } = req.body;

  if (!courseCode || !referenceStudentId) {
    return res.status(400).json({ message: 'courseCode and referenceStudentId are required.' });
  }

  try {
    const course = await Course.findOne({ courseCode }).populate('students');
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const referenceStudent = await User.findById(referenceStudentId);
    if (!referenceStudent) return res.status(404).json({ message: 'Reference student not found' });

    const candidates = course.students.filter(
      s => s._id.toString() !== referenceStudentId
    );

    const scored = await Promise.all(
      candidates.map(async (student) => {
        const commonInterval = findOverlap(referenceStudent.timeIntervals, student.timeIntervals);
        if (!commonInterval) return null;

        const prompt = `Assess the compatibility between the following two users and return a score out of 10000.
Add random fluctuation so the result is not round. Return only the number.
User 1: ${referenceStudent.studyHabits}
User 2: ${student.studyHabits}`;

        const response = await getOpenAI().chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
        });

        const score = parseInt(response.choices[0].message.content, 10);
        return {
          userName: student.userName,
          studyHabits: student.studyHabits,
          score,
          commonInterval,
        };
      })
    );

    const results = scored
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    res.json(results);
  } catch (error) {
    console.error('Error in getMatchedStudents:', error);
    res.status(500).json({ message: 'Error fetching matched students.', error: error.message });
  }
};

module.exports = { getMatchedStudents };
