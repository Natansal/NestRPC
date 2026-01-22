import { defineManifest } from 'server';
import { UserMutationsRouter } from './user/user.mutations.router';
import { UserQueriesRouter } from './user/user.queries.router';
import { FilesRouter } from './files/files.router';

export const manifest = defineManifest({
  user: {
    mutations: UserMutationsRouter,
    queries: UserQueriesRouter,
  },
  files: FilesRouter,
});

export type Manifest = typeof manifest;
