const fs = require('fs');
const _ = require('underscore');
const { SourceMapConsumer } = require('source-map');
const { CompositeDisposable } = require('atom');

module.exports = class PreviewView {
  constructor(editor, provider) {
    this.destroy = this.destroy.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
    this.changePositionHandler = this.changePositionHandler.bind(this);
    this.syncScroll = this.syncScroll.bind(this);
    this.renderPreview = this.renderPreview.bind(this);
    this.editor = editor;
    this.provider = provider;
    this.alive = true;
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.config.observe('sourcemap-view.RefreshDebouncePeriod', wait => {
      return this.debouncedRenderPreview = _.debounce(this.renderPreview, wait);
    }));
    this.debouncedSyncScroll = _.debounce(this.syncScroll, 200);

    this.handleEvents();
    this.renderPreview();
    this.syncScroll();
  }

  destroy() {
    if (!this.isAlive()) { return; }
    this.alive = false;
    this.sourceMap = null;
    this.editor = null;
    this.provider = null;
    if (this.subscriptions != null) {
      this.subscriptions.dispose();
    }
    return this.subscriptions = null;
  }

  isAlive() {
    return this.alive;
  }

  handleEvents() {
    this.subscriptions.add(this.editor.onDidStopChanging(this.changeHandler));
    this.subscriptions.add(this.editor.onDidChangeCursorPosition(this.changePositionHandler));
    return this.subscriptions.add(this.editor.onDidDestroy(this.destroy));
  }

  changeHandler() {
    return this.debouncedRenderPreview();
  }

  changePositionHandler({oldBufferPosition, newBufferPosition}) {
    return this.debouncedSyncScroll();
  }

  syncScroll() {
    if (this.editor == null) { return; }

    const bufferRow = this.editor.getCursorBufferPosition().row;
    const sourceInfo = this.originalRowFor();
    if (!sourceInfo) { return; }

    const {source, line, column} = sourceInfo;
    const previewRow = line - 1;
    const previewCol = column;

    let promise;
    if (source && ((this.previewEditor != null ? this.previewEditor.getPath() : undefined) !== source)) {
      const options = {
        initialLine: previewRow,
        initialColumn: previewCol,
        split: 'right',
        searchAllPanes: true,
        activatePane: false,
        activateItem: true
      };
      promise = atom.workspace.open(source, options);
    } else if (this.previewEditor) {
      promise = Promise.resolve(this.previewEditor);
    } else {
      return
    }

    return promise.then(previewEditor => {
      this.previewEditor = previewEditor;
      this.previewEditor.setCursorBufferPosition([previewRow, previewCol]);
      this.previewEditor.clearSelections();
      this.previewEditor.selectLinesContainingCursors();
      return this.recenterTopBottom(this.previewEditor);
    });
  }

  originalRowFor() {
    if (this.sourceMap == null) { return; }
    const pos = this.editor.getCursorBufferPosition();
    return this.sourceMap.originalPositionFor({
      line: pos.row + 1,
      column: pos.column + 1
    });
  }

  renderPreview() {
    if (this.errorNotification) {
      this.errorNotification.dismiss();
    }
    this.errorNotification = null;

    const sourceMapJson = this.provider.transform(this.editor.getText(), this.editor.getPath());
    if (sourceMapJson) { this.sourceMap = new SourceMapConsumer(sourceMapJson); }
    return this.debouncedSyncScroll();
  }

  show() {
    const srcPane = atom.workspace.getActivePane();
    return srcPane.activate();
  }

  recenterTopBottom(editor) {
    const editorElement = atom.views.getView(editor);
    const minRow = Math.min.apply(Math, editor.getCursors().map(c => c.getBufferRow()))
    const maxRow = Math.max.apply(Math, editor.getCursors().map(c => c.getBufferRow()))
    const minOffset = editorElement.pixelPositionForBufferPosition([minRow, 0]);
    const maxOffset = editorElement.pixelPositionForBufferPosition([maxRow, 0]);
    return editorElement.setScrollTop(((minOffset.top + maxOffset.top) - editorElement.getHeight())/2);
  }
};
