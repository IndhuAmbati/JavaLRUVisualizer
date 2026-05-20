class LRUCacheVisualizer {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
        this.updateDisplay();
        this.updateStats();
    }

    get(key) {
        if (!this.cache.has(key)) {
            this.logOperation("GET", `Key ${key} was not found in the cache.`, "get");
            setStatus(`GET ${key} missed. No item was moved.`, "info");
            return -1;
        }

        const value = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, value);

        this.logOperation("GET", `Retrieved key ${key} with value ${value}. Moved to most recent.`, "get");
        setStatus(`GET ${key} returned ${value} and moved it to the front.`, "success");
        this.highlightNode(key);
        return value;
    }

    put(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
            this.cache.set(key, value);
            this.logOperation("PUT", `Updated key ${key} with value ${value}.`, "put");
            setStatus(`Updated key ${key} to value ${value}.`, "success");
            this.highlightNode(key);
            return;
        }

        if (this.cache.size >= this.capacity) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
            this.logOperation("EVICT", `Removed least recent key ${firstKey} to make space.`, "evict");
            setStatus(`Cache was full, so key ${firstKey} was evicted.`, "warning");
        }

        this.cache.set(key, value);
        this.logOperation("PUT", `Inserted key ${key} with value ${value}.`, "put");
        setStatus(`Inserted (${key}, ${value}) into the cache.`, "success");
        this.highlightNode(key);
    }

    delete(key) {
        if (!this.cache.has(key)) {
            this.logOperation("DELETE", `Key ${key} could not be removed because it does not exist.`, "delete");
            setStatus(`DELETE ${key} could not run because the key is not present.`, "warning");
            return false;
        }

        this.cache.delete(key);
        this.logOperation("DELETE", `Removed key ${key} from the cache.`, "delete");
        setStatus(`Deleted key ${key} from the cache.`, "success");
        this.updateDisplay();
        this.updateStats();
        return true;
    }

    updateDisplay() {
        const display = document.getElementById("cache-display");
        display.innerHTML = "";

        if (this.cache.size === 0) {
            display.innerHTML = `
                <div class="empty-cache">
                    <strong>The cache is empty</strong>
                    <span>Add entries to see most recent and least recent ordering.</span>
                </div>
            `;
            return;
        }

        const items = Array.from(this.cache.entries()).reverse();

        items.forEach(([key, value], index) => {
            const node = document.createElement("div");
            node.className = "cache-node";
            node.id = `node-${key}`;

            let position = "Recent";
            if (index === 0) {
                node.classList.add("mru");
                position = "Most Recent";
            } else if (index === items.length - 1) {
                node.classList.add("lru");
                position = "Least Recent";
            }

            node.innerHTML = `
                <div class="node-main">
                    <div class="node-key">Key ${key}</div>
                    <div class="node-value">Value ${value}</div>
                </div>
                <div class="node-meta">${position}</div>
            `;

            display.appendChild(node);
        });
    }

    updateStats() {
        const items = Array.from(this.cache.entries());
        const mostRecent = items.length ? items[items.length - 1][0] : "-";
        const leastRecent = items.length ? items[0][0] : "-";

        document.getElementById("capacity-stat").textContent = String(this.capacity);
        document.getElementById("size-stat").textContent = String(this.cache.size);
        document.getElementById("mru-stat").textContent = String(mostRecent);
        document.getElementById("lru-stat").textContent = String(leastRecent);
    }

    highlightNode(key) {
        this.updateDisplay();
        this.updateStats();

        setTimeout(() => {
            const node = document.getElementById(`node-${key}`);
            if (!node) {
                return;
            }

            node.classList.add("highlight");
            setTimeout(() => {
                node.classList.remove("highlight");
            }, 700);
        }, 80);
    }

    logOperation(label, message, type) {
        const log = document.getElementById("log");
        const entry = document.createElement("div");
        entry.className = `log-entry ${type}`;
        entry.innerHTML = `
            <strong>${label} • ${new Date().toLocaleTimeString()}</strong>
            <span>${message}</span>
        `;
        log.prepend(entry);
    }
}

let lruCache = null;

function setStatus(message, tone = "info") {
    const banner = document.getElementById("status-banner");
    banner.textContent = message;

    const palette = {
        info: {
            background: "linear-gradient(135deg, rgba(52, 152, 219, 0.12), rgba(255, 255, 255, 0.9))",
            border: "rgba(52, 152, 219, 0.18)"
        },
        success: {
            background: "linear-gradient(135deg, rgba(46, 204, 113, 0.14), rgba(255, 255, 255, 0.92))",
            border: "rgba(46, 204, 113, 0.22)"
        },
        warning: {
            background: "linear-gradient(135deg, rgba(245, 184, 77, 0.2), rgba(255, 255, 255, 0.92))",
            border: "rgba(245, 184, 77, 0.28)"
        }
    };

    banner.style.background = palette[tone].background;
    banner.style.borderColor = palette[tone].border;
}

function initializeCache() {
    const capacity = parseInt(document.getElementById("capacity").value, 10);
    if (Number.isNaN(capacity) || capacity < 1 || capacity > 10) {
        setStatus("Capacity must be a number between 1 and 10.", "warning");
        return;
    }

    lruCache = new LRUCacheVisualizer(capacity);
    lruCache.logOperation("INIT", `Initialized cache with capacity ${capacity}.`, "put");
    setStatus(`Initialized a fresh cache with capacity ${capacity}.`, "success");
}

function putOperation() {
    const key = parseInt(document.getElementById("key").value, 10);
    const value = parseInt(document.getElementById("value").value, 10);

    if (Number.isNaN(key) || Number.isNaN(value)) {
        setStatus("Enter valid numeric values for both key and value before using PUT.", "warning");
        return;
    }

    lruCache.put(key, value);
    document.getElementById("key").value = "";
    document.getElementById("value").value = "";
}

function getOperation() {
    const key = parseInt(document.getElementById("key").value, 10);

    if (Number.isNaN(key)) {
        setStatus("Enter a numeric key before using GET.", "warning");
        return;
    }

    lruCache.get(key);
    document.getElementById("key").value = "";
}

function deleteOperation() {
    const key = parseInt(document.getElementById("key").value, 10);

    if (Number.isNaN(key)) {
        setStatus("Enter a numeric key before using DELETE.", "warning");
        return;
    }

    lruCache.delete(key);
    document.getElementById("key").value = "";
}

function clearLog() {
    document.getElementById("log").innerHTML = "";
    setStatus("Cleared the operation history.", "info");
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("initializeBtn").addEventListener("click", initializeCache);
    document.getElementById("putBtn").addEventListener("click", putOperation);
    document.getElementById("getBtn").addEventListener("click", getOperation);
    document.getElementById("deleteBtn").addEventListener("click", deleteOperation);
    document.getElementById("clearLogBtn").addEventListener("click", clearLog);

    lruCache = new LRUCacheVisualizer(4);
    lruCache.logOperation("INIT", "Visualizer loaded with default capacity 4.", "put");
    lruCache.logOperation("TIP", "Use PUT, GET, and DELETE to inspect cache behavior.", "get");
    setStatus("Visualizer loaded with capacity 4. Start by adding a few entries.", "info");
});

document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
        return;
    }

    const activeElement = document.activeElement;
    if (activeElement.id === "capacity") {
        initializeCache();
        return;
    }

    if (activeElement.id !== "key" && activeElement.id !== "value") {
        return;
    }

    if (activeElement.id === "value" || document.getElementById("value").value !== "") {
        putOperation();
        return;
    }

    getOperation();
});
