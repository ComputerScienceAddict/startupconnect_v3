"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  X, 
  FileText, 
  Calendar, 
  User, 
  Download,
  Eye,
  EyeOff,
  Mail,
  Clock
} from "lucide-react"

interface Application {
  id: number
  created_at: string
  resume: string | null
  description: string | null
  created_for_which_opportunity: string
}

interface ApplicationsViewProps {
  isOpen: boolean
  onClose: () => void
  opportunity: {
    id: string
    title: string
    Creator: string | null
  }
  user: {
    id: string
  }
}

export default function ApplicationsView({ 
  isOpen, 
  onClose, 
  opportunity, 
  user 
}: ApplicationsViewProps) {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedApp, setExpandedApp] = useState<number | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadApplications()
    }
  }, [isOpen, opportunity.id])

  if (!isOpen) return null

  const loadApplications = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('created_for_which_opportunity', opportunity.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading applications:', error)
        return
      }

      setApplications(data || [])
    } catch (error) {
      console.error('Unexpected error loading applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const downloadResume = (resumeBase64: string, applicationId: number) => {
    try {
      // Extract the base64 data and mime type
      const matches = resumeBase64.match(/^data:([^;]+);base64,(.+)$/)
      if (!matches) {
        alert('Invalid resume format')
        return
      }

      const mimeType = matches[1]
      const base64Data = matches[2]
      
      // Convert base64 to blob
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: mimeType })

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Determine file extension
      let extension = '.pdf'
      if (mimeType.includes('word')) {
        extension = mimeType.includes('openxml') ? '.docx' : '.doc'
      }
      
      link.download = `resume_application_${applicationId}${extension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading resume:', error)
      alert('Failed to download resume')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-bold text-[#1d2129]">
              Applications for "{opportunity.title}"
            </CardTitle>
            <p className="text-sm text-[#606770] mt-1">
              Posted by {opportunity.Creator || 'Anonymous'}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-[#e9ebf0] rounded"></div>
                ))}
              </div>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-16 h-16 text-[#ccd0d5] mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-[#1d2129] mb-1">No applications yet</h3>
              <p className="text-[#606770]">Applications will appear here when users apply</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <Badge className="bg-[#0a66c2] text-white">
                  {applications.length} Application{applications.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              {applications.map((application) => (
                <Card key={application.id} className="border-[#dfe3ee]">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#0a66c2] rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-[#1d2129]">
                            Application #{application.id}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[#606770]">
                            <Clock className="w-4 h-4" />
                            {formatDate(application.created_at)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {application.resume && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadResume(application.resume!, application.id)}
                            className="border-[#dfe3ee] text-[#0a66c2] hover:bg-blue-50"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Resume
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setExpandedApp(
                            expandedApp === application.id ? null : application.id
                          )}
                          className="border-[#dfe3ee] text-[#606770] hover:bg-[#f5f6f7]"
                        >
                          {expandedApp === application.id ? (
                            <>
                              <EyeOff className="w-4 h-4 mr-1" />
                              Collapse
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {application.description && (
                      <div className="mt-3">
                        <div className="text-sm text-[#606770] mb-1">Preview:</div>
                        <p className="text-[#1d2129] text-sm">
                          {application.description.length > 100 && expandedApp !== application.id
                            ? `${application.description.substring(0, 100)}...`
                            : application.description
                          }
                        </p>
                      </div>
                    )}

                    {expandedApp === application.id && (
                      <>
                        <Separator className="my-4" />
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-[#1d2129] mb-2">Full Application</h4>
                            {application.description ? (
                              <div className="bg-[#f7f8fa] p-3 rounded border border-[#dfe3ee]">
                                <p className="text-[#1d2129] whitespace-pre-wrap">
                                  {application.description}
                                </p>
                              </div>
                            ) : (
                              <p className="text-[#8d949e] italic">No description provided</p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-[#606770]">
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              <span>Resume: {application.resume ? 'Provided' : 'Not provided'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>Applied: {formatDate(application.created_at)}</span>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button 
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Accept
                            </Button>
                            <Button 
                              variant="outline"
                              size="sm"
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              Decline
                            </Button>
                            <Button 
                              variant="outline"
                              size="sm"
                              className="border-[#dfe3ee] text-[#606770] hover:bg-[#f5f6f7]"
                            >
                              Contact
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

