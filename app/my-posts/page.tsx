"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { UserAvatar } from '@/components/user-avatar'
import { 
  Eye, 
  Download, 
  Calendar, 
  MapPin, 
  Building2,
  GraduationCap,
  User,
  Clock,
  MessageCircle,
  CheckCircle,
  XCircle,
  ArrowRight
} from 'lucide-react'

export default function MyPostsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

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

      // Get user's posts
      const { data: userPosts, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          user_profiles!inner(full_name, company_name, account_type)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (postsError) {
        console.error('Error loading posts:', postsError)
        return
      }

      setPosts(userPosts || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getApplicationCount = (post: any) => {
    return post.applications?.length || 0
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

  const handleViewApplications = (post: any) => {
    setSelectedPost(post)
    setSelectedApplication(null)
  }

  const handleViewApplication = (application: any) => {
    setSelectedApplication(application)
  }

  const handleDownloadResume = (resumeUrl: string, applicantName: string) => {
    if (resumeUrl) {
      const link = document.createElement('a')
      link.href = resumeUrl
      link.download = `${applicantName}_resume.pdf`
      link.click()
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
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Posts</h1>
          <p className="text-gray-600 mt-1">Manage your posted opportunities and view applications</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Posts List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span>Your Posts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {posts.length > 0 ? (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div 
                        key={post.id} 
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedPost?.id === post.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleViewApplications(post)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {post.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {post.content}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>{formatDate(post.created_at)}</span>
                              <span className="flex items-center space-x-1">
                                <MessageCircle className="w-3 h-3" />
                                <span>{getApplicationCount(post)} applications</span>
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>You haven't posted any opportunities yet</p>
                    <p className="text-sm">Start sharing opportunities to connect with talented students!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Applications */}
          <div className="lg:col-span-2">
            {selectedPost ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="w-5 h-5 text-blue-600" />
                      <span>Applications for "{selectedPost.title}"</span>
                    </div>
                    <Badge variant="secondary">
                      {getApplicationCount(selectedPost)} applications
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPost.applications && selectedPost.applications.length > 0 ? (
                    <div className="space-y-4">
                      {selectedPost.applications.map((application: any, index: number) => (
                        <div 
                          key={index}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedApplication === application 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleViewApplication(application)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <UserAvatar
                                  user={{ full_name: application.applicant_name }}
                                  size="sm"
                                />
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {application.applicant_name}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    {application.applicant_email}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatDate(application.applied_at)}</span>
                                </span>
                                <Badge 
                                  variant={application.status === 'pending' ? 'secondary' : 
                                          application.status === 'accepted' ? 'default' : 'destructive'}
                                  className="text-xs"
                                >
                                  {application.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {application.resume_url && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDownloadResume(application.resume_url, application.applicant_name)
                                  }}
                                >
                                  <Download className="w-3 h-3 mr-1" />
                                  Resume
                                </Button>
                              )}
                              <Button size="sm" variant="outline">
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No applications yet</p>
                      <p className="text-sm">Applications will appear here when students apply</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Post</h3>
                  <p className="text-gray-600">
                    Choose a post from the left to view its applications
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Application Details Modal */}
            {selectedApplication && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Application Details</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedApplication(null)}
                    >
                      Close
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <UserAvatar
                      user={{ full_name: selectedApplication.applicant_name }}
                      size="lg"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedApplication.applicant_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedApplication.applicant_email}
                      </p>
                      <p className="text-xs text-gray-400">
                        Applied {formatDate(selectedApplication.applied_at)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Why Interested</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {selectedApplication.why_interested}
                    </p>
                  </div>

                  {selectedApplication.resume_url && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Resume</h4>
                      <Button
                        variant="outline"
                        onClick={() => handleDownloadResume(selectedApplication.resume_url, selectedApplication.applicant_name)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Resume
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept
                    </Button>
                    <Button size="sm" variant="destructive">
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 