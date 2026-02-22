/**
 * ====================================================================
 *  JIRA: PLATFORM-2910 — Fix Load Balancer Sticky Session Bug
 * ====================================================================
 *  Priority: P1 | Points: 2 | Labels: infra, javascript, production
 *
 *  Users are randomly switched between servers mid-session, losing
 *  shopping cart data. Hash function for session affinity is using
 *  Math.random() as a seed which makes it non-deterministic.
 *
 *  ACCEPTANCE CRITERIA:
 *  - [ ] Same session ID always routes to same server
 *  - [ ] Distribution is roughly even across servers
 *  - [ ] Server removal re-distributes only affected sessions
 * ====================================================================
 */

class LoadBalancer {
    constructor(servers) {
        this.servers = [...servers];
        this.serverIndex = 0;
    }

    hash(sessionId) {
        // BUG: Using Math.random() makes the hash non-deterministic
        // Same session ID returns different hashes on each call
        let h = Math.floor(Math.random() * 1000000);
        for (let i = 0; i < sessionId.length; i++) {
            h = (h * 31 + sessionId.charCodeAt(i)) >>> 0;
        }
        return h;
    }

    getServer(sessionId) {
        if (!sessionId) {
            // Round-robin for new sessions
            const server = this.servers[this.serverIndex];
            this.serverIndex = (this.serverIndex + 1) % this.servers.length;
            return server;
        }

        // BUG: Session affinity broken because hash is non-deterministic
        const h = this.hash(sessionId);
        return this.servers[h % this.servers.length];
    }

    removeServer(serverId) {
        this.servers = this.servers.filter(s => s !== serverId);
        // BUG: Missing session affinity cookie update — orphaned sessions get 503
    }

    addServer(serverId) {
        this.servers.push(serverId);
    }
}

// Tests
const lb = new LoadBalancer(['server-1', 'server-2', 'server-3']);
const s1 = lb.getServer('session-abc');
const s2 = lb.getServer('session-abc');
console.assert(s1 === s2, `FAIL: Same session should route to same server: ${s1} vs ${s2}`);
console.log("Load balancer tests complete");

module.exports = { LoadBalancer };
