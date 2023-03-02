import { outro } from "@clack/prompts";
import colors from "picocolors";

export function exitProgram(lang) {
    outro(colors.yellow(lang === "Spanish" ? "Commit cancelado" : "Commit canceled "));
    process.exit(0);
}

export const languajes = ["Spanish", "English"];
