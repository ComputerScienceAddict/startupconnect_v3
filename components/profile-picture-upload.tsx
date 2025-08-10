"use client"

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, X, Camera } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface ProfilePictureUploadProps {
  currentPictureBase64?: string | null
  userId: string
  userName?: string
  onPictureUpdate: (base64: string, type: string) => void
  onError: (message: string) => void
}

export default function ProfilePictureUpload({
  currentPictureBase64,
  userId,
  userName,
  onPictureUpdate,
  onError
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file selection
  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      onError('Please select a JPEG, PNG, or WebP image')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      onError('Image size must be less than 5MB')
      return
    }

    try {
      // Create preview and get base64
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setPreviewUrl(base64)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error processing image:', error)
      onError('Failed to process image. Please try again.')
    }
  }

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Save base64 image to database
  const uploadImage = async (file: File) => {
    try {
      setIsUploading(true)

      // Convert to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result as string

        // Update profile in database
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            profile_picture_base64: base64,
            profile_picture_type: file.type
          })
          .eq('id', userId)

        if (updateError) {
          console.error('Database update error:', updateError)
          throw new Error('Failed to update profile')
        }

        // Call parent callback
        onPictureUpdate(base64, file.type)
        setPreviewUrl(null)
        setIsUploading(false)
      }

      reader.onerror = () => {
        throw new Error('Failed to read file')
      }

      reader.readAsDataURL(file)

    } catch (error) {
      console.error('Upload failed:', error)
      onError('Failed to save image. Please try again.')
      setIsUploading(false)
    }
  }

  // Handle upload button click
  const handleUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Handle save preview
  const handleSavePreview = () => {
    if (previewUrl && fileInputRef.current?.files?.[0]) {
      uploadImage(fileInputRef.current.files[0])
    }
  }

  // Handle cancel preview
  const handleCancelPreview = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      {/* Current Profile Picture */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="relative w-64 h-64 rounded-full overflow-hidden border-2 border-gray-300 shadow-lg">
            {(previewUrl || currentPictureBase64) ? (
              <img 
                src={previewUrl || currentPictureBase64 || undefined} 
                alt="Profile picture"
                className="w-full h-full object-cover"
                style={{
                  objectPosition: 'center center',
                  imageRendering: 'crisp-edges',
                  transform: 'scale(1.01)', // Prevents potential white edges in circular frame
                }}
                loading="eager"
                decoding="sync"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-7xl font-medium text-gray-400">
                {userName?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="text-white text-sm">Uploading...</div>
            </div>
          )}
        </div>

        {/* Upload Button */}
        {!previewUrl && (
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            {currentPictureBase64 ? 'Change Picture' : 'Upload Picture'}
          </Button>
        )}

        {/* Preview Actions */}
        {previewUrl && (
          <div className="flex gap-2">
            <Button
              onClick={handleSavePreview}
              disabled={isUploading}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              {isUploading ? 'Uploading...' : 'Save Picture'}
            </Button>
            <Button
              onClick={handleCancelPreview}
              disabled={isUploading}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Drag and Drop Area */}
      {!previewUrl && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">
            Drag and drop an image here, or click to browse
          </p>
          <p className="text-xs text-gray-500">
            Supports: JPEG, PNG, WebP (Max 5MB)
          </p>
        </div>
      )}
    </div>
  )
} 