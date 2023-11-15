import {  httpBatchLink } from '@trpc/client';
import  {  appRouter } from '@/server';

export const serverClient = appRouter.createCaller({
    links:[
        httpBatchLink({
            url: process.env.HOST+'/api/trpc',
        })

    ]
})
