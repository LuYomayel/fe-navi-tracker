
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Activity
 * 
 */
export type Activity = $Result.DefaultSelection<Prisma.$ActivityPayload>
/**
 * Model DailyCompletion
 * 
 */
export type DailyCompletion = $Result.DefaultSelection<Prisma.$DailyCompletionPayload>
/**
 * Model DailyNote
 * 
 */
export type DailyNote = $Result.DefaultSelection<Prisma.$DailyNotePayload>
/**
 * Model UserPreferences
 * 
 */
export type UserPreferences = $Result.DefaultSelection<Prisma.$UserPreferencesPayload>
/**
 * Model WeeklyStreak
 * 
 */
export type WeeklyStreak = $Result.DefaultSelection<Prisma.$WeeklyStreakPayload>
/**
 * Model NutritionAnalysis
 * 
 */
export type NutritionAnalysis = $Result.DefaultSelection<Prisma.$NutritionAnalysisPayload>
/**
 * Model BodyAnalysis
 * 
 */
export type BodyAnalysis = $Result.DefaultSelection<Prisma.$BodyAnalysisPayload>
/**
 * Model AISuggestion
 * 
 */
export type AISuggestion = $Result.DefaultSelection<Prisma.$AISuggestionPayload>
/**
 * Model ChatMessage
 * 
 */
export type ChatMessage = $Result.DefaultSelection<Prisma.$ChatMessagePayload>
/**
 * Model CommentAnalysis
 * 
 */
