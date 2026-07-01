# Fibonacci Heap Visualizer

An interactive web application for visualizing and understanding the operations of a **Fibonacci Heap**. The project consists of a **React frontend** for visualization and a **Node.js/Express backend** that implements an in-memory Fibonacci Heap and exposes REST APIs for performing heap operations.

## 🌐 Live Demo

**Frontend:**  
https://fibonacci-heap-visualizer.vercel.app

**Backend API:**  
https://fibonacci-heap-visualizer.onrender.com

---

## Features

- Insert keys into a Fibonacci Heap
- Extract the minimum node
- Delete a node by its ID
- Union multiple keys into the heap
- Interactive visualization of heap structure
- Canvas-based rendering of root lists and child relationships
- Tabular view of node information
- RESTful API for heap operations

---

## Project Structure

```
Fibonacci-Heap-Visualizer/
│
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Controls.js
│   │   │   ├── HeapView.js
│   │   │   └── NodeTable.js
│   │   └── App.js
│   └── package.json
│
├── server/                    # Express Backend
│   ├── src/
│   │   ├── heap.js
│   │   └── index.js
│   └── package.json
│
└── README.md
```

---

## Technologies Used

### Frontend

- React
- HTML5
- CSS3
- JavaScript
- Canvas API

### Backend

- Node.js
- Express.js

---

## Running Locally

### Clone the Repository

```bash
git clone https://github.com/kunjpatel6151/Fibonacci-Heap-Visualizer.git
cd Fibonacci-Heap-Visualizer
```

### Start the Backend

```bash
cd server
npm install
npm start
```

The backend runs on:

```
http://localhost:5000
```

---

### Start the Frontend

Open another terminal.

```bash
cd client
npm install
npm start
```

The React application runs on:

```
http://localhost:3000
```

---

## API Endpoints

Base URL

```
/api
```

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/heap` | Returns the current heap |
| POST | `/insert` | Inserts a new key |
| POST | `/extract-min` | Removes the minimum node |
| POST | `/delete` | Deletes a node by ID |
| POST | `/union` | Inserts multiple keys |
| POST | `/clear` | Clears the heap |

---

## Implementation

The backend implements a complete in-memory Fibonacci Heap supporting:

- Insert
- Extract Minimum
- Delete
- Union
- Heap Serialization

The frontend communicates with the backend using REST APIs and visualizes the heap structure in real time using a canvas-based renderer.

---

## Notes

- Heap data is stored entirely in memory.
- The heap state is reset whenever the backend server restarts.
- Designed for educational purposes to demonstrate Fibonacci Heap operations and structure.

---

## License

This project is intended for educational purposes.