// simple in-memory Fibonacci heap implementation with basic operations
class Node {
    constructor(key) {
        this.key = key;
        this.degree = 0;
        this.marked = false;
        this.parent = null;
        this.child = null;
        // initialize as a standalone circular node
        this.left = this;
        this.right = this;
        this.id = Node._nextId++;
    }
}
Node._nextId = 1;

class FibonacciHeap {
    constructor(maxNodes = 100000) {
        this.min = null;
        this.rootList = null;
        this.nodeCount = 0;
        // defensive limit to avoid runaway memory usage
        this._maxNodes = maxNodes;
    }

    insert(key) {
        if (this.nodeCount + 1 > this._maxNodes) {
            throw new Error('Heap node limit reached');
        }
        const node = new Node(key);
        // initialize as standalone circular node
        node.left = node.right = node;
        node.parent = null;
        node.child = null;
        node.degree = 0;
        node.marked = false;

        // If heap is empty -> node becomes sole root & min
        if (!this.min) {
            node.left = node.right = node;
            this.rootList = node;
            this.min = node;
        } else {
            // Always insert strictly between min.left and min (immediately left of current min)
            const m = this.min;
            const left = m.left || m;

            // splice node in: left <-> node <-> m
            node.left = left;
            node.right = m;
            left.right = node;
            m.left = node;

            // ensure rootList points to some stable root (keep existing)
            if (!this.rootList) this.rootList = m;
        }

        // update minimum after insertion if required
        if (!this.min || node.key < this.min.key) this.min = node;

        this.nodeCount++;
        return node.id;
    }

    // insert node to the LEFT of provided anchor (anchor defaults to rootList if falsy)
    _mergeIntoRootList(node, anchor) {
        if (!node) return;
        anchor = anchor || this.rootList;

        // empty heap: node becomes sole root
        if (!anchor) {
            node.left = node.right = node;
            this.rootList = node;
            return;
        }

        // insert between anchor.left and anchor => immediately left of anchor
        const left = anchor.left || anchor;
        node.left = left;
        node.right = anchor;
        left.right = node;
        anchor.left = node;

        // ensure a stable entry point into the root circular list
        if (!this.rootList) this.rootList = anchor;
    }

    // fully detach node from any circular list and reset its pointers
    _detachFromList(node) {
        if (!node) return;
        if (node.left && node.right && (node.left !== node || node.right !== node)) {
            node.left.right = node.right;
            node.right.left = node.left;
        }
        node.left = node.right = node;
    }

    _removeFromRootList(node) {
        if (!this.rootList || !node) return;
        // single node list
        if (node === node.right && node === this.rootList) {
            this.rootList = null;
        } else {
            // splice out node
            node.left.right = node.right;
            node.right.left = node.left;
            // if rootList pointed to removed node, move it to a neighbor
            if (this.rootList === node) {
                this.rootList = node.right !== node ? node.right : null;
            }
        }
        node.left = node.right = node;
    }

    _link(child, parent) {
        // make child a child of parent (assumes child and parent are roots)
        // remove child from root list first (it should be in root list when linking during consolidate)
        this._removeFromRootList(child);

        child.parent = parent;
        child.marked = false;

        if (!parent.child) {
            parent.child = child;
            child.left = child.right = child;
        } else {
            // insert child into parent's child circular list (to the left of existing child)
            const c = parent.child;
            const left = c.left || c;
            child.left = left;
            child.right = c;
            left.right = child;
            c.left = child;
        }
        parent.degree++;
    }

    extractMin() {
        if (!this.min) return null;
        const z = this.min;

        // move each child of z to root list (parent becomes null)
        if (z.child) {
            let x = z.child;
            const start = x;
            do {
                const next = x.right;
                // detach x from child list
                x.left = x.right = x;
                x.parent = null;
                // add to root list (to the left of current min)
                this._mergeIntoRootList(x);
                x = next;
            } while (x && x !== start);
            z.child = null;
            z.degree = 0;
        }

        // remove z from root list
        this._removeFromRootList(z);

        // if no roots remain, heap becomes empty
        if (!this.rootList) {
            this.min = null;
        } else {
            // set a tentative min and consolidate
            this.min = this.rootList;
            this._consolidate();
        }

        this.nodeCount = Math.max(0, this.nodeCount - 1);
        // fully detach z
        z.left = z.right = z;
        return { key: z.key, id: z.id };
    }

