import { Route, Router } from 'server';
import type { Express } from 'express';

/**
 * 📁 FilesRouter
 *
 * Demonstrates file upload capabilities with single and multiple file handling.
 * Files are stored in memory for demo purposes.
 */
type FileMetadata = {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  description?: string;
  category?: string;
};

@Router()
export class FilesRouter {
  private uploadedFiles: Map<string, FileMetadata> = new Map();
  private fileIdCounter = 1;

  /**
   * 📤 Upload a single file.
   *
   * @param param0 - 📥 Input object
   * @param param0.description - 📝 Optional description for the file
   * @param file - 📄 The uploaded file (Express.Multer.File)
   * @returns ✅ File metadata including ID, name, size, and type.
   */
  @Route({ file: 'single' })
  uploadFile(
    { description }: { description?: string },
    file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('No file provided');
    }

    const fileId = String(this.fileIdCounter++);
    const fileInfo = {
      id: fileId,
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
      description: description || 'No description',
      uploadedAt: new Date(),
    };

    this.uploadedFiles.set(fileId, fileInfo);

    return {
      success: true,
      file: fileInfo,
      message: `File "${file.originalname}" uploaded successfully`,
    };
  }

  /**
   * 📤📤 Upload multiple files at once.
   *
   * @param param0 - 📥 Input object
   * @param param0.category - 🏷️ Optional category to group files
   * @param files - 📚 Array of uploaded files (Express.Multer.File[])
   * @returns ✅ Summary of all uploaded files.
   */
  @Route({ file: 'multiple' })
  uploadFiles(
    { category }: { category?: string },
    files?: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    const uploaded = files.map((file) => {
      const fileId = String(this.fileIdCounter++);
      const fileInfo = {
        id: fileId,
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
        category: category || 'uncategorized',
        uploadedAt: new Date(),
      };
      this.uploadedFiles.set(fileId, fileInfo);
      return fileInfo;
    });

    return {
      success: true,
      files: uploaded,
      count: uploaded.length,
      category: category || 'uncategorized',
      message: `Successfully uploaded ${uploaded.length} file(s)`,
    };
  }

  /**
   * 📋 List all uploaded files.
   *
   * @returns 📚 Array of all file metadata.
   */
  @Route()
  listFiles() {
    return Array.from(this.uploadedFiles.values());
  }

  /**
   * 🔎 Get file metadata by ID.
   *
   * @param param0 - 📥 Input object
   * @param param0.id - 🆔 File identifier
   * @returns 📄 File metadata or null if not found.
   */
  @Route()
  getFile({ id }: { id: string }) {
    const file = this.uploadedFiles.get(id);
    if (!file) {
      return null;
    }
    return file;
  }

  /**
   * 🗑️ Delete a file by ID.
   *
   * @param param0 - 📥 Input object
   * @param param0.id - 🆔 File identifier
   * @returns ⚖️ true if deleted, false if not found.
   */
  @Route()
  deleteFile({ id }: { id: string }) {
    return this.uploadedFiles.delete(id);
  }

  /**
   * 🧹 Clear all uploaded files.
   *
   * @returns ✅ Confirmation message with count of deleted files.
   */
  @Route()
  clearAllFiles() {
    const count = this.uploadedFiles.size;
    this.uploadedFiles.clear();
    return {
      success: true,
      message: `Cleared ${count} file(s)`,
      deletedCount: count,
    };
  }
}
