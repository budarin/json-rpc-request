import fetchMock from 'fetch-mock';
import { ulid } from '@budarin/ulid';
import { describe, expect, it, afterEach } from 'vitest';

import Request, { WRONG_RESPONSE_STRUCTURE } from './index.ts';
import { UNEXPECTED_ERROR_CODE } from '../../../common/consts.ts';

describe('Request', () => {
    const id = ulid();
    const apiMethodName = 'createTodo';
    const baseUrl = 'https://example.com/api';
    const request = Request(baseUrl);

    afterEach(() => {
        fetchMock.restore();
    });

    it('успешное завершение запроса с полными данными и с правильным ответом', async () => {
        const requestInit = {
            body: {
                id,
                apiMethodName,
                params: {},
            },
        };
        const response = {
            id,
            result: {
                data: 'some data',
            },
        };
        const expected = {
            ...response,
            id: expect.any(String) as string,
        };

        fetchMock.post(`${baseUrl}/${apiMethodName}`, response);

        expect(await request(requestInit)).toEqual(expected);
    });

    it('успешное завершение запроса с отсутствующим id запроса и с правильным ответом', async () => {
        const requestInit = { body: { apiMethodName, params: {} } };
        const response = {
            id,
            result: {
                data: 'some data',
            },
        };
        const expected = {
            ...response,
            id: expect.any(String) as string,
        };

        fetchMock.post(`${baseUrl}/${apiMethodName}`, response);

        expect(await request(requestInit)).toEqual(expected);
    });

    it('сетевая ошибка', async () => {
        const requestInit = {
            body: { id, apiMethodName, params: {} },
        };
        const expected = {
            id: expect.any(String) as string,
            error: {
                code: 500,
                message: 'Internal Server Error',
                stack: expect.any(String) as string,
            },
        };

        fetchMock.post(`${baseUrl}/${apiMethodName}`, 500);

        expect(await request(requestInit)).toEqual(expected);
    });

    it('ошибка в структуре ответа', async () => {
        const requestInit = {
            body: { id, apiMethodName, params: {} },
        };
        const response = {};
        const expected = {
            id: expect.any(String) as string,
            error: {
                code: 500,
                message: WRONG_RESPONSE_STRUCTURE,
                stack: expect.any(String) as string,
            },
        };

        fetchMock.post(`${baseUrl}/${apiMethodName}`, response);

        expect(await request(requestInit)).toEqual(expected);
    });

    it('синтаксическая ошибка в ответе', async () => {
        const requestInit = {
            body: { id, apiMethodName, params: {} },
        };
        const response = '{"id":1; "result":"some data"';
        const expected = {
            id: expect.any(String) as string,
            error: {
                code: UNEXPECTED_ERROR_CODE,
                message: expect.any(String) as string,
                stack: expect.any(String) as string,
            },
        };

        fetchMock.post(`${baseUrl}/${apiMethodName}`, response);

        expect(await request(requestInit)).toEqual(expected);
    });

    it('ошибка типа ответа: ответ не JSON', async () => {
        const requestInit = {
            body: { id, apiMethodName, params: {} },
        };
        const response = 'Не верный тип ответа';
        const expected = {
            id: expect.any(String) as string,
            error: {
                code: UNEXPECTED_ERROR_CODE,
                message: expect.any(String) as string,
                stack: expect.any(String) as string,
            },
        };

        fetchMock.post(`${baseUrl}/${apiMethodName}`, response);

        expect(await request(requestInit)).toEqual(expected);
    });
});
