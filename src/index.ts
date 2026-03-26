type Primitive = string | number | boolean | bigint | symbol | null | undefined;

type Builtin = Primitive | Date | RegExp | Error | Promise<unknown> | ((...args: unknown[]) => unknown);

export type DeepReadonly<T> =
    // 1) Built-ins and primitives stay as-is
    T extends Builtin
        ? T
        : // 2) Tuples (preserve length and readonly per element)
          T extends readonly [infer A, ...infer R]
          ? readonly [DeepReadonly<A>, ...DeepReadonlyTuple<R>]
          : // 3) Readonly arrays
            T extends readonly (infer U)[]
            ? readonly DeepReadonly<U>[]
            : // 4) Mutable arrays
              T extends (infer U)[]
              ? readonly DeepReadonly<U>[]
              : // 5) Map
                T extends Map<infer K, infer V>
                ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
                : // 6) ReadonlyMap
                  T extends ReadonlyMap<infer K, infer V>
                  ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
                  : // 7) Set
                    T extends Set<infer U>
                    ? ReadonlySet<DeepReadonly<U>>
                    : // 8) ReadonlySet
                      T extends ReadonlySet<infer U>
                      ? ReadonlySet<DeepReadonly<U>>
                      : // 9) Object
                        T extends object
                        ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
                        : // 10) Fallback
                          T;

type DeepReadonlyTuple<T extends readonly unknown[]> = T extends readonly [infer A, ...infer R]
    ? readonly [DeepReadonly<A>, ...DeepReadonlyTuple<R>]
    : readonly [];

export type Url = string;

export type JsonRpcRequest<P = undefined> = {
    id: string | number;
    method: string;
    params?: P;
};

export type JsonRpcError<U> = {
    code: number;
    message: string;
    data?: U;
    stack?: string;
};

export type JsonRpcResponse<T, U = any> =
    | {
          id: string | number;
          result: DeepReadonly<T>;
          error?: never;
      }
    | {
          id: string | number;
          result?: never;
          error: DeepReadonly<JsonRpcError<U>>;
      };

export const UNEXPECTED_ERROR_CODE = -1;
export const ABORTED_ERROR_CODE = -2;

const xRequestId = 'x-request-id';
const appJson = 'application/json; charset=utf-8';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isResult<T>(data: any): data is { id: string; result: DeepReadonly<T>; error?: never } {
    return 'id' in data && 'result' in data && !('error' in data);
}

export function isError<U>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
): data is { id: string; result?: never; error: DeepReadonly<JsonRpcError<U>> } {
    return 'id' in data && 'error' in data && !('result' in data);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateResponse<T, U>(data: any): data is JsonRpcResponse<T, U> {
    if (isResult<T>(data)) {
        return true;
    }

    if (isError<U>(data)) {
        const { error } = data;

        return (
            typeof error.code === 'number' &&
            typeof error.message === 'string' &&
            ('data' in error ? typeof error.data === 'object' : true) &&
            ('stack' in error ? typeof error.stack === 'string' : true)
        );
    }

    return false;
}

export type CreateRequestOptions = {
    credentials?: RequestCredentials;
};

export const createRequest =
    (baseUrl: Url, config?: CreateRequestOptions) =>
    async <P, T, U = any>(
        options: Omit<RequestInit, 'body' | 'method'> & { body: JsonRpcRequest<P> },
    ): Promise<JsonRpcResponse<T, U>> => {
        const id = options.body.id;

        try {
            const response = await fetch(`${baseUrl}/${options.body.method}`, {
                ...options,
                mode: 'same-origin',
                method: 'POST',
                body: JSON.stringify(options.body),
                credentials: config?.credentials,
                headers: {
                    ...options?.headers,
                    [xRequestId]: String(id),
                    'content-type': appJson,
                    accept: appJson,
                },
            });

            if (response.ok === false) {
                return {
                    id,
                    error: {
                        code: response.status,
                        message: response.statusText,
                    },
                };
            }

            const data = await response.json();

            if (!validateResponse<T, U>(data)) {
                throw new Error('Структура данных в ответе сервера не соответствует формату JSON-RPC');
            }

            return data;
        } catch (error) {
            // Отмена запроса - возвращаем специальный код ошибки
            if (error instanceof Error && error.name === 'AbortError') {
                return {
                    id,
                    error: {
                        code: ABORTED_ERROR_CODE,
                        message: 'Request aborted',
                    },
                };
            }

            return {
                id,
                error: {
                    code: UNEXPECTED_ERROR_CODE,
                    message: (error as Error).message,
                    stack: (error as Error).stack,
                },
            };
        }
    };

export type Request = ReturnType<typeof createRequest>;
