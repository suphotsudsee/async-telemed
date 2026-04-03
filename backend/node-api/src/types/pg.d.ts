declare module "pg" {
  import { Pool as PgPool, PoolClient, QueryResult, QueryConfig } from "pg";

  export class Pool {
    constructor(config?: {
      connectionString?: string;
      host?: string;
      port?: number;
      database?: string;
      user?: string;
      password?: string;
      max?: number;
      idleTimeoutMillis?: number;
      connectionTimeoutMillis?: number;
    });

    query<R = Record<string, unknown>>(
      queryTextOrConfig: string | QueryConfig,
      values?: unknown[]
    ): Promise<QueryResult<R>>;

    connect(): Promise<PoolClient>;

    end(): Promise<void>;

    on(event: "error" | "connect", listener: (err: Error) => void): this;
  }

  export class Client {
    constructor(config?: {
      connectionString?: string;
      host?: string;
      port?: number;
      database?: string;
      user?: string;
      password?: string;
    });

    query<R = Record<string, unknown>>(
      queryTextOrConfig: string | QueryConfig,
      values?: unknown[]
    ): Promise<QueryResult<R>>;

    connect(): Promise<void>;

    end(): Promise<void>;
  }
}