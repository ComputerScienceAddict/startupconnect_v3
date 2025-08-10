import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Network, Users, Target, Award } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#3b5998] text-white">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Network className="w-6 h-6" />
            <span className="text-xl font-bold">startupconnect</span>
          </div>
          <nav className="flex items-center space-x-4 text-sm">
            <Link href="/login" className="hover:underline">
              login
            </Link>
            <Link href="/register" className="hover:underline">
              register
            </Link>
            <Link href="/about" className="hover:underline">
              about
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">About StartupConnect</h1>
          <p className="text-xl text-gray-600">
            Connecting ambitious students with innovative startups for meaningful opportunities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="border border-gray-300">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-800">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                StartupConnect bridges the gap between talented students and innovative startups. 
                We believe that the best opportunities come from connecting ambitious minds with 
                groundbreaking companies that are shaping the future.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-300">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-800">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                To become the premier platform for student-startup connections, fostering 
                meaningful relationships that drive innovation and create lasting career opportunities 
                in the startup ecosystem.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="text-center">
            <Users className="w-12 h-12 text-[#3b5998] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">For Students</h3>
            <p className="text-gray-600">
              Discover internship opportunities, research positions, and mentorship from 
              innovative startups across all industries.
            </p>
          </div>

          <div className="text-center">
            <Target className="w-12 h-12 text-[#3b5998] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">For Startups</h3>
            <p className="text-gray-600">
              Find talented students who are passionate about your mission and ready to 
              contribute to your company's growth.
            </p>
          </div>

          <div className="text-center">
            <Award className="w-12 h-12 text-[#3b5998] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">For Universities</h3>
            <p className="text-gray-600">
              Connect your students with real-world opportunities that enhance their 
              education and career prospects.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-300 p-8 rounded-lg mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Why Choose StartupConnect?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Curated Opportunities</h3>
              <p className="text-gray-600 mb-4">
                We carefully vet all opportunities to ensure they provide meaningful learning 
                experiences and career growth.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Direct Connections</h3>
              <p className="text-gray-600 mb-4">
                Connect directly with founders and hiring managers, bypassing traditional 
                application processes.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Skill Matching</h3>
              <p className="text-gray-600 mb-4">
                Our platform matches students with opportunities that align with their 
                skills, interests, and career goals.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Community Support</h3>
              <p className="text-gray-600 mb-4">
                Join a community of like-minded students and professionals who are 
                passionate about innovation and growth.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-6">
            Join thousands of students and startups already using StartupConnect.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/register">
              <Button className="bg-[#3b5998] hover:bg-[#2d4373] text-white px-8 py-2">
                Register Now
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="border-[#3b5998] text-[#3b5998] hover:bg-[#3b5998] hover:text-white px-8 py-2">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-300 bg-gray-50 py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center space-x-4 text-sm text-[#3b5998] mb-2">
            <Link href="/about" className="hover:underline">
              about
            </Link>
            <Link href="/contact" className="hover:underline">
              contact
            </Link>
            <Link href="/faq" className="hover:underline">
              faq
            </Link>
            <Link href="/terms" className="hover:underline">
              terms
            </Link>
            <Link href="/privacy" className="hover:underline">
              privacy
            </Link>
          </div>
          <div className="text-xs text-gray-600">
            <div>a startup innovation</div>
            <div>StartupConnect © 2024</div>
          </div>
        </div>
      </footer>
    </div>
  )
} 