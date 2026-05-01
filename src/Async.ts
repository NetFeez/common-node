export class Async {
    /**
     * Asynchronously delays execution for a specified number of milliseconds. This method returns a promise that resolves after the given time has elapsed, allowing you to pause the execution of asynchronous code without blocking the event loop. It can be used in various scenarios, such as implementing timeouts, creating delays between operations, or simulating asynchronous behavior in testing.
     * @param ms The number of milliseconds to delay before the promise resolves.
     * @returns A promise that resolves after the specified delay.
     */
    public static async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Asynchronously waits for a specific event to occur by executing the provided executor function.
     * The executor function is expected to call a done callback when the event occurs, passing any relevant result.
     * The method also supports an optional timeout parameter, which will reject the promise if the event does not occur within the specified time frame.
     * 
     * @param executor - A function that executes the logic to wait for the event and calls the done callback when the event occurs.
     * @param timeout - An optional timeout in milliseconds after which the promise will be rejected if the event has not occurred (default is -1, meaning no timeout).
     * @returns A promise that resolves with the result passed to the done callback when the event occurs, or rejects if an error occurs or if the timeout is reached.
     */
    public static async awaitEvent<R extends any>(
        executor: Async.AsyncEvent.Exec<R>,
        timeout: number = -1
    ): Promise<R> {
        return new Promise<R>((resolve, reject) => {
            let timer: NodeJS.Timeout | null = null;
            let isSettled = false;
            let cleanupHandler: Async.AsyncEvent.Clean | void;

            const cleanup = () => {
                isSettled = true;
                if (!timer) return;
                clearTimeout(timer);
                timer = null;
                if (typeof cleanupHandler === 'function') {
                    cleanupHandler();
                }
            };

            const safeResolve = (result: R) => {
                if (isSettled) return;
                cleanup();
                resolve(result);
            };

            const safeReject = (err: any) => {
                if (isSettled) return;
                cleanup();
                reject(err instanceof Error ? err : new Error(String(err)));
            };

            if (timeout > 0) {
                timer = setTimeout(() => {
                    safeReject(new Error(`Async event timed out after ${timeout}ms`));
                }, timeout);
            }

            try {
                const result = executor(safeResolve, safeReject);
                if (result instanceof Promise) {
                    result.then(h => { cleanupHandler = h; }).catch(safeReject);
                } else {
                    cleanupHandler = result;
                }
            } catch (error) { safeReject(error); }
        });
    }
    /**
     * Creates a concurrency limiter function that controls the number of simultaneous asynchronous operations. The returned function can be used to wrap any asynchronous function, ensuring that no more than the specified number of operations are active at the same time. This is particularly useful for managing resources and preventing overload when dealing with a large number of asynchronous tasks, such as network requests or file system operations.
     * @param limit The maximum number of concurrent asynchronous operations allowed.
     * @returns A concurrency limiter function that can be used to wrap asynchronous functions.
     */
    public static currencyLimiter(limit: number): Async.CurrencyAction {
        let active = 0;
        const queue: (() => void)[] = [];

        const next = () => {
            active--;
            if (queue.length) {
                const nextFn = queue.shift()!;
                nextFn();
            }
        };

        const action: Async.CurrencyAction = async (fn: () => any) => {
            if (active >= limit) { await new Promise<void>(resolve => queue.push(resolve)); }
            active++;
            try { return await fn(); }
            finally { next(); }
        };

        return action
    }
}
export namespace Async {
    export type CurrencyAction = <T>(fn: () => Promise<T>) => Promise<T>;
    export namespace AsyncEvent {
        export type Clean = () => void;
        export type Done<R> = (result: R) => void;
        export type Fail = (error: Error) => void;
        export type Exec<R> = (done: Done<R>, fail: Fail) => Clean | Promise<Clean> | void | Promise<void>;
    }
}
export default Async;