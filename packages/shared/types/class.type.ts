/**
 * 🏗️ Constructor type for a concrete class producing `T` instances.
 */
export type ClassType<T> = new (...args: any[]) => T;
