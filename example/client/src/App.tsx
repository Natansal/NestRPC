import { useEffect, useState } from "react";
import { rpcRepo } from "./rpc-repo";
import "./App.css";

type User = { id: string; name: string; email: string };

/**
 * ✨ Beautiful demo app showcasing the RPC client against the example server.
 *
 * - 🖐️ Batch playground calling `app.batch1`, `app.batch2`, `app.batch3`
 * - 👥 Users CRUD calling `user.queries` and `user.mutations`
 *
 * @returns 🧩 A styled React component demonstrating type‑safe RPC calls.
 */
export default function App() {
   const [batchingResult, setBatchingResult] = useState<Record<"1" | "2" | "3", string>>({ 1: "", 2: "", 3: "" });
   const [batchingLoading, setBatchingLoading] = useState(false);
   const [batchingError, setBatchingError] = useState<string>("");
   // Network instrumentation for demoing batching
   const [requestCount, setRequestCount] = useState(0);
   const [lastRequest, setLastRequest] = useState<{ url: string; body?: string } | null>(null);

   const [users, setUsers] = useState<User[]>([]);
   const [usersLoading, setUsersLoading] = useState(false);
   const [usersError, setUsersError] = useState<string>("");

   const [createName, setCreateName] = useState("");
   const [createEmail, setCreateEmail] = useState("");
   const [busyId, setBusyId] = useState<string>("");

   const [lookupId, setLookupId] = useState("");
   const [lookupUser, setLookupUser] = useState<User | null>(null);

   // Wrap window.fetch to count RPC requests made by the client during the demo
   useEffect(() => {
      const originalFetch = window.fetch.bind(window);
      window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
         try {
            const urlStr =
               typeof input === "string" ? input
               : input instanceof URL ? input.toString()
               : (input as Request).url;
            const method =
               init?.method ??
               (typeof input === "object" && "method" in (input as any) ? (input as Request).method : "GET");
            if (urlStr.includes("/api") && method.toUpperCase() === "POST") {
               setRequestCount((c) => c + 1);
               const body = typeof init?.body === "string" ? init?.body : undefined;
               setLastRequest({ url: urlStr, body });
            }
         } catch {}
         return originalFetch(input as any, init as any);
      }) as any;
      return () => {
         window.fetch = originalFetch as any;
      };
   }, []);

   async function refreshUsers() {
      setUsersLoading(true);
      setUsersError("");
      try {
         const list = await rpcRepo.user.queries.listUsers();
         setUsers(list);
      } catch (err) {
         setUsersError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
         setUsersLoading(false);
      }
   }

   async function callBatch() {
      setBatchingLoading(true);
      setBatchingError("");
      setBatchingResult({ 1: "", 2: "", 3: "" });
      setLastRequest(null);
      try {
         const appRouter = rpcRepo.app;
         const responses = await Promise.all([appRouter.batch1(1), appRouter.batch2(2), appRouter.batch3(3)]);
         setBatchingResult({
            1: responses[0],
            2: responses[1],
            3: responses[2],
         });
      } catch (err) {
         setBatchingError(err instanceof Error ? err.message : String(err));
      } finally {
         setBatchingLoading(false);
      }
   }

   async function createUser() {
      if (!createName.trim() || !createEmail.trim()) return;
      setBusyId("create");
      try {
         await rpcRepo.user.mutations.createUser({ name: createName.trim(), email: createEmail.trim() });
         setCreateName("");
         setCreateEmail("");
         await refreshUsers();
      } finally {
         setBusyId("");
      }
   }

   async function deleteUser(id: string) {
      setBusyId(id);
      try {
         await rpcRepo.user.mutations.deleteUser({ id });
         await refreshUsers();
      } finally {
         setBusyId("");
      }
   }

   async function updateUser(id: string, input: { name?: string; email?: string }) {
      setBusyId(id);
      try {
         await rpcRepo.user.mutations.updateUser({ id, ...input });
         await refreshUsers();
      } finally {
         setBusyId("");
      }
   }

   async function lookup() {
      if (!lookupId.trim()) return;
      setBusyId("lookup");
      try {
         const u = await rpcRepo.user.queries.getUser({ id: lookupId.trim() });
         setLookupUser(u);
      } finally {
         setBusyId("");
      }
   }

   return (
      <div className="app-container">
         <header className="header">
            <div className="brand">
               <div className="logo-circle">NR</div>
               <div>
                  <h1 className="title">NestRPC Example</h1>
                  <p className="subtitle">Type‑safe RPC with a beautiful demo UI</p>
               </div>
            </div>
         </header>

         <main className="grid">
            <section className="card">
               <h2>🖐️ Batch Playground</h2>
               <p className="muted">
                  Calls three separate endpoints: <code>app.batch1</code>, <code>app.batch2</code>,{" "}
                  <code>app.batch3</code>. With batching enabled, they are sent as a single HTTP request.
               </p>
               <div className="row">
                  <button
                     className="button primary"
                     onClick={callBatch}
                     disabled={batchingLoading}
                  >
                     {batchingLoading ? "Calling…" : "Send"}
                  </button>
               </div>
               {batchingResult && <div className="result success">{JSON.stringify(batchingResult)}</div>}
               {batchingError && <div className="result error">{batchingError}</div>}
               <div className="divider" />
               <h3>🔬 What actually hit the network?</h3>
               <div
                  className="row"
                  style={{ alignItems: "center", gap: 12 }}
               >
                  <div className="result info compact">
                     Requests sent: <strong>{requestCount}</strong>
                  </div>
                  <button
                     className="button ghost"
                     onClick={() => {
                        setRequestCount(0);
                        setLastRequest(null);
                     }}
                  >
                     Reset counter
                  </button>
               </div>
               {lastRequest && (
                  <div
                     className="result info"
                     style={{ marginTop: 12 }}
                  >
                     <div style={{ wordBreak: "break-all" }}>
                        <strong>URL</strong>: {lastRequest.url}
                     </div>
                     {(() => {
                        try {
                           const callsParam = new URL(lastRequest.url).searchParams.get("calls");
                           if (!callsParam) return null;
                           const decoded = decodeURIComponent(callsParam);
                           return (
                              <div style={{ marginTop: 6 }}>
                                 <strong>calls</strong>: {decoded}
                              </div>
                           );
                        } catch {
                           return null;
                        }
                     })()}
                     {lastRequest.body && (
                        <div style={{ marginTop: 6, wordBreak: "break-all" }}>
                           <strong>body</strong>: {lastRequest.body}
                        </div>
                     )}
                  </div>
               )}
            </section>

            <section className="card">
               <h2>👥 Users</h2>
               <p className="muted">
                  Queries: <code>user.queries.listUsers()</code>, <code>getUser({`{ id }`})</code>
               </p>

               <div className="toolbar">
                  <button
                     className="button"
                     onClick={() => refreshUsers()}
                     disabled={usersLoading}
                  >
                     {usersLoading ? "Refreshing…" : "Refresh"}
                  </button>
                  {usersError && <span className="result error compact">{usersError}</span>}
               </div>

               <div className="table">
                  <div className="table-head">
                     <div>ID</div>
                     <div>Name</div>
                     <div>Email</div>
                     <div>Actions</div>
                  </div>
                  {users.map((u) => (
                     <div
                        className="table-row"
                        key={u.id}
                     >
                        <div className="mono">{u.id}</div>
                        <InlineEditable
                           value={u.name}
                           onSave={(value) => updateUser(u.id, { name: value })}
                           disabled={busyId === u.id}
                        />
                        <InlineEditable
                           value={u.email}
                           onSave={(value) => updateUser(u.id, { email: value })}
                           disabled={busyId === u.id}
                        />
                        <div className="actions">
                           <button
                              className="button danger"
                              onClick={() => deleteUser(u.id)}
                              disabled={busyId === u.id}
                           >
                              {busyId === u.id ? "Deleting…" : "Delete"}
                           </button>
                        </div>
                     </div>
                  ))}
                  {users.length === 0 && !usersLoading && <div className="table-empty">No users yet</div>}
               </div>

               <div className="divider" />

               <h3>➕ Create User</h3>
               <div className="row">
                  <input
                     className="input"
                     placeholder="Name"
                     value={createName}
                     onChange={(e) => setCreateName(e.target.value)}
                  />
                  <input
                     className="input"
                     placeholder="Email"
                     value={createEmail}
                     onChange={(e) => setCreateEmail(e.target.value)}
                  />
                  <button
                     className="button primary"
                     onClick={createUser}
                     disabled={busyId === "create"}
                  >
                     {busyId === "create" ? "Creating…" : "Create"}
                  </button>
               </div>

               <div className="divider" />

               <h3>🔎 Lookup User</h3>
               <div className="row">
                  <input
                     className="input"
                     placeholder="User ID"
                     value={lookupId}
                     onChange={(e) => setLookupId(e.target.value)}
                  />
                  <button
                     className="button"
                     onClick={lookup}
                     disabled={busyId === "lookup"}
                  >
                     {busyId === "lookup" ? "Looking…" : "Find"}
                  </button>
               </div>
               {lookupUser && (
                  <div className="result info">
                     <div className="mono">id: {lookupUser.id}</div>
                     <div>name: {lookupUser.name}</div>
                     <div>email: {lookupUser.email}</div>
                  </div>
               )}
            </section>
         </main>

         <footer className="footer">
            <span className="muted">Made with ❤️ using the NestRPC client proxy</span>
         </footer>
      </div>
   );
}

