# BalatJack - By the Go Gitters (Team 26)

BalatJack is a lightweight, browser-based twist on Blackjack that we're building as the final project for CSE110 at UC San Diego. The focus: well-made code, a fun game, and a well-structured development process that keeps quality high despite a tight schedule.

<br>

## 🛣️ Sprint Roadmap

| **Milestone** | **What we're building**                                                  |
| ------------- | ------------------------------------------------------------------------ |
| May 17        | Core game loop, basic UI layout                                          |
| May 24        | Enhanced UI/UX, audio effects, more Jokers/Consumables                   |
| May 31        | User testing and feedback collection, add/extend unit tests              |
| June 5        | Bugfixes and performance passes, documentation refresh, final deployment |

(Pulled from our [Team Charter](/admin/misc/rules.md))

## 🚀 Quick Start

Clone -> Install -> Test - in three commands:

```bash
# 1. clone
git clone git@github.com:cse110-sp25-group26/cse110-sp25-group26.git
cd cse110-sp25-group26

# 2. install deps
npm install

# 3. sanity check
npm run test
```

Need more detail? Read the [Getting Started Guide](/doc/GETTINGSTARTED.md).

## 📁 Repository Layout

```
.
├── admin/               # Class-related documentation
├── source/              # Game code & assets
│   ├── scripts/         # JavaScript classes & helpers
│   ├── css/             # Component‑scoped CSS
│   └── res/             # Images, audio, etc.
├── doc/                 # Project docs actively used for writing code
├── specs/               # Architectural and design records
└── index.html           # Entry point – game start for browser
```

Full spec: [doc/STRUCTURE.md](/doc/STRUCTURE.md)

## 🛠️ Tech Stack

- **HTML + CSS** - semantic, responsive visual pages
- **Vanilla JS** - No frameworks!
- **JSDoc** - API docs, compiles to `doc/scripts/` on `npm run docs`
- **Jest** - Unit tests (`npm run test`)
- **ESLint** - Code linting (`npx eslint .`)

## 🧑‍💻 Contributing

1. Branch naming & rules -> [doc/BRANCHING.md](/doc/BRANCHING.md)
2. Style -> [doc/CODE_STYLE.md](/doc/CODE_STYLE.md)
3. Tests libe in `source/scripts/tests/`
4. Open a PR against `develop`; follow the [Review Checklist](/doc/REVIEWING.md)

## 🏗️ Current CI Pipeline

| Step  | Command        | Automated Trigger       |
| ----- | -------------- | ----------------------- |
| Tests | `npm run test` | PRs -> `develop`/`main` |
| Docs  | `npm run docs` | PRs -> `develop`/`main` |
| Lint  | `npx eslint .` | PRs ->` develop`/`main` |

All checks must pass before a protected branch can merge.

## 👥 Team & Credits

Faces & roles: [Team Page](/admin/team.md) - Charter: [admin/misc/rules.md](/admin/misc/rules.md)

## 📝 License

TBD - must determine before making repository public
