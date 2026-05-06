export class Glob {
    protected static readonly SPECIAL_REGEX = /[-\\^$+?.()|[\]]/g;
    /**
     * Converts a glob pattern to a regular expression.
     * @param pattern The glob pattern to convert.
     * @returns A RegExp object that matches the glob pattern.
     */
    public static globToRegex(pattern: string): RegExp {
        let regex = '^';
        const parts = pattern.split('/');
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (part === '**') { regex += '(?:.*\\/)?'; continue; }
            regex += this.compile(part);
            if (i < parts.length - 1) { regex += '\\/'; }
        }
        regex += '$';
        return new RegExp(regex);
    }
    /**
     * Compiles a glob pattern into a regex pattern.
     * @param input The glob pattern to compile.
     * @returns The compiled regex pattern.
     */
    protected static compile(input: string): string {
        let result = '';
        for (let i = 0; i < input.length; i++) {
            const char = input[i];
            if (char === '\\') {
                const next = input[++i];
                if (next) { result += '\\' + this.escapeRegex(next); }
                continue;
            }
            if (char === '*') { result += '[^/]*'; continue; }
            if (char === '?') { result += '[^/]'; continue; }
            if (char === '{') {
                const end = this.findClosingBrace(input, i);
                if (end === -1) { result += '\\{'; continue; }
                const content = input.slice(i + 1, end);
                result += this.compileBrace(content);
                i = end;
                continue;
            }
            result += this.escapeRegex(char);
        }
        return result;
    }
    /**
     * Compiles the content of a brace expression into a regex pattern.
     * @param content The content inside the braces.
     * @returns The compiled regex pattern for the brace expression
     */
    protected static compileBrace(content: string): string {
        const parts = this.splitBraceParts(content);
        const compiled = parts.map((part) => this.compile(part));
        return `(?:${compiled.join('|')})`;
    }
    /**
     * Splits a string by commas, ignoring commas inside braces and escaped commas.
     * @param input The input string.
     * @returns An array of parts split by commas.
     */
    protected static splitBraceParts(input: string): string[] {
        const parts: string[] = [];
        let current = '';
        let depth = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input[i];
            if (char === '\\') { current += char; if (i + 1 < input.length) { current += input[++i]; } continue; }
            if (char === '{') { depth ++; current += char; continue; }
            if (char === '}') { depth --; current += char; continue; }
            if (char === ',' && depth === 0) { parts.push(current); current = ''; continue; }
            current += char;
        }
        parts.push(current);
        return parts;
    }
    /**
     * Finds the index of the closing brace that matches the opening brace at the given index.
     * @param input The input string.
     * @param start The index of the opening brace.
     * @returns The index of the closing brace, or -1 if not found.
     */
    protected static findClosingBrace(input: string, start: number): number {
        let depth = 0;
        for (let i = start; i < input.length; i++) {
            const char = input[i];
            if (char === '\\') { i ++; continue; }
            if (char === '{') { depth ++; continue; }
            if (char === '}') { depth --; if (depth === 0) { return i; } }
        }
        return -1;
    }
    /**
     * Escapes special regex characters in a string.
     * @param value The string to escape.
     * @returns The escaped string.
     */
    protected static escapeRegex(value: string): string {
        return value.replace(this.SPECIAL_REGEX, '\\$&');
    }
}

export namespace Glob {}

export default Glob;