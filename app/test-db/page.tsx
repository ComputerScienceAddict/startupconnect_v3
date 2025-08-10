"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestDBPage() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testDatabase = async () => {
    setLoading(true)
    setResults(null)

    try {
      // Test 1: Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      // Test 2: Check if opportunities table exists
      const { data: tableData, error: tableError } = await supabase
        .from('opportunities')
        .select('id')
        .limit(1)
      
      // Test 3: Check if user_profiles table exists
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1)

      // Test 4: Check table structure
      const { data: structureData, error: structureError } = await supabase
        .from('opportunities')
        .select('*')
        .limit(0)

      setResults({
        auth: { user: !!user, error: authError },
        opportunitiesTable: { data: tableData, error: tableError },
        userProfilesTable: { data: profileData, error: profileError },
        tableStructure: { data: structureData, error: structureError }
      })

    } catch (error) {
      setResults({ error: error })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-10">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-90 mb-2">Database Test</h1>
          <p className="text-neutral-30">Test database connectivity and table existence</p>
        </div>

        <Card className="bg-white border-neutral-20 mb-8">
          <CardHeader>
            <CardTitle className="text-neutral-90">Database Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testDatabase}
              disabled={loading}
              className="bg-blue-20 hover:bg-blue-30 text-blue-50"
            >
              {loading ? "Testing..." : "Run Database Tests"}
            </Button>
          </CardContent>
        </Card>

        {results && (
          <div className="space-y-6">
            <Card className="bg-white border-neutral-20">
              <CardHeader>
                <CardTitle className="text-neutral-90">Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm text-neutral-70 bg-neutral-10 p-4 rounded overflow-auto">
                  {JSON.stringify(results.auth, null, 2)}
                </pre>
              </CardContent>
            </Card>

            <Card className="bg-white border-neutral-20">
              <CardHeader>
                <CardTitle className="text-neutral-90">Opportunities Table</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm text-neutral-70 bg-neutral-10 p-4 rounded overflow-auto">
                  {JSON.stringify(results.opportunitiesTable, null, 2)}
                </pre>
              </CardContent>
            </Card>

            <Card className="bg-white border-neutral-20">
              <CardHeader>
                <CardTitle className="text-neutral-90">User Profiles Table</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm text-neutral-70 bg-neutral-10 p-4 rounded overflow-auto">
                  {JSON.stringify(results.userProfilesTable, null, 2)}
                </pre>
              </CardContent>
            </Card>

            <Card className="bg-white border-neutral-20">
              <CardHeader>
                <CardTitle className="text-neutral-90">Table Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm text-neutral-70 bg-neutral-10 p-4 rounded overflow-auto">
                  {JSON.stringify(results.tableStructure, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

