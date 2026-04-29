export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-[350px] h-[350px] bg-teal-500/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Nav */}
        <nav className="px-6 py-6">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-xl font-bold">Vault</span>
            </div>
            <a
              href="https://github.com/zeeshan8281/eigenreview"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        </nav>

        {/* Hero */}
        <main className="px-6 pt-20 pb-32">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-zinc-400">Powered by EigenCompute TEE</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Speak freely.
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Stay hidden.
              </span>
            </h1>

            <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12">
              Anonymous feedback that&apos;s actually anonymous. Your identity is cryptographically
              sealed inside a hardware enclave — not even server admins can see who you are.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="http://34.12.126.114:3000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-semibold text-lg hover:scale-105 transition-transform"
              >
                Launch App
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
              <a
                href="https://verify-sepolia.eigencloud.xyz/app/0xcaD70c29449055E52814f6031448e5Fd26BdFbcd"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-zinc-700 text-zinc-300 font-medium hover:bg-zinc-900 transition-colors"
              >
                Verify TEE
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </a>
            </div>
          </div>
        </main>

        {/* Features */}
        <section className="px-6 py-20 border-t border-zinc-900">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">Why it&apos;s different</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Hardware Isolation</h3>
                <p className="text-zinc-400 text-sm">
                  Runs inside AMD SEV-SNP secure enclave. Memory is encrypted at the CPU level.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Zero Visibility</h3>
                <p className="text-zinc-400 text-sm">
                  No IP logging, no cookies, no sessions. Server operators literally cannot see your identity.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Verifiable</h3>
                <p className="text-zinc-400 text-sm">
                  Cryptographic attestation proves the code running matches the open-source repo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 py-20 border-t border-zinc-900">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">How it works</h2>
            <p className="text-zinc-400 mb-12">
              Traditional &quot;anonymous&quot; tools ask you to trust them. Vault uses math instead.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
              <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-2xl">📝</span>
                <span className="text-sm">You write</span>
              </div>
              <svg className="w-6 h-6 text-zinc-600 rotate-90 md:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-2xl">🔒</span>
                <span className="text-sm">TEE processes</span>
              </div>
              <svg className="w-6 h-6 text-zinc-600 rotate-90 md:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-2xl">✨</span>
                <span className="text-sm">Anonymous post</span>
              </div>
            </div>

            <p className="text-zinc-500 text-sm mt-8">
              No cookies. No IP logs. No metadata. Just your words.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-12 border-t border-zinc-900">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-zinc-500 text-sm">
              Built on <a href="https://eigencloud.xyz" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white">EigenCompute</a> · Hardware-attested anonymity
            </p>
            <div className="flex items-center gap-6">
              <a href="https://github.com/zeeshan8281/eigenreview" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white text-sm">
                Source Code
              </a>
              <a href="https://verify-sepolia.eigencloud.xyz/app/0xcaD70c29449055E52814f6031448e5Fd26BdFbcd" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white text-sm">
                TEE Attestation
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