    // consolidate unchanged but ensure it uses _removeFromRootList/_mergeIntoRootList correctly
    _consolidate() {
        const maxDegree = Math.floor(Math.log2(Math.max(1, this.nodeCount))) + 3;
        const A = new Array(maxDegree).fill(null);

        // collect all roots first (safe iteration)
        const roots = [];
        if (this.rootList) {
            let w = this.rootList;
            const start = w;
            do {
                roots.push(w);
                w = w.right;
            } while (w && w !== start);
        }

        for (let w of roots) {
            let x = w;
            let d = x.degree;
            while (A[d]) {
                let y = A[d];
                if (x === y) break; // safety
                if (x.key > y.key) {
                    // ensure x is the smaller
                    const tmp = x; x = y; y = tmp;
                }
                this._link(y, x); // y becomes child of x (y removed from root list inside _link)
                A[d] = null;
                d++;
            }
            A[d] = x;
        }

        // rebuild root list and find new min
        this.rootList = null;
        this.min = null;
        for (let node of A) {
            if (!node) continue;
            node.left = node.right = node;
            if (!this.rootList) {
                this.rootList = node;
                this.min = node;
            } else {
                // insert node to the left of current rootList (or left of min)
                const left = this.rootList.left || this.rootList;
                node.left = left;
                node.right = this.rootList;
                left.right = node;
                this.rootList.left = node;
                if (node.key < this.min.key) this.min = node;
            }
        }
    }

    // safe breadth-first traversal with visited set for serialization and search
    _findNodeById(id) {
        if (!this.rootList) return null;
        const visited = new Set();
        const q = [];
        q.push(this.rootList);

        while (q.length) {
            const n = q.shift();
            if (!n || visited.has(n.id)) continue;
            visited.add(n.id);
            if (n.id === id) return n;

            // enqueue siblings (one circle) safely
            if (n.right && n.right.id !== undefined && !visited.has(n.right.id)) {
                let s = n.right;
                while (s && s.id !== n.id && !visited.has(s.id)) {
                    q.push(s);
                    s = s.right;
                }
            }
            if (n.child && !visited.has(n.child.id)) q.push(n.child);
        }
        return null;
    }

    decreaseKey(id, newKey) {
        const node = this._findNodeById(id);
        if (!node) return false;
        if (typeof newKey !== 'number' || newKey >= node.key) return false;
        node.key = newKey;
        const parent = node.parent;
        if (parent && node.key < parent.key) {
            this._cut(node, parent);
            this._cascadingCut(parent);
        }
        if (!this.min || node.key < this.min.key) this.min = node;
        return true;
    }

    _cascadingCut(node) {
        const parent = node.parent;
        if (!parent) return;
        if (!node.marked) node.marked = true;
        else {
            this._cut(node, parent);
            this._cascadingCut(parent);
        }
    }

    delete(id) {
        const node = this._findNodeById(id);
        if (!node) return false;
        node.key = Number.NEGATIVE_INFINITY;
        if (node.parent) {
            this._cut(node, node.parent);
            this._cascadingCut(node.parent);
        }
        this.min = node;
        this.extractMin();
        return true;
    }

    // safe serialization: avoid revisiting nodes by id
    toJSON() {
        const nodes = [];
        const roots = [];
        const visited = new Set();
        if (!this.rootList) return { nodes, roots, min: null, n: 0 };

        // Build roots array so left-to-right corresponds to:
        // [far-left ... previous-lefts, immediate-left, min, right1, right2 ...]
        const m = this.min || this.rootList;

        // collect left-side nodes (from far-left to immediate-left)
        const leftSide = [];
        if (m) {
            let cur = m.left;
            while (cur && cur !== m) {
                // unshift by walking leftwards and accumulating, but to preserve far-left first
                leftSide.unshift(cur.id);
                cur = cur.left;
            }
        }

        // collect right-side nodes (immediate right to far-right)
        const rightSide = [];
        if (m) {
            let cur = m.right;
            while (cur && cur !== m) {
                rightSide.push(cur.id);
                cur = cur.right;
            }
        }

        // final roots: leftSide (far->near), min, rightSide (near->far)
        if (m) {
            roots.push(...leftSide);
            roots.push(m.id);
            roots.push(...rightSide);
        }

        // BFS using root ids (avoid cycles with visited set)
        const q = [];
        roots.forEach(rid => {
            const rnode = this._findNodeById(rid);
            if (rnode) q.push(rnode);
        });

        while (q.length) {
            const n = q.shift();
            if (!n || visited.has(n.id)) continue;
            visited.add(n.id);

            const nodeData = {
                id: n.id,
                key: n.key,
                degree: n.degree,
                marked: n.marked,
                parent: n.parent ? n.parent.id : null,
                children: []
            };

            if (n.child) {
                let c = n.child;
                const startChildId = c.id;
                do {
                    nodeData.children.push(c.id);
                    if (!visited.has(c.id)) q.push(c);
                    c = c.right;
                } while (c && c.id !== startChildId);
            }

            nodes.push(nodeData);
        }

        return { nodes, roots, min: this.min ? this.min.id : null, n: this.nodeCount };
    }

    clear() {
        this.min = null;
        this.rootList = null;
        this.nodeCount = 0;
        Node._nextId = 1;
    }
}

module.exports = FibonacciHeap;