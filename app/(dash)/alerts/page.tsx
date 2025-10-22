export default function AlertsPage() {
  return (
    <>
      <div className="px-6 py-4 border-b">
        <h1 className="text-2xl font-semibold">Alerts</h1>
        <p className="text-gray-600 mt-2">Monitor fleet alerts and notifications</p>
      </div>

      <div className="px-6 py-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🚨</div>
          <h2 className="text-xl font-medium mb-2">Alerts Dashboard</h2>
          <p className="text-gray-600 mb-6">
            Real-time alerts and notifications for your fleet will appear here.
          </p>
          <div className="bg-gray-100 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="font-medium mb-2">Coming Soon</h3>
            <p className="text-sm text-gray-600">
              This feature is under development. You'll be able to view and manage fleet alerts here.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}