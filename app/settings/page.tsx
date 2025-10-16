export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="modern-card rounded-2xl p-8">
          <h1 className="text-4xl font-bold gradient-text mb-6">Settings</h1>
          <p className="text-xl subtle-text mb-8">Adjust your app preferences here.</p>
          
          <div className="space-y-6">
            <div className="modern-card rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Video Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Auto-play videos</span>
                  <input type="checkbox" className="w-5 h-5 text-purple-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Show video thumbnails</span>
                  <input type="checkbox" className="w-5 h-5 text-purple-500" defaultChecked />
                </div>
              </div>
            </div>
            
            <div className="modern-card rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Display Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Dark mode</span>
                  <input type="checkbox" className="w-5 h-5 text-purple-500" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Compact layout</span>
                  <input type="checkbox" className="w-5 h-5 text-purple-500" />
                </div>
              </div>
            </div>
            
            <div className="modern-card rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Notifications</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Email notifications</span>
                  <input type="checkbox" className="w-5 h-5 text-purple-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Push notifications</span>
                  <input type="checkbox" className="w-5 h-5 text-purple-500" defaultChecked />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex gap-4">
            <button className="modern-button px-8 py-3 rounded-xl text-lg font-semibold">
              Save Settings
            </button>
            <button className="px-8 py-3 bg-gray-700/50 border border-gray-600/50 text-gray-300 rounded-xl hover:bg-gray-600/50 hover:text-white transition-all duration-200">
              Reset to Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
