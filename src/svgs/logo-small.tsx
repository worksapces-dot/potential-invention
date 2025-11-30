import { Zap } from 'lucide-react'

export const LogoSmall = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground">
        <Zap className="h-5 w-5 text-background" fill="currentColor" />
      </div>
      <span className="text-xl font-bold tracking-tight">Slide</span>
    </div>
  )
}
