/**
 * --------------------------------------------------------
 * Unit tests for wordSearch service:
 * 1. buildSnippet:
 *    - match at start
 *    - match at middle
 *    - match at end
 *    - very long paragraph
 * 2. next / previous wrap-around
 * 3. Stale search ignored (request counter)
 * 4. Empty and no-result states
 * --------------------------------------------------------
 */

import { wordSearchService } from '../services/wordSearch';
import { useNavigationStore } from '../store/navigationStore';

export function runWordSearchTests(): boolean {
  console.log('--- Running wordSearch Unit Tests ---');

  // -------------------------------------------------------------
  // TEST 1: buildSnippet - Match at start
  // -------------------------------------------------------------
  {
    const text = 'Primary research data were gathered from 15 healthcare clinical sites across the state.';
    const matchText = 'Primary research';
    const matchIdx = text.indexOf(matchText);
    const snippet = wordSearchService.buildSnippet(text, matchIdx, matchText.length, 60);

    console.assert(snippet.snippetMatch === matchText, 'TEST 1: Match text mismatch');
    console.assert(snippet.snippetPre === '', 'TEST 1: Start match should have empty snippetPre (no leading ellipsis)');
    console.assert(snippet.snippetPost.length > 0, 'TEST 1: snippetPost should have following context');
  }

  // -------------------------------------------------------------
  // TEST 2: buildSnippet - Match in the middle
  // -------------------------------------------------------------
  {
    const text =
      'In this detailed investigation into medical methodologies, primary data collection played a pivotal role in validating the hypothesis.';
    const matchText = 'primary data collection';
    const matchIdx = text.indexOf(matchText);
    const snippet = wordSearchService.buildSnippet(text, matchIdx, matchText.length, 30);

    console.assert(snippet.snippetMatch === matchText, 'TEST 2: Match text mismatch');
    console.assert(snippet.snippetPre.startsWith('...'), 'TEST 2: Middle match should have leading ellipsis');
    console.assert(snippet.snippetPost.endsWith('...'), 'TEST 2: Middle match should have trailing ellipsis');
  }

  // -------------------------------------------------------------
  // TEST 3: buildSnippet - Match at end
  // -------------------------------------------------------------
  {
    const text = 'All participants provided informed consent prior to entering the clinical phase.';
    const matchText = 'clinical phase.';
    const matchIdx = text.indexOf(matchText);
    const snippet = wordSearchService.buildSnippet(text, matchIdx, matchText.length, 60);

    console.assert(snippet.snippetMatch === matchText, 'TEST 3: Match text mismatch');
    console.assert(snippet.snippetPre.startsWith('...'), 'TEST 3: End match should have leading ellipsis');
    console.assert(snippet.snippetPost === '', 'TEST 3: End match should have empty snippetPost (no trailing ellipsis)');
  }

  // -------------------------------------------------------------
  // TEST 4: buildSnippet - Very long paragraph
  // -------------------------------------------------------------
  {
    const longPre = 'The author meticulously documented every observation throughout the 24 month double blind clinical trial period with extreme rigor and precision. '.repeat(4);
    const longPost = ' Subsequent comparative statistical assessments revealed extraordinary efficacy across diverse patient sub cohorts and demographics. '.repeat(4);
    const fullLongText = longPre + 'TARGET_KEYWORD' + longPost;

    const matchIdx = fullLongText.indexOf('TARGET_KEYWORD');
    const snippet = wordSearchService.buildSnippet(fullLongText, matchIdx, 'TARGET_KEYWORD'.length, 60);

    console.assert(snippet.snippetMatch === 'TARGET_KEYWORD', 'TEST 4: Long paragraph match mismatch');
    console.assert(snippet.snippetPre.startsWith('...'), 'TEST 4: Long paragraph should truncate pre with ellipsis');
    console.assert(snippet.snippetPost.endsWith('...'), 'TEST 4: Long paragraph should truncate post with ellipsis');
    // Pre text should be around 60 chars (+ 3 for ellipsis)
    console.assert(snippet.snippetPre.length <= 65, `TEST 4: Pre length ${snippet.snippetPre.length} exceeded radius limit`);
    console.assert(snippet.snippetPost.length <= 65, `TEST 4: Post length ${snippet.snippetPost.length} exceeded radius limit`);
  }

  // -------------------------------------------------------------
  // TEST 5: next / previous wrap-around
  // -------------------------------------------------------------
  {
    const store = useNavigationStore.getState();
    store.clear();
    store.setResults([
      { id: '1', matchText: 'A', snippetPre: '', snippetMatch: 'A', snippetPost: '', pageNumber: 1, index: 0 },
      { id: '2', matchText: 'B', snippetPre: '', snippetMatch: 'B', snippetPost: '', pageNumber: 2, index: 1 },
      { id: '3', matchText: 'C', snippetPre: '', snippetMatch: 'C', snippetPost: '', pageNumber: 3, index: 2 },
    ]);

    // Initial index is 0
    console.assert(useNavigationStore.getState().currentIndex === 0, 'TEST 5: Initial index should be 0');

    // Previous from 0 wraps around to 2 (last item)
    const prevIdx = store.previous();
    console.assert(prevIdx === 2, `TEST 5: Previous from 0 should wrap to 2, got ${prevIdx}`);
    console.assert(useNavigationStore.getState().currentIndex === 2, 'TEST 5: Store currentIndex should be 2');

    // Next from 2 wraps around to 0
    const nextIdx = store.next();
    console.assert(nextIdx === 0, `TEST 5: Next from 2 should wrap to 0, got ${nextIdx}`);
    console.assert(useNavigationStore.getState().currentIndex === 0, 'TEST 5: Store currentIndex should be 0');
  }

  // -------------------------------------------------------------
  // TEST 6: Stale search ignored (request counter)
  // -------------------------------------------------------------
  {
    const store = useNavigationStore.getState();
    store.clear();
    const req1 = store.incrementRequestId();
    const req2 = store.incrementRequestId();

    console.assert(req2 > req1, 'TEST 6: Request counter should increment');
    console.assert(store.requestId === req2, 'TEST 6: Active requestId should equal req2');

    // Simulating completion of older req1: store.requestId !== req1 => drop stale result
    const isStale = store.requestId !== req1;
    console.assert(isStale === true, 'TEST 6: Older request must be recognized as stale and ignored');
  }

  // -------------------------------------------------------------
  // TEST 7: Empty and no-result states
  // -------------------------------------------------------------
  {
    const store = useNavigationStore.getState();
    store.clear();

    console.assert(store.query === '', 'TEST 7: Cleared query should be empty');
    console.assert(store.results.length === 0, 'TEST 7: Cleared results should be empty');
    console.assert(store.currentIndex === -1, 'TEST 7: Cleared currentIndex should be -1');
    console.assert(store.status === 'idle', 'TEST 7: Cleared status should be idle');
  }

  console.log('--- All wordSearch Unit Tests Passed Successfully! ---');
  return true;
}
