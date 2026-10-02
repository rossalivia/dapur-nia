import { Button } from "@/components/ui/button"

export function App() {
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="text-xl font-bold">Dapur Nia</h1>
          <p className="text-muted-foreground">Aplikasi Manajemen Katering Harian</p>
          <Button className="mt-2">Mulai</Button>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          (Press <kbd>d</kbd> to toggle dark mode)
        </div>
      </div>
    </div>
  )
}

export default App
