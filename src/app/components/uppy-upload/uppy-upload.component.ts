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
  baseUrl= "https://raijin.onrender.com/";


  @ViewChild('uppyDashboard', { static: true }) uppyDashboard!: ElementRef;
  uppy!: Uppy;
  uploadComplete: any;

  constructor(private http: HttpClient, private dialogRef: MatDialogRef<UppyUploadComponent>) { }

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

    // Custom upload pipeline
    this.uppy.on('upload', async () => {
      const files = this.uppy.getFiles();
      const uploadedFiles: UploadFileData[] = [];

      for (const file of files) {
        try {
          // 1️⃣ Get presigned URL
          const presign: any = await firstValueFrom(
            this.http.get<{ url: string }>(`${this.baseUrl}presign?fileName=${file.name}`)
          );
          const presignedUrl = presign.url;

          await lastValueFrom(
            this.http.put(presignedUrl, file.data, {
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
          const url = `https://pub-f3cc65a63e2a4ca88e58aae1aedfa9f6.r2.dev/${objectKey}`;

          uploadedFiles.push({
            filename: file.name!,
            size: file.size!,
            contentType: file.type!,
            url:objectKey
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
