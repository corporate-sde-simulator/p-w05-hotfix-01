# Beginner Explanatory Guide: PLATFORM-2910: Fix Load Balancer Sticky Session Bug

> **Task Type**: Product Task  
> **Domain/Focus**: JavaScript (Node.js) Load Balancing

---

## 1. The Goal (In-Depth Beginner Explanation)

### The Core Problem
The task at hand addresses a critical issue in the load balancing system of an application, specifically related to session management. Currently, users are experiencing disruptions during their shopping sessions because the load balancer is not maintaining session affinity. This means that when a user is assigned to a particular server, they may be switched to another server mid-session, resulting in the loss of their shopping cart data. This is primarily due to the hash function used for determining which server a session should connect to, which relies on `Math.random()`. The randomness of this function leads to different servers being assigned for the same session ID on subsequent requests, causing inconsistency and frustration for users.

Fixing this bug is crucial for ensuring a seamless user experience. Users expect their shopping carts to retain their contents as they navigate through the application. If the load balancer can consistently route the same session ID to the same server, it will enhance user satisfaction and trust in the application. Moreover, addressing this issue aligns with the acceptance criteria set forth in the task, which emphasizes the need for consistent session routing and even distribution of sessions across servers.

### Jargon Buster (Key Terms Explained)
* **Load Balancer**: A load balancer is a system that distributes network or application traffic across multiple servers. This ensures no single server becomes overwhelmed, improving responsiveness and availability. For example, if a website receives a lot of traffic, a load balancer can direct users to different servers to handle the load efficiently.

* **Session Affinity**: Also known as sticky sessions, this is a mechanism that ensures a user's requests are consistently routed to the same server during their session. For instance, if a user logs into an application and is assigned to Server A, all their subsequent requests should go to Server A to maintain their session state.

* **Hash Function**: A hash function is a mathematical algorithm that transforms input data (like a session ID) into a fixed-size string of characters, which is typically a hash code. This code is used to determine where to route the session. For example, if the session ID is "user123", a hash function might convert it into a number that corresponds to a specific server.

* **Deterministic**: A function is deterministic if it produces the same output every time it is given the same input. In the context of our load balancer, a deterministic hash function would ensure that the same session ID always results in the same server being selected.

### Expected Outcome
After implementing the solution, the load balancer should consistently route the same session ID to the same server, ensuring that users do not lose their shopping cart data. 

**Before vs. After Comparison**:
- **Before**: A user with session ID "session-abc" could be routed to different servers on different requests, leading to lost data.
- **After**: The same user with session ID "session-abc" will always be routed to the same server, preserving their session state and shopping cart contents.

---

## 2. Related Coding Concepts & Syntax (50% Theory, 50% Practice)

### Concept 1: Hash Functions
#### 📘 Theoretical Overview (50%)
Hash functions are essential in computer science for mapping data of arbitrary size to fixed-size values. They are widely used in various applications, including data retrieval, cryptography, and load balancing. A good hash function should minimize collisions (where different inputs produce the same output) and be deterministic, meaning the same input will always yield the same output. If a hash function is not deterministic, it can lead to unpredictable behavior, such as the issue we are facing with session routing.

In our case, the current hash function uses `Math.random()`, which is inherently non-deterministic. This means that even if the same session ID is provided, the output can vary, causing users to be routed to different servers. A proper hash function for our load balancer should take the session ID and produce a consistent hash value that can be used to determine the server.

#### 💻 Syntax & Practical Examples (50%)
* **Language Syntax**:
  ```javascript
  function hash(sessionId) {
      let h = 0; // Initialize hash value
      for (let i = 0; i < sessionId.length; i++) {
          h = (h * 31 + sessionId.charCodeAt(i)) >>> 0; // Update hash with character code
      }
      return h; // Return the final hash value
  }
  ```

* **Real-World Application**:
  ```javascript
  const sessionId = "session-abc";
  const hashValue = hash(sessionId); // This will consistently produce the same hash for "session-abc"
  console.log(hashValue); // Outputs a consistent number, e.g., 123456
  ```

---

## 3. Step-by-Step Logic & Walkthrough

1. **Step 1: Locate and Analyze the Target File**
   * Navigate to the `p-w05-hotfix-01` folder and open the `loadBalancer.js` file. 
   * Focus on the `hash` function and the `getServer` method, particularly lines where the session ID is processed.

2. **Step 2: Input Verification & Validation**
   * Check if the `sessionId` parameter is valid (not null or undefined). If it is invalid, the load balancer should use round-robin logic to assign a server.

3. **Step 3: Core Implementation / Modification**
   * Modify the `hash` function to remove the use of `Math.random()`. Instead, ensure it produces a consistent hash based on the session ID. This can be done by initializing the hash value to zero and iterating through each character of the session ID, updating the hash value based on the character codes.

4. **Step 4: Output Verification & Testing**
   * After making the changes, run the provided test cases at the bottom of the `loadBalancer.js` file. Ensure that the assertions pass, confirming that the same session ID routes to the same server.

---

## 4. Detailed Walkthrough of Test Cases

### Test Case 1: Standard / Success Case
* **Description**: This test checks that the same session ID consistently routes to the same server.
* **Inputs**:
  ```json
  {
      "sessionId": "session-abc"
  }
  ```
* **Step-by-Step Execution Trace**:
  1. The `getServer` method is called with the input "session-abc".
  2. The method checks if the session ID is valid (it is).
  3. The `hash` function is called, producing a consistent hash value for "session-abc".
  4. The server is selected based on the hash value, and the same server is returned for subsequent calls with the same session ID.
* **Expected Output**: The output should confirm that both calls return the same server, e.g., `server-1`.

### Test Case 2: Edge Case / Validation Fail
* **Description**: This test checks the behavior when the session ID is null or undefined.
* **Inputs**:
  ```json
  {
      "sessionId": null
  }
  ```
* **Step-by-Step Execution Trace**:
  1. The `getServer` method is called with a null session ID.
  2. The method detects that the session ID is invalid.
  3. It defaults to round-robin logic, selecting the next server in the list.
  4. Returns the selected server based on the round-robin index.
* **Expected Output**: The output should be the next server in the round-robin sequence, e.g., `server-2`.