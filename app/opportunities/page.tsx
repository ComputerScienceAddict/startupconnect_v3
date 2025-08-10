"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Header from "@/components/header"
import { UserAvatar } from "@/components/user-avatar"
import ApplyModal from "@/components/apply-modal"
import ApplicationsView from "@/components/applications-view"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Plus
} from 'lucide-react'

interface Opportunity {
  id: string
  title: string
  description: string
  location: string
  opportunity_type: string
  remote_friendly: boolean
  compensation_type: string | null
  compensation_amount: number | null
  required_skills: string | null
  duration: string | null
  application_deadline: string | null
  applicants_count: number
  created_by: string
  created_at: string
  updated_at: string
  Creator: string | null
  Profile_picture: string | null
  user_profiles: {
    full_name: string
    profile_picture_base64: string | null
  }
  _count?: {
    applications: number
  }
}

export default function OpportunitiesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [showApplicationsView, setShowApplicationsView] = useState(false)
  const [selectedOpportunityForApplications, setSelectedOpportunityForApplications] = useState<Opportunity | null>(null)
  const [newOpportunity, setNewOpportunity] = useState({
    title: "",
    description: "",
    opportunity_type: "internship",
    location: "",
    remote_friendly: false,
    compensation_type: "paid",
    compensation_amount: 0,
    required_skills: "",
    duration: "",
    application_deadline: ""
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadOpportunities()
  }, [])

  const loadOpportunities = async () => {
    try {
      setLoading(true)

      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Get user profile for apply modal
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name, profile_picture_base64')
        .eq('id', user.id)
        .single()
      
      setUserProfile(profile)

      const { error: tableCheckError } = await supabase
        .from('opportunities')
        .select('id')
        .limit(1)
      
      if (tableCheckError) {
        console.error('Table check error:', tableCheckError)
        if (tableCheckError.message?.includes('relation "opportunities" does not exist')) {
          setOpportunities([])
          return
        }
        if (tableCheckError.message?.includes('permission denied')) {
          setOpportunities([])
          return
        }
      }

      // First, get opportunities without the join to avoid foreign key issues
      const { data: opportunitiesData, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading opportunities:', error)
        setOpportunities([])
        return
      }

      if (!opportunitiesData) {
        setOpportunities([])
        return
      }

      // Use the Creator and Profile_picture fields that are already saved in the table
      const opportunitiesWithProfiles = opportunitiesData.map(opp => ({
        ...opp,
        user_profiles: {
          full_name: opp.Creator || 'Anonymous User',
          profile_picture_base64: opp.Profile_picture || null
        },
        _count: {
          applications: opp.applicants_count || 0
        }
      }))

      setOpportunities(opportunitiesWithProfiles)
    } catch (error) {
      console.error('Unexpected error loading opportunities:', error)
      setOpportunities([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60))
        return `${diffMinutes}M AGO`
      }
      return `${diffHours}H AGO`
    }
    if (diffDays === 1) return "1D AGO"
    if (diffDays < 7) return `${diffDays}D AGO`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}W AGO`
    return `${Math.floor(diffDays / 30)}M AGO`
  }

  const getSalaryDisplay = (compensationType: string, compensationAmount: number) => {
    if (!compensationType || !compensationAmount) return "Not specified"
    
    switch (compensationType) {
      case 'hourly':
        return `$${compensationAmount}/hour`
      case 'salary':
        return `$${compensationAmount.toLocaleString()}/year`
      case 'stipend':
        return `$${compensationAmount}/month stipend`
      default:
        return `$${compensationAmount}`
    }
  }

  const filteredOpportunities = opportunities.filter(opportunity => {
    const q = searchQuery.toLowerCase()
    return (
      opportunity.title.toLowerCase().includes(q) ||
      opportunity.description?.toLowerCase().includes(q) ||
      opportunity.location?.toLowerCase().includes(q) ||
      opportunity.user_profiles?.full_name?.toLowerCase().includes(q)
    )
  })

  const createOpportunity = async () => {
    if (!user || !newOpportunity.title.trim() || !newOpportunity.description.trim()) return

    try {
      setCreating(true)
      
      // Get current user's profile info to save with the opportunity
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('full_name, profile_picture_base64')
        .eq('id', user.id)
        .single()
      
      const { data: newOpp, error } = await supabase
        .from('opportunities')
        .insert({
          title: newOpportunity.title.trim(),
          description: newOpportunity.description.trim(),
          location: newOpportunity.location.trim() || null,
          opportunity_type: newOpportunity.opportunity_type,
          remote_friendly: newOpportunity.remote_friendly,
          compensation_type: newOpportunity.compensation_type || null,
          compensation_amount: newOpportunity.compensation_amount || null,
          required_skills: newOpportunity.required_skills.trim() || null,
          duration: newOpportunity.duration.trim() || null,
          application_deadline: newOpportunity.application_deadline || null,
          created_by: user.id,
          Creator: userProfile?.full_name || 'Anonymous User',
          Profile_picture: userProfile?.profile_picture_base64 || null
        })
        .select('*')
        .single()

      if (error) {
        console.error('Error creating opportunity:', error)
        return
      }

      setOpportunities(prev => [{
        ...newOpp,
        user_profiles: {
          full_name: newOpp.Creator || 'Anonymous User',
          profile_picture_base64: newOpp.Profile_picture || null
        },
        _count: { applications: 0 }
      } as Opportunity, ...prev])

      setNewOpportunity({
        title: "",
        description: "",
        opportunity_type: "internship",
        location: "",
        remote_friendly: false,
        compensation_type: "paid",
        compensation_amount: 0,
        required_skills: "",
        duration: "",
        application_deadline: ""
      })
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating opportunity:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleApplyClick = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity)
    setShowApplyModal(true)
  }

  const handleApplicationSubmitted = () => {
    // Optionally refresh opportunities list to update applicant count
    loadOpportunities()
  }

  const handleViewApplicationsClick = (opportunity: Opportunity) => {
    setSelectedOpportunityForApplications(opportunity)
    setShowApplicationsView(true)
  }

  // THEME: Facebook 2006 x LinkedIn
  // - Page bg: #f0f2f5
  // - Card border: #dfe3ee
  // - Accent/Primary: #0a66c2 (LinkedIn blue)
  // - Header chip: classic FB blue (#3b5998) with white wordmark strip

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <Header />

      {/* Page Header */}
      <div className="w-full border-b border-[#dfe3ee] bg-white/90">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-block bg-[#3b5998] text-white text-sm font-bold px-2 py-1 leading-none tracking-tight shadow-sm">opportunities</span>
              <h1 className="text-2xl font-bold text-[#1d2129]">Find your next move</h1>
            </div>
              <Button 
              className="hidden sm:inline-flex bg-[#0a66c2] hover:bg-[#004182] text-white"
                onClick={() => setShowCreateForm(!showCreateForm)}
              >
              <Plus className="w-4 h-4 mr-2" />
              Post Opportunity
              </Button>
            </div>
          </div>
      </div>

      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search & Mobile Create */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8d949e] w-5 h-5" />
            <Input 
              placeholder="Search opportunities..." 
              className="pl-10 bg-white border-[#ccd0d5] focus-visible:ring-[#0a66c2]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            className="sm:hidden bg-[#0a66c2] hover:bg-[#004182] text-white"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <Plus className="w-4 h-4" />
          </Button>
          </div>

        {/* Create Form */}
          {showCreateForm && (
          <Card className="mb-6 bg-white border-[#dfe3ee]">
            <CardHeader>
              <h3 className="text-lg font-semibold text-[#1d2129]">Create New Opportunity</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <LabeledInput 
                  label="Title" 
                      placeholder="e.g., Frontend Developer Intern"
                      value={newOpportunity.title}
                  onChange={(v) => setNewOpportunity(prev => ({ ...prev, title: v }))} 
                    />
                  <div>
                  <label className="text-sm font-medium text-[#606770] mb-1 block">Opportunity Type</label>
                  <select 
                    className="w-full px-3 py-2 border border-[#ccd0d5] rounded-md bg-white text-[#1d2129]"
                    value={newOpportunity.opportunity_type}
                    onChange={(e) => setNewOpportunity(prev => ({ ...prev, opportunity_type: e.target.value }))}
                  >
                    <option value="internship">Internship</option>
                    <option value="research">Research</option>
                    <option value="lab_assistant">Lab Assistant</option>
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                  </select>
                  </div>
                <LabeledInput 
                  label="Location" 
                      placeholder="e.g., San Francisco, CA"
                      value={newOpportunity.location}
                  onChange={(v) => setNewOpportunity(prev => ({ ...prev, location: v }))} 
                />
                <LabeledInput 
                  label="Duration" 
                      placeholder="e.g., 3 months"
                      value={newOpportunity.duration}
                  onChange={(v) => setNewOpportunity(prev => ({ ...prev, duration: v }))} 
                    />
                  <div>
                  <label className="text-sm font-medium text-[#606770] mb-1 block">Compensation Type</label>
                    <select 
                    className="w-full px-3 py-2 border border-[#ccd0d5] rounded-md bg-white text-[#1d2129]"
                      value={newOpportunity.compensation_type}
                      onChange={(e) => setNewOpportunity(prev => ({ ...prev, compensation_type: e.target.value }))}
                    >
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                      <option value="stipend">Stipend</option>
                    <option value="credit">Credit</option>
                    </select>
                  </div>
                <LabeledInput 
                      type="number"
                  label="Compensation Amount ($)" 
                      placeholder="e.g., 25"
                  value={String(newOpportunity.compensation_amount)} 
                  onChange={(v) => setNewOpportunity(prev => ({ ...prev, compensation_amount: parseFloat(v) || 0 }))} 
                />
              </div>

              <div className="mb-4">
                <LabeledInput 
                  label="Required Skills" 
                  placeholder="e.g., React, TypeScript, Node.js" 
                  value={newOpportunity.required_skills} 
                  onChange={(v) => setNewOpportunity(prev => ({ ...prev, required_skills: v }))} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-[#606770] mb-1 block">Application Deadline</label>
                  <input 
                    type="date"
                    className="w-full px-3 py-2 border border-[#ccd0d5] rounded-md bg-white text-[#1d2129]"
                    value={newOpportunity.application_deadline}
                    onChange={(e) => setNewOpportunity(prev => ({ ...prev, application_deadline: e.target.value }))}
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      checked={newOpportunity.remote_friendly}
                      onChange={(e) => setNewOpportunity(prev => ({ ...prev, remote_friendly: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-[#606770]">Remote Friendly</span>
                  </label>
                </div>
              </div>

                <div className="mb-4">
                <label className="text-sm font-medium text-[#606770] mb-1 block">Description</label>
                  <textarea 
                  className="w-full px-3 py-2 border border-[#ccd0d5] rounded-md h-28 bg-white text-[#1d2129] placeholder:text-[#8d949e]"
                    placeholder="Describe the opportunity, requirements, and benefits..."
                    value={newOpportunity.description}
                    onChange={(e) => setNewOpportunity(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

              <div className="flex justify-end gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateForm(false)}
                  className="border-[#ccd0d5] text-[#606770] hover:bg-[#f5f6f7]"
                  >
                    Cancel
                  </Button>
                  <Button 
                  className="bg-[#0a66c2] hover:bg-[#004182] text-white"
                    onClick={createOpportunity}
                    disabled={creating || !newOpportunity.title.trim() || !newOpportunity.description.trim()}
                  >
                    {creating ? "Creating..." : "Create Opportunity"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Opportunities List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a66c2] mx-auto"></div>
            <p className="mt-4 text-[#606770]">Loading opportunities...</p>
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <Card className="bg-white border-[#dfe3ee]">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-[#8d949e] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#1d2129] mb-2">No opportunities found</h3>
              <p className="text-[#606770] mb-6">Be the first to post an opportunity!</p>
                  <Button 
                className="bg-[#0a66c2] hover:bg-[#004182] text-white"
                onClick={() => setShowCreateForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Post Opportunity
                  </Button>
                </CardContent>
              </Card>
        ) : (
          <div className="space-y-4">
            {filteredOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="bg-white border-[#dfe3ee] hover:shadow-sm transition-shadow">
                <CardContent className="p-5">
                  {/* Profile section at top */}
                  <div className="flex items-center gap-3 mb-4">
                    <UserAvatar user={opportunity.user_profiles} size="md" />
                    <div>
                      <p className="font-semibold text-[#1d2129]">
                        {opportunity.user_profiles.full_name}
                      </p>
                      <p className="text-sm text-[#606770]">
                        Posted {formatDate(opportunity.created_at)}
                      </p>
            </div>
          </div>

                  {/* Opportunity information below */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-[#1d2129]">
                                {opportunity.title}
                              </h3>
                              {opportunity.remote_friendly && (
                        <Badge className="bg-[#e9ebf0] text-[#1d2129]">REMOTE</Badge>
                      )}
                      <Badge className="bg-[#f0f2f5] text-[#1d2129] capitalize">
                        {opportunity.opportunity_type.replace('_', ' ')}
                                </Badge>
                            </div>
                    
                    <p className="text-[#1d2129] mb-3">{opportunity.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#606770] mb-3">
                              {opportunity.location && (
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {opportunity.location}
                                </div>
                              )}
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {opportunity.duration || "Not specified"}
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="w-4 h-4 mr-1" />
                        {getSalaryDisplay(opportunity.compensation_type || 'paid', opportunity.compensation_amount || 0)}
                              </div>
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                        {opportunity.applicants_count || 0} applicants
                              </div>
                            </div>
                    
                            {opportunity.required_skills && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {opportunity.required_skills.split(',').map((skill) => (
                          <Badge key={skill.trim()} variant="outline" className="text-xs border-[#dfe3ee] text-[#606770] bg-white">
                                    {skill.trim()}
                                  </Badge>
                                ))}
                              </div>
                            )}
                                        
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#8d949e]">
                          {opportunity.applicants_count || 0} applicants
                        </span>
                        
                        {/* Show different buttons based on whether user created this opportunity */}
                        {user && opportunity.created_by === user.id ? (
                          <Button 
                            variant="outline"
                            className="border-[#0a66c2] text-[#0a66c2] hover:bg-blue-50"
                            onClick={() => handleViewApplicationsClick(opportunity)}
                          >
                            View Applications ({opportunity.applicants_count || 0})
                          </Button>
                        ) : (
                          <Button 
                            className="bg-[#0a66c2] hover:bg-[#004182] text-white"
                            onClick={() => handleApplyClick(opportunity)}
                          >
                            Apply Now
                          </Button>
                        )}
                      </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
      </div>
      
            {/* Apply Modal */}
      {showApplyModal && selectedOpportunity && user && userProfile && (
        <ApplyModal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          opportunity={selectedOpportunity}
          user={user}
          userProfile={userProfile}
          onApplicationSubmitted={handleApplicationSubmitted}
        />
      )}
      
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

function LabeledInput({ label, placeholder, value, onChange, type = "text" }: { label: string; placeholder?: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-[#606770] mb-1 block">{label}</label>
      <Input 
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white border-[#ccd0d5] text-[#1d2129] placeholder:text-[#8d949e]"
      />
    </div>
  )
} 