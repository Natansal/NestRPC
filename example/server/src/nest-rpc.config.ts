import { defineManifest } from 'server';
import { AppRouter } from './app.router';
import { UserMutationsRouter } from './user/user.mutations.router';
import { UserQueriesRouter } from './user/user.queries.router';

export const manifest = defineManifest({
  app: AppRouter,
  user: {
    mutations: UserMutationsRouter,
    queries: UserQueriesRouter,
  },
});

export type Manifest = typeof manifest;
