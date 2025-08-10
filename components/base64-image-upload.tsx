"use client"

import React, { useState, useCallback } from 'react'
import { Button } from './ui/button'
import { toast } from './ui/use-toast'

interface Base64ImageUploadProps {
  onImageSelect: (base64: string | null, type: string | null) => void
  className?: string
  defaultImage?: string
}

export function Base64ImageUpload({ 
  onImageSelect, 
  className = '',
  defaultImage
}: Base64ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(defaultImage || null)

  const handleImageSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPEG, PNG, or WebP image.",
        variant: "destructive"
      })
      return
    }

    // Validate file size (500KB)
    if (file.size > 500 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 500KB.",
        variant: "destructive"
      })
      return
    }

    try {
      // Create image element to get dimensions
      const img = new Image()
      const imageUrl = URL.createObjectURL(file)
      
      img.onload = async () => {
        // Validate dimensions
        if (img.width > 1000 || img.height > 1000) {
          toast({
            title: "Image too large",
            description: "Please select an image under 1000x1000 pixels.",
            variant: "destructive"
          })
          URL.revokeObjectURL(imageUrl)
          return
        }

        // Convert to base64
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64 = reader.result as string
          setPreview(base64)
          onImageSelect(base64, file.type)
        }
        reader.readAsDataURL(file)
      }

      img.src = imageUrl
    } catch (error) {
      console.error('Error processing image:', error)
      toast({
        title: "Error",
        description: "Failed to process image. Please try again.",
        variant: "destructive"
      })
    }
  }, [onImageSelect])

  const handleRemoveImage = useCallback(() => {
    setPreview(null)
    onImageSelect(null, null)
  }, [onImageSelect])

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {preview ? (
        <div className="relative">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-32 h-32 rounded-full object-cover"
          />
          <Button
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
            onClick={handleRemoveImage}
          >
            ×
          </Button>
        </div>
      ) : (
        <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
          <label className="cursor-pointer p-4 text-center text-sm text-gray-500 hover:text-gray-700">
            Click to upload profile picture
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageSelect}
            />
          </label>
        </div>
      )}
    </div>
  )
}