export type CommentAnalysis = $Result.DefaultSelection<Prisma.$CommentAnalysisPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Activities
 * const activities = await prisma.activity.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Activities
   * const activities = await prisma.activity.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.activity`: Exposes CRUD operations for the **Activity** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Activities
    * const activities = await prisma.activity.findMany()
    * ```
    */
  get activity(): Prisma.ActivityDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.dailyCompletion`: Exposes CRUD operations for the **DailyCompletion** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DailyCompletions
    * const dailyCompletions = await prisma.dailyCompletion.findMany()
    * ```
    */
  get dailyCompletion(): Prisma.DailyCompletionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.dailyNote`: Exposes CRUD operations for the **DailyNote** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DailyNotes
    * const dailyNotes = await prisma.dailyNote.findMany()
    * ```
    */
  get dailyNote(): Prisma.DailyNoteDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userPreferences`: Exposes CRUD operations for the **UserPreferences** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserPreferences
    * const userPreferences = await prisma.userPreferences.findMany()
    * ```
    */
  get userPreferences(): Prisma.UserPreferencesDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.weeklyStreak`: Exposes CRUD operations for the **WeeklyStreak** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WeeklyStreaks
    * const weeklyStreaks = await prisma.weeklyStreak.findMany()
    * ```
    */
  get weeklyStreak(): Prisma.WeeklyStreakDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.nutritionAnalysis`: Exposes CRUD operations for the **NutritionAnalysis** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more NutritionAnalyses
    * const nutritionAnalyses = await prisma.nutritionAnalysis.findMany()
    * ```
    */
  get nutritionAnalysis(): Prisma.NutritionAnalysisDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.bodyAnalysis`: Exposes CRUD operations for the **BodyAnalysis** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more BodyAnalyses
    * const bodyAnalyses = await prisma.bodyAnalysis.findMany()
    * ```
    */
  get bodyAnalysis(): Prisma.BodyAnalysisDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.aISuggestion`: Exposes CRUD operations for the **AISuggestion** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AISuggestions
    * const aISuggestions = await prisma.aISuggestion.findMany()
    * ```
    */
  get aISuggestion(): Prisma.AISuggestionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.chatMessage`: Exposes CRUD operations for the **ChatMessage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ChatMessages
    * const chatMessages = await prisma.chatMessage.findMany()
    * ```
    */
  get chatMessage(): Prisma.ChatMessageDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.commentAnalysis`: Exposes CRUD operations for the **CommentAnalysis** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CommentAnalyses
    * const commentAnalyses = await prisma.commentAnalysis.findMany()
    * ```
    */
  get commentAnalysis(): Prisma.CommentAnalysisDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.10.1
   * Query Engine version: 9b628578b3b7cae625e8c927178f15a170e74a9c
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Activity: 'Activity',
    DailyCompletion: 'DailyCompletion',
    DailyNote: 'DailyNote',
    UserPreferences: 'UserPreferences',
    WeeklyStreak: 'WeeklyStreak',
    NutritionAnalysis: 'NutritionAnalysis',
    BodyAnalysis: 'BodyAnalysis',
    AISuggestion: 'AISuggestion',
    ChatMessage: 'ChatMessage',
    CommentAnalysis: 'CommentAnalysis'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "activity" | "dailyCompletion" | "dailyNote" | "userPreferences" | "weeklyStreak" | "nutritionAnalysis" | "bodyAnalysis" | "aISuggestion" | "chatMessage" | "commentAnalysis"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Activity: {
        payload: Prisma.$ActivityPayload<ExtArgs>
        fields: Prisma.ActivityFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ActivityFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ActivityFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityPayload>
          }
          findFirst: {
            args: Prisma.ActivityFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ActivityFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityPayload>
          }
          findMany: {
            args: Prisma.ActivityFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityPayload>[]
          }
          create: {
            args: Prisma.ActivityCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityPayload>
          }
          createMany: {
            args: Prisma.ActivityCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ActivityDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityPayload>
          }
          update: {
            args: Prisma.ActivityUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityPayload>
          }
          deleteMany: {
            args: Prisma.ActivityDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ActivityUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ActivityUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityPayload>
          }
          aggregate: {
            args: Prisma.ActivityAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateActivity>
          }
          groupBy: {
            args: Prisma.ActivityGroupByArgs<ExtArgs>
            result: $Utils.Optional<ActivityGroupByOutputType>[]
          }
          count: {
            args: Prisma.ActivityCountArgs<ExtArgs>
            result: $Utils.Optional<ActivityCountAggregateOutputType> | number
          }
        }
      }
      DailyCompletion: {
        payload: Prisma.$DailyCompletionPayload<ExtArgs>
        fields: Prisma.DailyCompletionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DailyCompletionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyCompletionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DailyCompletionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyCompletionPayload>
          }
          findFirst: {
            args: Prisma.DailyCompletionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyCompletionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DailyCompletionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyCompletionPayload>
          }
          findMany: {
            args: Prisma.DailyCompletionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyCompletionPayload>[]
          }
          create: {
            args: Prisma.DailyCompletionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyCompletionPayload>
          }
          createMany: {
            args: Prisma.DailyCompletionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.DailyCompletionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyCompletionPayload>
          }
          update: {
            args: Prisma.DailyCompletionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyCompletionPayload>
          }
          deleteMany: {
            args: Prisma.DailyCompletionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DailyCompletionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DailyCompletionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyCompletionPayload>
          }
          aggregate: {
            args: Prisma.DailyCompletionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDailyCompletion>
          }
          groupBy: {
            args: Prisma.DailyCompletionGroupByArgs<ExtArgs>
            result: $Utils.Optional<DailyCompletionGroupByOutputType>[]
          }
          count: {
            args: Prisma.DailyCompletionCountArgs<ExtArgs>
            result: $Utils.Optional<DailyCompletionCountAggregateOutputType> | number
          }
        }
      }
      DailyNote: {
        payload: Prisma.$DailyNotePayload<ExtArgs>
        fields: Prisma.DailyNoteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DailyNoteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyNotePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DailyNoteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyNotePayload>
          }
          findFirst: {
            args: Prisma.DailyNoteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyNotePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DailyNoteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyNotePayload>
          }
          findMany: {
            args: Prisma.DailyNoteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyNotePayload>[]
          }
          create: {
            args: Prisma.DailyNoteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyNotePayload>
          }
          createMany: {
            args: Prisma.DailyNoteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.DailyNoteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyNotePayload>
          }
          update: {
            args: Prisma.DailyNoteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyNotePayload>
          }
          deleteMany: {
            args: Prisma.DailyNoteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DailyNoteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DailyNoteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyNotePayload>
          }
          aggregate: {
            args: Prisma.DailyNoteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDailyNote>
          }
          groupBy: {
            args: Prisma.DailyNoteGroupByArgs<ExtArgs>
            result: $Utils.Optional<DailyNoteGroupByOutputType>[]
          }
          count: {
            args: Prisma.DailyNoteCountArgs<ExtArgs>
            result: $Utils.Optional<DailyNoteCountAggregateOutputType> | number
          }
        }
      }
      UserPreferences: {
        payload: Prisma.$UserPreferencesPayload<ExtArgs>
        fields: Prisma.UserPreferencesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserPreferencesFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPreferencesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserPreferencesFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPreferencesPayload>
          }
          findFirst: {
            args: Prisma.UserPreferencesFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPreferencesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserPreferencesFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPreferencesPayload>
          }
          findMany: {
            args: Prisma.UserPreferencesFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPreferencesPayload>[]
          }
          create: {
            args: Prisma.UserPreferencesCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPreferencesPayload>
          }
          createMany: {
            args: Prisma.UserPreferencesCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.UserPreferencesDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPreferencesPayload>
          }
          update: {
            args: Prisma.UserPreferencesUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPreferencesPayload>
          }
          deleteMany: {
            args: Prisma.UserPreferencesDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserPreferencesUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserPreferencesUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPreferencesPayload>
          }
          aggregate: {
            args: Prisma.UserPreferencesAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserPreferences>
          }
          groupBy: {
            args: Prisma.UserPreferencesGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserPreferencesGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserPreferencesCountArgs<ExtArgs>
            result: $Utils.Optional<UserPreferencesCountAggregateOutputType> | number
          }
        }
      }
      WeeklyStreak: {
        payload: Prisma.$WeeklyStreakPayload<ExtArgs>
        fields: Prisma.WeeklyStreakFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WeeklyStreakFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeeklyStreakPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WeeklyStreakFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeeklyStreakPayload>
          }
          findFirst: {
            args: Prisma.WeeklyStreakFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeeklyStreakPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WeeklyStreakFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeeklyStreakPayload>
          }
          findMany: {
            args: Prisma.WeeklyStreakFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeeklyStreakPayload>[]
          }
          create: {
            args: Prisma.WeeklyStreakCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeeklyStreakPayload>
          }
          createMany: {
            args: Prisma.WeeklyStreakCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.WeeklyStreakDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeeklyStreakPayload>
          }
          update: {
            args: Prisma.WeeklyStreakUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeeklyStreakPayload>
          }
          deleteMany: {
            args: Prisma.WeeklyStreakDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WeeklyStreakUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.WeeklyStreakUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WeeklyStreakPayload>
          }
          aggregate: {
            args: Prisma.WeeklyStreakAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWeeklyStreak>
          }
          groupBy: {
            args: Prisma.WeeklyStreakGroupByArgs<ExtArgs>
            result: $Utils.Optional<WeeklyStreakGroupByOutputType>[]
          }
          count: {
            args: Prisma.WeeklyStreakCountArgs<ExtArgs>
            result: $Utils.Optional<WeeklyStreakCountAggregateOutputType> | number
          }
        }
      }
      NutritionAnalysis: {
        payload: Prisma.$NutritionAnalysisPayload<ExtArgs>
        fields: Prisma.NutritionAnalysisFieldRefs
        operations: {
          findUnique: {
            args: Prisma.NutritionAnalysisFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NutritionAnalysisPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.NutritionAnalysisFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NutritionAnalysisPayload>
          }
          findFirst: {
            args: Prisma.NutritionAnalysisFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NutritionAnalysisPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.NutritionAnalysisFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NutritionAnalysisPayload>
          }
          findMany: {
            args: Prisma.NutritionAnalysisFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NutritionAnalysisPayload>[]
          }
          create: {
            args: Prisma.NutritionAnalysisCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NutritionAnalysisPayload>
          }
          createMany: {
            args: Prisma.NutritionAnalysisCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.NutritionAnalysisDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NutritionAnalysisPayload>
          }
          update: {
            args: Prisma.NutritionAnalysisUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NutritionAnalysisPayload>
          }
          deleteMany: {
            args: Prisma.NutritionAnalysisDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.NutritionAnalysisUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.NutritionAnalysisUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NutritionAnalysisPayload>
          }
          aggregate: {
            args: Prisma.NutritionAnalysisAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateNutritionAnalysis>
          }
          groupBy: {
            args: Prisma.NutritionAnalysisGroupByArgs<ExtArgs>
            result: $Utils.Optional<NutritionAnalysisGroupByOutputType>[]
          }
          count: {
            args: Prisma.NutritionAnalysisCountArgs<ExtArgs>
            result: $Utils.Optional<NutritionAnalysisCountAggregateOutputType> | number
          }
        }
      }
      BodyAnalysis: {
        payload: Prisma.$BodyAnalysisPayload<ExtArgs>
        fields: Prisma.BodyAnalysisFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BodyAnalysisFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BodyAnalysisPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BodyAnalysisFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BodyAnalysisPayload>
          }
          findFirst: {
            args: Prisma.BodyAnalysisFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BodyAnalysisPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BodyAnalysisFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BodyAnalysisPayload>
          }
          findMany: {
            args: Prisma.BodyAnalysisFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BodyAnalysisPayload>[]
          }
          create: {
            args: Prisma.BodyAnalysisCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BodyAnalysisPayload>
          }
          createMany: {
            args: Prisma.BodyAnalysisCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.BodyAnalysisDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BodyAnalysisPayload>
          }
          update: {
            args: Prisma.BodyAnalysisUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BodyAnalysisPayload>
          }
          deleteMany: {
            args: Prisma.BodyAnalysisDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BodyAnalysisUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.BodyAnalysisUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BodyAnalysisPayload>
          }
          aggregate: {
            args: Prisma.BodyAnalysisAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBodyAnalysis>
          }
          groupBy: {
            args: Prisma.BodyAnalysisGroupByArgs<ExtArgs>
            result: $Utils.Optional<BodyAnalysisGroupByOutputType>[]
          }
          count: {
            args: Prisma.BodyAnalysisCountArgs<ExtArgs>
            result: $Utils.Optional<BodyAnalysisCountAggregateOutputType> | number
          }
        }
      }
      AISuggestion: {
        payload: Prisma.$AISuggestionPayload<ExtArgs>
        fields: Prisma.AISuggestionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AISuggestionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AISuggestionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AISuggestionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AISuggestionPayload>
          }
          findFirst: {
            args: Prisma.AISuggestionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AISuggestionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AISuggestionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AISuggestionPayload>
          }
          findMany: {
            args: Prisma.AISuggestionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AISuggestionPayload>[]
          }
          create: {
            args: Prisma.AISuggestionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AISuggestionPayload>
          }
          createMany: {
            args: Prisma.AISuggestionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.AISuggestionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AISuggestionPayload>
          }
          update: {
            args: Prisma.AISuggestionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AISuggestionPayload>
          }
          deleteMany: {
            args: Prisma.AISuggestionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AISuggestionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AISuggestionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AISuggestionPayload>
          }
          aggregate: {
            args: Prisma.AISuggestionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAISuggestion>
          }
          groupBy: {
            args: Prisma.AISuggestionGroupByArgs<ExtArgs>
            result: $Utils.Optional<AISuggestionGroupByOutputType>[]
          }
          count: {
            args: Prisma.AISuggestionCountArgs<ExtArgs>
            result: $Utils.Optional<AISuggestionCountAggregateOutputType> | number
          }
        }
      }
      ChatMessage: {
        payload: Prisma.$ChatMessagePayload<ExtArgs>
        fields: Prisma.ChatMessageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ChatMessageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatMessagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ChatMessageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatMessagePayload>
          }
          findFirst: {
            args: Prisma.ChatMessageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatMessagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ChatMessageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatMessagePayload>
          }
          findMany: {
            args: Prisma.ChatMessageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatMessagePayload>[]
          }
          create: {
            args: Prisma.ChatMessageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatMessagePayload>
          }
          createMany: {
            args: Prisma.ChatMessageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ChatMessageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatMessagePayload>
          }
          update: {
            args: Prisma.ChatMessageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatMessagePayload>
          }
          deleteMany: {
            args: Prisma.ChatMessageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ChatMessageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ChatMessageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatMessagePayload>
          }
          aggregate: {
            args: Prisma.ChatMessageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateChatMessage>
          }
          groupBy: {
            args: Prisma.ChatMessageGroupByArgs<ExtArgs>
            result: $Utils.Optional<ChatMessageGroupByOutputType>[]
          }
          count: {
            args: Prisma.ChatMessageCountArgs<ExtArgs>
            result: $Utils.Optional<ChatMessageCountAggregateOutputType> | number
          }
        }
      }
      CommentAnalysis: {
        payload: Prisma.$CommentAnalysisPayload<ExtArgs>
        fields: Prisma.CommentAnalysisFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CommentAnalysisFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentAnalysisPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CommentAnalysisFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentAnalysisPayload>
          }
          findFirst: {
            args: Prisma.CommentAnalysisFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentAnalysisPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CommentAnalysisFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentAnalysisPayload>
          }
          findMany: {
            args: Prisma.CommentAnalysisFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentAnalysisPayload>[]
          }
          create: {
            args: Prisma.CommentAnalysisCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentAnalysisPayload>
          }
          createMany: {
            args: Prisma.CommentAnalysisCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.CommentAnalysisDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentAnalysisPayload>
          }
          update: {
            args: Prisma.CommentAnalysisUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentAnalysisPayload>
          }
          deleteMany: {
            args: Prisma.CommentAnalysisDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CommentAnalysisUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CommentAnalysisUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CommentAnalysisPayload>
          }
          aggregate: {
            args: Prisma.CommentAnalysisAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCommentAnalysis>
          }
          groupBy: {
            args: Prisma.CommentAnalysisGroupByArgs<ExtArgs>
            result: $Utils.Optional<CommentAnalysisGroupByOutputType>[]
          }
          count: {
            args: Prisma.CommentAnalysisCountArgs<ExtArgs>
            result: $Utils.Optional<CommentAnalysisCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    activity?: ActivityOmit
    dailyCompletion?: DailyCompletionOmit
    dailyNote?: DailyNoteOmit
    userPreferences?: UserPreferencesOmit
    weeklyStreak?: WeeklyStreakOmit
    nutritionAnalysis?: NutritionAnalysisOmit
    bodyAnalysis?: BodyAnalysisOmit
    aISuggestion?: AISuggestionOmit
    chatMessage?: ChatMessageOmit
    commentAnalysis?: CommentAnalysisOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type ActivityCountOutputType
   */

  export type ActivityCountOutputType = {
    completions: number
  }

  export type ActivityCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    completions?: boolean | ActivityCountOutputTypeCountCompletionsArgs
  }

  // Custom InputTypes
  /**
   * ActivityCountOutputType without action
   */
  export type ActivityCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityCountOutputType
     */
    select?: ActivityCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ActivityCountOutputType without action
   */
  export type ActivityCountOutputTypeCountCompletionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DailyCompletionWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Activity
   */

  export type AggregateActivity = {
    _count: ActivityCountAggregateOutputType | null
    _min: ActivityMinAggregateOutputType | null
    _max: ActivityMaxAggregateOutputType | null
  }

  export type ActivityMinAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    time: string | null
    color: string | null
    category: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ActivityMaxAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    time: string | null
    color: string | null
    category: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ActivityCountAggregateOutputType = {
    id: number
    name: number
    description: number
    time: number
    days: number
    color: number
    category: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ActivityMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    time?: true
    color?: true
    category?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ActivityMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    time?: true
    color?: true
    category?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ActivityCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    time?: true
    days?: true
    color?: true
    category?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ActivityAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Activity to aggregate.
     */
    where?: ActivityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Activities to fetch.
     */
    orderBy?: ActivityOrderByWithRelationInput | ActivityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ActivityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Activities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Activities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Activities
    **/
    _count?: true | ActivityCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ActivityMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ActivityMaxAggregateInputType
  }

  export type GetActivityAggregateType<T extends ActivityAggregateArgs> = {
        [P in keyof T & keyof AggregateActivity]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateActivity[P]>
      : GetScalarType<T[P], AggregateActivity[P]>
  }




  export type ActivityGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ActivityWhereInput
    orderBy?: ActivityOrderByWithAggregationInput | ActivityOrderByWithAggregationInput[]
    by: ActivityScalarFieldEnum[] | ActivityScalarFieldEnum
    having?: ActivityScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ActivityCountAggregateInputType | true
    _min?: ActivityMinAggregateInputType
    _max?: ActivityMaxAggregateInputType
  }

  export type ActivityGroupByOutputType = {
    id: string
    name: string
    description: string | null
    time: string | null
    days: JsonValue
    color: string
    category: string | null
    createdAt: Date
    updatedAt: Date
    _count: ActivityCountAggregateOutputType | null
    _min: ActivityMinAggregateOutputType | null
    _max: ActivityMaxAggregateOutputType | null
  }

  type GetActivityGroupByPayload<T extends ActivityGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ActivityGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ActivityGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ActivityGroupByOutputType[P]>
            : GetScalarType<T[P], ActivityGroupByOutputType[P]>
        }
      >
    >


  export type ActivitySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    time?: boolean
    days?: boolean
    color?: boolean
    category?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    completions?: boolean | Activity$completionsArgs<ExtArgs>
    _count?: boolean | ActivityCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["activity"]>



  export type ActivitySelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    time?: boolean
    days?: boolean
    color?: boolean
    category?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ActivityOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "description" | "time" | "days" | "color" | "category" | "createdAt" | "updatedAt", ExtArgs["result"]["activity"]>
  export type ActivityInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    completions?: boolean | Activity$completionsArgs<ExtArgs>
    _count?: boolean | ActivityCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $ActivityPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Activity"
    objects: {
      completions: Prisma.$DailyCompletionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      description: string | null
      time: string | null
      days: Prisma.JsonValue
      color: string
      category: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["activity"]>
    composites: {}
  }

  type ActivityGetPayload<S extends boolean | null | undefined | ActivityDefaultArgs> = $Result.GetResult<Prisma.$ActivityPayload, S>

  type ActivityCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ActivityFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ActivityCountAggregateInputType | true
    }

  export interface ActivityDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Activity'], meta: { name: 'Activity' } }
    /**
     * Find zero or one Activity that matches the filter.
     * @param {ActivityFindUniqueArgs} args - Arguments to find a Activity
     * @example
     * // Get one Activity
     * const activity = await prisma.activity.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ActivityFindUniqueArgs>(args: SelectSubset<T, ActivityFindUniqueArgs<ExtArgs>>): Prisma__ActivityClient<$Result.GetResult<Prisma.$ActivityPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Activity that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ActivityFindUniqueOrThrowArgs} args - Arguments to find a Activity
     * @example
     * // Get one Activity
     * const activity = await prisma.activity.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ActivityFindUniqueOrThrowArgs>(args: SelectSubset<T, ActivityFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ActivityClient<$Result.GetResult<Prisma.$ActivityPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Activity that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityFindFirstArgs} args - Arguments to find a Activity
     * @example
     * // Get one Activity
     * const activity = await prisma.activity.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ActivityFindFirstArgs>(args?: SelectSubset<T, ActivityFindFirstArgs<ExtArgs>>): Prisma__ActivityClient<$Result.GetResult<Prisma.$ActivityPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Activity that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityFindFirstOrThrowArgs} args - Arguments to find a Activity
     * @example
     * // Get one Activity
     * const activity = await prisma.activity.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ActivityFindFirstOrThrowArgs>(args?: SelectSubset<T, ActivityFindFirstOrThrowArgs<ExtArgs>>): Prisma__ActivityClient<$Result.GetResult<Prisma.$ActivityPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Activities that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Activities
     * const activities = await prisma.activity.findMany()
     * 
     * // Get first 10 Activities
     * const activities = await prisma.activity.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const activityWithIdOnly = await prisma.activity.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ActivityFindManyArgs>(args?: SelectSubset<T, ActivityFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ActivityPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Activity.
     * @param {ActivityCreateArgs} args - Arguments to create a Activity.
     * @example
     * // Create one Activity
     * const Activity = await prisma.activity.create({
     *   data: {
     *     // ... data to create a Activity
     *   }
     * })
     * 
     */
    create<T extends ActivityCreateArgs>(args: SelectSubset<T, ActivityCreateArgs<ExtArgs>>): Prisma__ActivityClient<$Result.GetResult<Prisma.$ActivityPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Activities.
     * @param {ActivityCreateManyArgs} args - Arguments to create many Activities.
     * @example
     * // Create many Activities
     * const activity = await prisma.activity.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ActivityCreateManyArgs>(args?: SelectSubset<T, ActivityCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Activity.
     * @param {ActivityDeleteArgs} args - Arguments to delete one Activity.
     * @example
     * // Delete one Activity
     * const Activity = await prisma.activity.delete({
     *   where: {
     *     // ... filter to delete one Activity
     *   }
     * })
     * 
     */
    delete<T extends ActivityDeleteArgs>(args: SelectSubset<T, ActivityDeleteArgs<ExtArgs>>): Prisma__ActivityClient<$Result.GetResult<Prisma.$ActivityPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Activity.
     * @param {ActivityUpdateArgs} args - Arguments to update one Activity.
     * @example
     * // Update one Activity
     * const activity = await prisma.activity.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ActivityUpdateArgs>(args: SelectSubset<T, ActivityUpdateArgs<ExtArgs>>): Prisma__ActivityClient<$Result.GetResult<Prisma.$ActivityPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Activities.
     * @param {ActivityDeleteManyArgs} args - Arguments to filter Activities to delete.
     * @example
     * // Delete a few Activities
     * const { count } = await prisma.activity.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ActivityDeleteManyArgs>(args?: SelectSubset<T, ActivityDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Activities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Activities
     * const activity = await prisma.activity.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ActivityUpdateManyArgs>(args: SelectSubset<T, ActivityUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Activity.
     * @param {ActivityUpsertArgs} args - Arguments to update or create a Activity.
     * @example
     * // Update or create a Activity
     * const activity = await prisma.activity.upsert({
     *   create: {
     *     // ... data to create a Activity
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Activity we want to update
     *   }
     * })
     */
    upsert<T extends ActivityUpsertArgs>(args: SelectSubset<T, ActivityUpsertArgs<ExtArgs>>): Prisma__ActivityClient<$Result.GetResult<Prisma.$ActivityPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Activities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityCountArgs} args - Arguments to filter Activities to count.
     * @example
     * // Count the number of Activities
     * const count = await prisma.activity.count({
     *   where: {
     *     // ... the filter for the Activities we want to count
     *   }
     * })
    **/
    count<T extends ActivityCountArgs>(
      args?: Subset<T, ActivityCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ActivityCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Activity.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ActivityAggregateArgs>(args: Subset<T, ActivityAggregateArgs>): Prisma.PrismaPromise<GetActivityAggregateType<T>>

    /**
     * Group by Activity.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ActivityGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ActivityGroupByArgs['orderBy'] }
        : { orderBy?: ActivityGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ActivityGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetActivityGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Activity model
   */
  readonly fields: ActivityFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Activity.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ActivityClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    completions<T extends Activity$completionsArgs<ExtArgs> = {}>(args?: Subset<T, Activity$completionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DailyCompletionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Activity model
   */
  interface ActivityFieldRefs {
    readonly id: FieldRef<"Activity", 'String'>
    readonly name: FieldRef<"Activity", 'String'>
    readonly description: FieldRef<"Activity", 'String'>
    readonly time: FieldRef<"Activity", 'String'>
    readonly days: FieldRef<"Activity", 'Json'>
    readonly color: FieldRef<"Activity", 'String'>
    readonly category: FieldRef<"Activity", 'String'>
    readonly createdAt: FieldRef<"Activity", 'DateTime'>
    readonly updatedAt: FieldRef<"Activity", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Activity findUnique
   */
  export type ActivityFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Activity
     */
    select?: ActivitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Activity
     */
    omit?: ActivityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityInclude<ExtArgs> | null
    /**
     * Filter, which Activity to fetch.
     */
    where: ActivityWhereUniqueInput
  }

  /**
   * Activity findUniqueOrThrow
   */
  export type ActivityFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Activity
     */
    select?: ActivitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Activity
     */
    omit?: ActivityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityInclude<ExtArgs> | null
    /**
     * Filter, which Activity to fetch.
     */
    where: ActivityWhereUniqueInput
  }

  /**
   * Activity findFirst
   */
  export type ActivityFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Activity
     */
    select?: ActivitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Activity
     */
    omit?: ActivityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityInclude<ExtArgs> | null
    /**
     * Filter, which Activity to fetch.
     */
    where?: ActivityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Activities to fetch.
     */
    orderBy?: ActivityOrderByWithRelationInput | ActivityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Activities.
     */
    cursor?: ActivityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Activities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Activities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Activities.
     */
    distinct?: ActivityScalarFieldEnum | ActivityScalarFieldEnum[]
  }

  /**
   * Activity findFirstOrThrow
   */
  export type ActivityFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Activity
     */
    select?: ActivitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Activity
     */
    omit?: ActivityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityInclude<ExtArgs> | null
    /**
     * Filter, which Activity to fetch.
     */
    where?: ActivityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Activities to fetch.
     */
    orderBy?: ActivityOrderByWithRelationInput | ActivityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Activities.
     */
    cursor?: ActivityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Activities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Activities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Activities.
     */
    distinct?: ActivityScalarFieldEnum | ActivityScalarFieldEnum[]
  }

  /**
   * Activity findMany
   */
  export type ActivityFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Activity
     */
    select?: ActivitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Activity
     */
    omit?: ActivityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityInclude<ExtArgs> | null
    /**
     * Filter, which Activities to fetch.
     */
    where?: ActivityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Activities to fetch.
     */
    orderBy?: ActivityOrderByWithRelationInput | ActivityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Activities.
     */
    cursor?: ActivityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Activities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Activities.
     */
    skip?: number
    distinct?: ActivityScalarFieldEnum | ActivityScalarFieldEnum[]
  }

  /**
   * Activity create
   */
  export type ActivityCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Activity
     */
    select?: ActivitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Activity
     */
    omit?: ActivityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityInclude<ExtArgs> | null
    /**
     * The data needed to create a Activity.
     */
    data: XOR<ActivityCreateInput, ActivityUncheckedCreateInput>
  }

  /**
   * Activity createMany
   */
  export type ActivityCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Activities.
     */
    data: ActivityCreateManyInput | ActivityCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Activity update
   */
  export type ActivityUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Activity
     */
    select?: ActivitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Activity
     */
    omit?: ActivityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityInclude<ExtArgs> | null
    /**
     * The data needed to update a Activity.
     */
    data: XOR<ActivityUpdateInput, ActivityUncheckedUpdateInput>
    /**
     * Choose, which Activity to update.
     */
    where: ActivityWhereUniqueInput
  }

  /**
   * Activity updateMany
   */
  export type ActivityUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Activities.
     */
    data: XOR<ActivityUpdateManyMutationInput, ActivityUncheckedUpdateManyInput>
    /**
     * Filter which Activities to update
     */
    where?: ActivityWhereInput
    /**
     * Limit how many Activities to update.
     */
    limit?: number
  }

  /**
   * Activity upsert
   */
  export type ActivityUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Activity
     */
    select?: ActivitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Activity
     */
    omit?: ActivityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityInclude<ExtArgs> | null
    /**
     * The filter to search for the Activity to update in case it exists.
     */
    where: ActivityWhereUniqueInput
    /**
     * In case the Activity found by the `where` argument doesn't exist, create a new Activity with this data.
     */
    create: XOR<ActivityCreateInput, ActivityUncheckedCreateInput>
    /**
     * In case the Activity was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ActivityUpdateInput, ActivityUncheckedUpdateInput>
  }

  /**
   * Activity delete
   */
  export type ActivityDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Activity
     */
    select?: ActivitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Activity
     */
    omit?: ActivityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityInclude<ExtArgs> | null
    /**
     * Filter which Activity to delete.
     */
    where: ActivityWhereUniqueInput
  }

  /**
   * Activity deleteMany
   */
  export type ActivityDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Activities to delete
     */
    where?: ActivityWhereInput
    /**
     * Limit how many Activities to delete.
     */
    limit?: number
  }

  /**
   * Activity.completions
   */
  export type Activity$completionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyCompletion
     */
    select?: DailyCompletionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyCompletion
     */
    omit?: DailyCompletionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyCompletionInclude<ExtArgs> | null
    where?: DailyCompletionWhereInput
    orderBy?: DailyCompletionOrderByWithRelationInput | DailyCompletionOrderByWithRelationInput[]
    cursor?: DailyCompletionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DailyCompletionScalarFieldEnum | DailyCompletionScalarFieldEnum[]
  }

  /**
   * Activity without action
   */
  export type ActivityDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Activity
     */
    select?: ActivitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Activity
     */
    omit?: ActivityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivityInclude<ExtArgs> | null
  }


  /**
   * Model DailyCompletion
   */

  export type AggregateDailyCompletion = {
    _count: DailyCompletionCountAggregateOutputType | null
    _min: DailyCompletionMinAggregateOutputType | null
    _max: DailyCompletionMaxAggregateOutputType | null
  }

  export type DailyCompletionMinAggregateOutputType = {
    id: string | null
    activityId: string | null
    date: string | null
    completed: boolean | null
    notes: string | null
    createdAt: Date | null
  }

  export type DailyCompletionMaxAggregateOutputType = {
    id: string | null
    activityId: string | null
    date: string | null
    completed: boolean | null
    notes: string | null
    createdAt: Date | null
  }

  export type DailyCompletionCountAggregateOutputType = {
    id: number
    activityId: number
    date: number
    completed: number
    notes: number
    createdAt: number
    _all: number
  }


  export type DailyCompletionMinAggregateInputType = {
    id?: true
    activityId?: true
    date?: true
    completed?: true
    notes?: true
    createdAt?: true
  }

  export type DailyCompletionMaxAggregateInputType = {
    id?: true
    activityId?: true
    date?: true
    completed?: true
    notes?: true
    createdAt?: true
  }

  export type DailyCompletionCountAggregateInputType = {
    id?: true
    activityId?: true
    date?: true
    completed?: true
    notes?: true
    createdAt?: true
    _all?: true
  }

  export type DailyCompletionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DailyCompletion to aggregate.
     */
    where?: DailyCompletionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailyCompletions to fetch.
     */
    orderBy?: DailyCompletionOrderByWithRelationInput | DailyCompletionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DailyCompletionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailyCompletions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailyCompletions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DailyCompletions
    **/
    _count?: true | DailyCompletionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DailyCompletionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DailyCompletionMaxAggregateInputType
  }

  export type GetDailyCompletionAggregateType<T extends DailyCompletionAggregateArgs> = {
        [P in keyof T & keyof AggregateDailyCompletion]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDailyCompletion[P]>
      : GetScalarType<T[P], AggregateDailyCompletion[P]>
  }




  export type DailyCompletionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DailyCompletionWhereInput
    orderBy?: DailyCompletionOrderByWithAggregationInput | DailyCompletionOrderByWithAggregationInput[]
    by: DailyCompletionScalarFieldEnum[] | DailyCompletionScalarFieldEnum
    having?: DailyCompletionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DailyCompletionCountAggregateInputType | true
    _min?: DailyCompletionMinAggregateInputType
    _max?: DailyCompletionMaxAggregateInputType
  }

  export type DailyCompletionGroupByOutputType = {
    id: string
    activityId: string
    date: string
    completed: boolean
    notes: string | null
    createdAt: Date
    _count: DailyCompletionCountAggregateOutputType | null
    _min: DailyCompletionMinAggregateOutputType | null
    _max: DailyCompletionMaxAggregateOutputType | null
  }

  type GetDailyCompletionGroupByPayload<T extends DailyCompletionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DailyCompletionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DailyCompletionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DailyCompletionGroupByOutputType[P]>
            : GetScalarType<T[P], DailyCompletionGroupByOutputType[P]>
        }
      >
    >


  export type DailyCompletionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    activityId?: boolean
    date?: boolean
    completed?: boolean
    notes?: boolean
    createdAt?: boolean
    activity?: boolean | ActivityDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["dailyCompletion"]>



  export type DailyCompletionSelectScalar = {
    id?: boolean
    activityId?: boolean
    date?: boolean
    completed?: boolean
    notes?: boolean
    createdAt?: boolean
  }

  export type DailyCompletionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "activityId" | "date" | "completed" | "notes" | "createdAt", ExtArgs["result"]["dailyCompletion"]>
  export type DailyCompletionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    activity?: boolean | ActivityDefaultArgs<ExtArgs>
  }

  export type $DailyCompletionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DailyCompletion"
    objects: {
      activity: Prisma.$ActivityPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      activityId: string
      date: string
      completed: boolean
      notes: string | null
      createdAt: Date
    }, ExtArgs["result"]["dailyCompletion"]>
    composites: {}
  }

  type DailyCompletionGetPayload<S extends boolean | null | undefined | DailyCompletionDefaultArgs> = $Result.GetResult<Prisma.$DailyCompletionPayload, S>

  type DailyCompletionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DailyCompletionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DailyCompletionCountAggregateInputType | true
    }

  export interface DailyCompletionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DailyCompletion'], meta: { name: 'DailyCompletion' } }
    /**
     * Find zero or one DailyCompletion that matches the filter.
     * @param {DailyCompletionFindUniqueArgs} args - Arguments to find a DailyCompletion
     * @example
     * // Get one DailyCompletion
     * const dailyCompletion = await prisma.dailyCompletion.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DailyCompletionFindUniqueArgs>(args: SelectSubset<T, DailyCompletionFindUniqueArgs<ExtArgs>>): Prisma__DailyCompletionClient<$Result.GetResult<Prisma.$DailyCompletionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DailyCompletion that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DailyCompletionFindUniqueOrThrowArgs} args - Arguments to find a DailyCompletion
     * @example
     * // Get one DailyCompletion
     * const dailyCompletion = await prisma.dailyCompletion.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DailyCompletionFindUniqueOrThrowArgs>(args: SelectSubset<T, DailyCompletionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DailyCompletionClient<$Result.GetResult<Prisma.$DailyCompletionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DailyCompletion that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyCompletionFindFirstArgs} args - Arguments to find a DailyCompletion
     * @example
     * // Get one DailyCompletion
     * const dailyCompletion = await prisma.dailyCompletion.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DailyCompletionFindFirstArgs>(args?: SelectSubset<T, DailyCompletionFindFirstArgs<ExtArgs>>): Prisma__DailyCompletionClient<$Result.GetResult<Prisma.$DailyCompletionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DailyCompletion that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyCompletionFindFirstOrThrowArgs} args - Arguments to find a DailyCompletion
     * @example
     * // Get one DailyCompletion
     * const dailyCompletion = await prisma.dailyCompletion.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DailyCompletionFindFirstOrThrowArgs>(args?: SelectSubset<T, DailyCompletionFindFirstOrThrowArgs<ExtArgs>>): Prisma__DailyCompletionClient<$Result.GetResult<Prisma.$DailyCompletionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DailyCompletions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyCompletionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DailyCompletions
     * const dailyCompletions = await prisma.dailyCompletion.findMany()
     * 
     * // Get first 10 DailyCompletions
     * const dailyCompletions = await prisma.dailyCompletion.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const dailyCompletionWithIdOnly = await prisma.dailyCompletion.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DailyCompletionFindManyArgs>(args?: SelectSubset<T, DailyCompletionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DailyCompletionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DailyCompletion.
     * @param {DailyCompletionCreateArgs} args - Arguments to create a DailyCompletion.
     * @example
     * // Create one DailyCompletion
     * const DailyCompletion = await prisma.dailyCompletion.create({
     *   data: {
     *     // ... data to create a DailyCompletion
     *   }
     * })
     * 
     */
    create<T extends DailyCompletionCreateArgs>(args: SelectSubset<T, DailyCompletionCreateArgs<ExtArgs>>): Prisma__DailyCompletionClient<$Result.GetResult<Prisma.$DailyCompletionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DailyCompletions.
     * @param {DailyCompletionCreateManyArgs} args - Arguments to create many DailyCompletions.
     * @example
     * // Create many DailyCompletions
     * const dailyCompletion = await prisma.dailyCompletion.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DailyCompletionCreateManyArgs>(args?: SelectSubset<T, DailyCompletionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a DailyCompletion.
     * @param {DailyCompletionDeleteArgs} args - Arguments to delete one DailyCompletion.
     * @example
     * // Delete one DailyCompletion
     * const DailyCompletion = await prisma.dailyCompletion.delete({
     *   where: {
     *     // ... filter to delete one DailyCompletion
     *   }
     * })
     * 
     */
    delete<T extends DailyCompletionDeleteArgs>(args: SelectSubset<T, DailyCompletionDeleteArgs<ExtArgs>>): Prisma__DailyCompletionClient<$Result.GetResult<Prisma.$DailyCompletionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DailyCompletion.
     * @param {DailyCompletionUpdateArgs} args - Arguments to update one DailyCompletion.
     * @example
     * // Update one DailyCompletion
     * const dailyCompletion = await prisma.dailyCompletion.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DailyCompletionUpdateArgs>(args: SelectSubset<T, DailyCompletionUpdateArgs<ExtArgs>>): Prisma__DailyCompletionClient<$Result.GetResult<Prisma.$DailyCompletionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DailyCompletions.
     * @param {DailyCompletionDeleteManyArgs} args - Arguments to filter DailyCompletions to delete.
     * @example
     * // Delete a few DailyCompletions
     * const { count } = await prisma.dailyCompletion.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DailyCompletionDeleteManyArgs>(args?: SelectSubset<T, DailyCompletionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DailyCompletions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyCompletionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DailyCompletions
     * const dailyCompletion = await prisma.dailyCompletion.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DailyCompletionUpdateManyArgs>(args: SelectSubset<T, DailyCompletionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one DailyCompletion.
     * @param {DailyCompletionUpsertArgs} args - Arguments to update or create a DailyCompletion.
     * @example
     * // Update or create a DailyCompletion
     * const dailyCompletion = await prisma.dailyCompletion.upsert({
     *   create: {
     *     // ... data to create a DailyCompletion
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DailyCompletion we want to update
     *   }
     * })
     */
    upsert<T extends DailyCompletionUpsertArgs>(args: SelectSubset<T, DailyCompletionUpsertArgs<ExtArgs>>): Prisma__DailyCompletionClient<$Result.GetResult<Prisma.$DailyCompletionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DailyCompletions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyCompletionCountArgs} args - Arguments to filter DailyCompletions to count.
     * @example
     * // Count the number of DailyCompletions
     * const count = await prisma.dailyCompletion.count({
     *   where: {
     *     // ... the filter for the DailyCompletions we want to count
     *   }
     * })
    **/
    count<T extends DailyCompletionCountArgs>(
      args?: Subset<T, DailyCompletionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DailyCompletionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DailyCompletion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyCompletionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DailyCompletionAggregateArgs>(args: Subset<T, DailyCompletionAggregateArgs>): Prisma.PrismaPromise<GetDailyCompletionAggregateType<T>>

    /**
     * Group by DailyCompletion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyCompletionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DailyCompletionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DailyCompletionGroupByArgs['orderBy'] }
        : { orderBy?: DailyCompletionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DailyCompletionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDailyCompletionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DailyCompletion model
   */
  readonly fields: DailyCompletionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DailyCompletion.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DailyCompletionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    activity<T extends ActivityDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ActivityDefaultArgs<ExtArgs>>): Prisma__ActivityClient<$Result.GetResult<Prisma.$ActivityPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DailyCompletion model
   */
  interface DailyCompletionFieldRefs {
    readonly id: FieldRef<"DailyCompletion", 'String'>
    readonly activityId: FieldRef<"DailyCompletion", 'String'>
    readonly date: FieldRef<"DailyCompletion", 'String'>
    readonly completed: FieldRef<"DailyCompletion", 'Boolean'>
    readonly notes: FieldRef<"DailyCompletion", 'String'>
    readonly createdAt: FieldRef<"DailyCompletion", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DailyCompletion findUnique
   */
  export type DailyCompletionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyCompletion
     */
    select?: DailyCompletionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyCompletion
     */
    omit?: DailyCompletionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyCompletionInclude<ExtArgs> | null
    /**
     * Filter, which DailyCompletion to fetch.
     */
    where: DailyCompletionWhereUniqueInput
  }

  /**
   * DailyCompletion findUniqueOrThrow
   */
  export type DailyCompletionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyCompletion
     */
    select?: DailyCompletionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyCompletion
     */
    omit?: DailyCompletionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyCompletionInclude<ExtArgs> | null
    /**
     * Filter, which DailyCompletion to fetch.
     */
    where: DailyCompletionWhereUniqueInput
  }

  /**
   * DailyCompletion findFirst
   */
  export type DailyCompletionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyCompletion
     */
    select?: DailyCompletionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyCompletion
     */
    omit?: DailyCompletionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyCompletionInclude<ExtArgs> | null
    /**
     * Filter, which DailyCompletion to fetch.
     */
    where?: DailyCompletionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailyCompletions to fetch.
     */
    orderBy?: DailyCompletionOrderByWithRelationInput | DailyCompletionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DailyCompletions.
     */
    cursor?: DailyCompletionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailyCompletions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailyCompletions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DailyCompletions.
     */
    distinct?: DailyCompletionScalarFieldEnum | DailyCompletionScalarFieldEnum[]
  }

  /**
   * DailyCompletion findFirstOrThrow
   */
  export type DailyCompletionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyCompletion
     */
    select?: DailyCompletionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyCompletion
     */
    omit?: DailyCompletionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyCompletionInclude<ExtArgs> | null
    /**
     * Filter, which DailyCompletion to fetch.
     */
    where?: DailyCompletionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailyCompletions to fetch.
     */
    orderBy?: DailyCompletionOrderByWithRelationInput | DailyCompletionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DailyCompletions.
     */
    cursor?: DailyCompletionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailyCompletions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailyCompletions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DailyCompletions.
     */
    distinct?: DailyCompletionScalarFieldEnum | DailyCompletionScalarFieldEnum[]
  }

  /**
   * DailyCompletion findMany
   */
  export type DailyCompletionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyCompletion
     */
    select?: DailyCompletionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyCompletion
     */
    omit?: DailyCompletionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyCompletionInclude<ExtArgs> | null
    /**
     * Filter, which DailyCompletions to fetch.
     */
    where?: DailyCompletionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailyCompletions to fetch.
     */
    orderBy?: DailyCompletionOrderByWithRelationInput | DailyCompletionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DailyCompletions.
     */
    cursor?: DailyCompletionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailyCompletions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailyCompletions.
     */
    skip?: number
    distinct?: DailyCompletionScalarFieldEnum | DailyCompletionScalarFieldEnum[]
  }

  /**
   * DailyCompletion create
   */
  export type DailyCompletionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyCompletion
     */
    select?: DailyCompletionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyCompletion
     */
    omit?: DailyCompletionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyCompletionInclude<ExtArgs> | null
    /**
     * The data needed to create a DailyCompletion.
     */
    data: XOR<DailyCompletionCreateInput, DailyCompletionUncheckedCreateInput>
  }

  /**
   * DailyCompletion createMany
   */
  export type DailyCompletionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DailyCompletions.
     */
    data: DailyCompletionCreateManyInput | DailyCompletionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DailyCompletion update
   */
  export type DailyCompletionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyCompletion
     */
    select?: DailyCompletionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyCompletion
     */
    omit?: DailyCompletionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyCompletionInclude<ExtArgs> | null
    /**
     * The data needed to update a DailyCompletion.
     */
    data: XOR<DailyCompletionUpdateInput, DailyCompletionUncheckedUpdateInput>
    /**
     * Choose, which DailyCompletion to update.
     */
    where: DailyCompletionWhereUniqueInput
  }

  /**
   * DailyCompletion updateMany
   */
  export type DailyCompletionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DailyCompletions.
     */
    data: XOR<DailyCompletionUpdateManyMutationInput, DailyCompletionUncheckedUpdateManyInput>
    /**
     * Filter which DailyCompletions to update
     */
    where?: DailyCompletionWhereInput
    /**
     * Limit how many DailyCompletions to update.
     */
    limit?: number
  }

  /**
   * DailyCompletion upsert
   */
  export type DailyCompletionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyCompletion
     */
    select?: DailyCompletionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyCompletion
     */
    omit?: DailyCompletionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyCompletionInclude<ExtArgs> | null
    /**
     * The filter to search for the DailyCompletion to update in case it exists.
     */
    where: DailyCompletionWhereUniqueInput
    /**
     * In case the DailyCompletion found by the `where` argument doesn't exist, create a new DailyCompletion with this data.
     */
    create: XOR<DailyCompletionCreateInput, DailyCompletionUncheckedCreateInput>
    /**
     * In case the DailyCompletion was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DailyCompletionUpdateInput, DailyCompletionUncheckedUpdateInput>
  }

  /**
   * DailyCompletion delete
   */
  export type DailyCompletionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyCompletion
     */
    select?: DailyCompletionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyCompletion
     */
    omit?: DailyCompletionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyCompletionInclude<ExtArgs> | null
    /**
     * Filter which DailyCompletion to delete.
     */
    where: DailyCompletionWhereUniqueInput
  }

  /**
   * DailyCompletion deleteMany
   */
  export type DailyCompletionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DailyCompletions to delete
     */
    where?: DailyCompletionWhereInput
    /**
     * Limit how many DailyCompletions to delete.
     */
    limit?: number
  }

  /**
   * DailyCompletion without action
   */
  export type DailyCompletionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyCompletion
     */
    select?: DailyCompletionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyCompletion
     */
    omit?: DailyCompletionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DailyCompletionInclude<ExtArgs> | null
  }


  /**
   * Model DailyNote
   */

  export type AggregateDailyNote = {
    _count: DailyNoteCountAggregateOutputType | null
    _avg: DailyNoteAvgAggregateOutputType | null
    _sum: DailyNoteSumAggregateOutputType | null
    _min: DailyNoteMinAggregateOutputType | null
    _max: DailyNoteMaxAggregateOutputType | null
  }

  export type DailyNoteAvgAggregateOutputType = {
    mood: number | null
  }

  export type DailyNoteSumAggregateOutputType = {
    mood: number | null
  }

  export type DailyNoteMinAggregateOutputType = {
    id: string | null
    date: string | null
    content: string | null
    mood: number | null
    customComment: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DailyNoteMaxAggregateOutputType = {
    id: string | null
    date: string | null
    content: string | null
    mood: number | null
    customComment: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DailyNoteCountAggregateOutputType = {
    id: number
    date: number
    content: number
    mood: number
    predefinedComments: number
    customComment: number
    aiAnalysis: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type DailyNoteAvgAggregateInputType = {
    mood?: true
  }

  export type DailyNoteSumAggregateInputType = {
    mood?: true
  }

  export type DailyNoteMinAggregateInputType = {
    id?: true
    date?: true
    content?: true
    mood?: true
    customComment?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DailyNoteMaxAggregateInputType = {
    id?: true
    date?: true
    content?: true
    mood?: true
    customComment?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DailyNoteCountAggregateInputType = {
    id?: true
    date?: true
    content?: true
    mood?: true
    predefinedComments?: true
    customComment?: true
    aiAnalysis?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type DailyNoteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DailyNote to aggregate.
     */
    where?: DailyNoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailyNotes to fetch.
     */
    orderBy?: DailyNoteOrderByWithRelationInput | DailyNoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DailyNoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailyNotes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailyNotes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DailyNotes
    **/
    _count?: true | DailyNoteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DailyNoteAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DailyNoteSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DailyNoteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DailyNoteMaxAggregateInputType
  }

  export type GetDailyNoteAggregateType<T extends DailyNoteAggregateArgs> = {
        [P in keyof T & keyof AggregateDailyNote]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDailyNote[P]>
      : GetScalarType<T[P], AggregateDailyNote[P]>
  }




  export type DailyNoteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DailyNoteWhereInput
    orderBy?: DailyNoteOrderByWithAggregationInput | DailyNoteOrderByWithAggregationInput[]
    by: DailyNoteScalarFieldEnum[] | DailyNoteScalarFieldEnum
    having?: DailyNoteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DailyNoteCountAggregateInputType | true
    _avg?: DailyNoteAvgAggregateInputType
    _sum?: DailyNoteSumAggregateInputType
    _min?: DailyNoteMinAggregateInputType
    _max?: DailyNoteMaxAggregateInputType
  }

  export type DailyNoteGroupByOutputType = {
    id: string
    date: string
    content: string
    mood: number | null
    predefinedComments: JsonValue | null
    customComment: string | null
    aiAnalysis: JsonValue | null
    createdAt: Date
    updatedAt: Date
    _count: DailyNoteCountAggregateOutputType | null
    _avg: DailyNoteAvgAggregateOutputType | null
    _sum: DailyNoteSumAggregateOutputType | null
    _min: DailyNoteMinAggregateOutputType | null
    _max: DailyNoteMaxAggregateOutputType | null
  }

  type GetDailyNoteGroupByPayload<T extends DailyNoteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DailyNoteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DailyNoteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DailyNoteGroupByOutputType[P]>
            : GetScalarType<T[P], DailyNoteGroupByOutputType[P]>
        }
      >
    >


  export type DailyNoteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    content?: boolean
    mood?: boolean
    predefinedComments?: boolean
    customComment?: boolean
    aiAnalysis?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["dailyNote"]>



  export type DailyNoteSelectScalar = {
    id?: boolean
    date?: boolean
    content?: boolean
    mood?: boolean
    predefinedComments?: boolean
    customComment?: boolean
    aiAnalysis?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type DailyNoteOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "date" | "content" | "mood" | "predefinedComments" | "customComment" | "aiAnalysis" | "createdAt" | "updatedAt", ExtArgs["result"]["dailyNote"]>

  export type $DailyNotePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DailyNote"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      date: string
      content: string
      mood: number | null
      predefinedComments: Prisma.JsonValue | null
      customComment: string | null
      aiAnalysis: Prisma.JsonValue | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["dailyNote"]>
    composites: {}
  }

  type DailyNoteGetPayload<S extends boolean | null | undefined | DailyNoteDefaultArgs> = $Result.GetResult<Prisma.$DailyNotePayload, S>

  type DailyNoteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DailyNoteFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DailyNoteCountAggregateInputType | true
    }

  export interface DailyNoteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DailyNote'], meta: { name: 'DailyNote' } }
    /**
     * Find zero or one DailyNote that matches the filter.
     * @param {DailyNoteFindUniqueArgs} args - Arguments to find a DailyNote
     * @example
     * // Get one DailyNote
     * const dailyNote = await prisma.dailyNote.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DailyNoteFindUniqueArgs>(args: SelectSubset<T, DailyNoteFindUniqueArgs<ExtArgs>>): Prisma__DailyNoteClient<$Result.GetResult<Prisma.$DailyNotePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DailyNote that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DailyNoteFindUniqueOrThrowArgs} args - Arguments to find a DailyNote
     * @example
     * // Get one DailyNote
     * const dailyNote = await prisma.dailyNote.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DailyNoteFindUniqueOrThrowArgs>(args: SelectSubset<T, DailyNoteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DailyNoteClient<$Result.GetResult<Prisma.$DailyNotePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DailyNote that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyNoteFindFirstArgs} args - Arguments to find a DailyNote
     * @example
     * // Get one DailyNote
     * const dailyNote = await prisma.dailyNote.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DailyNoteFindFirstArgs>(args?: SelectSubset<T, DailyNoteFindFirstArgs<ExtArgs>>): Prisma__DailyNoteClient<$Result.GetResult<Prisma.$DailyNotePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DailyNote that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyNoteFindFirstOrThrowArgs} args - Arguments to find a DailyNote
     * @example
     * // Get one DailyNote
     * const dailyNote = await prisma.dailyNote.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DailyNoteFindFirstOrThrowArgs>(args?: SelectSubset<T, DailyNoteFindFirstOrThrowArgs<ExtArgs>>): Prisma__DailyNoteClient<$Result.GetResult<Prisma.$DailyNotePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DailyNotes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyNoteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DailyNotes
     * const dailyNotes = await prisma.dailyNote.findMany()
     * 
     * // Get first 10 DailyNotes
     * const dailyNotes = await prisma.dailyNote.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const dailyNoteWithIdOnly = await prisma.dailyNote.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DailyNoteFindManyArgs>(args?: SelectSubset<T, DailyNoteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DailyNotePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DailyNote.
     * @param {DailyNoteCreateArgs} args - Arguments to create a DailyNote.
     * @example
     * // Create one DailyNote
     * const DailyNote = await prisma.dailyNote.create({
     *   data: {
     *     // ... data to create a DailyNote
     *   }
     * })
     * 
     */
    create<T extends DailyNoteCreateArgs>(args: SelectSubset<T, DailyNoteCreateArgs<ExtArgs>>): Prisma__DailyNoteClient<$Result.GetResult<Prisma.$DailyNotePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DailyNotes.
     * @param {DailyNoteCreateManyArgs} args - Arguments to create many DailyNotes.
     * @example
     * // Create many DailyNotes
     * const dailyNote = await prisma.dailyNote.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DailyNoteCreateManyArgs>(args?: SelectSubset<T, DailyNoteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a DailyNote.
     * @param {DailyNoteDeleteArgs} args - Arguments to delete one DailyNote.
     * @example
     * // Delete one DailyNote
     * const DailyNote = await prisma.dailyNote.delete({
     *   where: {
     *     // ... filter to delete one DailyNote
     *   }
     * })
     * 
     */
    delete<T extends DailyNoteDeleteArgs>(args: SelectSubset<T, DailyNoteDeleteArgs<ExtArgs>>): Prisma__DailyNoteClient<$Result.GetResult<Prisma.$DailyNotePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DailyNote.
     * @param {DailyNoteUpdateArgs} args - Arguments to update one DailyNote.
     * @example
     * // Update one DailyNote
     * const dailyNote = await prisma.dailyNote.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DailyNoteUpdateArgs>(args: SelectSubset<T, DailyNoteUpdateArgs<ExtArgs>>): Prisma__DailyNoteClient<$Result.GetResult<Prisma.$DailyNotePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DailyNotes.
     * @param {DailyNoteDeleteManyArgs} args - Arguments to filter DailyNotes to delete.
     * @example
     * // Delete a few DailyNotes
     * const { count } = await prisma.dailyNote.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DailyNoteDeleteManyArgs>(args?: SelectSubset<T, DailyNoteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DailyNotes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyNoteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DailyNotes
     * const dailyNote = await prisma.dailyNote.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DailyNoteUpdateManyArgs>(args: SelectSubset<T, DailyNoteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one DailyNote.
     * @param {DailyNoteUpsertArgs} args - Arguments to update or create a DailyNote.
     * @example
     * // Update or create a DailyNote
     * const dailyNote = await prisma.dailyNote.upsert({
     *   create: {
     *     // ... data to create a DailyNote
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DailyNote we want to update
     *   }
     * })
     */
    upsert<T extends DailyNoteUpsertArgs>(args: SelectSubset<T, DailyNoteUpsertArgs<ExtArgs>>): Prisma__DailyNoteClient<$Result.GetResult<Prisma.$DailyNotePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DailyNotes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyNoteCountArgs} args - Arguments to filter DailyNotes to count.
     * @example
     * // Count the number of DailyNotes
     * const count = await prisma.dailyNote.count({
     *   where: {
     *     // ... the filter for the DailyNotes we want to count
     *   }
     * })
    **/
    count<T extends DailyNoteCountArgs>(
      args?: Subset<T, DailyNoteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DailyNoteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DailyNote.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyNoteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DailyNoteAggregateArgs>(args: Subset<T, DailyNoteAggregateArgs>): Prisma.PrismaPromise<GetDailyNoteAggregateType<T>>

    /**
     * Group by DailyNote.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyNoteGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DailyNoteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DailyNoteGroupByArgs['orderBy'] }
        : { orderBy?: DailyNoteGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DailyNoteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDailyNoteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DailyNote model
   */
  readonly fields: DailyNoteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DailyNote.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DailyNoteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DailyNote model
   */
  interface DailyNoteFieldRefs {
    readonly id: FieldRef<"DailyNote", 'String'>
    readonly date: FieldRef<"DailyNote", 'String'>
    readonly content: FieldRef<"DailyNote", 'String'>
    readonly mood: FieldRef<"DailyNote", 'Int'>
    readonly predefinedComments: FieldRef<"DailyNote", 'Json'>
    readonly customComment: FieldRef<"DailyNote", 'String'>
    readonly aiAnalysis: FieldRef<"DailyNote", 'Json'>
    readonly createdAt: FieldRef<"DailyNote", 'DateTime'>
    readonly updatedAt: FieldRef<"DailyNote", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DailyNote findUnique
   */
  export type DailyNoteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyNote
     */
    select?: DailyNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyNote
     */
    omit?: DailyNoteOmit<ExtArgs> | null
    /**
     * Filter, which DailyNote to fetch.
     */
    where: DailyNoteWhereUniqueInput
  }

  /**
   * DailyNote findUniqueOrThrow
   */
  export type DailyNoteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyNote
     */
    select?: DailyNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyNote
     */
    omit?: DailyNoteOmit<ExtArgs> | null
    /**
     * Filter, which DailyNote to fetch.
     */
    where: DailyNoteWhereUniqueInput
  }

  /**
   * DailyNote findFirst
   */
  export type DailyNoteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyNote
     */
    select?: DailyNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyNote
     */
    omit?: DailyNoteOmit<ExtArgs> | null
    /**
     * Filter, which DailyNote to fetch.
     */
    where?: DailyNoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailyNotes to fetch.
     */
    orderBy?: DailyNoteOrderByWithRelationInput | DailyNoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DailyNotes.
     */
    cursor?: DailyNoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailyNotes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailyNotes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DailyNotes.
     */
    distinct?: DailyNoteScalarFieldEnum | DailyNoteScalarFieldEnum[]
  }

  /**
   * DailyNote findFirstOrThrow
   */
  export type DailyNoteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyNote
     */
    select?: DailyNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyNote
     */
    omit?: DailyNoteOmit<ExtArgs> | null
    /**
     * Filter, which DailyNote to fetch.
     */
    where?: DailyNoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailyNotes to fetch.
     */
    orderBy?: DailyNoteOrderByWithRelationInput | DailyNoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DailyNotes.
     */
    cursor?: DailyNoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailyNotes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailyNotes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DailyNotes.
     */
    distinct?: DailyNoteScalarFieldEnum | DailyNoteScalarFieldEnum[]
  }

  /**
   * DailyNote findMany
   */
  export type DailyNoteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyNote
     */
    select?: DailyNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyNote
     */
    omit?: DailyNoteOmit<ExtArgs> | null
    /**
     * Filter, which DailyNotes to fetch.
     */
    where?: DailyNoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailyNotes to fetch.
     */
    orderBy?: DailyNoteOrderByWithRelationInput | DailyNoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DailyNotes.
     */
    cursor?: DailyNoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailyNotes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailyNotes.
     */
    skip?: number
    distinct?: DailyNoteScalarFieldEnum | DailyNoteScalarFieldEnum[]
  }

  /**
   * DailyNote create
   */
  export type DailyNoteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyNote
     */
    select?: DailyNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyNote
     */
    omit?: DailyNoteOmit<ExtArgs> | null
    /**
     * The data needed to create a DailyNote.
     */
    data: XOR<DailyNoteCreateInput, DailyNoteUncheckedCreateInput>
  }

  /**
   * DailyNote createMany
   */
  export type DailyNoteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DailyNotes.
     */
    data: DailyNoteCreateManyInput | DailyNoteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DailyNote update
   */
  export type DailyNoteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyNote
     */
    select?: DailyNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyNote
     */
    omit?: DailyNoteOmit<ExtArgs> | null
    /**
     * The data needed to update a DailyNote.
     */
    data: XOR<DailyNoteUpdateInput, DailyNoteUncheckedUpdateInput>
    /**
     * Choose, which DailyNote to update.
     */
    where: DailyNoteWhereUniqueInput
  }

  /**
   * DailyNote updateMany
   */
  export type DailyNoteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DailyNotes.
     */
    data: XOR<DailyNoteUpdateManyMutationInput, DailyNoteUncheckedUpdateManyInput>
    /**
     * Filter which DailyNotes to update
     */
    where?: DailyNoteWhereInput
    /**
     * Limit how many DailyNotes to update.
     */
    limit?: number
  }

  /**
   * DailyNote upsert
   */
  export type DailyNoteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyNote
     */
    select?: DailyNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyNote
     */
    omit?: DailyNoteOmit<ExtArgs> | null
    /**
     * The filter to search for the DailyNote to update in case it exists.
     */
    where: DailyNoteWhereUniqueInput
    /**
     * In case the DailyNote found by the `where` argument doesn't exist, create a new DailyNote with this data.
     */
    create: XOR<DailyNoteCreateInput, DailyNoteUncheckedCreateInput>
    /**
     * In case the DailyNote was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DailyNoteUpdateInput, DailyNoteUncheckedUpdateInput>
  }

  /**
   * DailyNote delete
   */
  export type DailyNoteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyNote
     */
    select?: DailyNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyNote
     */
    omit?: DailyNoteOmit<ExtArgs> | null
    /**
     * Filter which DailyNote to delete.
     */
    where: DailyNoteWhereUniqueInput
  }

  /**
   * DailyNote deleteMany
   */
  export type DailyNoteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DailyNotes to delete
     */
    where?: DailyNoteWhereInput
    /**
     * Limit how many DailyNotes to delete.
     */
    limit?: number
  }

  /**
   * DailyNote without action
   */
  export type DailyNoteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyNote
     */
    select?: DailyNoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyNote
     */
    omit?: DailyNoteOmit<ExtArgs> | null
  }


  /**
   * Model UserPreferences
   */

  export type AggregateUserPreferences = {
    _count: UserPreferencesCountAggregateOutputType | null
    _min: UserPreferencesMinAggregateOutputType | null
    _max: UserPreferencesMaxAggregateOutputType | null
  }

  export type UserPreferencesMinAggregateOutputType = {
    id: string | null
    userId: string | null
    darkMode: boolean | null
    weekStartsOnMonday: boolean | null
    notifications: boolean | null
    language: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserPreferencesMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    darkMode: boolean | null
    weekStartsOnMonday: boolean | null
    notifications: boolean | null
    language: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserPreferencesCountAggregateOutputType = {
    id: number
    userId: number
    darkMode: number
    weekStartsOnMonday: number
    notifications: number
    language: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserPreferencesMinAggregateInputType = {
    id?: true
    userId?: true
    darkMode?: true
    weekStartsOnMonday?: true
    notifications?: true
    language?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserPreferencesMaxAggregateInputType = {
    id?: true
    userId?: true
    darkMode?: true
    weekStartsOnMonday?: true
    notifications?: true
    language?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserPreferencesCountAggregateInputType = {
    id?: true
    userId?: true
    darkMode?: true
    weekStartsOnMonday?: true
    notifications?: true
    language?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserPreferencesAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserPreferences to aggregate.
     */
    where?: UserPreferencesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserPreferences to fetch.
     */
    orderBy?: UserPreferencesOrderByWithRelationInput | UserPreferencesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserPreferencesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserPreferences from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserPreferences.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserPreferences
    **/
    _count?: true | UserPreferencesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserPreferencesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserPreferencesMaxAggregateInputType
  }

  export type GetUserPreferencesAggregateType<T extends UserPreferencesAggregateArgs> = {
        [P in keyof T & keyof AggregateUserPreferences]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserPreferences[P]>
      : GetScalarType<T[P], AggregateUserPreferences[P]>
  }




  export type UserPreferencesGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserPreferencesWhereInput
    orderBy?: UserPreferencesOrderByWithAggregationInput | UserPreferencesOrderByWithAggregationInput[]
    by: UserPreferencesScalarFieldEnum[] | UserPreferencesScalarFieldEnum
    having?: UserPreferencesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserPreferencesCountAggregateInputType | true
    _min?: UserPreferencesMinAggregateInputType
    _max?: UserPreferencesMaxAggregateInputType
  }

  export type UserPreferencesGroupByOutputType = {
    id: string
    userId: string
    darkMode: boolean
    weekStartsOnMonday: boolean
    notifications: boolean
    language: string
    createdAt: Date
    updatedAt: Date
    _count: UserPreferencesCountAggregateOutputType | null
    _min: UserPreferencesMinAggregateOutputType | null
    _max: UserPreferencesMaxAggregateOutputType | null
  }

  type GetUserPreferencesGroupByPayload<T extends UserPreferencesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserPreferencesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserPreferencesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserPreferencesGroupByOutputType[P]>
            : GetScalarType<T[P], UserPreferencesGroupByOutputType[P]>
        }
      >
    >


  export type UserPreferencesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    darkMode?: boolean
    weekStartsOnMonday?: boolean
    notifications?: boolean
    language?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["userPreferences"]>



  export type UserPreferencesSelectScalar = {
    id?: boolean
    userId?: boolean
    darkMode?: boolean
    weekStartsOnMonday?: boolean
    notifications?: boolean
    language?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserPreferencesOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "darkMode" | "weekStartsOnMonday" | "notifications" | "language" | "createdAt" | "updatedAt", ExtArgs["result"]["userPreferences"]>

  export type $UserPreferencesPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserPreferences"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      darkMode: boolean
      weekStartsOnMonday: boolean
      notifications: boolean
      language: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["userPreferences"]>
    composites: {}
  }

  type UserPreferencesGetPayload<S extends boolean | null | undefined | UserPreferencesDefaultArgs> = $Result.GetResult<Prisma.$UserPreferencesPayload, S>

  type UserPreferencesCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserPreferencesFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserPreferencesCountAggregateInputType | true
    }

  export interface UserPreferencesDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserPreferences'], meta: { name: 'UserPreferences' } }
    /**
     * Find zero or one UserPreferences that matches the filter.
     * @param {UserPreferencesFindUniqueArgs} args - Arguments to find a UserPreferences
     * @example
     * // Get one UserPreferences
     * const userPreferences = await prisma.userPreferences.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserPreferencesFindUniqueArgs>(args: SelectSubset<T, UserPreferencesFindUniqueArgs<ExtArgs>>): Prisma__UserPreferencesClient<$Result.GetResult<Prisma.$UserPreferencesPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserPreferences that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserPreferencesFindUniqueOrThrowArgs} args - Arguments to find a UserPreferences
     * @example
     * // Get one UserPreferences
     * const userPreferences = await prisma.userPreferences.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserPreferencesFindUniqueOrThrowArgs>(args: SelectSubset<T, UserPreferencesFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserPreferencesClient<$Result.GetResult<Prisma.$UserPreferencesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserPreferences that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPreferencesFindFirstArgs} args - Arguments to find a UserPreferences
     * @example
     * // Get one UserPreferences
     * const userPreferences = await prisma.userPreferences.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserPreferencesFindFirstArgs>(args?: SelectSubset<T, UserPreferencesFindFirstArgs<ExtArgs>>): Prisma__UserPreferencesClient<$Result.GetResult<Prisma.$UserPreferencesPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserPreferences that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPreferencesFindFirstOrThrowArgs} args - Arguments to find a UserPreferences
     * @example
     * // Get one UserPreferences
     * const userPreferences = await prisma.userPreferences.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserPreferencesFindFirstOrThrowArgs>(args?: SelectSubset<T, UserPreferencesFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserPreferencesClient<$Result.GetResult<Prisma.$UserPreferencesPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserPreferences that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPreferencesFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserPreferences
     * const userPreferences = await prisma.userPreferences.findMany()
     * 
     * // Get first 10 UserPreferences
     * const userPreferences = await prisma.userPreferences.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userPreferencesWithIdOnly = await prisma.userPreferences.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserPreferencesFindManyArgs>(args?: SelectSubset<T, UserPreferencesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPreferencesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserPreferences.
     * @param {UserPreferencesCreateArgs} args - Arguments to create a UserPreferences.
     * @example
     * // Create one UserPreferences
     * const UserPreferences = await prisma.userPreferences.create({
     *   data: {
     *     // ... data to create a UserPreferences
     *   }
     * })
     * 
     */
    create<T extends UserPreferencesCreateArgs>(args: SelectSubset<T, UserPreferencesCreateArgs<ExtArgs>>): Prisma__UserPreferencesClient<$Result.GetResult<Prisma.$UserPreferencesPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserPreferences.
     * @param {UserPreferencesCreateManyArgs} args - Arguments to create many UserPreferences.
     * @example
     * // Create many UserPreferences
     * const userPreferences = await prisma.userPreferences.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserPreferencesCreateManyArgs>(args?: SelectSubset<T, UserPreferencesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a UserPreferences.
     * @param {UserPreferencesDeleteArgs} args - Arguments to delete one UserPreferences.
     * @example
     * // Delete one UserPreferences
     * const UserPreferences = await prisma.userPreferences.delete({
     *   where: {
     *     // ... filter to delete one UserPreferences
     *   }
     * })
     * 
     */
    delete<T extends UserPreferencesDeleteArgs>(args: SelectSubset<T, UserPreferencesDeleteArgs<ExtArgs>>): Prisma__UserPreferencesClient<$Result.GetResult<Prisma.$UserPreferencesPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserPreferences.
     * @param {UserPreferencesUpdateArgs} args - Arguments to update one UserPreferences.
     * @example
     * // Update one UserPreferences
     * const userPreferences = await prisma.userPreferences.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserPreferencesUpdateArgs>(args: SelectSubset<T, UserPreferencesUpdateArgs<ExtArgs>>): Prisma__UserPreferencesClient<$Result.GetResult<Prisma.$UserPreferencesPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserPreferences.
     * @param {UserPreferencesDeleteManyArgs} args - Arguments to filter UserPreferences to delete.
     * @example
     * // Delete a few UserPreferences
     * const { count } = await prisma.userPreferences.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserPreferencesDeleteManyArgs>(args?: SelectSubset<T, UserPreferencesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserPreferences.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPreferencesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserPreferences
     * const userPreferences = await prisma.userPreferences.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserPreferencesUpdateManyArgs>(args: SelectSubset<T, UserPreferencesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one UserPreferences.
     * @param {UserPreferencesUpsertArgs} args - Arguments to update or create a UserPreferences.
     * @example
     * // Update or create a UserPreferences
     * const userPreferences = await prisma.userPreferences.upsert({
     *   create: {
     *     // ... data to create a UserPreferences
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserPreferences we want to update
     *   }
     * })
     */
    upsert<T extends UserPreferencesUpsertArgs>(args: SelectSubset<T, UserPreferencesUpsertArgs<ExtArgs>>): Prisma__UserPreferencesClient<$Result.GetResult<Prisma.$UserPreferencesPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserPreferences.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPreferencesCountArgs} args - Arguments to filter UserPreferences to count.
     * @example
     * // Count the number of UserPreferences
     * const count = await prisma.userPreferences.count({
     *   where: {
     *     // ... the filter for the UserPreferences we want to count
     *   }
     * })
    **/
    count<T extends UserPreferencesCountArgs>(
      args?: Subset<T, UserPreferencesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserPreferencesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserPreferences.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPreferencesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserPreferencesAggregateArgs>(args: Subset<T, UserPreferencesAggregateArgs>): Prisma.PrismaPromise<GetUserPreferencesAggregateType<T>>

    /**
     * Group by UserPreferences.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserPreferencesGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserPreferencesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserPreferencesGroupByArgs['orderBy'] }
        : { orderBy?: UserPreferencesGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserPreferencesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserPreferencesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserPreferences model
   */
  readonly fields: UserPreferencesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserPreferences.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserPreferencesClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserPreferences model
   */
  interface UserPreferencesFieldRefs {
    readonly id: FieldRef<"UserPreferences", 'String'>
    readonly userId: FieldRef<"UserPreferences", 'String'>
    readonly darkMode: FieldRef<"UserPreferences", 'Boolean'>
    readonly weekStartsOnMonday: FieldRef<"UserPreferences", 'Boolean'>
    readonly notifications: FieldRef<"UserPreferences", 'Boolean'>
    readonly language: FieldRef<"UserPreferences", 'String'>
    readonly createdAt: FieldRef<"UserPreferences", 'DateTime'>
    readonly updatedAt: FieldRef<"UserPreferences", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserPreferences findUnique
   */
  export type UserPreferencesFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPreferences
     */
    select?: UserPreferencesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPreferences
     */
    omit?: UserPreferencesOmit<ExtArgs> | null
    /**
     * Filter, which UserPreferences to fetch.
     */
    where: UserPreferencesWhereUniqueInput
  }

  /**
   * UserPreferences findUniqueOrThrow
   */
  export type UserPreferencesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPreferences
     */
    select?: UserPreferencesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPreferences
     */
    omit?: UserPreferencesOmit<ExtArgs> | null
    /**
     * Filter, which UserPreferences to fetch.
     */
    where: UserPreferencesWhereUniqueInput
  }

  /**
   * UserPreferences findFirst
   */
  export type UserPreferencesFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPreferences
     */
    select?: UserPreferencesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPreferences
     */
    omit?: UserPreferencesOmit<ExtArgs> | null
    /**
     * Filter, which UserPreferences to fetch.
     */
    where?: UserPreferencesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserPreferences to fetch.
     */
    orderBy?: UserPreferencesOrderByWithRelationInput | UserPreferencesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserPreferences.
     */
    cursor?: UserPreferencesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserPreferences from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserPreferences.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserPreferences.
     */
    distinct?: UserPreferencesScalarFieldEnum | UserPreferencesScalarFieldEnum[]
  }

  /**
   * UserPreferences findFirstOrThrow
   */
  export type UserPreferencesFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPreferences
     */
    select?: UserPreferencesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPreferences
     */
    omit?: UserPreferencesOmit<ExtArgs> | null
    /**
     * Filter, which UserPreferences to fetch.
     */
    where?: UserPreferencesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserPreferences to fetch.
     */
    orderBy?: UserPreferencesOrderByWithRelationInput | UserPreferencesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserPreferences.
     */
    cursor?: UserPreferencesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserPreferences from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserPreferences.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserPreferences.
     */
    distinct?: UserPreferencesScalarFieldEnum | UserPreferencesScalarFieldEnum[]
  }

  /**
   * UserPreferences findMany
   */
  export type UserPreferencesFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPreferences
     */
    select?: UserPreferencesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPreferences
     */
    omit?: UserPreferencesOmit<ExtArgs> | null
    /**
     * Filter, which UserPreferences to fetch.
     */
    where?: UserPreferencesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserPreferences to fetch.
     */
    orderBy?: UserPreferencesOrderByWithRelationInput | UserPreferencesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserPreferences.
     */
    cursor?: UserPreferencesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserPreferences from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserPreferences.
     */
    skip?: number
    distinct?: UserPreferencesScalarFieldEnum | UserPreferencesScalarFieldEnum[]
  }

  /**
   * UserPreferences create
   */
  export type UserPreferencesCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPreferences
     */
    select?: UserPreferencesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPreferences
     */
    omit?: UserPreferencesOmit<ExtArgs> | null
    /**
     * The data needed to create a UserPreferences.
     */
    data: XOR<UserPreferencesCreateInput, UserPreferencesUncheckedCreateInput>
  }

  /**
   * UserPreferences createMany
   */
  export type UserPreferencesCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserPreferences.
     */
    data: UserPreferencesCreateManyInput | UserPreferencesCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserPreferences update
   */
  export type UserPreferencesUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPreferences
     */
    select?: UserPreferencesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPreferences
     */
    omit?: UserPreferencesOmit<ExtArgs> | null
    /**
     * The data needed to update a UserPreferences.
     */
    data: XOR<UserPreferencesUpdateInput, UserPreferencesUncheckedUpdateInput>
    /**
     * Choose, which UserPreferences to update.
     */
    where: UserPreferencesWhereUniqueInput
  }

  /**
   * UserPreferences updateMany
   */
  export type UserPreferencesUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserPreferences.
     */
    data: XOR<UserPreferencesUpdateManyMutationInput, UserPreferencesUncheckedUpdateManyInput>
    /**
     * Filter which UserPreferences to update
     */
    where?: UserPreferencesWhereInput
    /**
     * Limit how many UserPreferences to update.
     */
    limit?: number
  }

  /**
   * UserPreferences upsert
   */
  export type UserPreferencesUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPreferences
     */
    select?: UserPreferencesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPreferences
     */
    omit?: UserPreferencesOmit<ExtArgs> | null
    /**
     * The filter to search for the UserPreferences to update in case it exists.
     */
    where: UserPreferencesWhereUniqueInput
    /**
     * In case the UserPreferences found by the `where` argument doesn't exist, create a new UserPreferences with this data.
     */
    create: XOR<UserPreferencesCreateInput, UserPreferencesUncheckedCreateInput>
    /**
     * In case the UserPreferences was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserPreferencesUpdateInput, UserPreferencesUncheckedUpdateInput>
  }

  /**
   * UserPreferences delete
   */
  export type UserPreferencesDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPreferences
     */
    select?: UserPreferencesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPreferences
     */
    omit?: UserPreferencesOmit<ExtArgs> | null
    /**
     * Filter which UserPreferences to delete.
     */
    where: UserPreferencesWhereUniqueInput
  }

  /**
   * UserPreferences deleteMany
   */
  export type UserPreferencesDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserPreferences to delete
     */
    where?: UserPreferencesWhereInput
    /**
     * Limit how many UserPreferences to delete.
     */
    limit?: number
  }

  /**
   * UserPreferences without action
   */
  export type UserPreferencesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserPreferences
     */
    select?: UserPreferencesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserPreferences
     */
    omit?: UserPreferencesOmit<ExtArgs> | null
  }


  /**
   * Model WeeklyStreak
   */

  export type AggregateWeeklyStreak = {
    _count: WeeklyStreakCountAggregateOutputType | null
    _avg: WeeklyStreakAvgAggregateOutputType | null
    _sum: WeeklyStreakSumAggregateOutputType | null
    _min: WeeklyStreakMinAggregateOutputType | null
    _max: WeeklyStreakMaxAggregateOutputType | null
  }

  export type WeeklyStreakAvgAggregateOutputType = {
    streak: number | null
    completed: number | null
    total: number | null
  }

  export type WeeklyStreakSumAggregateOutputType = {
    streak: number | null
    completed: number | null
    total: number | null
  }

  export type WeeklyStreakMinAggregateOutputType = {
    id: string | null
    activityId: string | null
    weekStart: string | null
    streak: number | null
    completed: number | null
    total: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type WeeklyStreakMaxAggregateOutputType = {
    id: string | null
    activityId: string | null
    weekStart: string | null
    streak: number | null
    completed: number | null
    total: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type WeeklyStreakCountAggregateOutputType = {
    id: number
    activityId: number
    weekStart: number
    streak: number
    completed: number
    total: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type WeeklyStreakAvgAggregateInputType = {
    streak?: true
    completed?: true
    total?: true
  }

  export type WeeklyStreakSumAggregateInputType = {
    streak?: true
    completed?: true
    total?: true
  }

  export type WeeklyStreakMinAggregateInputType = {
    id?: true
    activityId?: true
    weekStart?: true
    streak?: true
    completed?: true
    total?: true
    createdAt?: true
    updatedAt?: true
  }

  export type WeeklyStreakMaxAggregateInputType = {
    id?: true
    activityId?: true
    weekStart?: true
    streak?: true
    completed?: true
    total?: true
    createdAt?: true
    updatedAt?: true
  }

  export type WeeklyStreakCountAggregateInputType = {
    id?: true
    activityId?: true
    weekStart?: true
    streak?: true
    completed?: true
    total?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type WeeklyStreakAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WeeklyStreak to aggregate.
     */
    where?: WeeklyStreakWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WeeklyStreaks to fetch.
     */
    orderBy?: WeeklyStreakOrderByWithRelationInput | WeeklyStreakOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WeeklyStreakWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WeeklyStreaks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WeeklyStreaks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WeeklyStreaks
    **/
    _count?: true | WeeklyStreakCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: WeeklyStreakAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: WeeklyStreakSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WeeklyStreakMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WeeklyStreakMaxAggregateInputType
  }

  export type GetWeeklyStreakAggregateType<T extends WeeklyStreakAggregateArgs> = {
        [P in keyof T & keyof AggregateWeeklyStreak]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWeeklyStreak[P]>
      : GetScalarType<T[P], AggregateWeeklyStreak[P]>
  }




  export type WeeklyStreakGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WeeklyStreakWhereInput
    orderBy?: WeeklyStreakOrderByWithAggregationInput | WeeklyStreakOrderByWithAggregationInput[]
    by: WeeklyStreakScalarFieldEnum[] | WeeklyStreakScalarFieldEnum
    having?: WeeklyStreakScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WeeklyStreakCountAggregateInputType | true
    _avg?: WeeklyStreakAvgAggregateInputType
    _sum?: WeeklyStreakSumAggregateInputType
    _min?: WeeklyStreakMinAggregateInputType
    _max?: WeeklyStreakMaxAggregateInputType
  }

  export type WeeklyStreakGroupByOutputType = {
    id: string
    activityId: string
    weekStart: string
    streak: number
    completed: number
    total: number
    createdAt: Date
    updatedAt: Date
    _count: WeeklyStreakCountAggregateOutputType | null
    _avg: WeeklyStreakAvgAggregateOutputType | null
    _sum: WeeklyStreakSumAggregateOutputType | null
    _min: WeeklyStreakMinAggregateOutputType | null
    _max: WeeklyStreakMaxAggregateOutputType | null
  }

  type GetWeeklyStreakGroupByPayload<T extends WeeklyStreakGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WeeklyStreakGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WeeklyStreakGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WeeklyStreakGroupByOutputType[P]>
            : GetScalarType<T[P], WeeklyStreakGroupByOutputType[P]>
        }
      >
    >


  export type WeeklyStreakSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    activityId?: boolean
    weekStart?: boolean
    streak?: boolean
    completed?: boolean
    total?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["weeklyStreak"]>



  export type WeeklyStreakSelectScalar = {
    id?: boolean
    activityId?: boolean
    weekStart?: boolean
    streak?: boolean
    completed?: boolean
    total?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type WeeklyStreakOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "activityId" | "weekStart" | "streak" | "completed" | "total" | "createdAt" | "updatedAt", ExtArgs["result"]["weeklyStreak"]>

  export type $WeeklyStreakPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WeeklyStreak"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      activityId: string
      weekStart: string
      streak: number
      completed: number
      total: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["weeklyStreak"]>
    composites: {}
  }

  type WeeklyStreakGetPayload<S extends boolean | null | undefined | WeeklyStreakDefaultArgs> = $Result.GetResult<Prisma.$WeeklyStreakPayload, S>

  type WeeklyStreakCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WeeklyStreakFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WeeklyStreakCountAggregateInputType | true
    }

  export interface WeeklyStreakDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WeeklyStreak'], meta: { name: 'WeeklyStreak' } }
    /**
     * Find zero or one WeeklyStreak that matches the filter.
     * @param {WeeklyStreakFindUniqueArgs} args - Arguments to find a WeeklyStreak
     * @example
     * // Get one WeeklyStreak
     * const weeklyStreak = await prisma.weeklyStreak.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WeeklyStreakFindUniqueArgs>(args: SelectSubset<T, WeeklyStreakFindUniqueArgs<ExtArgs>>): Prisma__WeeklyStreakClient<$Result.GetResult<Prisma.$WeeklyStreakPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one WeeklyStreak that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WeeklyStreakFindUniqueOrThrowArgs} args - Arguments to find a WeeklyStreak
     * @example
     * // Get one WeeklyStreak
     * const weeklyStreak = await prisma.weeklyStreak.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WeeklyStreakFindUniqueOrThrowArgs>(args: SelectSubset<T, WeeklyStreakFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WeeklyStreakClient<$Result.GetResult<Prisma.$WeeklyStreakPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WeeklyStreak that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeeklyStreakFindFirstArgs} args - Arguments to find a WeeklyStreak
     * @example
     * // Get one WeeklyStreak
     * const weeklyStreak = await prisma.weeklyStreak.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WeeklyStreakFindFirstArgs>(args?: SelectSubset<T, WeeklyStreakFindFirstArgs<ExtArgs>>): Prisma__WeeklyStreakClient<$Result.GetResult<Prisma.$WeeklyStreakPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WeeklyStreak that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeeklyStreakFindFirstOrThrowArgs} args - Arguments to find a WeeklyStreak
     * @example
     * // Get one WeeklyStreak
     * const weeklyStreak = await prisma.weeklyStreak.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WeeklyStreakFindFirstOrThrowArgs>(args?: SelectSubset<T, WeeklyStreakFindFirstOrThrowArgs<ExtArgs>>): Prisma__WeeklyStreakClient<$Result.GetResult<Prisma.$WeeklyStreakPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more WeeklyStreaks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeeklyStreakFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WeeklyStreaks
     * const weeklyStreaks = await prisma.weeklyStreak.findMany()
     * 
     * // Get first 10 WeeklyStreaks
     * const weeklyStreaks = await prisma.weeklyStreak.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const weeklyStreakWithIdOnly = await prisma.weeklyStreak.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WeeklyStreakFindManyArgs>(args?: SelectSubset<T, WeeklyStreakFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WeeklyStreakPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a WeeklyStreak.
     * @param {WeeklyStreakCreateArgs} args - Arguments to create a WeeklyStreak.
     * @example
     * // Create one WeeklyStreak
     * const WeeklyStreak = await prisma.weeklyStreak.create({
     *   data: {
     *     // ... data to create a WeeklyStreak
     *   }
     * })
     * 
     */
    create<T extends WeeklyStreakCreateArgs>(args: SelectSubset<T, WeeklyStreakCreateArgs<ExtArgs>>): Prisma__WeeklyStreakClient<$Result.GetResult<Prisma.$WeeklyStreakPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many WeeklyStreaks.
     * @param {WeeklyStreakCreateManyArgs} args - Arguments to create many WeeklyStreaks.
     * @example
     * // Create many WeeklyStreaks
     * const weeklyStreak = await prisma.weeklyStreak.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WeeklyStreakCreateManyArgs>(args?: SelectSubset<T, WeeklyStreakCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a WeeklyStreak.
     * @param {WeeklyStreakDeleteArgs} args - Arguments to delete one WeeklyStreak.
     * @example
     * // Delete one WeeklyStreak
     * const WeeklyStreak = await prisma.weeklyStreak.delete({
     *   where: {
     *     // ... filter to delete one WeeklyStreak
     *   }
     * })
     * 
     */
    delete<T extends WeeklyStreakDeleteArgs>(args: SelectSubset<T, WeeklyStreakDeleteArgs<ExtArgs>>): Prisma__WeeklyStreakClient<$Result.GetResult<Prisma.$WeeklyStreakPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one WeeklyStreak.
     * @param {WeeklyStreakUpdateArgs} args - Arguments to update one WeeklyStreak.
     * @example
     * // Update one WeeklyStreak
     * const weeklyStreak = await prisma.weeklyStreak.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WeeklyStreakUpdateArgs>(args: SelectSubset<T, WeeklyStreakUpdateArgs<ExtArgs>>): Prisma__WeeklyStreakClient<$Result.GetResult<Prisma.$WeeklyStreakPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more WeeklyStreaks.
     * @param {WeeklyStreakDeleteManyArgs} args - Arguments to filter WeeklyStreaks to delete.
     * @example
     * // Delete a few WeeklyStreaks
     * const { count } = await prisma.weeklyStreak.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WeeklyStreakDeleteManyArgs>(args?: SelectSubset<T, WeeklyStreakDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WeeklyStreaks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeeklyStreakUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WeeklyStreaks
     * const weeklyStreak = await prisma.weeklyStreak.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WeeklyStreakUpdateManyArgs>(args: SelectSubset<T, WeeklyStreakUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one WeeklyStreak.
     * @param {WeeklyStreakUpsertArgs} args - Arguments to update or create a WeeklyStreak.
     * @example
     * // Update or create a WeeklyStreak
     * const weeklyStreak = await prisma.weeklyStreak.upsert({
     *   create: {
     *     // ... data to create a WeeklyStreak
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WeeklyStreak we want to update
     *   }
     * })
     */
    upsert<T extends WeeklyStreakUpsertArgs>(args: SelectSubset<T, WeeklyStreakUpsertArgs<ExtArgs>>): Prisma__WeeklyStreakClient<$Result.GetResult<Prisma.$WeeklyStreakPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of WeeklyStreaks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeeklyStreakCountArgs} args - Arguments to filter WeeklyStreaks to count.
     * @example
     * // Count the number of WeeklyStreaks
     * const count = await prisma.weeklyStreak.count({
     *   where: {
     *     // ... the filter for the WeeklyStreaks we want to count
     *   }
     * })
    **/
    count<T extends WeeklyStreakCountArgs>(
      args?: Subset<T, WeeklyStreakCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WeeklyStreakCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WeeklyStreak.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeeklyStreakAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends WeeklyStreakAggregateArgs>(args: Subset<T, WeeklyStreakAggregateArgs>): Prisma.PrismaPromise<GetWeeklyStreakAggregateType<T>>

    /**
     * Group by WeeklyStreak.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WeeklyStreakGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends WeeklyStreakGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WeeklyStreakGroupByArgs['orderBy'] }
        : { orderBy?: WeeklyStreakGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WeeklyStreakGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWeeklyStreakGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WeeklyStreak model
   */
  readonly fields: WeeklyStreakFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WeeklyStreak.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WeeklyStreakClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the WeeklyStreak model
   */
  interface WeeklyStreakFieldRefs {
    readonly id: FieldRef<"WeeklyStreak", 'String'>
    readonly activityId: FieldRef<"WeeklyStreak", 'String'>
    readonly weekStart: FieldRef<"WeeklyStreak", 'String'>
    readonly streak: FieldRef<"WeeklyStreak", 'Int'>
    readonly completed: FieldRef<"WeeklyStreak", 'Int'>
    readonly total: FieldRef<"WeeklyStreak", 'Int'>
    readonly createdAt: FieldRef<"WeeklyStreak", 'DateTime'>
    readonly updatedAt: FieldRef<"WeeklyStreak", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * WeeklyStreak findUnique
   */
  export type WeeklyStreakFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeeklyStreak
     */
    select?: WeeklyStreakSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeeklyStreak
     */
    omit?: WeeklyStreakOmit<ExtArgs> | null
    /**
     * Filter, which WeeklyStreak to fetch.
     */
    where: WeeklyStreakWhereUniqueInput
  }

  /**
   * WeeklyStreak findUniqueOrThrow
   */
  export type WeeklyStreakFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeeklyStreak
     */
    select?: WeeklyStreakSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeeklyStreak
     */
    omit?: WeeklyStreakOmit<ExtArgs> | null
    /**
     * Filter, which WeeklyStreak to fetch.
     */
    where: WeeklyStreakWhereUniqueInput
  }

  /**
   * WeeklyStreak findFirst
   */
  export type WeeklyStreakFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeeklyStreak
     */
    select?: WeeklyStreakSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeeklyStreak
     */
    omit?: WeeklyStreakOmit<ExtArgs> | null
    /**
     * Filter, which WeeklyStreak to fetch.
     */
    where?: WeeklyStreakWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WeeklyStreaks to fetch.
     */
    orderBy?: WeeklyStreakOrderByWithRelationInput | WeeklyStreakOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WeeklyStreaks.
     */
    cursor?: WeeklyStreakWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WeeklyStreaks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WeeklyStreaks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WeeklyStreaks.
     */
    distinct?: WeeklyStreakScalarFieldEnum | WeeklyStreakScalarFieldEnum[]
  }

  /**
   * WeeklyStreak findFirstOrThrow
   */
  export type WeeklyStreakFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeeklyStreak
     */
    select?: WeeklyStreakSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeeklyStreak
     */
    omit?: WeeklyStreakOmit<ExtArgs> | null
    /**
     * Filter, which WeeklyStreak to fetch.
     */
    where?: WeeklyStreakWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WeeklyStreaks to fetch.
     */
    orderBy?: WeeklyStreakOrderByWithRelationInput | WeeklyStreakOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WeeklyStreaks.
     */
    cursor?: WeeklyStreakWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WeeklyStreaks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WeeklyStreaks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WeeklyStreaks.
     */
    distinct?: WeeklyStreakScalarFieldEnum | WeeklyStreakScalarFieldEnum[]
  }

  /**
   * WeeklyStreak findMany
   */
  export type WeeklyStreakFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeeklyStreak
     */
    select?: WeeklyStreakSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeeklyStreak
     */
    omit?: WeeklyStreakOmit<ExtArgs> | null
    /**
     * Filter, which WeeklyStreaks to fetch.
     */
    where?: WeeklyStreakWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WeeklyStreaks to fetch.
     */
    orderBy?: WeeklyStreakOrderByWithRelationInput | WeeklyStreakOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WeeklyStreaks.
     */
    cursor?: WeeklyStreakWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WeeklyStreaks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WeeklyStreaks.
     */
    skip?: number
    distinct?: WeeklyStreakScalarFieldEnum | WeeklyStreakScalarFieldEnum[]
  }

  /**
   * WeeklyStreak create
   */
  export type WeeklyStreakCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeeklyStreak
     */
    select?: WeeklyStreakSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeeklyStreak
     */
    omit?: WeeklyStreakOmit<ExtArgs> | null
    /**
     * The data needed to create a WeeklyStreak.
     */
    data: XOR<WeeklyStreakCreateInput, WeeklyStreakUncheckedCreateInput>
  }

  /**
   * WeeklyStreak createMany
   */
  export type WeeklyStreakCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WeeklyStreaks.
     */
    data: WeeklyStreakCreateManyInput | WeeklyStreakCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WeeklyStreak update
   */
  export type WeeklyStreakUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeeklyStreak
     */
    select?: WeeklyStreakSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeeklyStreak
     */
    omit?: WeeklyStreakOmit<ExtArgs> | null
    /**
     * The data needed to update a WeeklyStreak.
     */
    data: XOR<WeeklyStreakUpdateInput, WeeklyStreakUncheckedUpdateInput>
    /**
     * Choose, which WeeklyStreak to update.
     */
    where: WeeklyStreakWhereUniqueInput
  }

  /**
   * WeeklyStreak updateMany
   */
  export type WeeklyStreakUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WeeklyStreaks.
     */
    data: XOR<WeeklyStreakUpdateManyMutationInput, WeeklyStreakUncheckedUpdateManyInput>
    /**
     * Filter which WeeklyStreaks to update
     */
    where?: WeeklyStreakWhereInput
    /**
     * Limit how many WeeklyStreaks to update.
     */
    limit?: number
  }

  /**
   * WeeklyStreak upsert
   */
  export type WeeklyStreakUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeeklyStreak
     */
    select?: WeeklyStreakSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeeklyStreak
     */
    omit?: WeeklyStreakOmit<ExtArgs> | null
    /**
     * The filter to search for the WeeklyStreak to update in case it exists.
     */
    where: WeeklyStreakWhereUniqueInput
    /**
     * In case the WeeklyStreak found by the `where` argument doesn't exist, create a new WeeklyStreak with this data.
     */
    create: XOR<WeeklyStreakCreateInput, WeeklyStreakUncheckedCreateInput>
    /**
     * In case the WeeklyStreak was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WeeklyStreakUpdateInput, WeeklyStreakUncheckedUpdateInput>
  }

  /**
   * WeeklyStreak delete
   */
  export type WeeklyStreakDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeeklyStreak
     */
    select?: WeeklyStreakSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeeklyStreak
     */
    omit?: WeeklyStreakOmit<ExtArgs> | null
    /**
     * Filter which WeeklyStreak to delete.
     */
    where: WeeklyStreakWhereUniqueInput
  }

  /**
   * WeeklyStreak deleteMany
   */
  export type WeeklyStreakDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WeeklyStreaks to delete
     */
    where?: WeeklyStreakWhereInput
    /**
     * Limit how many WeeklyStreaks to delete.
     */
    limit?: number
  }

  /**
   * WeeklyStreak without action
   */
  export type WeeklyStreakDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WeeklyStreak
     */
    select?: WeeklyStreakSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WeeklyStreak
     */
    omit?: WeeklyStreakOmit<ExtArgs> | null
  }


  /**
   * Model NutritionAnalysis
   */

  export type AggregateNutritionAnalysis = {
    _count: NutritionAnalysisCountAggregateOutputType | null
    _avg: NutritionAnalysisAvgAggregateOutputType | null
    _sum: NutritionAnalysisSumAggregateOutputType | null
    _min: NutritionAnalysisMinAggregateOutputType | null
    _max: NutritionAnalysisMaxAggregateOutputType | null
  }

  export type NutritionAnalysisAvgAggregateOutputType = {
    totalCalories: number | null
    aiConfidence: number | null
  }

  export type NutritionAnalysisSumAggregateOutputType = {
    totalCalories: number | null
    aiConfidence: number | null
  }

  export type NutritionAnalysisMinAggregateOutputType = {
    id: string | null
    userId: string | null
    date: string | null
    mealType: string | null
    totalCalories: number | null
    imageUrl: string | null
    aiConfidence: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type NutritionAnalysisMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    date: string | null
    mealType: string | null
    totalCalories: number | null
    imageUrl: string | null
    aiConfidence: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type NutritionAnalysisCountAggregateOutputType = {
    id: number
    userId: number
    date: number
    mealType: number
    foods: number
    totalCalories: number
    macronutrients: number
    imageUrl: number
    aiConfidence: number
    userAdjustments: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type NutritionAnalysisAvgAggregateInputType = {
    totalCalories?: true
    aiConfidence?: true
  }

  export type NutritionAnalysisSumAggregateInputType = {
    totalCalories?: true
    aiConfidence?: true
  }

  export type NutritionAnalysisMinAggregateInputType = {
    id?: true
    userId?: true
    date?: true
    mealType?: true
    totalCalories?: true
    imageUrl?: true
    aiConfidence?: true
    createdAt?: true
    updatedAt?: true
  }

  export type NutritionAnalysisMaxAggregateInputType = {
    id?: true
    userId?: true
    date?: true
    mealType?: true
    totalCalories?: true
    imageUrl?: true
    aiConfidence?: true
    createdAt?: true
    updatedAt?: true
  }

  export type NutritionAnalysisCountAggregateInputType = {
    id?: true
    userId?: true
    date?: true
    mealType?: true
    foods?: true
    totalCalories?: true
    macronutrients?: true
    imageUrl?: true
    aiConfidence?: true
    userAdjustments?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type NutritionAnalysisAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which NutritionAnalysis to aggregate.
     */
    where?: NutritionAnalysisWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NutritionAnalyses to fetch.
     */
    orderBy?: NutritionAnalysisOrderByWithRelationInput | NutritionAnalysisOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: NutritionAnalysisWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NutritionAnalyses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NutritionAnalyses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned NutritionAnalyses
    **/
    _count?: true | NutritionAnalysisCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: NutritionAnalysisAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: NutritionAnalysisSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: NutritionAnalysisMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: NutritionAnalysisMaxAggregateInputType
  }

  export type GetNutritionAnalysisAggregateType<T extends NutritionAnalysisAggregateArgs> = {
        [P in keyof T & keyof AggregateNutritionAnalysis]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateNutritionAnalysis[P]>
      : GetScalarType<T[P], AggregateNutritionAnalysis[P]>
  }




  export type NutritionAnalysisGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NutritionAnalysisWhereInput
    orderBy?: NutritionAnalysisOrderByWithAggregationInput | NutritionAnalysisOrderByWithAggregationInput[]
    by: NutritionAnalysisScalarFieldEnum[] | NutritionAnalysisScalarFieldEnum
    having?: NutritionAnalysisScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: NutritionAnalysisCountAggregateInputType | true
    _avg?: NutritionAnalysisAvgAggregateInputType
    _sum?: NutritionAnalysisSumAggregateInputType
    _min?: NutritionAnalysisMinAggregateInputType
    _max?: NutritionAnalysisMaxAggregateInputType
  }

  export type NutritionAnalysisGroupByOutputType = {
    id: string
    userId: string
    date: string
    mealType: string
    foods: JsonValue
    totalCalories: number
    macronutrients: JsonValue
    imageUrl: string | null
    aiConfidence: number
    userAdjustments: JsonValue | null
    createdAt: Date
    updatedAt: Date
    _count: NutritionAnalysisCountAggregateOutputType | null
    _avg: NutritionAnalysisAvgAggregateOutputType | null
    _sum: NutritionAnalysisSumAggregateOutputType | null
    _min: NutritionAnalysisMinAggregateOutputType | null
    _max: NutritionAnalysisMaxAggregateOutputType | null
  }

  type GetNutritionAnalysisGroupByPayload<T extends NutritionAnalysisGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<NutritionAnalysisGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof NutritionAnalysisGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], NutritionAnalysisGroupByOutputType[P]>
            : GetScalarType<T[P], NutritionAnalysisGroupByOutputType[P]>
        }
      >
    >


  export type NutritionAnalysisSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    date?: boolean
    mealType?: boolean
    foods?: boolean
    totalCalories?: boolean
    macronutrients?: boolean
    imageUrl?: boolean
    aiConfidence?: boolean
    userAdjustments?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["nutritionAnalysis"]>



  export type NutritionAnalysisSelectScalar = {
    id?: boolean
    userId?: boolean
    date?: boolean
    mealType?: boolean
    foods?: boolean
    totalCalories?: boolean
    macronutrients?: boolean
    imageUrl?: boolean
    aiConfidence?: boolean
    userAdjustments?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type NutritionAnalysisOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "date" | "mealType" | "foods" | "totalCalories" | "macronutrients" | "imageUrl" | "aiConfidence" | "userAdjustments" | "createdAt" | "updatedAt", ExtArgs["result"]["nutritionAnalysis"]>

  export type $NutritionAnalysisPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "NutritionAnalysis"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      date: string
      mealType: string
      foods: Prisma.JsonValue
      totalCalories: number
      macronutrients: Prisma.JsonValue
      imageUrl: string | null
      aiConfidence: number
      userAdjustments: Prisma.JsonValue | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["nutritionAnalysis"]>
    composites: {}
  }

  type NutritionAnalysisGetPayload<S extends boolean | null | undefined | NutritionAnalysisDefaultArgs> = $Result.GetResult<Prisma.$NutritionAnalysisPayload, S>

  type NutritionAnalysisCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<NutritionAnalysisFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: NutritionAnalysisCountAggregateInputType | true
    }

  export interface NutritionAnalysisDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['NutritionAnalysis'], meta: { name: 'NutritionAnalysis' } }
    /**
     * Find zero or one NutritionAnalysis that matches the filter.
     * @param {NutritionAnalysisFindUniqueArgs} args - Arguments to find a NutritionAnalysis
     * @example
     * // Get one NutritionAnalysis
     * const nutritionAnalysis = await prisma.nutritionAnalysis.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends NutritionAnalysisFindUniqueArgs>(args: SelectSubset<T, NutritionAnalysisFindUniqueArgs<ExtArgs>>): Prisma__NutritionAnalysisClient<$Result.GetResult<Prisma.$NutritionAnalysisPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one NutritionAnalysis that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {NutritionAnalysisFindUniqueOrThrowArgs} args - Arguments to find a NutritionAnalysis
     * @example
     * // Get one NutritionAnalysis
     * const nutritionAnalysis = await prisma.nutritionAnalysis.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends NutritionAnalysisFindUniqueOrThrowArgs>(args: SelectSubset<T, NutritionAnalysisFindUniqueOrThrowArgs<ExtArgs>>): Prisma__NutritionAnalysisClient<$Result.GetResult<Prisma.$NutritionAnalysisPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first NutritionAnalysis that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NutritionAnalysisFindFirstArgs} args - Arguments to find a NutritionAnalysis
     * @example
     * // Get one NutritionAnalysis
     * const nutritionAnalysis = await prisma.nutritionAnalysis.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends NutritionAnalysisFindFirstArgs>(args?: SelectSubset<T, NutritionAnalysisFindFirstArgs<ExtArgs>>): Prisma__NutritionAnalysisClient<$Result.GetResult<Prisma.$NutritionAnalysisPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first NutritionAnalysis that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NutritionAnalysisFindFirstOrThrowArgs} args - Arguments to find a NutritionAnalysis
     * @example
     * // Get one NutritionAnalysis
     * const nutritionAnalysis = await prisma.nutritionAnalysis.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends NutritionAnalysisFindFirstOrThrowArgs>(args?: SelectSubset<T, NutritionAnalysisFindFirstOrThrowArgs<ExtArgs>>): Prisma__NutritionAnalysisClient<$Result.GetResult<Prisma.$NutritionAnalysisPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more NutritionAnalyses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NutritionAnalysisFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all NutritionAnalyses
     * const nutritionAnalyses = await prisma.nutritionAnalysis.findMany()
     * 
     * // Get first 10 NutritionAnalyses
     * const nutritionAnalyses = await prisma.nutritionAnalysis.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const nutritionAnalysisWithIdOnly = await prisma.nutritionAnalysis.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends NutritionAnalysisFindManyArgs>(args?: SelectSubset<T, NutritionAnalysisFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NutritionAnalysisPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a NutritionAnalysis.
     * @param {NutritionAnalysisCreateArgs} args - Arguments to create a NutritionAnalysis.
     * @example
     * // Create one NutritionAnalysis
     * const NutritionAnalysis = await prisma.nutritionAnalysis.create({
     *   data: {
     *     // ... data to create a NutritionAnalysis
     *   }
     * })
     * 
     */
    create<T extends NutritionAnalysisCreateArgs>(args: SelectSubset<T, NutritionAnalysisCreateArgs<ExtArgs>>): Prisma__NutritionAnalysisClient<$Result.GetResult<Prisma.$NutritionAnalysisPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many NutritionAnalyses.
     * @param {NutritionAnalysisCreateManyArgs} args - Arguments to create many NutritionAnalyses.
     * @example
     * // Create many NutritionAnalyses
     * const nutritionAnalysis = await prisma.nutritionAnalysis.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends NutritionAnalysisCreateManyArgs>(args?: SelectSubset<T, NutritionAnalysisCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a NutritionAnalysis.
     * @param {NutritionAnalysisDeleteArgs} args - Arguments to delete one NutritionAnalysis.
     * @example
     * // Delete one NutritionAnalysis
     * const NutritionAnalysis = await prisma.nutritionAnalysis.delete({
     *   where: {
     *     // ... filter to delete one NutritionAnalysis
     *   }
     * })
     * 
     */
    delete<T extends NutritionAnalysisDeleteArgs>(args: SelectSubset<T, NutritionAnalysisDeleteArgs<ExtArgs>>): Prisma__NutritionAnalysisClient<$Result.GetResult<Prisma.$NutritionAnalysisPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one NutritionAnalysis.
     * @param {NutritionAnalysisUpdateArgs} args - Arguments to update one NutritionAnalysis.
     * @example
     * // Update one NutritionAnalysis
     * const nutritionAnalysis = await prisma.nutritionAnalysis.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends NutritionAnalysisUpdateArgs>(args: SelectSubset<T, NutritionAnalysisUpdateArgs<ExtArgs>>): Prisma__NutritionAnalysisClient<$Result.GetResult<Prisma.$NutritionAnalysisPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more NutritionAnalyses.
     * @param {NutritionAnalysisDeleteManyArgs} args - Arguments to filter NutritionAnalyses to delete.
     * @example
     * // Delete a few NutritionAnalyses
     * const { count } = await prisma.nutritionAnalysis.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends NutritionAnalysisDeleteManyArgs>(args?: SelectSubset<T, NutritionAnalysisDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more NutritionAnalyses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NutritionAnalysisUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many NutritionAnalyses
     * const nutritionAnalysis = await prisma.nutritionAnalysis.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends NutritionAnalysisUpdateManyArgs>(args: SelectSubset<T, NutritionAnalysisUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one NutritionAnalysis.
     * @param {NutritionAnalysisUpsertArgs} args - Arguments to update or create a NutritionAnalysis.
     * @example
     * // Update or create a NutritionAnalysis
     * const nutritionAnalysis = await prisma.nutritionAnalysis.upsert({
     *   create: {
     *     // ... data to create a NutritionAnalysis
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the NutritionAnalysis we want to update
     *   }
     * })
     */
    upsert<T extends NutritionAnalysisUpsertArgs>(args: SelectSubset<T, NutritionAnalysisUpsertArgs<ExtArgs>>): Prisma__NutritionAnalysisClient<$Result.GetResult<Prisma.$NutritionAnalysisPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of NutritionAnalyses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NutritionAnalysisCountArgs} args - Arguments to filter NutritionAnalyses to count.
     * @example
     * // Count the number of NutritionAnalyses
     * const count = await prisma.nutritionAnalysis.count({
     *   where: {
     *     // ... the filter for the NutritionAnalyses we want to count
     *   }
     * })
    **/
    count<T extends NutritionAnalysisCountArgs>(
      args?: Subset<T, NutritionAnalysisCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], NutritionAnalysisCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a NutritionAnalysis.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NutritionAnalysisAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends NutritionAnalysisAggregateArgs>(args: Subset<T, NutritionAnalysisAggregateArgs>): Prisma.PrismaPromise<GetNutritionAnalysisAggregateType<T>>

    /**
     * Group by NutritionAnalysis.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NutritionAnalysisGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends NutritionAnalysisGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: NutritionAnalysisGroupByArgs['orderBy'] }
        : { orderBy?: NutritionAnalysisGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, NutritionAnalysisGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetNutritionAnalysisGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the NutritionAnalysis model
   */
  readonly fields: NutritionAnalysisFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for NutritionAnalysis.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__NutritionAnalysisClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the NutritionAnalysis model
   */
  interface NutritionAnalysisFieldRefs {
    readonly id: FieldRef<"NutritionAnalysis", 'String'>
    readonly userId: FieldRef<"NutritionAnalysis", 'String'>
    readonly date: FieldRef<"NutritionAnalysis", 'String'>
    readonly mealType: FieldRef<"NutritionAnalysis", 'String'>
    readonly foods: FieldRef<"NutritionAnalysis", 'Json'>
    readonly totalCalories: FieldRef<"NutritionAnalysis", 'Int'>
    readonly macronutrients: FieldRef<"NutritionAnalysis", 'Json'>
    readonly imageUrl: FieldRef<"NutritionAnalysis", 'String'>
    readonly aiConfidence: FieldRef<"NutritionAnalysis", 'Float'>
    readonly userAdjustments: FieldRef<"NutritionAnalysis", 'Json'>
    readonly createdAt: FieldRef<"NutritionAnalysis", 'DateTime'>
    readonly updatedAt: FieldRef<"NutritionAnalysis", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * NutritionAnalysis findUnique
   */
  export type NutritionAnalysisFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NutritionAnalysis
     */
    select?: NutritionAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NutritionAnalysis
     */
    omit?: NutritionAnalysisOmit<ExtArgs> | null
    /**
     * Filter, which NutritionAnalysis to fetch.
     */
    where: NutritionAnalysisWhereUniqueInput
  }

  /**
   * NutritionAnalysis findUniqueOrThrow
   */
  export type NutritionAnalysisFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NutritionAnalysis
     */
    select?: NutritionAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NutritionAnalysis
     */
    omit?: NutritionAnalysisOmit<ExtArgs> | null
    /**
     * Filter, which NutritionAnalysis to fetch.
     */
    where: NutritionAnalysisWhereUniqueInput
  }

  /**
   * NutritionAnalysis findFirst
   */
  export type NutritionAnalysisFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NutritionAnalysis
     */
    select?: NutritionAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NutritionAnalysis
     */
    omit?: NutritionAnalysisOmit<ExtArgs> | null
    /**
     * Filter, which NutritionAnalysis to fetch.
     */
    where?: NutritionAnalysisWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NutritionAnalyses to fetch.
     */
    orderBy?: NutritionAnalysisOrderByWithRelationInput | NutritionAnalysisOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for NutritionAnalyses.
     */
    cursor?: NutritionAnalysisWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NutritionAnalyses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NutritionAnalyses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of NutritionAnalyses.
     */
    distinct?: NutritionAnalysisScalarFieldEnum | NutritionAnalysisScalarFieldEnum[]
  }

  /**
   * NutritionAnalysis findFirstOrThrow
   */
  export type NutritionAnalysisFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NutritionAnalysis
     */
    select?: NutritionAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NutritionAnalysis
     */
    omit?: NutritionAnalysisOmit<ExtArgs> | null
    /**
     * Filter, which NutritionAnalysis to fetch.
     */
    where?: NutritionAnalysisWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NutritionAnalyses to fetch.
     */
    orderBy?: NutritionAnalysisOrderByWithRelationInput | NutritionAnalysisOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for NutritionAnalyses.
     */
    cursor?: NutritionAnalysisWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NutritionAnalyses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NutritionAnalyses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of NutritionAnalyses.
     */
    distinct?: NutritionAnalysisScalarFieldEnum | NutritionAnalysisScalarFieldEnum[]
  }

  /**
   * NutritionAnalysis findMany
   */
  export type NutritionAnalysisFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NutritionAnalysis
     */
    select?: NutritionAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NutritionAnalysis
     */
    omit?: NutritionAnalysisOmit<ExtArgs> | null
    /**
     * Filter, which NutritionAnalyses to fetch.
     */
    where?: NutritionAnalysisWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NutritionAnalyses to fetch.
     */
    orderBy?: NutritionAnalysisOrderByWithRelationInput | NutritionAnalysisOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing NutritionAnalyses.
     */
    cursor?: NutritionAnalysisWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NutritionAnalyses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NutritionAnalyses.
     */
    skip?: number
    distinct?: NutritionAnalysisScalarFieldEnum | NutritionAnalysisScalarFieldEnum[]
  }

  /**
   * NutritionAnalysis create
   */
  export type NutritionAnalysisCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NutritionAnalysis
     */
    select?: NutritionAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NutritionAnalysis
     */
    omit?: NutritionAnalysisOmit<ExtArgs> | null
    /**
     * The data needed to create a NutritionAnalysis.
     */
    data: XOR<NutritionAnalysisCreateInput, NutritionAnalysisUncheckedCreateInput>
  }

  /**
   * NutritionAnalysis createMany
   */
  export type NutritionAnalysisCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many NutritionAnalyses.
     */
    data: NutritionAnalysisCreateManyInput | NutritionAnalysisCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * NutritionAnalysis update
   */
  export type NutritionAnalysisUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NutritionAnalysis
     */
    select?: NutritionAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NutritionAnalysis
     */
    omit?: NutritionAnalysisOmit<ExtArgs> | null
    /**
     * The data needed to update a NutritionAnalysis.
     */
    data: XOR<NutritionAnalysisUpdateInput, NutritionAnalysisUncheckedUpdateInput>
    /**
     * Choose, which NutritionAnalysis to update.
     */
    where: NutritionAnalysisWhereUniqueInput
  }

  /**
   * NutritionAnalysis updateMany
   */
  export type NutritionAnalysisUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update NutritionAnalyses.
     */
    data: XOR<NutritionAnalysisUpdateManyMutationInput, NutritionAnalysisUncheckedUpdateManyInput>
    /**
     * Filter which NutritionAnalyses to update
     */
    where?: NutritionAnalysisWhereInput
    /**
     * Limit how many NutritionAnalyses to update.
     */
    limit?: number
  }

  /**
   * NutritionAnalysis upsert
   */
  export type NutritionAnalysisUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NutritionAnalysis
     */
    select?: NutritionAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NutritionAnalysis
     */
    omit?: NutritionAnalysisOmit<ExtArgs> | null
    /**
     * The filter to search for the NutritionAnalysis to update in case it exists.
     */
    where: NutritionAnalysisWhereUniqueInput
    /**
     * In case the NutritionAnalysis found by the `where` argument doesn't exist, create a new NutritionAnalysis with this data.
     */
    create: XOR<NutritionAnalysisCreateInput, NutritionAnalysisUncheckedCreateInput>
    /**
     * In case the NutritionAnalysis was found with the provided `where` argument, update it with this data.
     */
    update: XOR<NutritionAnalysisUpdateInput, NutritionAnalysisUncheckedUpdateInput>
  }

  /**
   * NutritionAnalysis delete
   */
  export type NutritionAnalysisDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NutritionAnalysis
     */
    select?: NutritionAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NutritionAnalysis
     */
    omit?: NutritionAnalysisOmit<ExtArgs> | null
    /**
     * Filter which NutritionAnalysis to delete.
     */
    where: NutritionAnalysisWhereUniqueInput
  }

  /**
   * NutritionAnalysis deleteMany
   */
  export type NutritionAnalysisDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which NutritionAnalyses to delete
     */
    where?: NutritionAnalysisWhereInput
    /**
     * Limit how many NutritionAnalyses to delete.
     */
    limit?: number
  }

  /**
   * NutritionAnalysis without action
   */
  export type NutritionAnalysisDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NutritionAnalysis
     */
    select?: NutritionAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the NutritionAnalysis
     */
    omit?: NutritionAnalysisOmit<ExtArgs> | null
  }


  /**
   * Model BodyAnalysis
   */

  export type AggregateBodyAnalysis = {
    _count: BodyAnalysisCountAggregateOutputType | null
    _avg: BodyAnalysisAvgAggregateOutputType | null
    _sum: BodyAnalysisSumAggregateOutputType | null
    _min: BodyAnalysisMinAggregateOutputType | null
    _max: BodyAnalysisMaxAggregateOutputType | null
  }

  export type BodyAnalysisAvgAggregateOutputType = {
    aiConfidence: number | null
  }

  export type BodyAnalysisSumAggregateOutputType = {
    aiConfidence: number | null
  }

  export type BodyAnalysisMinAggregateOutputType = {
    id: string | null
    userId: string | null
    bodyType: string | null
    imageUrl: string | null
    aiConfidence: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BodyAnalysisMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    bodyType: string | null
    imageUrl: string | null
    aiConfidence: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BodyAnalysisCountAggregateOutputType = {
    id: number
    userId: number
    bodyType: number
    measurements: number
    bodyComposition: number
    recommendations: number
    imageUrl: number
    aiConfidence: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type BodyAnalysisAvgAggregateInputType = {
    aiConfidence?: true
  }

  export type BodyAnalysisSumAggregateInputType = {
    aiConfidence?: true
  }

  export type BodyAnalysisMinAggregateInputType = {
    id?: true
    userId?: true
    bodyType?: true
    imageUrl?: true
    aiConfidence?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BodyAnalysisMaxAggregateInputType = {
    id?: true
    userId?: true
    bodyType?: true
    imageUrl?: true
    aiConfidence?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BodyAnalysisCountAggregateInputType = {
    id?: true
    userId?: true
    bodyType?: true
    measurements?: true
    bodyComposition?: true
    recommendations?: true
    imageUrl?: true
    aiConfidence?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type BodyAnalysisAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BodyAnalysis to aggregate.
     */
    where?: BodyAnalysisWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BodyAnalyses to fetch.
     */
    orderBy?: BodyAnalysisOrderByWithRelationInput | BodyAnalysisOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BodyAnalysisWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BodyAnalyses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BodyAnalyses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned BodyAnalyses
    **/
    _count?: true | BodyAnalysisCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BodyAnalysisAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BodyAnalysisSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BodyAnalysisMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BodyAnalysisMaxAggregateInputType
  }

  export type GetBodyAnalysisAggregateType<T extends BodyAnalysisAggregateArgs> = {
        [P in keyof T & keyof AggregateBodyAnalysis]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBodyAnalysis[P]>
      : GetScalarType<T[P], AggregateBodyAnalysis[P]>
  }




  export type BodyAnalysisGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BodyAnalysisWhereInput
    orderBy?: BodyAnalysisOrderByWithAggregationInput | BodyAnalysisOrderByWithAggregationInput[]
    by: BodyAnalysisScalarFieldEnum[] | BodyAnalysisScalarFieldEnum
    having?: BodyAnalysisScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BodyAnalysisCountAggregateInputType | true
    _avg?: BodyAnalysisAvgAggregateInputType
    _sum?: BodyAnalysisSumAggregateInputType
    _min?: BodyAnalysisMinAggregateInputType
    _max?: BodyAnalysisMaxAggregateInputType
  }

  export type BodyAnalysisGroupByOutputType = {
    id: string
    userId: string
    bodyType: string
    measurements: JsonValue | null
    bodyComposition: JsonValue | null
    recommendations: JsonValue | null
    imageUrl: string | null
    aiConfidence: number
    createdAt: Date
    updatedAt: Date
    _count: BodyAnalysisCountAggregateOutputType | null
    _avg: BodyAnalysisAvgAggregateOutputType | null
    _sum: BodyAnalysisSumAggregateOutputType | null
    _min: BodyAnalysisMinAggregateOutputType | null
    _max: BodyAnalysisMaxAggregateOutputType | null
  }

  type GetBodyAnalysisGroupByPayload<T extends BodyAnalysisGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BodyAnalysisGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BodyAnalysisGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BodyAnalysisGroupByOutputType[P]>
            : GetScalarType<T[P], BodyAnalysisGroupByOutputType[P]>
        }
      >
    >


  export type BodyAnalysisSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    bodyType?: boolean
    measurements?: boolean
    bodyComposition?: boolean
    recommendations?: boolean
    imageUrl?: boolean
    aiConfidence?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["bodyAnalysis"]>



  export type BodyAnalysisSelectScalar = {
    id?: boolean
    userId?: boolean
    bodyType?: boolean
    measurements?: boolean
    bodyComposition?: boolean
    recommendations?: boolean
    imageUrl?: boolean
    aiConfidence?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type BodyAnalysisOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "bodyType" | "measurements" | "bodyComposition" | "recommendations" | "imageUrl" | "aiConfidence" | "createdAt" | "updatedAt", ExtArgs["result"]["bodyAnalysis"]>

  export type $BodyAnalysisPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "BodyAnalysis"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      bodyType: string
      measurements: Prisma.JsonValue | null
      bodyComposition: Prisma.JsonValue | null
      recommendations: Prisma.JsonValue | null
      imageUrl: string | null
      aiConfidence: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["bodyAnalysis"]>
    composites: {}
  }

  type BodyAnalysisGetPayload<S extends boolean | null | undefined | BodyAnalysisDefaultArgs> = $Result.GetResult<Prisma.$BodyAnalysisPayload, S>

  type BodyAnalysisCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BodyAnalysisFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BodyAnalysisCountAggregateInputType | true
    }

  export interface BodyAnalysisDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['BodyAnalysis'], meta: { name: 'BodyAnalysis' } }
    /**
     * Find zero or one BodyAnalysis that matches the filter.
     * @param {BodyAnalysisFindUniqueArgs} args - Arguments to find a BodyAnalysis
     * @example
     * // Get one BodyAnalysis
     * const bodyAnalysis = await prisma.bodyAnalysis.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BodyAnalysisFindUniqueArgs>(args: SelectSubset<T, BodyAnalysisFindUniqueArgs<ExtArgs>>): Prisma__BodyAnalysisClient<$Result.GetResult<Prisma.$BodyAnalysisPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one BodyAnalysis that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BodyAnalysisFindUniqueOrThrowArgs} args - Arguments to find a BodyAnalysis
     * @example
     * // Get one BodyAnalysis
     * const bodyAnalysis = await prisma.bodyAnalysis.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BodyAnalysisFindUniqueOrThrowArgs>(args: SelectSubset<T, BodyAnalysisFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BodyAnalysisClient<$Result.GetResult<Prisma.$BodyAnalysisPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BodyAnalysis that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BodyAnalysisFindFirstArgs} args - Arguments to find a BodyAnalysis
     * @example
     * // Get one BodyAnalysis
     * const bodyAnalysis = await prisma.bodyAnalysis.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BodyAnalysisFindFirstArgs>(args?: SelectSubset<T, BodyAnalysisFindFirstArgs<ExtArgs>>): Prisma__BodyAnalysisClient<$Result.GetResult<Prisma.$BodyAnalysisPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BodyAnalysis that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BodyAnalysisFindFirstOrThrowArgs} args - Arguments to find a BodyAnalysis
     * @example
     * // Get one BodyAnalysis
     * const bodyAnalysis = await prisma.bodyAnalysis.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BodyAnalysisFindFirstOrThrowArgs>(args?: SelectSubset<T, BodyAnalysisFindFirstOrThrowArgs<ExtArgs>>): Prisma__BodyAnalysisClient<$Result.GetResult<Prisma.$BodyAnalysisPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more BodyAnalyses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BodyAnalysisFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BodyAnalyses
     * const bodyAnalyses = await prisma.bodyAnalysis.findMany()
     * 
     * // Get first 10 BodyAnalyses
     * const bodyAnalyses = await prisma.bodyAnalysis.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const bodyAnalysisWithIdOnly = await prisma.bodyAnalysis.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BodyAnalysisFindManyArgs>(args?: SelectSubset<T, BodyAnalysisFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BodyAnalysisPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a BodyAnalysis.
     * @param {BodyAnalysisCreateArgs} args - Arguments to create a BodyAnalysis.
     * @example
     * // Create one BodyAnalysis
     * const BodyAnalysis = await prisma.bodyAnalysis.create({
     *   data: {
     *     // ... data to create a BodyAnalysis
     *   }
     * })
     * 
     */
    create<T extends BodyAnalysisCreateArgs>(args: SelectSubset<T, BodyAnalysisCreateArgs<ExtArgs>>): Prisma__BodyAnalysisClient<$Result.GetResult<Prisma.$BodyAnalysisPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many BodyAnalyses.
     * @param {BodyAnalysisCreateManyArgs} args - Arguments to create many BodyAnalyses.
     * @example
     * // Create many BodyAnalyses
     * const bodyAnalysis = await prisma.bodyAnalysis.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BodyAnalysisCreateManyArgs>(args?: SelectSubset<T, BodyAnalysisCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a BodyAnalysis.
     * @param {BodyAnalysisDeleteArgs} args - Arguments to delete one BodyAnalysis.
     * @example
     * // Delete one BodyAnalysis
     * const BodyAnalysis = await prisma.bodyAnalysis.delete({
     *   where: {
     *     // ... filter to delete one BodyAnalysis
     *   }
     * })
     * 
     */
    delete<T extends BodyAnalysisDeleteArgs>(args: SelectSubset<T, BodyAnalysisDeleteArgs<ExtArgs>>): Prisma__BodyAnalysisClient<$Result.GetResult<Prisma.$BodyAnalysisPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one BodyAnalysis.
     * @param {BodyAnalysisUpdateArgs} args - Arguments to update one BodyAnalysis.
     * @example
     * // Update one BodyAnalysis
     * const bodyAnalysis = await prisma.bodyAnalysis.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BodyAnalysisUpdateArgs>(args: SelectSubset<T, BodyAnalysisUpdateArgs<ExtArgs>>): Prisma__BodyAnalysisClient<$Result.GetResult<Prisma.$BodyAnalysisPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more BodyAnalyses.
     * @param {BodyAnalysisDeleteManyArgs} args - Arguments to filter BodyAnalyses to delete.
     * @example
     * // Delete a few BodyAnalyses
     * const { count } = await prisma.bodyAnalysis.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BodyAnalysisDeleteManyArgs>(args?: SelectSubset<T, BodyAnalysisDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BodyAnalyses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BodyAnalysisUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BodyAnalyses
     * const bodyAnalysis = await prisma.bodyAnalysis.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BodyAnalysisUpdateManyArgs>(args: SelectSubset<T, BodyAnalysisUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one BodyAnalysis.
     * @param {BodyAnalysisUpsertArgs} args - Arguments to update or create a BodyAnalysis.
     * @example
     * // Update or create a BodyAnalysis
     * const bodyAnalysis = await prisma.bodyAnalysis.upsert({
     *   create: {
     *     // ... data to create a BodyAnalysis
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BodyAnalysis we want to update
     *   }
     * })
     */
    upsert<T extends BodyAnalysisUpsertArgs>(args: SelectSubset<T, BodyAnalysisUpsertArgs<ExtArgs>>): Prisma__BodyAnalysisClient<$Result.GetResult<Prisma.$BodyAnalysisPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of BodyAnalyses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BodyAnalysisCountArgs} args - Arguments to filter BodyAnalyses to count.
     * @example
     * // Count the number of BodyAnalyses
     * const count = await prisma.bodyAnalysis.count({
     *   where: {
     *     // ... the filter for the BodyAnalyses we want to count
     *   }
     * })
    **/
    count<T extends BodyAnalysisCountArgs>(
      args?: Subset<T, BodyAnalysisCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BodyAnalysisCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a BodyAnalysis.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BodyAnalysisAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BodyAnalysisAggregateArgs>(args: Subset<T, BodyAnalysisAggregateArgs>): Prisma.PrismaPromise<GetBodyAnalysisAggregateType<T>>

    /**
     * Group by BodyAnalysis.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BodyAnalysisGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BodyAnalysisGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BodyAnalysisGroupByArgs['orderBy'] }
        : { orderBy?: BodyAnalysisGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BodyAnalysisGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBodyAnalysisGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the BodyAnalysis model
   */
  readonly fields: BodyAnalysisFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for BodyAnalysis.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BodyAnalysisClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the BodyAnalysis model
   */
  interface BodyAnalysisFieldRefs {
    readonly id: FieldRef<"BodyAnalysis", 'String'>
    readonly userId: FieldRef<"BodyAnalysis", 'String'>
    readonly bodyType: FieldRef<"BodyAnalysis", 'String'>
    readonly measurements: FieldRef<"BodyAnalysis", 'Json'>
    readonly bodyComposition: FieldRef<"BodyAnalysis", 'Json'>
    readonly recommendations: FieldRef<"BodyAnalysis", 'Json'>
    readonly imageUrl: FieldRef<"BodyAnalysis", 'String'>
    readonly aiConfidence: FieldRef<"BodyAnalysis", 'Float'>
    readonly createdAt: FieldRef<"BodyAnalysis", 'DateTime'>
    readonly updatedAt: FieldRef<"BodyAnalysis", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * BodyAnalysis findUnique
   */
  export type BodyAnalysisFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BodyAnalysis
     */
    select?: BodyAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BodyAnalysis
     */
    omit?: BodyAnalysisOmit<ExtArgs> | null
    /**
     * Filter, which BodyAnalysis to fetch.
     */
    where: BodyAnalysisWhereUniqueInput
  }

  /**
   * BodyAnalysis findUniqueOrThrow
   */
  export type BodyAnalysisFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BodyAnalysis
     */
    select?: BodyAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BodyAnalysis
     */
    omit?: BodyAnalysisOmit<ExtArgs> | null
    /**
     * Filter, which BodyAnalysis to fetch.
     */
    where: BodyAnalysisWhereUniqueInput
  }

  /**
   * BodyAnalysis findFirst
   */
  export type BodyAnalysisFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BodyAnalysis
     */
    select?: BodyAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BodyAnalysis
     */
    omit?: BodyAnalysisOmit<ExtArgs> | null
    /**
     * Filter, which BodyAnalysis to fetch.
     */
    where?: BodyAnalysisWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BodyAnalyses to fetch.
     */
    orderBy?: BodyAnalysisOrderByWithRelationInput | BodyAnalysisOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BodyAnalyses.
     */
    cursor?: BodyAnalysisWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BodyAnalyses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BodyAnalyses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BodyAnalyses.
     */
    distinct?: BodyAnalysisScalarFieldEnum | BodyAnalysisScalarFieldEnum[]
  }

  /**
   * BodyAnalysis findFirstOrThrow
   */
  export type BodyAnalysisFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BodyAnalysis
     */
    select?: BodyAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BodyAnalysis
     */
    omit?: BodyAnalysisOmit<ExtArgs> | null
    /**
     * Filter, which BodyAnalysis to fetch.
     */
    where?: BodyAnalysisWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BodyAnalyses to fetch.
     */
    orderBy?: BodyAnalysisOrderByWithRelationInput | BodyAnalysisOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BodyAnalyses.
     */
    cursor?: BodyAnalysisWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BodyAnalyses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BodyAnalyses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BodyAnalyses.
     */
    distinct?: BodyAnalysisScalarFieldEnum | BodyAnalysisScalarFieldEnum[]
  }

  /**
   * BodyAnalysis findMany
   */
  export type BodyAnalysisFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BodyAnalysis
     */
    select?: BodyAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BodyAnalysis
     */
    omit?: BodyAnalysisOmit<ExtArgs> | null
    /**
     * Filter, which BodyAnalyses to fetch.
     */
    where?: BodyAnalysisWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BodyAnalyses to fetch.
     */
    orderBy?: BodyAnalysisOrderByWithRelationInput | BodyAnalysisOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing BodyAnalyses.
     */
    cursor?: BodyAnalysisWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BodyAnalyses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BodyAnalyses.
     */
    skip?: number
    distinct?: BodyAnalysisScalarFieldEnum | BodyAnalysisScalarFieldEnum[]
  }

  /**
   * BodyAnalysis create
   */
  export type BodyAnalysisCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BodyAnalysis
     */
    select?: BodyAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BodyAnalysis
     */
    omit?: BodyAnalysisOmit<ExtArgs> | null
    /**
     * The data needed to create a BodyAnalysis.
     */
    data: XOR<BodyAnalysisCreateInput, BodyAnalysisUncheckedCreateInput>
  }

  /**
   * BodyAnalysis createMany
   */
  export type BodyAnalysisCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many BodyAnalyses.
     */
    data: BodyAnalysisCreateManyInput | BodyAnalysisCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BodyAnalysis update
   */
  export type BodyAnalysisUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BodyAnalysis
     */
    select?: BodyAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BodyAnalysis
     */
    omit?: BodyAnalysisOmit<ExtArgs> | null
    /**
     * The data needed to update a BodyAnalysis.
     */
    data: XOR<BodyAnalysisUpdateInput, BodyAnalysisUncheckedUpdateInput>
    /**
     * Choose, which BodyAnalysis to update.
     */
    where: BodyAnalysisWhereUniqueInput
  }

  /**
   * BodyAnalysis updateMany
   */
  export type BodyAnalysisUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update BodyAnalyses.
     */
    data: XOR<BodyAnalysisUpdateManyMutationInput, BodyAnalysisUncheckedUpdateManyInput>
    /**
     * Filter which BodyAnalyses to update
     */
    where?: BodyAnalysisWhereInput
    /**
     * Limit how many BodyAnalyses to update.
     */
    limit?: number
  }

  /**
   * BodyAnalysis upsert
   */
  export type BodyAnalysisUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BodyAnalysis
     */
    select?: BodyAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BodyAnalysis
     */
    omit?: BodyAnalysisOmit<ExtArgs> | null
    /**
     * The filter to search for the BodyAnalysis to update in case it exists.
     */
    where: BodyAnalysisWhereUniqueInput
    /**
     * In case the BodyAnalysis found by the `where` argument doesn't exist, create a new BodyAnalysis with this data.
     */
    create: XOR<BodyAnalysisCreateInput, BodyAnalysisUncheckedCreateInput>
    /**
     * In case the BodyAnalysis was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BodyAnalysisUpdateInput, BodyAnalysisUncheckedUpdateInput>
  }

  /**
   * BodyAnalysis delete
   */
  export type BodyAnalysisDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BodyAnalysis
     */
    select?: BodyAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BodyAnalysis
     */
    omit?: BodyAnalysisOmit<ExtArgs> | null
    /**
     * Filter which BodyAnalysis to delete.
     */
    where: BodyAnalysisWhereUniqueInput
  }

  /**
   * BodyAnalysis deleteMany
   */
  export type BodyAnalysisDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BodyAnalyses to delete
     */
    where?: BodyAnalysisWhereInput
    /**
     * Limit how many BodyAnalyses to delete.
     */
    limit?: number
  }

  /**
   * BodyAnalysis without action
   */
  export type BodyAnalysisDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BodyAnalysis
     */
    select?: BodyAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BodyAnalysis
     */
    omit?: BodyAnalysisOmit<ExtArgs> | null
  }


  /**
   * Model AISuggestion
   */

  export type AggregateAISuggestion = {
    _count: AISuggestionCountAggregateOutputType | null
    _min: AISuggestionMinAggregateOutputType | null
    _max: AISuggestionMaxAggregateOutputType | null
  }

  export type AISuggestionMinAggregateOutputType = {
    id: string | null
    type: string | null
    title: string | null
    description: string | null
    priority: string | null
    dismissedAt: Date | null
    createdAt: Date | null
  }

  export type AISuggestionMaxAggregateOutputType = {
    id: string | null
    type: string | null
    title: string | null
    description: string | null
    priority: string | null
    dismissedAt: Date | null
    createdAt: Date | null
  }

  export type AISuggestionCountAggregateOutputType = {
    id: number
    type: number
    title: number
    description: number
    priority: number
    basedOn: number
    actions: number
    dismissedAt: number
    createdAt: number
    _all: number
  }


  export type AISuggestionMinAggregateInputType = {
    id?: true
    type?: true
    title?: true
    description?: true
    priority?: true
    dismissedAt?: true
    createdAt?: true
  }

  export type AISuggestionMaxAggregateInputType = {
    id?: true
    type?: true
    title?: true
    description?: true
    priority?: true
    dismissedAt?: true
    createdAt?: true
  }

  export type AISuggestionCountAggregateInputType = {
    id?: true
    type?: true
    title?: true
    description?: true
    priority?: true
    basedOn?: true
    actions?: true
    dismissedAt?: true
    createdAt?: true
    _all?: true
  }

  export type AISuggestionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AISuggestion to aggregate.
     */
    where?: AISuggestionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AISuggestions to fetch.
     */
    orderBy?: AISuggestionOrderByWithRelationInput | AISuggestionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AISuggestionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AISuggestions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AISuggestions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AISuggestions
    **/
    _count?: true | AISuggestionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AISuggestionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AISuggestionMaxAggregateInputType
  }

  export type GetAISuggestionAggregateType<T extends AISuggestionAggregateArgs> = {
        [P in keyof T & keyof AggregateAISuggestion]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAISuggestion[P]>
      : GetScalarType<T[P], AggregateAISuggestion[P]>
  }




  export type AISuggestionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AISuggestionWhereInput
    orderBy?: AISuggestionOrderByWithAggregationInput | AISuggestionOrderByWithAggregationInput[]
    by: AISuggestionScalarFieldEnum[] | AISuggestionScalarFieldEnum
    having?: AISuggestionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AISuggestionCountAggregateInputType | true
    _min?: AISuggestionMinAggregateInputType
    _max?: AISuggestionMaxAggregateInputType
  }

  export type AISuggestionGroupByOutputType = {
    id: string
    type: string
    title: string
    description: string
    priority: string
    basedOn: JsonValue
    actions: JsonValue | null
    dismissedAt: Date | null
    createdAt: Date
    _count: AISuggestionCountAggregateOutputType | null
    _min: AISuggestionMinAggregateOutputType | null
    _max: AISuggestionMaxAggregateOutputType | null
  }

  type GetAISuggestionGroupByPayload<T extends AISuggestionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AISuggestionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AISuggestionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AISuggestionGroupByOutputType[P]>
            : GetScalarType<T[P], AISuggestionGroupByOutputType[P]>
        }
      >
    >


  export type AISuggestionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    title?: boolean
    description?: boolean
    priority?: boolean
    basedOn?: boolean
    actions?: boolean
    dismissedAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["aISuggestion"]>



  export type AISuggestionSelectScalar = {
    id?: boolean
    type?: boolean
    title?: boolean
    description?: boolean
    priority?: boolean
    basedOn?: boolean
    actions?: boolean
    dismissedAt?: boolean
    createdAt?: boolean
  }

  export type AISuggestionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "type" | "title" | "description" | "priority" | "basedOn" | "actions" | "dismissedAt" | "createdAt", ExtArgs["result"]["aISuggestion"]>

  export type $AISuggestionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AISuggestion"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      type: string
      title: string
      description: string
      priority: string
      basedOn: Prisma.JsonValue
      actions: Prisma.JsonValue | null
      dismissedAt: Date | null
      createdAt: Date
    }, ExtArgs["result"]["aISuggestion"]>
    composites: {}
  }

  type AISuggestionGetPayload<S extends boolean | null | undefined | AISuggestionDefaultArgs> = $Result.GetResult<Prisma.$AISuggestionPayload, S>

  type AISuggestionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AISuggestionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AISuggestionCountAggregateInputType | true
    }

  export interface AISuggestionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AISuggestion'], meta: { name: 'AISuggestion' } }
    /**
     * Find zero or one AISuggestion that matches the filter.
     * @param {AISuggestionFindUniqueArgs} args - Arguments to find a AISuggestion
     * @example
     * // Get one AISuggestion
     * const aISuggestion = await prisma.aISuggestion.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AISuggestionFindUniqueArgs>(args: SelectSubset<T, AISuggestionFindUniqueArgs<ExtArgs>>): Prisma__AISuggestionClient<$Result.GetResult<Prisma.$AISuggestionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AISuggestion that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AISuggestionFindUniqueOrThrowArgs} args - Arguments to find a AISuggestion
     * @example
     * // Get one AISuggestion
     * const aISuggestion = await prisma.aISuggestion.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AISuggestionFindUniqueOrThrowArgs>(args: SelectSubset<T, AISuggestionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AISuggestionClient<$Result.GetResult<Prisma.$AISuggestionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AISuggestion that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AISuggestionFindFirstArgs} args - Arguments to find a AISuggestion
     * @example
     * // Get one AISuggestion
     * const aISuggestion = await prisma.aISuggestion.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AISuggestionFindFirstArgs>(args?: SelectSubset<T, AISuggestionFindFirstArgs<ExtArgs>>): Prisma__AISuggestionClient<$Result.GetResult<Prisma.$AISuggestionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AISuggestion that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AISuggestionFindFirstOrThrowArgs} args - Arguments to find a AISuggestion
     * @example
     * // Get one AISuggestion
     * const aISuggestion = await prisma.aISuggestion.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AISuggestionFindFirstOrThrowArgs>(args?: SelectSubset<T, AISuggestionFindFirstOrThrowArgs<ExtArgs>>): Prisma__AISuggestionClient<$Result.GetResult<Prisma.$AISuggestionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AISuggestions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AISuggestionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AISuggestions
     * const aISuggestions = await prisma.aISuggestion.findMany()
     * 
     * // Get first 10 AISuggestions
     * const aISuggestions = await prisma.aISuggestion.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const aISuggestionWithIdOnly = await prisma.aISuggestion.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AISuggestionFindManyArgs>(args?: SelectSubset<T, AISuggestionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AISuggestionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AISuggestion.
     * @param {AISuggestionCreateArgs} args - Arguments to create a AISuggestion.
     * @example
     * // Create one AISuggestion
     * const AISuggestion = await prisma.aISuggestion.create({
     *   data: {
     *     // ... data to create a AISuggestion
     *   }
     * })
     * 
     */
    create<T extends AISuggestionCreateArgs>(args: SelectSubset<T, AISuggestionCreateArgs<ExtArgs>>): Prisma__AISuggestionClient<$Result.GetResult<Prisma.$AISuggestionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AISuggestions.
     * @param {AISuggestionCreateManyArgs} args - Arguments to create many AISuggestions.
     * @example
     * // Create many AISuggestions
     * const aISuggestion = await prisma.aISuggestion.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AISuggestionCreateManyArgs>(args?: SelectSubset<T, AISuggestionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a AISuggestion.
     * @param {AISuggestionDeleteArgs} args - Arguments to delete one AISuggestion.
     * @example
     * // Delete one AISuggestion
     * const AISuggestion = await prisma.aISuggestion.delete({
     *   where: {
     *     // ... filter to delete one AISuggestion
     *   }
     * })
     * 
     */
    delete<T extends AISuggestionDeleteArgs>(args: SelectSubset<T, AISuggestionDeleteArgs<ExtArgs>>): Prisma__AISuggestionClient<$Result.GetResult<Prisma.$AISuggestionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AISuggestion.
     * @param {AISuggestionUpdateArgs} args - Arguments to update one AISuggestion.
     * @example
     * // Update one AISuggestion
     * const aISuggestion = await prisma.aISuggestion.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AISuggestionUpdateArgs>(args: SelectSubset<T, AISuggestionUpdateArgs<ExtArgs>>): Prisma__AISuggestionClient<$Result.GetResult<Prisma.$AISuggestionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AISuggestions.
     * @param {AISuggestionDeleteManyArgs} args - Arguments to filter AISuggestions to delete.
     * @example
     * // Delete a few AISuggestions
     * const { count } = await prisma.aISuggestion.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AISuggestionDeleteManyArgs>(args?: SelectSubset<T, AISuggestionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AISuggestions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AISuggestionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AISuggestions
     * const aISuggestion = await prisma.aISuggestion.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AISuggestionUpdateManyArgs>(args: SelectSubset<T, AISuggestionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AISuggestion.
     * @param {AISuggestionUpsertArgs} args - Arguments to update or create a AISuggestion.
     * @example
     * // Update or create a AISuggestion
     * const aISuggestion = await prisma.aISuggestion.upsert({
     *   create: {
     *     // ... data to create a AISuggestion
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AISuggestion we want to update
     *   }
     * })
     */
    upsert<T extends AISuggestionUpsertArgs>(args: SelectSubset<T, AISuggestionUpsertArgs<ExtArgs>>): Prisma__AISuggestionClient<$Result.GetResult<Prisma.$AISuggestionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AISuggestions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AISuggestionCountArgs} args - Arguments to filter AISuggestions to count.
     * @example
     * // Count the number of AISuggestions
     * const count = await prisma.aISuggestion.count({
     *   where: {
     *     // ... the filter for the AISuggestions we want to count
     *   }
     * })
    **/
    count<T extends AISuggestionCountArgs>(
      args?: Subset<T, AISuggestionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AISuggestionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AISuggestion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AISuggestionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AISuggestionAggregateArgs>(args: Subset<T, AISuggestionAggregateArgs>): Prisma.PrismaPromise<GetAISuggestionAggregateType<T>>

    /**
     * Group by AISuggestion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AISuggestionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AISuggestionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AISuggestionGroupByArgs['orderBy'] }
        : { orderBy?: AISuggestionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AISuggestionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAISuggestionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AISuggestion model
   */
  readonly fields: AISuggestionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AISuggestion.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AISuggestionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AISuggestion model
   */
  interface AISuggestionFieldRefs {
    readonly id: FieldRef<"AISuggestion", 'String'>
    readonly type: FieldRef<"AISuggestion", 'String'>
    readonly title: FieldRef<"AISuggestion", 'String'>
    readonly description: FieldRef<"AISuggestion", 'String'>
    readonly priority: FieldRef<"AISuggestion", 'String'>
    readonly basedOn: FieldRef<"AISuggestion", 'Json'>
    readonly actions: FieldRef<"AISuggestion", 'Json'>
    readonly dismissedAt: FieldRef<"AISuggestion", 'DateTime'>
    readonly createdAt: FieldRef<"AISuggestion", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AISuggestion findUnique
   */
  export type AISuggestionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AISuggestion
     */
    select?: AISuggestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AISuggestion
     */
    omit?: AISuggestionOmit<ExtArgs> | null
    /**
     * Filter, which AISuggestion to fetch.
     */
    where: AISuggestionWhereUniqueInput
  }

  /**
   * AISuggestion findUniqueOrThrow
   */
  export type AISuggestionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AISuggestion
     */
    select?: AISuggestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AISuggestion
     */
    omit?: AISuggestionOmit<ExtArgs> | null
    /**
     * Filter, which AISuggestion to fetch.
     */
    where: AISuggestionWhereUniqueInput
  }

  /**
   * AISuggestion findFirst
   */
  export type AISuggestionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AISuggestion
     */
    select?: AISuggestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AISuggestion
     */
    omit?: AISuggestionOmit<ExtArgs> | null
    /**
     * Filter, which AISuggestion to fetch.
     */
    where?: AISuggestionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AISuggestions to fetch.
     */
    orderBy?: AISuggestionOrderByWithRelationInput | AISuggestionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AISuggestions.
     */
    cursor?: AISuggestionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AISuggestions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AISuggestions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AISuggestions.
     */
    distinct?: AISuggestionScalarFieldEnum | AISuggestionScalarFieldEnum[]
  }

  /**
   * AISuggestion findFirstOrThrow
   */
  export type AISuggestionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AISuggestion
     */
    select?: AISuggestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AISuggestion
     */
    omit?: AISuggestionOmit<ExtArgs> | null
    /**
     * Filter, which AISuggestion to fetch.
     */
    where?: AISuggestionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AISuggestions to fetch.
     */
    orderBy?: AISuggestionOrderByWithRelationInput | AISuggestionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AISuggestions.
     */
    cursor?: AISuggestionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AISuggestions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AISuggestions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AISuggestions.
     */
    distinct?: AISuggestionScalarFieldEnum | AISuggestionScalarFieldEnum[]
  }

  /**
   * AISuggestion findMany
   */
  export type AISuggestionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AISuggestion
     */
    select?: AISuggestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AISuggestion
     */
    omit?: AISuggestionOmit<ExtArgs> | null
    /**
     * Filter, which AISuggestions to fetch.
     */
    where?: AISuggestionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AISuggestions to fetch.
     */
    orderBy?: AISuggestionOrderByWithRelationInput | AISuggestionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AISuggestions.
     */
    cursor?: AISuggestionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AISuggestions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AISuggestions.
     */
    skip?: number
    distinct?: AISuggestionScalarFieldEnum | AISuggestionScalarFieldEnum[]
  }

  /**
   * AISuggestion create
   */
  export type AISuggestionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AISuggestion
     */
    select?: AISuggestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AISuggestion
     */
    omit?: AISuggestionOmit<ExtArgs> | null
    /**
     * The data needed to create a AISuggestion.
     */
    data: XOR<AISuggestionCreateInput, AISuggestionUncheckedCreateInput>
  }

  /**
   * AISuggestion createMany
   */
  export type AISuggestionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AISuggestions.
     */
    data: AISuggestionCreateManyInput | AISuggestionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AISuggestion update
   */
  export type AISuggestionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AISuggestion
     */
    select?: AISuggestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AISuggestion
     */
    omit?: AISuggestionOmit<ExtArgs> | null
    /**
     * The data needed to update a AISuggestion.
     */
    data: XOR<AISuggestionUpdateInput, AISuggestionUncheckedUpdateInput>
    /**
     * Choose, which AISuggestion to update.
     */
    where: AISuggestionWhereUniqueInput
  }

  /**
   * AISuggestion updateMany
   */
  export type AISuggestionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AISuggestions.
     */
    data: XOR<AISuggestionUpdateManyMutationInput, AISuggestionUncheckedUpdateManyInput>
    /**
     * Filter which AISuggestions to update
     */
    where?: AISuggestionWhereInput
    /**
     * Limit how many AISuggestions to update.
     */
    limit?: number
  }

  /**
   * AISuggestion upsert
   */
  export type AISuggestionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AISuggestion
     */
    select?: AISuggestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AISuggestion
     */
    omit?: AISuggestionOmit<ExtArgs> | null
    /**
     * The filter to search for the AISuggestion to update in case it exists.
     */
    where: AISuggestionWhereUniqueInput
    /**
     * In case the AISuggestion found by the `where` argument doesn't exist, create a new AISuggestion with this data.
     */
    create: XOR<AISuggestionCreateInput, AISuggestionUncheckedCreateInput>
    /**
     * In case the AISuggestion was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AISuggestionUpdateInput, AISuggestionUncheckedUpdateInput>
  }

  /**
   * AISuggestion delete
   */
  export type AISuggestionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AISuggestion
     */
    select?: AISuggestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AISuggestion
     */
    omit?: AISuggestionOmit<ExtArgs> | null
    /**
     * Filter which AISuggestion to delete.
     */
    where: AISuggestionWhereUniqueInput
  }

  /**
   * AISuggestion deleteMany
   */
  export type AISuggestionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AISuggestions to delete
     */
    where?: AISuggestionWhereInput
    /**
     * Limit how many AISuggestions to delete.
     */
    limit?: number
  }

  /**
   * AISuggestion without action
   */
  export type AISuggestionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AISuggestion
     */
    select?: AISuggestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AISuggestion
     */
    omit?: AISuggestionOmit<ExtArgs> | null
  }


  /**
   * Model ChatMessage
   */

  export type AggregateChatMessage = {
    _count: ChatMessageCountAggregateOutputType | null
    _min: ChatMessageMinAggregateOutputType | null
    _max: ChatMessageMaxAggregateOutputType | null
  }

  export type ChatMessageMinAggregateOutputType = {
    id: string | null
    userId: string | null
    role: string | null
    content: string | null
    timestamp: Date | null
  }

  export type ChatMessageMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    role: string | null
    content: string | null
    timestamp: Date | null
  }

  export type ChatMessageCountAggregateOutputType = {
    id: number
    userId: number
    role: number
    content: number
    timestamp: number
    _all: number
  }


  export type ChatMessageMinAggregateInputType = {
    id?: true
    userId?: true
    role?: true
    content?: true
    timestamp?: true
  }

  export type ChatMessageMaxAggregateInputType = {
    id?: true
    userId?: true
    role?: true
    content?: true
    timestamp?: true
  }

  export type ChatMessageCountAggregateInputType = {
    id?: true
    userId?: true
    role?: true
    content?: true
    timestamp?: true
    _all?: true
  }

  export type ChatMessageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ChatMessage to aggregate.
     */
    where?: ChatMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChatMessages to fetch.
     */
    orderBy?: ChatMessageOrderByWithRelationInput | ChatMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ChatMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChatMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChatMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ChatMessages
    **/
    _count?: true | ChatMessageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ChatMessageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ChatMessageMaxAggregateInputType
  }

  export type GetChatMessageAggregateType<T extends ChatMessageAggregateArgs> = {
        [P in keyof T & keyof AggregateChatMessage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateChatMessage[P]>
      : GetScalarType<T[P], AggregateChatMessage[P]>
  }




  export type ChatMessageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ChatMessageWhereInput
    orderBy?: ChatMessageOrderByWithAggregationInput | ChatMessageOrderByWithAggregationInput[]
    by: ChatMessageScalarFieldEnum[] | ChatMessageScalarFieldEnum
    having?: ChatMessageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ChatMessageCountAggregateInputType | true
    _min?: ChatMessageMinAggregateInputType
    _max?: ChatMessageMaxAggregateInputType
  }

  export type ChatMessageGroupByOutputType = {
    id: string
    userId: string
    role: string
    content: string
    timestamp: Date
    _count: ChatMessageCountAggregateOutputType | null
    _min: ChatMessageMinAggregateOutputType | null
    _max: ChatMessageMaxAggregateOutputType | null
  }

  type GetChatMessageGroupByPayload<T extends ChatMessageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ChatMessageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ChatMessageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ChatMessageGroupByOutputType[P]>
            : GetScalarType<T[P], ChatMessageGroupByOutputType[P]>
        }
      >
    >


  export type ChatMessageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    role?: boolean
    content?: boolean
    timestamp?: boolean
  }, ExtArgs["result"]["chatMessage"]>



  export type ChatMessageSelectScalar = {
    id?: boolean
    userId?: boolean
    role?: boolean
    content?: boolean
    timestamp?: boolean
  }

  export type ChatMessageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "role" | "content" | "timestamp", ExtArgs["result"]["chatMessage"]>

  export type $ChatMessagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ChatMessage"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      role: string
      content: string
      timestamp: Date
    }, ExtArgs["result"]["chatMessage"]>
    composites: {}
  }

  type ChatMessageGetPayload<S extends boolean | null | undefined | ChatMessageDefaultArgs> = $Result.GetResult<Prisma.$ChatMessagePayload, S>

  type ChatMessageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ChatMessageFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ChatMessageCountAggregateInputType | true
    }

  export interface ChatMessageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ChatMessage'], meta: { name: 'ChatMessage' } }
    /**
     * Find zero or one ChatMessage that matches the filter.
     * @param {ChatMessageFindUniqueArgs} args - Arguments to find a ChatMessage
     * @example
     * // Get one ChatMessage
     * const chatMessage = await prisma.chatMessage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ChatMessageFindUniqueArgs>(args: SelectSubset<T, ChatMessageFindUniqueArgs<ExtArgs>>): Prisma__ChatMessageClient<$Result.GetResult<Prisma.$ChatMessagePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ChatMessage that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ChatMessageFindUniqueOrThrowArgs} args - Arguments to find a ChatMessage
     * @example
     * // Get one ChatMessage
     * const chatMessage = await prisma.chatMessage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ChatMessageFindUniqueOrThrowArgs>(args: SelectSubset<T, ChatMessageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ChatMessageClient<$Result.GetResult<Prisma.$ChatMessagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ChatMessage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatMessageFindFirstArgs} args - Arguments to find a ChatMessage
     * @example
     * // Get one ChatMessage
     * const chatMessage = await prisma.chatMessage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ChatMessageFindFirstArgs>(args?: SelectSubset<T, ChatMessageFindFirstArgs<ExtArgs>>): Prisma__ChatMessageClient<$Result.GetResult<Prisma.$ChatMessagePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ChatMessage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatMessageFindFirstOrThrowArgs} args - Arguments to find a ChatMessage
     * @example
     * // Get one ChatMessage
     * const chatMessage = await prisma.chatMessage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ChatMessageFindFirstOrThrowArgs>(args?: SelectSubset<T, ChatMessageFindFirstOrThrowArgs<ExtArgs>>): Prisma__ChatMessageClient<$Result.GetResult<Prisma.$ChatMessagePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ChatMessages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatMessageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ChatMessages
     * const chatMessages = await prisma.chatMessage.findMany()
     * 
     * // Get first 10 ChatMessages
     * const chatMessages = await prisma.chatMessage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const chatMessageWithIdOnly = await prisma.chatMessage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ChatMessageFindManyArgs>(args?: SelectSubset<T, ChatMessageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChatMessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ChatMessage.
     * @param {ChatMessageCreateArgs} args - Arguments to create a ChatMessage.
     * @example
     * // Create one ChatMessage
     * const ChatMessage = await prisma.chatMessage.create({
     *   data: {
     *     // ... data to create a ChatMessage
     *   }
     * })
     * 
     */
    create<T extends ChatMessageCreateArgs>(args: SelectSubset<T, ChatMessageCreateArgs<ExtArgs>>): Prisma__ChatMessageClient<$Result.GetResult<Prisma.$ChatMessagePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ChatMessages.
     * @param {ChatMessageCreateManyArgs} args - Arguments to create many ChatMessages.
     * @example
     * // Create many ChatMessages
     * const chatMessage = await prisma.chatMessage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ChatMessageCreateManyArgs>(args?: SelectSubset<T, ChatMessageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a ChatMessage.
     * @param {ChatMessageDeleteArgs} args - Arguments to delete one ChatMessage.
     * @example
     * // Delete one ChatMessage
     * const ChatMessage = await prisma.chatMessage.delete({
     *   where: {
     *     // ... filter to delete one ChatMessage
     *   }
     * })
     * 
     */
    delete<T extends ChatMessageDeleteArgs>(args: SelectSubset<T, ChatMessageDeleteArgs<ExtArgs>>): Prisma__ChatMessageClient<$Result.GetResult<Prisma.$ChatMessagePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ChatMessage.
     * @param {ChatMessageUpdateArgs} args - Arguments to update one ChatMessage.
     * @example
     * // Update one ChatMessage
     * const chatMessage = await prisma.chatMessage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ChatMessageUpdateArgs>(args: SelectSubset<T, ChatMessageUpdateArgs<ExtArgs>>): Prisma__ChatMessageClient<$Result.GetResult<Prisma.$ChatMessagePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ChatMessages.
     * @param {ChatMessageDeleteManyArgs} args - Arguments to filter ChatMessages to delete.
     * @example
     * // Delete a few ChatMessages
     * const { count } = await prisma.chatMessage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ChatMessageDeleteManyArgs>(args?: SelectSubset<T, ChatMessageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ChatMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatMessageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ChatMessages
     * const chatMessage = await prisma.chatMessage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ChatMessageUpdateManyArgs>(args: SelectSubset<T, ChatMessageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ChatMessage.
     * @param {ChatMessageUpsertArgs} args - Arguments to update or create a ChatMessage.
     * @example
     * // Update or create a ChatMessage
     * const chatMessage = await prisma.chatMessage.upsert({
     *   create: {
     *     // ... data to create a ChatMessage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ChatMessage we want to update
     *   }
     * })
     */
    upsert<T extends ChatMessageUpsertArgs>(args: SelectSubset<T, ChatMessageUpsertArgs<ExtArgs>>): Prisma__ChatMessageClient<$Result.GetResult<Prisma.$ChatMessagePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ChatMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatMessageCountArgs} args - Arguments to filter ChatMessages to count.
     * @example
     * // Count the number of ChatMessages
     * const count = await prisma.chatMessage.count({
     *   where: {
     *     // ... the filter for the ChatMessages we want to count
     *   }
     * })
    **/
    count<T extends ChatMessageCountArgs>(
      args?: Subset<T, ChatMessageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ChatMessageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ChatMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatMessageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ChatMessageAggregateArgs>(args: Subset<T, ChatMessageAggregateArgs>): Prisma.PrismaPromise<GetChatMessageAggregateType<T>>

    /**
     * Group by ChatMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatMessageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ChatMessageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ChatMessageGroupByArgs['orderBy'] }
        : { orderBy?: ChatMessageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ChatMessageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetChatMessageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ChatMessage model
   */
  readonly fields: ChatMessageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ChatMessage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ChatMessageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ChatMessage model
   */
  interface ChatMessageFieldRefs {
    readonly id: FieldRef<"ChatMessage", 'String'>
    readonly userId: FieldRef<"ChatMessage", 'String'>
    readonly role: FieldRef<"ChatMessage", 'String'>
    readonly content: FieldRef<"ChatMessage", 'String'>
    readonly timestamp: FieldRef<"ChatMessage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ChatMessage findUnique
   */
  export type ChatMessageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatMessage
     */
    select?: ChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatMessage
     */
    omit?: ChatMessageOmit<ExtArgs> | null
    /**
     * Filter, which ChatMessage to fetch.
     */
    where: ChatMessageWhereUniqueInput
  }

  /**
   * ChatMessage findUniqueOrThrow
   */
  export type ChatMessageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatMessage
     */
    select?: ChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatMessage
     */
    omit?: ChatMessageOmit<ExtArgs> | null
    /**
     * Filter, which ChatMessage to fetch.
     */
    where: ChatMessageWhereUniqueInput
  }

  /**
   * ChatMessage findFirst
   */
  export type ChatMessageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatMessage
     */
    select?: ChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatMessage
     */
    omit?: ChatMessageOmit<ExtArgs> | null
    /**
     * Filter, which ChatMessage to fetch.
     */
    where?: ChatMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChatMessages to fetch.
     */
    orderBy?: ChatMessageOrderByWithRelationInput | ChatMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ChatMessages.
     */
    cursor?: ChatMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChatMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChatMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ChatMessages.
     */
    distinct?: ChatMessageScalarFieldEnum | ChatMessageScalarFieldEnum[]
  }

  /**
   * ChatMessage findFirstOrThrow
   */
  export type ChatMessageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatMessage
     */
    select?: ChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatMessage
     */
    omit?: ChatMessageOmit<ExtArgs> | null
    /**
     * Filter, which ChatMessage to fetch.
     */
    where?: ChatMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChatMessages to fetch.
     */
    orderBy?: ChatMessageOrderByWithRelationInput | ChatMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ChatMessages.
     */
    cursor?: ChatMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChatMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChatMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ChatMessages.
     */
    distinct?: ChatMessageScalarFieldEnum | ChatMessageScalarFieldEnum[]
  }

  /**
   * ChatMessage findMany
   */
  export type ChatMessageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatMessage
     */
    select?: ChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatMessage
     */
    omit?: ChatMessageOmit<ExtArgs> | null
    /**
     * Filter, which ChatMessages to fetch.
     */
    where?: ChatMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChatMessages to fetch.
     */
    orderBy?: ChatMessageOrderByWithRelationInput | ChatMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ChatMessages.
     */
    cursor?: ChatMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChatMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChatMessages.
     */
    skip?: number
    distinct?: ChatMessageScalarFieldEnum | ChatMessageScalarFieldEnum[]
  }

  /**
   * ChatMessage create
   */
  export type ChatMessageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatMessage
     */
    select?: ChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatMessage
     */
    omit?: ChatMessageOmit<ExtArgs> | null
    /**
     * The data needed to create a ChatMessage.
     */
    data: XOR<ChatMessageCreateInput, ChatMessageUncheckedCreateInput>
  }

  /**
   * ChatMessage createMany
   */
  export type ChatMessageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ChatMessages.
     */
    data: ChatMessageCreateManyInput | ChatMessageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ChatMessage update
   */
  export type ChatMessageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatMessage
     */
    select?: ChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatMessage
     */
    omit?: ChatMessageOmit<ExtArgs> | null
    /**
     * The data needed to update a ChatMessage.
     */
    data: XOR<ChatMessageUpdateInput, ChatMessageUncheckedUpdateInput>
    /**
     * Choose, which ChatMessage to update.
     */
    where: ChatMessageWhereUniqueInput
  }

  /**
   * ChatMessage updateMany
   */
  export type ChatMessageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ChatMessages.
     */
    data: XOR<ChatMessageUpdateManyMutationInput, ChatMessageUncheckedUpdateManyInput>
    /**
     * Filter which ChatMessages to update
     */
    where?: ChatMessageWhereInput
    /**
     * Limit how many ChatMessages to update.
     */
    limit?: number
  }

  /**
   * ChatMessage upsert
   */
  export type ChatMessageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatMessage
     */
    select?: ChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatMessage
     */
    omit?: ChatMessageOmit<ExtArgs> | null
    /**
     * The filter to search for the ChatMessage to update in case it exists.
     */
    where: ChatMessageWhereUniqueInput
    /**
     * In case the ChatMessage found by the `where` argument doesn't exist, create a new ChatMessage with this data.
     */
    create: XOR<ChatMessageCreateInput, ChatMessageUncheckedCreateInput>
    /**
     * In case the ChatMessage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ChatMessageUpdateInput, ChatMessageUncheckedUpdateInput>
  }

  /**
   * ChatMessage delete
   */
  export type ChatMessageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatMessage
     */
    select?: ChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatMessage
     */
    omit?: ChatMessageOmit<ExtArgs> | null
    /**
     * Filter which ChatMessage to delete.
     */
    where: ChatMessageWhereUniqueInput
  }

  /**
   * ChatMessage deleteMany
   */
  export type ChatMessageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ChatMessages to delete
     */
    where?: ChatMessageWhereInput
    /**
     * Limit how many ChatMessages to delete.
     */
    limit?: number
  }

  /**
   * ChatMessage without action
   */
  export type ChatMessageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatMessage
     */
    select?: ChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatMessage
     */
    omit?: ChatMessageOmit<ExtArgs> | null
  }


  /**
   * Model CommentAnalysis
   */

  export type AggregateCommentAnalysis = {
    _count: CommentAnalysisCountAggregateOutputType | null
    _min: CommentAnalysisMinAggregateOutputType | null
    _max: CommentAnalysisMaxAggregateOutputType | null
  }

  export type CommentAnalysisMinAggregateOutputType = {
    id: string | null
    userId: string | null
    date: string | null
    customComment: string | null
    createdAt: Date | null
  }

  export type CommentAnalysisMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    date: string | null
    customComment: string | null
    createdAt: Date | null
  }

  export type CommentAnalysisCountAggregateOutputType = {
    id: number
    userId: number
    date: number
    selectedComments: number
    customComment: number
    detectedPatterns: number
    suggestions: number
    moodTrend: number
    createdAt: number
    _all: number
  }


  export type CommentAnalysisMinAggregateInputType = {
    id?: true
    userId?: true
    date?: true
    customComment?: true
    createdAt?: true
  }

  export type CommentAnalysisMaxAggregateInputType = {
    id?: true
    userId?: true
    date?: true
    customComment?: true
    createdAt?: true
  }

  export type CommentAnalysisCountAggregateInputType = {
    id?: true
    userId?: true
    date?: true
    selectedComments?: true
    customComment?: true
    detectedPatterns?: true
    suggestions?: true
    moodTrend?: true
    createdAt?: true
    _all?: true
  }

  export type CommentAnalysisAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CommentAnalysis to aggregate.
     */
    where?: CommentAnalysisWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CommentAnalyses to fetch.
     */
    orderBy?: CommentAnalysisOrderByWithRelationInput | CommentAnalysisOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CommentAnalysisWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CommentAnalyses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CommentAnalyses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CommentAnalyses
    **/
    _count?: true | CommentAnalysisCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CommentAnalysisMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CommentAnalysisMaxAggregateInputType
  }

  export type GetCommentAnalysisAggregateType<T extends CommentAnalysisAggregateArgs> = {
        [P in keyof T & keyof AggregateCommentAnalysis]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCommentAnalysis[P]>
      : GetScalarType<T[P], AggregateCommentAnalysis[P]>
  }




  export type CommentAnalysisGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CommentAnalysisWhereInput
    orderBy?: CommentAnalysisOrderByWithAggregationInput | CommentAnalysisOrderByWithAggregationInput[]
    by: CommentAnalysisScalarFieldEnum[] | CommentAnalysisScalarFieldEnum
    having?: CommentAnalysisScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CommentAnalysisCountAggregateInputType | true
    _min?: CommentAnalysisMinAggregateInputType
    _max?: CommentAnalysisMaxAggregateInputType
  }

  export type CommentAnalysisGroupByOutputType = {
    id: string
    userId: string
    date: string
    selectedComments: JsonValue
    customComment: string | null
    detectedPatterns: JsonValue
    suggestions: JsonValue
    moodTrend: JsonValue | null
    createdAt: Date
    _count: CommentAnalysisCountAggregateOutputType | null
    _min: CommentAnalysisMinAggregateOutputType | null
    _max: CommentAnalysisMaxAggregateOutputType | null
  }

  type GetCommentAnalysisGroupByPayload<T extends CommentAnalysisGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CommentAnalysisGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CommentAnalysisGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CommentAnalysisGroupByOutputType[P]>
            : GetScalarType<T[P], CommentAnalysisGroupByOutputType[P]>
        }
      >
    >


  export type CommentAnalysisSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    date?: boolean
    selectedComments?: boolean
    customComment?: boolean
    detectedPatterns?: boolean
    suggestions?: boolean
    moodTrend?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["commentAnalysis"]>



  export type CommentAnalysisSelectScalar = {
    id?: boolean
    userId?: boolean
    date?: boolean
    selectedComments?: boolean
    customComment?: boolean
    detectedPatterns?: boolean
    suggestions?: boolean
    moodTrend?: boolean
    createdAt?: boolean
  }

  export type CommentAnalysisOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "date" | "selectedComments" | "customComment" | "detectedPatterns" | "suggestions" | "moodTrend" | "createdAt", ExtArgs["result"]["commentAnalysis"]>

  export type $CommentAnalysisPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CommentAnalysis"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      date: string
      selectedComments: Prisma.JsonValue
      customComment: string | null
      detectedPatterns: Prisma.JsonValue
      suggestions: Prisma.JsonValue
      moodTrend: Prisma.JsonValue | null
      createdAt: Date
    }, ExtArgs["result"]["commentAnalysis"]>
    composites: {}
  }

  type CommentAnalysisGetPayload<S extends boolean | null | undefined | CommentAnalysisDefaultArgs> = $Result.GetResult<Prisma.$CommentAnalysisPayload, S>

  type CommentAnalysisCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CommentAnalysisFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CommentAnalysisCountAggregateInputType | true
    }

  export interface CommentAnalysisDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CommentAnalysis'], meta: { name: 'CommentAnalysis' } }
    /**
     * Find zero or one CommentAnalysis that matches the filter.
     * @param {CommentAnalysisFindUniqueArgs} args - Arguments to find a CommentAnalysis
     * @example
     * // Get one CommentAnalysis
     * const commentAnalysis = await prisma.commentAnalysis.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CommentAnalysisFindUniqueArgs>(args: SelectSubset<T, CommentAnalysisFindUniqueArgs<ExtArgs>>): Prisma__CommentAnalysisClient<$Result.GetResult<Prisma.$CommentAnalysisPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CommentAnalysis that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CommentAnalysisFindUniqueOrThrowArgs} args - Arguments to find a CommentAnalysis
     * @example
     * // Get one CommentAnalysis
     * const commentAnalysis = await prisma.commentAnalysis.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CommentAnalysisFindUniqueOrThrowArgs>(args: SelectSubset<T, CommentAnalysisFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CommentAnalysisClient<$Result.GetResult<Prisma.$CommentAnalysisPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CommentAnalysis that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentAnalysisFindFirstArgs} args - Arguments to find a CommentAnalysis
     * @example
     * // Get one CommentAnalysis
     * const commentAnalysis = await prisma.commentAnalysis.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CommentAnalysisFindFirstArgs>(args?: SelectSubset<T, CommentAnalysisFindFirstArgs<ExtArgs>>): Prisma__CommentAnalysisClient<$Result.GetResult<Prisma.$CommentAnalysisPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CommentAnalysis that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentAnalysisFindFirstOrThrowArgs} args - Arguments to find a CommentAnalysis
     * @example
     * // Get one CommentAnalysis
     * const commentAnalysis = await prisma.commentAnalysis.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CommentAnalysisFindFirstOrThrowArgs>(args?: SelectSubset<T, CommentAnalysisFindFirstOrThrowArgs<ExtArgs>>): Prisma__CommentAnalysisClient<$Result.GetResult<Prisma.$CommentAnalysisPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CommentAnalyses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentAnalysisFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CommentAnalyses
     * const commentAnalyses = await prisma.commentAnalysis.findMany()
     * 
     * // Get first 10 CommentAnalyses
     * const commentAnalyses = await prisma.commentAnalysis.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const commentAnalysisWithIdOnly = await prisma.commentAnalysis.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CommentAnalysisFindManyArgs>(args?: SelectSubset<T, CommentAnalysisFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CommentAnalysisPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CommentAnalysis.
     * @param {CommentAnalysisCreateArgs} args - Arguments to create a CommentAnalysis.
     * @example
     * // Create one CommentAnalysis
     * const CommentAnalysis = await prisma.commentAnalysis.create({
     *   data: {
     *     // ... data to create a CommentAnalysis
     *   }
     * })
     * 
     */
    create<T extends CommentAnalysisCreateArgs>(args: SelectSubset<T, CommentAnalysisCreateArgs<ExtArgs>>): Prisma__CommentAnalysisClient<$Result.GetResult<Prisma.$CommentAnalysisPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CommentAnalyses.
     * @param {CommentAnalysisCreateManyArgs} args - Arguments to create many CommentAnalyses.
     * @example
     * // Create many CommentAnalyses
     * const commentAnalysis = await prisma.commentAnalysis.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CommentAnalysisCreateManyArgs>(args?: SelectSubset<T, CommentAnalysisCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a CommentAnalysis.
     * @param {CommentAnalysisDeleteArgs} args - Arguments to delete one CommentAnalysis.
     * @example
     * // Delete one CommentAnalysis
     * const CommentAnalysis = await prisma.commentAnalysis.delete({
     *   where: {
     *     // ... filter to delete one CommentAnalysis
     *   }
     * })
     * 
     */
    delete<T extends CommentAnalysisDeleteArgs>(args: SelectSubset<T, CommentAnalysisDeleteArgs<ExtArgs>>): Prisma__CommentAnalysisClient<$Result.GetResult<Prisma.$CommentAnalysisPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CommentAnalysis.
     * @param {CommentAnalysisUpdateArgs} args - Arguments to update one CommentAnalysis.
     * @example
     * // Update one CommentAnalysis
     * const commentAnalysis = await prisma.commentAnalysis.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CommentAnalysisUpdateArgs>(args: SelectSubset<T, CommentAnalysisUpdateArgs<ExtArgs>>): Prisma__CommentAnalysisClient<$Result.GetResult<Prisma.$CommentAnalysisPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CommentAnalyses.
     * @param {CommentAnalysisDeleteManyArgs} args - Arguments to filter CommentAnalyses to delete.
     * @example
     * // Delete a few CommentAnalyses
     * const { count } = await prisma.commentAnalysis.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CommentAnalysisDeleteManyArgs>(args?: SelectSubset<T, CommentAnalysisDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CommentAnalyses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentAnalysisUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CommentAnalyses
     * const commentAnalysis = await prisma.commentAnalysis.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CommentAnalysisUpdateManyArgs>(args: SelectSubset<T, CommentAnalysisUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CommentAnalysis.
     * @param {CommentAnalysisUpsertArgs} args - Arguments to update or create a CommentAnalysis.
     * @example
     * // Update or create a CommentAnalysis
     * const commentAnalysis = await prisma.commentAnalysis.upsert({
     *   create: {
     *     // ... data to create a CommentAnalysis
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CommentAnalysis we want to update
     *   }
     * })
     */
    upsert<T extends CommentAnalysisUpsertArgs>(args: SelectSubset<T, CommentAnalysisUpsertArgs<ExtArgs>>): Prisma__CommentAnalysisClient<$Result.GetResult<Prisma.$CommentAnalysisPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CommentAnalyses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentAnalysisCountArgs} args - Arguments to filter CommentAnalyses to count.
     * @example
     * // Count the number of CommentAnalyses
     * const count = await prisma.commentAnalysis.count({
     *   where: {
     *     // ... the filter for the CommentAnalyses we want to count
     *   }
     * })
    **/
    count<T extends CommentAnalysisCountArgs>(
      args?: Subset<T, CommentAnalysisCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CommentAnalysisCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CommentAnalysis.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentAnalysisAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CommentAnalysisAggregateArgs>(args: Subset<T, CommentAnalysisAggregateArgs>): Prisma.PrismaPromise<GetCommentAnalysisAggregateType<T>>

    /**
     * Group by CommentAnalysis.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommentAnalysisGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CommentAnalysisGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CommentAnalysisGroupByArgs['orderBy'] }
        : { orderBy?: CommentAnalysisGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CommentAnalysisGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCommentAnalysisGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CommentAnalysis model
   */
  readonly fields: CommentAnalysisFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CommentAnalysis.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CommentAnalysisClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CommentAnalysis model
   */
  interface CommentAnalysisFieldRefs {
    readonly id: FieldRef<"CommentAnalysis", 'String'>
    readonly userId: FieldRef<"CommentAnalysis", 'String'>
    readonly date: FieldRef<"CommentAnalysis", 'String'>
    readonly selectedComments: FieldRef<"CommentAnalysis", 'Json'>
    readonly customComment: FieldRef<"CommentAnalysis", 'String'>
    readonly detectedPatterns: FieldRef<"CommentAnalysis", 'Json'>
    readonly suggestions: FieldRef<"CommentAnalysis", 'Json'>
    readonly moodTrend: FieldRef<"CommentAnalysis", 'Json'>
    readonly createdAt: FieldRef<"CommentAnalysis", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CommentAnalysis findUnique
   */
  export type CommentAnalysisFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CommentAnalysis
     */
    select?: CommentAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CommentAnalysis
     */
    omit?: CommentAnalysisOmit<ExtArgs> | null
    /**
     * Filter, which CommentAnalysis to fetch.
     */
    where: CommentAnalysisWhereUniqueInput
  }

  /**
   * CommentAnalysis findUniqueOrThrow
   */
  export type CommentAnalysisFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CommentAnalysis
     */
    select?: CommentAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CommentAnalysis
     */
    omit?: CommentAnalysisOmit<ExtArgs> | null
    /**
     * Filter, which CommentAnalysis to fetch.
     */
    where: CommentAnalysisWhereUniqueInput
  }

  /**
   * CommentAnalysis findFirst
   */
  export type CommentAnalysisFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CommentAnalysis
     */
    select?: CommentAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CommentAnalysis
     */
    omit?: CommentAnalysisOmit<ExtArgs> | null
    /**
     * Filter, which CommentAnalysis to fetch.
     */
    where?: CommentAnalysisWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CommentAnalyses to fetch.
     */
    orderBy?: CommentAnalysisOrderByWithRelationInput | CommentAnalysisOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CommentAnalyses.
     */
    cursor?: CommentAnalysisWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CommentAnalyses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CommentAnalyses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CommentAnalyses.
     */
    distinct?: CommentAnalysisScalarFieldEnum | CommentAnalysisScalarFieldEnum[]
  }

  /**
   * CommentAnalysis findFirstOrThrow
   */
  export type CommentAnalysisFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CommentAnalysis
     */
    select?: CommentAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CommentAnalysis
     */
    omit?: CommentAnalysisOmit<ExtArgs> | null
    /**
     * Filter, which CommentAnalysis to fetch.
     */
    where?: CommentAnalysisWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CommentAnalyses to fetch.
     */
    orderBy?: CommentAnalysisOrderByWithRelationInput | CommentAnalysisOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CommentAnalyses.
     */
    cursor?: CommentAnalysisWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CommentAnalyses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CommentAnalyses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CommentAnalyses.
     */
    distinct?: CommentAnalysisScalarFieldEnum | CommentAnalysisScalarFieldEnum[]
  }

  /**
   * CommentAnalysis findMany
   */
  export type CommentAnalysisFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CommentAnalysis
     */
    select?: CommentAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CommentAnalysis
     */
    omit?: CommentAnalysisOmit<ExtArgs> | null
    /**
     * Filter, which CommentAnalyses to fetch.
     */
    where?: CommentAnalysisWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CommentAnalyses to fetch.
     */
    orderBy?: CommentAnalysisOrderByWithRelationInput | CommentAnalysisOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CommentAnalyses.
     */
    cursor?: CommentAnalysisWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CommentAnalyses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CommentAnalyses.
     */
    skip?: number
    distinct?: CommentAnalysisScalarFieldEnum | CommentAnalysisScalarFieldEnum[]
  }

  /**
   * CommentAnalysis create
   */
  export type CommentAnalysisCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CommentAnalysis
     */
    select?: CommentAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CommentAnalysis
     */
    omit?: CommentAnalysisOmit<ExtArgs> | null
    /**
     * The data needed to create a CommentAnalysis.
     */
    data: XOR<CommentAnalysisCreateInput, CommentAnalysisUncheckedCreateInput>
  }

  /**
   * CommentAnalysis createMany
   */
  export type CommentAnalysisCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CommentAnalyses.
     */
    data: CommentAnalysisCreateManyInput | CommentAnalysisCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CommentAnalysis update
   */
  export type CommentAnalysisUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CommentAnalysis
     */
    select?: CommentAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CommentAnalysis
     */
    omit?: CommentAnalysisOmit<ExtArgs> | null
    /**
     * The data needed to update a CommentAnalysis.
     */
    data: XOR<CommentAnalysisUpdateInput, CommentAnalysisUncheckedUpdateInput>
    /**
     * Choose, which CommentAnalysis to update.
     */
    where: CommentAnalysisWhereUniqueInput
  }

  /**
   * CommentAnalysis updateMany
   */
  export type CommentAnalysisUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CommentAnalyses.
     */
    data: XOR<CommentAnalysisUpdateManyMutationInput, CommentAnalysisUncheckedUpdateManyInput>
    /**
     * Filter which CommentAnalyses to update
     */
    where?: CommentAnalysisWhereInput
    /**
     * Limit how many CommentAnalyses to update.
     */
    limit?: number
  }

  /**
   * CommentAnalysis upsert
   */
  export type CommentAnalysisUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CommentAnalysis
     */
    select?: CommentAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CommentAnalysis
     */
    omit?: CommentAnalysisOmit<ExtArgs> | null
    /**
     * The filter to search for the CommentAnalysis to update in case it exists.
     */
    where: CommentAnalysisWhereUniqueInput
    /**
     * In case the CommentAnalysis found by the `where` argument doesn't exist, create a new CommentAnalysis with this data.
     */
    create: XOR<CommentAnalysisCreateInput, CommentAnalysisUncheckedCreateInput>
    /**
     * In case the CommentAnalysis was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CommentAnalysisUpdateInput, CommentAnalysisUncheckedUpdateInput>
  }

  /**
   * CommentAnalysis delete
   */
  export type CommentAnalysisDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CommentAnalysis
     */
    select?: CommentAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CommentAnalysis
     */
    omit?: CommentAnalysisOmit<ExtArgs> | null
    /**
     * Filter which CommentAnalysis to delete.
     */
    where: CommentAnalysisWhereUniqueInput
  }

  /**
   * CommentAnalysis deleteMany
   */
  export type CommentAnalysisDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CommentAnalyses to delete
     */
    where?: CommentAnalysisWhereInput
    /**
     * Limit how many CommentAnalyses to delete.
     */
    limit?: number
  }

  /**
   * CommentAnalysis without action
   */
  export type CommentAnalysisDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CommentAnalysis
     */
    select?: CommentAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CommentAnalysis
     */
    omit?: CommentAnalysisOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const ActivityScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    time: 'time',
    days: 'days',
    color: 'color',
    category: 'category',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ActivityScalarFieldEnum = (typeof ActivityScalarFieldEnum)[keyof typeof ActivityScalarFieldEnum]


  export const DailyCompletionScalarFieldEnum: {
    id: 'id',
    activityId: 'activityId',
    date: 'date',
    completed: 'completed',
    notes: 'notes',
    createdAt: 'createdAt'
  };

  export type DailyCompletionScalarFieldEnum = (typeof DailyCompletionScalarFieldEnum)[keyof typeof DailyCompletionScalarFieldEnum]


  export const DailyNoteScalarFieldEnum: {
    id: 'id',
    date: 'date',
    content: 'content',
    mood: 'mood',
    predefinedComments: 'predefinedComments',
    customComment: 'customComment',
    aiAnalysis: 'aiAnalysis',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type DailyNoteScalarFieldEnum = (typeof DailyNoteScalarFieldEnum)[keyof typeof DailyNoteScalarFieldEnum]


  export const UserPreferencesScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    darkMode: 'darkMode',
    weekStartsOnMonday: 'weekStartsOnMonday',
    notifications: 'notifications',
    language: 'language',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserPreferencesScalarFieldEnum = (typeof UserPreferencesScalarFieldEnum)[keyof typeof UserPreferencesScalarFieldEnum]


  export const WeeklyStreakScalarFieldEnum: {
    id: 'id',
    activityId: 'activityId',
    weekStart: 'weekStart',
    streak: 'streak',
    completed: 'completed',
    total: 'total',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type WeeklyStreakScalarFieldEnum = (typeof WeeklyStreakScalarFieldEnum)[keyof typeof WeeklyStreakScalarFieldEnum]


  export const NutritionAnalysisScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    date: 'date',
    mealType: 'mealType',
    foods: 'foods',
    totalCalories: 'totalCalories',
    macronutrients: 'macronutrients',
    imageUrl: 'imageUrl',
    aiConfidence: 'aiConfidence',
    userAdjustments: 'userAdjustments',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type NutritionAnalysisScalarFieldEnum = (typeof NutritionAnalysisScalarFieldEnum)[keyof typeof NutritionAnalysisScalarFieldEnum]


  export const BodyAnalysisScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    bodyType: 'bodyType',
    measurements: 'measurements',
    bodyComposition: 'bodyComposition',
    recommendations: 'recommendations',
    imageUrl: 'imageUrl',
    aiConfidence: 'aiConfidence',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type BodyAnalysisScalarFieldEnum = (typeof BodyAnalysisScalarFieldEnum)[keyof typeof BodyAnalysisScalarFieldEnum]


  export const AISuggestionScalarFieldEnum: {
    id: 'id',
    type: 'type',
    title: 'title',
    description: 'description',
    priority: 'priority',
    basedOn: 'basedOn',
    actions: 'actions',
    dismissedAt: 'dismissedAt',
    createdAt: 'createdAt'
  };

  export type AISuggestionScalarFieldEnum = (typeof AISuggestionScalarFieldEnum)[keyof typeof AISuggestionScalarFieldEnum]


  export const ChatMessageScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    role: 'role',
    content: 'content',
    timestamp: 'timestamp'
  };

  export type ChatMessageScalarFieldEnum = (typeof ChatMessageScalarFieldEnum)[keyof typeof ChatMessageScalarFieldEnum]


  export const CommentAnalysisScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    date: 'date',
    selectedComments: 'selectedComments',
    customComment: 'customComment',
    detectedPatterns: 'detectedPatterns',
    suggestions: 'suggestions',
    moodTrend: 'moodTrend',
    createdAt: 'createdAt'
  };

  export type CommentAnalysisScalarFieldEnum = (typeof CommentAnalysisScalarFieldEnum)[keyof typeof CommentAnalysisScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const ActivityOrderByRelevanceFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    time: 'time',
    color: 'color',
    category: 'category'
  };

  export type ActivityOrderByRelevanceFieldEnum = (typeof ActivityOrderByRelevanceFieldEnum)[keyof typeof ActivityOrderByRelevanceFieldEnum]


  export const DailyCompletionOrderByRelevanceFieldEnum: {
    id: 'id',
    activityId: 'activityId',
    date: 'date',
    notes: 'notes'
  };

  export type DailyCompletionOrderByRelevanceFieldEnum = (typeof DailyCompletionOrderByRelevanceFieldEnum)[keyof typeof DailyCompletionOrderByRelevanceFieldEnum]


  export const DailyNoteOrderByRelevanceFieldEnum: {
    id: 'id',
    date: 'date',
    content: 'content',
    customComment: 'customComment'
  };

  export type DailyNoteOrderByRelevanceFieldEnum = (typeof DailyNoteOrderByRelevanceFieldEnum)[keyof typeof DailyNoteOrderByRelevanceFieldEnum]


  export const UserPreferencesOrderByRelevanceFieldEnum: {
    id: 'id',
    userId: 'userId',
    language: 'language'
  };

  export type UserPreferencesOrderByRelevanceFieldEnum = (typeof UserPreferencesOrderByRelevanceFieldEnum)[keyof typeof UserPreferencesOrderByRelevanceFieldEnum]


  export const WeeklyStreakOrderByRelevanceFieldEnum: {
    id: 'id',
    activityId: 'activityId',
    weekStart: 'weekStart'
  };

  export type WeeklyStreakOrderByRelevanceFieldEnum = (typeof WeeklyStreakOrderByRelevanceFieldEnum)[keyof typeof WeeklyStreakOrderByRelevanceFieldEnum]


  export const NutritionAnalysisOrderByRelevanceFieldEnum: {
    id: 'id',
    userId: 'userId',
    date: 'date',
    mealType: 'mealType',
    imageUrl: 'imageUrl'
  };

  export type NutritionAnalysisOrderByRelevanceFieldEnum = (typeof NutritionAnalysisOrderByRelevanceFieldEnum)[keyof typeof NutritionAnalysisOrderByRelevanceFieldEnum]


  export const BodyAnalysisOrderByRelevanceFieldEnum: {
    id: 'id',
    userId: 'userId',
    bodyType: 'bodyType',
    imageUrl: 'imageUrl'
  };

  export type BodyAnalysisOrderByRelevanceFieldEnum = (typeof BodyAnalysisOrderByRelevanceFieldEnum)[keyof typeof BodyAnalysisOrderByRelevanceFieldEnum]


  export const AISuggestionOrderByRelevanceFieldEnum: {
    id: 'id',
    type: 'type',
    title: 'title',
    description: 'description',
    priority: 'priority'
  };

  export type AISuggestionOrderByRelevanceFieldEnum = (typeof AISuggestionOrderByRelevanceFieldEnum)[keyof typeof AISuggestionOrderByRelevanceFieldEnum]


  export const ChatMessageOrderByRelevanceFieldEnum: {
    id: 'id',
    userId: 'userId',
    role: 'role',
    content: 'content'
  };

  export type ChatMessageOrderByRelevanceFieldEnum = (typeof ChatMessageOrderByRelevanceFieldEnum)[keyof typeof ChatMessageOrderByRelevanceFieldEnum]


  export const CommentAnalysisOrderByRelevanceFieldEnum: {
    id: 'id',
    userId: 'userId',
    date: 'date',
    customComment: 'customComment'
  };

  export type CommentAnalysisOrderByRelevanceFieldEnum = (typeof CommentAnalysisOrderByRelevanceFieldEnum)[keyof typeof CommentAnalysisOrderByRelevanceFieldEnum]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type ActivityWhereInput = {
    AND?: ActivityWhereInput | ActivityWhereInput[]
    OR?: ActivityWhereInput[]
    NOT?: ActivityWhereInput | ActivityWhereInput[]
    id?: StringFilter<"Activity"> | string
    name?: StringFilter<"Activity"> | string
    description?: StringNullableFilter<"Activity"> | string | null
    time?: StringNullableFilter<"Activity"> | string | null
    days?: JsonFilter<"Activity">
    color?: StringFilter<"Activity"> | string
    category?: StringNullableFilter<"Activity"> | string | null
    createdAt?: DateTimeFilter<"Activity"> | Date | string
    updatedAt?: DateTimeFilter<"Activity"> | Date | string
    completions?: DailyCompletionListRelationFilter
  }

  export type ActivityOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    time?: SortOrderInput | SortOrder
    days?: SortOrder
    color?: SortOrder
    category?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    completions?: DailyCompletionOrderByRelationAggregateInput
    _relevance?: ActivityOrderByRelevanceInput
  }

  export type ActivityWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ActivityWhereInput | ActivityWhereInput[]
    OR?: ActivityWhereInput[]
    NOT?: ActivityWhereInput | ActivityWhereInput[]
    name?: StringFilter<"Activity"> | string
    description?: StringNullableFilter<"Activity"> | string | null
    time?: StringNullableFilter<"Activity"> | string | null
    days?: JsonFilter<"Activity">
    color?: StringFilter<"Activity"> | string
    category?: StringNullableFilter<"Activity"> | string | null
    createdAt?: DateTimeFilter<"Activity"> | Date | string
    updatedAt?: DateTimeFilter<"Activity"> | Date | string
    completions?: DailyCompletionListRelationFilter
  }, "id">

  export type ActivityOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    time?: SortOrderInput | SortOrder
    days?: SortOrder
    color?: SortOrder
    category?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ActivityCountOrderByAggregateInput
    _max?: ActivityMaxOrderByAggregateInput
    _min?: ActivityMinOrderByAggregateInput
  }

  export type ActivityScalarWhereWithAggregatesInput = {
    AND?: ActivityScalarWhereWithAggregatesInput | ActivityScalarWhereWithAggregatesInput[]
    OR?: ActivityScalarWhereWithAggregatesInput[]
    NOT?: ActivityScalarWhereWithAggregatesInput | ActivityScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Activity"> | string
    name?: StringWithAggregatesFilter<"Activity"> | string
    description?: StringNullableWithAggregatesFilter<"Activity"> | string | null
    time?: StringNullableWithAggregatesFilter<"Activity"> | string | null
    days?: JsonWithAggregatesFilter<"Activity">
    color?: StringWithAggregatesFilter<"Activity"> | string
    category?: StringNullableWithAggregatesFilter<"Activity"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Activity"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Activity"> | Date | string
  }

  export type DailyCompletionWhereInput = {
    AND?: DailyCompletionWhereInput | DailyCompletionWhereInput[]
    OR?: DailyCompletionWhereInput[]
    NOT?: DailyCompletionWhereInput | DailyCompletionWhereInput[]
    id?: StringFilter<"DailyCompletion"> | string
    activityId?: StringFilter<"DailyCompletion"> | string
    date?: StringFilter<"DailyCompletion"> | string
    completed?: BoolFilter<"DailyCompletion"> | boolean
    notes?: StringNullableFilter<"DailyCompletion"> | string | null
    createdAt?: DateTimeFilter<"DailyCompletion"> | Date | string
    activity?: XOR<ActivityScalarRelationFilter, ActivityWhereInput>
  }

  export type DailyCompletionOrderByWithRelationInput = {
    id?: SortOrder
    activityId?: SortOrder
    date?: SortOrder
    completed?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    activity?: ActivityOrderByWithRelationInput
    _relevance?: DailyCompletionOrderByRelevanceInput
  }

  export type DailyCompletionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    activityId_date?: DailyCompletionActivityIdDateCompoundUniqueInput
    AND?: DailyCompletionWhereInput | DailyCompletionWhereInput[]
    OR?: DailyCompletionWhereInput[]
    NOT?: DailyCompletionWhereInput | DailyCompletionWhereInput[]
    activityId?: StringFilter<"DailyCompletion"> | string
    date?: StringFilter<"DailyCompletion"> | string
    completed?: BoolFilter<"DailyCompletion"> | boolean
    notes?: StringNullableFilter<"DailyCompletion"> | string | null
    createdAt?: DateTimeFilter<"DailyCompletion"> | Date | string
    activity?: XOR<ActivityScalarRelationFilter, ActivityWhereInput>
  }, "id" | "activityId_date">

  export type DailyCompletionOrderByWithAggregationInput = {
    id?: SortOrder
    activityId?: SortOrder
    date?: SortOrder
    completed?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: DailyCompletionCountOrderByAggregateInput
    _max?: DailyCompletionMaxOrderByAggregateInput
    _min?: DailyCompletionMinOrderByAggregateInput
  }

  export type DailyCompletionScalarWhereWithAggregatesInput = {
    AND?: DailyCompletionScalarWhereWithAggregatesInput | DailyCompletionScalarWhereWithAggregatesInput[]
    OR?: DailyCompletionScalarWhereWithAggregatesInput[]
    NOT?: DailyCompletionScalarWhereWithAggregatesInput | DailyCompletionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DailyCompletion"> | string
    activityId?: StringWithAggregatesFilter<"DailyCompletion"> | string
    date?: StringWithAggregatesFilter<"DailyCompletion"> | string
    completed?: BoolWithAggregatesFilter<"DailyCompletion"> | boolean
    notes?: StringNullableWithAggregatesFilter<"DailyCompletion"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"DailyCompletion"> | Date | string
  }

  export type DailyNoteWhereInput = {
    AND?: DailyNoteWhereInput | DailyNoteWhereInput[]
    OR?: DailyNoteWhereInput[]
    NOT?: DailyNoteWhereInput | DailyNoteWhereInput[]
    id?: StringFilter<"DailyNote"> | string
    date?: StringFilter<"DailyNote"> | string
    content?: StringFilter<"DailyNote"> | string
    mood?: IntNullableFilter<"DailyNote"> | number | null
    predefinedComments?: JsonNullableFilter<"DailyNote">
    customComment?: StringNullableFilter<"DailyNote"> | string | null
    aiAnalysis?: JsonNullableFilter<"DailyNote">
    createdAt?: DateTimeFilter<"DailyNote"> | Date | string
    updatedAt?: DateTimeFilter<"DailyNote"> | Date | string
  }

  export type DailyNoteOrderByWithRelationInput = {
    id?: SortOrder
    date?: SortOrder
    content?: SortOrder
    mood?: SortOrderInput | SortOrder
    predefinedComments?: SortOrderInput | SortOrder
    customComment?: SortOrderInput | SortOrder
    aiAnalysis?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _relevance?: DailyNoteOrderByRelevanceInput
  }

  export type DailyNoteWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    date?: string
    AND?: DailyNoteWhereInput | DailyNoteWhereInput[]
    OR?: DailyNoteWhereInput[]
    NOT?: DailyNoteWhereInput | DailyNoteWhereInput[]
    content?: StringFilter<"DailyNote"> | string
    mood?: IntNullableFilter<"DailyNote"> | number | null
    predefinedComments?: JsonNullableFilter<"DailyNote">
    customComment?: StringNullableFilter<"DailyNote"> | string | null
    aiAnalysis?: JsonNullableFilter<"DailyNote">
    createdAt?: DateTimeFilter<"DailyNote"> | Date | string
    updatedAt?: DateTimeFilter<"DailyNote"> | Date | string
  }, "id" | "date">

  export type DailyNoteOrderByWithAggregationInput = {
    id?: SortOrder
    date?: SortOrder
    content?: SortOrder
    mood?: SortOrderInput | SortOrder
    predefinedComments?: SortOrderInput | SortOrder
    customComment?: SortOrderInput | SortOrder
    aiAnalysis?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: DailyNoteCountOrderByAggregateInput
    _avg?: DailyNoteAvgOrderByAggregateInput
    _max?: DailyNoteMaxOrderByAggregateInput
    _min?: DailyNoteMinOrderByAggregateInput
    _sum?: DailyNoteSumOrderByAggregateInput
  }

  export type DailyNoteScalarWhereWithAggregatesInput = {
    AND?: DailyNoteScalarWhereWithAggregatesInput | DailyNoteScalarWhereWithAggregatesInput[]
    OR?: DailyNoteScalarWhereWithAggregatesInput[]
    NOT?: DailyNoteScalarWhereWithAggregatesInput | DailyNoteScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DailyNote"> | string
    date?: StringWithAggregatesFilter<"DailyNote"> | string
    content?: StringWithAggregatesFilter<"DailyNote"> | string
    mood?: IntNullableWithAggregatesFilter<"DailyNote"> | number | null
    predefinedComments?: JsonNullableWithAggregatesFilter<"DailyNote">
    customComment?: StringNullableWithAggregatesFilter<"DailyNote"> | string | null
    aiAnalysis?: JsonNullableWithAggregatesFilter<"DailyNote">
    createdAt?: DateTimeWithAggregatesFilter<"DailyNote"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"DailyNote"> | Date | string
  }

  export type UserPreferencesWhereInput = {
    AND?: UserPreferencesWhereInput | UserPreferencesWhereInput[]
    OR?: UserPreferencesWhereInput[]
    NOT?: UserPreferencesWhereInput | UserPreferencesWhereInput[]
    id?: StringFilter<"UserPreferences"> | string
    userId?: StringFilter<"UserPreferences"> | string
    darkMode?: BoolFilter<"UserPreferences"> | boolean
    weekStartsOnMonday?: BoolFilter<"UserPreferences"> | boolean
    notifications?: BoolFilter<"UserPreferences"> | boolean
    language?: StringFilter<"UserPreferences"> | string
    createdAt?: DateTimeFilter<"UserPreferences"> | Date | string
    updatedAt?: DateTimeFilter<"UserPreferences"> | Date | string
  }

  export type UserPreferencesOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    darkMode?: SortOrder
    weekStartsOnMonday?: SortOrder
    notifications?: SortOrder
    language?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _relevance?: UserPreferencesOrderByRelevanceInput
  }

  export type UserPreferencesWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId?: string
    AND?: UserPreferencesWhereInput | UserPreferencesWhereInput[]
    OR?: UserPreferencesWhereInput[]
    NOT?: UserPreferencesWhereInput | UserPreferencesWhereInput[]
    darkMode?: BoolFilter<"UserPreferences"> | boolean
    weekStartsOnMonday?: BoolFilter<"UserPreferences"> | boolean
    notifications?: BoolFilter<"UserPreferences"> | boolean
    language?: StringFilter<"UserPreferences"> | string
    createdAt?: DateTimeFilter<"UserPreferences"> | Date | string
    updatedAt?: DateTimeFilter<"UserPreferences"> | Date | string
  }, "id" | "userId">

  export type UserPreferencesOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    darkMode?: SortOrder
    weekStartsOnMonday?: SortOrder
    notifications?: SortOrder
    language?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserPreferencesCountOrderByAggregateInput
    _max?: UserPreferencesMaxOrderByAggregateInput
    _min?: UserPreferencesMinOrderByAggregateInput
  }

  export type UserPreferencesScalarWhereWithAggregatesInput = {
    AND?: UserPreferencesScalarWhereWithAggregatesInput | UserPreferencesScalarWhereWithAggregatesInput[]
    OR?: UserPreferencesScalarWhereWithAggregatesInput[]
    NOT?: UserPreferencesScalarWhereWithAggregatesInput | UserPreferencesScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UserPreferences"> | string
    userId?: StringWithAggregatesFilter<"UserPreferences"> | string
    darkMode?: BoolWithAggregatesFilter<"UserPreferences"> | boolean
    weekStartsOnMonday?: BoolWithAggregatesFilter<"UserPreferences"> | boolean
    notifications?: BoolWithAggregatesFilter<"UserPreferences"> | boolean
    language?: StringWithAggregatesFilter<"UserPreferences"> | string
    createdAt?: DateTimeWithAggregatesFilter<"UserPreferences"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"UserPreferences"> | Date | string
  }

  export type WeeklyStreakWhereInput = {
    AND?: WeeklyStreakWhereInput | WeeklyStreakWhereInput[]
    OR?: WeeklyStreakWhereInput[]
    NOT?: WeeklyStreakWhereInput | WeeklyStreakWhereInput[]
    id?: StringFilter<"WeeklyStreak"> | string
    activityId?: StringFilter<"WeeklyStreak"> | string
    weekStart?: StringFilter<"WeeklyStreak"> | string
    streak?: IntFilter<"WeeklyStreak"> | number
    completed?: IntFilter<"WeeklyStreak"> | number
    total?: IntFilter<"WeeklyStreak"> | number
    createdAt?: DateTimeFilter<"WeeklyStreak"> | Date | string
    updatedAt?: DateTimeFilter<"WeeklyStreak"> | Date | string
  }

  export type WeeklyStreakOrderByWithRelationInput = {
    id?: SortOrder
    activityId?: SortOrder
    weekStart?: SortOrder
    streak?: SortOrder
    completed?: SortOrder
    total?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _relevance?: WeeklyStreakOrderByRelevanceInput
  }

  export type WeeklyStreakWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    activityId_weekStart?: WeeklyStreakActivityIdWeekStartCompoundUniqueInput
    AND?: WeeklyStreakWhereInput | WeeklyStreakWhereInput[]
    OR?: WeeklyStreakWhereInput[]
    NOT?: WeeklyStreakWhereInput | WeeklyStreakWhereInput[]
    activityId?: StringFilter<"WeeklyStreak"> | string
    weekStart?: StringFilter<"WeeklyStreak"> | string
    streak?: IntFilter<"WeeklyStreak"> | number
    completed?: IntFilter<"WeeklyStreak"> | number
    total?: IntFilter<"WeeklyStreak"> | number
    createdAt?: DateTimeFilter<"WeeklyStreak"> | Date | string
    updatedAt?: DateTimeFilter<"WeeklyStreak"> | Date | string
  }, "id" | "activityId_weekStart">

  export type WeeklyStreakOrderByWithAggregationInput = {
    id?: SortOrder
    activityId?: SortOrder
    weekStart?: SortOrder
    streak?: SortOrder
    completed?: SortOrder
    total?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: WeeklyStreakCountOrderByAggregateInput
    _avg?: WeeklyStreakAvgOrderByAggregateInput
    _max?: WeeklyStreakMaxOrderByAggregateInput
    _min?: WeeklyStreakMinOrderByAggregateInput
    _sum?: WeeklyStreakSumOrderByAggregateInput
  }

  export type WeeklyStreakScalarWhereWithAggregatesInput = {
    AND?: WeeklyStreakScalarWhereWithAggregatesInput | WeeklyStreakScalarWhereWithAggregatesInput[]
    OR?: WeeklyStreakScalarWhereWithAggregatesInput[]
    NOT?: WeeklyStreakScalarWhereWithAggregatesInput | WeeklyStreakScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"WeeklyStreak"> | string
    activityId?: StringWithAggregatesFilter<"WeeklyStreak"> | string
    weekStart?: StringWithAggregatesFilter<"WeeklyStreak"> | string
    streak?: IntWithAggregatesFilter<"WeeklyStreak"> | number
    completed?: IntWithAggregatesFilter<"WeeklyStreak"> | number
    total?: IntWithAggregatesFilter<"WeeklyStreak"> | number
    createdAt?: DateTimeWithAggregatesFilter<"WeeklyStreak"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"WeeklyStreak"> | Date | string
  }

  export type NutritionAnalysisWhereInput = {
    AND?: NutritionAnalysisWhereInput | NutritionAnalysisWhereInput[]
    OR?: NutritionAnalysisWhereInput[]
    NOT?: NutritionAnalysisWhereInput | NutritionAnalysisWhereInput[]
    id?: StringFilter<"NutritionAnalysis"> | string
    userId?: StringFilter<"NutritionAnalysis"> | string
    date?: StringFilter<"NutritionAnalysis"> | string
    mealType?: StringFilter<"NutritionAnalysis"> | string
    foods?: JsonFilter<"NutritionAnalysis">
    totalCalories?: IntFilter<"NutritionAnalysis"> | number
    macronutrients?: JsonFilter<"NutritionAnalysis">
    imageUrl?: StringNullableFilter<"NutritionAnalysis"> | string | null
    aiConfidence?: FloatFilter<"NutritionAnalysis"> | number
    userAdjustments?: JsonNullableFilter<"NutritionAnalysis">
    createdAt?: DateTimeFilter<"NutritionAnalysis"> | Date | string
    updatedAt?: DateTimeFilter<"NutritionAnalysis"> | Date | string
  }

  export type NutritionAnalysisOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    date?: SortOrder
    mealType?: SortOrder
    foods?: SortOrder
    totalCalories?: SortOrder
    macronutrients?: SortOrder
    imageUrl?: SortOrderInput | SortOrder
    aiConfidence?: SortOrder
    userAdjustments?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _relevance?: NutritionAnalysisOrderByRelevanceInput
  }

  export type NutritionAnalysisWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: NutritionAnalysisWhereInput | NutritionAnalysisWhereInput[]
    OR?: NutritionAnalysisWhereInput[]
    NOT?: NutritionAnalysisWhereInput | NutritionAnalysisWhereInput[]
    userId?: StringFilter<"NutritionAnalysis"> | string
    date?: StringFilter<"NutritionAnalysis"> | string
    mealType?: StringFilter<"NutritionAnalysis"> | string
    foods?: JsonFilter<"NutritionAnalysis">
    totalCalories?: IntFilter<"NutritionAnalysis"> | number
    macronutrients?: JsonFilter<"NutritionAnalysis">
    imageUrl?: StringNullableFilter<"NutritionAnalysis"> | string | null
    aiConfidence?: FloatFilter<"NutritionAnalysis"> | number
    userAdjustments?: JsonNullableFilter<"NutritionAnalysis">
    createdAt?: DateTimeFilter<"NutritionAnalysis"> | Date | string
    updatedAt?: DateTimeFilter<"NutritionAnalysis"> | Date | string
  }, "id">

  export type NutritionAnalysisOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    date?: SortOrder
    mealType?: SortOrder
    foods?: SortOrder
    totalCalories?: SortOrder
    macronutrients?: SortOrder
    imageUrl?: SortOrderInput | SortOrder
    aiConfidence?: SortOrder
    userAdjustments?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: NutritionAnalysisCountOrderByAggregateInput
    _avg?: NutritionAnalysisAvgOrderByAggregateInput
    _max?: NutritionAnalysisMaxOrderByAggregateInput
    _min?: NutritionAnalysisMinOrderByAggregateInput
    _sum?: NutritionAnalysisSumOrderByAggregateInput
  }

  export type NutritionAnalysisScalarWhereWithAggregatesInput = {
    AND?: NutritionAnalysisScalarWhereWithAggregatesInput | NutritionAnalysisScalarWhereWithAggregatesInput[]
    OR?: NutritionAnalysisScalarWhereWithAggregatesInput[]
    NOT?: NutritionAnalysisScalarWhereWithAggregatesInput | NutritionAnalysisScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"NutritionAnalysis"> | string
    userId?: StringWithAggregatesFilter<"NutritionAnalysis"> | string
    date?: StringWithAggregatesFilter<"NutritionAnalysis"> | string
    mealType?: StringWithAggregatesFilter<"NutritionAnalysis"> | string
    foods?: JsonWithAggregatesFilter<"NutritionAnalysis">
    totalCalories?: IntWithAggregatesFilter<"NutritionAnalysis"> | number
    macronutrients?: JsonWithAggregatesFilter<"NutritionAnalysis">
    imageUrl?: StringNullableWithAggregatesFilter<"NutritionAnalysis"> | string | null
    aiConfidence?: FloatWithAggregatesFilter<"NutritionAnalysis"> | number
    userAdjustments?: JsonNullableWithAggregatesFilter<"NutritionAnalysis">
    createdAt?: DateTimeWithAggregatesFilter<"NutritionAnalysis"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"NutritionAnalysis"> | Date | string
  }

  export type BodyAnalysisWhereInput = {
    AND?: BodyAnalysisWhereInput | BodyAnalysisWhereInput[]
    OR?: BodyAnalysisWhereInput[]
    NOT?: BodyAnalysisWhereInput | BodyAnalysisWhereInput[]
    id?: StringFilter<"BodyAnalysis"> | string
    userId?: StringFilter<"BodyAnalysis"> | string
    bodyType?: StringFilter<"BodyAnalysis"> | string
    measurements?: JsonNullableFilter<"BodyAnalysis">
    bodyComposition?: JsonNullableFilter<"BodyAnalysis">
    recommendations?: JsonNullableFilter<"BodyAnalysis">
    imageUrl?: StringNullableFilter<"BodyAnalysis"> | string | null
    aiConfidence?: FloatFilter<"BodyAnalysis"> | number
    createdAt?: DateTimeFilter<"BodyAnalysis"> | Date | string
    updatedAt?: DateTimeFilter<"BodyAnalysis"> | Date | string
  }

  export type BodyAnalysisOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    bodyType?: SortOrder
    measurements?: SortOrderInput | SortOrder
    bodyComposition?: SortOrderInput | SortOrder
    recommendations?: SortOrderInput | SortOrder
    imageUrl?: SortOrderInput | SortOrder
    aiConfidence?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _relevance?: BodyAnalysisOrderByRelevanceInput
  }

  export type BodyAnalysisWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: BodyAnalysisWhereInput | BodyAnalysisWhereInput[]
    OR?: BodyAnalysisWhereInput[]
    NOT?: BodyAnalysisWhereInput | BodyAnalysisWhereInput[]
    userId?: StringFilter<"BodyAnalysis"> | string
    bodyType?: StringFilter<"BodyAnalysis"> | string
    measurements?: JsonNullableFilter<"BodyAnalysis">
    bodyComposition?: JsonNullableFilter<"BodyAnalysis">
    recommendations?: JsonNullableFilter<"BodyAnalysis">
    imageUrl?: StringNullableFilter<"BodyAnalysis"> | string | null
    aiConfidence?: FloatFilter<"BodyAnalysis"> | number
    createdAt?: DateTimeFilter<"BodyAnalysis"> | Date | string
    updatedAt?: DateTimeFilter<"BodyAnalysis"> | Date | string
  }, "id">

  export type BodyAnalysisOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    bodyType?: SortOrder
    measurements?: SortOrderInput | SortOrder
    bodyComposition?: SortOrderInput | SortOrder
    recommendations?: SortOrderInput | SortOrder
    imageUrl?: SortOrderInput | SortOrder
    aiConfidence?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: BodyAnalysisCountOrderByAggregateInput
    _avg?: BodyAnalysisAvgOrderByAggregateInput
    _max?: BodyAnalysisMaxOrderByAggregateInput
    _min?: BodyAnalysisMinOrderByAggregateInput
    _sum?: BodyAnalysisSumOrderByAggregateInput
  }

  export type BodyAnalysisScalarWhereWithAggregatesInput = {
    AND?: BodyAnalysisScalarWhereWithAggregatesInput | BodyAnalysisScalarWhereWithAggregatesInput[]
    OR?: BodyAnalysisScalarWhereWithAggregatesInput[]
    NOT?: BodyAnalysisScalarWhereWithAggregatesInput | BodyAnalysisScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"BodyAnalysis"> | string
    userId?: StringWithAggregatesFilter<"BodyAnalysis"> | string
    bodyType?: StringWithAggregatesFilter<"BodyAnalysis"> | string
    measurements?: JsonNullableWithAggregatesFilter<"BodyAnalysis">
    bodyComposition?: JsonNullableWithAggregatesFilter<"BodyAnalysis">
    recommendations?: JsonNullableWithAggregatesFilter<"BodyAnalysis">
    imageUrl?: StringNullableWithAggregatesFilter<"BodyAnalysis"> | string | null
    aiConfidence?: FloatWithAggregatesFilter<"BodyAnalysis"> | number
    createdAt?: DateTimeWithAggregatesFilter<"BodyAnalysis"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"BodyAnalysis"> | Date | string
  }

  export type AISuggestionWhereInput = {
    AND?: AISuggestionWhereInput | AISuggestionWhereInput[]
    OR?: AISuggestionWhereInput[]
    NOT?: AISuggestionWhereInput | AISuggestionWhereInput[]
    id?: StringFilter<"AISuggestion"> | string
    type?: StringFilter<"AISuggestion"> | string
    title?: StringFilter<"AISuggestion"> | string
    description?: StringFilter<"AISuggestion"> | string
    priority?: StringFilter<"AISuggestion"> | string
    basedOn?: JsonFilter<"AISuggestion">
    actions?: JsonNullableFilter<"AISuggestion">
    dismissedAt?: DateTimeNullableFilter<"AISuggestion"> | Date | string | null
    createdAt?: DateTimeFilter<"AISuggestion"> | Date | string
  }

  export type AISuggestionOrderByWithRelationInput = {
    id?: SortOrder
    type?: SortOrder
    title?: SortOrder
    description?: SortOrder
    priority?: SortOrder
    basedOn?: SortOrder
    actions?: SortOrderInput | SortOrder
    dismissedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _relevance?: AISuggestionOrderByRelevanceInput
  }

  export type AISuggestionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AISuggestionWhereInput | AISuggestionWhereInput[]
    OR?: AISuggestionWhereInput[]
    NOT?: AISuggestionWhereInput | AISuggestionWhereInput[]
    type?: StringFilter<"AISuggestion"> | string
    title?: StringFilter<"AISuggestion"> | string
    description?: StringFilter<"AISuggestion"> | string
    priority?: StringFilter<"AISuggestion"> | string
    basedOn?: JsonFilter<"AISuggestion">
    actions?: JsonNullableFilter<"AISuggestion">
    dismissedAt?: DateTimeNullableFilter<"AISuggestion"> | Date | string | null
    createdAt?: DateTimeFilter<"AISuggestion"> | Date | string
  }, "id">

  export type AISuggestionOrderByWithAggregationInput = {
    id?: SortOrder
    type?: SortOrder
    title?: SortOrder
    description?: SortOrder
    priority?: SortOrder
    basedOn?: SortOrder
    actions?: SortOrderInput | SortOrder
    dismissedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: AISuggestionCountOrderByAggregateInput
    _max?: AISuggestionMaxOrderByAggregateInput
    _min?: AISuggestionMinOrderByAggregateInput
  }

  export type AISuggestionScalarWhereWithAggregatesInput = {
    AND?: AISuggestionScalarWhereWithAggregatesInput | AISuggestionScalarWhereWithAggregatesInput[]
    OR?: AISuggestionScalarWhereWithAggregatesInput[]
    NOT?: AISuggestionScalarWhereWithAggregatesInput | AISuggestionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AISuggestion"> | string
    type?: StringWithAggregatesFilter<"AISuggestion"> | string
    title?: StringWithAggregatesFilter<"AISuggestion"> | string
    description?: StringWithAggregatesFilter<"AISuggestion"> | string
    priority?: StringWithAggregatesFilter<"AISuggestion"> | string
    basedOn?: JsonWithAggregatesFilter<"AISuggestion">
    actions?: JsonNullableWithAggregatesFilter<"AISuggestion">
    dismissedAt?: DateTimeNullableWithAggregatesFilter<"AISuggestion"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"AISuggestion"> | Date | string
  }

  export type ChatMessageWhereInput = {
    AND?: ChatMessageWhereInput | ChatMessageWhereInput[]
    OR?: ChatMessageWhereInput[]
    NOT?: ChatMessageWhereInput | ChatMessageWhereInput[]
    id?: StringFilter<"ChatMessage"> | string
    userId?: StringFilter<"ChatMessage"> | string
    role?: StringFilter<"ChatMessage"> | string
    content?: StringFilter<"ChatMessage"> | string
    timestamp?: DateTimeFilter<"ChatMessage"> | Date | string
  }

  export type ChatMessageOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    role?: SortOrder
    content?: SortOrder
    timestamp?: SortOrder
    _relevance?: ChatMessageOrderByRelevanceInput
  }

  export type ChatMessageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ChatMessageWhereInput | ChatMessageWhereInput[]
    OR?: ChatMessageWhereInput[]
    NOT?: ChatMessageWhereInput | ChatMessageWhereInput[]
    userId?: StringFilter<"ChatMessage"> | string
    role?: StringFilter<"ChatMessage"> | string
    content?: StringFilter<"ChatMessage"> | string
    timestamp?: DateTimeFilter<"ChatMessage"> | Date | string
  }, "id">

  export type ChatMessageOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    role?: SortOrder
    content?: SortOrder
    timestamp?: SortOrder
    _count?: ChatMessageCountOrderByAggregateInput
    _max?: ChatMessageMaxOrderByAggregateInput
    _min?: ChatMessageMinOrderByAggregateInput
  }

  export type ChatMessageScalarWhereWithAggregatesInput = {
    AND?: ChatMessageScalarWhereWithAggregatesInput | ChatMessageScalarWhereWithAggregatesInput[]
    OR?: ChatMessageScalarWhereWithAggregatesInput[]
    NOT?: ChatMessageScalarWhereWithAggregatesInput | ChatMessageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ChatMessage"> | string
    userId?: StringWithAggregatesFilter<"ChatMessage"> | string
    role?: StringWithAggregatesFilter<"ChatMessage"> | string
    content?: StringWithAggregatesFilter<"ChatMessage"> | string
    timestamp?: DateTimeWithAggregatesFilter<"ChatMessage"> | Date | string
  }

  export type CommentAnalysisWhereInput = {
    AND?: CommentAnalysisWhereInput | CommentAnalysisWhereInput[]
    OR?: CommentAnalysisWhereInput[]
    NOT?: CommentAnalysisWhereInput | CommentAnalysisWhereInput[]
    id?: StringFilter<"CommentAnalysis"> | string
    userId?: StringFilter<"CommentAnalysis"> | string
    date?: StringFilter<"CommentAnalysis"> | string
    selectedComments?: JsonFilter<"CommentAnalysis">
    customComment?: StringNullableFilter<"CommentAnalysis"> | string | null
    detectedPatterns?: JsonFilter<"CommentAnalysis">
    suggestions?: JsonFilter<"CommentAnalysis">
    moodTrend?: JsonNullableFilter<"CommentAnalysis">
    createdAt?: DateTimeFilter<"CommentAnalysis"> | Date | string
  }

  export type CommentAnalysisOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    date?: SortOrder
    selectedComments?: SortOrder
    customComment?: SortOrderInput | SortOrder
    detectedPatterns?: SortOrder
    suggestions?: SortOrder
    moodTrend?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _relevance?: CommentAnalysisOrderByRelevanceInput
  }

  export type CommentAnalysisWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CommentAnalysisWhereInput | CommentAnalysisWhereInput[]
    OR?: CommentAnalysisWhereInput[]
    NOT?: CommentAnalysisWhereInput | CommentAnalysisWhereInput[]
    userId?: StringFilter<"CommentAnalysis"> | string
    date?: StringFilter<"CommentAnalysis"> | string
    selectedComments?: JsonFilter<"CommentAnalysis">
    customComment?: StringNullableFilter<"CommentAnalysis"> | string | null
    detectedPatterns?: JsonFilter<"CommentAnalysis">
    suggestions?: JsonFilter<"CommentAnalysis">
    moodTrend?: JsonNullableFilter<"CommentAnalysis">
    createdAt?: DateTimeFilter<"CommentAnalysis"> | Date | string
  }, "id">

  export type CommentAnalysisOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    date?: SortOrder
    selectedComments?: SortOrder
    customComment?: SortOrderInput | SortOrder
    detectedPatterns?: SortOrder
    suggestions?: SortOrder
    moodTrend?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: CommentAnalysisCountOrderByAggregateInput
    _max?: CommentAnalysisMaxOrderByAggregateInput
    _min?: CommentAnalysisMinOrderByAggregateInput
  }

  export type CommentAnalysisScalarWhereWithAggregatesInput = {
    AND?: CommentAnalysisScalarWhereWithAggregatesInput | CommentAnalysisScalarWhereWithAggregatesInput[]
    OR?: CommentAnalysisScalarWhereWithAggregatesInput[]
    NOT?: CommentAnalysisScalarWhereWithAggregatesInput | CommentAnalysisScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CommentAnalysis"> | string
    userId?: StringWithAggregatesFilter<"CommentAnalysis"> | string
    date?: StringWithAggregatesFilter<"CommentAnalysis"> | string
    selectedComments?: JsonWithAggregatesFilter<"CommentAnalysis">
    customComment?: StringNullableWithAggregatesFilter<"CommentAnalysis"> | string | null
    detectedPatterns?: JsonWithAggregatesFilter<"CommentAnalysis">
    suggestions?: JsonWithAggregatesFilter<"CommentAnalysis">
    moodTrend?: JsonNullableWithAggregatesFilter<"CommentAnalysis">
    createdAt?: DateTimeWithAggregatesFilter<"CommentAnalysis"> | Date | string
  }

  export type ActivityCreateInput = {
    id?: string
    name: string
    description?: string | null
    time?: string | null
    days: JsonNullValueInput | InputJsonValue
    color: string
    category?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    completions?: DailyCompletionCreateNestedManyWithoutActivityInput
  }

  export type ActivityUncheckedCreateInput = {
    id?: string
    name: string
    description?: string | null
    time?: string | null
    days: JsonNullValueInput | InputJsonValue
    color: string
    category?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    completions?: DailyCompletionUncheckedCreateNestedManyWithoutActivityInput
  }

  export type ActivityUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    time?: NullableStringFieldUpdateOperationsInput | string | null
    days?: JsonNullValueInput | InputJsonValue
    color?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completions?: DailyCompletionUpdateManyWithoutActivityNestedInput
  }

  export type ActivityUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    time?: NullableStringFieldUpdateOperationsInput | string | null
    days?: JsonNullValueInput | InputJsonValue
    color?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completions?: DailyCompletionUncheckedUpdateManyWithoutActivityNestedInput
  }

  export type ActivityCreateManyInput = {
    id?: string
    name: string
    description?: string | null
    time?: string | null
    days: JsonNullValueInput | InputJsonValue
    color: string
    category?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ActivityUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    time?: NullableStringFieldUpdateOperationsInput | string | null
    days?: JsonNullValueInput | InputJsonValue
    color?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ActivityUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    time?: NullableStringFieldUpdateOperationsInput | string | null
    days?: JsonNullValueInput | InputJsonValue
    color?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DailyCompletionCreateInput = {
    id?: string
    date: string
    completed?: boolean
    notes?: string | null
    createdAt?: Date | string
    activity: ActivityCreateNestedOneWithoutCompletionsInput
  }

  export type DailyCompletionUncheckedCreateInput = {
    id?: string
    activityId: string
    date: string
    completed?: boolean
    notes?: string | null
    createdAt?: Date | string
  }

  export type DailyCompletionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    activity?: ActivityUpdateOneRequiredWithoutCompletionsNestedInput
  }

  export type DailyCompletionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    activityId?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DailyCompletionCreateManyInput = {
    id?: string
    activityId: string
    date: string
    completed?: boolean
    notes?: string | null
    createdAt?: Date | string
  }

  export type DailyCompletionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DailyCompletionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    activityId?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DailyNoteCreateInput = {
    id?: string
    date: string
    content: string
    mood?: number | null
    predefinedComments?: NullableJsonNullValueInput | InputJsonValue
    customComment?: string | null
    aiAnalysis?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DailyNoteUncheckedCreateInput = {
    id?: string
    date: string
    content: string
    mood?: number | null
    predefinedComments?: NullableJsonNullValueInput | InputJsonValue
    customComment?: string | null
    aiAnalysis?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DailyNoteUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    mood?: NullableIntFieldUpdateOperationsInput | number | null
    predefinedComments?: NullableJsonNullValueInput | InputJsonValue
    customComment?: NullableStringFieldUpdateOperationsInput | string | null
    aiAnalysis?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DailyNoteUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    mood?: NullableIntFieldUpdateOperationsInput | number | null
    predefinedComments?: NullableJsonNullValueInput | InputJsonValue
    customComment?: NullableStringFieldUpdateOperationsInput | string | null
    aiAnalysis?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DailyNoteCreateManyInput = {
    id?: string
    date: string
    content: string
    mood?: number | null
    predefinedComments?: NullableJsonNullValueInput | InputJsonValue
    customComment?: string | null
    aiAnalysis?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type DailyNoteUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    mood?: NullableIntFieldUpdateOperationsInput | number | null
    predefinedComments?: NullableJsonNullValueInput | InputJsonValue
    customComment?: NullableStringFieldUpdateOperationsInput | string | null
    aiAnalysis?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DailyNoteUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    mood?: NullableIntFieldUpdateOperationsInput | number | null
    predefinedComments?: NullableJsonNullValueInput | InputJsonValue
    customComment?: NullableStringFieldUpdateOperationsInput | string | null
    aiAnalysis?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserPreferencesCreateInput = {
    id?: string
    userId?: string
    darkMode?: boolean
    weekStartsOnMonday?: boolean
    notifications?: boolean
    language?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserPreferencesUncheckedCreateInput = {
    id?: string
    userId?: string
    darkMode?: boolean
    weekStartsOnMonday?: boolean
    notifications?: boolean
    language?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserPreferencesUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    darkMode?: BoolFieldUpdateOperationsInput | boolean
    weekStartsOnMonday?: BoolFieldUpdateOperationsInput | boolean
    notifications?: BoolFieldUpdateOperationsInput | boolean
    language?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserPreferencesUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    darkMode?: BoolFieldUpdateOperationsInput | boolean
    weekStartsOnMonday?: BoolFieldUpdateOperationsInput | boolean
    notifications?: BoolFieldUpdateOperationsInput | boolean
    language?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserPreferencesCreateManyInput = {
    id?: string
    userId?: string
    darkMode?: boolean
    weekStartsOnMonday?: boolean
    notifications?: boolean
    language?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserPreferencesUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    darkMode?: BoolFieldUpdateOperationsInput | boolean
    weekStartsOnMonday?: BoolFieldUpdateOperationsInput | boolean
    notifications?: BoolFieldUpdateOperationsInput | boolean
    language?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserPreferencesUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    darkMode?: BoolFieldUpdateOperationsInput | boolean
    weekStartsOnMonday?: BoolFieldUpdateOperationsInput | boolean
    notifications?: BoolFieldUpdateOperationsInput | boolean
    language?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WeeklyStreakCreateInput = {
    id?: string
    activityId: string
    weekStart: string
    streak?: number
    completed?: number
    total?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WeeklyStreakUncheckedCreateInput = {
    id?: string
    activityId: string
    weekStart: string
    streak?: number
    completed?: number
    total?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WeeklyStreakUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    activityId?: StringFieldUpdateOperationsInput | string
    weekStart?: StringFieldUpdateOperationsInput | string
    streak?: IntFieldUpdateOperationsInput | number
    completed?: IntFieldUpdateOperationsInput | number
    total?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WeeklyStreakUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    activityId?: StringFieldUpdateOperationsInput | string
    weekStart?: StringFieldUpdateOperationsInput | string
    streak?: IntFieldUpdateOperationsInput | number
    completed?: IntFieldUpdateOperationsInput | number
    total?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WeeklyStreakCreateManyInput = {
    id?: string
    activityId: string
    weekStart: string
    streak?: number
    completed?: number
    total?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WeeklyStreakUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    activityId?: StringFieldUpdateOperationsInput | string
    weekStart?: StringFieldUpdateOperationsInput | string
    streak?: IntFieldUpdateOperationsInput | number
    completed?: IntFieldUpdateOperationsInput | number
    total?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WeeklyStreakUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    activityId?: StringFieldUpdateOperationsInput | string
    weekStart?: StringFieldUpdateOperationsInput | string
    streak?: IntFieldUpdateOperationsInput | number
    completed?: IntFieldUpdateOperationsInput | number
    total?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NutritionAnalysisCreateInput = {
    id?: string
    userId?: string
    date: string
    mealType: string
    foods: JsonNullValueInput | InputJsonValue
    totalCalories: number
    macronutrients: JsonNullValueInput | InputJsonValue
    imageUrl?: string | null
    aiConfidence?: number
    userAdjustments?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type NutritionAnalysisUncheckedCreateInput = {
    id?: string
    userId?: string
    date: string
    mealType: string
    foods: JsonNullValueInput | InputJsonValue
    totalCalories: number
    macronutrients: JsonNullValueInput | InputJsonValue
    imageUrl?: string | null
    aiConfidence?: number
    userAdjustments?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type NutritionAnalysisUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    mealType?: StringFieldUpdateOperationsInput | string
    foods?: JsonNullValueInput | InputJsonValue
    totalCalories?: IntFieldUpdateOperationsInput | number
    macronutrients?: JsonNullValueInput | InputJsonValue
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    aiConfidence?: FloatFieldUpdateOperationsInput | number
    userAdjustments?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NutritionAnalysisUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    mealType?: StringFieldUpdateOperationsInput | string
    foods?: JsonNullValueInput | InputJsonValue
    totalCalories?: IntFieldUpdateOperationsInput | number
    macronutrients?: JsonNullValueInput | InputJsonValue
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    aiConfidence?: FloatFieldUpdateOperationsInput | number
    userAdjustments?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NutritionAnalysisCreateManyInput = {
    id?: string
    userId?: string
    date: string
    mealType: string
    foods: JsonNullValueInput | InputJsonValue
    totalCalories: number
    macronutrients: JsonNullValueInput | InputJsonValue
    imageUrl?: string | null
    aiConfidence?: number
    userAdjustments?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type NutritionAnalysisUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    mealType?: StringFieldUpdateOperationsInput | string
    foods?: JsonNullValueInput | InputJsonValue
    totalCalories?: IntFieldUpdateOperationsInput | number
    macronutrients?: JsonNullValueInput | InputJsonValue
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    aiConfidence?: FloatFieldUpdateOperationsInput | number
    userAdjustments?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NutritionAnalysisUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    mealType?: StringFieldUpdateOperationsInput | string
    foods?: JsonNullValueInput | InputJsonValue
    totalCalories?: IntFieldUpdateOperationsInput | number
    macronutrients?: JsonNullValueInput | InputJsonValue
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    aiConfidence?: FloatFieldUpdateOperationsInput | number
    userAdjustments?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BodyAnalysisCreateInput = {
    id?: string
    userId?: string
    bodyType: string
    measurements?: NullableJsonNullValueInput | InputJsonValue
    bodyComposition?: NullableJsonNullValueInput | InputJsonValue
    recommendations?: NullableJsonNullValueInput | InputJsonValue
    imageUrl?: string | null
    aiConfidence?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BodyAnalysisUncheckedCreateInput = {
    id?: string
    userId?: string
    bodyType: string
    measurements?: NullableJsonNullValueInput | InputJsonValue
    bodyComposition?: NullableJsonNullValueInput | InputJsonValue
    recommendations?: NullableJsonNullValueInput | InputJsonValue
    imageUrl?: string | null
    aiConfidence?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BodyAnalysisUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    bodyType?: StringFieldUpdateOperationsInput | string
    measurements?: NullableJsonNullValueInput | InputJsonValue
    bodyComposition?: NullableJsonNullValueInput | InputJsonValue
    recommendations?: NullableJsonNullValueInput | InputJsonValue
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    aiConfidence?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BodyAnalysisUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    bodyType?: StringFieldUpdateOperationsInput | string
    measurements?: NullableJsonNullValueInput | InputJsonValue
    bodyComposition?: NullableJsonNullValueInput | InputJsonValue
    recommendations?: NullableJsonNullValueInput | InputJsonValue
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    aiConfidence?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BodyAnalysisCreateManyInput = {
    id?: string
    userId?: string
    bodyType: string
    measurements?: NullableJsonNullValueInput | InputJsonValue
    bodyComposition?: NullableJsonNullValueInput | InputJsonValue
    recommendations?: NullableJsonNullValueInput | InputJsonValue
    imageUrl?: string | null
    aiConfidence?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BodyAnalysisUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    bodyType?: StringFieldUpdateOperationsInput | string
    measurements?: NullableJsonNullValueInput | InputJsonValue
    bodyComposition?: NullableJsonNullValueInput | InputJsonValue
    recommendations?: NullableJsonNullValueInput | InputJsonValue
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    aiConfidence?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BodyAnalysisUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    bodyType?: StringFieldUpdateOperationsInput | string
    measurements?: NullableJsonNullValueInput | InputJsonValue
    bodyComposition?: NullableJsonNullValueInput | InputJsonValue
    recommendations?: NullableJsonNullValueInput | InputJsonValue
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    aiConfidence?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AISuggestionCreateInput = {
    id?: string
    type: string
    title: string
    description: string
    priority: string
    basedOn: JsonNullValueInput | InputJsonValue
    actions?: NullableJsonNullValueInput | InputJsonValue
    dismissedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type AISuggestionUncheckedCreateInput = {
    id?: string
    type: string
    title: string
    description: string
    priority: string
    basedOn: JsonNullValueInput | InputJsonValue
    actions?: NullableJsonNullValueInput | InputJsonValue
    dismissedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type AISuggestionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    basedOn?: JsonNullValueInput | InputJsonValue
    actions?: NullableJsonNullValueInput | InputJsonValue
    dismissedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AISuggestionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    basedOn?: JsonNullValueInput | InputJsonValue
    actions?: NullableJsonNullValueInput | InputJsonValue
    dismissedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AISuggestionCreateManyInput = {
    id?: string
    type: string
    title: string
    description: string
    priority: string
    basedOn: JsonNullValueInput | InputJsonValue
    actions?: NullableJsonNullValueInput | InputJsonValue
    dismissedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type AISuggestionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    basedOn?: JsonNullValueInput | InputJsonValue
    actions?: NullableJsonNullValueInput | InputJsonValue
    dismissedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AISuggestionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    priority?: StringFieldUpdateOperationsInput | string
    basedOn?: JsonNullValueInput | InputJsonValue
    actions?: NullableJsonNullValueInput | InputJsonValue
    dismissedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChatMessageCreateInput = {
    id?: string
    userId?: string
    role: string
    content: string
    timestamp?: Date | string
  }

  export type ChatMessageUncheckedCreateInput = {
    id?: string
    userId?: string
    role: string
    content: string
    timestamp?: Date | string
  }

  export type ChatMessageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChatMessageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChatMessageCreateManyInput = {
    id?: string
    userId?: string
    role: string
    content: string
    timestamp?: Date | string
  }

  export type ChatMessageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChatMessageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CommentAnalysisCreateInput = {
    id?: string
    userId?: string
    date: string
    selectedComments: JsonNullValueInput | InputJsonValue
    customComment?: string | null
    detectedPatterns: JsonNullValueInput | InputJsonValue
    suggestions: JsonNullValueInput | InputJsonValue
    moodTrend?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type CommentAnalysisUncheckedCreateInput = {
    id?: string
    userId?: string
    date: string
    selectedComments: JsonNullValueInput | InputJsonValue
    customComment?: string | null
    detectedPatterns: JsonNullValueInput | InputJsonValue
    suggestions: JsonNullValueInput | InputJsonValue
    moodTrend?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type CommentAnalysisUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    selectedComments?: JsonNullValueInput | InputJsonValue
    customComment?: NullableStringFieldUpdateOperationsInput | string | null
    detectedPatterns?: JsonNullValueInput | InputJsonValue
    suggestions?: JsonNullValueInput | InputJsonValue
    moodTrend?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CommentAnalysisUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    selectedComments?: JsonNullValueInput | InputJsonValue
    customComment?: NullableStringFieldUpdateOperationsInput | string | null
    detectedPatterns?: JsonNullValueInput | InputJsonValue
    suggestions?: JsonNullValueInput | InputJsonValue
    moodTrend?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CommentAnalysisCreateManyInput = {
    id?: string
    userId?: string
    date: string
    selectedComments: JsonNullValueInput | InputJsonValue
    customComment?: string | null
    detectedPatterns: JsonNullValueInput | InputJsonValue
    suggestions: JsonNullValueInput | InputJsonValue
    moodTrend?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type CommentAnalysisUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    selectedComments?: JsonNullValueInput | InputJsonValue
    customComment?: NullableStringFieldUpdateOperationsInput | string | null
    detectedPatterns?: JsonNullValueInput | InputJsonValue
    suggestions?: JsonNullValueInput | InputJsonValue
    moodTrend?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CommentAnalysisUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    selectedComments?: JsonNullValueInput | InputJsonValue
    customComment?: NullableStringFieldUpdateOperationsInput | string | null
    detectedPatterns?: JsonNullValueInput | InputJsonValue
    suggestions?: JsonNullValueInput | InputJsonValue
    moodTrend?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type DailyCompletionListRelationFilter = {
    every?: DailyCompletionWhereInput
    some?: DailyCompletionWhereInput
    none?: DailyCompletionWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type DailyCompletionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ActivityOrderByRelevanceInput = {
    fields: ActivityOrderByRelevanceFieldEnum | ActivityOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ActivityCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    time?: SortOrder
    days?: SortOrder
    color?: SortOrder
    category?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ActivityMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    time?: SortOrder
    color?: SortOrder
    category?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ActivityMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    time?: SortOrder
    color?: SortOrder
    category?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type ActivityScalarRelationFilter = {
    is?: ActivityWhereInput
    isNot?: ActivityWhereInput
  }

  export type DailyCompletionOrderByRelevanceInput = {
    fields: DailyCompletionOrderByRelevanceFieldEnum | DailyCompletionOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type DailyCompletionActivityIdDateCompoundUniqueInput = {
    activityId: string
    date: string
  }

  export type DailyCompletionCountOrderByAggregateInput = {
    id?: SortOrder
    activityId?: SortOrder
    date?: SortOrder
    completed?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
  }

  export type DailyCompletionMaxOrderByAggregateInput = {
    id?: SortOrder
    activityId?: SortOrder
    date?: SortOrder
    completed?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
  }

  export type DailyCompletionMinOrderByAggregateInput = {
    id?: SortOrder
    activityId?: SortOrder
    date?: SortOrder
    completed?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type DailyNoteOrderByRelevanceInput = {
    fields: DailyNoteOrderByRelevanceFieldEnum | DailyNoteOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type DailyNoteCountOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    content?: SortOrder
    mood?: SortOrder
    predefinedComments?: SortOrder
    customComment?: SortOrder
    aiAnalysis?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DailyNoteAvgOrderByAggregateInput = {
    mood?: SortOrder
  }

  export type DailyNoteMaxOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    content?: SortOrder
    mood?: SortOrder
    customComment?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DailyNoteMinOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    content?: SortOrder
    mood?: SortOrder
    customComment?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DailyNoteSumOrderByAggregateInput = {
    mood?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type UserPreferencesOrderByRelevanceInput = {
    fields: UserPreferencesOrderByRelevanceFieldEnum | UserPreferencesOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type UserPreferencesCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    darkMode?: SortOrder
    weekStartsOnMonday?: SortOrder
    notifications?: SortOrder
    language?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserPreferencesMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    darkMode?: SortOrder
    weekStartsOnMonday?: SortOrder
    notifications?: SortOrder
    language?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserPreferencesMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    darkMode?: SortOrder
    weekStartsOnMonday?: SortOrder
    notifications?: SortOrder
    language?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type WeeklyStreakOrderByRelevanceInput = {
    fields: WeeklyStreakOrderByRelevanceFieldEnum | WeeklyStreakOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type WeeklyStreakActivityIdWeekStartCompoundUniqueInput = {
    activityId: string
    weekStart: string
  }

  export type WeeklyStreakCountOrderByAggregateInput = {
    id?: SortOrder
    activityId?: SortOrder
    weekStart?: SortOrder
    streak?: SortOrder
    completed?: SortOrder
    total?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WeeklyStreakAvgOrderByAggregateInput = {
    streak?: SortOrder
    completed?: SortOrder
    total?: SortOrder
  }

  export type WeeklyStreakMaxOrderByAggregateInput = {
    id?: SortOrder
    activityId?: SortOrder
    weekStart?: SortOrder
    streak?: SortOrder
    completed?: SortOrder
    total?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WeeklyStreakMinOrderByAggregateInput = {
    id?: SortOrder
    activityId?: SortOrder
    weekStart?: SortOrder
    streak?: SortOrder
    completed?: SortOrder
    total?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WeeklyStreakSumOrderByAggregateInput = {
    streak?: SortOrder
    completed?: SortOrder
    total?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NutritionAnalysisOrderByRelevanceInput = {
    fields: NutritionAnalysisOrderByRelevanceFieldEnum | NutritionAnalysisOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type NutritionAnalysisCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    date?: SortOrder
    mealType?: SortOrder
    foods?: SortOrder
    totalCalories?: SortOrder
    macronutrients?: SortOrder
    imageUrl?: SortOrder
    aiConfidence?: SortOrder
    userAdjustments?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type NutritionAnalysisAvgOrderByAggregateInput = {
    totalCalories?: SortOrder
    aiConfidence?: SortOrder
  }

  export type NutritionAnalysisMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    date?: SortOrder
    mealType?: SortOrder
    totalCalories?: SortOrder
    imageUrl?: SortOrder
    aiConfidence?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type NutritionAnalysisMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    date?: SortOrder
    mealType?: SortOrder
    totalCalories?: SortOrder
    imageUrl?: SortOrder
    aiConfidence?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type NutritionAnalysisSumOrderByAggregateInput = {
    totalCalories?: SortOrder
    aiConfidence?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type BodyAnalysisOrderByRelevanceInput = {
    fields: BodyAnalysisOrderByRelevanceFieldEnum | BodyAnalysisOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type BodyAnalysisCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    bodyType?: SortOrder
    measurements?: SortOrder
    bodyComposition?: SortOrder
    recommendations?: SortOrder
    imageUrl?: SortOrder
    aiConfidence?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BodyAnalysisAvgOrderByAggregateInput = {
    aiConfidence?: SortOrder
  }

  export type BodyAnalysisMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    bodyType?: SortOrder
    imageUrl?: SortOrder
    aiConfidence?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BodyAnalysisMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    bodyType?: SortOrder
    imageUrl?: SortOrder
    aiConfidence?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BodyAnalysisSumOrderByAggregateInput = {
    aiConfidence?: SortOrder
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type AISuggestionOrderByRelevanceInput = {
    fields: AISuggestionOrderByRelevanceFieldEnum | AISuggestionOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type AISuggestionCountOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    title?: SortOrder
    description?: SortOrder
    priority?: SortOrder
    basedOn?: SortOrder
    actions?: SortOrder
    dismissedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type AISuggestionMaxOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    title?: SortOrder
    description?: SortOrder
    priority?: SortOrder
    dismissedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type AISuggestionMinOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    title?: SortOrder
    description?: SortOrder
    priority?: SortOrder
    dismissedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type ChatMessageOrderByRelevanceInput = {
    fields: ChatMessageOrderByRelevanceFieldEnum | ChatMessageOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ChatMessageCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    role?: SortOrder
    content?: SortOrder
    timestamp?: SortOrder
  }

  export type ChatMessageMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    role?: SortOrder
    content?: SortOrder
    timestamp?: SortOrder
  }

  export type ChatMessageMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    role?: SortOrder
    content?: SortOrder
    timestamp?: SortOrder
  }

  export type CommentAnalysisOrderByRelevanceInput = {
    fields: CommentAnalysisOrderByRelevanceFieldEnum | CommentAnalysisOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type CommentAnalysisCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    date?: SortOrder
    selectedComments?: SortOrder
    customComment?: SortOrder
    detectedPatterns?: SortOrder
    suggestions?: SortOrder
    moodTrend?: SortOrder
    createdAt?: SortOrder
  }

  export type CommentAnalysisMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    date?: SortOrder
    customComment?: SortOrder
    createdAt?: SortOrder
  }

  export type CommentAnalysisMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    date?: SortOrder
    customComment?: SortOrder
    createdAt?: SortOrder
  }

  export type DailyCompletionCreateNestedManyWithoutActivityInput = {
    create?: XOR<DailyCompletionCreateWithoutActivityInput, DailyCompletionUncheckedCreateWithoutActivityInput> | DailyCompletionCreateWithoutActivityInput[] | DailyCompletionUncheckedCreateWithoutActivityInput[]
    connectOrCreate?: DailyCompletionCreateOrConnectWithoutActivityInput | DailyCompletionCreateOrConnectWithoutActivityInput[]
    createMany?: DailyCompletionCreateManyActivityInputEnvelope
    connect?: DailyCompletionWhereUniqueInput | DailyCompletionWhereUniqueInput[]
  }

  export type DailyCompletionUncheckedCreateNestedManyWithoutActivityInput = {
    create?: XOR<DailyCompletionCreateWithoutActivityInput, DailyCompletionUncheckedCreateWithoutActivityInput> | DailyCompletionCreateWithoutActivityInput[] | DailyCompletionUncheckedCreateWithoutActivityInput[]
    connectOrCreate?: DailyCompletionCreateOrConnectWithoutActivityInput | DailyCompletionCreateOrConnectWithoutActivityInput[]
    createMany?: DailyCompletionCreateManyActivityInputEnvelope
    connect?: DailyCompletionWhereUniqueInput | DailyCompletionWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type DailyCompletionUpdateManyWithoutActivityNestedInput = {
    create?: XOR<DailyCompletionCreateWithoutActivityInput, DailyCompletionUncheckedCreateWithoutActivityInput> | DailyCompletionCreateWithoutActivityInput[] | DailyCompletionUncheckedCreateWithoutActivityInput[]
    connectOrCreate?: DailyCompletionCreateOrConnectWithoutActivityInput | DailyCompletionCreateOrConnectWithoutActivityInput[]
    upsert?: DailyCompletionUpsertWithWhereUniqueWithoutActivityInput | DailyCompletionUpsertWithWhereUniqueWithoutActivityInput[]
    createMany?: DailyCompletionCreateManyActivityInputEnvelope
    set?: DailyCompletionWhereUniqueInput | DailyCompletionWhereUniqueInput[]
    disconnect?: DailyCompletionWhereUniqueInput | DailyCompletionWhereUniqueInput[]
    delete?: DailyCompletionWhereUniqueInput | DailyCompletionWhereUniqueInput[]
    connect?: DailyCompletionWhereUniqueInput | DailyCompletionWhereUniqueInput[]
    update?: DailyCompletionUpdateWithWhereUniqueWithoutActivityInput | DailyCompletionUpdateWithWhereUniqueWithoutActivityInput[]
    updateMany?: DailyCompletionUpdateManyWithWhereWithoutActivityInput | DailyCompletionUpdateManyWithWhereWithoutActivityInput[]
    deleteMany?: DailyCompletionScalarWhereInput | DailyCompletionScalarWhereInput[]
  }

  export type DailyCompletionUncheckedUpdateManyWithoutActivityNestedInput = {
    create?: XOR<DailyCompletionCreateWithoutActivityInput, DailyCompletionUncheckedCreateWithoutActivityInput> | DailyCompletionCreateWithoutActivityInput[] | DailyCompletionUncheckedCreateWithoutActivityInput[]
    connectOrCreate?: DailyCompletionCreateOrConnectWithoutActivityInput | DailyCompletionCreateOrConnectWithoutActivityInput[]
    upsert?: DailyCompletionUpsertWithWhereUniqueWithoutActivityInput | DailyCompletionUpsertWithWhereUniqueWithoutActivityInput[]
    createMany?: DailyCompletionCreateManyActivityInputEnvelope
    set?: DailyCompletionWhereUniqueInput | DailyCompletionWhereUniqueInput[]
    disconnect?: DailyCompletionWhereUniqueInput | DailyCompletionWhereUniqueInput[]
    delete?: DailyCompletionWhereUniqueInput | DailyCompletionWhereUniqueInput[]
    connect?: DailyCompletionWhereUniqueInput | DailyCompletionWhereUniqueInput[]
    update?: DailyCompletionUpdateWithWhereUniqueWithoutActivityInput | DailyCompletionUpdateWithWhereUniqueWithoutActivityInput[]
    updateMany?: DailyCompletionUpdateManyWithWhereWithoutActivityInput | DailyCompletionUpdateManyWithWhereWithoutActivityInput[]
    deleteMany?: DailyCompletionScalarWhereInput | DailyCompletionScalarWhereInput[]
  }

  export type ActivityCreateNestedOneWithoutCompletionsInput = {
    create?: XOR<ActivityCreateWithoutCompletionsInput, ActivityUncheckedCreateWithoutCompletionsInput>
    connectOrCreate?: ActivityCreateOrConnectWithoutCompletionsInput
    connect?: ActivityWhereUniqueInput
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type ActivityUpdateOneRequiredWithoutCompletionsNestedInput = {
    create?: XOR<ActivityCreateWithoutCompletionsInput, ActivityUncheckedCreateWithoutCompletionsInput>
    connectOrCreate?: ActivityCreateOrConnectWithoutCompletionsInput
    upsert?: ActivityUpsertWithoutCompletionsInput
    connect?: ActivityWhereUniqueInput
    update?: XOR<XOR<ActivityUpdateToOneWithWhereWithoutCompletionsInput, ActivityUpdateWithoutCompletionsInput>, ActivityUncheckedUpdateWithoutCompletionsInput>
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type DailyCompletionCreateWithoutActivityInput = {
    id?: string
    date: string
    completed?: boolean
    notes?: string | null
    createdAt?: Date | string
  }

  export type DailyCompletionUncheckedCreateWithoutActivityInput = {
    id?: string
    date: string
    completed?: boolean
    notes?: string | null
    createdAt?: Date | string
  }

  export type DailyCompletionCreateOrConnectWithoutActivityInput = {
    where: DailyCompletionWhereUniqueInput
    create: XOR<DailyCompletionCreateWithoutActivityInput, DailyCompletionUncheckedCreateWithoutActivityInput>
  }

  export type DailyCompletionCreateManyActivityInputEnvelope = {
    data: DailyCompletionCreateManyActivityInput | DailyCompletionCreateManyActivityInput[]
    skipDuplicates?: boolean
  }

  export type DailyCompletionUpsertWithWhereUniqueWithoutActivityInput = {
    where: DailyCompletionWhereUniqueInput
    update: XOR<DailyCompletionUpdateWithoutActivityInput, DailyCompletionUncheckedUpdateWithoutActivityInput>
    create: XOR<DailyCompletionCreateWithoutActivityInput, DailyCompletionUncheckedCreateWithoutActivityInput>
  }

  export type DailyCompletionUpdateWithWhereUniqueWithoutActivityInput = {
    where: DailyCompletionWhereUniqueInput
    data: XOR<DailyCompletionUpdateWithoutActivityInput, DailyCompletionUncheckedUpdateWithoutActivityInput>
  }

  export type DailyCompletionUpdateManyWithWhereWithoutActivityInput = {
    where: DailyCompletionScalarWhereInput
    data: XOR<DailyCompletionUpdateManyMutationInput, DailyCompletionUncheckedUpdateManyWithoutActivityInput>
  }

  export type DailyCompletionScalarWhereInput = {
    AND?: DailyCompletionScalarWhereInput | DailyCompletionScalarWhereInput[]
    OR?: DailyCompletionScalarWhereInput[]
    NOT?: DailyCompletionScalarWhereInput | DailyCompletionScalarWhereInput[]
    id?: StringFilter<"DailyCompletion"> | string
    activityId?: StringFilter<"DailyCompletion"> | string
    date?: StringFilter<"DailyCompletion"> | string
    completed?: BoolFilter<"DailyCompletion"> | boolean
    notes?: StringNullableFilter<"DailyCompletion"> | string | null
    createdAt?: DateTimeFilter<"DailyCompletion"> | Date | string
  }

  export type ActivityCreateWithoutCompletionsInput = {
    id?: string
    name: string
    description?: string | null
    time?: string | null
    days: JsonNullValueInput | InputJsonValue
    color: string
    category?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ActivityUncheckedCreateWithoutCompletionsInput = {
    id?: string
    name: string
    description?: string | null
    time?: string | null
    days: JsonNullValueInput | InputJsonValue
    color: string
    category?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ActivityCreateOrConnectWithoutCompletionsInput = {
    where: ActivityWhereUniqueInput
    create: XOR<ActivityCreateWithoutCompletionsInput, ActivityUncheckedCreateWithoutCompletionsInput>
  }

  export type ActivityUpsertWithoutCompletionsInput = {
    update: XOR<ActivityUpdateWithoutCompletionsInput, ActivityUncheckedUpdateWithoutCompletionsInput>
    create: XOR<ActivityCreateWithoutCompletionsInput, ActivityUncheckedCreateWithoutCompletionsInput>
    where?: ActivityWhereInput
  }

  export type ActivityUpdateToOneWithWhereWithoutCompletionsInput = {
    where?: ActivityWhereInput
    data: XOR<ActivityUpdateWithoutCompletionsInput, ActivityUncheckedUpdateWithoutCompletionsInput>
  }

  export type ActivityUpdateWithoutCompletionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    time?: NullableStringFieldUpdateOperationsInput | string | null
    days?: JsonNullValueInput | InputJsonValue
    color?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ActivityUncheckedUpdateWithoutCompletionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    time?: NullableStringFieldUpdateOperationsInput | string | null
    days?: JsonNullValueInput | InputJsonValue
    color?: StringFieldUpdateOperationsInput | string
    category?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DailyCompletionCreateManyActivityInput = {
    id?: string
    date: string
    completed?: boolean
    notes?: string | null
    createdAt?: Date | string
  }

  export type DailyCompletionUpdateWithoutActivityInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DailyCompletionUncheckedUpdateWithoutActivityInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DailyCompletionUncheckedUpdateManyWithoutActivityInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}