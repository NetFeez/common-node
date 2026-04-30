import { promises as FS } from 'fs';

import Glob from "../Glob.js";
import Path from "../Path.js";

export class Find {
    /**
     * Asynchronously finds files matching a given glob pattern and returns their paths as an array.
     * The method takes a glob pattern and optional configuration options, such as the current working directory, concurrency limit, and whether to return absolute paths.
     * It uses the `Glob` class to convert the glob pattern into a regular expression and then walks through the file system starting from the specified directory.
     * For each file found, it tests if the file path matches the regular expression derived from the glob pattern and collects the matching file paths in an array, which is returned once all files have been processed.
     * This approach allows for efficient file searching while providing a convenient way to retrieve all matching file paths at once.
     * @param pattern The glob pattern to match files against, which can include wildcards like '*' and '**'.
     * @param options Optional configuration for the search, including the current working directory, concurrency limit, and whether to return absolute paths.
     * @returns A promise that resolves to an array of file paths matching the glob pattern based on the provided options.
     */
     static async find(pattern: string, options: Find.Options = {}): Promise<string[]> {
        const results: string[] = [];
        for await (const file of this.findStream(pattern, options)) {
            results.push(file);
        }
        return results;
    }
    /**
     * Asynchronously finds files matching a given glob pattern and yields their paths as an asynchronous stream.
     * The method takes a glob pattern and optional configuration options, such as the current working directory, concurrency limit, and whether to return absolute paths.
     * It uses the `Glob` class to convert the glob pattern into a regular expression and then walks through the file system starting from the specified directory.
     * For each file found, it tests if the file path matches the regular expression derived from the glob pattern and yields the matching file paths accordingly.
     * This approach allows for efficient file searching without blocking the event loop, making it suitable for handling large file systems or complex directory structures.
     * @param pattern The glob pattern to match files against, which can include wildcards like '*' and '**'.
     * @param options Optional configuration for the search, including the current working directory, concurrency limit, and whether to return absolute paths.
     * @returns An asynchronous generator that yields file paths matching the glob pattern based on the provided options.
     */
    static async * findStream(pattern: string, options: Find.Options = {}): AsyncGenerator<string> {
        const cwd = options.cwd ?? Path.cwd;
        const regex = Glob.globToRegex(pattern);
        const limiter = this.createLimiter(options.concurrency ?? 32);
        for await (const fullPath of this.walk(cwd, limiter)) {
            const relative = Path.diff(cwd, fullPath).split(Path.sep).join('/');
            if (regex.test(relative)) yield options.absolute ? fullPath : relative;
        }
    }
    /**
     * Recursively walks through a directory and yields the full paths of all files found. The method uses asynchronous iteration to traverse the directory structure, allowing for efficient handling of large file systems without blocking the event loop. It takes an optional concurrency limiter to control the number of simultaneous file system operations, which can help improve performance and reduce resource contention when dealing with a large number of files or directories.
     * @param dir The directory to start walking from.
     * @param limiter An optional concurrency limiter function to control the number of simultaneous file system operations.
     * @returns An asynchronous generator that yields the full paths of all files found in the directory and its subdirectories.
     */
    public static async * walk(dir: string, limiter = this.createLimiter(32)): AsyncGenerator<string> {
        const entries = await limiter(() => FS.readdir(dir, { withFileTypes: true }) );
        for (const entry of entries) {
            const fullPath = Path.join(dir, entry.name);
            if (!entry.isDirectory()) yield fullPath;
            else yield* this.walk(fullPath, limiter);
        }
    }
    /**
     * Creates a concurrency limiter for asynchronous operations. The returned function allows you to execute asynchronous tasks while ensuring that no more than a specified number of tasks are running concurrently. If the limit is reached, additional tasks will be queued and executed in order as active tasks complete. This is particularly useful for managing resources and preventing overload when performing operations like file system access or network requests.
     * @param limit The maximum number of concurrent tasks allowed.
     * @returns A function that can be used to execute asynchronous tasks with concurrency control.
     */
    public static createLimiter(limit: number): Find.CurrencyAction {
        let active = 0;
        const queue: (() => void)[] = [];

        const next = () => {
            active--;
            if (queue.length) {
                const nextFn = queue.shift()!;
                nextFn();
            }
        };

        const action: Find.CurrencyAction = async (fn: () => any) => {
            if (active >= limit) { await new Promise<void>(resolve => queue.push(resolve)); }
            active++;
            try { return await fn(); }
            finally { next(); }
        };

        return action
    }
}
export namespace Find {
    export type CurrencyAction = <T>(fn: () => Promise<T>) => Promise<T>;
    export interface Options {
        cwd?: string;
        concurrency?: number;
        absolute?: boolean;
    }
}
export default Find;