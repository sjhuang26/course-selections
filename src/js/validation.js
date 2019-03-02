import { subjects, courses, gradeToNumber } from './data';

function buildContext(context) {
  context.foobar = true;
}

function additionalValidator() {}

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

const coursePrereqRules = (() => {
  // This class serves two purposes: (1) deals with rule parsing (2) builds arrays of rule objects of form { rule [a tree representation], severity }.
  class Rule {
    constructor(rule, accumulatorArray) {
      this.accumulatorArray = accumulatorArray;
      this.result = {
        rule: this.parseRule(rule),
        severity: null
      };
    }

    // The following three methods are syntactic sugar to mark a rule as required, recommended, or info.

    get required() {
      this.result.severity = 'error';
      this.accumulatorArray.push(this.result);
      return null;
    }

    get recommended() {
      this.result.severity = 'warning';
      this.accumulatorArray.push(this.result);
      return null;
    }

    get info() {
      this.result.severity = 'info';
      this.accumulatorArray.push(this.result);
      return null;
    }

    // Rule parsing logic is bundled in the Rule class.

    parseRule(ruleArray) {
      const result = {};

      if (ruleArray.length > 1) {
        result.type = 'and';
        const unflatValues = ruleArray.map(x => this.parseRule([x]));
        result.values = [];
        // flatten out nested ANDs
        for (const v of unflatValues) {
          if (v.type === 'and') {
            for (const x of v.values) {
              result.values.push(x);
            }
          } else {
            result.values.push(v);
          }
        }
        return result;
      }

      const condition = ruleArray[0];

      const tokens = condition.match(/\S+/g);

      if (tokens.includes('or')) {
        result.type = 'or';
        const unflatValues = tokens
          .filter(x => x !== 'or')
          .map(x => this.parseRule([x]));
        
        result.values = [];
        // flatten out nested ORs
        for (const v of unflatValues) {
          if (v.type === 'or') {
            for (const x of v.values) {
              result.values.push(x);
            }
          } else {
            result.values.push(v);
          }
        }
      } else if (tokens.length > 1) {
        result.type = 'and';
        const unflatValues = tokens.map(x => this.parseRule([x]));
        result.values = [];
        // flatten out nested ANDs
        for (const v of unflatValues) {
          if (v.type === 'and') {
            for (const x of v.values) {
              result.values.push(x);
            }
          } else {
            result.values.push(v);
          }
        }
      } else {
        result.type = 'identity';
        result.value = this.parseRuleString(tokens[0]);
      }
      return result;
    }

    parseRuleString(rule) {
      const result = {};
      if (rule.endsWith('+')) {
        // concurrent
        result.concurrent = true;
        rule = rule.slice(0, -1);
      }

      if (rule.startsWith('$')) {
        // parameter
        result.type = 'parameter';
        result.name = rule.slice(1);
        return result;
      }

      if (rule.startsWith('.')) {
        // condition
        result.type = 'condition';
        result.name = rule.slice(1);
        return result;
      }

      // has to be a course
      result.type = 'course';

      result.value = rule;
      return result;
    }
  }

  const raw = [
    [
      'earth-sci/h',
      rule => {
        rule('geom/ac+').recommended;
      }
    ],
    [
      'chem/r',
      rule => {
        rule('.alg-1 .bio').required;
        rule('.alg-2+').recommended;
      }
    ],
    [
      'chem/h',
      rule => {
        rule('.bio .alg-1', '.geom+ or .alg-2+').required;
        rule('bio/h alg-2/ac+').recommended;
        rule('$strong-math').info;
      }
    ],
    [
      'phys/r',
      rule => {
        rule('.bio .chem', '.alg-2+', '$strong-math').required;
        rule('$strong-math').info;
      }
    ],
    [
      'phys/h',
      rule => {
        rule('.bio .chem .alg-2').required;
        rule('chem/h', 'alg-2/ac or .precalc+').recommended;
        rule('$strong-math').info;
      }
    ],
    [
      'ap-bio',
      rule => {
        rule('.bio .chem').required;
      }
    ],
    [
      'ap-chem',
      rule => {
        rule('.chem .alg-2').required;
        rule('.phys alg-2/ac').recommended;
        rule('$strong-math').info;
      }
    ],
    [
      'ap-phys',
      rule => {
        rule('.chem .phys .ap-calc+').required;
        rule('$strong-math').info;
      }
    ],
    [
      'environmental-science',
      rule => {
        rule('.grad/sci').required;
      }
    ],
    [
      'introduction-to-medical-science',
      rule => {
        rule('.grad/sci .chem+').required;
        rule('.chem').recommended;
      }
    ]
  ];

  // SCHEMA: result[key] = [{ severity, rule }]
  const result = {};
  for (const [courseKey, validator] of raw) {
    const accumulatorArray = [];

    // call the validator!
    validator((...ruleArray) => new Rule(ruleArray, accumulatorArray));

    result[courseKey] = accumulatorArray;
  }

  return result;
})();

