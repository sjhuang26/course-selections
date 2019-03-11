import { subjects, courses, gradeToNumber } from './data';

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

function tokenize(string) {
  return string.match(/\S+/g);
}

function parseRule(ruleArray) {
  let result = {};

  if (ruleArray.length > 1) {
    result.type = 'and';
    const unflatValues = ruleArray.map(x => parseRule([x]));
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

  const tokens = tokenize(ruleArray[0]);

  if (tokens.includes('or')) {
    result.type = 'or';
    const unflatValues = tokens
      .filter(x => x !== 'or')
      .map(x => parseRule([x]));

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
    const unflatValues = tokens.map(x => parseRule([x]));
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
    result = parseSingleRule(tokens[0]);
  }
  return result;
}

function parseSingleRule(rule) {
  const result = {};
  if (rule.endsWith('+')) {
    // concurrent
    result.concurrent = true;
    rule = rule.slice(0, -1);
  }

  if (rule.startsWith('*')) {
    // group
    result.type = 'group';
    result.fullKey = rule.slice(1);
    result.subject = result.fullKey.split('/')[0];
    result.name = result.fullKey.split('/')[1];

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
  result.key = rule;
  return result;
}

const { coursePrereqRules, conditions, courseTags, graduationRequirements } = (() => {
  // This class is a convenience wrapper around the rule parser.
  class Rule {
    constructor(rule, accumulatorArray) {
      this.accumulatorArray = accumulatorArray;
      this.result = {
        rule: parseRule(rule),
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
  }

  const conditionRaw = [
    ['bio', ['*science/bio'], 'a biology course'],
    ['chem', ['*science/chem'], 'a chemistry course'],
    ['phys', ['*science/physics'], 'a physics course'],
    ['earth-sci', ['*science/earth-sci'], 'an earth science course'],
    ['sci-lp-grad', ['bio', 'earth-sci or chem or phys']]
  ];

  // NOTE: this array isn't in raw form
  const graduationRequirements = [
    ['science', function(required, advanced) {
      required('science class in 9th grade', this.countSubjectInGrade('science', 1) >= 1);
      required('science class in 10th grade', this.countSubjectInGrade('science', 2) >= 1);
      required('science class in 11th grade', this.countSubjectInGrade('science', 3) >= 1);
      advanced('biology AND earth science/chemistry/physics taken', this.isConditionSatisfied('sci-lp-grad'));
    }],
    ['english', function(required) {
      required('english class in 9th grade', this.countSubjectInGrade('english', 1) >= 1);
      required('english class in 10th grade', this.countSubjectInGrade('english', 2) >= 1);
      required('english class in 11th grade', this.countSubjectInGrade('english', 3) >= 1);
      required('english class in 12th grade', this.countSubjectCreditsInGrade('english', 4) >= 1);
    }]
  ];

  const courseRaw = [
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
        rule.tag('strong-math');
      }
    ],
    [
      'phys/r',
      rule => {
        rule('.bio .chem', '.alg-2+', '$strong-math').required;
        rule.tag('strong-math');
      }
    ],
    [
      'phys/h',
      rule => {
        rule('.bio .chem .alg-2').required;
        rule('chem/h', 'alg-2/ac or .precalc+').recommended;
        rule.tag('strong-math');
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
        rule.tag('strong-math');
      }
    ],
    [
      'ap-physics',
      rule => {
        rule('.chem .phys .ap-calc+').required;
        rule.tag('strong-math');
      }
    ],
    [
      'environmental-science',
      rule => {
        rule('.sci-lp-grad').required;
      }
    ],
    [
      'introduction-to-medical-science',
      rule => {
        rule('.sci-lp-grad .chem+').required;
        rule('.chem').recommended;
      }
    ]
  ];

  // BUILD: CoursePrereqRules and CourseTags

  // SCHEMA: result[key] = [{ severity, rule }]
  const coursePrereqRules = {};

  // SCHEMA: result[key] = [...tags]
  const courseTags = {};

  for (const [courseKey, validator] of courseRaw) {
    const accumulatorArray = [];

    // create a function that also has a property
    const fn = (...ruleArray) => new Rule(ruleArray, accumulatorArray);
    fn.tag = tagString => {
      courseTags[courseKey] = tokenize(tagString);
    };
    // call the validator!
    validator(fn);

    coursePrereqRules[courseKey] = accumulatorArray;
  }

  // BUILD: Conditions

  const conditions = {};
  for (const [conditionKey, ruleArray, name] of conditionRaw) {
    conditions[conditionKey] = {
      rule: parseRule(ruleArray),
      name
    };
  }

  return {
    coursePrereqRules,
    conditions,
    courseTags,
    graduationRequirements
  };
})();
export { conditions, courseTags };

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

function utilCalculatePrereqRule(rule, cbEvaluateRuleValue) {
  // TODO: LOGGING
  console.log('UTIL', rule);
  const _result = (() => {
    let result;
    let conditionRule;
    switch (rule.type) {
      case 'and':
        result = -Infinity;
        for (const x of rule.values) {
          result = Math.max(
            result,
            utilCalculatePrereqRule(x, cbEvaluateRuleValue)
          );
        }
        return result;
      case 'or':
        result = Infinity;
        for (const x of rule.values) {
          result = Math.min(
            result,
            utilCalculatePrereqRule(x, cbEvaluateRuleValue)
          );
        }
        return result;
      case 'condition':
        if (conditions[rule.name] === undefined) {
          return -Infinity; // TODO
        }
        conditionRule = conditions[rule.name].rule;
        return utilCalculatePrereqRule(conditionRule, cbEvaluateRuleValue); // TODO add caching
      case 'course':
      case 'group':
        return cbEvaluateRuleValue(rule);
      default:
        throw new Error('unknown prereq rule type');
    }
  })();
  console.log('RETURN', _result);
  return _result;
}

class ScheduleValidator {
  constructor(schedule) {
    this.schedule = schedule;
  }

  validate() {
    this.issues = [];

    for (const scheduleSubject of Object.values(this.schedule)) {
      // SCHEMA: generate representative instances for all base courses
      for (const baseCourse of Object.values(scheduleSubject.baseCourses)) {
        this.generateReprInstance(baseCourse);
      }
    }

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

    // run graduation validators, which go into a separate graduation checklist
    const graduationChecklist = graduationRequirements.map(([header, validator]) => {
      // PURPOSE: this is basically wrapper code to collect and package the results
      const result = {
        required: [],
        advanced: [],
        header
      };
      const reqCallback = (name, value) => {
        result.required.push({name, value});
      };
      const advCallback = (name, value) => {
        result.advanced.push({name, value});
      };
      validator.call(this, reqCallback, advCallback);
      return result;
    });

    return {
      issues: this.issues,
      graduationChecklist // SCHEMA: in array form
    };
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
      this.validatePrereqUsingRules(instance, rules);
    }
  }

  validatePrereqUsingRules(instance, rules) {
    for (const { severity, rule } of rules) {
      if (
        utilCalculatePrereqRule(
          rule,
          this.evaluateRuleValueDuringCalc.bind(this)
        ) > instance.grade
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

  findEarliestInstance(courseKey) {
    let earliestGrade = Infinity;
    for (const subject of Object.values(this.schedule)) {
      for (const instance of Object.values(subject.courses)) {
        if (courseKey === instance.courseKey) {
          earliestGrade = Math.min(earliestGrade, instance.grade);
        }
      }
    }
    return earliestGrade;
  }

  findEarliestGroupInstance(subjectKey, groupName) {
    let earliestGrade = Infinity;
    for (const instance of Object.values(this.schedule[subjectKey].courses)) {
      if (
        subjectKey === courses[instance.courseKey].subject &&
        groupName === courses[instance.courseKey].group
      ) {
        earliestGrade = Math.min(earliestGrade, instance.grade);
      }
    }
    return earliestGrade;
  }

  countSubject(subjectKey) {
    return Object.keys(this.schedule[subjectKey].courses).length;
  }

  countSubjectInGrade(subjectKey, gradeNumber) {
    let count = 0;
    for (const instance of Object.values(this.schedule[subjectKey].courses)) {
      if (gradeNumber === instance.grade) {
        count++;
      }
    }
    return count;
  }

  countSubjectCreditsInGrade(subjectKey, gradeNumber) {
    let count = 0;
    for (const instance of Object.values(this.schedule[subjectKey].courses)) {
      if (gradeNumber === instance.grade) {
        count += courses[instance.courseKey].credits;
      }
    }
    return count;
  }

  evaluateRuleValueDuringCalc(ruleValue) {
    let earliestGrade = Infinity;
    if (ruleValue.type === 'course') {
      earliestGrade = this.findEarliestInstance(ruleValue.key);
    } else if (ruleValue.type === 'group') {
      earliestGrade = this.findEarliestGroupInstance(
        ruleValue.subject,
        ruleValue.name
      );
    } else {
      throw new Error('invalid rule value');
    }

    if (ruleValue.concurrent) {
      return earliestGrade;
    } else {
      return earliestGrade + 1;
    }
  }

  isConditionSatisfied(conditionKey) {
    const { rule } = conditions[conditionKey];
    // LOGIC: as long as the rule is satisfied sometime before "never" (Infinity), we're fine.
    return utilCalculatePrereqRule(rule, this.evaluateRuleValueDuringCalc.bind(this)) < Infinity;
  }

  ensurePrereqExists(instance, prereqKey, altKey) {
    if (altKey) {
      this.validatePrereqUsingRules(instance, [
        {
          severity: 'error',
          rule: {
            type: 'or',
            values: [
              {
                type: 'course',
                key: prereqKey
              },
              {
                type: 'course',
                key: altKey
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
            type: 'course',
            key: prereqKey
          }
        }
      ]);
    }
  }

  generateReprInstance(baseCourse) {
    // default values for a search for the instance with the earliest grade
    let earliestInstanceGrade = Infinity;
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
