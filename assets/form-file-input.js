/**
 * Better Horizon — Form File Input Web Component
 * Native custom element managing single and multi-file uploads with live media preview,
 * in-place dropzone replacement, format/size validation, and "Add more" controls across all layouts.
 *
 * @module form-file-input
 */

import { StandardEvents } from '@shopify/events';

export class FormFileInput extends HTMLElement {
  /** @type {((event: any) => void) | null} */
  #cartAddEventBound = null;

  /** @type {HTMLInputElement | null} */
  fileInput = null;

  /** @type {HTMLElement | null} */
  dropzone = null;

  /** @type {HTMLElement | null} */
  fileList = null;

  /** @type {HTMLElement | null} */
  previewStage = null;

  /** @type {HTMLElement | null} */
  errorMessage = null;

  /** @type {HTMLElement | null} */
  liveRegion = null;

  /** @type {File[]} */
  selectedFiles = [];

  /** @type {Map<File, string>} */
  objectUrls = new Map();

  /** @type {File | null} */
  activePreviewFile = null;

  /** @type {number} */
  maxSizeBytes = 10 * 1024 * 1024;

  /** @type {string[]} */
  allowedExtensions = [];

  /** @type {boolean} */
  isMultiple = false;

  connectedCallback() {
    this.fileInput = this.querySelector('input[type="file"]');
    this.dropzone = this.querySelector('[data-dropzone]');
    this.fileList = this.querySelector('[data-file-list]');
    this.previewStage = this.querySelector('[data-preview-stage]');
    this.errorMessage = this.querySelector('[data-error-message]');
    this.liveRegion = this.querySelector('[data-live-region]');

    const maxMb = parseFloat(this.dataset.maxSizeMb || '10');
    this.maxSizeBytes = (isNaN(maxMb) ? 10 : maxMb) * 1024 * 1024;
    this.isMultiple = this.hasAttribute('data-multiple');

    const acceptAttr = this.dataset.accept || '';
    if (acceptAttr && acceptAttr !== '*') {
      this.allowedExtensions = acceptAttr
        .split(',')
        .map((ext) => ext.trim().toLowerCase())
        .filter(Boolean);
    }

    this.#bindEvents();

    this.#cartAddEventBound = (event) => {
      if (event.action === 'add') {
        event.promise?.then(() => this.clear()).catch(() => {});
      }
    };
    document.addEventListener(StandardEvents.cartLinesUpdate, this.#cartAddEventBound);
  }

