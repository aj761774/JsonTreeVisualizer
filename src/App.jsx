import React, { useRef, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import SideBar from './components/SideBar/Sidebar';
import './App.css';

/**
 * Helpers
 */
const safeId = (path) =>
  path.replace(/\./g, '_dot_').replace(/\[/g, '_brk_').replace(/\]/g, '_');

const defaultStyles = {
  object: { background: '#7c3aed', color: '#fff' },
  array: { background: '#059669', color: '#fff' },
  primitive: { background: '#f59e0b', color: '#111' },
};

/**
 * Build a hierarchical tree (nodes + edges) from JSON.
 * Produces deterministic positions using level & order counters.
 */
function buildTreeElements(json) {
  const nodes = [];
  const edges = [];

  const levelX = 300; // horizontal spacing per level
  const rowY = 120; // vertical spacing for siblings
  const counters = {}; // track sibling index per level so nodes don't overlap

  function ensureCounter(level) {
    if (counters[level] === undefined) counters[level] = 0;
  }

  function walk(value, path = '$', level = 0, parentId = null) {
    ensureCounter(level);
    const indexAtLevel = counters[level]++;
    const id = safeId(path);

    // determine type
    const type = Array.isArray(value)
      ? 'array'
      : value === null || typeof value !== 'object'
      ? 'primitive'
      : 'object';
    const style = {
      ...{
        padding: 10,
        borderRadius: 8,
        border: '2px solid rgba(255,255,255,0.9)',
        fontSize: 13,
      },
      ...(type === 'object'
        ? defaultStyles.object
        : type === 'array'
        ? defaultStyles.array
        : defaultStyles.primitive),
    };

    const x = level * levelX + 100;
    const y = indexAtLevel * rowY + 40;

    nodes.push({
      id,
      position: { x, y },
      data: {
        label: type === 'primitive' ? `${path}: ${String(value)}` : path,
      },
      style,
      draggable: true,
    });

    if (parentId) {
      edges.push({
        id: `e_${parentId}_${id}`,
        source: parentId,
        target: id,
        animated: false,
        // style: { stroke: '#ccc', strokeWidth: 2 } // optional edge styling
      });
    }

    // Walk into children (object keys or array items)
    if (type === 'object') {
      // reset counter at next level if first child of this parent
      if (counters[level + 1] === undefined) counters[level + 1] = 0;
      for (const key of Object.keys(value)) {
        const childPath = `${path}.${key}`;
        walk(value[key], childPath, level + 1, id);
      }
    } else if (type === 'array') {
      if (counters[level + 1] === undefined) counters[level + 1] = 0;
      value.forEach((item, i) => {
        const childPath = `${path}[${i}]`;
        walk(item, childPath, level + 1, id);
      });
    }

    return { nodes, edges };
  }

  walk(json, '$', 0, null);
  return { nodes, edges };
}

/**
 * App
 */
export default function App() {
  const sample = `{
  "user": {
    "name": "Alice",
    "address": {
      "city": "Wonderland",
      "zip": 12345
    }
  },
  "items": [
    { "name": "item1" },
    { "name": "item2" }
  ]
}`;

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const jsonRef = useRef(sample);
  const inputRef = useRef(null);
  const rfInstanceRef = useRef(null);

  const onInit = useCallback((rfi) => {
    rfInstanceRef.current = rfi;
  }, []);

  // Generate tree from JSON text
  const generateTree = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonRef.current);
      // reset counters so layout starts fresh
      const { nodes: newNodes, edges: newEdges } = buildTreeElements(parsed);
      setNodes(newNodes);
      setEdges(newEdges);

      // fit view after a tiny delay so React Flow has updated
      setTimeout(() => rfInstanceRef.current?.fitView?.({ padding: 0.2 }), 80);
    } catch (err) {
      alert('Invalid JSON: ' + err.message);
    }
  }, [setNodes, setEdges]);

  // Search by JSONPath-like string (the nodes use the same path format)
  const handleSearch = useCallback(() => {
    const q = inputRef.current?.value?.trim();
    if (!q)
      return alert('Enter a path like $.user.address.city or $.items[0].name');

    const targetId = safeId(q);
    const found = nodes.find((n) => n.id === targetId);
    if (!found) return alert('No match found');

    // visually highlight node (by increasing border)
    setNodes((nds) =>
      nds.map((n) =>
        n.id === targetId
          ? { ...n, style: { ...n.style, border: '4px solid #fef08a' } }
          : {
              ...n,
              style: { ...n.style, border: '2px solid rgba(255,255,255,0.9)' },
            }
      )
    );

    // pan/zoom to node via rfInstanceRef
    setTimeout(() => {
      if (rfInstanceRef.current?.setCenter) {
        const { x, y } = found.position;
        rfInstanceRef.current.setCenter(x, y, { zoom: 1.4, duration: 500 });
      } else {
        rfInstanceRef.current?.fitView?.({ nodes: [found.id], padding: 0.3 });
      }
    }, 80);
  }, [nodes, setNodes]);

  // Wire json textarea to ref
  const onJsonChange = (e) => {
    jsonRef.current = e.target.value;
  };

  return (
    <div className="app-container">
      <SideBar
        generateTree={generateTree}
        handleSearch={handleSearch}
        onJsonChange={onJsonChange}
        rfInstanceRef={rfInstanceRef}
        inputRef={inputRef}
      />
      <div className="react-flow-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onInit={onInit}
          fitView
          defaultEdgeOptions={{
            animated: true,
            style: { strokeWidth: 2, stroke: '#cbd5e1' },
          }}
        >
          <Background variant="dots" gap={16} size={1} color="#334155" />
          <Controls position="bottom-left" />
        </ReactFlow>
      </div>
    </div>
  );
}
