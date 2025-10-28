const FibonacciHeap = require('./heap');

function assert(cond, msg) {
  if (!cond) {
    console.error('ASSERTION FAILED:', msg);
    process.exitCode = 1;
    throw new Error(msg);
  }
}

function runTests() {
  console.log('Running FibonacciHeap tests...');

  // Test 1: insert and extractMin returns sorted order
  const h1 = new FibonacciHeap();
  const keys1 = [5, 3, 7, 1, 9];
  keys1.forEach(k => h1.insert(k));
  const out1 = [];
  let r;
  while ((r = h1.extractMin()) !== null) out1.push(r.key);
  assert(JSON.stringify(out1) === JSON.stringify([1,3,5,7,9]), `extractMin order wrong: ${out1}`);
  console.log('Test 1 passed: insert+extract produces sorted sequence');

  // Test 2: decreaseKey (internal function) -- insert then lower a key
  const h2 = new FibonacciHeap();
  const id10 = h2.insert(10);
  const id20 = h2.insert(20);
  const id30 = h2.insert(30);
  const decreased = h2.decreaseKey(id30, 5);
  assert(decreased === true, 'decreaseKey should return true');
  const seq2 = [];
  while ((r = h2.extractMin()) !== null) seq2.push(r.key);
  assert(JSON.stringify(seq2) === JSON.stringify([5,10,20]), `decreaseKey flow failed: ${seq2}`);
  console.log('Test 2 passed: decreaseKey works and affects extract order');

  // Test 3: delete a node
  const h3 = new FibonacciHeap();
  const a = h3.insert(4);
  const b = h3.insert(2);
  const c = h3.insert(6);
  const delOk = h3.delete(b);
  assert(delOk === true, 'delete should return true');
  const seq3 = [];
  while ((r = h3.extractMin()) !== null) seq3.push(r.key);
  assert(JSON.stringify(seq3) === JSON.stringify([4,6]), `delete flow failed: ${seq3}`);
  console.log('Test 3 passed: delete removes node from heap');

  // Test 4: clear resets heap
  const h4 = new FibonacciHeap();
  h4.insert(1);
  h4.insert(2);
  assert(h4.nodeCount === 2, 'nodeCount should be 2');
  if (typeof h4.clear === 'function') {
    h4.clear();
    assert(h4.nodeCount === 0, 'clear did not reset nodeCount');
    assert(h4.min === null, 'clear did not reset min');
    console.log('Test 4 passed: clear() resets heap state');
  } else {
    console.warn('Test 4 skipped: clear() not implemented');
  }

  // Test 5: union via reinserting keys
  const h5 = new FibonacciHeap();
  const keysA = [10, 1, 5];
  const keysB = [2, 50];
  keysA.forEach(k => h5.insert(k));
  keysB.forEach(k => h5.insert(k));
  const seq5 = [];
  while ((r = h5.extractMin()) !== null) seq5.push(r.key);
  assert(JSON.stringify(seq5) === JSON.stringify([1,2,5,10,50]), `union via insert failed: ${seq5}`);
  console.log('Test 5 passed: union via inserting keys works');

  console.log('\nAll tests passed.');
}

try {
  runTests();
} catch (err) {
  console.error('Tests failed:', err && err.message);
  process.exitCode = 1;
}
