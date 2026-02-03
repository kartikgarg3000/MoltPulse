
import { signInWithGithub } from '../auth/actions'
import { Github } from 'lucide-react'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-8">
            <span className="text-white font-black text-4xl">M</span>
        </div>
        <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-400 to-gray-600">
          Welcome to the Pulse
        </h1>
        <p className="text-gray-400 text-lg max-w-md mx-auto">
          Join the community to vote on agents, track your favorites, and contribute to the map.
        </p>
      </div>

      <div className="w-full max-w-sm glass p-8 rounded-[2rem] border border-white/10 space-y-6">
        {searchParams?.error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
            {searchParams.error}
          </div>
        )}

        <form action={signInWithGithub}>
          <button className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-all active:scale-[0.98] group">
            <Github size={20} />
            <span>Continue with GitHub</span>
          </button>
        </form>

        <p className="text-center text-xs text-gray-500">
          By signing in, you agree to our terms of intelligence.
        </p>
      </div>
    </div>
  )
}
