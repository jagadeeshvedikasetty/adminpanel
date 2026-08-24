import { getDecorations } from './actions'
import StudioClient from './StudioClient'

export default async function StudioPage() {
  const decorations = await getDecorations()

  return <StudioClient initialDecorations={decorations} />
}
