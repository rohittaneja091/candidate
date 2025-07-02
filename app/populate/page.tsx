import DatabasePopulator from "@/components/database-populator"

export default function PopulatePage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Database Population</h1>
        <p className="text-muted-foreground">
          Automatically populate your recruiting database with real PhD candidates from academic sources
        </p>
      </div>

      <DatabasePopulator />
    </div>
  )
}
