# json-rpc-request

Request service for executing requests in Json RPC format

Json RPC uses just POST method for processing requests in

## Installation

```sh
yarn add @budarin/json-rpc-request
```

## Usage

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

const result = await apiRequest<Params, Result>({
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
//             your_money: '5$',
//         },
//     }
// }
```

## License

MIT
