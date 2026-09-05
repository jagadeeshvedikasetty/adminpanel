'use client'

import { useState } from 'react'
import { renameCategory } from './actions'

export default function CategoryRow({ category, count }: { category: string, count: number }) {
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState(category)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (newName.trim() === category) {
      setIsEditing(false)
      return
    }
    
    setIsLoading(true)
    setError('')
    
    const result = await renameCategory(category, newName.trim())
    
    if (result.success) {
      setIsEditing(false)
    } else {
      setError(result.error || 'Failed to rename')
    }
    
    setIsLoading(false)
  }

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="p-4 font-medium text-gray-900">
        {isEditing ? (
          <div>
            <input 
              type="text" 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm mr-2 w-full max-w-[200px]"
              autoFocus
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        ) : (
          category || 'Uncategorized'
        )}
      </td>
      <td className="p-4 text-gray-600 font-semibold">
        {count}
      </td>
      <td className="p-4 text-right">
        {isEditing ? (
          <div className="space-x-2">
            <button 
              onClick={handleSave} 
              disabled={isLoading}
              className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button 
              onClick={() => { setIsEditing(false); setNewName(category); }}
              disabled={isLoading}
              className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsEditing(true)}
            className="text-xs px-2 py-1 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded"
          >
            Edit Name
          </button>
        )}
      </td>
    </tr>
  )
}
