# create-app

A CLI tool for scaffolding new projects with an interactive prompt flow.

## Requirements

- Node.js >= 18

## Installation

```bash
npm install -g create-app
```

Or use without installing:

```bash
npx create-app
```

## Usage

```bash
create-app
```

Or explicitly via the `create` command:

```bash
create-app create
```

## Templates

The following internal templates are available for backend and fullstack projects:

| Template | Description |
|---|---|
| `express-ts` | Express.js with TypeScript |
| `express-js` | Express.js with JavaScript |
| `mern-ts` | MERN stack (MongoDB, Express, React, Node) with TypeScript |
| `mern-js` | MERN stack (MongoDB, Express, React, Node) with JavaScript |
| `next-fullstack-ts` | Next.js fullstack with TypeScript |
| `next-fullstack-js` | Next.js fullstack with JavaScript |

## Frontend Delegation

Frontend projects are scaffolded via official CLIs:

- **React Vite** — delegated to [`create-vite`](https://vitejs.dev/guide/)
- **Next.js** — delegated to [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app)

## License

MIT
