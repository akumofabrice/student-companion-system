import React from 'react';
import ModuleShell from './ModuleShell';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function TimetablePage({
  courseInput,
  setCourseInput,
  breakInput,
  setBreakInput,
  timetable,
  generateTimetable,
  navigate,
}) {
  return (
    <ModuleShell
      title="Timetable"
      description="Plan your week around your classes and breaks."
      onBack={() => navigate('/')}
    >
      <div className="page-grid">
        <div className="card">
          <h4>Generate timetable</h4>
          <form onSubmit={generateTimetable} className="stack">
            <textarea
              placeholder="Courses separated by commas"
              value={courseInput}
              onChange={(e) => setCourseInput(e.target.value)}
              required
            />
            <textarea
              placeholder="Breaks as day,startTime,endTime; day,startTime,endTime"
              value={breakInput}
              onChange={(e) => setBreakInput(e.target.value)}
            />
            <button type="submit">Generate</button>
          </form>
        </div>

        <div className="card">
          <h4>Weekly preview</h4>
          {timetable ? (
            <div className="timetable-grid">
              {days.map((day) => (
                <div key={day} className="timetable-day">
                  <h4>{day}</h4>
                  {(timetable.courses || [])
                    .filter((course) => course.day === day)
                    .map((course) => (
                      <div key={`${course.courseName}-${course.startTime}`} className="timetable-slot">
                        <strong>{course.courseName}</strong>
                        <span>{course.startTime}–{course.endTime}</span>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No timetable generated yet.</p>
          )}
        </div>
      </div>
    </ModuleShell>
  );
}
