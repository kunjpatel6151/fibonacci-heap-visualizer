import React, { useState } from 'react';

export default function Controls({ onInsert, onExtractMin, onDelete, onUnion, onClear }) {
  // Initialize all state variables
  const [insertKey, setInsertKey] = useState('');
  const [deleteId, setDeleteId] = useState('');
  const [unionKeys, setUnionKeys] = useState('');

  return (
    <div style={styles.container}>
      {/* Insert Section */}
      <div style={styles.section}>
        <input
          type="number"
          value={insertKey}
          onChange={(e) => setInsertKey(e.target.value)}
          placeholder="Enter key to insert"
          style={styles.input}
        />
        <button
          onClick={() => {
            if (insertKey) {
              onInsert(Number(insertKey));
              setInsertKey('');
            }
          }}
          style={styles.button}
        >
          Insert
        </button>
      </div>

      {/* Extract Min Section */}
      <div style={styles.section}>
        <button onClick={onExtractMin} style={styles.button}>
          Extract Min
        </button>
      </div>

      {/* Decrease Key feature removed */}

      {/* Clear Section */}
      <div style={styles.section}>
        <button onClick={onClear} style={styles.button}>
          Clear Heap
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '15px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
  },
  section: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  input: {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    width: '150px',
  },
  button: {
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#2196f3',
    color: 'white',
    cursor: 'pointer',
    minWidth: '120px',
  }
};