const express = require('express');
const cors = require('cors');
const FibonacciHeap = require('./heap');

const app = express();

app.use(cors());
app.use(express.json());

let heap = new FibonacciHeap();

app.get('/api/heap', (req, res) => {
    res.json(heap.toJSON());
});

app.post('/api/insert', (req, res) => {
    const { key } = req.body;
    if (typeof key !== 'number') {
        return res.status(400).json({ error: 'key must be a number' });
    }
    const id = heap.insert(key);
    res.json({ id });
});

app.post('/api/extract-min', (req, res) => {
    const min = heap.extractMin();
    res.json({ min });
});


app.post('/api/delete', (req, res) => {
    const { id } = req.body;
    if (typeof id !== 'number') {
        return res.status(400).json({ error: 'id must be a number' });
    }
    const success = heap.delete(id);
    res.json({ success });
});

app.post('/api/union', (req, res) => {
  const { keys } = req.body;
  if (!Array.isArray(keys)) return res.status(400).json({ error: 'keys must be an array' });

  try {
    keys.forEach(k => {
      const num = (typeof k === 'number') ? k : Number(k);
      if (!Number.isFinite(num)) throw new Error(`invalid key: ${k}`);
      heap.insert(num);
    });
    res.json({ success: true, n: heap.nodeCount, min: heap.min ? heap.min.id : null });
  } catch (err) {
    console.error('Union error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/clear', (req, res) => {
    try {
        // Prefer clearing existing heap state rather than reassigning the variable.
        if (typeof heap.clear === 'function') {
            heap.clear();
        } else {
            heap = new FibonacciHeap();
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: err.message });
});

app.use((req, res) => {
    res.status(404).json({ error: `Endpoint not found: ${req.path}` });
});

const port = 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));