import { subjects, courses, gradeToNumber } from './data';

function buildContext(context) {
  context.foobar = true;
}

function additionalValidator() {
}

const additionalSubjectValidators = {
  tech(scheduleSubj) {
    for (const { courseKey, grade } of Object.values(scheduleSubj.courses)) {
      if (courses[courseKey].group === 'after-ddp') {
        this.captureIssues(this.ensurePrereqExists)(
          { courseKey, grade },
          'ddp'
        );
      }
    }
  }
};

const rawCoursePrereqValidators = [
  ['earth-sci/h', rule => {
    rule('geom/ac+').recommended;
  }],
  ['chem/r', rule => {
    rule('.alg-1 .bio').required;
    rule('.alg-2+').recommended;
  }],
  ['chem/h', rule => {
    rule('.bio .alg-1', '.geom+ or .alg-2+').required;
    rule('bio/h alg-2/ac+').recommended;
    rule('$strong-math').info;
  }],
  ['phys/r', rule => {
    rule('.bio .chem', '.alg-2+', '$strong-math').required;
    rule('$strong-math').info;
  }],
  ['phys/h', rule => {
    rule('.bio .chem .alg-2').required;
    rule('chem/h', 'alg-2/ac or .precalc+').recommended;
    rule('$strong-math').info;
  }],
  ['ap-bio', rule => {
    rule('.bio .chem').required;
  }],
  ['ap-chem', rule => {
    rule('.chem .alg-2').required;
    rule('.phys alg-2/ac').recommended;
    rule('$strong-math').info;
  }],
  ['ap-phys', rule => {
    rule('.chem .phys .ap-calc+').required;
    rule('$strong-math').info;
  }],
  ['environmental-science', rule => {
    rule('.grad/sci').required;
  }],
  ['introduction-to-medical-science', rule => {
    rule('.grad/sci .chem+').required;
    rule('.chem').recommended;
  }]
];

function parseRawCoursePrereqValidators(raw) {
  const result = {};
  for ([courseKey, validator] of raw) {
    result[courseKey] = validator;
  }
  return result;
}

const coursePrereqValidators = parseRawCoursePrereqValidators(rawCoursePrereqValidators);

function prereqIssue(severityLevel, courseKey, ruleStructure) {
  return {
    severity: severityLevel,
    type: 'prereq',
    course: courseKey,
    rule: ruleStructure
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

class Rule {
  constructor(scheduleValidator, reprInstance, rule) {
    this.reprInstance = reprInstance;
    this.rule = rule;
    this.fail = !scheduleValidator.isPrereqValid(reprInstance, this.parseRule(rule));
  }

  required() {
    if (fail) {
      throw prereqIssue('error', this.reprInstance.courseKey, this.rule);
    }
  }

  recommended() {
    if (fail) {
      throw prereqIssue('warning', this.reprInstance.courseKey, this.rule);
    }
  }

  info() {
    if (fail) {
      throw prereqIssue('info', this.reprInstance.courseKey, this.rule);
    }
  }

  parseRule(...ruleArray) {
    const result = {};
  
    if (ruleArray.length > 1) {
      result.type = 'and';
      result.values = ruleArray.map(x => parseRule(x));
      return result;
    }
  
    const condition = ruleArray[0];
  
    const tokens = condition.match(/\S+/g);
  
    if (tokens.includes('or')) {
      result.type = 'or';
      result.values = tokens.filter(x => x !== 'or').map(x => parseRule(x));
    } else if (tokens.length > 1) {
      result.type = 'and';
      result.values = tokens.map(x => parseRule(x));
    } else {
      result.type = 'identity';
      result.value = parseRuleString(tokens[0]);
    }
    return result;
  }
  
  parseRuleString(rule) {
    const result = {};
    if (rule.beginsWith('$')) {
      // parameter
      result.type = 'parameter';
      result.name = rule.slice(0, 1);
      return result;
    }
  
    if (rule.beginsWith('.')) {
      // condition
      result.type = 'condition';
      result.name = rule.slice(0, 1);
      return result;
    }
  
    // has to be a course
    result.type = 'course';
  
    if (rule.endsWith('+')) {
      // concurrent
      result.concurrent = true;
      rule = rule.slice(0, -1);
    }
  
    result.value = rule;
    return result;
  }
}

class ScheduleValidator {
  constructor(schedule) {
    this.schedule = schedule;
  }

  validate() {
    this.issues = [];
    this.context = {};
    buildContext(this.context);

    for (const [subjectKey, scheduleSubj] of Object.entries(this.schedule)) {
      // check for grade issues
      for (const course of Object.values(scheduleSubj.courses)) {
        this.captureIssues(this.validateCourseGrade)(course);
      }
      // check for duplicate classes
      for (const [baseCourseKey, baseCourse] of Object.entries(
        scheduleSubj.baseCourses
      )) {
        this.captureIssues(this.validateCourseDuplication)(
          baseCourseKey,
          baseCourse
        );
      }

      // generate representative instances for all base courses
      for (const baseCourse of Object.values(scheduleSubj.baseCourses)) {
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
      for (const baseCourse of Object.values(scheduleSubj.baseCourses)) {
        this.captureIssues(this.validateSeriesPrereqs)(baseCourse);
      }

      // run course prereq validators
      for (const { reprInstance } of Object.values(scheduleSubj.baseCourses)) {
        this.captureIssues(this.coursePrereqValidators[reprInstance.courseKey].bind(this))((rule) => new Rule(this, reprInstance, rule));
      }
    }

    // run additional subject validators
    for (const [validatorSubj, validator] of Object.entries(additionalSubjectValidators)) {
      this.captureIssues(validator.bind(this))(this.schedule[validatorSubj]);
    }

    // run additional validator
    this.captureIssues(additionalValidator.bind(this))();

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

  validateCourseDuplication(baseCourseKey, baseCourse) {
    const reprCourse = baseCourse.instances[0];
    let i = 0;
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

  validateSeriesPrereqs(baseCourse) {
    const { reprInstance } = baseCourse;
    const repr = courses[reprInstance.courseKey];
    if (repr.series > 1 && repr.series != 12) {
      let otherCourse = null;
      let altCourse = undefined;
      for (const course of Object.values(courses)) {
        if (
          (course.series + 1 === repr.series ||
            (course.series === 12 && repr.series === 3)) &&
          course.group === repr.group
        ) {
          if (otherCourse === null) {
            otherCourse = course;
          } else {
            altCourse = course;
          }
        }
      }

      this.ensurePrereqExists(
        reprInstance,
        otherCourse.key,
        altCourse ? altCourse.key : undefined
      );
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

  ensurePrereqExists(instance, prereqKey, altKey) {
    let satisfied = false;
    for (const subject of Object.values(this.schedule)) {
      for (const { courseKey, grade } of Object.values(subject.courses)) {
        if (
          (prereqKey === courseKey || altKey === courseKey) &&
          grade < instance.grade
        ) {
          satisfied = true;
          break;
        }
      }
    }
    if (!satisfied) {
      throw prereqIssue(instance.courseKey, prereqKey, altKey);
    }
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
