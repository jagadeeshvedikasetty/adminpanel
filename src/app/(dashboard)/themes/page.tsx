import { createClient } from '@/utils/supabase/server'
import festivalsData from '@/data/festivals.json'
import { activateTheme } from './actions'

export default async function ThemesPage() {
  const supabase = await createClient()

  // Try to fetch the active theme from Supabase
  const { data: activeThemes, error: supabaseError } = await supabase
    .from('themes')
    .select('*')
    .eq('is_active', true)
    .limit(1)

  const activeTheme = activeThemes?.[0] || null

  const sqlSetupInstruction = `
-- Run this in your Supabase SQL Editor to create the themes table
create table themes (
  id text primary key,
  name text not null,
  primary_color text,
  secondary_color text,
  is_active boolean default false
);
alter table themes enable row level security;
create policy "Allow all authenticated users" on themes for all to authenticated using (true);
create policy "Allow public read access" on themes for select using (true);
  `.trim()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Themes & Colors</h1>

      {supabaseError && supabaseError.code === '42P01' && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-orange-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">Database Setup Required</h3>
              <div className="mt-2 text-sm text-orange-700">
                <p>The `themes` table doesn't exist in your Supabase project yet. Please run this SQL in your Supabase dashboard to enable theme saving:</p>
                <pre className="mt-2 bg-orange-100 p-2 rounded-md overflow-x-auto text-xs">{sqlSetupInstruction}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTheme && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Currently Active Theme</h2>
            <p className="text-xl font-bold text-gray-900">{activeTheme.name}</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex space-x-3">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full shadow-inner" style={{ backgroundColor: activeTheme.primary_color }}></div>
                <span className="text-xs text-gray-500 mt-1">Primary</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full shadow-inner" style={{ backgroundColor: activeTheme.secondary_color }}></div>
                <span className="text-xs text-gray-500 mt-1">Secondary</span>
              </div>
            </div>
            <div className="pl-6 border-l border-gray-200">
              <a href="/themes/studio" className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md shadow-sm text-sm font-bold hover:bg-indigo-700 transition-colors">
                Open Decoration Studio ✨
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {festivalsData.map((festival) => (
          <div key={festival.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="h-2 w-full flex">
              <div className="h-full flex-1" style={{ backgroundColor: festival.themeColors.primary }}></div>
              <div className="h-full flex-1" style={{ backgroundColor: festival.themeColors.secondary }}></div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-gray-900">{festival.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{festival.season}</p>
              <p className="text-sm text-gray-700 mb-4 flex-1">{festival.description}</p>
              <a 
                href="/themes/studio"
                className="w-full py-2 rounded-md text-sm font-bold transition-colors bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm text-center block mt-auto"
              >
                Open Decoration Studio ✨
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
