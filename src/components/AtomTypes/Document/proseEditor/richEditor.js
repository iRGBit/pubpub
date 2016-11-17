import {migrateDiffs, migrateMarks, schema as pubSchema} from './schema';

import ElementSchema from './elementSchema';
import {Plugin} from 'prosemirror-state';

class AbstractEditor {

  constructor() {
  }

  create({place, contents, plugins}) {
    const {buildMenuItems} = require('./pubpubSetup');
    const {EditorState} = require('prosemirror-state');
    const {MenuBarEditorView, MenuItem} = require('prosemirror-menu');
    const collabEditing = require('prosemirror-collab').collab;
    const {clipboardParser, clipboardSerializer} = require('./clipboardSerializer');


    const menu = buildMenuItems(pubSchema);
    // TO-DO: USE UNIQUE ID FOR USER AND VERSION NUMBER

    // migrateMarks(contents);

    ElementSchema.initiateProseMirror({
    	changeNode: this.changeNode,
    	setEmbedAttribute: this.setEmbedAttribute,
    	getState: this.getState,
    });

    this.plugins = plugins;

    const state = EditorState.create({
    	doc: pubSchema.nodeFromJSON(contents),
    	plugins: plugins,
    });

     this.view = new MenuBarEditorView(place, {
      state: state,
      onAction: this._onAction,
    	onUnmountDOM: (view, node) => {
    		// console.log('unmountinggg', node);
    		return;
    		if (node.type && node.type.name === 'embed' || node.type.name === 'block_embed') {
    			ElementSchema.unmountNode(node);
    		}
    	},
    	handleDOMEvent: this._handleDOMEvent,
      menuContent: menu.fullMenu,
    	spellcheck: true,
    	clipboardParser: clipboardParser,
    	clipboardSerializer: clipboardSerializer,
    });
  }

  _handleDOMEvent = (_view, evt) => {
    // console.log(evt, ElementSchema.currentlyEditing(), evt2);
    // return;
    if (ElementSchema.currentlyEditing()) {
      const eventType = evt.type;
      // && eventType.indexOf('drag') === -1
      if (evt.target && evt.target.className && evt.target.className.indexOf('caption') !== -1 && !evt.dataTransfer) {
        if (eventType === 'mousedown') {
          return true;
        }
        return false;
      }
      if (eventType === 'mousedown') {
        if (ElementSchema.checkPoint(evt.target)) {
          return false;
        }
      }
      if (eventType === 'keydown' && (evt.key === 'Delete' || evt.code === 'Backspace')) {
        return false;
      }
      evt.preventDefault();
      return true;
    }
    if (evt.type === 'paste') {
      setTimeout(ElementSchema.countNodes, 200);
    }
    return false;
  }


  _onAction = (action) => {
    // console.log(action);
    const newState = this.view.editor.state.applyAction(action);
    this.view.updateState(newState);
    if (action.type === "selection") {
      ElementSchema.onNodeSelect(newState, action.selection);
    }
  }

  _createDecorations = (editorState) => {
    const {DecorationSet} = require("prosemirror-view");
    console.log('Creating decorations!');
    return DecorationSet.empty;
  }

	changeNode = (currentFrom, nodeType, nodeAttrs) => {
		const state = this.pm;
		const transform = state.tr.setNodeType(currentFrom, nodeType, nodeAttrs);
		const action = transform.action();
		this.applyAction(action);
	}

	getState = () => {
		return this.view.state;
	}

	applyAction = (action) => {
		const newState = this.view.editor.state.applyAction(action);
		this.view.updateState(newState);
	}

  toJSON = () => {
    return this.view.editor.state.doc.toJSON();
  }

  toMarkdown = () => {
    const {defaultMarkdownSerializer} = require("prosemirror-markdown");
    const markdown = defaultMarkdownSerializer.serialize(this.view.state.doc);
    return markdown;
  }

