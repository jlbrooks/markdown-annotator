import { useState, useEffect } from 'react'
import InputView from './components/InputView'
import AnnotationView from './components/AnnotationView'

function App() {
  const [markdownContent, setMarkdownContent] = useState('')
  const [annotations, setAnnotations] = useState([])
  const [currentView, setCurrentView] = useState('input') // 'input' or 'annotate'

  // Load markdown from URL query parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlMarkdown = params.get('markdown') || params.get('md')

    if (urlMarkdown) {
      try {
        // Try to decode as base64 first
        const decoded = atob(urlMarkdown)
        setMarkdownContent(decoded)
      } catch (e) {
        // If base64 fails, use URL-decoded value
        setMarkdownContent(decodeURIComponent(urlMarkdown))
      }
    }
  }, [])

  const handleStartAnnotating = () => {
    if (markdownContent.trim()) {
      setCurrentView('annotate')
    }
  }

  const handleBackToEdit = () => {
    setCurrentView('input')
  }

  const handleAddAnnotation = (annotation) => {
    setAnnotations([...annotations, { ...annotation, id: Date.now().toString() }])
  }

  const handleDeleteAnnotation = (id) => {
    setAnnotations(annotations.filter(a => a.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'input' ? (
        <InputView
          content={markdownContent}
          onChange={setMarkdownContent}
          onStartAnnotating={handleStartAnnotating}
        />
      ) : (
        <AnnotationView
          content={markdownContent}
          annotations={annotations}
          onAddAnnotation={handleAddAnnotation}
          onDeleteAnnotation={handleDeleteAnnotation}
          onBackToEdit={handleBackToEdit}
        />
      )}
    </div>
  )
}

export default App
