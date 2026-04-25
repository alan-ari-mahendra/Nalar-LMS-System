export default function CertificateLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl animate-pulse">
        <div className="bg-surface-container border border-outline-variant rounded-2xl overflow-hidden">
          <div className="h-2 bg-surface-container-high" />
          <div className="p-8 md:p-12 space-y-8">
            {/* Header */}
            <div className="flex flex-col items-center space-y-4">
              <div className="h-8 bg-surface-container-high rounded w-32" />
              <div className="h-4 bg-surface-container-high rounded w-48" />
            </div>
            {/* Divider */}
            <div className="h-px bg-outline-variant" />
            {/* Body */}
            <div className="flex flex-col items-center space-y-6">
              <div className="h-4 bg-surface-container-high rounded w-24" />
              <div className="h-10 bg-surface-container-high rounded w-64" />
              <div className="h-4 bg-surface-container-high rounded w-48" />
              <div className="h-8 bg-surface-container-high rounded w-72" />
              <div className="flex gap-6">
                <div className="h-4 bg-surface-container-high rounded w-32" />
                <div className="h-4 bg-surface-container-high rounded w-36" />
              </div>
            </div>
            {/* Bottom */}
            <div className="h-px bg-outline-variant" />
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-surface-container-high rounded-lg" />
                <div className="space-y-2">
                  <div className="h-3 bg-surface-container-high rounded w-24" />
                  <div className="h-5 bg-surface-container-high rounded w-40" />
                </div>
              </div>
              <div className="h-12 bg-surface-container-high rounded-lg w-36" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
