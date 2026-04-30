export class Glob {
    /**
     * Converts a glob pattern into a regular expression for matching file paths. The method processes the pattern by splitting it into parts based on the path separator and handling special cases for '**' (which matches any sequence of directories) and '*' (which matches any sequence of characters except path separators). It constructs a regular expression that can be used to test file paths against the original glob pattern, allowing for flexible and powerful file searching capabilities based on common glob syntax.
     * @param pattern The glob pattern to convert, which can include wildcards like '*' and '**'.
     * @returns A RegExp object that can be used to match file paths against the provided glob pattern.
     */
    public static globToRegex(pattern: string): RegExp {
        let regex = '^';
        const parts = pattern.split('/');
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (part === '**') {
                regex += '(?:.*\\/)?';
                continue;
            }
            let sub = part
                .replace(/[-\\^$+?.()|[\]{}]/g, '\\$&')
                .replace(/\*/g, '[^/]*')
                .replace(/\?/g, '[^/]');
            regex += sub;
            if (i < parts.length - 1) regex += '\\/';
        }
        regex += '$';
        return new RegExp(regex);
    }
}
export namespace Glob {}
export default Glob;