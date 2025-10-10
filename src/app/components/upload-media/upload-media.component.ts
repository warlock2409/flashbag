import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ResponseDate } from 'src/app/app.component';
import { UploadFileData, UppyUploadComponent } from '../uppy-upload/uppy-upload.component';
import { SweatAlertService } from 'src/app/services/sweat-alert.service';

export interface DocumentDto {
  id?: number;
  type: string;
  attachments: UploadFile[];
  orgId?: number
}
export interface UploadFile {
  // Backend fields
  id?: number;
  url?: string;
  filename: string;
  contentType: string;
  size: number;
  displayOrder?: number;
  documentId?: number;
  deleted: boolean;

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


  constructor(private http: HttpClient, public dialog: MatDialog, private swalService: SweatAlertService) { }

  @Input() multiple = true;
  @Input() enableLogo = false;
  @Input() existingUploads: DocumentDto | null = null;
  @Input() type!: string;
  @Output() uploaded = new EventEmitter<DocumentDto>();
  @Input() placeholderUrl:string = "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnU5NXFncHV2ZWlmYjV5eXVxeDNwZWd0emU5Ym5zNzBzcHFvaW41bCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ctYt1iImGI71RwUIQO/giphy.gif";

  ngOnChanges(changes: SimpleChanges) {
    if (this.existingUploads && Array.isArray(this.existingUploads.attachments)) {
      const prefix = "https://pub-f3cc65a63e2a4ca88e58aae1aedfa9f6.r2.dev/";

      this.existingUploads.attachments = this.existingUploads.attachments
        .filter(attachment => !attachment.deleted)
        .map(attachment => {
          // Only add prefix if not already starting with it
          const newUrl = attachment.url?.startsWith(prefix)
            ? attachment.url
            : `${prefix}${attachment.url}`;

          return {
            ...attachment,
            url: newUrl
          };
        }).sort((a, b) => {
          if (a.displayOrder == null && b.displayOrder == null) return 0;
          if (a.displayOrder == null) return 1;  // push nulls to bottom
          if (b.displayOrder == null) return -1;
          return a.displayOrder - b.displayOrder;
        });

      this.uploads = [...this.existingUploads.attachments];
      this.selected = this.uploads[0];
    }
  }

  ngOnInit() {

  }

  openUppy() {
    const dialogRef = this.dialog.open(UppyUploadComponent, {
      data: {},
    });

    // Optional: afterClosed() if you still need to handle when the dialog fully closes
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed with:', result);
      if (result) {
        let document: DocumentDto = { type: this.type, attachments: [] };
        if (this.existingUploads != null) {
          document.id = this.existingUploads.id;
        }
        document.attachments = [...result];
        this.UpdateDocumentAttachment(document);
      }
    });
  }


  uploads: UploadFile[] = [];
  selected?: UploadFile;


  isImage(file: UploadFile): boolean {

    if (file.hasOwnProperty('contentType')) {
      return file.contentType.startsWith('image/')
    }

    return file.file ? file.file.type.startsWith('image/') : false;
  }


  isVideo(file: UploadFile): any {
    if (file.hasOwnProperty('contentType')) {
      return file.contentType.startsWith('video/')
    }

    return file.file ? file.file.type.startsWith('video/') : false;
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
        size: file.size,
        deleted: false
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
              let document: DocumentDto = { type: this.type, attachments: [] };
              if (this.existingUploads != null) {
                document.id = this.existingUploads.id;
              }
              // 3. Construct public URL
              const urlObj = new URL(presignedUrl);
              const objectKey = urlObj.pathname.substring(1);
              upload.url = objectKey;
              document.attachments.push(upload);
              this.UpdateDocumentAttachment(document);
            },
            error: (err) => console.error('Upload failed', err)
          });
        },
        error: (err) => console.error('Failed to get presigned URL', err)
      });

  }

  UpdateDocumentAttachment(document: DocumentDto) {
    let url = `http://localhost:9000/document`;

    const userJson = localStorage.getItem('currentUser');
    if (!userJson) throw new Error("User not found in localStorage");
    const user = JSON.parse(userJson);
    const orgId = user.organizationDto?.[0]?.id;
    document.orgId = orgId;

    this.http.post<ResponseDate>(url, document).subscribe({
      next: (res) => {
        this.uploads = res.data.attachments;

        this.selected = this.uploads[0];

        if (this.existingUploads == null) {
          this.uploaded.emit(res.data);
        }
      },
      error: (error) => {
        console.error('Error occurred:', error);
      }
    });

  }

  selectFile(upload: UploadFile) {
    this.selected = upload;
  }

  removeFile(upload: UploadFile) {
    this.uploads = this.uploads.filter(u => u !== upload);
    let documentId = upload.documentId;
    let attachmentId = upload.id;
    let url = `http://localhost:9000/document/${documentId}/attachment/${attachmentId}`
    this.http.delete(url).subscribe({
      next: () => {
        console.log(`Deleted attachment ${attachmentId} from document ${documentId}`);
        this.swalService.success("Media Deleted Successfully")
      },
      error: (err) => {
        console.error('Failed to delete attachment', err);
      }
    });

    if (this.selected === upload) {
      this.selected = this.uploads[0]; // set first remaining as main
    }
  }

  makeItLogo(selectedImage: UploadFile | undefined) {
    this.http.get<{ url: string }>(`http://localhost:9000/document/${selectedImage?.documentId}/attachment/${selectedImage?.id}/makeItLogo`)
      .subscribe({
        next: (data) => {
        },
        error: (err: any) => {

        }
      })
  }



}
