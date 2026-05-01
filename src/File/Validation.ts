import { promises as FS } from 'node:fs';

export class Validation {
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
}
export namespace Validation {}
export default Validation;