function prereqIssue(severityLevel, courseKey, parsedRule) {
  return {
    severity: severityLevel,
    type: 'prereq',
    course: courseKey,
    rule: parsedRule
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

function calculatePrereqRule(rule, doesPrereqExistCallback) {
  if (rule.type === 'identity') {
    return doesPrereqExistCallback(rule.value, rule.concurrent);
  } else if (rule.type === 'and') {
    let result = true;
    for (const x of rule.values) {
      if (!calculatePrereqRule(x, doesPrereqExistCallback)) {
        result = false;
      }
    }
    return result;
  } else if (rule.type === 'or') {
    let result = false;
    for (const x of rule.values) {
      if (calculatePrereqRule(x, doesPrereqExistCallback)) {
        result = true;
      }
    }
    return result;
  } else {
    throw new Error('rule type does not exist');
  }
}

class ScheduleValidator {
  constructor(schedule) {
    this.schedule = schedule;
  }

  validate() {
    this.issues = [];
    this.context = {};

    // call a method that builds the context
    buildContext(this.context);

    // iterate over each subject in the schedule
    for (const scheduleSubject of Object.values(this.schedule)) {
      // check for grade issues
      for (const course of Object.values(scheduleSubject.courses)) {
        this.captureIssues(this.validateCourseGrade)(course);
      }

      // check for duplicate classes
      for (const [baseCourseKey, baseCourse] of Object.entries(
        scheduleSubject.baseCourses
      )) {
        this.captureIssues(this.validateCourseDuplication)(
          baseCourseKey,
          baseCourse
        );
      }

      // generate representative instances for all base courses
      for (const baseCourse of Object.values(scheduleSubject.baseCourses)) {
        this.generateReprInstance(baseCourse);
      }

      // look for series prerequisite violations
      for (const { reprInstance } of Object.values(
        scheduleSubject.baseCourses
      )) {
        this.captureIssues(this.validateSeriesPrereqs)(reprInstance);
      }

      // run course prereq validators, but only for repr instances
      for (const { reprInstance } of Object.values(
        scheduleSubject.baseCourses
      )) {
        this.captureIssues(this.validatePrereq)(reprInstance);
      }
    }

    // run additional subject validators
    for (const [validatorSubj, validator] of Object.entries(
      additionalSubjectValidators
    )) {
      this.captureIssues(validator.bind(this))(this.schedule[validatorSubj]);
    }

    // run additional validator
    this.captureIssues(additionalValidator.bind(this))();

    return this.issues;
  }

  validateCourseGrade(instance) {
    const { courseKey, grade } = instance;

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

  validateSeriesPrereqs(reprInstance) {
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

  validatePrereq(instance) {
    const rules = coursePrereqRules[instance.courseKey];
    if (rules) {
      this.validatePrereqUsingRules(
        instance,
        rules
      );
    }
  }

  validatePrereqUsingRules(instance, rules) {
    for (const { severity, rule } of rules) {
      if (
        !calculatePrereqRule(rule, (prereqKey, isConcurrent) =>
          this.doesPrereqExist(instance, prereqKey, isConcurrent)
        )
      ) {
        throw prereqIssue(severity, instance.courseKey, rule);
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

  doesPrereqExist(instance, prereqKey, isConcurrent) {
    let exists = false;
    for (const subject of Object.values(this.schedule)) {
      for (const { courseKey, grade } of Object.values(subject.courses)) {
        if (
          prereqKey === courseKey &&
          (grade < instance.grade || (isConcurrent && grade <= instance.grade))
        ) {
          exists = true;
          break;
        }
      }
    }
    return exists;
  }

  ensurePrereqExists(instance, prereqKey, altKey) {
    if (altKey) {
      this.validatePrereqUsingRules(instance, [
        {
          severity: 'error',
          rule: {
            type: 'and',
            values: [
              {
                type: 'identity',
                value: prereqKey
              },
              {
                type: 'identity',
                value: altKey
              }
            ]
          }
        }
      ]);
    } else {
      this.validatePrereqUsingRules(instance, [
        {
          severity: 'error',
          rule: {
            type: 'identity',
            value: prereqKey
          }
        }
      ]);
    }
  }

  generateReprInstance(baseCourse) {
    // default values for a search for the instance with the earliest grade
    let earliestInstanceGrade = 999;
    let earliestInstance = null;

    for (const instance of baseCourse.instances) {
      if (instance.grade < earliestInstanceGrade) {
        earliestInstanceGrade = instance.grade;
        earliestInstance = instance;
      }
    }

    // SCHEMA: set reprInstance of schedule.baseCourses[key] object
    baseCourse.reprInstance = earliestInstance;
  }
}

export function validate(schedule) {
  const s = {};

  // init for each subject
  for (const subject of Object.keys(subjects)) {
    s[subject] = {
      baseCourses: {},
      courses: {}
    };
  }

  // this gets rid of Vue observers
  const scheduleNoVueObservers = JSON.parse(JSON.stringify(schedule));

  // no-grade schedule courses are exclused
  for (const instance of scheduleNoVueObservers.filter(x => x.grade !== 0)) {
    const { courseKey } = instance;
    const courseData = courses[courseKey];
    const { baseKey, subject } = courseData;
    const scheduleSubject = s[subject];
    const { baseCourses } = scheduleSubject;

    // SCHEMA: assign to schedule.courses object
    scheduleSubject.courses[courseKey] = instance;

    // SCHEMA: assign to schedule.baseCourses object
    if (!baseCourses[baseKey]) {
      baseCourses[baseKey] = {
        instances: [],
        gradeDistribution: [0, 0, 0, 0, 0],
        count: 0
      };
    }
    baseCourses[baseKey].instances.push(instance);
    baseCourses[baseKey].gradeDistribution[gradeToNumber(instance.grade)]++;
    baseCourses[baseKey].count++;
  }

  return new ScheduleValidator(s).validate();
}
