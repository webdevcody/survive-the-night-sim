# Survive the Night Sim

This is a community project for letting ai models play a puzzle game to find out which one is the best.

## How to Run

Before you can run the project, you'll need to setup a

1. `npm i`
2. `npm run dev`
3. use http://localhost:3000 for SITE_URL when prompted
4. Y for configure GitHub OAuth
5. create a github OAuth app at https://github.com/settings/applications/new
6. for authorization callback URL enter, https://YOUR_CONVEX_PROJECT_NAME.convex.site/api/auth/callback/github
7. paste client id when prompted
8. paste client secret when prompted

## Env Setup

This starter project works with [convex](https://www.convex.dev) so to run you need to use the [.env.example](.env.example) file to create your own .env file.

If you want to mock all models - in convex, please add the following environment variables:

- `npx convex env set MOCK_MODELS true`
- `npx convex env set FLAG_TEST_PAGE true`
- `npx convex env set FLAG_CRON_JOBS true`

Add optional environment variable/s for simulating real AI models without mockup responses(when mockup flags are set to FALSE):

- `npx convex env set GEMINI_API_KEY YOUR_API_KEY`
- `npx convex env set OPENAI_API_KEY YOUR_API_KEY`

also, you may need to run, but I think the initial setup does that.

`npx @convex-dev/auth` to get the proper convex jwks setup

## Deployment

When deploying you need to set the HOSTNAME of the application to your FQDN, such as `https://you-domain.com`

## Join the community

Want to help build on this project?

- Join the [WDC Discord](https://discord.gg/N2uEyp7Rfu)
