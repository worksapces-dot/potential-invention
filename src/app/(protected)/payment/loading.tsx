import Loader from "@/components/global/loader"
import { Zap } from "lucide-react"

const Loading = () => {
  return (
    <div className="h-screen flex justify-center items-center bg-background relative overflow-hidden">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-muted/50 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-muted/50 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Loading content */}
      <div className="relative flex flex-col items-center gap-6">
        {/* Logo with animation */}
        <div className="flex items-center gap-2.5 mb-4 animate-fade-in">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground animate-pulse">
            <Zap className="h-6 w-6 text-background" fill="currentColor" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Fortress</span>
        </div>

        {/* Loader */}
        <Loader state>
          <span className="text-muted-foreground">Loading your workspace...</span>
        </Loader>
      </div>
    </div>
  )
}

export default Loading
