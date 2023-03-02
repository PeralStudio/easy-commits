import { intro, outro, text, select, confirm, multiselect, isCancel } from "@clack/prompts";
import { COMMIT_TYPES } from "./commitTypes.js";
import colors from "picocolors";
import { exitProgram } from "./utils.js";
import { getChangedFiles, getStagedFiles, gitAdd, gitCommit, gitPush } from "./git.js";
import { trytm } from "@bdsqqq/try";

intro(
    colors.inverse(
        `Asistente para la creación de commits creado por ${colors.yellow("Alberto Peral")}`
    )
);

const [changedFiles, errorChangedFiles] = await trytm(getChangedFiles());
const [stagedFiles, errorStagedFiles] = await trytm(getStagedFiles());

if (errorChangedFiles ?? errorStagedFiles) {
    outro(colors.red("Error: Comprueba que estas en un repositorio git válido"));
    process.exit(1);
}

if (changedFiles.length <= 0) {
    outro(colors.red("No hay cambios para hacer commit"));
    process.exit(1);
}

if (stagedFiles.length === 0 && changedFiles.length > 0) {
    const files = await multiselect({
        message: colors.cyan(
            "No tienes ningun commit preparado. Por favor selecciona los archivos que quieres añadir a commit"
        ),
        options: changedFiles.map((file) => ({
            value: file,
            label: file,
        })),
    });

    if (isCancel(files)) exitProgram();

    await gitAdd({ files });
}

const commitType = await select({
    message: colors.cyan("Selecciona el tipo de commit"),
    options: Object.entries(COMMIT_TYPES).map(([key, value]) => ({
        value: key,
        label: `${value.emoji} ${key.padEnd(10, " ")} · ${value.description} `,
    })),
});

if (isCancel(commitType)) exitProgram();

const commitMessage = await text({
    message: colors.cyan("Introduce el mensaje del commit:"),
    placeholder: "mensaje del commit",
    validate: (value) => {
        if (value.length === 0) {
            return colors.red("El mensaje del commit no puede estar vacío");
        }

        if (value.length > 50) {
            return colors.red("El mensaje del commit no puede superar los 50 caracteres");
        }
    },
});

if (isCancel(commitMessage)) exitProgram();

const { emoji, release } = COMMIT_TYPES[commitType];

let breakingChange = false;
if (release) {
    breakingChange = await confirm({
        initialValue: false,
        message: colors.cyan(
            `¿Tiene este commit cambios que rompen la compatibilidad anterior?\n  ${colors.yellow(
                'Si la respuesta es sí, deberias crear un commit con el tipo "BREAKING CHANGE" y al hacer release se publicara la versión major'
            )}\n`
        ),
    });

    if (isCancel(breakingChange)) exitProgram();
}

let commit = `${emoji} ${commitType} : ${commitMessage}`;
commit = breakingChange ? `${commit} ${colors.red("[BREAKING CHANGE]")}` : commit;

const shouldContinue = await confirm({
    initialValue: true,
    message: `${colors.cyan("¿Quieres crear el commit con el siguiente mensaje?")}

        ${colors.green(colors.bold(commit))}\n\n${colors.cyan("¿Confirmas?")}`,
});

if (isCancel(shouldContinue)) exitProgram();

if (!shouldContinue) {
    outro(colors.yellow("Commit cancelado"));
    process.exit(0);
}

text({
    message: colors.green("✔️ Commit creado con éxito."),
});

await gitCommit({ commit });

const pushCommit = await confirm({
    initialValue: true,
    message: `${colors.cyan("¿Quieres hacer push?")}

        ${colors.green(colors.bold(commit))}\n\n${colors.cyan("¿Confirmas?")}`,
});

if (isCancel(pushCommit)) exitProgram();

if (!pushCommit) {
    outro(colors.yellow("Push cancelado"));
    process.exit(0);
}

await gitPush();

text({
    message: colors.green("✔️ Push realizado con éxito."),
});

outro(colors.green("👏 ¡Gracias por usar este asistente!"));

process.exit(0);
