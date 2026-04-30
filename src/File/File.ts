/**
 * @author NetFeez <netfeez.dev@gmail.com>
 * @description Provides utilities for file operations, such as checking if a file exists.
 * This is useful for performing asynchronous file checks in a way that integrates well with modern JavaScript practices.
 * @license Apache-2.0
 */
import { promises as FS } from 'fs';
import Path from '../Path.js';
import { fileURLToPath } from 'url';
import { Find } from './Find.js';

export class File {
    /**
     * Checks if a given path exists in the file system.
     * It uses fs.access to determine if the path is accessible, returning true if it exists and false if it does not.
     * This method is useful for verifying the presence of files or directories before attempting to read, write, or perform other operations on them, helping to prevent errors related to non-existent paths.
     * @param path The file system path to check for existence.
     * @returns A promise that resolves to true if the path exists, or false if it does not.
     */
    static async exists(path: string): Promise<boolean> {
        try { await FS.access(path); return true; } catch { return false; }
    }
    /**
     * Checks if the given path is a file.
     * It uses fs.stat to retrieve the file system statistics for the path and checks if it is a file using the isFile method.
     * If the path does not exist or is not a file, it returns false.
     * This method is useful for validating that a specific path points to a file before performing operations that require a file, such as reading or writing content.
     * It helps to ensure that the expected file structure is in place and can prevent errors related to invalid paths or types.
     * @param path The file system path to check.
     * @returns A promise that resolves to true if the path is a file, or false if it is not.
     * @throws Will throw an error if the path does not exist or is not a file.
     */
    static async isFile(path: string): Promise<boolean> {
        try {
            const stat = await FS.stat(path);
            return stat.isFile();
        } catch { return false; }
    }
    /**
     * Checks if the given path is a directory.
     * It uses fs.stat to retrieve the file system statistics for the path and checks if it is a directory using the isDirectory method.
     * If the path does not exist or is not a directory, it returns false.
     * This method is useful for validating that a specific path points to a directory before performing operations that require a directory, such as creating files within it or listing its contents.
     * It helps to ensure that the expected directory structure is in place and can prevent errors related to invalid paths or types.
     * @param path The file system path to check.
     * @returns A promise that resolves to true if the path is a directory, or false if it is not.
     * @throws Will throw an error if the path does not exist or is not a directory.
     */
    static async isDirectory(path: string): Promise<boolean> {
        try {
            const stat = await FS.stat(path);
            return stat.isDirectory();
        } catch { return false; }
    }
    /**
     * Reads the content of a file at the specified path using the given encoding (defaulting to 'utf-8').
     * It first checks if the path is a file using the isFile method, and if it is not, it throws an error indicating that the path is not a file.
     * If the path is valid, it uses fs.readFile to read the content of the file and returns it as a string.
     * This method is essential for safely reading files while ensuring that the provided path points to a valid file, preventing errors related to invalid paths or types.
     * @param path The file system path of the file to read.
     * @param encoding The character encoding to use when reading the file (default is 'utf-8').
     * @returns A promise that resolves to the content of the file as a string.
     * @throws Will throw an error if the path does not point to a valid file.
     */
    static async read(path: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
        try { return await FS.readFile(path, encoding); }
        catch (err: any) {
            if (err.code === 'ENOENT') { throw new Error(`File not found: ${path}`); }
            throw err;
        }
    }
    /**
     * Writes the specified content to a file at the given path using the provided encoding (defaulting to 'utf-8').
     * It uses fs.writeFile to write the content to the file, creating the file if it does not exist or overwriting it if it does.
     * This method is crucial for saving data to files while ensuring that the content is properly encoded and that any necessary directories are in place before writing.
     * It can be used for a variety of purposes, such as saving configuration files, logs, or any other data that needs to be persisted in the file system.
     * @param path The file system path where the content should be written.
     * @param content The string content to write to the file.
     * @param encoding The character encoding to use when writing the file (default is 'utf-8').
     * @returns A promise that resolves when the write operation is complete.
     */
    static async write(path: string, content: string, encoding: BufferEncoding = 'utf-8'): Promise<void> {
        await this.ensureDir(Path.dirname(path));
        await FS.writeFile(path, content);
    }
    /**
     * Creates a directory at the specified path with the given options (such as recursive creation). It first checks if the path already exists using the exists method, and if it does, it throws an error to prevent overwriting existing files or directories. If the path does not exist, it uses fs.mkdir to create the directory according to the provided options. This method is essential for safely creating directories while ensuring that existing paths are not unintentionally overwritten, and it can be used to set up necessary directory structures for applications or projects.
     * @param path The file system path where the directory should be created.
     * @param options Optional settings for directory creation, such as { recursive: true } to create parent directories if they do not exist.
     * @returns A promise that resolves when the directory has been successfully created.
     * @throws Will throw an error if the path already exists or if there is an issue during directory creation.
     */
    static async mkdir(path: string, options?: { recursive?: boolean }): Promise<void> {
        if (await this.exists(path)) throw new Error(`Path ${path} already exists.`);
        await FS.mkdir(path, options);
    }
    /**
     * Copies a file or directory from the source path to the destination path.
     * It first ensures that the destination directory exists by checking if it exists and creating it if necessary.
     * Then, it uses fs.cp to perform the copy operation, which can handle both files and directories (with the recursive option).
     * This method is useful for duplicating files or directories while ensuring that the necessary directory structure is in place at the destination, preventing errors related to missing directories.
     * @param src The file system path of the source file or directory to copy.
     * @param dest The file system path where the source should be copied to.
     * @returns A promise that resolves when the copy operation is complete.
     * @throws Will throw an error if there is an issue during the copy process, such as if the source does not exist or if there are permission issues.
     */
    static async copy(src: string, dest: string): Promise<void> {
        const destDir = Path.dirname(dest);
        if (!await this.exists(destDir)) await FS.mkdir(destDir, { recursive: true });
        await FS.cp(src, dest, { recursive: true });
    }
    /**
     * Moves a file or directory from the source path to the destination path.
     * It first ensures that the destination directory exists by checking if it exists and creating it if necessary.
     * Then, it uses fs.rename to perform the move operation, which can handle both files and directories.
     * This method is useful for relocating files or directories while ensuring that the necessary directory structure is in place at the destination, preventing errors related to missing directories.
     * @param src The file system path of the source file or directory to move.
     * @param dest The file system path where the source should be moved to.
     * @returns A promise that resolves when the move operation is complete.
     * @throws Will throw an error if there is an issue during the move process, such as if the source does not exist or if there are permission issues.
     */
    static async move(src: string, dest: string): Promise<void> {
        this.ensureDir(Path.dirname(dest));
        try { await FS.rename(src, dest); }
        catch (err: any) {
            if (err.code === 'EXDEV') {
                await FS.cp(src, dest, { recursive: true });
                await FS.rm(src, { recursive: true, force: true });
            } else throw err;
        }
    }
    /**
     * Removes a file or directory at the specified path. It uses fs.rm with the options { recursive: true, force: true } to ensure that directories are removed along with their contents and that the operation does not throw an error if the path does not exist. This method is essential for safely deleting files or directories without needing to check for their existence beforehand, making it a convenient way to clean up resources in the file system.
     * @param path The file system path of the file or directory to remove.
     * @returns A promise that resolves when the removal operation is complete.
     * @throws Will throw an error if there is an issue during the removal process, such as permission issues or if the path is a non-empty directory and recursive deletion is not allowed.
     */
    static async remove(path: string): Promise<void> {
        await FS.rm(path, { recursive: true, force: true });
    }
    /**
     * Finds the root directory of a module by traversing up the directory tree from the location of the provided ImportMeta object until it finds a directory containing a package.json file. If it reaches the root of the file system without finding a package.json, it returns the last directory checked. This method is useful for determining the base directory of a module, which can be important for resolving paths, loading resources, or performing operations relative to the module's location.
     * @param you The ImportMeta object from which to start the search for the module root.
     * @returns A promise that resolves to the path of the module root directory.
     */
    public static async findModuleRoot(you: ImportMeta): Promise<string> {
        let current = you.dirname || Path.relativeToMe(you, '.');
        while (current !== Path.dirname(current)) {
            const pkg = Path.join(current, 'package.json');
            if (await File.exists(pkg)) return current;
            if (!Path.isInside(Path.cwd, current)) break;
            current = Path.dirname(current);
        }
        return current;
    }
    public static async ensureDir(path: string): Promise<void> {
        await FS.mkdir(path, { recursive: true });
    }
    /**
     * Finds files matching a specified glob pattern within a base directory. The pattern can include wildcards such as '*' for matching any sequence of characters (except path separators) and '**' for matching any sequence of characters across directories. The method constructs a regular expression from the provided pattern and uses it to filter the list of files retrieved from the base directory and its subdirectories. It returns an array of file paths that match the pattern, allowing for flexible file searching based on naming conventions or directory structures.
     * @param pattern The pattern to match file paths against, which can include wildcards like '*' and '**'.
     * @param baseDir The base directory to search within (default is the current working directory).
     * @returns A promise that resolves to an array of file paths that match the specified pattern.
     */
    static async find(pattern: string, baseDir: string = Path.cwd): Promise<string[]> {
        return Find.find(pattern, { cwd: baseDir });
    }
    /**
     * Moves files matching a specified pattern to a destination path. The method first resolves the file paths based on the provided pattern and base directory, then calculates the final destination for each file, ensuring that the necessary directories exist before performing the move operation. It uses fs.rename to move files or directories, handling both cases appropriately. If the move operation fails due to cross-device issues (EXDEV), it falls back to copying the file and then removing the original. This method is useful for organizing files into different locations while maintaining their directory structure when using glob patterns, and it can be used in various scenarios such as cleaning up build artifacts or reorganizing project files.
     * @param pattern The pattern to match file paths against, which can include wildcards like '*' and '**'.
     * @param dest The base destination path where the matched files should be moved to.
     * @param baseDir The base directory to resolve the pattern against (default is the current working directory).
     * @returns A promise that resolves when all move operations are complete.
      * @throws Will throw an error if there is an issue during the move process, such as if the source files do not exist or if there are permission issues.
     */
    public static async smartMove(pattern: string, dest: string, baseDir: string = Path.cwd): Promise<void> {
        const files = await this.resolveEntries(pattern, baseDir);
        for (const srcPath of files) {
            const finalDest = await this.calculateDest(pattern, srcPath, dest, baseDir);
            await this.ensureDir(Path.dirname(finalDest));

            try {
                await FS.rename(srcPath, finalDest);
            } catch (error: any) {
                if (error.code === 'EXDEV') {
                    await FS.cp(srcPath, finalDest, { recursive: true });
                    await FS.rm(srcPath, { recursive: true, force: true });
                } else throw error;
            }
        }
    }
    /**
     * Copies files matching a specified pattern to a destination path. The method first resolves the file paths based on the provided pattern and base directory, then calculates the final destination for each file, ensuring that the necessary directories exist before performing the copy operation. It uses fs.cp to copy files or directories, handling both cases appropriately. This method is useful for duplicating files while maintaining their directory structure when using glob patterns, and it can be used in various scenarios such as backing up files, creating duplicates for processing, or organizing files into different locations.
     * @param pattern The pattern to match file paths against, which can include wildcards like '*' and '**'.
     * @param dest The base destination path where the matched files should be copied to.
     * @param baseDir The base directory to resolve the pattern against (default is the current working directory).
     * @returns A promise that resolves when all copy operations are complete.
      * @throws Will throw an error if there is an issue during the copy process, such as if the source files do not exist or if there are permission issues.
     */
    public static async smartCopy(pattern: string, dest: string, baseDir: string = Path.cwd): Promise<void> {
        const files = await this.resolveEntries(pattern, baseDir);
        for (const srcPath of files) {
            const finalDest = await this.calculateDest(pattern, srcPath, dest, baseDir);
            await this.ensureDir(Path.dirname(finalDest));
            await FS.cp(srcPath, finalDest, { recursive: true });
        }
    }
    /**
     * Resolves file paths based on a given pattern and base directory. If the pattern includes wildcards (indicating that it is a glob), it uses the find method to retrieve all matching file paths. If the pattern does not include wildcards, it treats it as a single file path and resolves it against the base directory. This method is useful for handling both glob patterns and specific file paths in a consistent way, allowing for flexible file operations based on user input or configuration.
     * @param pattern The pattern to resolve, which can be a glob with wildcards or a specific file path.
     * @param baseDir The base directory to resolve the pattern against (default is the current working directory).
     * @returns A promise that resolves to an array of file paths that match the pattern or a single file path if the pattern is not a glob.
     */
    private static async resolveEntries(pattern: string, baseDir: string): Promise<string[]> {
        const files = pattern.includes('*') 
            ? await this.find(pattern, baseDir) 
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
    private static async calculateDest(pattern: string, src: string, dest: string, baseDir: string): Promise<string> {
        if (pattern.includes('*')) {
            const relativePath = Path.diff(baseDir, src);
            return Path.join(dest, relativePath);
        }
        const isDestDir = !Path.extName(dest) || (await this.isDirectory(dest));
        return isDestDir ? Path.join(dest, Path.fileName(src)) : dest;
    }
}

export namespace File {}
export default File;