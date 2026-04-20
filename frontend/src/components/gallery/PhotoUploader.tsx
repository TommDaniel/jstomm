import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '@/lib/api'

interface PhotoUploaderProps {
  albumId: number
  onUploaded: () => void
}

interface UploadFile {
  file: File
  preview: string
  progress: number
  error?: string
  done?: boolean
}

export default function PhotoUploader({ albumId, onUploaded }: PhotoUploaderProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles = accepted.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
    }))
    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
  })

  async function uploadAll() {
    if (files.length === 0 || uploading) return
    setUploading(true)

    for (let i = 0; i < files.length; i++) {
      const item = files[i]
      if (item.done || item.error) continue

      const formData = new FormData()
      formData.append('photos[]', item.file)

      try {
        await api.post(`/albums/${albumId}/photos`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            const pct = Math.round(((e.loaded ?? 0) * 100) / (e.total ?? 1))
            setFiles((prev) =>
              prev.map((f, idx) => (idx === i ? { ...f, progress: pct } : f)),
            )
          },
        })
        setFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, progress: 100, done: true } : f)),
        )
      } catch {
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, error: 'Erro ao enviar' } : f,
          ),
        )
      }
    }

    setUploading(false)
    onUploaded()
    setTimeout(() => {
      setFiles([])
    }, 2000)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-dourado-vintage bg-dourado-vintage/10'
            : 'border-madeira-clara/30 hover:border-dourado-vintage/50 hover:bg-verde-musgo/20'
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-4xl mb-3">{isDragActive ? '📂' : '📸'}</p>
        <p className="font-sans text-creme-papel/70 text-base">
          {isDragActive
            ? 'Solte as fotos aqui!'
            : 'Arraste fotos aqui ou clique para selecionar'}
        </p>
        <p className="font-sans text-creme-papel/40 text-sm mt-1">PNG, JPG até 10MB cada</p>
      </div>

      {/* Preview grid */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-4">
              {files.map((item, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                  <img
                    src={item.preview}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {/* Progress bar */}
                  {uploading && !item.done && !item.error && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
                      <div
                        className="h-full bg-dourado-vintage transition-all"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                  {item.done && (
                    <div className="absolute inset-0 bg-verde-musgo/60 flex items-center justify-center">
                      <span className="text-2xl">✓</span>
                    </div>
                  )}
                  {item.error && (
                    <div className="absolute inset-0 bg-red-900/60 flex items-center justify-center">
                      <span className="text-xs text-white">Erro</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={uploadAll}
              disabled={uploading}
              className="btn-primary w-full text-lg h-14"
            >
              {uploading ? 'Enviando...' : `Enviar ${files.length} foto${files.length > 1 ? 's' : ''}`}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
