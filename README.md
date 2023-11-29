# json-rpc-request

Request service for executing requests in Json RPC format

Json RPC uses just POST method for processing requests in

## Installation

```sh
yarn add @budarin/json-rpc-request
```

## Usage

```ts
import { request } from '@budarin/json-rpc-request';

await request('http://domain/api/', {
    method: 'POST',
    body: JSON.stringify({
        id: 1,
        method: 'multiply_my_money',
        params: {
            multiplier: 200,
        },
    }),
    headers: {
        'Content-Type': 'application/json',
    },
});

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

await requests('http://domain/todos');

// response
// {
//     id: '018c1b7d-0f42-0764-522b-6829727f48e3',
//     result: [
//         {
//             title: 'todo 1',
//         },
//         {
//             title: 'todo 2',
//         },
//     ];
// }
```

## License

MIT
