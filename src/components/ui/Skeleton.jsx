// Reusable skeleton shimmer — matches parchment design system (bg #f6eddc)
// Usage: <Skeleton width="100%" height={16} /> or <SkeletonCard />

const shimmerStyle = {
  background: 'linear-gradient(90deg, #e8dfc8 25%, #d9d0b8 50%, #e8dfc8 75%)',
  backgroundSize: '200% 100%',
  animation: 'skeletonShimmer 1.4s ease-in-out infinite',
  borderRadius: 6,
  display: 'block',
}

// Inject keyframes once
if (typeof document !== 'undefined' && !document.getElementById('skeleton-kf')) {
  const style = document.createElement('style')
  style.id = 'skeleton-kf'
  style.textContent = `
    @keyframes skeletonShimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `
  document.head.appendChild(style)
}

export function Skeleton({ width = '100%', height = 16, style: extraStyle = {} }) {
  return (
    <span
      aria-hidden="true"
      style={{ ...shimmerStyle, width, height, ...extraStyle }}
    />
  )
}

export function SkeletonText({ lines = 2, lastLineWidth = '60%' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? lastLineWidth : '100%'}
          height={14}
        />
      ))}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div
      aria-hidden="true"
      style={{
        padding: '18px 20px',
        border: '1.5px solid #d9cfb8',
        borderRadius: 12,
        background: '#faf6ee',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <Skeleton width={80} height={20} />
      <Skeleton width="70%" height={22} />
      <SkeletonText lines={2} />
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <Skeleton width={64} height={26} style={{ borderRadius: 20 }} />
        <Skeleton width={80} height={26} style={{ borderRadius: 20 }} />
      </div>
    </div>
  )
}
