import { useState, useEffect } from "react";
import {
  createRpcQuery,
  createRpcMutation,
  useInvalidateRpcQuery,
  useRpcQuery,
} from "@nestjs-rpc/query";
import { userRepo, filesRepo } from "./rpc-repo";
import "./App.css";

/**
 * ⚡ React Query Page - Demonstrates RPC with React Query
 *
 * This page shows the power of @nestjs-rpc/query:
 * - Automatic caching and background refetching
 * - Automatic cache invalidation after mutations
 * - Optimistic updates support
 * - No manual loading/error state management
 * - Automatic query key generation
 */

// Create reusable hooks with default options
const useUserList = createRpcQuery(userRepo.queries.listUsers, {
  staleTime: 30000, // 30 seconds
  refetchOnWindowFocus: false,
  placeholderData: [], // Guaranteed non-undefined
});

const useCreateUser = createRpcMutation(userRepo.mutations.createUser, {
  invalidate: [userRepo.queries.listUsers], // Auto-invalidate after success!
});

const useUpdateUser = createRpcMutation(userRepo.mutations.updateUser, {
  invalidate: [userRepo.queries.listUsers], // Auto-invalidate after success!
});

const useDeleteUser = createRpcMutation(userRepo.mutations.deleteUser, {
  invalidate: [userRepo.queries.listUsers], // Auto-invalidate after success!
});

const useFileList = createRpcQuery(filesRepo.listFiles, {
  staleTime: 30000,
  refetchOnWindowFocus: false,
});

const useUploadFile = createRpcMutation(filesRepo.uploadFile, {
  invalidate: [filesRepo.listFiles], // Auto-invalidate after success!
});

const useUploadFiles = createRpcMutation(filesRepo.uploadFiles, {
  invalidate: [filesRepo.listFiles], // Auto-invalidate after success!
});

const useDeleteFile = createRpcMutation(filesRepo.deleteFile, {
  invalidate: [filesRepo.listFiles], // Auto-invalidate after success!
});

const useClearAllFiles = createRpcMutation(filesRepo.clearAllFiles, {
  invalidate: [filesRepo.listFiles], // Auto-invalidate after success!
});

