
class Node {
    constructor(key) {
        this.key = key;
        this.degree = 0;
        this.marked = false;
        this.parent = null;
        this.child = null;
        
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
        
        this._maxNodes = maxNodes;
    }

    insert(key) {
        if (this.nodeCount + 1 > this._maxNodes) {
            throw new Error('Heap node limit reached');
        }
        const node = new Node(key);
        
        node.left = node.right = node;
        node.parent = null;
        node.child = null;
        node.degree = 0;
        node.marked = false;

        
        if (!this.min) {
            node.left = node.right = node;
            this.rootList = node;
            this.min = node;
        } else {
            // Always insert strictly between min.left and min (immediately left of current min)
            const m = this.min;
            const left = m.left || m;

            
            node.left = left;
            node.right = m;
            left.right = node;
            m.left = node;

            
            if (!this.rootList) this.rootList = m;
        }

        if (!this.min || node.key < this.min.key) this.min = node;

        this.nodeCount++;
        return node.id;
    }

    _mergeIntoRootList(node, anchor) {
        if (!node) return;
        anchor = anchor || this.rootList;

        
        if (!anchor) {
            node.left = node.right = node;
            this.rootList = node;
            return;
        }

       
        const left = anchor.left || anchor;
        node.left = left;
        node.right = anchor;
        left.right = node;
        anchor.left = node;

        
        if (!this.rootList) this.rootList = anchor;
    }

    
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
        
        if (node === node.right && node === this.rootList) {
            this.rootList = null;
        } else {
            
            node.left.right = node.right;
            node.right.left = node.left;
            
            if (this.rootList === node) {
                this.rootList = node.right !== node ? node.right : null;
            }
        }
        node.left = node.right = node;
    }

    _link(child, parent) {
        
        this._removeFromRootList(child);

        child.parent = parent;
        child.marked = false;

        if (!parent.child) {
            parent.child = child;
            child.left = child.right = child;
        } else {
            
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

        
        if (z.child) {
            let x = z.child;
            const start = x;
            do {
                const next = x.right;
                
                x.left = x.right = x;
                x.parent = null;
                
                this._mergeIntoRootList(x);
                x = next;
            } while (x && x !== start);
            z.child = null;
            z.degree = 0;
        }

        
        this._removeFromRootList(z);

        
        if (!this.rootList) {
            this.min = null;
        } else {
            
            this.min = this.rootList;
            this._consolidate();
        }

        this.nodeCount = Math.max(0, this.nodeCount - 1);
        
        z.left = z.right = z;
        return { key: z.key, id: z.id };
    }

    
    _consolidate() {
        const maxDegree = Math.floor(Math.log2(Math.max(1, this.nodeCount))) + 3;
        const A = new Array(maxDegree).fill(null);

        
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
                    
                    const tmp = x; x = y; y = tmp;
                }
                this._link(y, x); 
                A[d] = null;
                d++;
            }
            A[d] = x;
        }

        
        this.rootList = null;
        this.min = null;
        for (let node of A) {
            if (!node) continue;
            node.left = node.right = node;
            if (!this.rootList) {
                this.rootList = node;
                this.min = node;
            } else {
                
                const left = this.rootList.left || this.rootList;
                node.left = left;
                node.right = this.rootList;
                left.right = node;
                this.rootList.left = node;
                if (node.key < this.min.key) this.min = node;
            }
        }
    }

    
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

    
    toJSON() {
        const nodes = [];
        const roots = [];
        const visited = new Set();
        if (!this.rootList) return { nodes, roots, min: null, n: 0 };

        
        const m = this.min || this.rootList;

        
        const leftSide = [];
        if (m) {
            let cur = m.left;
            while (cur && cur !== m) {
                
                leftSide.unshift(cur.id);
                cur = cur.left;
            }
        }

        
        const rightSide = [];
        if (m) {
            let cur = m.right;
            while (cur && cur !== m) {
                rightSide.push(cur.id);
                cur = cur.right;
            }
        }

        
        if (m) {
            roots.push(...leftSide);
            roots.push(m.id);
            roots.push(...rightSide);
        }

        
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