"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { 
  Palette, 
  Type, 
  Ruler, 
  Droplets, 
  Grid3X3,
  Sparkles,
  Eye,
  Copy
} from "lucide-react"

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = useState("colors")
  const [copiedColor, setCopiedColor] = useState<string | null>(null)

  const colorPalette = {
    neutral: [
      { name: "Neutral 10", value: "#f4f5f6", var: "--neutral-10" },
      { name: "Neutral 20", value: "#e7e9ee", var: "--neutral-20" },
      { name: "Neutral 30", value: "#d0d5dd", var: "--neutral-30" },
      { name: "Neutral 40", value: "#afb5c0", var: "--neutral-40" },
      { name: "Neutral 50", value: "#8d96a5", var: "--neutral-50" },
      { name: "Neutral 60", value: "#677283", var: "--neutral-60" },
      { name: "Neutral 70", value: "#495365", var: "--neutral-70" },
      { name: "Neutral 80", value: "#2f3a4c", var: "--neutral-80" },
      { name: "Neutral 90", value: "#1b222c", var: "--neutral-90" },
    ],
    green: [
      { name: "Green 10", value: "#eaf6ef", var: "--green-10" },
      { name: "Green 20", value: "#b8dbc8", var: "--green-20" },
      { name: "Green 30", value: "#86caa5", var: "--green-30" },
      { name: "Green 40", value: "#53b57f", var: "--green-40" },
      { name: "Green 50", value: "#098842", var: "--green-50" },
      { name: "Green 60", value: "#1e6b41", var: "--green-60" },
      { name: "Green 70", value: "#195936", var: "--green-70" },
    ],
    blue: [
      { name: "Blue 10", value: "#f1f4f9", var: "--blue-10" },
      { name: "Blue 20", value: "#c3d0e3", var: "--blue-20" },
      { name: "Blue 30", value: "#97b6e5", var: "--blue-30" },
      { name: "Blue 40", value: "#6597e0", var: "--blue-40" },
      { name: "Blue 50", value: "#366cbf", var: "--blue-50" },
      { name: "Blue 60", value: "#28518f", var: "--blue-60" },
      { name: "Blue 70", value: "#214475", var: "--blue-70" },
    ],
    red: [
      { name: "Red 10", value: "#f9f1f1", var: "--red-10" },
      { name: "Red 20", value: "#f5beba", var: "--red-20" },
      { name: "Red 30", value: "#e59d9a", var: "--red-30" },
      { name: "Red 40", value: "#e36d66", var: "--red-40" },
      { name: "Red 50", value: "#b83a33", var: "--red-50" },
      { name: "Red 60", value: "#942f2a", var: "--red-60" },
      { name: "Red 70", value: "#782722", var: "--red-70" },
    ],
    yellow: [
      { name: "Yellow 10", value: "#fcf1e3", var: "--yellow-10" },
      { name: "Yellow 20", value: "#fcc483", var: "--yellow-20" },
      { name: "Yellow 30", value: "#f7a445", var: "--yellow-30" },
      { name: "Yellow 40", value: "#de8014", var: "--yellow-40" },
      { name: "Yellow 50", value: "#8f5514", var: "--yellow-50" },
      { name: "Yellow 60", value: "#7a4304", var: "--yellow-60" },
      { name: "Yellow 70", value: "#633a0b", var: "--yellow-70" },
    ]
  }

  const spacingScale = [
    { name: "00", value: "0", var: "--spacing-00" },
    { name: "01", value: "2px", var: "--spacing-01" },
    { name: "02", value: "4px", var: "--spacing-02" },
    { name: "03", value: "6px", var: "--spacing-03" },
    { name: "04", value: "8px", var: "--spacing-04" },
    { name: "05", value: "12px", var: "--spacing-05" },
    { name: "06", value: "16px", var: "--spacing-06" },
    { name: "07", value: "20px", var: "--spacing-07" },
    { name: "08", value: "24px", var: "--spacing-08" },
    { name: "09", value: "32px", var: "--spacing-09" },
    { name: "10", value: "40px", var: "--spacing-10" },
    { name: "11", value: "48px", var: "--spacing-11" },
    { name: "12", value: "56px", var: "--spacing-12" },
    { name: "13", value: "64px", var: "--spacing-13" },
    { name: "14", value: "72px", var: "--spacing-14" },
    { name: "15", value: "80px", var: "--spacing-15" },
    { name: "16", value: "96px", var: "--spacing-16" },
  ]

  const typographyScale = [
    { name: "01", size: "0.75rem", var: "--font-size-01" },
    { name: "02", size: "0.875rem", var: "--font-size-02" },
    { name: "03", size: "1rem", var: "--font-size-03" },
    { name: "04", size: "1.125rem", var: "--font-size-04" },
    { name: "05", size: "1.25rem", var: "--font-size-05" },
    { name: "06", size: "1.5rem", var: "--font-size-06" },
    { name: "07", size: "1.875rem", var: "--font-size-07" },
    { name: "08", size: "2.25rem", var: "--font-size-08" },
    { name: "09", size: "3rem", var: "--font-size-09" },
    { name: "10", size: "3.25rem", var: "--font-size-10" },
    { name: "11", size: "3.75rem", var: "--font-size-11" },
    { name: "12", size: "4.5rem", var: "--font-size-12" },
    { name: "13", size: "6em", var: "--font-size-13" },
  ]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedColor(text)
    setTimeout(() => setCopiedColor(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-10 to-neutral-20">
      {/* Header */}
      <div className="bg-white border-b border-neutral-20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-neutral-90 tracking-tight">
                Design System
              </h1>
              <p className="text-neutral-60 mt-2 text-lg">
                Beautiful, systematic design tokens and components
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-50 text-green-60 border-green-20">
                <Sparkles className="w-3 h-3 mr-1" />
                Live Preview
              </Badge>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mt-8">
            {[
              { id: "colors", label: "Colors", icon: Palette },
              { id: "typography", label: "Typography", icon: Type },
              { id: "spacing", label: "Spacing", icon: Ruler },
              { id: "components", label: "Components", icon: Grid3X3 },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center space-x-2"
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "colors" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-neutral-90 mb-6">Color Palette</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {Object.entries(colorPalette).map(([category, colors]) => (
                  <Card key={category} className="border-neutral-20">
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-neutral-90 capitalize">
                        {category} Colors
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {colors.map((color) => (
                          <div
                            key={color.name}
                            className="flex items-center justify-between p-3 rounded-lg border border-neutral-20 hover:border-neutral-30 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-8 h-8 rounded border border-neutral-20"
                                style={{ backgroundColor: color.value }}
                              />
                              <div>
                                <p className="font-medium text-neutral-90">{color.name}</p>
                                <p className="text-sm text-neutral-60">{color.value}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(color.var)}
                              className="text-neutral-60 hover:text-neutral-90"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Color Usage Examples */}
            <div>
              <h3 className="text-xl font-semibold text-neutral-90 mb-4">Usage Examples</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-green-20 bg-green-10">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-green-60 mb-2">Success State</h4>
                    <p className="text-green-60 text-sm">Used for positive actions and confirmations</p>
                  </CardContent>
                </Card>
                <Card className="border-blue-20 bg-blue-10">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-blue-60 mb-2">Info State</h4>
                    <p className="text-blue-60 text-sm">Used for informational content and links</p>
                  </CardContent>
                </Card>
                <Card className="border-red-20 bg-red-10">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-red-60 mb-2">Error State</h4>
                    <p className="text-red-60 text-sm">Used for errors and destructive actions</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeTab === "typography" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-neutral-90 mb-6">Typography Scale</h2>
              <div className="space-y-4">
                {typographyScale.map((type) => (
                  <div
                    key={type.name}
                    className="flex items-center justify-between p-4 rounded-lg border border-neutral-20"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 text-center">
                        <span className="text-sm text-neutral-60 font-mono">{type.name}</span>
                      </div>
                      <div
                        className="font-sans"
                        style={{ fontSize: type.size }}
                      >
                        The quick brown fox jumps over the lazy dog
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-neutral-60">{type.size}</p>
                      <p className="text-xs text-neutral-50 font-mono">{type.var}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography Examples */}
            <div>
              <h3 className="text-xl font-semibold text-neutral-90 mb-4">Text Hierarchy</h3>
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl font-bold text-neutral-90 mb-2">Heading 1</h1>
                  <p className="text-neutral-60">Large page titles and hero sections</p>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-neutral-90 mb-2">Heading 2</h2>
                  <p className="text-neutral-60">Section headers and major content divisions</p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-neutral-90 mb-2">Heading 3</h3>
                  <p className="text-neutral-60">Subsection headers and card titles</p>
                </div>
                <div>
                  <p className="text-base text-neutral-90 mb-2">Body Text</p>
                  <p className="text-neutral-60">Primary content and readable text</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-90 mb-2">Small Text</p>
                  <p className="text-neutral-60">Captions, metadata, and secondary information</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "spacing" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-neutral-90 mb-6">Spacing Scale</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {spacingScale.map((space) => (
                  <Card key={space.name} className="border-neutral-20">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="mb-3">
                          <div
                            className="bg-neutral-60 mx-auto"
                            style={{
                              width: space.value,
                              height: space.value,
                              minWidth: "8px",
                              minHeight: "8px"
                            }}
                          />
                        </div>
                        <p className="font-medium text-neutral-90">{space.name}</p>
                        <p className="text-sm text-neutral-60">{space.value}</p>
                        <p className="text-xs text-neutral-50 font-mono mt-1">{space.var}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Spacing Examples */}
            <div>
              <h3 className="text-xl font-semibold text-neutral-90 mb-4">Spacing in Action</h3>
              <div className="space-y-4">
                <div className="p-4 bg-neutral-10 rounded-lg">
                  <p className="text-neutral-90">Padding: 16px (spacing-06)</p>
                </div>
                <div className="p-6 bg-neutral-10 rounded-lg">
                  <p className="text-neutral-90">Padding: 24px (spacing-08)</p>
                </div>
                <div className="p-8 bg-neutral-10 rounded-lg">
                  <p className="text-neutral-90">Padding: 32px (spacing-09)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "components" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-neutral-90 mb-6">Component Examples</h2>
              
              {/* Buttons */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-neutral-90 mb-4">Buttons</h3>
                <div className="flex flex-wrap gap-4">
                  <Button className="bg-green-50 text-green-60 hover:bg-green-60 hover:text-white">
                    Primary
                  </Button>
                  <Button variant="outline" className="border-neutral-30 text-neutral-90 hover:bg-neutral-10">
                    Secondary
                  </Button>
                  <Button variant="ghost" className="text-neutral-90 hover:bg-neutral-10">
                    Ghost
                  </Button>
                  <Button className="bg-red-50 text-red-60 hover:bg-red-60 hover:text-white">
                    Destructive
                  </Button>
                </div>
              </div>

              {/* Cards */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-neutral-90 mb-4">Cards</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-neutral-20">
                    <CardHeader>
                      <h4 className="font-semibold text-neutral-90">Default Card</h4>
                    </CardHeader>
                    <CardContent>
                      <p className="text-neutral-60">Standard card with neutral styling</p>
                    </CardContent>
                  </Card>
                  <Card className="border-green-20 bg-green-10">
                    <CardHeader>
                      <h4 className="font-semibold text-green-60">Success Card</h4>
                    </CardHeader>
                    <CardContent>
                      <p className="text-green-60">Card with success state styling</p>
                    </CardContent>
                  </Card>
                  <Card className="border-blue-20 bg-blue-10">
                    <CardHeader>
                      <h4 className="font-semibold text-blue-60">Info Card</h4>
                    </CardHeader>
                    <CardContent>
                      <p className="text-blue-60">Card with informational styling</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Form Elements */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-neutral-90 mb-4">Form Elements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-90 mb-2">Input Field</label>
                    <Input placeholder="Enter your text here..." className="border-neutral-30" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-90 mb-2">Badge</label>
                    <div className="flex space-x-2">
                      <Badge className="bg-green-50 text-green-60 border-green-20">Success</Badge>
                      <Badge className="bg-blue-50 text-blue-60 border-blue-20">Info</Badge>
                      <Badge className="bg-red-50 text-red-60 border-red-20">Error</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Success Message */}
      {copiedColor && (
        <div className="fixed bottom-4 right-4 bg-green-50 text-green-60 px-4 py-2 rounded-lg border border-green-20 shadow-lg">
          <div className="flex items-center space-x-2">
            <Copy className="w-4 h-4" />
            <span>Copied {copiedColor} to clipboard!</span>
          </div>
        </div>
      )}
    </div>
  )
} 