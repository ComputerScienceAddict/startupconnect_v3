"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Network, LogOut, User, Building2, GraduationCap, Plus, Edit, Save, X, Briefcase, MapPin, Heart, Share, MessageCircle, Bookmark, Clock, Users, Star, Search, ChevronDown } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import ProfilePictureUpload from "@/components/profile-picture-upload"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const router = useRouter()

  // Form state - only fields that exist in the database
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    account_type: 'student',
    bio: '',
    location: '',
    phone: '',
    university: '',
    company_name: '',
    industry: '',
    graduation_year: '',
    gpa: '',
    majors: '',
    minors: '',
    skills: '',
    github: '',
    website: '',
    portfolio: ''
  })

  // Load user profile on component mount
  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        // Check auth status first
        const { data: session } = await supabase.auth.getSession()
        
        if (!session?.session?.user) {
          console.log('No session found, redirecting to login...')
          router.replace('/login')
          return
        }

        if (!isMounted) return;
        setLoading(true)
        
        const user = session.session.user
        setUser(user)

        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('id, email, full_name, account_type, bio, location, phone, university, company_name, industry, graduation_year, gpa, majors, minors, skills, github, website, portfolio, profile_picture_base64, profile_picture_type')
          .eq('id', user.id)
          .single()

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            // Create basic profile if it doesn't exist
            const basicProfile = {
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || 'New User',
              account_type: user.user_metadata?.account_type || 'student'
            }
            
            const { error: createError } = await supabase
              .from('user_profiles')
              .insert(basicProfile)
            
            if (createError) {
              console.error('Error creating basic profile:', createError)
              setUserProfile(null)
            } else {
              setUserProfile(basicProfile)
              setFormData({
                ...formData,
                full_name: basicProfile.full_name,
                email: basicProfile.email,
                account_type: basicProfile.account_type,
              })
            }
          } else {
            console.error('Error fetching profile:', profileError)
            setUserProfile(null)
          }
        } else {
          setUserProfile(profile)
          setFormData({
            full_name: profile.full_name || '',
            email: profile.email || user.email || '',
            account_type: profile.account_type || 'student',
            bio: profile.bio || '',
            location: profile.location || '',
            phone: profile.phone || '',
            university: profile.university || '',
            company_name: profile.company_name || '',
            industry: profile.industry || '',
            graduation_year: profile.graduation_year?.toString() || '',
            gpa: profile.gpa?.toString() || '',
            majors: profile.majors || '',
            minors: profile.minors || '',
            skills: profile.skills || '',
            github: profile.github || '',
            website: profile.website || '',
            portfolio: profile.portfolio || ''
          })
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        setSaveMessage("❌ Error loading profile. Please refresh the page.")
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadProfile()

    // Cleanup function
    return () => {
      isMounted = false
      setLoading(false)
    }
  }, [router])

  // Handle profile picture update
  const handlePictureUpdate = (base64: string, type: string) => {
    setUserProfile(prev => prev ? { 
      ...prev, 
      profile_picture_base64: base64,
      profile_picture_type: type
    } : null)
    setSaveMessage("✅ Profile picture updated successfully!")
    setTimeout(() => setSaveMessage(""), 3000)
  }

  // Handle profile picture error
  const handlePictureError = (errorMessage: string) => {
    setSaveMessage("❌ " + errorMessage)
    setTimeout(() => setSaveMessage(""), 5000)
  }

  const getAccountTypeDisplay = (accountType: string) => {
    switch (accountType) {
      case "student":
        return "Student"
      case "graduate":
        return "Graduate Student"
      case "founder":
        return "Founder"
      case "company":
        return "Company"
      default:
        return "Professional"
    }
  }

  const handleSave = async () => {
    if (!user) {
      setSaveMessage("❌ No user found")
      setTimeout(() => setSaveMessage(""), 3000)
      return
    }

    if (!formData.full_name.trim()) {
      setSaveMessage("❌ Full name is required")
      setTimeout(() => setSaveMessage(""), 3000)
      return
    }

    try {
      setSaving(true)

      const updateData = {
        account_type: formData.account_type.trim(),
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        bio: formData.bio.trim() || null,
        location: formData.location.trim() || null,
        phone: formData.phone.trim() || null,
        university: formData.university.trim() || null,
        company_name: formData.company_name.trim() || null,
        industry: formData.industry.trim() || null,
        graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
        gpa: formData.gpa ? parseFloat(formData.gpa) : null,
        majors: formData.majors.trim() || null,
        minors: formData.minors.trim() || null,
        skills: formData.skills.trim() || null,
        github: formData.github.trim() || null,
        website: formData.website.trim() || null,
        portfolio: formData.portfolio.trim() || null,
        updated_at: new Date().toISOString()
      }

      let result
      let error

      if (userProfile) {
        const { data, error: updateError } = await supabase
          .from('user_profiles')
          .update(updateData)
          .eq('id', user.id)
          .select()
          .single()

        result = data
        error = updateError
      } else {
        const insertData = {
          id: user.id,
          ...updateData,
          posts: [],
          connections: [],
          created_at: new Date().toISOString()
        }

        const { data, error: insertError } = await supabase
          .from('user_profiles')
          .insert(insertData)
          .select()
          .single()

        result = data
        error = insertError
      }

      if (error) {
        console.error('Error saving profile:', error)
        setSaveMessage(`❌ Failed to save profile: ${error.message}`)
        setTimeout(() => setSaveMessage(""), 5000)
      } else {
        setUserProfile(result)
        setIsEditing(false)
        setSaveMessage("✅ Profile saved successfully!")
        setTimeout(() => setSaveMessage(""), 3000)
      }

    } catch (error) {
      console.error('Exception during profile save:', error)
      setSaveMessage("❌ Failed to save profile. Please try again.")
      setTimeout(() => setSaveMessage(""), 5000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <LoadingSpinner text="Loading profile..." />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      {/* Save Message Display */}
      {saveMessage && (
        <div className="container mx-auto px-4 py-2">
          <div className={saveMessage.includes('✅') 
            ? 'p-3 rounded-lg text-sm bg-green-50 border border-green-200 text-green-700'
            : 'p-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700'
          }>
            {saveMessage}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-6">
          {/* Left Sidebar - Simplified */}
          <div className="w-48 flex-shrink-0">
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <nav className="flex flex-col gap-2 text-sm">
                <Link href="/profile" className="text-primary hover:underline font-medium">Profile</Link>
                <Link href="/connections" className="text-primary hover:underline">Friends</Link>
                <Link href="/photos" className="text-primary hover:underline">Photos</Link>
                <Link href="/messages" className="text-primary hover:underline">Messages</Link>
                <Link href="/account" className="text-primary hover:underline">Account</Link>
                <Link href="/privacy" className="text-primary hover:underline">Privacy</Link>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-white border border-gray-300 rounded-lg p-6">
              {/* Profile Header */}
              <div className="flex items-start gap-6 mb-6">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  <ProfilePictureUpload
                    currentPictureBase64={userProfile?.profile_picture_base64}
                    userId={user.id}
                    userName={userProfile?.full_name}
                    onPictureUpdate={handlePictureUpdate}
                    onError={handlePictureError}
                  />
                </div>

                {/* Profile Header Info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{userProfile?.full_name || 'User'}</h1>
                      <p className="text-sm text-gray-600 mt-1">
                        {getAccountTypeDisplay(userProfile?.account_type)}
                      </p>
                    </div>
                    <div>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => setIsEditing(false)} 
                            variant="outline" 
                            size="sm"
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleSave}
                            disabled={saving}
                            size="sm"
                            className="bg-primary hover:bg-primary/90"
                          >
                            {saving ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => setIsEditing(true)} 
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                        >
                          Edit Profile
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="flex gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{userProfile?.connections?.length || 0} connections</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{userProfile?.location || 'No location'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Profile Information */}
              <div className="flex-1 space-y-6">
                {/* Basic Information */}
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3>
                  <div className="space-y-4 text-sm">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Enter your email"
                        />
                      ) : (
                        <span className="text-[#3b5998]">{userProfile?.email || user.email}</span>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="account_type">Account Type</Label>
                      {isEditing ? (
                        <Select
                          value={formData.account_type}
                          onValueChange={(value) => setFormData({ ...formData, account_type: value })}
                        >
                          <SelectTrigger id="account_type">
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="graduate">Graduate</SelectItem>
                            <SelectItem value="founder">Founder</SelectItem>
                            <SelectItem value="company">Company</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="capitalize">{userProfile?.account_type || 'Student'}</span>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="location">Location</Label>
                      {isEditing ? (
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="Enter your location"
                        />
                      ) : (
                        <span>{userProfile?.location || 'Not specified'}</span>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Enter your phone number"
                        />
                      ) : (
                        <span>{userProfile?.phone || 'Not specified'}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Education & Work */}
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Education & Work</h3>
                  <div className="space-y-4 text-sm">
                    <div className="grid gap-2">
                      <Label htmlFor="university">University</Label>
                      {isEditing ? (
                        <Input
                          id="university"
                          value={formData.university}
                          onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                          placeholder="Enter your university"
                        />
                      ) : (
                        <span>{userProfile?.university || 'Not specified'}</span>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="graduation_year">Graduation Year</Label>
                      {isEditing ? (
                        <Input
                          id="graduation_year"
                          value={formData.graduation_year}
                          onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                          placeholder="Enter your graduation year"
                        />
                      ) : (
                        <span>{userProfile?.graduation_year || 'Not specified'}</span>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="gpa">GPA</Label>
                      {isEditing ? (
                        <Input
                          id="gpa"
                          value={formData.gpa}
                          onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                          placeholder="Enter your GPA"
                        />
                      ) : (
                        <span>{userProfile?.gpa || 'Not specified'}</span>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="majors">Majors</Label>
                      {isEditing ? (
                        <Input
                          id="majors"
                          value={formData.majors}
                          onChange={(e) => setFormData({ ...formData, majors: e.target.value })}
                          placeholder="Enter your majors"
                        />
                      ) : (
                        <span>{userProfile?.majors || 'Not specified'}</span>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="minors">Minors</Label>
                      {isEditing ? (
                        <Input
                          id="minors"
                          value={formData.minors}
                          onChange={(e) => setFormData({ ...formData, minors: e.target.value })}
                          placeholder="Enter your minors"
                        />
                      ) : (
                        <span>{userProfile?.minors || 'Not specified'}</span>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="company_name">Company</Label>
                      {isEditing ? (
                        <Input
                          id="company_name"
                          value={formData.company_name}
                          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                          placeholder="Enter your company name"
                        />
                      ) : (
                        <span>{userProfile?.company_name || 'Not specified'}</span>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="industry">Industry</Label>
                      {isEditing ? (
                        <Input
                          id="industry"
                          value={formData.industry}
                          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                          placeholder="Enter your industry"
                        />
                      ) : (
                        <span>{userProfile?.industry || 'Not specified'}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Skills & Bio */}
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Skills & Bio</h3>
                  <div className="space-y-4 text-sm">
                    <div className="grid gap-2">
                      <Label htmlFor="skills">Skills</Label>
                      {isEditing ? (
                        <Textarea
                          id="skills"
                          value={formData.skills}
                          onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                          placeholder="Enter your skills"
                        />
                      ) : (
                        <span>{userProfile?.skills || 'Not specified'}</span>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="bio">Bio</Label>
                      {isEditing ? (
                        <Textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          placeholder="Enter your bio"
                        />
                      ) : (
                        <span>{userProfile?.bio || 'Not specified'}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Links */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Links</h3>
                  <div className="space-y-4 text-sm">
                    <div className="grid gap-2">
                      <Label htmlFor="github">GitHub</Label>
                      {isEditing ? (
                        <Input
                          id="github"
                          value={formData.github}
                          onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                          placeholder="Enter your GitHub URL"
                        />
                      ) : (
                        <span>{userProfile?.github || 'Not specified'}</span>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="website">Website</Label>
                      {isEditing ? (
                        <Input
                          id="website"
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          placeholder="Enter your website URL"
                        />
                      ) : (
                        <span>{userProfile?.website || 'Not specified'}</span>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="portfolio">Portfolio</Label>
                      {isEditing ? (
                        <Input
                          id="portfolio"
                          value={formData.portfolio}
                          onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                          placeholder="Enter your portfolio URL"
                        />
                      ) : (
                        <span>{userProfile?.portfolio || 'Not specified'}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}