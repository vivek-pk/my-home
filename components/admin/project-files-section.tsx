"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileUpload, type UploadedFile } from "@/components/upload/file-upload"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, ImageIcon, Plus } from "lucide-react"

interface ProjectFilesSectionProps {
  onFloorPlansChange: (files: UploadedFile[]) => void
  onImagesChange: (files: UploadedFile[]) => void
  initialFloorPlans?: UploadedFile[]
  initialImages?: UploadedFile[]
}

export function ProjectFilesSection({
  onFloorPlansChange,
  onImagesChange,
  initialFloorPlans = [],
  initialImages = [],
}: ProjectFilesSectionProps) {
  const [showFloorPlanUpload, setShowFloorPlanUpload] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Files</CardTitle>
        <CardDescription>Upload floor plans, blueprints, and project images</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="floorplans" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="floorplans" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Floor Plans</span>
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center space-x-2">
              <ImageIcon className="h-4 w-4" />
              <span>Images</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="floorplans" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Floor Plans & Blueprints</h3>
                <p className="text-sm text-muted-foreground">Upload PDF files of project blueprints</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowFloorPlanUpload(!showFloorPlanUpload)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Floor Plans
              </Button>
            </div>

            {showFloorPlanUpload && (
              <FileUpload
                accept="pdf"
                onUpload={(files) => {
                  onFloorPlansChange([...initialFloorPlans, ...files])
                  setShowFloorPlanUpload(false)
                }}
                maxFiles={5}
              />
            )}

            {initialFloorPlans.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {initialFloorPlans.map((file, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-red-500" />
                        <div>
                          <p className="font-medium text-sm">{file.originalName}</p>
                          <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="images" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Project Images</h3>
                <p className="text-sm text-muted-foreground">Upload reference images and photos</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowImageUpload(!showImageUpload)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Images
              </Button>
            </div>

            {showImageUpload && (
              <FileUpload
                accept="image"
                onUpload={(files) => {
                  onImagesChange([...initialImages, ...files])
                  setShowImageUpload(false)
                }}
                maxFiles={20}
              />
            )}

            {initialImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {initialImages.map((file, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="aspect-square bg-muted">
                      <img
                        src={file.url || "/placeholder.svg"}
                        alt={file.originalName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <CardContent className="pt-2">
                      <p className="text-xs truncate">{file.originalName}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
