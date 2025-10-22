export default function ExportsPage() {
  return (
    <>
      <div className="px-6 py-4 border-b">
        <h1 className="text-2xl font-semibold">Exports</h1>
        <p className="text-gray-600 mt-2">Export fleet data and reports</p>
      </div>

      <div className="px-6 py-8">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-xl font-medium mb-2">Data Exports</h2>
          <p className="text-gray-600 mb-6">
            Export your fleet data in various formats for analysis and reporting.
          </p>
          <div className="bg-gray-100 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="font-medium mb-2">Export Options</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div>• CSV reports</div>
              <div>• JSON data dumps</div>
              <div>• PDF summaries</div>
              <div>• Real-time data streams</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}