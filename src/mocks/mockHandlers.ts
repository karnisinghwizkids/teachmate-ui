import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { mockLessons } from './mockData';
import { Lesson } from '../types';

const mock = new MockAdapter(axios);
const delay = 1000;

// GET all lessons
mock.onGet('/api/lessons').reply(() => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([200, mockLessons]);
    }, delay);
  });
});

// GET single lesson
mock.onGet(/\/api\/lessons\/\d+/).reply((config) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const id = config.url?.split('/').pop();
      const lesson = mockLessons.find((l) => l.id === id);
      if (lesson) {
        resolve([200, lesson]);
      } else {
        resolve([404, { message: 'Lesson not found' }]);
      }
    }, delay);
  });
});

// POST new lesson
mock.onPost('/api/lessons').reply((config) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lesson = JSON.parse(config.data) as Lesson;
      mockLessons.push(lesson);
      resolve([201, lesson]);
    }, delay);
  });
});

// PUT update lesson
mock.onPut(/\/api\/lessons\/\d+/).reply((config) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const id = config.url?.split('/').pop();
      const lessonIndex = mockLessons.findIndex((l) => l.id === id);
      if (lessonIndex !== -1) {
        const updatedLesson = JSON.parse(config.data) as Lesson;
        mockLessons[lessonIndex] = updatedLesson;
        resolve([200, updatedLesson]);
      } else {
        resolve([404, { message: 'Lesson not found' }]);
      }
    }, delay);
  });
});

// DELETE lesson
mock.onDelete(/\/api\/lessons\/\d+/).reply((config) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const id = config.url?.split('/').pop();
      const lessonIndex = mockLessons.findIndex((l) => l.id === id);
      if (lessonIndex !== -1) {
        mockLessons.splice(lessonIndex, 1);
        resolve([200, { message: 'Lesson deleted successfully' }]);
      } else {
        resolve([404, { message: 'Lesson not found' }]);
      }
    }, delay);
  });
});

// PUT update lesson status
mock.onPut(/\/api\/lessons\/\d+\/status/).reply((config) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const id = config.url?.split('/').pop()?.replace('/status', '');
      const lessonIndex = mockLessons.findIndex((l) => l.id === id);
      if (lessonIndex !== -1) {
        const { status, approver } = JSON.parse(config.data);
        mockLessons[lessonIndex] = {
          ...mockLessons[lessonIndex],
          status,
          ...(status === 'Approved'
            ? {
                approvedBy: approver,
                approvedAt: new Date().toISOString(),
              }
            : {}),
        };
        resolve([200, mockLessons[lessonIndex]]);
      } else {
        resolve([404, { message: 'Lesson not found' }]);
      }
    }, delay);
  });
});

export default mock;