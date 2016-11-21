import {AbstractEditor} from './richEditor';
import {Plugin} from 'prosemirror-state';
import {schema as pubSchema} from '../schema';

var jsondiffpatch = require('jsondiffpatch').create({textDiff: {minLength: 3}});
let highlightSet = null;

class DiffRichEditor extends AbstractEditor {

  constructor({place, text, contents, otherEditor}) {
    super();
    this.otherEditor = otherEditor;
    const {pubpubSetup} = require('../pubpubSetup');
    const {markdownParser} = require("../markdownParser");

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

exports.DiffRichEditor = DiffRichEditor;
