# Survive the Night Sim

This is a community project for letting ai models play a puzzle game to find out which one is the best.

## Live Links

- [Plausible Analytics](https://plausible-analytics-ce-production-e655.up.railway.app/survivethenightgame)
- [Survive the Night Sim](https://survivethenightgame.com/)

## How to Run

Before you can run the project, you'll need to setup a

1. `npm i`
2. `npm run dev`
3. use http://localhost:3000 for SITE_URL when prompted
4. Y for configure GitHub OAuth
5. create a github OAuth app at https://github.com/settings/applications/new
6. for authorization callback URL enter, https://YOUR_CONVEX_PROJECT_NAME.convex.site/api/auth/callback/github
7. Y for configure Google OAuth
8. create a google OAuth app with following the instructions here https://support.google.com/cloud/answer/6158849?hl=en
9. for authorised domain enter, YOUR_CONVEX_PROJECT_NAME.convex.site
10. for authorised JS origin enter, https://YOUR_CONVEX_PROJECT_NAME.convex.site
11. for redirect URI enter, https://YOUR_CONVEX_PROJECT_NAME.convex.site/api/auth/callback/google
12. paste client ids when prompted
13. paste client secrets when prompted

## Env Setup

This starter project works with [convex](https://www.convex.dev) so to run you need to use the [.env.example](.env.example) file to create your own .env file.

If you want to mock all models - in convex, please add the following environment variable:

- `npx convex env set FLAG_MOCK_MODELS true`

If you want to show a Test page - in convex, please add the following environment variable:

- `npx convex env set FLAG_TEST_PAGE true`

If you want to have cron jobs running - in convex, please add the following environment variable:

- `npx convex env set FLAG_CRON_JOBS true`

Add optional environment variable/s for simulating real AI models without mockup responses(when mockup flags are set to FALSE):

- `npx convex env set GEMINI_API_KEY YOUR_API_KEY`
- `npx convex env set OPENAI_API_KEY YOUR_API_KEY`
- `npx convex env set ANTHROPIC_API_KEY YOUR_API_KEY`
- `npx convex env set PERPLEXITY_API_KEY YOUR_API_KEY`
- `npx convex env set MISTRAL_API_KEY YOUR_API_KEY`

also, you may need to run, but I think the initial setup does that.

`npx @convex-dev/auth` to get the proper convex jwks setup

## Deployment

When deploying you need to set the HOSTNAME of the application to your FQDN, such as `https://you-domain.com`

## Join the community

Want to help build on this project?

- Join the [WDC Discord](https://discord.gg/N2uEyp7Rfu)
