"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserAvatarProps {
  user?: {
    full_name?: string
    profile_picture_base64?: string | null
  } | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function UserAvatar({ user, size = 'md', className = '' }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-32 h-32'
  }

  // Handle null/undefined user
  if (!user) {
    return (
      <Avatar className={`${sizeClasses[size]} ${className}`}>
        <AvatarFallback className="bg-primary/5 text-primary">
          U
        </AvatarFallback>
      </Avatar>
    )
  }

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage
        src={user.profile_picture_base64 || undefined}
        alt={user.full_name || 'User'}
        className="object-cover"
        style={{
          imageRendering: 'crisp-edges'
        }}
      />
      <AvatarFallback className="bg-primary/5 text-primary">
        {user.full_name?.charAt(0).toUpperCase() || 'U'}
      </AvatarFallback>
    </Avatar>
  )
}