export default function ReactQueryPage() {
  // User state
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [lookupId, setLookupId] = useState("");

  // File state
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [singleFileDesc, setSingleFileDesc] = useState("");
  const [multipleFiles, setMultipleFiles] = useState<File[]>([]);
  const [filesCategory, setFilesCategory] = useState("");

  // React Query hooks - automatic caching, loading, error states!
  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
  } = useUserList();

  const {
    data: files = [],
    isLoading: filesLoading,
    error: filesError,
  } = useFileList();

  // Mutations
  const createUserMutation = useCreateUser({
    onSuccess: () => {
      setCreateName("");
      setCreateEmail("");
    },
  });

  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const uploadFileMutation = useUploadFile({
    onSuccess: () => {
      setSingleFile(null);
      setSingleFileDesc("");
    },
  });
  const uploadFilesMutation = useUploadFiles({
    onSuccess: () => {
      setMultipleFiles([]);
      setFilesCategory("");
    },
  });
  const deleteFileMutation = useDeleteFile();
  const clearAllFilesMutation = useClearAllFiles();

  // Manual invalidation hook (optional, mutations already auto-invalidate)
  const invalidate = useInvalidateRpcQuery();

  // Lookup user query (only runs when lookupId is provided)
  const { data: lookupUser, isLoading: lookupLoading } = useRpcQuery(
    userRepo.queries.getUser,
    { id: lookupId.trim() },
    {
      enabled: !!lookupId.trim(), // Only run when lookupId is provided
    },
  );

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  const handleCreateUser = () => {
    if (!createName.trim() || !createEmail.trim()) return;
    createUserMutation.mutate({
      body: {
        name: createName.trim(),
        email: createEmail.trim(),
      },
    });
  };

  const handleUpdateUser = (
    id: string,
    input: { name?: string; email?: string },
  ) => {
    updateUserMutation.mutate({ body: { id, ...input } });
  };

  const handleDeleteUser = (id: string) => {
    deleteUserMutation.mutate({ body: { id } });
  };

  const handleUploadSingleFile = () => {
    if (!singleFile) return;
    const description = singleFileDesc.trim();
    uploadFileMutation.mutate({
      body: { description: description || undefined },
      file: singleFile,
    });
  };

  const handleUploadMultipleFiles = () => {
    if (multipleFiles.length === 0) return;
    const category = filesCategory.trim();
    uploadFilesMutation.mutate({
      body: { category: category || undefined },
      files: multipleFiles,
    });
  };

  const handleDeleteFile = (id: string) => {
    deleteFileMutation.mutate({ body: { id } });
  };

  const handleClearAllFiles = () => {
    if (!confirm("Are you sure you want to clear all files?")) return;
    clearAllFilesMutation.mutate();
  };

  return (
    <div>
      <div className="page-header">
        <h2>⚡ React Query</h2>
        <p className="muted">
          RPC with React Query hooks. Notice automatic cache invalidation - no
          manual refresh needed!
        </p>
      </div>

      <main className="grid">
        {/* Users Section */}
        <section className="card">
          <h3>👥 Users</h3>
          <p className="muted">
            Powered by <code>createRpcQuery</code> &{" "}
            <code>createRpcMutation</code>
          </p>

          <div className="toolbar">
            <button
              className="button"
              onClick={() => invalidate(userRepo.queries.listUsers)}
              disabled={usersLoading}
            >
              {usersLoading ? "Refreshing…" : "Refresh"}
            </button>
            {usersError && (
              <span className="result error compact">
                {usersError instanceof Error ? usersError.message : "Error"}
              </span>
            )}
            {users.length > 0 && (
              <span className="result success compact">
                ✅ Auto-cached • {users.length} users
              </span>
            )}
          </div>

          <div className="table">
            <div className="table-head">
              <div>ID</div>
              <div>Name</div>
              <div>Email</div>
              <div>Actions</div>
            </div>
            {users.map((u) => (
              <div className="table-row" key={u.id}>
                <div className="mono">{u.id}</div>
                <InlineEditable
                  value={u.name}
                  onSave={(value) => handleUpdateUser(u.id, { name: value })}
                  disabled={updateUserMutation.isPending}
                />
                <InlineEditable
                  value={u.email}
                  onSave={(value) => handleUpdateUser(u.id, { email: value })}
                  disabled={updateUserMutation.isPending}
                />
                <div className="actions">
                  <button
                    className="button danger"
                    onClick={() => handleDeleteUser(u.id)}
                    disabled={deleteUserMutation.isPending}
                  >
                    {deleteUserMutation.isPending ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            ))}
            {users.length === 0 && !usersLoading && (
              <div className="table-empty">No users yet</div>
            )}
          </div>

          <div className="divider" />

          <h4>➕ Create User</h4>
          <div className="row">
            <input
              className="input"
              placeholder="Name"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateUser()}
            />
            <input
              className="input"
              placeholder="Email"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateUser()}
            />
            <button
              className="button primary"
              onClick={handleCreateUser}
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending ? "Creating…" : "Create"}
            </button>
          </div>
          {createUserMutation.isError && (
            <div className="result error">
              {createUserMutation.error instanceof Error
                ? createUserMutation.error.message
                : "Failed to create user"}
            </div>
          )}

          <div className="divider" />

          <h4>🔎 Lookup User</h4>
          <div className="row">
            <input
              className="input"
              placeholder="User ID"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
            />
          </div>
          {lookupLoading && <div className="result info">Loading…</div>}
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
          <h3>📁 File Uploads</h3>
          <p className="muted">Automatic cache invalidation after uploads!</p>

          <div className="toolbar">
            <button
              className="button"
              onClick={() => invalidate(filesRepo.listFiles)}
              disabled={filesLoading}
            >
              {filesLoading ? "Refreshing…" : "Refresh"}
            </button>
            {files.length > 0 && (
              <button
                className="button danger"
                onClick={handleClearAllFiles}
                disabled={clearAllFilesMutation.isPending}
              >
                Clear All
              </button>
            )}
            {filesError && (
              <span className="result error compact">
                {filesError instanceof Error ? filesError.message : "Error"}
              </span>
            )}
            {files.length > 0 && (
              <span className="result success compact">
                ✅ Auto-cached • {files.length} files
              </span>
            )}
          </div>

          <div className="divider" />

          <h4>📤 Upload Single File</h4>
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
                <span className="file-size">
                  {formatFileSize(singleFile.size)}
                </span>
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
              onClick={handleUploadSingleFile}
              disabled={!singleFile || uploadFileMutation.isPending}
              style={{ marginTop: "0.5rem", width: "100%" }}
            >
              {uploadFileMutation.isPending ? "Uploading…" : "Upload File"}
            </button>
          </div>

          <div className="divider" />

          <h4>📤📤 Upload Multiple Files</h4>
          <div className="file-upload-section">
            <input
              type="file"
              className="file-input"
              multiple
              onChange={(e) =>
                setMultipleFiles(Array.from(e.target.files || []))
              }
              accept="*/*"
            />
            {multipleFiles.length > 0 && (
              <div className="file-list">
                {multipleFiles.map((file, idx) => (
                  <div key={idx} className="file-preview">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">
                      {formatFileSize(file.size)}
                    </span>
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
              onClick={handleUploadMultipleFiles}
              disabled={
                multipleFiles.length === 0 || uploadFilesMutation.isPending
              }
              style={{ marginTop: "0.5rem", width: "100%" }}
            >
              {uploadFilesMutation.isPending
                ? "Uploading…"
                : `Upload ${multipleFiles.length} File(s)`}
            </button>
          </div>

          <div className="divider" />

          <h4>📋 Uploaded Files ({files.length})</h4>
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
                  onClick={() => handleDeleteFile(file.id)}
                  disabled={deleteFileMutation.isPending}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

type InlineEditableProps = {
  value: string;
  disabled?: boolean;
  onSave: (value: string) => void | Promise<void>;
};

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
