import Path from "../Path.js";
import Validation from "./Validation.js";

export class Utils {
    /**
     * Finds the root directory of a module by traversing up the directory tree from the location of the provided ImportMeta object until it finds a directory containing a package.json file. If it reaches the root of the file system without finding a package.json, it returns the last directory checked. This method is useful for determining the base directory of a module, which can be important for resolving paths, loading resources, or performing operations relative to the module's location.
     * @param you The ImportMeta object from which to start the search for the module root.
     * @returns A promise that resolves to the path of the module root directory.
     */
    public static async findModuleRoot(you: ImportMeta): Promise<string> {
        let current = you.dirname || Path.relativeToMe(you, '.');
        while (current !== Path.dirname(current)) {
            const pkg = Path.join(current, 'package.json');
            if (await Validation.exists(pkg)) return current;
            if (!Path.isInside(Path.cwd, current)) break;
            current = Path.dirname(current);
        }
        return current;
    }
}
export namespace Utils {}
export default Utils;