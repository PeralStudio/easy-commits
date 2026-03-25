import { intro, outro, text, select, confirm, multiselect, isCancel, spinner, note } from "@clack/prompts";
import { COMMIT_TYPES } from "./commitTypes.js";
import colors from "picocolors";
import { exitProgram, languages, getVersion, banner, getFileStatusLabel, boxMessage, colorForType } from "./utils.js";
import { getChangedFiles, getStagedFiles, gitAdd, gitCommit, gitPush, getCurrentBranch } from "./git.js";
import { trytm } from "@bdsqqq/try";

const version = getVersion();
banner(version);

intro(colors.dim(`Assistant for commit creation by Alberto Peral`));

const selectedLangRes = await select({
    message: colors.cyan("Choose language / Elige idioma"),
    options: languages.map((lang) => ({
        value: lang,
        label: lang,
    })),
});

if (isCancel(selectedLangRes)) exitProgram("English");
const lang = selectedLangRes;

const s = spinner();
s.start(lang === "Spanish" ? "Analizando repositorio..." : "Analyzing repository...");

const [changedFiles, errorChangedFiles] = await trytm(getChangedFiles());
const [stagedFiles, errorStagedFiles] = await trytm(getStagedFiles());
const [branch] = await trytm(getCurrentBranch());

s.stop(lang === "Spanish" ? "Análisis completado" : "Analysis completed");

if (errorChangedFiles ?? errorStagedFiles) {
    outro(
        colors.red(
            lang === "Spanish"
                ? "Error: Comprueba que estas en un repositorio git válido"
                : "Error: Make sure you're in a valid git repository."
        )
    );
    process.exit(1);
}

if (changedFiles.length <= 0) {
    outro(
        colors.red(
            lang === "Spanish"
                ? "No hay cambios para hacer commit"
                : "There are no changes to commit"
        )
    );
    process.exit(1);
}

if (stagedFiles.length === 0 && changedFiles.length > 0) {
    const files = await multiselect({
        message: colors.cyan(
            lang === "Spanish"
                ? "Selecciona los archivos para añadir al commit:"
                : "Select the files to add to the commit:"
        ),
        options: changedFiles.map((file) => ({
            value: file.name,
            label: getFileStatusLabel(file),
        })),
    });

    if (isCancel(files)) exitProgram(lang);

    s.start(lang === "Spanish" ? "Preparando archivos..." : "Staging files...");
    await gitAdd({ files });
    s.stop(lang === "Spanish" ? "Archivos preparados" : "Files staged");
}

note(
    lang === "Spanish"
        ? "Configuración del Mensaje"
        : "Message Configuration",
    "--------"
);

const commitType = await select({
    message: colors.cyan(
        lang === "Spanish"
            ? "Selecciona el tipo de commit"
            : "Select the type of commit"
    ),
    options: Object.entries(COMMIT_TYPES).map(([key, value]) => ({
        value: key,
        label: `${value.emoji} ${colorForType(value.color)(key.padEnd(10, " "))} · ${
            lang === "Spanish" ? value.descriptionEsp : value.description
        }`,
    })),
});

if (isCancel(commitType)) exitProgram(lang);

const commitMessage = await text({
    message: colors.cyan(
        lang === "Spanish"
            ? "Introduce el mensaje del commit:"
            : "Enter the commit message:"
    ),
    placeholder: "e.g. add new validation logic",
    validate: (value) => {
        if (value.length === 0) {
            return colors.red(
                lang === "Spanish"
                    ? "El mensaje del commit no puede estar vacío"
                    : "The commit message cannot be empty"
            );
        }

        if (value.length > 50) {
            return colors.red(
                lang === "Spanish"
                    ? "El mensaje del commit no puede superar los 50 caracteres"
                    : "The commit message cannot exceed 50 characters"
            );
        }
    },
});

if (isCancel(commitMessage)) exitProgram(lang);

const { emoji, release, color } = COMMIT_TYPES[commitType];

let breakingChange = false;
if (release) {
    breakingChange = await confirm({
        initialValue: false,
        message:
            lang === "Spanish"
                ? colors.cyan(
                      `¿Tiene cambios que rompen la compatibilidad?`
                  )
                : colors.cyan(
                      `Does this have breaking changes?`
                  ),
    });

    if (isCancel(breakingChange)) exitProgram(lang);
}

let commit = `${emoji} ${commitType} : ${commitMessage}`;
if (breakingChange) {
    commit = `${commit} ${colors.red("[BREAKING CHANGE]")}`;
}

const previewLines = [
    colors.bold(lang === "Spanish" ? "Resumen del Commit:" : "Commit Summary:"),
    "",
    `${emoji} ${colorForType(color)(commitType)}: ${commitMessage}`,
    breakingChange ? colors.red(" [BREAKING CHANGE]") : "",
    colors.dim(`Branch: ${branch || "unknown"}`),
];

const shouldContinue = await confirm({
    initialValue: true,
    message: `\n${boxMessage(previewLines)}\n\n${colors.cyan(
        lang === "Spanish" ? "¿Confirmas la creación?" : "Confirm creation?"
    )}`,
});

if (isCancel(shouldContinue) || !shouldContinue) exitProgram(lang);

s.start(lang === "Spanish" ? "Creando commit..." : "Creating commit...");
await gitCommit({ commit });
s.stop(lang === "Spanish" ? "✔️ Commit creado con éxito" : "✔️ Commit created successfully");

const pushCommit = await confirm({
    initialValue: true,
    message: colors.cyan(
        lang === "Spanish" ? "¿Quieres hacer push ahora?" : "Do you want to push now?"
    ),
});

if (isCancel(pushCommit)) exitProgram(lang);

if (pushCommit) {
    s.start(lang === "Spanish" ? "Haciendo push..." : "Pushing changes...");
    const [_, errorPush] = await trytm(gitPush());
    if (errorPush) {
        s.stop(colors.red("❌ Error en push"));
        note(errorPush.message, "Error");
    } else {
        s.stop(lang === "Spanish" ? "✔️ Push realizado con éxito" : "✔️ Push successful");
    }
}

const finalSummary = [
    colors.green(colors.bold(lang === "Spanish" ? "¡Todo listo!" : "All set!")),
    "",
    `${colors.dim("Commit:")} ${commit}`,
    `${colors.dim("Branch:")} ${branch}`,
    `${colors.dim("Push:")} ${pushCommit ? "✅" : "❌"}`,
];

console.log("\n" + boxMessage(finalSummary));

outro(
    colors.green(
        lang === "Spanish"
            ? "👏 ¡Gracias por usar Easy Commits!"
            : "👏 Thank you for using Easy Commits!"
    )
);

process.exit(0);
