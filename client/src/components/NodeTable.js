import React from 'react';

export default function NodeTable({ nodes }) {
  return (
    <div style={styles.container}>
      <h3>Node List</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Key</th>
            <th style={styles.th}>Parent ID</th>
          </tr>
        </thead>
        <tbody>
          {nodes.sort((a, b) => a.id - b.id).map(node => (
            <tr key={node.id}>
              <td style={styles.td}>{node.id}</td>
              <td style={styles.td}>{node.key}</td>
              <td style={styles.td}>{node.parent || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: {
    marginTop: 20,
    marginBottom: 20,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    borderRadius: '4px',
  },
  th: {
    backgroundColor: '#f5f5f5',
    padding: '12px 15px',
    textAlign: 'left',
    borderBottom: '2px solid #ddd',
  },
  td: {
    padding: '8px 15px',
    borderBottom: '1px solid #eee',
  },
};