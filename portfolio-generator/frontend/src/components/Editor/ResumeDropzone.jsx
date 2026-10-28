import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Loader2, X, CheckCircle, Sparkles } from 'lucide-react';
import api from '../../api/client';

export default function ResumeDropzone({ onParsedSections, isOpen, onClose }) {
  const [dragActive, setDragActive] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processResume = async ({ text = '', file = null }) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (file) {
        response = await api.parseResume(null, file);
      } else {
        response = await api.parseResume(text);
      }

      if (response && response.sections) {
        onParsedSections(response.sections);
        onClose();
      } else {
        throw new Error('No structured sections returned from AI parser.');
      }
    } catch (err) {
      console.error('Resume parsing failed:', err);
      setError(err.message || 'Resume parsing failed. Please check the file and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processResume({ file });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processResume({ file: e.target.files[0] });
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!pastedText.trim()) return;
    processResume({ text: pastedText });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-apple-lg shadow-2xl border border-border-gray/20 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border-gray/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-accent-blue/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-accent-blue" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-dark-charcoal">
                Import Resume with Gemini AI
              </h2>
              <p className="text-xs text-border-gray">
                Auto-extract sections, experiences, projects, and skills
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-border-gray hover:text-dark-charcoal hover:bg-bg-slate transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* File Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-apple p-6 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-accent-blue bg-accent-blue/5'
                : 'border-border-gray/30 hover:border-accent-blue hover:bg-bg-slate/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            <UploadCloud className="w-8 h-8 text-border-gray mx-auto mb-2" />
            <p className="text-xs font-medium text-dark-charcoal">
              Drag & drop your resume file here, or{' '}
              <span className="text-accent-blue underline">browse</span>
            </p>
            <p className="text-[11px] text-border-gray mt-1">Supports TXT, PDF, and DOCX files up to 5 MB</p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex-1 h-px bg-border-gray/20" />
            <span className="text-[11px] uppercase tracking-wider text-border-gray font-semibold">
              or paste resume text
            </span>
            <div className="flex-1 h-px bg-border-gray/20" />
          </div>

          {/* Paste Text Area */}
          <form onSubmit={handleTextSubmit} className="space-y-3">
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste raw resume or LinkedIn summary here..."
              rows={6}
              className="w-full text-xs p-3 rounded-apple border border-border-gray/30 bg-bg-slate/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all resize-none"
            />

            {error && <p className="text-xs text-red-500">{error}</p>}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-dark-charcoal/70 hover:text-dark-charcoal rounded-apple hover:bg-bg-slate transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !pastedText.trim()}
                className="px-5 py-2 text-xs font-medium text-white bg-dark-charcoal hover:bg-dark-charcoal/90 rounded-apple disabled:opacity-50 transition-all flex items-center space-x-1.5 shadow-apple-subtle"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-accent-blue" />
                    <span>Generate Structured Portfolio</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

