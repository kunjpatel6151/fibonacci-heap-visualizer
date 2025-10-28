import React, { useEffect, useRef } from 'react';

const NODE_RADIUS = 25;
const LEVEL_HEIGHT = 80;
const NODE_SPACING = 80; // increased spacing for clarity

export default function HeapView({ data }) {
  const canvasRef = useRef(null);

  const drawNode = (ctx, x, y, node, isMin) => {
    ctx.beginPath();
    ctx.arc(x, y, NODE_RADIUS, 0, 2 * Math.PI);
    ctx.fillStyle = isMin ? '#ffeb3b' : '#fff';
    ctx.fill();
    ctx.strokeStyle = '#2196f3';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#000';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${node.key}`, x, y);
  };

  const drawConnection = (ctx, x1, y1, x2, y2) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1 + NODE_RADIUS);
    ctx.lineTo(x2, y2 - NODE_RADIUS);
    ctx.strokeStyle = '#90caf9';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  // Build node map (id -> node object) and wire children as objects
  const buildNodeMap = (nodes = []) => {
    const map = new Map();
    for (const n of nodes) {
      map.set(n.id, { ...n, childrenObjs: [] });
    }
    // Wire children objects and parent references
    for (const n of nodes) {
      const parentObj = map.get(n.id);
      if (!parentObj) continue;
      for (const cid of n.children || []) {
        const childObj = map.get(cid);
        if (childObj) {
          parentObj.childrenObjs.push(childObj);
          childObj.parentObj = parentObj;
        }
      }
    }
    return map;
  };

  // Compute positions using DFS: leaf nodes get incremental x, parents centered over children
  const calculatePositions = (nodesArr = [], rootsArr = []) => {
    const positions = new Map();
    const map = buildNodeMap(nodesArr);
    // determine root objects (preserve order from rootsArr)
    let rootObjs = (rootsArr || []).map(rid => map.get(rid)).filter(Boolean);

    // fallback: any node without parent
    if (rootObjs.length === 0) {
      for (const nodeObj of map.values()) {
        if (!nodeObj.parentObj) rootObjs.push(nodeObj);
      }
    }

    // final fallback: all nodes
    if (rootObjs.length === 0) {
      rootObjs = Array.from(map.values());
    }

    let nextX = 50;
    let maxDepth = 0;
    const visited = new Set();

    const dfs = (node, depth) => {
      if (!node || visited.has(node.id)) return;
      visited.add(node.id);
      maxDepth = Math.max(maxDepth, depth);

      if (!node.childrenObjs || node.childrenObjs.length === 0) {
        // leaf
        node._x = nextX;
        node._y = 50 + depth * LEVEL_HEIGHT;
        nextX += NODE_SPACING;
      } else {
        // internal: layout all children first
        for (const child of node.childrenObjs) dfs(child, depth + 1);

        // if none of the children got positions (possible due to cycles), fallback to place as leaf
        const firstChild = node.childrenObjs.find(c => c._x !== undefined);
        const lastChild = [...node.childrenObjs].reverse().find(c => c._x !== undefined);

        if (firstChild && lastChild) {
          node._x = (firstChild._x + lastChild._x) / 2;
        } else {
          // children couldn't be positioned, place node as next leaf
          node._x = nextX;
          nextX += NODE_SPACING;
        }
        node._y = 50 + depth * LEVEL_HEIGHT;
      }
      positions.set(node.id, { x: node._x, y: node._y });
    };

    // Run DFS for each root in order
    for (const root of rootObjs) {
      dfs(root, 0);
    }

    // If some nodes weren't reachable from roots (disconnected), place them too
    for (const nodeObj of map.values()) {
      if (!visited.has(nodeObj.id)) dfs(nodeObj, 0);
    }

    // Return positions and computed canvas size hints
    const canvasWidth = Math.max(800, nextX + NODE_RADIUS + 50);
    const canvasHeight = Math.max(400, (maxDepth + 2) * LEVEL_HEIGHT);
    return { positions, canvasWidth, canvasHeight };
  };

  useEffect(() => {
    if (!data || !data.nodes) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const { positions, canvasWidth, canvasHeight } = calculatePositions(data.nodes || [], data.roots || []);

    // Resize canvas to fit content (and clear)
    if (canvas.width !== canvasWidth) canvas.width = canvasWidth;
    if (canvas.height !== canvasHeight) canvas.height = canvasHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections first
    const nodeMap = new Map((data.nodes || []).map(n => [n.id, n]));
    data.nodes?.forEach(node => {
      const pos = positions.get(node.id);
      if (pos && node.children) {
        node.children.forEach(childId => {
          const childPos = positions.get(childId);
          if (childPos) {
            drawConnection(ctx, pos.x, pos.y, childPos.x, childPos.y);
          }
        });
      }
    });

    // Draw nodes
    data.nodes?.forEach(node => {
      const pos = positions.get(node.id);
      if (pos) {
        drawNode(ctx, pos.x, pos.y, node, node.id === data.min);
      }
    });
  }, [data]);

  return (
    <div style={{ marginTop: 20, border: '1px solid #ccc', padding: 10 }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        style={{ background: '#f8f8f8', display: 'block' }}
      />
    </div>
  );
}