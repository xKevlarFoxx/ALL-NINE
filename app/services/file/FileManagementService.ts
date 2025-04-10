import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';
import { connectivityService } from '../connectivity/ConnectivityService';
import { analyticsService } from '../analytics/AnalyticsService';

/**
 * Metadata for files managed by the service.
 */
export interface FileMetadata {
  uri: string;
  name: string;
  type: string;
  size: number;
  timestamp: number;
}

/**
 * Options to control image compression.
 */
export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * FileManagementService
 *
 * This service handles file operations such as saving, deleting, moving, copying, compressing,
 * and retrieving file metadata. It employs robust error handling and logging for better support
 * in production and debugging.
 */
export class FileManagementService {
  private static instance: FileManagementService;
  private readonly BASE_DIR = FileSystem.documentDirectory;
  private readonly TEMP_DIR = FileSystem.cacheDirectory;

  /**
   * Get the singleton instance of FileManagementService.
   */
  public static getInstance(): FileManagementService {
    if (!FileManagementService.instance) {
      FileManagementService.instance = new FileManagementService();
    }
    return FileManagementService.instance;
  }

  /**
   * Saves a file from the given URI to the specified directory.
   * @param uri The source URI of the file.
   * @param directory The target directory where the file should be saved.
   * @returns Metadata of the saved file.
   */
  async saveFile(uri: string, directory: string): Promise<FileMetadata> {
    try {
      await this.ensureDirectoryExists(`${this.BASE_DIR}${directory}`);
      // For simplicity, we assume FileSystem.copyAsync is used to duplicate the file
      const fileName = this.generateFileName(uri);
      const destinationUri = `${this.BASE_DIR}${directory}/${fileName}`;
      await FileSystem.copyAsync({ from: uri, to: destinationUri });
      return {
        uri: destinationUri,
        name: this.getFileName(destinationUri),
        type: this.getFileType(destinationUri),
        size: (await FileSystem.getInfoAsync(destinationUri)).size || 0,
        timestamp: Date.now(),
      };
    } catch (error) {
      analyticsService.track('File_Save_Failed', { uri, error: (error as Error).message });
      console.error('Failed to save file:', error);
      throw new Error('File could not be saved');
    }
  }

  /**
   * Deletes a file at the specified URI.
   * @param uri The URI of the file to delete.
   */
  async deleteFile(uri: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch (error) {
      analyticsService.track('File_Delete_Failed', { uri, error: (error as Error).message });
      console.error('Failed to delete file:', error);
      throw new Error('File could not be deleted');
    }
  }

  /**
   * Compresses an image at the specified URI using provided options.
   * @param uri The URI of the image.
   * @param options Image compression options.
   * @returns The URI of the compressed image.
   */
  async compressImage(
    uri: string,
    options: ImageCompressionOptions = {}
  ): Promise<string> {
    try {
      const actions: ImageManipulator.Action[] = [];
      if (options.maxWidth || options.maxHeight) {
        actions.push({
          resize: {
            width: options.maxWidth,
            height: options.maxHeight,
          },
        });
      }
      const result = await ImageManipulator.manipulateAsync(uri, actions, {
        compress: options.quality ?? 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
      });

      // Track original and compressed sizes for analytics
      const originalSize = (await FileSystem.getInfoAsync(uri)).size;
      const compressedSize = (await FileSystem.getInfoAsync(result.uri)).size;
      analyticsService.track('Image_Compressed', { originalSize, compressedSize });

      return result.uri;
    } catch (error) {
      analyticsService.track('Image_Compression_Failed', { uri, error: (error as Error).message });
      console.error('Failed to compress image:', error);
      throw new Error('Image compression failed');
    }
  }

  /**
   * Moves a file from its current location to a new directory.
   * @param uri The URI of the file to move.
   * @param newDirectory The target directory.
   * @returns The new URI of the moved file.
   */
  async moveFile(uri: string, newDirectory: string): Promise<string> {
    try {
      const fileName = this.generateFileName(uri);
      const destinationUri = `${this.BASE_DIR}${newDirectory}/${fileName}`;
      await this.ensureDirectoryExists(`${this.BASE_DIR}${newDirectory}`);
      await FileSystem.moveAsync({ from: uri, to: destinationUri });
      return destinationUri;
    } catch (error) {
      analyticsService.track('File_Move_Failed', { uri, newDirectory, error: (error as Error).message });
      console.error('Failed to move file:', error);
      throw new Error('File could not be moved');
    }
  }

  /**
   * Copies a file from its current location to a new directory.
   * @param uri The URI of the file to copy.
   * @param newDirectory The target directory.
   * @returns The new URI of the copied file.
   */
  async copyFile(uri: string, newDirectory: string): Promise<string> {
    try {
      const fileName = this.generateFileName(uri);
      const destinationUri = `${this.BASE_DIR}${newDirectory}/${fileName}`;
      await this.ensureDirectoryExists(`${this.BASE_DIR}${newDirectory}`);
      await FileSystem.copyAsync({ from: uri, to: destinationUri });
      return destinationUri;
    } catch (error) {
      analyticsService.track('File_Copy_Failed', { uri, newDirectory, error: (error as Error).message });
      console.error('Failed to copy file:', error);
      throw new Error('File could not be copied');
    }
  }

  /**
   * Retrieves metadata for the file at the specified URI.
   * @param uri The URI of the file.
   * @returns Metadata if the file exists; otherwise, null.
   */
  async getFileInfo(uri: string): Promise<FileMetadata | null> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        return null;
      }
      return {
        uri: fileInfo.uri,
        name: this.getFileName(fileInfo.uri),
        type: this.getFileType(fileInfo.uri),
        size: fileInfo.size || 0,
        timestamp: fileInfo.modificationTime || Date.now(),
      };
    } catch (error) {
      analyticsService.track('File_Info_Failed', { uri, error: (error as Error).message });
      console.error('Failed to get file info:', error);
      throw new Error('Could not retrieve file info');
    }
  }

  /**
   * Ensures that the specified directory exists, creating it if necessary.
   * @param directory The directory path.
   */
  private async ensureDirectoryExists(directory: string): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(directory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      }
    } catch (error) {
      analyticsService.track('Directory_Create_Failed', { directory, error: (error as Error).message });
      console.error('Failed to ensure directory exists:', error);
      throw new Error('Could not create or access directory');
    }
  }

  /**
   * Generates a unique filename based on the source URI.
   * @param uri Source file URI.
   * @returns A unique filename.
   */
  private generateFileName(uri: string): string {
    const extension = this.getFileExtension(uri);
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    return `${timestamp}-${randomString}.${extension}`;
  }

  /**
   * Extracts the file extension from the URI.
   * @param uri The file URI.
   * @returns The file extension in lowercase.
   */
  private getFileExtension(uri: string): string {
    return uri.split('.').pop()?.toLowerCase() || '';
  }

  /**
   * Determines the MIME type of the file based on its extension.
   * @param uri The file URI.
   * @returns The MIME type.
   */
  private getFileType(uri: string): string {
    const extension = this.getFileExtension(uri);
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    return mimeTypes[extension] || 'application/octet-stream';
  }

  /**
   * Extracts the file name from the URI.
   * @param uri The file URI.
   * @returns The file name.
   */
  private getFileName(uri: string): string {
    return uri.substring(uri.lastIndexOf('/') + 1);
  }
}

export const fileManagementService = FileManagementService.getInstance();