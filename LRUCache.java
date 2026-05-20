import java.util.HashMap;
import java.util.Map;

public class LRUCache {

    class Node {
        int key;
        int value;
        Node prev;
        Node next;

        Node(int key, int value) {
            this.key = key;
            this.value = value;
            this.prev = null;
            this.next = null;
        }
    }

    private final int capacity;
    private final Map<Integer, Node> map;
    private final Node head;
    private final Node tail;

    public LRUCache(int capacity) {
        this.capacity = capacity;
        this.map = new HashMap<>();

        this.head = new Node(-1, -1);
        this.tail = new Node(-1, -1);

        head.next = tail;
        tail.prev = head;
    }

    private void insert(Node node) {
        Node after = head.next;

        node.next = after;
        node.prev = head;

        head.next = node;
        after.prev = node;
    }

    private void deleteNode(Node node) {
        Node before = node.prev;
        Node after = node.next;

        before.next = after;
        after.prev = before;
    }

    public int get(int key) {
        if (!map.containsKey(key)) {
            return -1;
        }

        Node node = map.get(key);
        deleteNode(node);
        insert(node);
        return node.value;
    }

    public void put(int key, int value) {
        if (map.containsKey(key)) {
            Node node = map.get(key);
            node.value = value;
            deleteNode(node);
            insert(node);
            return;
        }

        if (map.size() == capacity) {
            Node lru = tail.prev;
            deleteNode(lru);
            map.remove(lru.key);
        }

        Node node = new Node(key, value);
        insert(node);
        map.put(key, node);
    }

    public boolean delete(int key) {
        if (!map.containsKey(key)) {
            return false;
        }

        Node node = map.get(key);
        deleteNode(node);
        map.remove(key);
        return true;
    }

    public void printCacheState() {
        Node current = head.next;
        System.out.print("Cache State (Most Recent -> Least Recent): ");
        while (current != null && current != tail) {
            System.out.print("[" + current.key + ":" + current.value + "]");
            current = current.next;
            if (current != tail) {
                System.out.print(" -> ");
            }
        }
        System.out.println();
    }

    public static void main(String[] args) {
        System.out.println("=== LRU Cache Demo ===");

        LRUCache cache = new LRUCache(3);
        System.out.println("Initialized cache with capacity 3");

        cache.put(1, 10);
        System.out.println("PUT(1, 10)");
        cache.printCacheState();

        cache.put(2, 20);
        System.out.println("PUT(2, 20)");
        cache.printCacheState();

        cache.put(3, 30);
        System.out.println("PUT(3, 30)");
        cache.printCacheState();

        System.out.println("GET(1): " + cache.get(1));
        cache.printCacheState();

        System.out.println("GET(2): " + cache.get(2));
        cache.printCacheState();

        cache.put(4, 40);
        System.out.println("PUT(4, 40) - This should evict key 3");
        cache.printCacheState();

        System.out.println("GET(3): " + cache.get(3));
        System.out.println("GET(4): " + cache.get(4));
        cache.printCacheState();

        System.out.println("DELETE(2): " + cache.delete(2));
        cache.printCacheState();

        System.out.println("DELETE(99): " + cache.delete(99));
        cache.printCacheState();

        System.out.println();
        System.out.println("Demo completed! Open index.html for the web visualizer.");
    }
}
