import React, { useEffect, useState } from 'react';
import HeapView from './components/HeapView';
import Controls from './components/Controls';
import NodeTable from './components/NodeTable';  // Add this import

const API = 'http://localhost:5000/api';

export default function App() {
  const [heap, setHeap] = useState({ n: 0, roots: [], nodes: [], min: null });
  const [error, setError] = useState(null);

  const fetchHeap = async () => {
    try {
      const res = await fetch(`${API}/heap`);
      const data = await res.json();
      setHeap(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch heap state');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHeap();
  }, []);

  const handleInsert = async (key) => {
    try {
      await fetch(`${API}/insert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
      });
      fetchHeap();
    } catch (err) {
      setError('Insert failed');
      console.error(err);
    }
  };

  const handleExtractMin = async () => {
    try {
      const res = await fetch(`${API}/extract-min`, { method: 'POST' });
      const data = await res.json();
      fetchHeap();
      if (data.min) {
        setError(`Extracted min: ${data.min.key} (ID: ${data.min.id})`);
      }
    } catch (err) {
      setError('Extract-min failed');
      console.error(err);
    }
  };

  const handleDecreaseKey = async (id, newKey) => {
  // decrease-key feature removed; this function kept as no-op stub for safety
  };

  const handleDelete = async (id) => {
    try {
        const response = await fetch(`${API}/delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: Number(id) })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
            await fetchHeap();
            setError(null);
        } else {
            setError(data.error || 'Delete failed');
        }
    } catch (err) {
        setError(`Delete failed: ${err.message}`);
        console.error('Delete error:', err);
    }
  };

  const handleClear = async () => {
    try {
      await fetch(`${API}/clear`, { method: 'POST' });
      fetchHeap();
      setError(null);
    } catch (err) {
      setError('Clear failed');
      console.error(err);
    }
  };

  const handleUnion = async (keys) => {
    try {
      const res = await fetch(`${API}/union`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) {
        await fetchHeap();
        setError(null);
      } else {
        setError(data.error || 'Union failed');
      }
    } catch (err) {
      console.error('Union failed:', err);
      setError(`Union failed: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Fibonacci Heap Visualizer</h1>
      
      {error && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '10px', 
          backgroundColor: error.includes('Extracted') ? '#e8f5e9' : '#ffebee',
          color: error.includes('Extracted') ? '#2e7d32' : '#c62828',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}

      <Controls
        onInsert={handleInsert}
        onExtractMin={handleExtractMin}
        onDelete={handleDelete}
        onUnion={handleUnion}
        onClear={handleClear}
      />

      <div style={{ marginTop: 20 }}>
        <strong>Total nodes:</strong> {heap.n}
        <br />
        <strong>Min node:</strong> {heap.min ? `ID: ${heap.min} (key: ${
          heap.nodes?.find(n => n.id === heap.min)?.key ?? '?'
        })` : 'none'}
      </div>

      <NodeTable nodes={heap.nodes} />  {/* Add this line */}

      <HeapView data={heap} />
    </div>
  );
}