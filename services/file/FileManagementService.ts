// services/file/FileManagementService.ts
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';
import { connectivityService } from '../connectivity/ConnectivityService';
import { analyticsService } from '../analytics/AnalyticsService';

interface FileMetadata {
  uri: string;
  name: string;
  type: string;
  size: number;
  timestamp: number;
}

interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export class FileManagementService {
  private static instance: FileManagementService;
  private readonly BASE_DIR = FileSystem.documentDirectory;
  private readonly TEMP_DIR = FileSystem.cacheDirectory;

  static getInstance(): FileManagementService {
    if (!FileManagementService.instance) {
      FileManagementService.instance = new FileManagementService();
    }
    return FileManagementService.instance;
  }

  async saveFile(uri: string, directory: string): Promise<FileMetadata> {
    try {
      const fileName = this.generateFileName(uri);
      const destinationUri = `${this.BASE_DIR}${directory}/${fileName}`;

      await this.ensureDirectoryExists(`${this.BASE_DIR}${directory}`);
      await FileSystem.copyAsync({ from: uri, to: destinationUri });

      const fileInfo = await FileSystem.getInfoAsync(destinationUri);
      
      const metadata: FileMetadata = {
        uri: destinationUri,
        name: fileName,
        type: this.getFileType(uri),
        size: fileInfo.size || 0,
        timestamp: Date.now(),
      };

      analyticsService.track('File_Saved', {
        type: metadata.type,
        size: metadata.size,
      });

      return metadata;
    } catch (error) {
      console.error('Failed to save file:', error);
      throw error;
    }
  }

  async deleteFile(uri: string): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(uri);
        analyticsService.track('File_Deleted', {
          uri: uri,
        });
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw error;
    }
  }

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

      const result = await ImageManipulator.manipulateAsync(
        uri,
        actions,
        {
          compress: options.quality || 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      analyticsService.track('Image_Compressed', {
        originalSize: (await FileSystem.getInfoAsync(uri)).size,
        compressedSize: (await FileSystem.getInfoAsync(result.uri)).size,
      });

      return result.uri;
    } catch (error) {
      console.error('Failed to compress image:', error);
      throw error;
    }
  }

  async moveFile(uri: string, newDirectory: string): Promise<string> {
    try {
      const fileName = this.generateFileName(uri);
      const destinationUri = `${this.BASE_DIR}${newDirectory}/${fileName}`;

      await this.ensureDirectoryExists(`${this.BASE_DIR}${newDirectory}`);
      await FileSystem.moveAsync({ from: uri, to: destinationUri });

      return destinationUri;
    } catch (error) {
      console.error('Failed to move file:', error);
      throw error;
    }
  }

  async copyFile(uri: string, newDirectory: string): Promise<string> {
    try {
      const fileName = this.generateFileName(uri);
      const destinationUri = `${this.BASE_DIR}${newDirectory}/${fileName}`;

      await this.ensureDirectoryExists(`${this.BASE_DIR}${newDirectory}`);
      await FileSystem.copyAsync({ from: uri, to: destinationUri });

      return destinationUri;
    } catch (error) {
      console.error('Failed to copy file:', error);
      throw error;
    }
  }

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
      console.error('Failed to get file info:', error);
      throw error;
    }
  }

  private async ensureDirectoryExists(directory: string): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(directory);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
    }
  }

  private generateFileName(uri: string): string {
    const extension = this.getFileExtension(uri);
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    return `${timestamp}-${randomString}.${extension}`;
  }

  private getFileExtension(uri: string): string {
    return uri.split('.').pop()?.toLowerCase() || '';
  }

  private getFileType(uri: string): string {
    const extension = this.getFileExtension(uri);
    // Add more mime types as needed
    const mimeTypes: { [key: string]: string } = {
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

  private getFileName(uri: string): string {
    return uri.split('/').pop() || '';
  }
}

export const fileManagementService = FileManagementService.getInstance();