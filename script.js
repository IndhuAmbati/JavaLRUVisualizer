class LRUCacheVisualizer {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
        this.updateDisplay();
    }

    get(key) {
        if (!this.cache.has(key)) {
            this.logOperation(`GET(${key}) -> -1 (not found)`, "get");
            return -1;
        }

        const value = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, value);
        this.logOperation(`GET(${key}) -> ${value}`, "get");
        this.highlightNode(key);
        return value;
    }

    put(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
            this.cache.set(key, value);
            this.logOperation(`PUT(${key}, ${value}) -> updated`, "put");
            this.highlightNode(key);
            return;
        }

        if (this.cache.size >= this.capacity) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
            this.logOperation(`Evicted key ${firstKey}`, "evict");
        }

        this.cache.set(key, value);
        this.logOperation(`PUT(${key}, ${value}) -> added`, "put");
        this.highlightNode(key);
    }

    delete(key) {
        if (!this.cache.has(key)) {
            this.logOperation(`DELETE(${key}) -> key not found`, "delete");
            return false;
        }

        this.cache.delete(key);
        this.logOperation(`DELETE(${key}) -> removed`, "delete");
        this.updateDisplay();
        return true;
    }

    updateDisplay() {
        const display = document.getElementById("cache-display");
        display.innerHTML = "";

        if (this.cache.size === 0) {
            display.innerHTML = '<div class="empty-cache">Cache is empty</div>';
            return;
        }

        const items = Array.from(this.cache.entries()).reverse();

        items.forEach(([key, value], index) => {
            const node = document.createElement("div");
            node.className = "cache-node";
            node.id = `node-${key}`;

            let position = `Position ${index + 1}`;
            if (index === 0) {
                position = "Most Recent";
            } else if (index === items.length - 1) {
                position = "Least Recent";
            }

            node.innerHTML = `
                <div class="key-value">Key: ${key}, Value: ${value}</div>
                <div class="position">${position}</div>
            `;

            display.appendChild(node);
        });
    }

    highlightNode(key) {
        this.updateDisplay();
        setTimeout(() => {
            const node = document.getElementById(`node-${key}`);
            if (node) {
                node.classList.add("highlight");
                setTimeout(() => {
                    node.classList.remove("highlight");
                }, 600);
            }
        }, 100);
    }

    logOperation(message, type) {
        const log = document.getElementById("log");
        const entry = document.createElement("div");
        entry.className = `log-entry ${type}`;
        entry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
    }
}

let lruCache = new LRUCacheVisualizer(4);

function initializeCache() {
    const capacity = parseInt(document.getElementById("capacity").value, 10);
    if (Number.isNaN(capacity) || capacity < 1 || capacity > 10) {
        alert("Capacity must be between 1 and 10");
        return;
    }

    lruCache = new LRUCacheVisualizer(capacity);
    lruCache.logOperation(`Initialized cache with capacity ${capacity}`, "put");
}

function putOperation() {
    const key = parseInt(document.getElementById("key").value, 10);
    const value = parseInt(document.getElementById("value").value, 10);

    if (Number.isNaN(key) || Number.isNaN(value)) {
        alert("Please enter valid numbers for both key and value");
        return;
    }

    lruCache.put(key, value);
    document.getElementById("key").value = "";
    document.getElementById("value").value = "";
}

function getOperation() {
    const key = parseInt(document.getElementById("key").value, 10);

    if (Number.isNaN(key)) {
        alert("Please enter a valid key");
        return;
    }

    lruCache.get(key);
    document.getElementById("key").value = "";
}

function deleteOperation() {
    const key = parseInt(document.getElementById("key").value, 10);

    if (Number.isNaN(key)) {
        alert("Please enter a valid key");
        return;
    }

    lruCache.delete(key);
    document.getElementById("key").value = "";
}

function clearLog() {
    document.getElementById("log").innerHTML = "";
}

document.addEventListener("DOMContentLoaded", () => {
    lruCache.logOperation("LRU Cache Visualizer initialized", "put");
    lruCache.logOperation("Try adding some key-value pairs.", "put");
});

document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
        return;
    }

    const activeElement = document.activeElement;
    if (activeElement.id !== "key" && activeElement.id !== "value") {
        return;
    }

    const valueField = document.getElementById("value").value;
    if (valueField) {
        putOperation();
    } else {
        getOperation();
    }
});
