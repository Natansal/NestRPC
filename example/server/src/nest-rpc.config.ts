import { defineAppRouter, type InferNestRpcRouterApp } from 'server';
import { AppRouter } from './app.router';
import { UserMutationsRouter } from './user/user.mutations.router';
import { UserQueriesRouter } from './user/user.queries.router';

export const config = defineAppRouter({
  app: AppRouter,
  user: {
    mutations: UserMutationsRouter,
    queries: UserQueriesRouter,
  },
});

export type RpcApp = InferNestRpcRouterApp<typeof config>;
