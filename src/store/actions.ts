import { createAction } from "@reduxjs/toolkit";

// Global action: clears auth storage and resets the store (handled in store.ts).
export const logout = createAction("auth/logout");
