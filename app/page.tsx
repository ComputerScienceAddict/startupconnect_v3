"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [stats, setStats] = useState({
    students: 0,
    startups: 0,
    opportunities: 0,
    universities: 0
  })
  const router = useRouter()

  // Fetch stats from Supabase
  const fetchStats = async () => {
    try {
      // Get total users count - much simpler!
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      setStats({
        students: totalUsers || 0,
        startups: totalUsers || 0,
        opportunities: 0,
        universities: 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  // Fetch stats on component mount
  useEffect(() => {
    fetchStats()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError("Invalid email or password. Please try again.")
      } else if (data.user) {
        // Get user profile to determine redirect
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('account_type')
          .eq('id', data.user.id)
          .single()

        // Redirect to main dashboard for all users
        router.push("/dashboard")
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div id="book" className="book">
      <div id="pageheader" className="pageheader">
        <h1 id="homelink">
          <Link href="/">[StartupConnect]</Link>
        </h1>
        <ul id="gnav" className="gnav">
          <li>
            <Link href="/login">login</Link>
          </li>
          <li>
            <Link href="/register">register</Link>
          </li>
          <li>
            <Link href="/help">help</Link>
          </li>
        </ul>
      </div>

      <div id="sidebar" className="sidebar">
        <ol id="nav" className="nav">
          <li>
            <Link href="/">Main</Link>
          </li>
          <li>
            <Link href="/login">Login</Link>
          </li>
          <li>
            <Link href="/register">Register</Link>
          </li>
        </ol>
        <div id="ssponsor" className="sponsors">
          <img 
            src="/ascii-art.png" 
            alt="StartupConnect ASCII Art" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              display: 'block'
            }}
          />
        </div>
      </div>

      <div id="pagebody" className="pagebody">
        <div id="header" className="content-header">
          <h1>Login</h1>
        </div>

        <div id="content" className="content">
          {error && (
            <div style={{ color: 'red', fontSize: '11px', marginBottom: '10px' }}>
              {error}
            </div>
          )}

          <form method="post" onSubmit={handleLogin}>
            <input type="hidden" name="page" value="" />
            <input type="hidden" name="next" value="" />

            <div id="loginform" className="loginform">
              <table className="formtable" border={0} cellSpacing={0}>
                <tbody>
                  <tr>
                    <td className="label">Email:</td>
                    <td>
                      <input 
                        type="text" 
                        id="email" 
                        className="inputtext" 
                        name="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        size={30}
                        required
                        disabled={loading}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="label">Password:</td>
                    <td>
                      <input
                        type="password"
                        id="pass"
                        name="pass"
                        className="inputpassword"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        size={30}
                        required
                        disabled={loading}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="formbuttons">
                <input 
                  type="submit" 
                  id="login" 
                  name="login" 
                  className="inputsubmit" 
                  value={loading ? "Logging in..." : "Login"}
                  disabled={loading}
                />
                <Link href="/register">
                  <input type="button" id="register" name="register" className="inputbutton" value="Register" />
                </Link>
                <div className="securetoggle">
                  <Link href="/?secure=1">Secure</Link> | <b>Standard</b>
                </div>
              </div>

              <p>
                If you have forgotten your password, click{" "}
                <b>
                  <Link href="/reset">here</Link>
                </b>{" "}
                to reset it.
              </p>
            </div>
          </form>

          {/* Welcome Content */}
          <div style={{ marginTop: '20px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#3b5998', marginBottom: '10px' }}>
              [ Welcome to StartupConnect ]
            </h2>
            <p style={{ fontSize: '11px', color: '#666666', lineHeight: '1.4', marginBottom: '10px' }}>
              StartupConnect is a social network that connects ambitious college students with groundbreaking
              internship and research opportunities at innovative startups.
            </p>
            <p style={{ fontSize: '11px', color: '#666666', lineHeight: '1.4', marginBottom: '10px' }}>
              We have opened up StartupConnect for students at <strong>universities nationwide</strong>.
            </p>
            <p style={{ fontSize: '11px', color: '#666666', lineHeight: '1.4', marginBottom: '5px' }}>You can use StartupConnect to:</p>
            <ul style={{ fontSize: '11px', color: '#666666', lineHeight: '1.4', marginLeft: '20px', marginBottom: '10px' }}>
              <li>Search for internship opportunities at innovative startups</li>
              <li>Connect with other ambitious students at your school</li>
              <li>Find mentors and industry professionals</li>
              <li>Discover research opportunities that match your interests</li>
              <li>Build your professional network before graduation</li>
            </ul>
          </div>
        </div>

        <div id="pagefooter" className="pagefooter">
          <ul id="fnav" className="fnav">
            <li>
              <Link href="/about">about</Link>
            </li>
            <li>
              <Link href="/contact">contact</Link>
            </li>
            <li>
              <Link href="/jobs">jobs</Link>
            </li>
            <li>
              <Link href="/advertise">advertise</Link>
            </li>
            <li>
              <Link href="/terms">terms</Link>
            </li>
            <li>
              <Link href="/privacy">privacy</Link>
            </li>
          </ul>
          <p>a Juarez-kazakuzi production</p>
          <p>StartupConnect © 2024</p>
        </div>
      </div>

      <div className="sponsors bottom-sponsors"></div>
    </div>
  )
}
