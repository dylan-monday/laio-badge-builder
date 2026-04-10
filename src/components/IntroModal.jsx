import { getBadgeComponent } from '@/components/badges'

const STORAGE_KEY = 'laio_intro_dismissed'

export function IntroModal({ onClose }) {
  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    onClose()
  }

  const BadgeComponent = getBadgeComponent('standard')

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleDismiss}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl">

        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-0 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-sub/30" />
        </div>

        {/* Badge hero */}
        <div className="flex items-center justify-center px-8 pt-8 pb-6">
          <BadgeComponent color="#00BAFF" size="l" slug="la-io" />
        </div>

        {/* Content */}
        <div className="px-6 sm:px-8 pb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-text mb-3 leading-snug">
            We (all) are Louisiana Innovation.
          </h2>
          <div className="space-y-3 text-sm leading-relaxed mb-6">
            <p className="text-sub">
              Welcome to the LA.IO Badge Builder — a quick way to grab the identity of the work
              we&rsquo;re all pushing forward.
            </p>
            <p className="text-sub">
              Spec out your LA.IO logo and get the code to drop it in your website footer, about
              page, newsletter, app, or dashboard. Paste a simple embed snippet for digital
              placements, or generate an image file for presentations, decks, bicep tattoos, and anywhere else we should show up.
            </p>
            <p className="text-text/60">
              The momentum our combined work is creating is real. This is how we amplify the signal.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="w-full py-3 rounded-xl font-semibold bg-accent text-bg hover:bg-accent/90 transition-colors text-base"
          >
            Get Started
          </button>
        </div>

      </div>
    </div>
  )
}
