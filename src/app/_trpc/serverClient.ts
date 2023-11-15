import {  httpBatchLink } from '@trpc/client';
import  {  appRouter } from '@/server';
import { absoluteURL } from '@/lib/utils';

export const serverClient = appRouter.createCaller({
    links:[
        httpBatchLink({
            url: absoluteURL('/api/trpc'),
        })

    ]
})
