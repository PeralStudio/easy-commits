import { intro, outro, text, select, confirm, multiselect, isCancel } from "@clack/prompts";
import { COMMIT_TYPES } from "./commitTypes.js";
import colors from "picocolors";
import { exitProgram, languajes } from "./utils.js";
import { getChangedFiles, getStagedFiles, gitAdd, gitCommit, gitPush } from "./git.js";
import { trytm } from "@bdsqqq/try";

intro(colors.inverse(`Assistant for commit creation created by ${colors.yellow("Alberto Peral")}`));

const languajeSelected = await multiselect({
    message: colors.cyan("Choose language"),
    options: languajes.map((lang) => ({
        value: lang,
        label: lang,
    })),
});

const [changedFiles, errorChangedFiles] = await trytm(getChangedFiles());
const [stagedFiles, errorStagedFiles] = await trytm(getStagedFiles());

if (errorChangedFiles ?? errorStagedFiles) {
    outro(
        colors.red(
            languajeSelected[0] === "Spanish"
                ? "Error: Comprueba que estas en un repositorio git válido"
                : "Error: Make sure you're in a valid git repository."
        )
    );
    process.exit(1);
}

if (changedFiles.length <= 0) {
    outro(
        colors.red(
            languajeSelected[0] === "Spanish"
                ? "No hay cambios para hacer commit"
                : "There are no changes to commit"
        )
    );
    process.exit(1);
}

if (stagedFiles.length === 0 && changedFiles.length > 0) {
    const files = await multiselect({
        message: colors.cyan(
            languajeSelected[0] === "Spanish"
                ? "No tienes ningun commit preparado. Por favor selecciona los archivos que quieres añadir a commit"
                : "You don't have any commit prepared. Please select the files you want to add to the commit"
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
    message: colors.cyan(
        languajeSelected[0] === "Spanish"
            ? "Selecciona el tipo de commit"
            : "Select the type of commit"
    ),
    options: Object.entries(COMMIT_TYPES).map(([key, value]) => ({
        value: key,
        label: `${value.emoji} ${key.padEnd(10, " ")} · ${
            languajeSelected[0] === "Spanish" ? value.descriptionEsp : value.description
        }`,
    })),
});

if (isCancel(commitType)) exitProgram();

const commitMessage = await text({
    message: colors.cyan(
        languajeSelected[0] === "Spanish"
            ? "Introduce el mensaje del commit:"
            : "Enter the commit message:"
    ),
    placeholder: "commit message:",
    validate: (value) => {
        if (value.length === 0) {
            return colors.red(
                languajeSelected[0] === "Spanish"
                    ? "El mensaje del commit no puede estar vacío"
                    : "The commit message cannot be empty"
            );
        }

        if (value.length > 50) {
            return colors.red(
                languajeSelected[0] === "Spanish"
                    ? "El mensaje del commit no puede superar los 50 caracteres"
                    : "The commit message cannot exceed 50 characters"
            );
        }
    },
});

if (isCancel(commitMessage)) exitProgram();

const { emoji, release } = COMMIT_TYPES[commitType];

let breakingChange = false;
if (release) {
    breakingChange = await confirm({
        initialValue: false,
        message:
            languajeSelected[0] === "Spanish"
                ? colors.cyan(
                      `¿Tiene este commit cambios que rompen la compatibilidad anterior?\n  ${colors.yellow(
                          'Si la respuesta es sí, deberias crear un commit con el tipo "BREAKING CHANGE" y al hacer release se publicara la versión major'
                      )}\n`
                  )
                : colors.cyan(
                      `Does this commit have changes that break backward compatibility?\n  ${colors.yellow(
                          'If the answer is yes, you should create a commit with type "BREAKING CHANGE", and upon release, the major version will be published'
                      )}\n`
                  ),
    });

    if (isCancel(breakingChange)) exitProgram();
}

let commit = `${emoji} ${commitType} : ${commitMessage}`;
commit = breakingChange ? `${commit} ${colors.red("[BREAKING CHANGE]")}` : commit;

const shouldContinue = await confirm({
    initialValue: true,
    message: `${colors.cyan(
        languajeSelected[0] === "Spanish"
            ? "¿Quieres crear el commit con el siguiente mensaje?"
            : "Do you want to create the commit with the following message?"
    )}

        ${colors.green(colors.bold(commit))}\n\n${colors.cyan(
        languajeSelected[0] === "Spanish" ? "¿Confirmas?" : "Confirm?"
    )}`,
});

if (isCancel(shouldContinue)) exitProgram();

if (!shouldContinue) {
    outro(
        colors.yellow(languajeSelected[0] === "Spanish" ? "Commit cancelado" : "Commit canceled")
    );
    process.exit(0);
}

text({
    message: colors.green(
        languajeSelected[0] === "Spanish"
            ? "✔️ Commit creado con éxito."
            : "✔️ Commit created successfully."
    ),
});

await gitCommit({ commit });

const pushCommit = await confirm({
    initialValue: true,
    message: `${colors.cyan(
        languajeSelected[0] === "Spanish" ? "¿Quieres hacer push?" : "Do you want to push?"
    )}

        ${colors.green(colors.bold(commit))}\n\n${colors.cyan(
        languajeSelected[0] === "Spanish" ? "Commit cancelado" : "Commit canceled"
    )}`,
});

if (isCancel(pushCommit)) exitProgram();

if (!pushCommit) {
    outro(colors.yellow(languajeSelected[0] === "Spanish" ? "Push cancelado" : "Push canceled"));
    process.exit(0);
}

await gitPush();

text({
    message: colors.green(
        languajeSelected[0] === "Spanish"
            ? "✔️ Push realizado con éxito."
            : "✔️ Push successfully executed."
    ),
});

outro(
    colors.green(
        languajeSelected[0] === "Spanish"
            ? "👏 ¡Gracias por usar este asistente!"
            : "👏 Thank you for using this assistant!"
    )
);

process.exit(0);
