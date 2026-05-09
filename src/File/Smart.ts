import { promises as FS } from 'node:fs';

import Path from '../Path.js';
import Find from './Find.js';
import Management from './Management.js';
import { Async } from '../common-node.js';

export class Smart {
    static async copy(pattern: string, dest: string, options: Smart.Options = {}): Promise<void> {
        const entries = this.entries(pattern, dest, options);
        const handler: Smart.Handler = async ({ src, dest }) => {
            await Management.ensureDir(Path.dirname(dest));
            await FS.cp(src, dest, { recursive: true });
        }
        await this.consume(entries, options, handler);
    }
    static async move(pattern: string, dest: string, options: Smart.Options = {}): Promise<void> {
        const entries = this.entries(pattern, dest, options);
        const handler: Smart.Handler = async ({ src, dest }) => {
            await Management.ensureDir(Path.dirname(dest));
            try { await FS.rename(src, dest); }
            catch (error: any) {
                if (error.code !== 'EXDEV') throw error;
                await FS.cp(src, dest, { recursive: true });
                await FS.rm(src, { recursive: true, force: true });
            }
        }
        await this.consume(entries, options, handler);
    }
    static async * entries(pattern: string, dest: string, options: Smart.Options = {}): AsyncGenerator<Smart.Entry> {
        const { cwd = process.cwd(), concurrency, map, filter } = options;
        const stream = pattern.includes('*')
            ? Find.findStream(pattern, { cwd, concurrency, absolute: true })
            : Smart.single(pattern, { cwd, absolute: true });

        for await (const src of stream) {
            const relative = Smart.normalizeRelative(Path.diff(cwd, src));
            if (filter && !filter(relative)) continue;
            let mapped = relative;
            if (map) {
                const result = map(relative);
                if (result == null) continue;
                mapped = Smart.normalizeRelative(result);
            }
            yield { src, relative, mapped, dest: Path.join(dest, mapped) };
        }
    }
    static async consume(stream: AsyncIterable<Smart.Entry>, options: Smart.Options, handler: Smart.Handler): Promise<void> {
        const { concurrency = 16 } = options;
        const semaphore = Async.semaphore(concurrency);
        const active = new Set<Promise<void>>();

        for await (const entry of stream) {
            const task = semaphore.use(() => handler(entry));
            active.add(task);
            task.finally(() => active.delete(task));
            if (semaphore.locked) { await Promise.race(active); }
        }
        await Promise.all(active);
    }
    /**
     * Normalizes a file path to use forward slashes (/) as separators, regardless of the operating system.
     * It takes a path string as input and replaces all occurrences of the platform-specific path separator (Path.sep) with a forward slash.
     * This method is useful for ensuring consistent path formatting across different environments, especially when working with file paths in a cross-platform application, making it easier to handle paths in a uniform way.
     * @param path The file path to be normalized, which may contain platform-specific separators.
     * @returns A normalized file path string with forward slashes as separators.
     */
    public static normalizeRelative(path: string): string {
        return path.split(Path.sep).join('/');
    }
    /**
     * Generates a single file entry for the given value.
     * It takes a string value representing a file path and options that include the current working directory (cwd) and whether the path should be absolute.
     * The method resolves the path based on the provided options and yields it as an asynchronous generator.
     * This is useful for handling cases where a single file needs to be processed without using glob patterns, allowing for consistent handling of both single files and multiple files in the Smart class methods.
     * @param value The file path to be processed, which can be relative or absolute based on the options.
     * @param options An object containing options for path resolution, including the current working directory (cwd) and a boolean indicating whether the path should be absolute.
     * @returns An asynchronous generator that yields the resolved file path as a string.
     */
    public static async * single(value: string, options: Omit<Find.Options, 'concurrency'>): AsyncGenerator<string> {
        const { cwd = process.cwd(), absolute = false } = options;
        const path = absolute ? Path.resolve(cwd, value) : value;
        yield path;
    }
}

export namespace Smart {
    export interface Entry {
        src: string;
        dest: string;
        relative: string;
        mapped: string;
    }
    export type Handler = (entry: Entry) => Promise<void>;
    export type Filter = (relativePath: string) => boolean;
    export type Mapper = (relativePath: string) => string | null;
    export interface Options {
        cwd?: string;
        concurrency?: number;
        filter?: Filter;
        map?: Mapper;
    }
}

export default Smart;