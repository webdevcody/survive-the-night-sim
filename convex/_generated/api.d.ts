/* prettier-ignore-start */

/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as attempts from "../attempts.js";
import type * as auth from "../auth.js";
import type * as constants from "../constants.js";
import type * as crons from "../crons.js";
import type * as flags from "../flags.js";
import type * as games from "../games.js";
import type * as helpers from "../helpers.js";
import type * as http from "../http.js";
import type * as init from "../init.js";
import type * as leaderboard from "../leaderboard.js";
import type * as maps from "../maps.js";
import type * as models from "../models.js";
import type * as multiplayerGames from "../multiplayerGames.js";
import type * as playerresults from "../playerresults.js";
import type * as prompts from "../prompts.js";
import type * as rateLimits from "../rateLimits.js";
import type * as results from "../results.js";
import type * as scores from "../scores.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  attempts: typeof attempts;
  auth: typeof auth;
  constants: typeof constants;
  crons: typeof crons;
  flags: typeof flags;
  games: typeof games;
  helpers: typeof helpers;
  http: typeof http;
  init: typeof init;
  leaderboard: typeof leaderboard;
  maps: typeof maps;
  models: typeof models;
  multiplayerGames: typeof multiplayerGames;
  playerresults: typeof playerresults;
  prompts: typeof prompts;
  rateLimits: typeof rateLimits;
  results: typeof results;
  scores: typeof scores;
  users: typeof users;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {
  rateLimiter: {
    lib: {
      checkRateLimit: FunctionReference<
        "query",
        "internal",
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          count?: number;
          key?: string;
          name: string;
          reserve?: boolean;
          throws?: boolean;
        },
        { ok: true; retryAfter?: number } | { ok: false; retryAfter: number }
      >;
      clearAll: FunctionReference<
        "mutation",
        "internal",
        { before?: number },
        null
      >;
      rateLimit: FunctionReference<
        "mutation",
        "internal",
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          count?: number;
          key?: string;
          name: string;
          reserve?: boolean;
          throws?: boolean;
        },
        { ok: true; retryAfter?: number } | { ok: false; retryAfter: number }
      >;
      resetRateLimit: FunctionReference<
        "mutation",
        "internal",
        { key?: string; name: string },
        null
      >;
    };
  };
};

/* prettier-ignore-end */
