import { promises as FS } from 'node:fs';

import Path from "../Path.js";
import Find from "./Find.js";
import Management from './Management.js';
import Validation from './Validation.js';
import Async from '../Async.js';

export class Smart {
    /**
     * Moves files matching a given pattern to a specified destination, with support for options such as filtering, mapping, and concurrency control.
     * The method uses the processEntries function to handle the file processing logic, allowing for flexible handling of file paths and operations.
     * It ensures that the directory structure is maintained when moving files based on glob patterns and provides error handling for potential issues during the move operation, such as cross-device moves.
     * This method is useful for efficiently moving multiple files while applying custom logic to determine which files to move and how to structure the destination paths.
     * @param pattern The pattern to match file paths against, which can include wildcards like '*' and '**'.
     * @param dest The base destination path where the matched files should be moved to.
     * @param options Optional settings for processing, including the base directory, filter and map functions, and concurrency level.
     * @returns A promise that resolves when all move operations are complete.
     * @throws Will throw an error if there is an issue during the moving of files, such as if the source files do not exist or if there are permission issues.
     */
    static async move(pattern: string, dest: string, options: Smart.Options = {}): Promise<void> {
        await this.processEntries(pattern, dest, options, async (src, dst) => {
            Management.ensureDir(Path.dirname(dst));
            try { await FS.rename(src, dst); }
            catch (error: any) {
                if (error.code === 'EXDEV') {
                    await FS.cp(src, dst, { recursive: true });
                    await FS.rm(src, { recursive: true, force: true });
                } else throw error;
            }
        });
    }
    /**
     * Copies files matching a given pattern to a specified destination, with support for options such as filtering, mapping, and concurrency control.
     * The method uses the processEntries function to handle the file processing logic, allowing for flexible handling of file paths and operations.
     * It ensures that the directory structure is maintained when copying files based on glob patterns and provides error handling for potential issues during the copy operation.
     * This method is useful for efficiently copying multiple files while applying custom logic to determine which files to copy and how to structure the destination paths.
     * @param pattern The pattern to match file paths against, which can include wildcards like '*' and '**'.
     * @param dest The base destination path where the matched files should be copied to.
     * @param options Optional settings for processing, including the base directory, filter and map functions, and concurrency level.
     * @returns A promise that resolves when all copy operations are complete.
     * @throws Will throw an error if there is an issue during the copying of files, such as if the source files do not exist or if there are permission issues.
     */
    static async copy(pattern: string, dest: string, options: Smart.Options = {}): Promise<void> {
        await this.processEntries(pattern, dest, options, async (src, dst) => {
            await FS.cp(src, dst, { recursive: true });
        });
    }
    /**
     * Processes file entries based on a given pattern, destination, options, and a handler function.
     * It first resolves the file paths matching the pattern and then applies the provided handler function to each source and destination pair.
     * The method supports filtering and mapping of file paths through the options parameter, allowing for flexible processing of files based on user-defined criteria.
     * This approach is useful for performing various operations on files, such as copying or moving them, while providing a consistent way to handle file paths and apply custom logic before executing the desired action.
     * @param pattern The pattern to match file paths against, which can include wildcards like '*' and '**'.
     * @param dest The base destination path where the matched files should be processed to.
     * @param options Optional settings for processing, including the base directory, filter and map functions, and concurrency level.
     * @param handler A function that takes a source and destination path and performs the desired operation (e.g., copying or moving files).
     * @returns A promise that resolves when all processing operations are complete.
     * @throws Will throw an error if there is an issue during the processing of files, such as if the source files do not exist or if there are permission issues.
     */
    public static async processEntries(pattern: string, dest: string, options: Smart.Options, handler: Smart.ProcessHandler): Promise<void> {
        const cwd = options.cwd ?? Path.cwd;
        const concurrency = options.concurrency ?? 16;
        const limiter = Async.currencyLimiter(concurrency);
        const entries = await this.resolveEntries(pattern, cwd);

        await Promise.all(entries.map((srcPath) =>
            limiter(async () => {
                const relative = Path.diff(cwd, srcPath)
                    .split(Path.sep)
                    .join('/');
                if (options.filter && !options.filter(relative)) return;
                let finalRelative = relative;
                if (options.map) {
                    const mapped = options.map(relative);
                    if (mapped == null) return;
                    finalRelative = mapped;
                }
                const finalDest = Path.join(dest, finalRelative);
                await handler(srcPath, finalDest);
            })
        ));
    }
    /**
     * Resolves file paths based on a given pattern and base directory. If the pattern includes wildcards (indicating that it is a glob), it uses the find method to retrieve all matching file paths. If the pattern does not include wildcards, it treats it as a single file path and resolves it against the base directory. This method is useful for handling both glob patterns and specific file paths in a consistent way, allowing for flexible file operations based on user input or configuration.
     * @param pattern The pattern to resolve, which can be a glob with wildcards or a specific file path.
     * @param baseDir The base directory to resolve the pattern against (default is the current working directory).
     * @returns A promise that resolves to an array of file paths that match the pattern or a single file path if the pattern is not a glob.
     */
    protected static async resolveEntries(pattern: string, baseDir: string): Promise<string[]> {
        const files = pattern.includes('*') 
            ? await Find.find(pattern, { cwd: baseDir, }) 
            : [Path.resolve(baseDir, pattern)];
        return files.map(file => Path.join(baseDir, file));
    }
    /**
     * Calculates the destination path for a file based on a glob pattern, source path, and destination path. If the pattern includes wildcards, it computes the relative path from the base directory to the source file and appends it to the destination directory. If the pattern does not include wildcards, it checks if the destination is a directory (either by checking if it exists and is a directory or by checking if it lacks an extension) and constructs the final destination path accordingly. This method is essential for determining where to move or copy files based on their original location and the specified pattern, ensuring that the directory structure is maintained when using glob patterns.
     * @param pattern The glob pattern to determine how to calculate the destination path.
     * @param src The source file path that is being moved or copied.
     * @param dest The base destination path where the file should be moved or copied to.
     * @param baseDir The base directory to calculate relative paths from (default is the current working directory).
     * @returns A promise that resolves to the calculated destination path for the file.
     */
    protected static async calculateDest(pattern: string, src: string, dest: string, baseDir: string): Promise<string> {
        if (pattern.includes('*')) {
            const relativePath = Path.diff(baseDir, src);
            return Path.join(dest, relativePath);
        }
        const isDestDir = !Path.extName(dest) || (await Validation.isDirectory(dest));
        return isDestDir ? Path.join(dest, Path.fileName(src)) : dest;
    }
}
export namespace Smart {
    export type ProcessHandler = (src: string, dest: string) => Promise<void>;
    export interface Options {
        /**
         * The base directory to resolve the pattern against (default is the current working directory).
         */
        cwd?: string;
        /**
         * Transform the relative path before building the destination.
         * Returns null to skip the file.
         */
        map?: (relativePath: string) => string | null;
        /**
         * Filter files before processing them.
         */
        filter?: (relativePath: string) => boolean;
        /**
         * Level of concurrency (default: 16)
         */
        concurrency?: number;
    }
}
export default Smart;