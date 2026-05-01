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
import Async from '../Async.js';
import Validation from './Validation.js';
import Management from './Management.js';
import { Utils } from './Utils.js';
import { Smart } from './Smart.js';

export class File {
    /**
     * Checks if a given path exists in the file system.
     * It uses fs.access to determine if the path is accessible, returning true if it exists and false if it does not.
     * This method is useful for verifying the presence of files or directories before attempting to read, write, or perform other operations on them, helping to prevent errors related to non-existent paths.
     * @param path The file system path to check for existence.
     * @returns A promise that resolves to true if the path exists, or false if it does not.
     */
    static async exists(path: string): Promise<boolean> {
        return Validation.exists(path);
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
        return Validation.isFile(path);
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
        return Validation.isDirectory(path);
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
        return Management.read(path, encoding);
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
        return Management.write(path, content, encoding);
    }
    /**
     * Ensures that a directory exists at the specified path. If the directory does not exist, it creates it using fs.mkdir with the option { recursive: true } to create any necessary parent directories. This method is useful for preparing the file system for operations that require a specific directory structure, preventing errors related to missing directories when attempting to read, write, or move files.
     * @param path The file system path of the directory to ensure exists.
     * @returns A promise that resolves when the directory has been ensured to exist.
     * @throws Will throw an error if there is an issue during the directory creation process, such as permission issues or if a non-directory file exists at the specified path.
     */
    public static async ensureDir(path: string): Promise<void> {
        return Management.ensureDir(path);
    }
    /**
     * Creates a directory at the specified path with the given options (such as recursive creation). It first checks if the path already exists using the exists method, and if it does, it throws an error to prevent overwriting existing files or directories. If the path does not exist, it uses fs.mkdir to create the directory according to the provided options. This method is essential for safely creating directories while ensuring that existing paths are not unintentionally overwritten, and it can be used to set up necessary directory structures for applications or projects.
     * @param path The file system path where the directory should be created.
     * @param options Optional settings for directory creation, such as { recursive: true } to create parent directories if they do not exist.
     * @returns A promise that resolves when the directory has been successfully created.
     * @throws Will throw an error if the path already exists or if there is an issue during directory creation.
     */
    static async mkdir(path: string, options?: { recursive?: boolean }): Promise<void> {
        return Management.mkdir(path, options);
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
        return Management.copy(src, dest);
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
        return Management.move(src, dest);
    }
    /**
     * Removes a file or directory at the specified path. It uses fs.rm with the options { recursive: true, force: true } to ensure that directories are removed along with their contents and that the operation does not throw an error if the path does not exist. This method is essential for safely deleting files or directories without needing to check for their existence beforehand, making it a convenient way to clean up resources in the file system.
     * @param path The file system path of the file or directory to remove.
     * @returns A promise that resolves when the removal operation is complete.
     * @throws Will throw an error if there is an issue during the removal process, such as permission issues or if the path is a non-empty directory and recursive deletion is not allowed.
     */
    static async remove(path: string): Promise<void> {
        return Management.remove(path);
    }
    /**
     * Finds the root directory of a module by traversing up the directory tree from the location of the provided ImportMeta object until it finds a directory containing a package.json file. If it reaches the root of the file system without finding a package.json, it returns the last directory checked. This method is useful for determining the base directory of a module, which can be important for resolving paths, loading resources, or performing operations relative to the module's location.
     * @param you The ImportMeta object from which to start the search for the module root.
     * @returns A promise that resolves to the path of the module root directory.
     */
    public static async findModuleRoot(you: ImportMeta): Promise<string> {
        return Utils.findModuleRoot(you);
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
        static async smartMove(pattern: string, dest: string, options: Smart.Options = {}): Promise<void> {
            return Smart.move(pattern, dest, options);
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
        static async smartCopy(pattern: string, dest: string, options: Smart.Options = {}): Promise<void> {
            return Smart.copy(pattern, dest, options);
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
        protected static async processEntries(pattern: string, dest: string, options: Smart.Options, handler: Smart.ProcessHandler): Promise<void> {
            return Smart.processEntries(pattern, dest, options, handler);
        }
}

export namespace File {}
export default File;