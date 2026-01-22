import { useEffect, useState } from "react";
import { userRepo, filesRepo } from "./rpc-repo";
import "./App.css";

type User = { id: string; name: string; email: string };
type FileInfo = {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date | string;
  description?: string;
  category?: string;
};

/**
 * ✨ Comprehensive demo app showcasing NestRPC capabilities.
 *
 * Features demonstrated:
 * - 👥 User CRUD operations (queries & mutations)
 * - 📤 Single file upload
 * - 📤📤 Multiple file upload
 * - 📋 File management (list, get, delete)
 *
 * @returns 🧩 A styled React component demonstrating type‑safe RPC calls.
 */
export default function App() {
  // User state
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string>("");

  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [busyId, setBusyId] = useState<string>("");

  const [lookupId, setLookupId] = useState("");
  const [lookupUser, setLookupUser] = useState<User | null>(null);

  // File state
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesError, setFilesError] = useState<string>("");

  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [singleFileDesc, setSingleFileDesc] = useState("");
  const [multipleFiles, setMultipleFiles] = useState<File[]>([]);
  const [filesCategory, setFilesCategory] = useState("");

  // Load initial data
  useEffect(() => {
    refreshUsers();
    refreshFiles();
  }, []);

  // User operations
  async function refreshUsers() {
    setUsersLoading(true);
    setUsersError("");
    try {
      const { data: list } = await userRepo.queries.listUsers();
      setUsers(list);
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setUsersLoading(false);
    }
  }

  async function createUser() {
    if (!createName.trim() || !createEmail.trim()) return;
    setBusyId("create");
    try {
      await userRepo.mutations.createUser({ name: createName.trim(), email: createEmail.trim() });
      setCreateName("");
      setCreateEmail("");
      await refreshUsers();
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setBusyId("");
    }
  }

  async function deleteUser(id: string) {
    setBusyId(id);
    try {
      await userRepo.mutations.deleteUser({ id });
      await refreshUsers();
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setBusyId("");
    }
  }

  async function updateUser(id: string, input: { name?: string; email?: string }) {
    setBusyId(id);
    try {
      await userRepo.mutations.updateUser({ id, ...input });
      await refreshUsers();
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setBusyId("");
    }
  }

  async function lookup() {
    if (!lookupId.trim()) return;
    setBusyId("lookup");
    try {
      const { data: u } = await userRepo.queries.getUser({ id: lookupId.trim() });
      setLookupUser(u);
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : "Failed to lookup user");
    } finally {
      setBusyId("");
    }
  }

  // File operations
  async function refreshFiles() {
    setFilesLoading(true);
    setFilesError("");
    try {
      const { data: list } = await filesRepo.listFiles();
      setFiles(list as FileInfo[]);
    } catch (err) {
      setFilesError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setFilesLoading(false);
    }
  }

  async function uploadSingleFile() {
    if (!singleFile) return;
    setFilesLoading(true);
    setFilesError("");
    try {
      await filesRepo.uploadFile(
        { description: singleFileDesc.trim() || undefined },
        { file: singleFile }
      );
      setSingleFile(null);
      setSingleFileDesc("");
      await refreshFiles();
    } catch (err) {
      setFilesError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setFilesLoading(false);
    }
  }

  async function uploadMultipleFiles() {
    if (multipleFiles.length === 0) return;
    setFilesLoading(true);
    setFilesError("");
    try {
      await filesRepo.uploadFiles(
        { category: filesCategory.trim() || undefined },
        { files: multipleFiles }
      );
      setMultipleFiles([]);
      setFilesCategory("");
      await refreshFiles();
    } catch (err) {
      setFilesError(err instanceof Error ? err.message : "Failed to upload files");
    } finally {
      setFilesLoading(false);
    }
  }

  async function deleteFile(id: string) {
    setFilesLoading(true);
    try {
      await filesRepo.deleteFile({ id });
      await refreshFiles();
    } catch (err) {
      setFilesError(err instanceof Error ? err.message : "Failed to delete file");
    } finally {
      setFilesLoading(false);
    }
  }

  async function clearAllFiles() {
    if (!confirm("Are you sure you want to clear all files?")) return;
    setFilesLoading(true);
    try {
      await filesRepo.clearAllFiles();
      await refreshFiles();
    } catch (err) {
      setFilesError(err instanceof Error ? err.message : "Failed to clear files");
    } finally {
      setFilesLoading(false);
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="brand">
          <div className="logo-circle">NR</div>
          <div>
            <h1 className="title">NestRPC Example</h1>
            <p className="subtitle">Type‑safe RPC with file uploads & CRUD operations</p>
          </div>
        </div>
      </header>

      <main className="grid">
        {/* Users Section */}
        <section className="card">
          <h2>👥 Users</h2>
          <p className="muted">
            Demonstrates queries and mutations: <code>user.queries</code> & <code>user.mutations</code>
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
              onKeyDown={(e) => e.key === "Enter" && createUser()}
            />
            <input
              className="input"
              placeholder="Email"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createUser()}
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
              onKeyDown={(e) => e.key === "Enter" && lookup()}
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

        {/* Files Section */}
        <section className="card">
          <h2>📁 File Uploads</h2>
          <p className="muted">
            Demonstrates file uploads: <code>files.uploadFile()</code> & <code>files.uploadFiles()</code>
          </p>

          <div className="toolbar">
            <button
              className="button"
              onClick={() => refreshFiles()}
              disabled={filesLoading}
            >
              {filesLoading ? "Refreshing…" : "Refresh"}
            </button>
            {files.length > 0 && (
              <button
                className="button danger"
                onClick={clearAllFiles}
                disabled={filesLoading}
              >
                Clear All
              </button>
            )}
            {filesError && <span className="result error compact">{filesError}</span>}
          </div>

          <div className="divider" />

          <h3>📤 Upload Single File</h3>
          <div className="file-upload-section">
            <input
              type="file"
              className="file-input"
              onChange={(e) => setSingleFile(e.target.files?.[0] || null)}
              accept="*/*"
            />
            {singleFile && (
              <div className="file-preview">
                <span className="file-name">{singleFile.name}</span>
                <span className="file-size">{formatFileSize(singleFile.size)}</span>
              </div>
            )}
            <input
              className="input"
              placeholder="Optional description"
              value={singleFileDesc}
              onChange={(e) => setSingleFileDesc(e.target.value)}
              style={{ marginTop: "0.5rem" }}
            />
            <button
              className="button primary"
              onClick={uploadSingleFile}
              disabled={!singleFile || filesLoading}
              style={{ marginTop: "0.5rem", width: "100%" }}
            >
              {filesLoading ? "Uploading…" : "Upload File"}
            </button>
          </div>

          <div className="divider" />

          <h3>📤📤 Upload Multiple Files</h3>
          <div className="file-upload-section">
            <input
              type="file"
              className="file-input"
              multiple
              onChange={(e) => setMultipleFiles(Array.from(e.target.files || []))}
              accept="*/*"
            />
            {multipleFiles.length > 0 && (
              <div className="file-list">
                {multipleFiles.map((file, idx) => (
                  <div key={idx} className="file-preview">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                  </div>
                ))}
              </div>
            )}
            <input
              className="input"
              placeholder="Optional category"
              value={filesCategory}
              onChange={(e) => setFilesCategory(e.target.value)}
              style={{ marginTop: "0.5rem" }}
            />
            <button
              className="button primary"
              onClick={uploadMultipleFiles}
              disabled={multipleFiles.length === 0 || filesLoading}
              style={{ marginTop: "0.5rem", width: "100%" }}
            >
              {filesLoading ? "Uploading…" : `Upload ${multipleFiles.length} File(s)`}
            </button>
          </div>

          <div className="divider" />

          <h3>📋 Uploaded Files ({files.length})</h3>
          <div className="files-list">
            {files.length === 0 && !filesLoading && (
              <div className="table-empty">No files uploaded yet</div>
            )}
            {files.map((file) => (
              <div key={file.id} className="file-item">
                <div className="file-item-info">
                  <div className="file-item-name">{file.name}</div>
                  <div className="file-item-meta">
                    {formatFileSize(file.size)} • {file.type}
                    {file.description && ` • ${file.description}`}
                    {file.category && ` • Category: ${file.category}`}
                  </div>
                  <div className="file-item-date">
                    Uploaded: {new Date(file.uploadedAt).toLocaleString()}
                  </div>
                </div>
                <button
                  className="button danger small"
                  onClick={() => deleteFile(file.id)}
                  disabled={filesLoading}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <span className="muted">Made with ❤️ using NestRPC — Type-safe RPC with file upload support</span>
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
        onKeyDown={async (e) => {
          if (e.key === "Enter") {
            await onSave(temp);
            setEditing(false);
          } else if (e.key === "Escape") {
            setTemp(value);
            setEditing(false);
          }
        }}
        autoFocus
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
