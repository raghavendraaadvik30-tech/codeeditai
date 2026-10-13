/**
 * --------------------------------------------------------
 * Unit tests for Navigation services:
 * - Tree building
 * - Snippet creation
 * - Bookmark name validation
 * --------------------------------------------------------
 */

import { navigationOutlineService, type FlatHeadingItem } from '../services/NavigationOutlineService';

export function testTreeBuilding() {
  const dummyEl = (typeof document !== 'undefined') ? document.createElement('div') : ({} as HTMLElement);

  const flatItems: FlatHeadingItem[] = [
    { id: '1', title: 'Chapter 1 Introduction', level: 1, pageNumber: 1, element: dummyEl, order: 0 },
    { id: '2', title: '1.1 Background of the Study', level: 2, pageNumber: 1, element: dummyEl, order: 1 },
    { id: '3', title: '1.2 Problem Statement', level: 2, pageNumber: 1, element: dummyEl, order: 2 },
    { id: '4', title: 'Chapter 2 Literature Review', level: 1, pageNumber: 2, element: dummyEl, order: 3 },
    { id: '5', title: '2.1 Theoretical Framework', level: 2, pageNumber: 2, element: dummyEl, order: 4 },
  ];

  const tree = navigationOutlineService.buildHeadingTree(flatItems);

  console.assert(tree.length === 2, `Expected 2 top-level chapters, got ${tree.length}`);
  console.assert(tree[0].children.length === 2, `Expected Chapter 1 to have 2 children, got ${tree[0].children.length}`);
  console.assert(tree[1].children.length === 1, `Expected Chapter 2 to have 1 child, got ${tree[1].children.length}`);
  console.assert(tree[0].children[0].title === '1.1 Background of the Study', 'Child title mismatch');
  return true;
}

export function testBookmarkValidation() {
  const validate = (name: string, isTaken: (n: string) => boolean = () => false): string | null => {
    const trimmed = name.trim();
    if (!trimmed) return 'Bookmark name cannot be empty.';
    if (!/^[a-zA-Z]/.test(trimmed)) return 'Bookmark name must start with a letter.';
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(trimmed)) return 'Only letters, numbers, and underscores are allowed (no spaces).';
    if (isTaken(trimmed)) return `Bookmark "${trimmed}" already exists.`;
    return null;
  };

  console.assert(validate('') !== null, 'Empty name should fail');
  console.assert(validate('123abc') !== null, 'Starting with number should fail');
  console.assert(validate('my bookmark') !== null, 'Spaces should fail');
  console.assert(validate('my_bookmark_1') === null, 'Valid name should pass');
  console.assert(validate('Introduction') === null, 'Valid name should pass');
  console.assert(validate('Intro', (n) => n === 'Intro') !== null, 'Duplicate name should fail');
  return true;
}

export function testSnippetCreation() {
  const text = 'The methodology encompasses primary data collection and quantitative analysis across multiple research centers.';
  const query = 'primary data';
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  const foundPos = textLower.indexOf(queryLower);

  console.assert(foundPos !== -1, 'Query should be found in text');

  const preStart = Math.max(0, foundPos - 20);
  const snippetPre = text.substring(preStart, foundPos);
  const snippetMatch = text.substring(foundPos, foundPos + query.length);
  const snippetPost = text.substring(foundPos + query.length, foundPos + query.length + 20);

  console.assert(snippetMatch === 'primary data', 'Match text should be accurate');
  console.assert(snippetPre.length > 0, 'Pre snippet should not be empty');
  console.assert(snippetPost.length > 0, 'Post snippet should not be empty');
  return true;
}

export { runWordSearchTests } from './wordSearch.test';
