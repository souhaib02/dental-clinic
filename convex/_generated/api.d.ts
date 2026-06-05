/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as appointments from "../appointments.js";
import type * as auth from "../auth.js";
import type * as auth_config from "../auth/config.js";
import type * as dashboard from "../dashboard.js";
import type * as invoices from "../invoices.js";
import type * as medicalRecords from "../medicalRecords.js";
import type * as patients from "../patients.js";
import type * as payments from "../payments.js";
import type * as seed from "../seed.js";
import type * as stock from "../stock.js";
import type * as suppliers from "../suppliers.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  appointments: typeof appointments;
  auth: typeof auth;
  "auth/config": typeof auth_config;
  dashboard: typeof dashboard;
  invoices: typeof invoices;
  medicalRecords: typeof medicalRecords;
  patients: typeof patients;
  payments: typeof payments;
  seed: typeof seed;
  stock: typeof stock;
  suppliers: typeof suppliers;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
