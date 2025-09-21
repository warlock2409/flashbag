import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ResponseDate } from 'src/app/app.component';

export interface DocumentDto {
  id?: number;
  type: string;
  attachments: UploadFile[];
}
export interface UploadFile {
  // Backend fields
  url?: string;
  filename: string;
  contentType: string;
  size: number;
  displayOrder?: number;
  documentId?: number;

  // Frontend-only (optional)
  file?: File;         // used only before upload
  progress?: number;   // 0–100
}

@Component({
  selector: 'app-upload-media',
  imports: [CommonModule, FormsModule],
  templateUrl: './upload-media.component.html',
  styleUrl: './upload-media.component.scss',
  standalone: true
})
export class UploadMediaComponent {

  constructor(private http: HttpClient) { }

  @Input() multiple = true;
  @Input() existingUploads: DocumentDto | null = null;
  @Input() type!: string;
  @Output() uploaded = new EventEmitter<DocumentDto>();

  ngOnInit() {
    if (this.existingUploads) {
      const prefix = "https://pub-f3cc65a63e2a4ca88e58aae1aedfa9f6.r2.dev/";

      this.existingUploads.attachments = this.existingUploads.attachments.map(attachment => {
        // Only add prefix if not already starting with it
        const newUrl = attachment.url?.startsWith(prefix)
          ? attachment.url
          : `${prefix}${attachment.url}`;

        return {
          ...attachment,
          url: newUrl
        };
      });

      this.uploads = [...this.existingUploads.attachments];
      this.selected = this.uploads[0];

      console.log(this.selected);

    }
  }


  uploads: UploadFile[] = [];
  selected?: UploadFile;

  placeholderUrl = 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnU5NXFncHV2ZWlmYjV5eXVxeDNwZWd0emU5Ym5zNzBzcHFvaW41bCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ctYt1iImGI71RwUIQO/giphy.gif';

  isImage(file: UploadFile): boolean {

    if (file.hasOwnProperty('contentType')) {
      return file.contentType.startsWith('image/')
    }

    return file.file ? file.file.type.startsWith('image/') : false;
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const file: File = files[i];

      const upload: UploadFile = {
        file,
        filename: file.name,
        url: '', // fill later after presigned upload
        progress: 0,
        contentType: file.type,   // ✅ here is the contentType
        size: file.size
      };

      this.uploadToR2(upload);
    }
  }

  uploadToR2(upload: UploadFile) {
    // Replace with your R2 upload + presign logic
    this.http.get<{ url: string }>(`http://localhost:9000/presign?fileName=${upload.filename}`)
      .subscribe({
        next: (data) => {
          const presignedUrl = data.url;

          // 2. PUT file to R2
          this.http.put(presignedUrl, upload.file, {
            headers: new HttpHeaders({
              'Content-Type': upload.file?.type || 'application/octet-stream'
            }),
            responseType: 'text' // avoid JSON parse error
          }).subscribe({
            next: () => {

              let url = `http://localhost:9000/document`;
              let document: DocumentDto = { type: this.type, attachments: [] };
              if (this.existingUploads != null) {
                document.id = this.existingUploads.id;
              }
              // 3. Construct public URL
              const urlObj = new URL(presignedUrl);
              const objectKey = urlObj.pathname.substring(1);
              upload.url = objectKey;
              document.attachments.push(upload);

              this.http.post<ResponseDate>(url, document).subscribe({
                next: (res) => {
                  console.log('Response:', res);
                  upload.progress = 100;
                  upload.url = `https://pub-f3cc65a63e2a4ca88e58aae1aedfa9f6.r2.dev/${objectKey}`;
                  // Add to uploads only after success
                  this.uploads.push(upload);

                  if (!this.selected) this.selected = upload;

                  if (this.existingUploads == null) {
                    this.uploaded.emit(res.data);
                  }
                },
                error: (error) => {
                  console.error('Error occurred:', error);
                }
              });
            },
            error: (err) => console.error('Upload failed', err)
          });
        },
        error: (err) => console.error('Failed to get presigned URL', err)
      });

  }


  selectFile(upload: UploadFile) {
    this.selected = upload;
  }

  removeFile(upload: UploadFile) {
    this.uploads = this.uploads.filter(u => u !== upload);

    if (this.selected === upload) {
      this.selected = this.uploads[0]; // set first remaining as main
    }
  }




}
