"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { UserAvatar } from '@/components/user-avatar'
import { 
  ArrowLeft, 
  Upload, 
  Send, 
  MapPin, 
  Calendar, 
  Building2,
  GraduationCap,
  User,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

export default function ApplyPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string
  
  const [post, setPost] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    whyInterested: "",
    resumeFile: null as File | null
  })

  useEffect(() => {
    checkAuthAndLoadData()
  }, [postId])

  const checkAuthAndLoadData = async () => {
    try {
      setLoading(true)
      
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Get user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setUserProfile(profile)

      // Get post details
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select(`
          *,
          user_profiles!inner(full_name, company_name, account_type, university)
        `)
        .eq('id', postId)
        .eq('is_active', true)
        .single()

      if (postError || !postData) {
        setError("Opportunity not found or no longer available")
        return
      }

      // Check if this is an opportunity post
      if (postData.post_type !== false) {
        setError("This post is not an opportunity")
        return
      }

      setPost(postData)
    } catch (error) {
      console.error('Error loading data:', error)
      setError("Failed to load opportunity details")
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.includes('pdf') && !file.type.includes('doc') && !file.type.includes('docx')) {
        setError("Please upload a PDF, DOC, or DOCX file")
        return
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB")
        return
      }

      setFormData(prev => ({ ...prev, resumeFile: file }))
      setError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      if (!formData.whyInterested.trim()) {
        setError("Please explain why you're interested in this opportunity")
        setSubmitting(false)
        return
      }

      let resumeUrl = null

      // Upload resume if provided
      if (formData.resumeFile) {
        const fileName = `${user.id}_${Date.now()}_${formData.resumeFile.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, formData.resumeFile)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          setError("Failed to upload resume. Please try again.")
          setSubmitting(false)
          return
        }

        const { data: urlData } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName)
        
        resumeUrl = urlData.publicUrl
      }

      // Create application object
      const application = {
        applicant_id: user.id,
        applicant_name: userProfile?.full_name || user.email,
        applicant_email: user.email,
        why_interested: formData.whyInterested,
        resume_url: resumeUrl,
        applied_at: new Date().toISOString(),
        status: 'pending'
      }

      // Get current applications
      const currentApplications = post.applications || []
      const updatedApplications = [...currentApplications, application]

      // Update post with new application and increment applicants count
      const { error: updateError } = await supabase
        .from('posts')
        .update({ 
          applications: updatedApplications,
          applicants: (post.applicants || 0) + 1
        })
        .eq('id', postId)

      if (updateError) {
        console.error('Update error:', updateError)
        setError("Failed to submit application. Please try again.")
        setSubmitting(false)
        return
      }

      setSuccess(true)
      
      // Reset form
      setFormData({
        whyInterested: "",
        resumeFile: null
      })

      // Redirect after a short delay
      setTimeout(() => {
        router.push('/posts')
      }, 2000)

    } catch (error) {
      console.error('Submit error:', error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const getAccountTypeIcon = (accountType: string) => {
    switch (accountType) {
      case 'student':
      case 'graduate':
        return <GraduationCap className="w-4 h-4" />
      case 'founder':
        return <Building2 className="w-4 h-4" />
      case 'company':
        return <Building2 className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const getAccountTypeDisplay = (accountType: string) => {
    switch (accountType) {
      case 'student':
        return 'Student'
      case 'graduate':
        return 'Graduate Student'
      case 'founder':
        return 'Founder'
      case 'company':
        return 'Company'
      default:
        return 'Professional'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error && !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/posts')} className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Posts
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            onClick={() => router.push('/posts')}
            variant="ghost" 
            className="mb-4 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Posts
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Apply for Opportunity</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Opportunity Details */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span>Opportunity Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {post.content}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <UserAvatar
                      user={post.user_profiles}
                      size="sm"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {post.user_profiles?.full_name || 'Unknown'}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        {getAccountTypeIcon(post.user_profiles?.account_type)}
                        <span>{getAccountTypeDisplay(post.user_profiles?.account_type)}</span>
                        {post.user_profiles?.university && (
                          <>
                            <span>•</span>
                            <span>{post.user_profiles.university}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {post.opportunity_type && (
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {post.opportunity_type.replace('_', ' ')}
                      </Badge>
                    </div>
                  )}

                  {post.location && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{post.location}</span>
                    </div>
                  )}

                  {post.compensation_type && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span className="font-medium">{post.compensation_type}</span>
                      {post.compensation_amount && (
                        <span>${post.compensation_amount}/hr</span>
                      )}
                    </div>
                  )}

                  {post.remote_friendly && (
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <span className="font-medium">Remote-friendly</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>Posted {new Date(post.created_at).toLocaleDateString()}</span>
                  </div>

                  {post.applicants && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{post.applicants} applicants</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Application Form</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {success && (
                  <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span className="text-sm">Application submitted successfully! Redirecting...</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="whyInterested" className="block text-sm font-medium text-gray-700 mb-2">
                      Why are you interested in this opportunity? *
                    </Label>
                    <Textarea
                      id="whyInterested"
                      value={formData.whyInterested}
                      onChange={(e) => setFormData(prev => ({ ...prev, whyInterested: e.target.value }))}
                      placeholder="Tell us why you're interested in this opportunity, what you hope to learn, and how you can contribute..."
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[120px]"
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <Label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-2">
                      Resume/CV (Optional)
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <input
                        type="file"
                        id="resume"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={submitting}
                      />
                      <label htmlFor="resume" className="cursor-pointer">
                        <p className="text-sm text-gray-600 mb-1">
                          {formData.resumeFile ? formData.resumeFile.name : "Click to upload or drag and drop"}
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF, DOC, or DOCX (max 5MB)
                        </p>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6">
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => router.push('/posts')}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {submitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Send className="w-4 h-4 mr-2" />
                          Submit Application
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 