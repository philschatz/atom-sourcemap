const { CompositeDisposable } = require('atom');
const PreviewView = require('./preview-view');
const GenericProvider = require('./generic-provider');

module.exports = {
  view: null,
  subscriptions: null,

  activate(state) {
    this.provider = new GenericProvider();
    this.views = new WeakMap();
    this.subscriptions = new CompositeDisposable();
    return this.subscriptions.add(atom.commands.add('atom-text-editor',
      {'sourcemap-view:toggle':
        ({currentTarget}) => {
          if (currentTarget && currentTarget.getModel) {
            this.toggle(currentTarget.getModel())
          }
        }
      }
    ));
  },

  deactivate() {
    if (this.subscriptions != null) {
      this.subscriptions.dispose();
    }
    this.subscriptions = null;
    if (this.view != null) {
      this.view.destroy();
    }
    this.view = null;
    return this.provider = null;
  },

  toggle(editor) {
    if (!editor) { return; }

    if (this.view != null ? this.view.isAlive() : undefined) {
      this.view.destroy();
      return this.view = null;
    } else {
      this.view = new PreviewView(editor, this.provider);
      return this.view.show();
    }
  }
};

function __guardMethod__(obj, methodName, transform) {
  if (typeof obj !== 'undefined' && obj !== null && typeof obj[methodName] === 'function') {
    return transform(obj, methodName);
  } else {
    return undefined;
  }
}
