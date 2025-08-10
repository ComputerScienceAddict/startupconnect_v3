"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Header from "@/components/header"
import ApplicationsView from "@/components/applications-view"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserAvatar } from "@/components/user-avatar"
import { Badge } from "@/components/ui/badge"
import {
  Briefcase,
  Plus,
  User,
  BookOpen,
  MessageCircle,
  MapPin,
  Star,
  Network,
  Building2,
  GraduationCap,
  Award,
  Activity,
  Globe,
  FileText,
  Eye,
  Clock,
  Send,
} from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [userPosts, setUserPosts] = useState<any[]>([])
  const [userOpportunities, setUserOpportunities] = useState<any[]>([])
  const [userApplications, setUserApplications] = useState<any[]>([])
  const [stats, setStats] = useState({ totalPosts: 0, studentsJoined: 0, totalApplications: 0 })
  const [loading, setLoading] = useState(true)
  const [showApplicationsView, setShowApplicationsView] = useState(false)
  const [selectedOpportunityForApplications, setSelectedOpportunityForApplications] = useState<any>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()
      if (authError || !user) {
        router.push("/login")
        return
      }
      setUser(user)

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      setUserProfile(profile)

      const { data: posts } = await supabase
        .from("posts")
        .select(`*, user_profiles!inner(full_name, account_type, university, company_name)`)
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
      setUserPosts(posts || [])

      // Load user's own posts instead of recent posts
      // (userPosts is already loaded above for the current user)

      const { count: totalPosts } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)

      const { count: totalUsers } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true })

      const { data: appsAgg } = await supabase
        .from("posts")
        .select("applicants")
        .eq("is_active", true)
      const totalApps = (appsAgg || []).reduce((sum: number, p: any) => sum + (p.applicants || 0), 0)

      // Load user's opportunities
      const { data: opportunities } = await supabase
        .from('opportunities')
        .select('*')
        .eq('created_by', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      setUserOpportunities(opportunities || [])

      // Load user's applications (applications they submitted)
      const { data: applications } = await supabase
        .from('applications')
        .select(`
          *,
          opportunities:created_for_which_opportunity (
            title,
            Creator
          )
        `)
        .order('created_at', { ascending: false })
      
      // Filter to get applications submitted by this user
      // Since we don't have user tracking in applications table, 
      // we'll need to enhance this later or use a different approach
      setUserApplications(applications || [])

      setStats({ totalPosts: totalPosts || 0, studentsJoined: totalUsers || 0, totalApplications: totalApps })
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getAccountTypeDisplay = (accountType?: string) => {
    switch (accountType) {
      case 'student': return 'Student'
      case 'graduate': return 'Graduate'
      case 'founder': return 'Founder'
      case 'company': return 'Company'
      default: return 'User'
    }
  }

  const getAccountTypeIcon = (accountType?: string) => {
    switch (accountType) {
      case 'student': return <GraduationCap className="w-4 h-4" />
      case 'graduate': return <Award className="w-4 h-4" />
      case 'founder': return <Network className="w-4 h-4" />
      case 'company': return <Building2 className="w-4 h-4" />
      default: return <User className="w-4 h-4" />
    }
  }

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric" })

  const handleViewApplicationsClick = (opportunity: any) => {
    setSelectedOpportunityForApplications(opportunity)
    setShowApplicationsView(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-10">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-20 mx-auto"></div>
            <p className="mt-4 text-neutral-30">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-10">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-90 mb-2">
            Welcome back, {userProfile?.full_name || user.email}
                </h1>
          <p className="text-neutral-30">
            {getAccountTypeDisplay(userProfile?.account_type)} • {userProfile?.university || userProfile?.company_name || 'Member'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border-neutral-20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-20 rounded-lg">
                  <Briefcase className="w-6 h-6 text-blue-50" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-30">Total Posts</p>
                  <p className="text-2xl font-bold text-neutral-90">{stats.totalPosts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-neutral-20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-20 rounded-lg">
                  <User className="w-6 h-6 text-blue-50" />
            </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-30">Members</p>
                  <p className="text-2xl font-bold text-neutral-90">{stats.studentsJoined}</p>
          </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-neutral-20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-20 rounded-lg">
                  <Activity className="w-6 h-6 text-blue-50" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-30">Applications</p>
                  <p className="text-2xl font-bold text-neutral-90">{stats.totalApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>

        {/* Quick Actions */}
        <Card className="bg-white border-neutral-20 mb-8">
          <CardHeader>
            <CardTitle className="text-neutral-90">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                className="w-full bg-[#0a66c2] hover:bg-[#004182] text-white"
                onClick={() => router.push('/post-opportunity')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
              <Button 
                className="w-full bg-[#0a66c2] hover:bg-[#004182] text-white"
                onClick={() => router.push('/opportunities')}
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Browse Opportunities
              </Button>
              <Button 
                className="w-full bg-[#0a66c2] hover:bg-[#004182] text-white"
                onClick={() => router.push('/events')}
              >
                <Globe className="w-4 h-4 mr-2" />
                View Events
                </Button>
              </div>
          </CardContent>
        </Card>

        {/* Applications Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Your Opportunities & Applications Received */}
          <Card className="bg-white border-neutral-20">
            <CardHeader>
              <CardTitle className="text-neutral-90 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Your Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userOpportunities.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-neutral-30 mx-auto mb-4" />
                  <p className="text-neutral-30">No opportunities posted yet</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => router.push('/opportunities')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Post Opportunity
                  </Button>
                              </div>
              ) : (
                <div className="space-y-4">
                  {userOpportunities.slice(0, 3).map((opportunity) => (
                    <div key={opportunity.id} className="p-4 border border-neutral-20 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-neutral-90 mb-1">
                            {opportunity.title}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-neutral-30 mb-2">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDate(opportunity.created_at)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {opportunity.opportunity_type}
                            </Badge>
                              </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-neutral-30">
                              {opportunity.applicants_count || 0} applications
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewApplicationsClick(opportunity)}
                              className="border-[#0a66c2] text-[#0a66c2] hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Applications
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {userOpportunities.length > 3 && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => router.push('/opportunities')}
                    >
                      View All Opportunities
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Applications You've Submitted */}
          <Card className="bg-white border-neutral-20">
            <CardHeader>
              <CardTitle className="text-neutral-90 flex items-center gap-2">
                <Send className="w-5 h-5" />
                Your Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userApplications.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-neutral-30 mx-auto mb-4" />
                  <p className="text-neutral-30">No applications submitted yet</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => router.push('/opportunities')}
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Browse Opportunities
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userApplications.slice(0, 3).map((application) => (
                    <div key={application.id} className="p-4 border border-neutral-20 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-neutral-90 mb-1">
                            Application #{application.id}
                          </h4>
                          <p className="text-sm text-neutral-70 mb-2">
                            {application.opportunities?.title || 'Unknown Opportunity'}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-neutral-30">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDate(application.created_at)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              Pending
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {userApplications.length > 3 && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                    >
                      View All Applications
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Your Posts */}
        <Card className="bg-white border-neutral-20">
          <CardHeader>
            <CardTitle className="text-neutral-90 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Your Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userPosts.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-neutral-30 mx-auto mb-4" />
                <p className="text-neutral-30">No posts created yet</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => router.push('/posts')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Post
                </Button>
              </div>
            ) : (
              <div>
                {/* Horizontal scrollable container for posts */}
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
                  {userPosts.map((post) => (
                    <div 
                      key={post.id} 
                      className="flex-shrink-0 w-80 p-4 border border-neutral-20 rounded-lg bg-gradient-to-br from-white to-neutral-5"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <UserAvatar user={userProfile} size="sm" />
                        <div className="flex-1">
                          <div className="font-medium text-neutral-90">{userProfile?.full_name}</div>
                          <div className="flex items-center gap-2 text-sm text-neutral-30">
                            <Clock className="w-3 h-3" />
                            {formatDate(post.created_at)}
                          </div>
                        </div>
                      </div>
                      
                  <div className="space-y-3">
                        <p className="text-neutral-70 text-sm line-clamp-4">
                          {post.content}
                        </p>
                        
                        {post.image_base64 && (
                          <div className="rounded-lg overflow-hidden">
                            <img 
                              src={post.image_base64} 
                              alt="Post image" 
                              className="w-full h-32 object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-2 border-t border-neutral-20">
                          <div className="flex items-center gap-4 text-sm text-neutral-30">
                            <span className="flex items-center gap-1">
                              <Activity className="w-4 h-4" />
                              {post.likes || 0} likes
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              {post.comments || 0} comments
                            </span>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push('/posts')}
                            className="text-xs"
                          >
                            View Post
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* View all posts button */}
                {userPosts.length > 0 && (
                  <div className="mt-4 flex justify-center">
                    <Button 
                      variant="outline" 
                      onClick={() => router.push('/posts')}
                      className="border-[#0a66c2] text-[#0a66c2] hover:bg-blue-50"
                    >
                      View All Your Posts ({userPosts.length})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Applications View Modal */}
      {showApplicationsView && selectedOpportunityForApplications && user && (
        <ApplicationsView
          isOpen={showApplicationsView}
          onClose={() => setShowApplicationsView(false)}
          opportunity={selectedOpportunityForApplications}
          user={user}
        />
      )}
    </div>
  )
} 