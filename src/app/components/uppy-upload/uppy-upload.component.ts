import { Component, ElementRef, ViewChild } from '@angular/core';
import Uppy from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import XHRUpload from '@uppy/xhr-upload';
import Webcam from '@uppy/webcam';
import ImageEditor from '@uppy/image-editor';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
import { filter, firstValueFrom, lastValueFrom, tap } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
export interface UploadFileData {
  filename: string;
  size: number;
  contentType: string;
  url: string;
}
@Component({
  selector: 'app-uppy-upload',
  imports: [],
  templateUrl: './uppy-upload.component.html',
  styleUrl: './uppy-upload.component.scss'
})
export class UppyUploadComponent {
  // baseUrl = "http://localhost:8080/";
  baseUrl = "https://nine-myle-144983988304.asia-south1.run.app/";



  @ViewChild('uppyDashboard', { static: true }) uppyDashboard!: ElementRef;
  uppy!: Uppy;
  uploadComplete: any;

  constructor(private http: HttpClient, private dialogRef: MatDialogRef<UppyUploadComponent>) { }

  /**
   * Compress an image file using Canvas API
   * @param file - The image file to compress
   * @param quality - Compression quality (0.0 to 1.0)
   * @returns Promise<Blob> - The compressed image blob
   */
  private compressImage(file: Blob, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event: any) => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          // Set canvas dimensions to match image
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw image on canvas
          ctx.drawImage(img, 0, 0);

          // Convert canvas to blob with compression
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Compression failed'));
              }
            },
            file.type || 'image/jpeg',
            quality
          );
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = event.target.result;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  ngOnInit() {
    this.uppy = new Uppy({
      restrictions: {
        maxNumberOfFiles: 5,
        allowedFileTypes: ['image/*', 'video/*'],
        maxFileSize: 50 * 1024 * 1024 // 50MB
      },
      autoProceed: false
    })
      .use(Dashboard, {
        inline: true,
        target: this.uppyDashboard.nativeElement,
        note: 'Upload images/videos up to 50MB',
        proudlyDisplayPoweredByUppy: false,
      })
      .use(Webcam, { modes: ['picture', 'video-audio'] })
      .use(ImageEditor, { quality: 0.9 });

    // Listen to compression events
    this.uppy.on('file-added', (file) => {
      console.log('📥 File added:', file.name, 'Size:', file.size ? (file.size / 1024 / 1024).toFixed(2) + 'MB' : 'N/A');
    });

    this.uppy.on('upload', async () => {
      const files = this.uppy.getFiles();
      const uploadedFiles: UploadFileData[] = [];

      console.log('\n🚀 Starting upload for', files.length, 'files\n');

      for (const file of files) {
        try {
          // Compress image if it's an image file
          let fileData = file.data;
          const originalSize = file.size;

          if (file.type?.startsWith('image/') && file.size && file.data instanceof Blob) {
            console.log(`📁 File: ${file.name}`);
            console.log(`📊 Original size: ${(file.size / 1024 / 1024).toFixed(2)}MB (${(file.size / 1024).toFixed(0)}KB)`);
            console.log(`🔧 Compressing...`);

            // Compress with 60% quality
            fileData = await this.compressImage(file.data, 0.6);

            if (file.size) {
              console.log(`📊 Original size: ${(file.size / 1024 / 1024).toFixed(2)}MB (${(file.size / 1024).toFixed(0)}KB)`);
              console.log(`✅ Compressed size: ${(fileData.size! / 1024 / 1024).toFixed(2)}MB (${(fileData.size! / 1024).toFixed(0)}KB)`);
              console.log(`💾 Saved: ${((file.size - fileData.size!) / 1024 / 1024).toFixed(2)}MB (${((file.size - fileData.size!) / file.size * 100).toFixed(1)}%)`);
              console.log('');
            }
          }

          // 1️⃣ Get presigned URL
          const presign: any = await firstValueFrom(
            this.http.get<{ url: string }>(`${this.baseUrl}presign?fileName=${file.name}`)
          );
          const presignedUrl = presign.url;

          await lastValueFrom(
            this.http.put(presignedUrl, fileData, {
              headers: new HttpHeaders({ 'Content-Type': file.type || 'application/octet-stream' }),
              reportProgress: true,
              observe: 'events',
              responseType: 'text'
            }).pipe(
              tap(event => {
                if (event.type === HttpEventType.UploadProgress && event.total) {
                  const percentDone = Math.round((100 * event.loaded) / event.total);
                  this.uppy.setFileState(file.id, {
                    progress: {
                      uploadStarted: Date.now(),
                      uploadComplete: percentDone === 100,
                      percentage: percentDone,
                      bytesUploaded: event.loaded,
                      bytesTotal: event.total
                    }
                  });
                }
              }),
              // Only let the final HttpResponse pass through
              filter(event => event instanceof HttpResponse)
            )
          );

          // 2️⃣ Upload file to R2


          // 3️⃣ Construct file metadata
          const urlObj = new URL(presignedUrl);
          const objectKey = urlObj.pathname.substring(1);

          // Use compressed file size if available, otherwise use original
          const actualSize = fileData instanceof Blob ? fileData.size : file.size;

          uploadedFiles.push({
            filename: file.name!,
            size: actualSize!,  // Use compressed file size
            contentType: file.type!,
            url: objectKey
          });
        } catch (err) {
          console.error('Upload failed for', file.name, err);
          this.uppy.info(`Upload failed for ${file.name}`, 'error', 5000);
        }
      }

      // 4️⃣ Emit uploaded file metadata to parent


      // Close dialog after all uploads finish
      this.dialogRef.close(uploadedFiles);
    });


  }


  ngOnDestroy() {
    this.uppy.cancelAll();
    this.uppy.destroy();
  }
}
