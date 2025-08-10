"use client"

interface LoadingSpinnerProps {
  fullScreen?: boolean
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export function LoadingSpinner({ 
  fullScreen = true, 
  size = 'md',
  text
}: LoadingSpinnerProps) {
  // Enhanced size classes with thicker borders for larger spinners
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4'
  }

  const Spinner = () => (
    <div className="text-center">
      {/* Using primary color from theme for better consistency */}
      <div 
        className={`
          animate-spin 
          rounded-full 
          border-primary/20
          border-r-primary
          transition-all
          duration-300
          ${sizeClasses[size]}
        `}
      />
      {text && (
        <p className="mt-3 text-primary/80 text-sm font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div 
        className="
          fixed 
          inset-0 
          z-50 
          flex 
          items-center 
          justify-center 
          bg-background/90
          backdrop-blur-md
          transition-all
          duration-300
        "
      >
        <Spinner />
      </div>
    )
  }

  return <Spinner />
} 