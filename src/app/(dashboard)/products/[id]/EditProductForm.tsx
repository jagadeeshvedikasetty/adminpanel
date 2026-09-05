'use client'

import { useState, useRef } from 'react'
import { updateProduct, createProduct } from './actions'

export default function EditProductForm({ product, categories = [] }: { product: any, categories?: string[] }) {
  const [variants, setVariants] = useState<any[]>(product.variants || [])
  const [error, setError] = useState('')
  const [imagePreview, setImagePreview] = useState(product.image_url)
  const [videoPreview, setVideoPreview] = useState(product.video_url)
  const [videoScale, setVideoScale] = useState(product.video_scale || 1.0)
  const [isNewCategory, setIsNewCategory] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(product.category || '')
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVideoPreview(URL.createObjectURL(file))
    }
  }

  const handleAddVariant = () => {
    setVariants([...variants, { weight: '', price: 0 }])
  }

  const handleRemoveVariant = (index: number) => {
    const newVariants = [...variants]
    newVariants.splice(index, 1)
    setVariants(newVariants)
  }

  const handleVariantChange = (index: number, field: string, value: string | number) => {
    const newVariants = [...variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setVariants(newVariants)
  }

  const handleSubmit = async (formData: FormData) => {
    const isNew = product.id === 'new'
    const result = isNew 
      ? await createProduct(formData)
      : await updateProduct(product.id, formData)
      
    if (result && !result.success) {
      setError(result.error)
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(new FormData(e.currentTarget)); }} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
          <input type="text" name="name" defaultValue={product.name} required className="w-full border-gray-300 rounded-md shadow-sm border px-3 py-2 text-gray-900" />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <button 
              type="button" 
              onClick={() => setIsNewCategory(!isNewCategory)}
              className="text-xs text-indigo-600 hover:text-indigo-900 font-medium"
            >
              {isNewCategory ? 'Select Existing' : '+ Add New'}
            </button>
          </div>
          {isNewCategory ? (
            <input 
              type="text" 
              name="category" 
              placeholder="Enter new category name..."
              className="w-full border-gray-300 rounded-md shadow-sm border px-3 py-2 text-gray-900" 
              required
            />
          ) : (
            <select 
              name="category" 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm border px-3 py-2 text-gray-900 bg-white"
              required
            >
              <option value="" disabled>Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients</label>
        <textarea name="ingredients" defaultValue={product.ingredients || ''} rows={3} className="w-full border-gray-300 rounded-md shadow-sm border px-3 py-2 text-gray-900" placeholder="E.g. Raw Mango, Mustard Oil, Fenugreek..."></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-gray-50 p-4 rounded border border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
          {imagePreview && (
            <div className="mb-2 w-32 h-32 relative rounded overflow-hidden border border-gray-300">
              <img src={imagePreview} alt="Current" className="w-full h-full object-cover" />
            </div>
          )}
          <input type="file" name="imageFile" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
          <p className="text-xs text-gray-500 mt-1">Select a new image to replace the current one. Recommended: 1080x1080 (1:1 square).</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hover Video (Optional)</label>
          {videoPreview && (
            <div className="mb-2">
              <div className="w-32 h-32 relative rounded overflow-hidden border border-gray-300 bg-black mb-2">
                <video ref={videoRef} src={videoPreview} className="w-full h-full object-cover" muted loop style={{ transform: `scale(${videoScale})` }} />
              </div>
              <button type="button" onClick={togglePlay} className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200">
                {isPlaying ? 'Pause Video' : 'Play Video'}
              </button>
            </div>
          )}
          
          <div className="mb-3 bg-white p-2 rounded border border-gray-200">
            <label className="block text-xs font-medium text-gray-700 flex justify-between mb-2">
              <span>Video Zoom: {videoScale.toFixed(1)}x</span>
              <button type="button" className="text-indigo-600 hover:underline" onClick={() => setVideoScale(1.0)}>Reset</button>
            </label>
            <div className="flex items-center gap-2">
              <button type="button" className="bg-gray-200 px-2 py-1 rounded text-sm font-bold w-8 hover:bg-gray-300" onClick={() => setVideoScale(Math.max(0.5, videoScale - 0.1))}>-</button>
              <input type="range" min="0.5" max="2.5" step="0.1" value={videoScale} onChange={(e) => setVideoScale(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
              <button type="button" className="bg-gray-200 px-2 py-1 rounded text-sm font-bold w-8 hover:bg-gray-300" onClick={() => setVideoScale(Math.min(2.5, videoScale + 0.1))}>+</button>
            </div>
            <input type="hidden" name="videoScale" value={videoScale} />
          </div>

          <input type="file" name="videoFile" accept="video/mp4,video/webm" onChange={handleVideoChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
          <p className="text-xs text-gray-500 mt-1">Select a new video to replace the current one. Recommended: 1080x1080 (1:1 square).</p>
          <p className="text-xs text-gray-500 mt-1">Short .mp4 clip (no audio) to play on hover.</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Variants</label>
          <button type="button" onClick={handleAddVariant} className="text-sm text-indigo-600 hover:text-indigo-900">+ Add Variant</button>
        </div>
        
        {variants.length === 0 ? (
          <p className="text-sm text-gray-500">No variants added yet.</p>
        ) : (
          <div className="space-y-3">
            {variants.map((v, i) => (
              <div key={i} className="flex gap-4 items-center bg-gray-50 p-3 rounded border border-gray-200">
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Weight/Size</label>
                  <input type="text" name={`variant_weight_${i}`} value={v.weight} onChange={(e) => handleVariantChange(i, 'weight', e.target.value)} required className="w-full border-gray-300 rounded-md border px-2 py-1 text-sm mt-1 text-gray-900" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Price (₹)</label>
                  <input type="number" name={`variant_price_${i}`} value={v.price} onChange={(e) => handleVariantChange(i, 'price', e.target.value)} required className="w-full border-gray-300 rounded-md border px-2 py-1 text-sm mt-1 text-gray-900" />
                </div>
                <button type="button" onClick={() => handleRemoveVariant(i)} className="text-red-500 hover:text-red-700 font-bold px-2 mt-5">X</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <a href="/products" className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">Cancel</a>
        <button type="submit" className="px-4 py-2 bg-orange-500 text-white font-medium hover:bg-orange-600 rounded-md transition-colors">Save Changes</button>
      </div>
    </form>
  )
}
