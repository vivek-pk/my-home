"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, FileText, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onUpload: (files: UploadedFile[]) => void
  accept?: "image" | "pdf" | "both"
  multiple?: boolean
  maxFiles?: number
  className?: string
}

export interface UploadedFile {
  filename: string
  originalName: string
  url: string
  type: "image" | "pdf"
  size: number
}

export function FileUpload({ onUpload, accept = "both", multiple = true, maxFiles = 10, className }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState("")

  const getAcceptedTypes = () => {
    switch (accept) {
      case "image":
        return { "image/*": [".jpeg", ".jpg", ".png", ".webp"] }
      case "pdf":
        return { "application/pdf": [".pdf"] }
      default:
        return {
          "image/*": [".jpeg", ".jpg", ".png", ".webp"],
          "application/pdf": [".pdf"],
        }
    }
  }

  const uploadFiles = async (files: File[]) => {
    setUploading(true)
    setError("")
    setUploadProgress(0)

    try {
      const uploadPromises = files.map(async (file, index) => {
        const formData = new FormData()
        formData.append("file", file)

        const fileType = file.type.startsWith("image/") ? "image" : "pdf"
        formData.append("type", fileType)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Upload failed")
        }

        const result = await response.json()
        setUploadProgress(((index + 1) / files.length) * 100)
        return result.file
      })

      const results = await Promise.all(uploadPromises)
      const newFiles = [...uploadedFiles, ...results]
      setUploadedFiles(newFiles)
      onUpload(newFiles)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`)
        return
      }

      uploadFiles(acceptedFiles)
    },
    [uploadedFiles.length, maxFiles],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getAcceptedTypes(),
    multiple,
    disabled: uploading,
  })

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    setUploadedFiles(newFiles)
    onUpload(newFiles)
  }

  const getFileIcon = (type: string) => {
    return type === "pdf" ? (
      <FileText className="h-8 w-8 text-red-500" />
    ) : (
      <ImageIcon className="h-8 w-8 text-blue-500" />
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card>
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
              uploading && "pointer-events-none opacity-50",
            )}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-primary">Drop the files here...</p>
            ) : (
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {accept === "image" ? "Upload Images" : accept === "pdf" ? "Upload PDFs" : "Upload Files"}
                </p>
                <p className="text-sm text-muted-foreground">Drag and drop files here, or click to select files</p>
                <p className="text-xs text-muted-foreground">
                  {accept === "image" && "Supports: JPEG, PNG, WebP (max 10MB each)"}
                  {accept === "pdf" && "Supports: PDF (max 50MB each)"}
                  {accept === "both" && "Supports: Images (JPEG, PNG, WebP) and PDFs"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading files...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4">Uploaded Files ({uploadedFiles.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file.type)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{file.originalName}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
