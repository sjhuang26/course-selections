import { subjects as subjectsData, courses as coursesData } from './data';

function buildPrereqIssue(course, prereq) {
  return {
    severity: 'error',
    type: 'prereq',
    course,
    prereq
  };
}

export function validateSchedule(schedule) {
  const context = {
    schedule,
    subjectsData,
    coursesData,
    subjects: {}
  };
  return validateScheduleContext(context);
}

function validateScheduleContext(context) {

}