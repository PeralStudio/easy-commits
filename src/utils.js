import { outro } from "@clack/prompts";
import colors from "picocolors";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export function exitProgram(lang) {
    outro(colors.yellow(lang === "Spanish" ? "Commit cancelado" : "Commit canceled"));
    process.exit(0);
}

export const languages = ["Spanish", "English"];

export function getVersion() {
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8"));
        return pkg.version;
    } catch {
        return "1.0.0";
    }
}

export function getFileStatusIcon(status) {
    switch (status) {
        case "new":
            return colors.green("●");
        case "deleted":
            return colors.red("●");
        case "modified":
        default:
            return colors.yellow("●");
    }
}

export function getFileStatusLabel(file) {
    const icon = getFileStatusIcon(file.status);
    const colorFn =
        file.status === "new"
            ? colors.green
            : file.status === "deleted"
              ? colors.red
              : colors.yellow;
    return `${icon} ${colorFn(file.name)}`;
}

export function boxMessage(lines) {
    const maxLen = Math.max(...lines.map((l) => stripAnsi(l).length));
    const top = `  ┌${"─".repeat(maxLen + 2)}┐`;
    const bottom = `  └${"─".repeat(maxLen + 2)}┘`;
    const body = lines
        .map((l) => {
            const pad = " ".repeat(maxLen - stripAnsi(l).length);
            return `  │ ${l}${pad} │`;
        })
        .join("\n");
    return `${top}\n${body}\n${bottom}`;
}

function stripAnsi(str) {
    return str.replace(
        // eslint-disable-next-line no-control-regex
        /[\u001B\u009B][[\]()#;?]*(?:(?:(?:[a-zA-Z\d]*(?:;[-a-zA-Z\d/#&.:=?%@~_]*)*)?\u0007)|(?:(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]))/g,
        ""
    );
}

export function colorForType(colorName) {
    const map = {
        green: colors.green,
        red: colors.red,
        yellow: colors.yellow,
        magenta: colors.magenta,
        blue: colors.blue,
        white: colors.white,
        dim: colors.dim
    };
    return map[colorName] || colors.white;
}

export function banner(version) {
    const lines = [
        "",
        colors.cyan("  ╔═══════════════════════════════════╗"),
        colors.cyan("  ║") +
            colors.bold(colors.green("        🚀 EASY COMMITS ")) +
            colors.dim(`v${version}`) +
            colors.cyan("     ║"),
        colors.cyan("  ╚═══════════════════════════════════╝"),
        ""
    ];
    console.log(lines.join("\n"));
}
