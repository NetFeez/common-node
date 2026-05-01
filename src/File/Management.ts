import { promises as FS } from 'node:fs';

import Path from "../Path.js";
import Validation from './Validation.js';

export class Management {
    /**
     * Ensures that a directory exists at the specified path. If the directory does not exist, it creates it using fs.mkdir with the option { recursive: true } to create any necessary parent directories. This method is useful for preparing the file system for operations that require a specific directory structure, preventing errors related to missing directories when attempting to read, write, or move files.
     * @param path The file system path of the directory to ensure exists.
     * @returns A promise that resolves when the directory has been ensured to exist.
     * @throws Will throw an error if there is an issue during the directory creation process, such as permission issues or if a non-directory file exists at the specified path.
     */
    public static async ensureDir(path: string): Promise<void> {
        await FS.mkdir(path, { recursive: true });
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
        if (await Validation.exists(path)) throw new Error(`Path ${path} already exists.`);
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
        if (!await Validation.exists(destDir)) await FS.mkdir(destDir, { recursive: true });
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
}
export namespace Management {}
export default Management;