import { subjects, courses } from './data';

const subjectContextBuilders = {
  english() {
    return {
      foobar: true
    };
  }
};

const subjectContextValidators = {
  english() {
    return [];
  }
};

function prereqIssue(courseKey, prereqKey) {
  return {
    severity: 'error',
    type: 'prereq',
    course: courseKey,
    prereq: prereqKey
  };
}

function gradeConstraintIssue(course, currentGrade, requiredGrade) {
  return {
    severity: 'error',
    type: 'grade-constraint',
    course: course.key,
    currentGrade,
    requiredGrade
  };
}

function gradeCommonIssue(course, currentGrade, commonGrade) {
  return {
    severity: 'warning',
    type: 'grade-common',
    course: course.key,
    currentGrade,
    commonGrade
  };
}

function duplicateEntryIssue(baseCourseKey, grade) {
  return {
    severity: 'error',
    type: 'duplicate-entry',
    baseCourse: baseCourseKey,
    grade
  };
}

function duplicationIssue(baseCourseKey) {
  return {
    severity: 'error',
    type: 'duplication',
    baseCourse: baseCourseKey
  };
}

const gradesToNumber = {
  9: 1,
  10: 2,
  11: 3,
  12: 4
};

function gradeToNumber(grade) {
  return gradesToNumber[grade];
}

class ScheduleValidator {
  constructor(schedule) {
    this.schedule = schedule;
  }

  validate() {
    this.issues = [];
    this.context = {
      subjects: {},
      baseCourses: {}
    };
    // BUILD CONTEXT
    // call context builders
    for (const [subjectKey, subject] of Object.entries(subjects)) {
      if (subjectContextBuilders[subjectKey]) {
        this.context.subjects[subjectKey] = subjectContextBuilders[
          subjectKey
        ].call(this, subject);
      } else {
        this.context.subjects[subjectKey] = {};
      }
    }
    // VALIDATE CONTEXT
    console.log(this.schedule);
    for (const [subjectKey, subject] of Object.entries(this.schedule)) {
      // check for grade issues
      for (const course of Object.values(subject.courses)) {
        this.captureIssues(this.validateCourseGrade)(course);
      }
      // check for duplicate classes
      for (const [baseCourseKey, baseCourse] of Object.entries(
        subject.baseCourses
      )) {
        this.captureIssues(this.validateCourseDuplication)(
          subjectKey,
          baseCourseKey,
          baseCourse
        );
      }

      // generate representative instances for all base courses
      for (const baseCourse of Object.values(subject.baseCourses)) {
        let earliestInstanceGrade = 999;
        let earliestInstance = null;
        for (const instance of baseCourse.instances) {
          if (instance.grade < earliestInstanceGrade) {
            earliestInstanceGrade = instance.grade;
            earliestInstance = instance;
          }
        }
        baseCourse.reprInstance = earliestInstance;
      }

      // look for series prerequisite violations
      for (const baseCourse of Object.values(subject.baseCourses)) {
        this.captureIssues(this.validateSeriesPrereqs)(subject, baseCourse);
      }

      // call context validators
      if (subjectContextValidators[subjectKey]) {
        this.issues = this.issues.concat(
          subjectContextValidators[subjectKey].call(
            this,
            subject,
            this.context.subjects[subjectKey]
          )
        );
      }
    }
    return this.issues;
  }

  validateCourseGrade({ courseKey, grade }) {
    const gradeKey = String(gradeToNumber(grade));
    const course = courses[courseKey];
    if (!course.gradeConstraint.includes(gradeKey)) {
      throw gradeConstraintIssue(course, gradeKey, course.gradeConstraint);
    }
    if (!course.gradeCommon.includes(gradeKey)) {
      throw gradeCommonIssue(course, gradeKey, course.gradeConstraint);
    }
  }

  validateCourseDuplication(subjectKey, baseCourseKey, baseCourse) {
    const reprCourse = baseCourse.instances[0];
    let i = 1;
    for (const x of baseCourse.gradeDistribution) {
      let max;
      if (reprCourse.duplicatable) {
        if (reprCourse.semester) {
          max = 2;
        } else {
          max = 1;
        }
      } else {
        max = 1;
      }
      if (x > max) {
        throw duplicateEntryIssue(baseCourseKey, String(i));
      }
      i++;
    }
    if (!reprCourse.duplicatable && baseCourse.count > 1) {
      throw duplicationIssue(baseCourseKey);
    }
  }

  validateSeriesPrereqs(subject, baseCourse) {
    const { reprInstance } = baseCourse;
    const repr = courses[reprInstance.courseKey];
    if (repr.series > 1) {
      let satisfied = false;
      // look through all courses in the group
      for (const { courseKey, grade } of Object.values(subject.courses)) {
        const course = courses[courseKey];
        console.log(courseKey, grade, reprInstance, repr);
        if (
          grade < reprInstance.grade &&
          course.series + 1 === repr.series &&
          course.group === repr.group
        ) {
          satisfied = true;
          break;
        }
      }
      if (!satisfied) {
        // find the other missing course in the series
        let other = null;
        for (const course of Object.values(courses)) {
          if (
            course.series + 1 === repr.series &&
            course.group === repr.group
          ) {
            other = course;
            break;
          }
        }
        throw prereqIssue(repr.key, other.key);
      }
    }
  }

  captureIssues(func) {
    return (...args) => {
      try {
        func.apply(this, args);
      } catch (e) {
        if (e instanceof Error) {
          throw e;
        } else {
          this.issues.push(e);
        }
      }
    };
  }
}

export function validate(schedule) {
  const s = {};
  for (const subject of Object.keys(subjects)) {
    s[subject] = {
      baseCourses: {},
      courses: {}
    };
  }
  const scheduleNoVueObservers = JSON.parse(JSON.stringify(schedule));
  for (const course of scheduleNoVueObservers.filter(x => x.grade !== 0)) {
    const baseKey = courses[course.courseKey].baseKey;
    s[courses[course.courseKey].subject].courses[course.courseKey] = course;
    const t = s[courses[course.courseKey].subject].baseCourses;
    if (!t[baseKey]) {
      t[baseKey] = {
        instances: [],
        gradeDistribution: [0, 0, 0, 0, 0],
        count: 0
      };
    }
    t[baseKey].instances.push(course);
    t[baseKey].gradeDistribution[gradeToNumber(course.grade)]++;
    t[baseKey].count++;
  }
  return new ScheduleValidator(s).validate();
}
