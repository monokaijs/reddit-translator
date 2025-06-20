import { useRef, useState } from 'react';

interface ImportInputProps {
  onImport: (file: File) => void;
  loading: boolean;
}

export function ImportInput({ onImport, loading }: ImportInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      onImport(file);
    } else {
      alert('Please select a JSON file.');
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="import-section">
      <button
        onClick={handleButtonClick}
        disabled={loading}
        className="import-button sidebar-import"
      >
        {loading ? (
          <>
            <span className="import-icon">⏳</span>
            Loading...
          </>
        ) : (
          <>
            <span className="import-icon">📁</span>
            Import Data
          </>
        )}
      </button>

      <div
        className={`drop-zone sidebar-drop-zone ${dragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <span className="drop-text">
          or drag & drop JSON file
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}
