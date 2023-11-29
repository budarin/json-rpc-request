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

await requests('http://domain/todos');
```

## License

MIT
