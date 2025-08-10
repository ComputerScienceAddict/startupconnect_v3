"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Network, LogOut, User, GraduationCap, Briefcase, Users, BookOpen, Award, Heart, MessageCircle, Share } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

// No dummy posts - will fetch real posts from database

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
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

      // Redirect non-student/graduate users to main dashboard
      if (profile && profile.account_type !== "student" && profile.account_type !== "graduate") {
        router.push('/dashboard')
        return
      }

      setLoading(false)
    }

    checkUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b5998] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="bg-[#3b5998] text-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Network className="w-6 h-6" />
            <span className="text-xl font-bold">startupconnect</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">Welcome, {userProfile?.full_name || user.email}</span>
            <Button onClick={handleLogout} variant="outline" size="sm" className="text-white border-white bg-transparent hover:bg-white hover:text-[#3b5998]">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            {/* Profile Summary */}
            <Card className="border border-green-200 bg-white shadow-sm mb-6">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-[#3b5998] w-12 h-12 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{userProfile?.full_name || 'Student'}</h2>
                    <p className="text-gray-600">{userProfile?.university || 'University'}</p>
                    <p className="text-sm text-gray-500">
                      {userProfile?.account_type === "graduate" ? "Graduate Student" : "Undergraduate Student"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-green-200 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/posts">
                  <Button className="w-full bg-[#3b5998] hover:bg-[#2d4373] text-white">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Browse Opportunities
                  </Button>
                </Link>
                <Link href="/applications">
                  <Button variant="outline" className="w-full border-[#3b5998] text-[#3b5998] hover:bg-[#3b5998] hover:text-white">
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Applications
                  </Button>
                </Link>
                                 <Link href="/profile">
                   <Button variant="outline" className="w-full border-[#3b5998] text-[#3b5998] hover:bg-[#3b5998] hover:text-white">
                     <User className="w-4 h-4 mr-2" />
                     My Profile
                   </Button>
                 </Link>
              </CardContent>
            </Card>

            <Card className="border border-green-200 bg-white shadow-sm mt-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Your Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#3b5998]">0</div>
                    <div className="text-sm text-gray-600">Applications</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#3b5998]">0</div>
                    <div className="text-sm text-gray-600">Saved Opportunities</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Recent Opportunities</h1>
              <p className="text-gray-600">Latest internships and research positions for students</p>
            </div>

            <div className="space-y-6">
              <Card className="border border-green-200 bg-white shadow-sm">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Opportunities Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Check back soon for internships, research positions, and other opportunities from innovative startups!
                  </p>
                                     <Link href="/posts">
                     <Button className="bg-[#3b5998] hover:bg-[#2d4373] text-white">
                       Browse All Opportunities
                     </Button>
                   </Link>
                </CardContent>
              </Card>
            </div>

            {/* View All Button */}
            <div className="text-center mt-8">
              <Link href="/posts">
                <Button variant="outline" className="border-[#3b5998] text-[#3b5998] hover:bg-[#3b5998] hover:text-white">
                  View All Opportunities
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-200 text-gray-600 text-xs py-4 mt-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <p className="mb-2 md:mb-0">© 2024 StartupConnect. A startup innovation.</p>
          <nav className="flex space-x-4">
            <Link href="#" className="hover:underline">
              privacy
            </Link>
            <Link href="#" className="hover:underline">
              terms
            </Link>
            <Link href="#" className="hover:underline">
              developers
            </Link>
            <Link href="#" className="hover:underline">
              jobs
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
} 