  disconnectedCallback() {
    this.#revokeAllUrls();
    if (this.#cartAddEventBound) {
      document.removeEventListener(StandardEvents.cartLinesUpdate, this.#cartAddEventBound);
      this.#cartAddEventBound = null;
    }
  }

  /**
   * Resets all selected files, revokes temporary URLs, and renders dropzone.
   * @returns {void}
   */
  clear() {
    this.#revokeAllUrls();
    this.selectedFiles = [];
    this.activePreviewFile = null;
    if (this.fileInput) {
      this.fileInput.value = '';
    }
    this.#syncNativeInput();
    this.#render();
  }

  #bindEvents() {
    if (this.fileInput) {
      this.fileInput.addEventListener('change', this.#handleInputChange.bind(this));
    }

    // Drag & Drop on component container & dropzone
    this.addEventListener('dragover', this.#handleDragOver.bind(this));
    this.addEventListener('dragleave', this.#handleDragLeave.bind(this));
    this.addEventListener('drop', this.#handleDrop.bind(this));

    if (this.dropzone) {
      this.dropzone.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.fileInput?.click();
        }
      });
    }

    if (this.fileList) {
      this.fileList.addEventListener('click', this.#handleFileListClick.bind(this));
    }

    if (this.previewStage) {
      this.previewStage.addEventListener('click', this.#handlePreviewStageClick.bind(this));
    }
  }

  /**
   * @param {DragEvent} e
   */
  #handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.dropzone && !this.dropzone.hidden) {
      this.dropzone.classList.add('custom-form__file-dropzone--dragover');
    }
  }

  /**
   * @param {DragEvent} e
   */
  #handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.dropzone) {
      this.dropzone.classList.remove('custom-form__file-dropzone--dragover');
    }
  }

  /**
   * @param {DragEvent} e
   */
  #handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.dropzone) {
      this.dropzone.classList.remove('custom-form__file-dropzone--dragover');
    }

    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      this.#processFiles(Array.from(e.dataTransfer.files));
    }
  }

  get files() {
    return this.selectedFiles;
  }

  /**
   * @param {Event} e
   */
  #handleInputChange(e) {
    const target = /** @type {HTMLInputElement} */ (e.target);
    if (target.files && target.files.length > 0) {
      this.#processFiles(Array.from(target.files));
    }
  }

  /**
   * Validates and processes incoming files.
   * @param {File[]} incomingFiles
   */
  #processFiles(incomingFiles) {
    this.#clearError();

    const maxCount = parseInt(this.dataset.maxFiles || '5', 10);
    const validFiles = [];
    const errors = [];

    for (const file of incomingFiles) {
      // Size validation
      if (file.size > this.maxSizeBytes) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        const limitMb = (this.maxSizeBytes / (1024 * 1024)).toFixed(0);
        errors.push(`"${file.name}" (${sizeMb} MB) exceeds the ${limitMb} MB limit.`);
        continue;
      }

      // Extension validation
      if (this.allowedExtensions.length > 0) {
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        const type = file.type.toLowerCase();
        const matches = this.allowedExtensions.some((allowed) => {
          if (allowed.startsWith('.')) return ext === allowed;
          if (allowed.endsWith('/*')) {
            const group = allowed.replace('/*', '');
            return type.startsWith(group);
          }
          return type === allowed;
        });

        if (!matches) {
          errors.push(`"${file.name}" has an unsupported file format.`);
          continue;
        }
      }

      validFiles.push(file);
    }

    if (errors.length > 0) {
      this.#showError(errors.join(' '));
    }

    if (validFiles.length === 0) return;

    if (this.isMultiple) {
      const combined = [...this.selectedFiles, ...validFiles];
      if (combined.length > maxCount) {
        this.#showError(`Maximum ${maxCount} files allowed.`);
        this.selectedFiles = combined.slice(0, maxCount);
      } else {
        this.selectedFiles = combined;
      }
      this.activePreviewFile = this.selectedFiles[this.selectedFiles.length - 1];
    } else {
      this.selectedFiles = [validFiles[0]];
      this.activePreviewFile = validFiles[0];
    }

    this.#syncNativeInput();
    this.#render();
    this.#announce();
  }

  /**
   * Synchronizes internal files array with native input.
   */
  #syncNativeInput() {
    if (!this.fileInput) return;
    if (this.selectedFiles.length === 0) {
      this.fileInput.value = '';
      return;
    }
    try {
      const dt = new DataTransfer();
      for (const file of this.selectedFiles) {
        dt.items.add(file);
      }
      this.fileInput.files = dt.files;
    } catch {
      // Fallback for restricted environments
    }
  }

  /**
   * @param {File} file
   * @returns {string}
   */
  #getObjectUrl(file) {
    if (!this.objectUrls.has(file)) {
      this.objectUrls.set(file, URL.createObjectURL(file));
    }
    return /** @type {string} */ (this.objectUrls.get(file));
  }

  /**
   * @param {File} file
   */
  #revokeUrl(file) {
    if (this.objectUrls.has(file)) {
      URL.revokeObjectURL(/** @type {string} */ (this.objectUrls.get(file)));
      this.objectUrls.delete(file);
    }
  }

  #revokeAllUrls() {
    for (const url of this.objectUrls.values()) {
      URL.revokeObjectURL(url);
    }
    this.objectUrls.clear();
  }

  /**
   * Handles clicks in the uploaded file list (selection, deletion, add more).
   * @param {MouseEvent} e
   */
  #handleFileListClick(e) {
    const target = /** @type {HTMLElement} */ (e.target);

    // "Add more" button click
    const addMoreBtn = target.closest('[data-add-more]');
    if (addMoreBtn) {
      e.stopPropagation();
      this.fileInput?.click();
      return;
    }

    // Remove button click
    const removeBtn = target.closest('[data-remove-index]');
    if (removeBtn) {
      e.stopPropagation();
      const index = parseInt(removeBtn.getAttribute('data-remove-index') || '-1', 10);
      this.#removeFileAtIndex(index);
      return;
    }

    // Thumbnail / Card preview selection
    const card = target.closest('[data-file-index]');
    if (card) {
      const index = parseInt(card.getAttribute('data-file-index') || '-1', 10);
      if (index >= 0 && index < this.selectedFiles.length) {
        this.activePreviewFile = this.selectedFiles[index];
        this.#render();
      }
    }
  }

  /**
   * Handles clicks on the main preview stage (e.g. remove cross button).
   * @param {MouseEvent} e
   */
  #handlePreviewStageClick(e) {
    const target = /** @type {HTMLElement} */ (e.target);
    const removeBtn = target.closest('[data-remove-index]');
    if (removeBtn) {
      e.stopPropagation();
      const index = parseInt(removeBtn.getAttribute('data-remove-index') || '-1', 10);
      if (index >= 0) {
        this.#removeFileAtIndex(index);
      } else if (this.activePreviewFile) {
        const activeIdx = this.selectedFiles.indexOf(this.activePreviewFile);
        if (activeIdx >= 0) this.#removeFileAtIndex(activeIdx);
      }
    }
  }

  /**
   * @param {number} index
   */
  #removeFileAtIndex(index) {
    if (index >= 0 && index < this.selectedFiles.length) {
      const removed = this.selectedFiles.splice(index, 1)[0];
      this.#revokeUrl(removed);

      if (this.activePreviewFile === removed) {
        this.activePreviewFile = this.selectedFiles.length > 0 ? this.selectedFiles[this.selectedFiles.length - 1] : null;
      }

      this.#syncNativeInput();
      this.#render();
      this.#announce();
    }
  }

  #render() {
    const hasFiles = this.selectedFiles.length > 0;

    // Toggle dropzone visibility in place: visible when 0 files, hidden when files exist
    if (this.dropzone) {
      this.dropzone.hidden = hasFiles;
      this.dropzone.style.display = hasFiles ? 'none' : '';
    }

    this.#renderPreviewStage();
    this.#renderFileList();
  }

  #renderFileList() {
    if (!this.fileList) return;

    // In single-file mode, file list is not shown (preview replaces dropzone)
    if (!this.isMultiple || this.selectedFiles.length === 0) {
      this.fileList.innerHTML = '';
      this.fileList.hidden = true;
      this.fileList.style.display = 'none';
      return;
    }

    this.fileList.hidden = false;
    this.fileList.style.display = '';
    const layout = this.dataset.layout || 'list';
    const maxCount = parseInt(this.dataset.maxFiles || '5', 10);
    const canAddMore = this.selectedFiles.length < maxCount;

    this.fileList.className = `custom-form__file-list custom-form__file-list--${layout}`;

    let html = this.selectedFiles
      .map((file, idx) => {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const isMedia = isImage || isVideo;
        const isActive = this.activePreviewFile === file;
        const url = isMedia ? this.#getObjectUrl(file) : '';
        const formattedSize = this.#formatFileSize(file.size);

        if (layout === 'grid') {
          return `
            <div
              class="custom-form__file-card custom-form__file-card--grid ${isActive ? 'custom-form__file-card--active' : ''}"
              data-file-index="${idx}"
              role="button"
              tabindex="0"
              aria-label="Preview ${this.#escapeHtml(file.name)}"
              aria-current="${isActive ? 'true' : 'false'}"
            >
              <div class="custom-form__file-thumb-box">
                ${
                  isImage
                    ? `<img src="${url}" alt="${this.#escapeHtml(file.name)}" class="custom-form__file-thumb-img" loading="lazy" />`
                    : isVideo
                    ? `<video src="${url}" class="custom-form__file-thumb-video" preload="metadata"></video><span class="custom-form__file-badge-media" aria-hidden="true">▶</span>`
                    : `<span class="custom-form__file-icon-doc" aria-hidden="true">${this.#getFileIcon(file.name)}</span>`
                }
              </div>
              <span class="custom-form__file-name" title="${this.#escapeHtml(file.name)}">${this.#escapeHtml(file.name)}</span>
              <button
                type="button"
                class="custom-form__file-remove-btn"
                data-remove-index="${idx}"
                aria-label="Remove ${this.#escapeHtml(file.name)}"
                title="Remove file"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          `;
        }

        if (layout === 'compact') {
          return `
            <div
              class="custom-form__file-card custom-form__file-card--compact ${isActive ? 'custom-form__file-card--active' : ''}"
              data-file-index="${idx}"
              role="button"
              tabindex="0"
              aria-label="Preview ${this.#escapeHtml(file.name)}"
            >
              <span class="custom-form__file-compact-icon" aria-hidden="true">${this.#getFileIcon(file.name)}</span>
              <span class="custom-form__file-name" title="${this.#escapeHtml(file.name)}">${this.#escapeHtml(file.name)}</span>
              <span class="custom-form__file-size">${formattedSize}</span>
              <button
                type="button"
                class="custom-form__file-remove-btn"
                data-remove-index="${idx}"
                aria-label="Remove ${this.#escapeHtml(file.name)}"
                title="Remove file"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          `;
        }

        // Default 'list' layout
        return `
          <div
            class="custom-form__file-card custom-form__file-card--list ${isActive ? 'custom-form__file-card--active' : ''}"
            data-file-index="${idx}"
            role="button"
            tabindex="0"
            aria-label="Preview ${this.#escapeHtml(file.name)}"
          >
            <div class="custom-form__file-thumb-box">
              ${
                isImage
                  ? `<img src="${url}" alt="${this.#escapeHtml(file.name)}" class="custom-form__file-thumb-img" loading="lazy" />`
                  : isVideo
                  ? `<video src="${url}" class="custom-form__file-thumb-video" preload="metadata"></video><span class="custom-form__file-badge-media" aria-hidden="true">▶</span>`
                  : `<span class="custom-form__file-icon-doc" aria-hidden="true">${this.#getFileIcon(file.name)}</span>`
              }
            </div>
            <div class="custom-form__file-info">
              <span class="custom-form__file-name" title="${this.#escapeHtml(file.name)}">${this.#escapeHtml(file.name)}</span>
              <span class="custom-form__file-meta">${formattedSize} • ${this.#getFileExtension(file.name)}</span>
            </div>
            <button
              type="button"
              class="custom-form__file-remove-btn"
              data-remove-index="${idx}"
              aria-label="Remove ${this.#escapeHtml(file.name)}"
              title="Remove file"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        `;
      })
      .join('');

    // Append "Add more" button if limit is not reached
    if (canAddMore) {
      if (layout === 'grid') {
        html += `
          <button
            type="button"
            class="custom-form__file-add-btn custom-form__file-add-btn--grid"
            data-add-more
            aria-label="Add more files"
            title="Add more files"
          >
            <div class="custom-form__file-thumb-box custom-form__file-thumb-box--add">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
            <span class="custom-form__file-name">Add more</span>
          </button>
        `;
      } else if (layout === 'compact') {
        html += `
          <button
            type="button"
            class="custom-form__file-add-btn custom-form__file-add-btn--compact"
            data-add-more
            aria-label="Add more files"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Add more</span>
          </button>
        `;
      } else {
        html += `
          <button
            type="button"
            class="custom-form__file-add-btn custom-form__file-add-btn--list"
            data-add-more
            aria-label="Add more files"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Add more files (${this.selectedFiles.length}/${maxCount})</span>
          </button>
        `;
      }
    }

    this.fileList.innerHTML = html;
  }

  #renderPreviewStage() {
    if (!this.previewStage) return;

    const showPreview = this.dataset.showPreview !== 'false';
    if (!showPreview || !this.activePreviewFile || this.selectedFiles.length === 0) {
      this.previewStage.innerHTML = '';
      this.previewStage.hidden = true;
      this.previewStage.style.display = 'none';
      return;
    }

    const file = this.activePreviewFile;
    const activeIdx = this.selectedFiles.indexOf(file);
    const removeIdx = activeIdx >= 0 ? activeIdx : 0;
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      if (!this.isMultiple) {
        // Single non-media file (PDF, doc, txt) preview card with remove button
        this.previewStage.hidden = false;
        this.previewStage.style.display = '';
        this.previewStage.innerHTML = `
          <div class="custom-form__file-stage-wrapper">
            <div class="custom-form__file-card custom-form__file-card--list" style="border:none; border-radius:0;">
              <div class="custom-form__file-thumb-box">
                <span class="custom-form__file-icon-doc" aria-hidden="true">${this.#getFileIcon(file.name)}</span>
              </div>
              <div class="custom-form__file-info">
                <span class="custom-form__file-name" title="${this.#escapeHtml(file.name)}">${this.#escapeHtml(file.name)}</span>
                <span class="custom-form__file-meta">${this.#formatFileSize(file.size)} • ${this.#getFileExtension(file.name)}</span>
              </div>
              <button
                type="button"
                class="custom-form__file-remove-btn"
                data-remove-index="${removeIdx}"
                aria-label="Remove ${this.#escapeHtml(file.name)}"
                title="Remove file"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        `;
        return;
      }
      this.previewStage.innerHTML = '';
      this.previewStage.hidden = true;
      this.previewStage.style.display = 'none';
      return;
    }

    this.previewStage.hidden = false;
    this.previewStage.style.display = '';
    const url = this.#getObjectUrl(file);

    if (isImage) {
      this.previewStage.innerHTML = `
        <div class="custom-form__file-stage-wrapper">
          <img src="${url}" alt="${this.#escapeHtml(file.name)}" class="custom-form__file-stage-img" />
          <div class="custom-form__file-stage-bar">
            <div class="custom-form__file-stage-meta">
              <span class="custom-form__file-stage-title" title="${this.#escapeHtml(file.name)}">${this.#escapeHtml(file.name)}</span>
              <span class="custom-form__file-stage-size">${this.#formatFileSize(file.size)}</span>
            </div>
            <button
              type="button"
              class="custom-form__file-remove-btn"
              data-remove-index="${removeIdx}"
              aria-label="Remove ${this.#escapeHtml(file.name)}"
              title="Remove file"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      `;
    } else if (isVideo) {
      this.previewStage.innerHTML = `
        <div class="custom-form__file-stage-wrapper">
          <video src="${url}" controls playsinline class="custom-form__file-stage-video"></video>
          <div class="custom-form__file-stage-bar">
            <div class="custom-form__file-stage-meta">
              <span class="custom-form__file-stage-title" title="${this.#escapeHtml(file.name)}">${this.#escapeHtml(file.name)}</span>
              <span class="custom-form__file-stage-size">${this.#formatFileSize(file.size)}</span>
            </div>
            <button
              type="button"
              class="custom-form__file-remove-btn"
              data-remove-index="${removeIdx}"
              aria-label="Remove ${this.#escapeHtml(file.name)}"
              title="Remove file"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      `;
    }
  }

  /**
   * @param {string} msg
   */
  #showError(msg) {
    if (this.errorMessage) {
      this.errorMessage.textContent = msg;
      this.errorMessage.hidden = false;
    }
  }

  #clearError() {
    if (this.errorMessage) {
      this.errorMessage.textContent = '';
      this.errorMessage.hidden = true;
    }
  }

  #announce() {
    if (!this.liveRegion) return;
    const count = this.selectedFiles.length;
    if (count === 0) {
      this.liveRegion.textContent = 'No files selected.';
    } else if (count === 1) {
      this.liveRegion.textContent = `1 file selected: ${this.selectedFiles[0].name}`;
    } else {
      this.liveRegion.textContent = `${count} files selected. Active preview: ${this.activePreviewFile?.name || ''}`;
    }
  }

  /**
   * @param {number} bytes
   * @returns {string}
   */
  #formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  /**
   * @param {string} filename
   * @returns {string}
   */
  #getFileExtension(filename) {
    return filename.split('.').pop()?.toUpperCase() || 'FILE';
  }

  /**
   * @param {string} filename
   * @returns {string}
   */
  #getFileIcon(filename) {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)) {
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`;
    }
    if (['mp4', 'mov', 'webm', 'avi', 'mkv'].includes(ext)) {
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>`;
    }
    if (['pdf'].includes(ext)) {
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`;
    }
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>`;
  }

  /**
   * @param {string} str
   * @returns {string}
   */
  #escapeHtml(str) {
    return str.replace(/[&<>'"]/g, (tag) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
  }
}

if (!customElements.get('form-file-input')) {
  customElements.define('form-file-input', FormFileInput);
}