type InlineEditableProps = {
   value: string;
   disabled?: boolean;
   onSave: (value: string) => void | Promise<void>;
};

/**
 * ✏️ Inline editable text field used in the Users table.
 *
 * @param props - 📦 Component properties
 * @param props.value - ✍️ Current value
 * @param props.disabled - 🚫 Whether actions are disabled
 * @param props.onSave - 💾 Persist callback when confirming the edit
 * @returns 🧩 A small inline editor component.
 */
function InlineEditable({ value, disabled, onSave }: InlineEditableProps) {
   const [editing, setEditing] = useState(false);
   const [temp, setTemp] = useState(value);
   useEffect(() => setTemp(value), [value]);

   if (!editing) {
      return (
         <div className="inline-edit">
            <span>{value}</span>
            <button
               className="link"
               disabled={disabled}
               onClick={() => setEditing(true)}
            >
               Edit
            </button>
         </div>
      );
   }

   return (
      <div className="inline-edit">
         <input
            className="input"
            value={temp}
            onChange={(e) => setTemp(e.target.value)}
         />
         <button
            className="button small"
            disabled={disabled}
            onClick={async () => {
               await onSave(temp);
               setEditing(false);
            }}
         >
            Save
         </button>
         <button
            className="button ghost small"
            onClick={() => {
               setTemp(value);
               setEditing(false);
            }}
         >
            Cancel
         </button>
      </div>
   );
}
