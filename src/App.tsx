import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import { searchDocuments } from './api';
import type { DocumentResult, SearchResponse } from './types';
import type {
  DocumentSpecific,
  ImageSpecific,
  CadSpecific,
} from './types';

function App() {
  // ── State ──
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DocumentResult[]>([]);
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocumentResult | null>(null);

  // ── Refs ──
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Cursor Aura ──
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
      if (cursorDotRef.current) {
        cursorDotRef.current.style.left = `${e.clientX}px`;
        cursorDotRef.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // ── Traveling Glow ──
  const moveGlowTo = useCallback((el: HTMLElement | null) => {
    if (!glowRef.current || !el) return;
    const rect = el.getBoundingClientRect();
    glowRef.current.style.left = `${rect.left + rect.width / 2}px`;
    glowRef.current.style.top = `${rect.top + rect.height / 2}px`;
    glowRef.current.style.opacity = '1';
  }, []);

  // Focus glow on search input when in landing
  useEffect(() => {
    if (!hasSearched && searchInputRef.current) {
      const timer = setTimeout(() => moveGlowTo(searchInputRef.current), 300);
      return () => clearTimeout(timer);
    }
  }, [hasSearched, moveGlowTo]);

  // ── Browser History ──
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const state = e.state as { view?: string } | null;
      if (!state || state.view === 'landing') {
        // Back to landing
        setQuery('');
        setResults([]);
        setSearchTags([]);
        setHasSearched(false);
        setError(null);
        setSelectedDoc(null);
      } else if (state.view === 'results') {
        // Back to results from detail
        setSelectedDoc(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // ── Search with debounce ──
  const performSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      setSearchTags([]);
      setHasSearched(false);
      setError(null);
      setSelectedDoc(null);
      return;
    }

    setIsSearching(true);
    setError(null);
    if (!hasSearched) {
      window.history.pushState({ view: 'results' }, '');
    }
    setHasSearched(true);
    setSelectedDoc(null);

    try {
      const res: SearchResponse = await searchDocuments(trimmed);
      // Sort by _matchCount desc
      const sorted = [...(res.data || [])].sort(
        (a, b) => b._matchCount - a._matchCount
      );
      setResults(sorted);
      setSearchTags(res.searchTags || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setError(msg);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(value), 400);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSearchTags([]);
    setHasSearched(false);
    setError(null);
    setSelectedDoc(null);
    searchInputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') handleClear();
  };

  const goHome = () => {
    window.history.pushState({ view: 'landing' }, '');
    handleClear();
  };

  // ── Match level helper ──
  const getMatchLevel = (matchCount: number): string => {
    const total = searchTags.length;
    if (total === 0) return 'low';
    const ratio = matchCount / total;
    if (ratio >= 0.8) return 'high';
    if (ratio >= 0.4) return 'medium';
    return 'low';
  };

  // ── Category icon helper ──
  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'document': return '📄';
      case 'image': return '🖼️';
      case 'cad': return '📐';
      default: return '📁';
    }
  };

  // ── Format date ──
  const formatDate = (iso: string): string => {
    try {
      return new Date(iso).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  // ═══════════════════════════════════════════
  // SEARCH BAR component (shared between landing + header)
  // ═══════════════════════════════════════════
  const SearchBar = (
    <div className="search-wrapper">
      <div className="search-input-container">
        <svg
          className="search-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={searchInputRef}
          id="search-input"
          type="text"
          className="search-input"
          placeholder="Buscar documentos..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => moveGlowTo(searchInputRef.current)}
          autoComplete="off"
          spellCheck={false}
        />
        {isSearching && <div className="search-spinner" />}
        {!isSearching && query && (
          <button className="search-clear" onClick={handleClear} aria-label="Limpiar búsqueda">
            ✕
          </button>
        )}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════
  // DOCUMENT DETAIL VIEW
  // ═══════════════════════════════════════════
  const renderDocumentDetail = (doc: DocumentResult) => {
    const meta = doc.metadata;
    const specific = meta?.specific;
    const category = meta?.category ?? 'other';

    return (
      <div className="detail-view">
        <button className="detail-back" onClick={() => window.history.back()}>
          ← Volver a resultados
        </button>

        <div className="detail-header">
          <h1 className="detail-title">{doc.title}</h1>
          {doc.description && (
            <p className="detail-desc">{doc.description}</p>
          )}
          <div className="detail-badges">
            <span className="detail-badge badge-category">
              {getCategoryIcon(category)} {category}
            </span>
            <span className="detail-badge badge-version">
              v{doc.versionNumber}
            </span>
            {doc.isLatest && (
              <span className="detail-badge badge-latest">Latest</span>
            )}
          </div>
        </div>

        <div className="detail-sections">
          {/* ── General Info ── */}
          <div className="detail-section">
            <h2 className="detail-section-title">Información General</h2>
            <div className="detail-grid">
              {doc.authorName && (
                <div className="detail-field">
                  <div className="detail-field-label">Autor</div>
                  <div className="detail-field-value">{doc.authorName}</div>
                </div>
              )}
              {doc.companyName && (
                <div className="detail-field">
                  <div className="detail-field-label">Empresa</div>
                  <div className="detail-field-value">{doc.companyName}</div>
                </div>
              )}
              <div className="detail-field">
                <div className="detail-field-label">ID</div>
                <div className="detail-field-value secondary" style={{ fontSize: 11 }}>
                  {doc.id}
                </div>
              </div>
              <div className="detail-field">
                <div className="detail-field-label">Sincronizado</div>
                <div className="detail-field-value">{formatDate(doc.syncedAt)}</div>
              </div>
              {doc.filePath && (
                <div className="detail-field">
                  <div className="detail-field-label">Ruta</div>
                  <div className="detail-field-value secondary" style={{ fontSize: 12 }}>
                    {doc.filePath}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── File Metadata (Universal) ── */}
          {meta && (
            <div className="detail-section">
              <h2 className="detail-section-title">Metadata del Archivo</h2>
              <div className="detail-grid">
                <div className="detail-field">
                  <div className="detail-field-label">Tamaño</div>
                  <div className="detail-field-value">{meta.fileSize}</div>
                </div>
                <div className="detail-field">
                  <div className="detail-field-label">Tipo MIME</div>
                  <div className="detail-field-value">{meta.mimeType}</div>
                </div>
                <div className="detail-field">
                  <div className="detail-field-label">Extensión</div>
                  <div className="detail-field-value">{meta.extension}</div>
                </div>
                {meta.createdOnDisk && (
                  <div className="detail-field">
                    <div className="detail-field-label">Creado en disco</div>
                    <div className="detail-field-value">
                      {formatDate(meta.createdOnDisk)}
                    </div>
                  </div>
                )}
                {meta.modifiedOnDisk && (
                  <div className="detail-field">
                    <div className="detail-field-label">Modificado en disco</div>
                    <div className="detail-field-value">
                      {formatDate(meta.modifiedOnDisk)}
                    </div>
                  </div>
                )}
                {meta.checksum && (
                  <div className="detail-field">
                    <div className="detail-field-label">Checksum (MD5)</div>
                    <div className="detail-field-value secondary" style={{ fontSize: 11 }}>
                      {meta.checksum}
                    </div>
                  </div>
                )}
                {meta.sha256 && (
                  <div className="detail-field">
                    <div className="detail-field-label">SHA-256</div>
                    <div className="detail-field-value secondary" style={{ fontSize: 10 }}>
                      {meta.sha256}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Specific Metadata (by category) ── */}
          {specific && Object.keys(specific).length > 0 && (
            <div className="detail-section">
              <h2 className="detail-section-title">
                Metadata Específica — {category}
              </h2>
              {category === 'document' && renderDocumentSpecific(specific as DocumentSpecific)}
              {category === 'image' && renderImageSpecific(specific as ImageSpecific)}
              {category === 'cad' && renderCadSpecific(specific as CadSpecific)}
              {!['document', 'image', 'cad'].includes(category) &&
                renderDynamicSpecific(specific as Record<string, unknown>)}
            </div>
          )}

          {/* ── Tags ── */}
          {meta?.tags && meta.tags.length > 0 && (
            <div className="detail-section">
              <h2 className="detail-section-title">Tags</h2>
              <div className="detail-tags">
                {meta.tags.map((tag, i) => (
                  <span key={i} className="detail-tag">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Category-specific renderers ──
  const renderDocumentSpecific = (s: DocumentSpecific) => (
    <div className="detail-grid">
      {s.authorOriginal !== undefined && (
        <div className="detail-field">
          <div className="detail-field-label">Autor Original (archivo)</div>
          <div className="detail-field-value">{s.authorOriginal ?? 'N/A'}</div>
        </div>
      )}
      {s.pageCount !== undefined && (
        <div className="detail-field">
          <div className="detail-field-label">Páginas</div>
          <div className="detail-field-value">{s.pageCount ?? 'N/A'}</div>
        </div>
      )}
      {s.hasImages !== undefined && (
        <div className="detail-field">
          <div className="detail-field-label">Contiene Imágenes</div>
          <div className="detail-field-value">{s.hasImages ? 'Sí' : 'No'}</div>
        </div>
      )}
      {s.language !== undefined && (
        <div className="detail-field">
          <div className="detail-field-label">Idioma</div>
          <div className="detail-field-value">{s.language ?? 'N/A'}</div>
        </div>
      )}
    </div>
  );

  const renderImageSpecific = (s: ImageSpecific) => (
    <div className="detail-grid">
      {s.dimensions && (
        <div className="detail-field">
          <div className="detail-field-label">Dimensiones</div>
          <div className="detail-field-value">{s.dimensions}</div>
        </div>
      )}
      {s.width != null && (
        <div className="detail-field">
          <div className="detail-field-label">Ancho</div>
          <div className="detail-field-value">{s.width}px</div>
        </div>
      )}
      {s.height != null && (
        <div className="detail-field">
          <div className="detail-field-label">Alto</div>
          <div className="detail-field-value">{s.height}px</div>
        </div>
      )}
      {s.colorSpace && (
        <div className="detail-field">
          <div className="detail-field-label">Espacio de Color</div>
          <div className="detail-field-value">{s.colorSpace}</div>
        </div>
      )}
      {s.exifData && (
        <>
          {s.exifData.make && (
            <div className="detail-field">
              <div className="detail-field-label">Cámara (Marca)</div>
              <div className="detail-field-value">{s.exifData.make}</div>
            </div>
          )}
          {s.exifData.model && (
            <div className="detail-field">
              <div className="detail-field-label">Cámara (Modelo)</div>
              <div className="detail-field-value">{s.exifData.model}</div>
            </div>
          )}
          {s.exifData.dateTaken && (
            <div className="detail-field">
              <div className="detail-field-label">Fecha de Captura</div>
              <div className="detail-field-value">
                {formatDate(s.exifData.dateTaken)}
              </div>
            </div>
          )}
          {s.exifData.gps && (
            <div className="detail-field">
              <div className="detail-field-label">GPS</div>
              <div className="detail-field-value">
                {s.exifData.gps.lat}, {s.exifData.gps.lng}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderCadSpecific = (s: CadSpecific) => (
    <div className="detail-grid">
      {s.softwareVersion && (
        <div className="detail-field">
          <div className="detail-field-label">Software</div>
          <div className="detail-field-value">{s.softwareVersion}</div>
        </div>
      )}
      {s.layers && s.layers.length > 0 && (
        <div className="detail-field" style={{ gridColumn: '1 / -1' }}>
          <div className="detail-field-label">Capas ({s.layers.length})</div>
          <div className="detail-field-value">
            {s.layers.join(' · ')}
          </div>
        </div>
      )}
    </div>
  );

  const renderDynamicSpecific = (s: Record<string, unknown>) => (
    <div>
      {Object.entries(s).map(([key, value]) => (
        <div key={key} className="detail-dynamic-row">
          <span className="detail-dynamic-key">{key}</span>
          <span className="detail-dynamic-value">
            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
          </span>
        </div>
      ))}
    </div>
  );

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════
  return (
    <>
      {/* Cursor aura */}
      <div ref={cursorRef} className="cursor-aura" />
      <div ref={cursorDotRef} className="cursor-dot" />
      {/* Traveling glow */}
      <div ref={glowRef} className="traveling-glow" style={{ opacity: 0 }} />

      <div className="app-container">
        {/* ── LANDING STATE ── */}
        {!hasSearched && (
          <div className="landing">
            <h1 className="app-title">
              <svg className="bolt-icon bolt-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              AuraDoc
            </h1>
            {SearchBar}
          </div>
        )}

        {/* ── SEARCH ACTIVE STATE ── */}
        {hasSearched && (
          <>
            <header className="header">
              <span className="app-title" onClick={goHome} role="button" tabIndex={0}>
                <svg className="bolt-icon bolt-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                AuraDoc
              </span>
              {SearchBar}
            </header>

            {/* Detail or Results */}
            {selectedDoc ? (
              renderDocumentDetail(selectedDoc)
            ) : (
              <div className="results-area">
                {/* Results meta */}
                {results.length > 0 && (
                  <div className="results-meta">
                    <span>
                      {results.length} resultado{results.length !== 1 ? 's' : ''}
                    </span>
                    {searchTags.length > 0 && (
                      <div className="results-tags">
                        {searchTags.map((tag) => (
                          <span key={tag} className="tag-pill">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="search-error">{error}</div>
                )}

                {/* No results */}
                {!error && !isSearching && results.length === 0 && (
                  <div className="no-results">
                    <div className="no-results-icon">◇</div>
                    <p>No se encontraron documentos</p>
                  </div>
                )}

                {/* Result cards */}
                {results.length > 0 && (
                  <div className="results-list">
                    {results.map((doc) => {
                      const level = getMatchLevel(doc._matchCount);
                      const meta = doc.metadata;
                      return (
                        <div
                          key={doc.id}
                          className="result-card"
                          onClick={() => {
                            window.history.pushState({ view: 'detail' }, '');
                            setSelectedDoc(doc);
                          }}
                          onMouseEnter={(e) => moveGlowTo(e.currentTarget)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              window.history.pushState({ view: 'detail' }, '');
                              setSelectedDoc(doc);
                            }
                          }}
                        >
                          <div className="result-card-header">
                            <span className="result-card-title">
                              {getCategoryIcon(meta?.category ?? 'other')}{' '}
                              {doc.title}
                            </span>
                            <span className={`result-card-match match-${level}`}>
                              {doc._matchCount}/{searchTags.length}
                            </span>
                          </div>
                          {doc.description && (
                            <p className="result-card-desc">{doc.description}</p>
                          )}
                          <div className="result-card-footer">
                            {meta?.extension && (
                              <span className="result-card-meta">
                                {meta.extension}
                              </span>
                            )}
                            {meta?.fileSize && (
                              <>
                                <span className="dot" />
                                <span className="result-card-meta">
                                  {meta.fileSize}
                                </span>
                              </>
                            )}
                            {doc.companyName && (
                              <>
                                <span className="dot" />
                                <span className="result-card-meta">
                                  {doc.companyName}
                                </span>
                              </>
                            )}
                            {doc.authorName && (
                              <>
                                <span className="dot" />
                                <span className="result-card-meta">
                                  {doc.authorName}
                                </span>
                              </>
                            )}
                            <span className="result-card-meta" style={{ marginLeft: 'auto' }}>
                              v{doc.versionNumber}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default App;
