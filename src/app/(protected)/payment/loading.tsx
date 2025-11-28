import { Zap } from 'lucide-react'

const Loading = () => {
  return (
    <div className="h-screen flex justify-center items-center bg-background relative overflow-hidden">
      {/* Subtle background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-muted/50 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-muted/50 rounded-full blur-3xl" />
      </div>

      {/* Loading content */}
      <div className="relative flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground">
            <Zap className="h-5 w-5 text-background" fill="currentColor" />
          </div>
          <span className="text-xl font-bold tracking-tight">Slide</span>
        </div>

        {/* Simple spinner */}
        <div className="w-8 h-8 rounded-full border-2 border-muted border-t-foreground animate-spin" />
        
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

export default Loading