import { ulid } from '@budarin/ulid';

export type DeepReadonly<T> = T extends (infer R)[]
    ? // eslint-disable-next-line no-use-before-define
      DeepReadonlyArray<R>
    : // eslint-disable-next-line @typescript-eslint/ban-types
    T extends Function
    ? T
    : T extends object
    ? // eslint-disable-next-line no-use-before-define
      DeepReadonlyObject<T>
    : T;

interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

type DeepReadonlyObject<T> = {
    readonly [P in keyof T]: DeepReadonly<T[P]>;
};

export type Url = string;

export type JsonRpcRequest<T> = {
    id: string;
    method: string;
    params: T;
};

export type JsonRpcError<U> = {
    code: number;
    message: string;
    data?: U;
    stack?: string;
};

export type ResultOrError<T, U> =
    | {
          id: string;
          result: DeepReadonly<T>;
          error?: never;
      }
    | {
          id: string;
          result?: never;
          error: DeepReadonly<JsonRpcError<U>>;
      };

export const UNEXPECTED_ERROR_CODE = -1;

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
export function validateResponse<T, U>(data: any): data is ResultOrError<T, U> {
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

export const request = async <T, U>(
    input: Url,
    options?: Omit<RequestInit, 'body'> & { body: JsonRpcRequest<T> },
): Promise<ResultOrError<T, U>> => {
    const id = options ? options.body.id : ulid();

    try {
        let response: Response;

        if (options) {
            response = await fetch(input, {
                ...options,
                body: JSON.stringify(options.body),
                headers: {
                    ...options?.headers,
                    [xRequestId]: id,
                    'content-type': appJson,
                    accept: appJson,
                },
            });
        } else {
            response = await fetch(input, {
                headers: {
                    [xRequestId]: id,
                    accept: appJson,
                },
            });
        }

        if (response.ok === false) {
            return {
                id,
                error: {
                    code: response.status,
                    message: response.statusText,
                },
            };
        }

        const data = response.json();

        if (!validateResponse<T, U>(data)) {
            throw new Error('Структура данных в ответе сервера не соответствует формату JSON-RPC');
        }

        return data;
    } catch (error) {
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
