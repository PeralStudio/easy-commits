export const COMMIT_TYPES = {
    feat: {
        emoji: "🆕",
        description: "Add new feature",
        release: true,
    },
    fix: {
        emoji: "🔧",
        description: "Fix bug",
        release: true,
    },
    perf: {
        emoji: "⚡",
        description: "Improve performance",
        release: true,
    },
    refactor: {
        emoji: "💅",
        description: "Refactor code",
        release: true,
    },
    docs: {
        emoji: "📚",
        description: "Add or update documentation",
        release: false,
    },
    test: {
        emoji: "\uD83D\uDEA8",
        description: "Add or update tests",
        release: false,
    },
    build: {
        emoji: "\uD83D\uDEE0 ",
        description: "Add or update build scripts",
        release: false,
    },
};
