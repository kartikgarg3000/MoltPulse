
import { signInWithGithub, signInWithGoogle } from '../auth/actions'
import { Github } from 'lucide-react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams;
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
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form action={signInWithGithub}>
          <button className="w-full flex items-center justify-center gap-3 bg-[#24292F] text-white font-bold py-4 rounded-xl hover:bg-[#24292F]/90 transition-all active:scale-[0.98] group border border-white/10">
            <Github size={20} />
            <span>Continue with GitHub</span>
          </button>
        </form>

        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black px-2 text-gray-500">Or continue with</span>
            </div>
        </div>

        <form action={signInWithGoogle}>
          <button className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-all active:scale-[0.98] group">
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden={true}><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            <span>Continue with Google</span>
          </button>
        </form>

        <p className="text-center text-xs text-gray-500">
          By signing in, you agree to our terms of intelligence.
        </p>
      </div>
    </div>
  )
}
