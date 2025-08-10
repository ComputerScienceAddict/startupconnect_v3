"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Upload, FileText, Loader2 } from "lucide-react"

interface ApplyModalProps {
  isOpen: boolean
  onClose: () => void
  opportunity: {
    id: string
    title: string
    Creator: string | null
  }
  user: {
    id: string
    email: string
  }
  userProfile: {
    full_name: string
    profile_picture_base64: string | null
  }
  onApplicationSubmitted: () => void
}

export default function ApplyModal({ 
  isOpen, 
  onClose, 
  opportunity, 
  user, 
  userProfile, 
  onApplicationSubmitted 
}: ApplyModalProps) {
  const [application, setApplication] = useState({
    description: "",
    resume: ""
  })
  const [submitting, setSubmitting] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  if (!isOpen) return null

  const handleFileUpload = (file: File) => {
    if (!file) return

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF or Word document (.pdf, .doc, .docx)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      setApplication(prev => ({
        ...prev,
        resume: base64
      }))
    }
    reader.readAsDataURL(file)
  }

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
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileUpload(files[0])
    }
  }

  const submitApplication = async () => {
    if (!application.description.trim()) {
      alert('Please provide a description')
      return
    }

    try {
      setSubmitting(true)

      const { error } = await supabase
        .from('applications')
        .insert({
          description: application.description.trim(),
          resume: application.resume || null,
          created_for_which_opportunity: opportunity.id
        })

      if (error) {
        console.error('Error submitting application:', error)
        alert('Failed to submit application. Please try again.')
        return
      }

      // The database trigger will automatically update the applicants_count
      // No manual update needed - the trigger handles it automatically

      // Success!
      onApplicationSubmitted()
      onClose()
      
      // Reset form
      setApplication({
        description: "",
        resume: ""
      })

      alert('Application submitted successfully!')

    } catch (err) {
      console.error('Unexpected error:', err)
      alert('An unexpected error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold text-[#1d2129]">
            Apply for {opportunity.title}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-sm text-[#606770] mb-4">
            Applying to <span className="font-semibold">{opportunity.Creator || 'Anonymous'}</span>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-[#606770]">
              Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Tell them why you're interested in this opportunity and what makes you a great fit..."
              value={application.description}
              onChange={(e) => setApplication(prev => ({ ...prev, description: e.target.value }))}
              className="mt-1 h-32 bg-white border-[#ccd0d5] text-[#1d2129]"
            />
          </div>

          {/* Resume Upload */}
          <div>
            <Label className="text-sm font-medium text-[#606770]">
              Resume (Optional - .pdf, .doc, .docx - max 5MB)
            </Label>
            <div
              className={`mt-1 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive 
                  ? 'border-[#0a66c2] bg-blue-50' 
                  : 'border-[#ccd0d5] hover:border-[#0a66c2]'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {application.resume ? (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">Resume uploaded</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setApplication(prev => ({ 
                      ...prev, 
                      resume: ""
                    }))}
                    className="h-6 w-6 p-0 ml-2"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-[#8d949e] mx-auto mb-2" />
                  <p className="text-[#606770] mb-2">
                    Drag and drop your resume here, or{" "}
                    <label className="text-[#0a66c2] cursor-pointer hover:underline">
                      browse files
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file)
                        }}
                      />
                    </label>
                  </p>
                  <p className="text-xs text-[#8d949e]">
                    Supports PDF, DOC, DOCX up to 5MB
                  </p>
                </div>
              )}
            </div>
          </div>



          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 border-[#ccd0d5] text-[#606770] hover:bg-[#f5f6f7]"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitApplication}
              className="flex-1 bg-[#0a66c2] hover:bg-[#004182] text-white"
              disabled={submitting || !application.description.trim()}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
