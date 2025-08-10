"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  ArrowLeft,
  Send,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default function PostOpportunityPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    opportunity_type: "",
    location: "",
    remote_friendly: false,
    compensation_type: "",
    compensation_amount: "",
    required_skills: "",
    application_deadline: ""
  })

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    try {
      setLoading(true)
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        console.error('Authentication error:', authError)
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
    } catch (error) {
      console.error('Error checking auth:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    setSuccess(false)

    try {
      if (!formData.title.trim() || !formData.content.trim()) {
        setError("Please fill in all required fields")
        setSubmitting(false)
        return
      }

      const postData = {
        user_id: user.id,
        title: formData.title,
        content: formData.content,
        post_type: false, // This is an opportunity post
        opportunity_type: formData.opportunity_type || null,
        location: formData.location || null,
        remote_friendly: formData.remote_friendly,
        compensation_type: formData.compensation_type || null,
        compensation_amount: formData.compensation_amount ? parseFloat(formData.compensation_amount) : null,
        required_skills: formData.required_skills || null,
        application_deadline: formData.application_deadline || null,
        is_active: true,
        likes: 0,
        comments: 0,
        views: 0,
        applications: []
      }

      const { data: newPost, error } = await supabase
        .from('posts')
        .insert([postData])
        .select()
        .single()

      if (error) {
        console.error('Error creating opportunity:', error)
        setError("Failed to create opportunity. Please try again.")
        setSubmitting(false)
        return
      }

      setSuccess(true)
      
      // Reset form
      setFormData({
        title: "",
        content: "",
        opportunity_type: "",
        location: "",
        remote_friendly: false,
        compensation_type: "",
        compensation_amount: "",
        required_skills: "",
        application_deadline: ""
      })

      // Redirect after a short delay
      setTimeout(() => {
        router.push('/opportunities')
      }, 2000)

    } catch (error) {
      console.error('Error creating opportunity:', error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setSubmitting(false)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            onClick={() => router.push('/opportunities')}
            variant="ghost" 
            className="mb-4 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Opportunities
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Post an Opportunity</h1>
          <p className="text-gray-600 mt-2">Share opportunities with the StartupConnect community</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>Opportunity Details</span>
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
                <span className="text-sm">Opportunity posted successfully! Redirecting to opportunities...</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Opportunity Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Software Engineering Internship"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <Label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Describe the opportunity, requirements, responsibilities, and benefits..."
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[120px]"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="opportunity_type" className="block text-sm font-medium text-gray-700 mb-2">
                    Opportunity Type *
                  </Label>
                  <Select
                    value={formData.opportunity_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, opportunity_type: value }))}
                    disabled={submitting}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select opportunity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                      <SelectItem value="lab_assistant">Lab Assistant</SelectItem>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., San Francisco, CA"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="compensation_type" className="block text-sm font-medium text-gray-700 mb-2">
                    Compensation Type
                  </Label>
                  <Select
                    value={formData.compensation_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, compensation_type: value }))}
                    disabled={submitting}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select compensation type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="stipend">Stipend</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="compensation_amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Compensation Amount ($/hr)
                  </Label>
                  <Input
                    id="compensation_amount"
                    type="number"
                    value={formData.compensation_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, compensation_amount: e.target.value }))}
                    placeholder="e.g., 25"
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="required_skills" className="block text-sm font-medium text-gray-700 mb-2">
                  Required Skills
                </Label>
                <Input
                  id="required_skills"
                  value={formData.required_skills}
                  onChange={(e) => setFormData(prev => ({ ...prev, required_skills: e.target.value }))}
                  placeholder="e.g., JavaScript, React, Python, Machine Learning"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={submitting}
                />
              </div>

              <div>
                <Label htmlFor="application_deadline" className="block text-sm font-medium text-gray-700 mb-2">
                  Application Deadline
                </Label>
                <Input
                  id="application_deadline"
                  type="date"
                  value={formData.application_deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, application_deadline: e.target.value }))}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={submitting}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remote_friendly"
                  checked={formData.remote_friendly}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, remote_friendly: checked as boolean }))}
                  disabled={submitting}
                />
                <Label htmlFor="remote_friendly" className="text-sm text-gray-700">
                  Remote-friendly opportunity
                </Label>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => router.push('/opportunities')}
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
                      Posting...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Send className="w-4 h-4 mr-2" />
                      Post Opportunity
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 