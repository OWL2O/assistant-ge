export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      {children}
    </main>
  )
}
