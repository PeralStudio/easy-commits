export const COMMIT_TYPES = {
    feat: {
        emoji: "✨",
        descriptionEsp: "Agregar nueva característica",
        description: "Add new feature",
        release: true,
    },
    fix: {
        emoji: "🐛",
        description: "Fix bug ",
        release: true,
    },
    perf: {
        emoji: "⚡",
        descriptionEsp: "Corregir error",
        description: "Improve performance",
        release: true,
    },
    style: {
        emoji: "💎",
        descriptionEsp: "Cambio de estilo",
        description: "Style change",
        release: true,
    },
    refactor: {
        emoji: "💅",
        descriptionEsp: "Refactorizar código",
        description: "Refactor code",
        release: true,
    },
    docs: {
        emoji: "📚",
        descriptionEsp: "Agregar o actualizar documentación",
        description: "Add or update documentation",
        release: false,
    },
    test: {
        emoji: "\uD83D\uDEA8",
        descriptionEsp: "Agregar o actualizar tests",
        description: "Add or update tests",
        release: false,
    },
    build: {
        emoji: "\uD83D\uDEE0 ",
        descriptionEsp: "Agregar o actualizar build scripts",
        description: "Add or update build scripts",
        release: false,
    },
};
