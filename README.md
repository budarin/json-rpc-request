# json-rpc-request

A TypeScript library for making JSON-RPC 2.0 requests with built-in error handling, request validation, and abort support.

## Features

- 🔒 **Type-safe** - Full TypeScript support with generic types for requests and responses
- ✅ **JSON-RPC 2.0 compliant** - Follows the JSON-RPC 2.0 specification
- 🛡️ **Built-in validation** - Validates response structure automatically
- 🚫 **Abort support** - Cancel requests using AbortController
- 🍪 **Cookie management** - Configurable credential handling
- 📦 **Zero dependencies** - Lightweight with no external dependencies
- 🔍 **Request tracking** - Automatic x-request-id header for request correlation

## Installation

```sh
yarn add @budarin/json-rpc-request
```

or

```sh
npm install @budarin/json-rpc-request
```

## Usage

### Basic Usage

```ts
import { createRequest } from '@budarin/json-rpc-request';

const baseApiUrl = 'http://domain/api';
const apiRequest = createRequest(baseApiUrl);

type Params = {
    multiplier: number;
};
type Result = {
    your_money: number;
};
type ErrorData = {
    your_money: number;
};

const result = await apiRequest<Params, Result, ErrorData>({
    body: {
        id: 1,
        method: 'multiply_my_money',
        params: {
            multiplier: 200,
        },
    },
});

console.log(result);

// Success response:
// {
//     id: 1,
//     result: {
//         your_money: 4000000000000000000, 😁
//     }
// }
//
// Error response:
// {
//     id: 1,
//     error: {
//         code: 500,
//         message: 'you really want a lot',
//         data: {
//             your_money: 5,
//         },
//     }
// }
```

### Request Cancellation

You can cancel requests using AbortController:

```ts
import { createRequest, ABORTED_ERROR_CODE } from '@budarin/json-rpc-request';

const apiRequest = createRequest('http://domain/api');
const controller = new AbortController();

// Cancel request after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
    const result = await apiRequest({
        body: {
            id: 1,
            method: 'long_running_operation',
            params: { data: 'some data' },
        },
        signal: controller.signal,
    });
} catch (error) {
    // Handle aborted request
    if (error.error?.code === ABORTED_ERROR_CODE) {
        console.log('Request was cancelled');
    }
}
```

### Response Validation

The library provides utility functions to check response types:

```ts
import { createRequest, isResult, isError, validateResponse } from '@budarin/json-rpc-request';

const apiRequest = createRequest('http://domain/api');

const response = await apiRequest({
    body: {
        id: 1,
        method: 'get_user',
        params: { userId: 123 },
    },
});

if (isResult(response)) {
    // TypeScript knows this is a success response
    console.log('User data:', response.result);
} else if (isError(response)) {
    // TypeScript knows this is an error response
    console.error('Error:', response.error.message);
}
```

### Configuration Options

You can configure the request behavior by passing options to `createRequest`:

```ts
import { createRequest } from '@budarin/json-rpc-request';

// Include cookies with requests (useful for authentication)
const apiRequest = createRequest('http://domain/api', {
    credentials: 'include',
});

// Or explicitly set same-origin policy
const apiRequest = createRequest('http://domain/api', {
    credentials: 'same-origin',
});

// Or never send cookies
const apiRequest = createRequest('http://domain/api', {
    credentials: 'omit',
});
```

## API Reference

### Types

```ts
// Request type
type JsonRpcRequest<P = undefined> = {
    id: string | number;
    method: string;
    params?: P;
};

// Response type
type JsonRpcResponse<T, U = any> =
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

// Error type
type JsonRpcError<U> = {
    code: number;
    message: string;
    data?: U;
    stack?: string;
};

// Configuration options
type CreateRequestOptions = {
    credentials?: RequestCredentials;
};
```

### Constants

```ts
export const UNEXPECTED_ERROR_CODE = -1;  // For unexpected errors
export const ABORTED_ERROR_CODE = -2;     // For cancelled requests
```

### Functions

#### `createRequest(baseUrl, options?)`

Creates a request function for making JSON-RPC calls.

**Parameters:**
- `baseUrl` (string) - Base URL for the API
- `options` (CreateRequestOptions, optional) - Configuration options

**Returns:** A request function

#### `isResult(data)`

Type guard to check if response is a success response.

#### `isError(data)`

Type guard to check if response is an error response.

#### `validateResponse(data)`

Validates if data matches JSON-RPC response structure.

## Automatic Headers

The library automatically sets these headers:

- `x-request-id`: Set to the request ID for correlation
- `content-type`: `application/json; charset=utf-8`
- `accept`: `application/json; charset=utf-8`

## Error Handling

The library handles various error scenarios:

1. **Network errors** - Returns error with `UNEXPECTED_ERROR_CODE`
2. **HTTP errors** - Returns error with HTTP status code
3. **Aborted requests** - Returns error with `ABORTED_ERROR_CODE`
4. **Invalid responses** - Throws error for malformed JSON-RPC responses

## Configuration Options

### `credentials`

Controls cookie sending behavior:

- `'include'` - Always send cookies with requests (useful for cross-origin authenticated requests)
- `'same-origin'` - Send cookies only for same-origin requests (default)
- `'omit'` - Never send cookies

## Repository

[GitHub Repository](https://github.com/budarin/json-rpc-request)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Vadim Budarin](https://github.com/budarin)
