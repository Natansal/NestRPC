import { defineAppRouter } from 'server';
import { AppRouter } from './app.router';

export const config = defineAppRouter({
  app: AppRouter,
  rout: {
    route2: AppRouter,
  },
});
