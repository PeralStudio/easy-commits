import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

const cleanStdout = (out) => out.split("\n").filter(Boolean);

export async function getChangedFiles() {
    const { stdout } = await execAsync("git status --porcelain");
    return cleanStdout(stdout).map((line) => {
        const statusCode = line.substring(0, 2).trim();
        const name = line.substring(3);
        let status;
        if (statusCode === "??" || statusCode === "A") {
            status = "new";
        } else if (statusCode === "D") {
            status = "deleted";
        } else {
            status = "modified";
        }
        return { name, status };
    });
}

export async function getStagedFiles() {
    const { stdout } = await execAsync("git diff --cached --name-only");
    return cleanStdout(stdout);
}

export async function gitCommit({ commit }) {
    const sanitized = commit.replace(/"/g, '\\"');
    const { stdout } = await execAsync(`git commit -m "${sanitized}"`);
    return cleanStdout(stdout);
}

export async function gitAdd({ files = [] } = {}) {
    const filesLine = files.map((f) => `"${f.replace(/"/g, '\\"')}"`).join(" ");
    const { stdout } = await execAsync(`git add ${filesLine}`);
    return cleanStdout(stdout);
}

export async function gitPush() {
    const { stdout } = await execAsync(`git push -u origin`);
    return cleanStdout(stdout);
}

export async function getCurrentBranch() {
    const { stdout } = await execAsync("git rev-parse --abbrev-ref HEAD");
    return stdout.trim();
}
