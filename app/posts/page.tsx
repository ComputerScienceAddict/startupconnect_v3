"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Header from "@/components/header"
import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Rocket,
  MoreHorizontal,
  ThumbsUp,
  MessageCircle,
  Share,
  Bookmark,
  Calendar,
  Users2,
  Building2,
  Zap,
  Video,
  Image as ImageIcon,
  FileText,
  Send,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Post {
  id: string
  title: string
  content: string
  user_id: string
  is_active: boolean
  created_at: string
  user_profiles: {
    full_name: string
    profile_picture_base64: string | null
  }
  likes?: number
}

interface Opportunity {
  id: string
  title: string
  company_name: string
  compensation_amount: number
  compensation_type: string
  created_at: string
  user_profiles: {
    full_name: string
  }[]
  _count?: {
    applications: number
  }
}

interface Event {
  id: string
  title: string
  start_at: string
  price_cents: number | null
  is_virtual: boolean
  created_at: string
  user_profiles: {
    full_name: string
  }[]
  _count?: {
    event_registrations: number
  }
}

export default function PostsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [newPostTitle, setNewPostTitle] = useState("")
  const [newPostContent, setNewPostContent] = useState("")
  const [creatingPost, setCreatingPost] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
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

      // Load posts
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(
          `*, user_profiles!inner(
            id, full_name, profile_picture_base64
          )`
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (postsError) {
        console.error("Error loading posts:", postsError)
        setPosts([])
      } else {
        // Get like counts for all posts
        const { data: likeCounts } = await supabase
          .from("likes")
          .select("post_id")
          .in("post_id", postsData?.map(p => p.id) || [])

        const likeCountMap = new Map<string, number>()
        likeCounts?.forEach((like: { post_id: string }) => {
          likeCountMap.set(like.post_id, (likeCountMap.get(like.post_id) || 0) + 1)
        })

        const postsWithLikes = postsData?.map(post => ({
          ...post,
          likes: likeCountMap.get(post.id) || 0
        })) || []

        setPosts(postsWithLikes)
      }

      // Load user's liked posts
      const { data: likedPostsData } = await supabase
        .from("likes")
        .select("post_id")
        .eq("user_id", user.id)
      const likedPostIds = new Set(likedPostsData?.map(like => like.post_id) || [])
      setLikedPosts(likedPostIds)

      // Load opportunities (latest)
      try {
        const { data: opportunitiesData } = await supabase
          .from('opportunities')
          .select(`
            id,
            title,
            company_name,
            compensation_amount,
            compensation_type,
            created_at,
            user_profiles!opportunities_user_id_fkey (
              full_name
            )
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(3)

        setOpportunities(opportunitiesData || [])
      } catch (error) {
        console.error('Error loading opportunities:', error)
        setOpportunities([])
      }

      // Load events (upcoming)
      try {
        const { data: eventsData } = await supabase
          .from('events')
          .select(`
            id,
            title,
            start_at,
            price_cents,
            is_virtual,
            created_at,
            user_profiles!events_created_by_fkey (
              full_name
            )
          `)
          .eq('is_active', true)
          .eq('visibility', 'public')
          .eq('status', 'scheduled')
          .gte('start_at', new Date().toISOString())
          .order('start_at', { ascending: true })
          .limit(3)

        setEvents(eventsData || [])
      } catch (error) {
        console.error('Error loading events:', error)
        setEvents([])
      }

    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const createPost = async () => {
    if (!user || !newPostTitle.trim() || !newPostContent.trim()) return

    try {
      setCreatingPost(true)
      const { data: newPost, error } = await supabase
        .from('posts')
        .insert({
          title: newPostTitle.trim(),
          content: newPostContent.trim(),
          user_id: user.id,
          is_active: true
        })
        .select(`
          *, user_profiles!inner(
            id, full_name, profile_picture_base64
          )
        `)
        .single()

      if (error) {
        console.error('Error creating post:', error)
        return
      }

      setPosts(prev => [{
        ...newPost,
        likes: 0
      }, ...prev])

      setNewPostTitle("")
      setNewPostContent("")
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setCreatingPost(false)
    }
  }

  const handleLike = async (postId: string) => {
    try {
      if (!user) return
      const isLiked = likedPosts.has(postId)
      setLikedPosts((prev) => {
        const s = new Set(prev)
        isLiked ? s.delete(postId) : s.add(postId)
        return s
      })
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likes: Math.max(0, (p.likes || 0) + (isLiked ? -1 : 1)) } : p
        )
      )
      if (isLiked) {
        await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", user.id)
      } else {
        await supabase.from("likes").insert({ post_id: postId, user_id: user.id })
      }
    } catch (error) {
      console.error("Error handling like:", error)
      setLikedPosts((prev) => {
        const s = new Set(prev)
        const isLiked = s.has(postId)
        if (isLiked) {
          s.delete(postId)
        } else {
          s.add(postId)
        }
        return s
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    if (diffHours < 1) return "Just now"
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    if (diffDays < 7) return `${diffDays} days from now`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getAccountTypeDisplay = (accountType?: string) => {
    switch (accountType) {
      case "student":
        return "Student"
      case "graduate":
        return "Graduate"
      case "founder":
        return "Founder"
      case "company":
        return "Company"
      default:
        return "User"
    }
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

  const getPriceDisplay = (priceCents: number | null) => {
    if (!priceCents) return "Free"
    return `$${(priceCents / 100).toFixed(2)}`
  }

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch = post.title.toLowerCase().includes(q) || post.content.toLowerCase().includes(q)
      return matchesSearch
    })
  }, [posts, searchQuery])

  const topLikedPosts = useMemo(() => {
    return posts
      .filter(post => post.likes && post.likes > 0)
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 5)
  }, [posts])

  const userPosts = useMemo(() => {
    return posts.filter(post => post.user_id === user?.id)
  }, [posts, user])

  // THEME: Old Facebook (2006) x LinkedIn hybrid
  // - Page bg: soft gray (#f0f2f5)
  // - Modules: white cards with subtle borders (#dfe3ee) and faint shadow
  // - Primary action: LinkedIn blue (#0a66c2)
  // - Headings: near-black (#1d2129)
  // - Links/hover: darker blue and underlines on hover

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <Header />

      <main className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <aside className="col-span-12 md:col-span-3 lg:sticky lg:top-6 h-fit space-y-4">
            {/* Profile Card */}
            <MonoCard>
              <div className="relative">
                <div className="h-20 bg-[#dfe3ee] rounded-t-lg"></div>
                <UserAvatar user={userProfile} size="lg" className="absolute -bottom-8 left-1/2 -translate-x-1/2 border-4 border-white" />
              </div>
              <div className="pt-10 text-center">
                <h3 className="font-bold text-base text-[#1d2129]">{userProfile?.full_name || "User"}</h3>
                <p className="text-xs text-[#606770] mb-1">{getAccountTypeDisplay(userProfile?.account_type)}</p>
                {userProfile?.school && (
                  <p className="text-[11px] text-[#8d949e] mb-3">{userProfile.school}</p>
                )}
                <Badge className="bg-[#e9ebf0] text-[#1d2129] text-[10px] font-semibold rounded-full px-2 py-0.5">
                  {userPosts.length} POSTS
                </Badge>
              </div>
              <Separator className="my-4 bg-[#e6e9ef]" />
              <div className="space-y-3">
                <InfoRow 
                  icon={<Users2 className="w-4 h-4 text-[#606770]" />} 
                  label="People Joined" 
                  value={userPosts.length.toString()} 
                />
                <InfoRow 
                  icon={<Zap className="w-4 h-4 text-[#606770]" />} 
                  label="Active Applications" 
                  value="12" 
                />
              </div>
            </MonoCard>

            {/* Quick Actions */}
            <MonoCard>
              <div className="space-y-0">
                <SidebarAction icon={<Video className="w-4 h-4" />} label="Share Video" />
                <SidebarAction icon={<ImageIcon className="w-4 h-4" />} label="Share Photo" />
                <SidebarAction icon={<FileText className="w-4 h-4" />} label="Write Article" />
                <SidebarAction icon={<Rocket className="w-4 h-4" />} label="Post Opportunity" last />
              </div>
            </MonoCard>
          </aside>

          {/* Main Feed */}
          <div className="col-span-12 md:col-span-6">
            {/* Create Post */}
            <MonoCard>
              <div className="flex items-center gap-3 mb-4">
                <UserAvatar user={userProfile} size="md" />
                <div className="flex-1 space-y-2">
                  <Input 
                    placeholder="Post title..." 
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    className="flex-1 border-[#ccd0d5] focus-visible:ring-[#0a66c2]"
                  />
                  <Input 
                    placeholder="Share your startup journey, ask questions..." 
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="flex-1 border-[#ccd0d5] focus-visible:ring-[#0a66c2]"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  <MutedButton icon={<Video className="w-4 h-4" />}>Video</MutedButton>
                  <MutedButton icon={<ImageIcon className="w-4 h-4" />}>Photo</MutedButton>
                  <MutedButton icon={<FileText className="w-4 h-4" />}>Article</MutedButton>
                </div>
                <Button 
                  size="sm" 
                  className="bg-[#0a66c2] hover:bg-[#004182] text-white"
                  onClick={createPost}
                  disabled={creatingPost || !newPostTitle.trim() || !newPostContent.trim()}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {creatingPost ? "Posting..." : "Post"}
                </Button>
              </div>
            </MonoCard>

            {/* Posts Feed */}
            <div className="space-y-4 mt-4">
              <AnimatePresence>
                {loading ? (
                  [...Array(2)].map((_, i) => <PostSkeleton key={i} />)
                ) : filteredPosts.length ? (
                  filteredPosts.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                    >
                      <PostCard
                        post={post}
                        liked={likedPosts.has(post.id)}
                        onLike={() => handleLike(post.id)}
                        onApply={() => {}}
                        formatDate={formatDate}
                      />
                    </motion.div>
                  ))
                ) : (
                  <EmptyState />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="col-span-12 md:col-span-3 lg:sticky lg:top-6 h-fit space-y-4">
            {/* Startup Pulse */}
            <MonoCard>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[#1d2129]">Startup Pulse</h3>
                <Button variant="ghost" size="sm" className="text-[#606770] hover:text-[#1d2129]">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {topLikedPosts.length > 0 ? (
                  topLikedPosts.map((post) => (
                    <div key={post.id} className="cursor-pointer hover:bg-[#f5f6f7] p-2 rounded-lg transition-colors">
                      <h4 className="font-medium text-sm text-[#1d2129] line-clamp-2">{post.title}</h4>
                      <p className="text-[11px] text-[#606770] mt-1">{formatDate(post.created_at)}</p>
                      <p className="text-[11px] text-[#8d949e]">{post.user_profiles.full_name}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-[#606770]">No popular posts yet</p>
                  </div>
                )}
              </div>
            </MonoCard>

            {/* Hot Opportunities */}
            <MonoCard>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-[#606770]" />
                <h3 className="font-semibold text-[#1d2129]">Hot Opportunities</h3>
              </div>
              <div className="space-y-2">
                {opportunities.length > 0 ? (
                  opportunities.map((opportunity) => (
                    <div key={opportunity.id} className="p-3 bg-[#f5f6f7] rounded-lg cursor-pointer hover:bg-[#eef1f4] transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-[#1d2129] line-clamp-1">{opportunity.title}</h4>
                          <p className="text-[11px] text-[#606770] mt-1">
                            {opportunity.company_name || opportunity.user_profiles[0]?.full_name} • {getSalaryDisplay(opportunity.compensation_type, opportunity.compensation_amount)}
                          </p>
                        </div>
                        <Badge className="text-[10px] bg-[#e9ebf0] text-[#1d2129] ml-2">
                          {opportunity._count?.applications || 0} apps
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-[#606770]">No opportunities right now</p>
                  </div>
                )}
              </div>
            </MonoCard>

            {/* Upcoming Events */}
            <MonoCard>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-[#606770]" />
                <h3 className="font-semibold text-[#1d2129]">Upcoming Events</h3>
              </div>
              <div className="space-y-2">
                {events.length > 0 ? (
                  events.map((event) => (
                    <div key={event.id} className="p-3 bg-[#f5f6f7] rounded-lg cursor-pointer hover:bg-[#eef1f4] transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-[#1d2129] line-clamp-1">{event.title}</h4>
                          <p className="text-[11px] text-[#606770] mt-1">
                            {formatEventDate(event.start_at)} • {getPriceDisplay(event.price_cents)}
                          </p>
                        </div>
                        <Badge className="text-[10px] bg-[#e9ebf0] text-[#1d2129] ml-2">
                          {event.is_virtual ? "VIRTUAL" : "IN-PERSON"}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-[#606770]">No upcoming events</p>
                  </div>
                )}
              </div>
            </MonoCard>
          </aside>
        </div>
      </main>
    </div>
  )
}

// Helper Components
function MonoCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="border-[#dfe3ee] shadow-sm bg-white rounded-lg">
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#606770] flex items-center">
        {icon}
        <span className="ml-2">{label}</span>
      </span>
      <span className="font-semibold text-[#1d2129]">{value}</span>
    </div>
  )
}

function SidebarAction({ icon, label, last }: { icon: React.ReactNode; label: string; last?: boolean }) {
  return (
    <Button variant="ghost" className="w-full justify-start text-[#1d2129] hover:bg-[#f5f6f7] h-10">
      {icon}
      <span className="ml-3 text-sm">{label}</span>
    </Button>
  )
}

function MutedButton({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Button variant="ghost" size="sm" className="text-[#606770] hover:text-[#1d2129] hover:bg-[#f5f6f7]">
      {icon}
      <span className="ml-2">{children}</span>
    </Button>
  )
}

function PostSkeleton() {
  return (
    <MonoCard>
      <div className="animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#e9ebf0] rounded-full"></div>
          <div className="flex-1">
            <div className="h-3.5 bg-[#e9ebf0] rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-[#e9ebf0] rounded w-1/4"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3.5 bg-[#e9ebf0] rounded"></div>
          <div className="h-3.5 bg-[#e9ebf0] rounded w-3/4"></div>
        </div>
      </div>
    </MonoCard>
  )
}

function PostCard({
  post,
  liked,
  onLike,
  onApply,
  formatDate,
}: {
  post: Post
  liked: boolean
  onLike: () => void
  onApply: () => void
  formatDate: (d: string) => string
}) {
  return (
    <MonoCard>
      <div className="flex items-start gap-3 mb-3">
        <UserAvatar user={post.user_profiles} size="md" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-[#1d2129]">{post.user_profiles.full_name}</h4>
            <span className="text-sm text-[#8d949e]">•</span>
            <span className="text-sm text-[#8d949e]">{formatDate(post.created_at)}</span>
          </div>
          <h3 className="font-bold text-base text-[#1d2129] mb-1">{post.title}</h3>
          <p className="text-[#1d2129] text-[15px] leading-relaxed">{post.content}</p>
        </div>
        <Button variant="ghost" size="sm" className="text-[#606770] hover:text-[#1d2129]">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      <Separator className="mb-3 bg-[#e6e9ef]" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ActionButton 
            icon={<ThumbsUp className="w-4 h-4" />}
            active={liked}
            onClick={onLike}
          >
            {post.likes || 0}
          </ActionButton>
          <ActionButton icon={<MessageCircle className="w-4 h-4" />}>
            Comment
          </ActionButton>
          <ActionButton icon={<Share className="w-4 h-4" />}>
            Share
          </ActionButton>
        </div>
        <ActionButton icon={<Bookmark className="w-4 h-4" />}>
          Save
        </ActionButton>
      </div>
    </MonoCard>
  )
}

function ActionButton({
  children,
  icon,
  active,
  onClick,
}: {
  children: React.ReactNode
  icon: React.ReactNode
  active?: boolean
  onClick?: () => void
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`text-[#606770] hover:text-[#1d2129] hover:bg-[#f5f6f7] ${active ? "text-[#0a66c2]" : ""}`}
    >
      {icon}
      <span className="ml-2">{children}</span>
    </Button>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-10">
      <div className="text-[#ccd0d5] mb-3">
        <Search className="w-14 h-14 mx-auto" />
      </div>
      <h3 className="text-lg font-bold text-[#1d2129] mb-1">No posts found</h3>
      <p className="text-[#606770] text-sm">Try adjusting your search criteria</p>
    </div>
  )
}

function getPriceDisplay(priceCents: number | null) {
  if (!priceCents) return "Free"
  return `$${(priceCents / 100).toFixed(2)}`
}
