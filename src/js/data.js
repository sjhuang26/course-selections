import rawCourseData from '../assets/raw-course-data';

const rawSubjectData = [
  [
    'english',
    'English',
    'core',
    [['core', 'Core'], ['senior', 'Senior'], ['extra', 'Extra']]
  ],
  ['gym', 'Gym', 'core', [['core', 'Core']]],
  [
    'science',
    'Science',
    null,
    [
      ['ap', 'AP'],
      ['bio', 'Biology'],
      ['chem', 'Chemistry'],
      ['earth-sci', 'Earth Science'],
      ['physics', 'Physics'],
      ['extra', 'Extra']
    ]
  ],
  [
    'tech',
    'Tech',
    null,
    [
      ['before-ddp', 'Before DDP'],
      ['after-ddp', 'After DDP'],
      ['extra', 'Extra'],
      ['misc', 'Misc']
    ]
  ],
  [
    'language',
    'Language',
    null,
    [
      ['spanish', 'Spanish'],
      ['french', 'French'],
      ['latin', 'Latin'],
      ['german', 'German'],
      ['chinese', 'Chinese'],
      ['extra', 'Extra'],
      ['misc', 'Misc']
    ]
  ]
];

function processRawSubjectData(raw) {
  const subjects = {};
  for (const [key, name, mainCategory, categories] of raw) {
    const subjectCategories = {};
    for (const [key, name] of categories) {
      subjectCategories[key] = {
        name,
        baseCourses: {}
      };
    }
    subjects[key] = {
      name,
      mainCategory,
      categories: subjectCategories,
      baseCourses: {}
    };
  }
  return subjects;
}

function incorporateRawCourseData(raw) {
  for (const course of raw) {
    // add to non-categorized object
    const baseCourses = subjects[course.subject].baseCourses;
    if (!baseCourses[course.baseKey]) {
      baseCourses[course.baseKey] = {
        category: course.category,
        size: 0,
        courses: {}
      };
    }
    baseCourses[course.baseKey].courses[course.level || 'e'] = course;
    ++baseCourses[course.baseKey].size;
  }
  // categorize all the base courses
  for (const [subjectKey, subject] of Object.entries(subjects)) {
    for (const [key, baseCourse2] of Object.entries(subject.baseCourses)) {
      const category = subject.categories[baseCourse2.category];
      if (category === undefined) {
        console.log(`missing category ${baseCourse2.category} in subject ${subjectKey}`);
      } else {
        category.baseCourses[key] = baseCourse2;
      }
    }
  }
}

export const subjects = processRawSubjectData(rawSubjectData);
incorporateRawCourseData(rawCourseData);

export const levelsToNames = {
  h: 'Honors',
  r: 'Regents',
  pr: 'Post-Regents',
  ap: 'AP',
  supa: 'SUPA',
  n: 'Non-regents'
};

export function search(array, value, key) {
  if (key === undefined) {
    key = 'key';
  }
  const result = [];
  for (const element of array) {
    if (element[key] === value) {
      result.push(element);
    }
  }
}

export function searchUnique(array, value, key) {
  if (key === undefined) {
    key = 'key';
  }
  for (const element of array) {
    if (element[key] === value) return element;
  }
}