  setDoc = (newJSONDoc) => {
    const {EditorState} = require('prosemirror-state');
    const newState = EditorState.create({
    	doc: pubSchema.nodeFromJSON(newJSONDoc),
    	plugins: this.plugins,
    });
    this.view.updateState(newState);
  }
}


class RichEditor extends AbstractEditor {

  constructor({place, text, contents}) {
    super();
    const {pubpubSetup} = require('./pubpubSetup');
    const {markdownParser} = require("./markdownParser");

    const plugins = pubpubSetup({schema: pubSchema});
    let docJSON;
    if (text) {
      docJSON = markdownParser.parse(text).toJSON();
    } else {
      docJSON = contents;
    }
    this.create({place, contents: docJSON, plugins});
  }
}

var jsondiffpatch = require('jsondiffpatch').create({textDiff: {minLength: 3}});
let highlightSet = null;

class DiffRichEditor extends AbstractEditor {

  constructor({place, text, contents, otherEditor}) {
    super();
    this.otherEditor = otherEditor;
    const {pubpubSetup} = require('./pubpubSetup');
    const {markdownParser} = require("./markdownParser");

    const plugins = pubpubSetup({schema: pubSchema});
    let docJSON;
    if (text) {
      docJSON = markdownParser.parse(text).toJSON();
    } else {
      docJSON = contents;
    }
    this.create({place, contents: docJSON, plugins});
    console.log('Other editor', otherEditor);
  }

  create({place, contents, plugins}) {

    console.log('MAKING PLUGINS');

    const {DecorationSet, Decoration} = require("prosemirror-view");

    const otherEditor = this.otherEditor;

    const highlightPlugin = new Plugin({
      state: {
        init() {
          const decos = [Decoration.inline(0, 5, {class: "blame-marker"})];
          return {deco: DecorationSet.empty, commit: null};
        },
        applyAction(action, prev, state) {
          return prev;
        }
      },
      props: {
        decorations(state) {
          // const decos = [Decoration.inline(0, 1, {class: "blame-marker"})];
          // const decos = [Decoration.inline(0, 10, {class: "blame-marker"})];
          if (!otherEditor) {
            return DecorationSet.empty;
          }
          const text1 = otherEditor.toJSON();
          const text2 = state.doc.toJSON();
          var delta = jsondiffpatch.diff(text1, text2);
          const decos = [];
          const doc = state.doc;
          doc.forEach((node, offset, index) => {
            if (delta.content[index]) {
              const deco = Decoration.node(offset, offset + node.nodeSize, {class: "blame-marker"}, {data: 'yes'});
              decos.push(deco);
            }
          });
          highlightSet = DecorationSet.create(state.doc, decos);
          return highlightSet;
        }
      }
    });

    const diffPlugins = plugins.concat(highlightPlugin);

    super.create({place, contents, plugins: diffPlugins});


  }


}

class CollaborativeRichEditor extends AbstractEditor {

  constructor({place, contents, collaborative: {userId, versionNumber, lastDiffs, collab}}) {

    super();
    const plugins = [pubpubSetup({schema: pubSchema})];
    this.create({place, contents, plugins});
    migrateDiffs(lastDiffs);
    const appliedAction = collab.mod.collab.docChanges.applyAllDiffs(lastDiffs);
    if (appliedAction) {
    		// this.applyAction(appliedAction);
    } else {
    		// indicates that the DOM is broken and cannot be repaired
    		this.collab.mod.serverCommunications.disconnect();
    }

  }

  getStatus = () => {

  }

  onAction = () => {
    // console.log(action);
    const newState = view.editor.state.applyAction(action);
    this.pm = newState;
    view.updateState(newState);
    that.collab.mod.collab.docChanges.sendToCollaborators();
    if (action.type === "selection") {
      ElementSchema.onNodeSelect(newState, action.selection);
    }
  }


}

exports.RichEditor = RichEditor;
exports.DiffRichEditor = DiffRichEditor;
exports.CollaborativeRichEditor = CollaborativeRichEditor;
