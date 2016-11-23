import {AbstractEditor} from './richEditor';
import {Plugin} from 'prosemirror-state';
import {schema as pubSchema} from '../schema';

var jsondiffpatch = require('jsondiffpatch').create({textDiff: {minLength: 3}});
let highlightSet = null;


const getDiffStr = function(doc) {
	const nodeSize = doc.nodeSize;
	let diffStr = "";

	for (let i = 0; i < nodeSize - 1; i++) {
		const child = doc.nodeAt(i);
		if (child) {
			let diffText = "";
			if (child.isText) {
				diffText = child.text;
				i += child.nodeSize - 1;
			} else {
				diffText = child.type.name.charAt(0);
			}
			diffStr += diffText;
		} else {
			diffStr += "Z";
		}

	}
	console.log(diffStr);
	console.log('COMPARE', nodeSize, diffStr.length);
	return diffStr;
}

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
  }

  create({place, contents, plugins}) {


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
          const text1 = getDiffStr(otherEditor.view.editor.state.doc);
          const text2 = getDiffStr(state.doc);

          var jsdiff = require('diff');
          var diffResult = jsdiff.diffChars(text1, text2);
          const decos = [];
          let startCount = 0;
          for (const diff of diffResult) {
            // const strippedString = diff.value.replace(/\s/g, '');
						const strippedString = diff.value;
            if (diff.added || diff.removed) {
              const to = startCount;
              const from = startCount + strippedString.length;
              const deco = Decoration.inline(to, from, {class: "blame-marker"}, {inclusiveLeft: true, inclusiveRight: true});
              decos.push(deco);
            }
            startCount += strippedString.length;

          }
          /*
          var delta = jsondiffpatch.diff(text1, text2);
          const decos = [];
          const doc = state.doc;
          doc.forEach((node, offset, index) => {
            if (delta.content[index]) {
              const deco = Decoration.node(offset, offset + node.nodeSize, {class: "blame-marker"}, {data: 'yes'});
              decos.push(deco);
            }
          });
          */
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
