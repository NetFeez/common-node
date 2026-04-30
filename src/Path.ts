/**
 * @author NetFeez <netfeez.dev@gmail.com>
 * @description Provides utilities for handling file paths, including normalization and resolution of paths relative to the module and user project.
 * @license Apache-2.0
 */
import PATH from 'path';
import URL from 'url';

export class Path {
    /** The directory where the user is running the server from. */
    public static readonly cwd: string = process.cwd();
    public static readonly sep: string = PATH.sep;
    /**
     * Resolves an absolute path from the user's project root directory.
     * It takes multiple path segments as arguments, normalizes them, and then joins them with the current working directory.
     * This is useful for constructing paths that are relative to the root of the user's project, ensuring that the resulting path is absolute and correctly formatted regardless of the operating system.
     * @param paths - The path segments to join with the user's project root directory.
     * @return The resolved absolute path from the user's project root directory.
     */
    public static root(...paths: string[]): string {
        paths = paths.map(path => this.normalize(path));
        return PATH.join(this.cwd, ...paths);
    }
    /**
     * Resolves an absolute path from the directory of the caller module.
     * It uses the `meta` parameter to determine the directory of the caller module and then joins it with the provided paths.
     * This is useful for resolving paths relative to the module that is calling this method, allowing for more flexible and modular code.
     * @param meta - The import.meta object from the caller module.
     * @param paths - The path segments to join with the caller's directory.
     * @return The resolved path relative to the caller's directory.
     */
    public static relativeToMe(meta: ImportMeta, ...paths: string[]): string {
        const callerDir = meta.dirname || PATH.dirname(URL.fileURLToPath(meta.url));
        return PATH.join(callerDir, ...paths.map(p => this.normalize(p)));
    }
    /**
     * Normalizes a given path by replacing multiple consecutive slashes or backslashes with a single path separator.
     * This method ensures that the path is in a consistent format, which can help prevent issues related to different path formats across operating systems.
     * @param path The file system path to normalize.
     * @returns The normalized path with consistent separators.
     */
    public static normalize(path: string): string {
        path = path.replace(/[\\/]+/g, PATH.sep);
        return path;
    }
    /**
     * Returns the directory name of a given path after normalizing it.
     * This method is useful for extracting the parent directory from a file path while ensuring that the path is in a consistent format.
     * @param path The file system path from which to extract the directory name.
     * @returns The directory name of the given path.
     */
    public static dirname(path: string): string {
        path = this.normalize(path);
        return PATH.dirname(path);
    }
    /**
     * Checks if a given path is an absolute path after normalizing it.
     * This method is useful for determining whether a path is absolute or relative, which can affect how the path is resolved and used in file operations.
     * @param path The file system path to check for being an absolute path.
     * @returns True if the path is an absolute path, false otherwise.
     */
    public static isAbsolute(path: string): boolean {
        return PATH.isAbsolute(this.normalize(path));
    }
    /**
     * Checks if a given path is a relative path after normalizing it.
     * This method is useful for determining whether a path is relative or absolute, which can affect how the path is resolved and used in file operations.
     * @param path The file system path to check for being a relative path.
     * @returns True if the path is a relative path, false otherwise.
     */
    public static toUrl(path: string): string {
        return URL.pathToFileURL(this.resolve(path)).href;
    }
    /**
     * Joins multiple path segments into a single path, ensuring that all segments are normalized before joining.
     * This method is useful for constructing file paths from multiple segments while maintaining consistency in the path format.
     * @param paths - The path segments to join.
     * @return The joined path.
     */
    public static join(...paths: string[]): string {
        paths = paths.map(path => this.normalize(path));
        return PATH.join(...paths);
    }
    /**
     * Resolves a sequence of paths into an absolute path, ensuring that all paths are normalized before resolution.
     * This method is useful for creating absolute paths from relative segments, and it can handle various path formats while ensuring consistency in the resulting path.
     * @param paths - The path segments to resolve into an absolute path.
     * @return The resolved absolute path.
     */
    public static resolve(...paths: string[]): string {
        paths = paths.map(path => this.normalize(path));
        return PATH.resolve(...paths);
    }
    /**
     * Calculates the relative path from one path to another, ensuring that both paths are normalized before performing the calculation.
     * This method is useful for determining how to navigate from one file or directory to another within the file system, and it can be used in various scenarios such as generating relative import paths or creating links between files.
     * @param from The starting path from which to calculate the relative path.
     * @param to The target path to which the relative path should point.
     * @returns The relative path from the "from" path to the "to" path.
     */
    public static diff(from: string, to: string): string {
        return PATH.relative(this.normalize(from), this.normalize(to));
    }
    /**
     * Checks if the "child" path is located within the "parent" path.
     * It normalizes both paths and then calculates the relative path from the parent to the child.
     * If the relative path does not start with '..' and is not an absolute path, it indicates that the child is inside the parent.
     * This method is useful for validating directory structures and ensuring that certain files or directories are located within specific parent directories.
     * @param parent The parent path to check against.
     * @param child The child path to check if it is inside the parent.
     * @returns True if the child path is inside the parent path, false otherwise.
     */
    public static isInside(parent: string, child: string): boolean {
        const relative = PATH.relative(this.normalize(parent), this.normalize(child));
        return !!relative && !relative.startsWith('..') && !PATH.isAbsolute(relative);
    }
    /**
     * Checks if a given path is a child of the current working directory.
     * It normalizes the path and then checks if it does not start with '..' and is not an absolute path.
     * This method is useful for validating that a path is located within the user's project directory, which can help prevent issues related to accessing files outside of the intended directory structure.
     * @param path The file system path to check if it is a child of the current working directory.
     * @returns True if the path is a child of the current working directory, false otherwise.
     */
    public static isChild(path: string): boolean {
        const normalized = this.normalize(path);
        return !normalized.startsWith('..') && !PATH.isAbsolute(normalized);
    }
    /**
     * Extracts the file extension from a given path, optionally including the leading dot.
     * It uses `PATH.extname` to get the extension and then conditionally removes the leading dot based on the `withDot` parameter.
     * This method is useful for determining the type of a file based on its extension, which can be important for processing files differently based on their types (e.g., handling .txt files differently from .json files).
     * @param path The file system path from which to extract the extension.
     * @param withDot A boolean indicating whether to include the leading dot in the returned extension (default is true).
     * @returns The file extension, optionally including the leading dot.
     */
    public static extName(path: string, withDot = true): string {
        const ext = PATH.extname(path);
        return withDot ? ext : ext.replace(/^\./, '');
    }
    /**
     * Converts a given path to use POSIX-style separators (forward slashes) regardless of the operating system.
     * This method is useful for ensuring that paths are in a consistent format, especially when working with tools or libraries that expect POSIX-style paths.
     * It replaces all occurrences of backslashes and multiple slashes with a single forward slash.
     * @param path The file system path to convert to POSIX format.
     * @returns The path with POSIX-style separators.
     */
    public static toPosix(path: string): string {
        return path.replace(/[\\/]+/g, '/');
    }
    /**
     * Extracts the file name from a given path, optionally including the file extension.
     * It uses `PATH.basename` to get the file name and conditionally removes the extension based on the `withExtension` parameter.
     * This method is useful for retrieving just the file name from a path, which can be important for display purposes or when performing operations that require only the file name without its extension.
     * @param path The file system path from which to extract the file name.
     * @param withExtension A boolean indicating whether to include the file extension in the returned file name (default is true).
     * @returns The file name extracted from the given path, optionally including the extension.
     */
    public static fileName(path: string, withExtension = true): string {
        return withExtension 
            ? PATH.basename(path) 
            : PATH.basename(path, PATH.extname(path));
    }
    /**
     * Removes any trailing slashes or backslashes from a given path after normalizing it.
     * This method is useful for ensuring that paths do not have unnecessary trailing separators, which can help prevent issues related to path formatting and consistency.
     * It first normalizes the path to ensure consistent separators and then uses a regular expression to remove any trailing slashes or backslashes.
     * @param path The file system path to clean by removing trailing separators.
     * @returns The cleaned path without trailing slashes or backslashes.
     */
    public static clean(path: string): string {
        return this.normalize(path).replace(/[\\/]+$/, '');
    }
    /**
     * Converts a given string into a URL-friendly slug by normalizing it, removing diacritics, and replacing non-alphanumeric characters with hyphens.
     * @param text The string to convert into a slug.
     * @returns The URL-friendly slug.
     */
    public static slugify(text: string): string {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-0\-_]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
}
export namespace Path {}
export default Path;