export class Semaphore {

    protected readonly vQueue: Semaphore.Resolver[] = [];
    protected vActive: number = 0;

    constructor(
        public readonly limit: number
    ) { if (!Number.isInteger(limit) || limit <= 0) throw new TypeError('Semaphore limit must be a positive integer.'); }

    public get active(): number { return this.vActive; }
    public get pending(): number { return this.vQueue.length; }
    public get available(): number { return this.limit - this.vActive; }
    public get locked(): boolean { return this.vActive >= this.limit; }

    /**
     * Executes a handler function while ensuring that the number of concurrent executions does not exceed the semaphore's limit.
     * The method first acquires a lock on the semaphore, then executes the provided handler function, and finally releases the lock once the handler has completed, regardless of whether it succeeded or threw an error.
     * This allows for safe execution of asynchronous operations that require synchronization, ensuring that the concurrency limit defined by the semaphore is respected while allowing the handler to perform its tasks without worrying about managing locks manually.
     * @param handler A function that returns a value or a promise, which will be executed while holding a lock on the semaphore.
     * @returns A promise that resolves to the value returned by the handler function once it has completed execution.
     */
    public async use<T>(handler: Semaphore.Handler<T>): Promise<T> {
        await this.acquire();
        try { return await handler(); }
        finally { this.release(); }
    }
    /**
     * Acquires a lock on the semaphore, allowing the caller to proceed if the number of active locks is below the specified limit.
     * If the limit has been reached, the caller will be queued until a lock is released.
     * This method returns a promise that resolves when the lock has been successfully acquired, ensuring that the caller can safely perform operations that require synchronization without exceeding the concurrency limit defined by the semaphore.
     * @returns A promise that resolves when the lock has been successfully acquired, allowing the caller to proceed with synchronized operations.
     */
    public async acquire(): Promise<void> {
        if (this.vActive < this.limit && !this.vQueue.length) return void this.vActive++;
        await new Promise<void>((resolve) => this.vQueue.push(resolve));
        this.vActive++;
    }
    /**
     * Releases a lock on the semaphore, allowing the next queued caller to proceed if there are any waiting.
     * If there are no queued callers, it simply decrements the count of active locks.
     * This method ensures that the semaphore's concurrency limit is maintained by allowing the next waiting caller to acquire the lock when one is released, thus enabling efficient synchronization of operations that require controlled access to shared resources.
     * If the release method is called when there are no active locks, it will have no effect, preventing the active count from going negative.
     * This method is essential for managing the flow of operations that depend on the semaphore, ensuring that resources are released properly and that waiting callers can proceed in an orderly manner.
     * If the release method is called when there are no active locks, it will have no effect, preventing the active count from going negative.
     */
    public release(): void {
        if (this.vActive <= 0) return;
        this.vActive--;
        const next = this.vQueue.shift();
        if (next) next();
    }
}
export namespace Semaphore {
    export type Handler<T> = () => T | Promise<T>;
    export type Resolver = () => void;
}
export default Semaphore;