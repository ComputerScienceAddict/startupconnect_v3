"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Header from "@/components/header"
import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Calendar as CalendarIcon, 
  Users, 
  DollarSign, 
  Video, 
  Star, 
  ChevronRight, 
  Plus,
  Tag,
  EyeOff,
  Sparkles
} from 'lucide-react'

interface Event {
  id: string
  title: string
  description: string
  start_at: string
  end_at: string | null
  all_day: boolean
  location: string | null
  is_virtual: boolean
  registration_url: string | null
  price_cents: number | null
  capacity: number | null
  visibility: 'public' | 'private' | 'unlisted'
  status: 'scheduled' | 'cancelled' | 'postponed'
  tags: string[] | null
  is_active: boolean
  created_at: string
  user_profiles: {
    full_name: string
    profile_picture_base64: string | null
  }
  _count?: {
    event_registrations: number
  }
}

export default function EventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterPrice, setFilterPrice] = useState("all")
  const [user, setUser] = useState<any>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start_at: "",
    location: "",
    is_virtual: false,
    price_cents: 0,
    tags: ""
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadEvents()
    getUser()
  }, [])

  const getUser = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      router.push('/login')
      return
    }
    setUser(user)
  }

  const loadEvents = async () => {
    try {
      setLoading(true)
      // First get events with user profiles
      const { data: eventsData, error } = await supabase
        .from('events')
        .select(`
          *,
          user_profiles!events_created_by_fkey (
            full_name,
            profile_picture_base64
          )
        `)
        .eq('is_active', true)
        .eq('visibility', 'public')
        .eq('status', 'scheduled')
        .gte('start_at', new Date().toISOString())
        .order('start_at', { ascending: true })

      if (error) {
        console.error('Error loading events:', error)
        return
      }

      // If we have events, get registration counts for each
      if (eventsData && eventsData.length > 0) {
        const eventIds = eventsData.map(event => event.id)
        
        // Get registration counts for all events
        const { data: registrationCounts } = await supabase
          .from('event_registrations')
          .select('event_id')
          .in('event_id', eventIds)

        // Create a map of event_id to count
        const countMap = new Map()
        if (registrationCounts) {
          registrationCounts.forEach(reg => {
            const current = countMap.get(reg.event_id) || 0
            countMap.set(reg.event_id, current + 1)
          })
        }

        // Add counts to events
        const eventsWithCounts = eventsData.map(event => ({
          ...event,
          _count: {
            event_registrations: countMap.get(event.id) || 0
          }
        }))

        setEvents(eventsWithCounts)
      } else {
        setEvents([])
      }
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    if (diffDays < 7) return `${diffDays} days from now`
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getPriceDisplay = (priceCents: number | null) => {
    if (!priceCents) return "Free"
    return `$${(priceCents / 100).toFixed(2)}`
  }

  const getEventTypeIcon = (isVirtual: boolean) => {
    return isVirtual ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />
  }

  const getEventTypeText = (isVirtual: boolean) => {
    return isVirtual ? "Virtual Event" : "In-Person"
  }

  const filteredEvents = events.filter(event => {
    const q = searchTerm.toLowerCase()
    const matchesSearch = event.title.toLowerCase().includes(q) ||
                         event.description?.toLowerCase().includes(q) ||
                         event.location?.toLowerCase().includes(q)
    const matchesType = filterType === "all" || 
                       (filterType === "virtual" && event.is_virtual) ||
                       (filterType === "in-person" && !event.is_virtual)
    const matchesPrice = filterPrice === "all" ||
                        (filterPrice === "free" && !event.price_cents) ||
                        (filterPrice === "paid" && !!event.price_cents)
    return matchesSearch && matchesType && matchesPrice
  })

  const createEvent = async () => {
    if (!user || !newEvent.title.trim() || !newEvent.description.trim() || !newEvent.start_at) return

    try {
      setCreating(true)
      
      const { data: newEvt, error } = await supabase
        .from('events')
        .insert({
          title: newEvent.title.trim(),
          description: newEvent.description.trim(),
          start_at: newEvent.start_at,
          location: newEvent.location.trim(),
          is_virtual: newEvent.is_virtual,
          price_cents: newEvent.price_cents * 100,
          tags: newEvent.tags ? newEvent.tags.split(',').map(tag => tag.trim()) : [],
          created_by: user.id,
          is_active: true,
          visibility: 'public',
          status: 'scheduled'
        })
        .select(`
          *,
          user_profiles!events_created_by_fkey (
            full_name,
            profile_picture_base64
          )
        `)
        .single()

      if (error) {
        console.error('Error creating event:', error)
        return
      }

      setEvents(prev => [{
        ...newEvt,
        _count: { event_registrations: 0 }
      }, ...prev])

      setNewEvent({
        title: "",
        description: "",
        start_at: "",
        location: "",
        is_virtual: false,
        price_cents: 0,
        tags: ""
      })
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating event:', error)
    } finally {
      setCreating(false)
    }
  }

  // THEME: FB06 x LinkedIn with extra flair
  // - Page bg: #f0f2f5
  // - Cards: white, border #dfe3ee, subtle shadow on hover
  // - Accents: #0a66c2 (buttons), FB-blue chip #3b5998
  // - Flair: hero banner, date pill, sparkle tag for featured

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <Header />

      {/* Top Bar with wordmark chip */}
      <div className="w-full border-b border-[#dfe3ee] bg-white/90">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-block bg-[#3b5998] text-white text-sm font-bold px-2 py-1 leading-none tracking-tight shadow-sm">events</span>
              <h1 className="text-2xl font-bold text-[#1d2129]">Happenings & Workshops</h1>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <Button 
                className="bg-[#0a66c2] hover:bg-[#004182] text-white"
                onClick={() => setShowCreateForm(!showCreateForm)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>
          </div>

          {/* Create Event Form */}
          {showCreateForm && (
            <Card className="mt-5 bg-white border-[#dfe3ee]">
              <CardContent className="p-6">
                <h3 className="font-semibold text-[#1d2129] mb-4">Create New Event</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <LabeledInput label="Event Title" placeholder="e.g., Startup Pitch Night" value={newEvent.title} onChange={(v) => setNewEvent(prev => ({ ...prev, title: v }))} />
                  <div>
                    <label className="text-sm font-medium text-[#606770] mb-1 block">Date & Time</label>
                    <Input 
                      type="datetime-local"
                      value={newEvent.start_at}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, start_at: e.target.value }))}
                      className="bg-white border-[#ccd0d5] text-[#1d2129]"
                    />
                  </div>
                  <LabeledInput label="Location" placeholder="e.g., San Francisco, CA" value={newEvent.location} onChange={(v) => setNewEvent(prev => ({ ...prev, location: v }))} />
                  <LabeledInput type="number" label="Price ($)" placeholder="0 for free" value={String(newEvent.price_cents)} onChange={(v) => setNewEvent(prev => ({ ...prev, price_cents: parseFloat(v) || 0 }))} />
                </div>
                <div className="mb-4">
                  <label className="text-sm font-medium text-[#606770] mb-1 block">Description</label>
                  <textarea 
                    className="w-full px-3 py-2 border border-[#ccd0d5] rounded-md h-24 bg-white text-[#1d2129] placeholder:text-[#8d949e]"
                    placeholder="Describe your event, what attendees can expect..."
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <LabeledInput label="Tags" placeholder="e.g., startup, networking, pitch (comma separated)" value={newEvent.tags} onChange={(v) => setNewEvent(prev => ({ ...prev, tags: v }))} />
                <div className="mt-4 flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      checked={newEvent.is_virtual}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, is_virtual: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-[#606770]">Virtual Event</span>
                  </label>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCreateForm(false)}
                      className="border-[#ccd0d5] text-[#606770] hover:bg-[#f5f6f7]"
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="bg-[#0a66c2] hover:bg-[#004182] text-white"
                      onClick={createEvent}
                      disabled={creating || !newEvent.title.trim() || !newEvent.description.trim() || !newEvent.start_at}
                    >
                      {creating ? "Creating..." : "Create Event"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Hero / Highlights */}
      <div className="bg-white border-b border-[#dfe3ee]">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-8">
              <Card className="bg-gradient-to-r from-[#eef1f6] to-white border-[#dfe3ee]">
                <CardContent className="p-5 flex items-center gap-4">
                  <Sparkles className="w-6 h-6 text-[#0a66c2]" />
                  <div className="flex-1">
                    <p className="text-sm text-[#606770]">Featured this week</p>
                    <h3 className="text-lg font-bold text-[#1d2129]">Pitch Nights, Founder Mixers & Design Sprints are heating up 🔥</h3>
                  </div>
                  <Button className="bg-[#0a66c2] hover:bg-[#004182] text-white">Explore</Button>
                </CardContent>
              </Card>
            </div>
            <div className="col-span-12 lg:col-span-4">
              <Card className="border-[#dfe3ee]">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-[#606770]" />
                    <span className="text-sm text-[#606770]">Events this month</span>
                  </div>
                  <span className="text-base font-bold text-[#1d2129]">{events.length}</span>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Filters strip */}
      <div className="bg-white border-b border-[#dfe3ee]">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8d949e] w-5 h-5" />
            <Input 
              placeholder="Search events, workshops, meetups..." 
              className="pl-10 h-10 bg-white border-[#ccd0d5] text-[#1d2129] placeholder:text-[#8d949e] focus-visible:ring-[#0a66c2]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <FilterChip active={filterType === 'all'} onClick={() => setFilterType('all')}>All</FilterChip>
          <FilterChip active={filterType === 'virtual'} onClick={() => setFilterType('virtual')}>Virtual</FilterChip>
          <FilterChip active={filterType === 'in-person'} onClick={() => setFilterType('in-person')}>In‑Person</FilterChip>
          <div className="ml-2" />
          <FilterChip active={filterPrice === 'all'} onClick={() => setFilterPrice('all')}>Any Price</FilterChip>
          <FilterChip active={filterPrice === 'free'} onClick={() => setFilterPrice('free')}>Free</FilterChip>
          <FilterChip active={filterPrice === 'paid'} onClick={() => setFilterPrice('paid')}>Paid</FilterChip>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left rail: quick facts */}
          <aside className="col-span-12 lg:col-span-3 space-y-4 lg:sticky lg:top-6 h-fit">
            <Card className="border-[#dfe3ee]">
              <CardHeader className="pb-2">
                <h3 className="font-semibold text-[#1d2129]">Quick Stats</h3>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-[#606770]">
                <div className="flex items-center justify-between"><span>Total events</span><span className="font-semibold text-[#1d2129]">{filteredEvents.length}</span></div>
                <div className="flex items-center justify-between"><span>Virtual</span><span className="font-semibold text-[#1d2129]">{events.filter(e => e.is_virtual).length}</span></div>
                <div className="flex items-center justify-between"><span>Free</span><span className="font-semibold text-[#1d2129]">{events.filter(e => !e.price_cents).length}</span></div>
              </CardContent>
            </Card>

            <Card className="border-[#dfe3ee]">
              <CardHeader className="pb-2">
                <h3 className="font-semibold text-[#1d2129]">Tips</h3>
              </CardHeader>
              <CardContent className="text-sm text-[#606770]">
                Use the filters to narrow down to free, virtual, or in‑person events.
              </CardContent>
            </Card>
          </aside>

          {/* Events list */}
          <section className="col-span-12 lg:col-span-9">
            {loading ? (
              <div className="grid grid-cols-1 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="border-[#dfe3ee]">
                    <CardContent className="p-5">
                      <div className="animate-pulse">
                        <div className="h-5 bg-[#e9ebf0] rounded mb-3"></div>
                        <div className="h-3.5 bg-[#e9ebf0] rounded mb-2"></div>
                        <div className="h-3.5 bg-[#e9ebf0] rounded w-3/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="w-16 h-16 text-[#ccd0d5] mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-[#1d2129] mb-1">No events found</h3>
                <p className="text-[#606770]">Try changing your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredEvents.map((event) => (
                  <Card key={event.id} className="bg-white border-[#dfe3ee] hover:shadow-sm transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        {/* Date pill */}
                        <div className="hidden sm:flex flex-col items-center justify-center w-16 shrink-0 rounded-lg border border-[#dfe3ee] bg-[#f7f8fa]">
                          <div className="text-xs text-[#8d949e]">{new Date(event.start_at).toLocaleString('en-US', { month: 'short' }).toUpperCase()}</div>
                          <div className="text-2xl font-extrabold leading-none text-[#1d2129]">{new Date(event.start_at).getDate()}</div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-bold text-[#1d2129]">{event.title}</h3>
                                {event.visibility === 'private' && (
                                  <Badge className="bg-[#e9ebf0] text-[#1d2129]">PRIVATE</Badge>
                                )}
                                {event.tags?.includes('featured') && (
                                  <Badge className="bg-[#fff7e6] text-[#8a5a00]"><Sparkles className="w-3 h-3 mr-1"/>Featured</Badge>
                                )}
                              </div>
                              <p className="text-[15px] font-semibold text-[#1d2129]/80">{event.user_profiles.full_name}</p>
                            </div>
                            <UserAvatar user={event.user_profiles} size="md" />
                          </div>

                          <p className="text-[#1d2129] mt-2">{event.description}</p>

                          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#606770] mt-3">
                            <div className="flex items-center"><Clock className="w-4 h-4 mr-1" />{formatDate(event.start_at)} • {formatTime(event.start_at)}</div>
                            <div className="flex items-center">{getEventTypeIcon(event.is_virtual)}<span className="ml-1">{getEventTypeText(event.is_virtual)}</span></div>
                            {event.location && (
                              <div className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{event.location}</div>
                            )}
                            <div className="flex items-center"><DollarSign className="w-4 h-4 mr-1" />{getPriceDisplay(event.price_cents)}</div>
                            {event.capacity && (
                              <div className="flex items-center"><Users className="w-4 h-4 mr-1" />{event._count?.event_registrations || 0}/{event.capacity} registered</div>
                            )}
                          </div>

                          {event.tags && event.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {event.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs border-[#dfe3ee] text-[#606770] bg-white"><Tag className="w-3 h-3 mr-1" />{tag}</Badge>
                              ))}
                            </div>
                          )}

                          <Separator className="my-4 bg-[#e6e9ef]" />

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-sm text-[#8d949e]">
                              <span>Created {formatDate(event.created_at)}</span>
                              <span>•</span>
                              <span className="flex items-center"><Star className="w-4 h-4 mr-1" />{event._count?.event_registrations || 0} registrations</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" className="border-[#dfe3ee] text-[#1d2129] hover:bg-[#f5f6f7]">Learn More</Button>
                              <Button className="bg-[#0a66c2] hover:bg-[#004182] text-white">Register</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Load More */}
            {filteredEvents.length > 0 && (
              <div className="text-center mt-8">
                <Button variant="outline" className="border-[#dfe3ee] text-[#1d2129] hover:bg-[#f5f6f7] px-8 py-3">
                  Load More Events
                </Button>
              </div>
            )}
          </section>
        </div>
      </div>
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

function FilterChip({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className={active ? "bg-[#0a66c2] text-white hover:bg-[#004182]" : "border-[#ccd0d5] text-[#1d2129] hover:bg-[#f5f6f7]"}
    >
      {children}
    </Button>
  )
}
