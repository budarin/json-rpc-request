# json-rpc-request

Request service for executing requests in Json RPC format

Json RPC uses just POST method for processing requests in

## Installation

```sh
yarn add @budarin/json-rpc-request
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
    headers: {
        'Content-Type': 'application/json',
    },
});

console.log(result);

// response:
// {
//     id: 1,
//     result: {
//         your_money: 4000000000000000000, 😁
//     }
// }
//
// or maybe:
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

### Configuration Options

You can configure the request behavior by passing options to `createRequest`:

```ts
import { createRequest } from '@budarin/json-rpc-request';

// Include cookies with requests (useful for authentication)
const apiRequest = createRequest('http://domain/api', {
    credentials: 'include',
});

// Or explicitly set same-origin policy (this is the default behavior)
const apiRequest = createRequest('http://domain/api', {
    credentials: 'same-origin',
});

// Or never send cookies
const apiRequest = createRequest('http://domain/api', {
    credentials: 'omit',
});
```

#### Available Options

-   `credentials` - Controls cookie sending behavior:
    -   `'include'` - Always send cookies with requests (useful for cross-origin authenticated requests)
    -   `'same-origin'` - Send cookies only for same-origin requests (default fetch behavior - cookies are sent automatically for same-origin requests)
    -   `'omit'` - Never send cookies

## License

MIT
