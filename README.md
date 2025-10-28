# Fibonacci Heap Visualizer

A small, educational web app that implements and visualizes a Fibonacci Heap. The project has a Node/Express server that contains an in-memory Fibonacci Heap implementation and a React client that fetches the heap state and renders it on a canvas.

This README explains what the project contains, how to run it locally, the API the server exposes, and some developer notes.

## Project structure

- `server/` — Express API and the Fibonacci Heap implementation

  - `src/heap.js` — in-memory Fibonacci Heap class with insert, extractMin, delete, union, serialization
  - `src/index.js` — Express endpoints for manipulating the heap
  - `package.json` — server scripts & dependencies

- `client/` — React application that visualizes the heap
  - `src/App.js` — main app that talks to the server
  - `src/components/Controls.js` — UI controls for insert, extract, clear, union
  - `src/components/HeapView.js` — canvas-based visualizer
  - `src/components/NodeTable.js` — tabular view of nodes
  - `package.json` — client scripts & dependencies

## Features

- Insert numeric keys into a Fibonacci heap (server-side)
- Extract minimum
- Delete a node (by node ID)
- Union via inserting multiple keys at once
- Visual rendering of the heap: roots, children, node positions and connections
- Simple node table showing ID, key and parent ID

## Quick start (Windows / PowerShell)

Open two terminals (one for server, one for client). From the project root run:

# Server

```powershell
cd server
npm install
# start server on port 5000
npm run start
# (or use nodemon during development)
npm run dev
```

# Client

```powershell
cd client
npm install
npm start
```

The React app expects the API at `http://localhost:5000/api`. The server listens on port `5000` by default.

## API

All endpoints are under `/api`.

- GET `/api/heap` — returns serialized heap state: { nodes, roots, min, n }
- POST `/api/insert` — body: { key: number } → returns { id }
- POST `/api/extract-min` — no body → returns { min: { key, id } | null }
- POST `/api/delete` — body: { id: number } → returns { success: true|false }
- POST `/api/union` — body: { keys: number[] } → inserts each key, returns success and heap summary
- POST `/api/clear` — clears the heap (resets state)

Note: the server uses CORS and JSON payloads.

## Implementation notes

- The heap implementation is in `server/src/heap.js`. It keeps nodes as circular doubly-linked lists for root lists and child lists. Nodes are assigned numeric IDs for client-side referencing.
- The `toJSON()` method serializes nodes into objects containing id, key, degree, marked, parent and children arrays. The client uses this to reconstruct relationships and compute node positions for the canvas.

## Known issues / caveats

- `server/src/index.js` declares `const heap = new FibonacciHeap();` at the top, but the `/api/clear` route attempts to reassign `heap = new FibonacciHeap();`. Reassigning a `const` will throw. Quick fixes:

  - Change the declaration to `let heap = new FibonacciHeap();`, or
  - Modify the clear route to call `heap.clear()` if provided.

- The heap implementation is meant for educational/demo use and stores everything in memory. It does not persist state across server restarts.

- The find-by-id logic in `heap._findNodeById()` performs a BFS and is safe for the in-memory structure, but it's not optimized for very large heaps.

## Development notes and suggestions

- If you want hot-reload for the server during development, use `npm run dev` in the `server` folder (requires `nodemon`, already in `devDependencies`).
- The client is a Create React App project — use `npm start` to boot it in development mode.
- Consider adding more defensive validation on the server for inputs coming from the client (the code performs some checks but could be stricter).
- Tests: currently there are no automated tests. A good follow-up would be to add unit tests for `server/src/heap.js` (e.g., using Jest) and a few integration tests for the API.

## Contributing

Contributions are welcome. Suggested small first tasks:

- Fix the clear route bug (see Known issues).
- Add unit tests for heap operations.
- Improve layout algorithm in `client/src/components/HeapView.js` to reduce node overlap for larger heaps.

## License

This project is provided for educational use. Add your preferred license if you intend to publish it.

---

If you'd like, I can:

- Open a PR that fixes the `clear` endpoint (change `const heap` to `let heap`) and add a quick test; or
- Add a short CONTRIBUTING.md or demo GIF/Screenshots to the README.

Tell me what you'd like next.
