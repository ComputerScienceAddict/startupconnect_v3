"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"

export default function RegisterPage() {
  const [accountType, setAccountType] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  // Pre-select account type based on URL parameter
  useEffect(() => {
    const type = searchParams.get('type')
    if (type === 'student') {
      setAccountType('student')
    } else if (type === 'founder') {
      setAccountType('founder')
    } else {
      // Default to student for general signup
      setAccountType('student')
    }
  }, [searchParams])

  // Comprehensive form data state
  const [formData, setFormData] = useState({
    // Basic Information
    firstname: "",
    lastname: "",
    email: "",
    email2: "",
    password: "",
    phone: "",
    location: "",
    
    // Academic Information (for students)
    university: "",
    graduation_year: "",
    gpa: "",
    majors: "",
    minors: "",
    
    // Company Information (for founders/companies)
    company_name: "",
    industry: "",
    
    // Skills & Interests
    skills: "",
    bio: "",
    
    // Contact & Links
    github: "",
    website: "",
    portfolio: "",
    
    // Classic Facebook-style fields
    political_views: "",
    interests: "",
    favorite_music: "",
    favorite_tv: "",
    favorite_movies: "",
    favorite_quotes: "",
    
    // Account Type
    account_type: "student"
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validate email match
    if (formData.email !== formData.email2) {
      setError("Email addresses do not match")
      setLoading(false)
      return
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setLoading(false)
      return
    }

    // Validate GPA if provided
    if (formData.gpa && (parseFloat(formData.gpa) < 0 || parseFloat(formData.gpa) > 4)) {
      setError("GPA must be between 0 and 4")
      setLoading(false)
      return
    }

    // Validate graduation year if provided
    if (formData.graduation_year) {
      const currentYear = new Date().getFullYear()
      const gradYear = parseInt(formData.graduation_year)
      if (gradYear < currentYear - 10 || gradYear > currentYear + 10) {
        setError("Graduation year seems invalid. Please check and try again.")
        setLoading(false)
        return
      }
    }

    try {
      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: `${formData.firstname} ${formData.lastname}`,
            account_type: accountType || 'student'
          }
        }
      })

      if (authError) {
        setError(authError.message)
        return
      }

      if (authData.user) {
        // Insert comprehensive user data into our user_profiles table
        const userData = {
          id: authData.user.id,
          email: formData.email,
          full_name: `${formData.firstname} ${formData.lastname}`,
          account_type: accountType || 'student',
          
          // Contact Information
          phone: formData.phone || null,
          location: formData.location || null,
          
          // Academic Information
          university: formData.university || null,
          graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
          gpa: formData.gpa ? parseFloat(formData.gpa) : null,
          majors: formData.majors || null,
          minors: formData.minors || null,
          
          // Company Information
          company_name: formData.company_name || null,
          industry: formData.industry || null,
          
          // Skills & Bio
          skills: formData.skills || null,
          bio: formData.bio || null,
          
          // Links
          github: formData.github || null,
          website: formData.website || null,
          portfolio: formData.portfolio || null,
          
          // Classic Facebook fields
          political_views: formData.political_views || null,
          interests: formData.interests || null,
          favorite_music: formData.favorite_music || null,
          favorite_tv: formData.favorite_tv || null,
          favorite_movies: formData.favorite_movies || null,
          favorite_quotes: formData.favorite_quotes || null,
          status: null,
          
          // Initialize empty arrays
          posts: [],
          connections: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { error: profileError, data: profileData } = await supabase
          .from('user_profiles')
          .insert(userData)
          .select()

        if (profileError) {
          console.error('Profile creation error:', profileError)
          setError("Account created but profile setup failed. Please complete your profile later.")
        } else {
          console.log('Profile created successfully:', profileData)
          
          // Sign in the user immediately after successful registration
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password
          })

          if (signInError) {
            console.error('Auto sign-in error:', signInError)
            setError("Account created successfully! Please sign in manually.")
            router.push("/login")
          } else {
            // Redirect to main dashboard for all users
            router.push("/dashboard")
          }
        }
      }
    } catch (error) {
      setError("An unexpected error occurred during registration")
      console.error('Registration error:', error)
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
          <h1>Sign Up</h1>
          <p>It's free and anyone can join</p>
        </div>

        <div id="content" className="content">
          {error && (
            <div style={{ color: 'red', fontSize: '11px', marginBottom: '10px' }}>
              {error}
            </div>
          )}

          <form method="post" onSubmit={handleSubmit}>
            <div id="registerform" className="registerform">
              <table className="formtable" border={0} cellSpacing={0}>
                <tbody>
                  {/* Basic Information */}
                  <tr>
                    <td colSpan={2} style={{ fontWeight: 'bold', paddingTop: '20px', paddingBottom: '10px' }}>
                      Basic Information
                    </td>
                  </tr>
                  <tr>
                    <td className="label">First Name:</td>
                    <td>
                      <input
                        type="text"
                        id="firstname"
                        className="inputtext"
                        name="firstname"
                        value={formData.firstname}
                        onChange={(e) => handleInputChange("firstname", e.target.value)}
                        size={30}
                        required
                        disabled={loading}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="label">Last Name:</td>
                    <td>
                      <input
                        type="text"
                        id="lastname"
                        className="inputtext"
                        name="lastname"
                        value={formData.lastname}
                        onChange={(e) => handleInputChange("lastname", e.target.value)}
                        size={30}
                        required
                        disabled={loading}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="label">Your Email:</td>
                    <td>
                      <input 
                        type="email" 
                        id="email" 
                        className="inputtext" 
                        name="email" 
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        size={30}
                        required
                        disabled={loading}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="label">Re-enter Email:</td>
                    <td>
                      <input 
                        type="email" 
                        id="email2" 
                        className="inputtext" 
                        name="email2" 
                        value={formData.email2}
                        onChange={(e) => handleInputChange("email2", e.target.value)}
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
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        size={30}
                        required
                        disabled={loading}
                        minLength={6}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="label">Phone:</td>
                    <td>
                      <input
                        type="tel"
                        id="phone"
                        className="inputtext"
                        name="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        size={30}
                        disabled={loading}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="label">Location:</td>
                    <td>
                      <input
                        type="text"
                        id="location"
                        className="inputtext"
                        name="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        size={30}
                        placeholder="City, State"
                        disabled={loading}
                      />
                    </td>
                  </tr>

                  {/* Account Type */}
                  <tr>
                    <td className="label">I want to:</td>
                    <td>
                      <div style={{ fontSize: '11px' }}>
                        <div style={{ marginBottom: '5px' }}>
                          <input
                            type="radio"
                            id="browse"
                            name="purpose"
                            value="browse"
                            checked={accountType === "student"}
                            onChange={() => setAccountType("student")}
                            disabled={loading}
                          />
                          <label htmlFor="browse" style={{ marginLeft: '5px' }}>
                            Browse opportunities and find internships
                          </label>
                        </div>
                        <div>
                          <input
                            type="radio"
                            id="post"
                            name="purpose"
                            value="post"
                            checked={accountType === "founder"}
                            onChange={() => setAccountType("founder")}
                            disabled={loading}
                          />
                          <label htmlFor="post" style={{ marginLeft: '5px' }}>
                            Post opportunities and hire students
                          </label>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Academic Information (for students) */}
                  {(accountType === "student" || accountType === "graduate") && (
                    <>
                      <tr>
                        <td colSpan={2} style={{ fontWeight: 'bold', paddingTop: '20px', paddingBottom: '10px' }}>
                          Academic Information
                        </td>
                      </tr>
                      <tr>
                        <td className="label">University:</td>
                        <td>
                          <input
                            type="text"
                            id="university"
                            className="inputtext"
                            name="university"
                            value={formData.university}
                            onChange={(e) => handleInputChange("university", e.target.value)}
                            size={30}
                            disabled={loading}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="label">Graduation Year:</td>
                        <td>
                          <input
                            type="number"
                            id="graduation_year"
                            className="inputtext"
                            name="graduation_year"
                            value={formData.graduation_year}
                            onChange={(e) => handleInputChange("graduation_year", e.target.value)}
                            size={30}
                            min="2000"
                            max="2030"
                            disabled={loading}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="label">GPA:</td>
                        <td>
                          <input
                            type="number"
                            id="gpa"
                            className="inputtext"
                            name="gpa"
                            value={formData.gpa}
                            onChange={(e) => handleInputChange("gpa", e.target.value)}
                            size={30}
                            step="0.01"
                            min="0"
                            max="4"
                            disabled={loading}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="label">Majors:</td>
                        <td>
                          <input
                            type="text"
                            id="majors"
                            className="inputtext"
                            name="majors"
                            value={formData.majors}
                            onChange={(e) => handleInputChange("majors", e.target.value)}
                            size={30}
                            placeholder="Computer Science, Mathematics"
                            disabled={loading}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="label">Minors:</td>
                        <td>
                          <input
                            type="text"
                            id="minors"
                            className="inputtext"
                            name="minors"
                            value={formData.minors}
                            onChange={(e) => handleInputChange("minors", e.target.value)}
                            size={30}
                            placeholder="Business, Psychology"
                            disabled={loading}
                          />
                        </td>
                      </tr>
                    </>
                  )}

                  {/* Company Information (for founders) */}
                  {accountType === "founder" && (
                    <>
                      <tr>
                        <td colSpan={2} style={{ fontWeight: 'bold', paddingTop: '20px', paddingBottom: '10px' }}>
                          Company Information
                        </td>
                      </tr>
                      <tr>
                        <td className="label">Company Name:</td>
                        <td>
                          <input
                            type="text"
                            id="company_name"
                            className="inputtext"
                            name="company_name"
                            value={formData.company_name}
                            onChange={(e) => handleInputChange("company_name", e.target.value)}
                            size={30}
                            disabled={loading}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="label">Industry:</td>
                        <td>
                          <input
                            type="text"
                            id="industry"
                            className="inputtext"
                            name="industry"
                            value={formData.industry}
                            onChange={(e) => handleInputChange("industry", e.target.value)}
                            size={30}
                            placeholder="Technology, Healthcare, etc."
                            disabled={loading}
                          />
                        </td>
                      </tr>
                    </>
                  )}

                  {/* Skills & Bio */}
                  <tr>
                    <td colSpan={2} style={{ fontWeight: 'bold', paddingTop: '20px', paddingBottom: '10px' }}>
                      Skills & Bio
                    </td>
                  </tr>
                  <tr>
                    <td className="label">Skills:</td>
                    <td>
                      <input
                        type="text"
                        id="skills"
                        className="inputtext"
                        name="skills"
                        value={formData.skills}
                        onChange={(e) => handleInputChange("skills", e.target.value)}
                        size={30}
                        placeholder="React, Python, Machine Learning, Leadership"
                        disabled={loading}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="label">Bio:</td>
                    <td>
                      <textarea
                        id="bio"
                        className="inputtext"
                        name="bio"
                        value={formData.bio}
                        onChange={(e) => handleInputChange("bio", e.target.value)}
                        rows={3}
                        cols={30}
                        placeholder="Tell us about yourself..."
                        disabled={loading}
                      />
                    </td>
                  </tr>

                  {/* Links */}
                  <tr>
                    <td colSpan={2} style={{ fontWeight: 'bold', paddingTop: '20px', paddingBottom: '10px' }}>
                      Links
                    </td>
                  </tr>
                  <tr>
                    <td className="label">GitHub:</td>
                    <td>
                      <input
                        type="url"
                        id="github"
                        className="inputtext"
                        name="github"
                        value={formData.github}
                        onChange={(e) => handleInputChange("github", e.target.value)}
                        size={30}
                        placeholder="github.com/username"
                        disabled={loading}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="label">Website:</td>
                    <td>
                      <input
                        type="url"
                        id="website"
                        className="inputtext"
                        name="website"
                        value={formData.website}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                        size={30}
                        placeholder="https://yourwebsite.com"
                        disabled={loading}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="label">Portfolio:</td>
                    <td>
                      <input
                        type="url"
                        id="portfolio"
                        className="inputtext"
                        name="portfolio"
                        value={formData.portfolio}
                        onChange={(e) => handleInputChange("portfolio", e.target.value)}
                        size={30}
                        placeholder="https://portfolio.com"
                        disabled={loading}
                      />
                    </td>
                  </tr>

                  {/* Classic Facebook-style fields */}
                  <tr>
                    <td colSpan={2} style={{ fontWeight: 'bold', paddingTop: '20px', paddingBottom: '10px' }}>
                      Personal Information (Optional)
                    </td>
                  </tr>
                  <tr>
                    <td className="label">Political Views:</td>
                    <td>
                      <input
                        type="text"
                        id="political_views"
                        className="inputtext"
                        name="political_views"
                        value={formData.political_views}
                        onChange={(e) => handleInputChange("political_views", e.target.value)}
                        size={30}
                        placeholder="Moderate, Liberal, Conservative"
                        disabled={loading}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="label">Interests:</td>
                    <td>
                      <input
                        type="text"
                        id="interests"
                        className="inputtext"
                        name="interests"
                        value={formData.interests}
                        onChange={(e) => handleInputChange("interests", e.target.value)}
                        size={30}
                        placeholder="Web Design, Photography, Music, Tennis"
                        disabled={loading}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="label">Favorite Music:</td>
                    <td>
                      <input
                        type="text"
                        id="favorite_music"
                        className="inputtext"
                        name="favorite_music"
                        value={formData.favorite_music}
                        onChange={(e) => handleInputChange("favorite_music", e.target.value)}
                        size={30}
                        placeholder="Zero 7, Air, Beatles, Coldplay"
                        disabled={loading}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="label">Favorite TV Shows:</td>
                    <td>
                      <input
                        type="text"
                        id="favorite_tv"
                        className="inputtext"
                        name="favorite_tv"
                        value={formData.favorite_tv}
                        onChange={(e) => handleInputChange("favorite_tv", e.target.value)}
                        size={30}
                        placeholder="Lost, Family Guy, Firefly"
                        disabled={loading}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="label">Favorite Movies:</td>
                    <td>
                      <input
                        type="text"
                        id="favorite_movies"
                        className="inputtext"
                        name="favorite_movies"
                        value={formData.favorite_movies}
                        onChange={(e) => handleInputChange("favorite_movies", e.target.value)}
                        size={30}
                        placeholder="The Incredibles, Fight Club, Office Space"
                        disabled={loading}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="label">Favorite Quotes:</td>
                    <td>
                      <input
                        type="text"
                        id="favorite_quotes"
                        className="inputtext"
                        name="favorite_quotes"
                        value={formData.favorite_quotes}
                        onChange={(e) => handleInputChange("favorite_quotes", e.target.value)}
                        size={30}
                        placeholder='"Drama is life with the dull bits cut out." - Alfred Hitchcock'
                        disabled={loading}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="formbuttons">
                <input 
                  type="submit" 
                  id="register" 
                  name="register" 
                  className="inputsubmit" 
                  value={loading ? "Creating Account..." : "Sign Up"}
                  disabled={loading}
                />
              </div>

              <p className="terms">
                By clicking Sign Up, you are indicating that you have read and agree to the{" "}
                <Link href="/terms">
                  <b>Terms of Use</b>
                </Link>{" "}
                and{" "}
                <Link href="/privacy">
                  <b>Privacy Policy</b>
                </Link>
                .
              </p>
            </div>
          </form>
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
          <p>a startup innovation</p>
          <p>StartupConnect © 2024</p>
        </div>
      </div>

      <div className="sponsors bottom-sponsors"></div>
    </div>
  )
}
