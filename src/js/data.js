import rawData from '../assets/raw-data';

const rawSubjects = [
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
      ['extra', 'Extra']
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
      ['extra', 'Extra']
    ]
  ]
];

class SubjectManager {
  constructor(raw) {
    this.raw = raw;
    this.values = this.process(raw);
  }

  process(raw) {
    const values = {};
    for (const [key, name, mainCategory, categories] of raw) {
      const categoriesValue = {};
      for (const [key, name] of categories) {
        categoriesValue[key] = {
          name
        };
      }
      values[key] = {
        name,
        mainCategory,
        categories
      };
    }
    return values;
  }

  levelCount(baseCourse) {
    return Object.keys(baseCourse).length;
  }
}
export const Subjects = new SubjectManager(rawSubjects);
export const subjects = Subjects.values;

class DataManager {
  constructor(raw) {
    this.raw = raw;
    this.values = this.process(raw);
  }

  process(raw) {
    const values = {};

    for (let key of Object.keys(subjects)) {
      values[key] = {};
    }
    for (let rawCourse of raw) {
      const subjectData = values[rawCourse.subject];
      if (!subjectData[rawCourse.baseKey]) {
        subjectData[rawCourse.baseKey] = {};
      }
      const baseCourseData = subjectData[rawCourse.baseKey];
      baseCourseData[rawCourse.level] = rawCourse;
    }

    return values;
  }
}
export const Data = new DataManager(rawData);
export const data = Data.values;

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
