import React, { PropTypes } from 'react';

import {FormattedMessage} from 'react-intl';
import Radium from 'radium';
import {RichEditor} from 'components/AtomTypes/Document/proseEditor';
import {connect} from 'react-redux';

// import {globalStyles} from 'utils/styleConstants';
var jsondiffpatch = require('jsondiffpatch').create(
	{
		textDiff: {minLength: 3},
		arrays: {
			detectMove: true,
			includeValueOnMove: true
		},
	}
);
var diffchangeset = require('changeset');
var {diff} = require('json-diff');

let styles = {};

export const DiffView = React.createClass({
	propTypes: {
	},

	getInitialState() {
		return {
			isFollowing: false,
		};
	},

	componentWillMount() {
	},

	componentDidMount() {

		const {DiffRichEditor} = require('components/AtomTypes/Document/proseEditor/editors/diffEditor');


		const place1 = document.getElementById('richeditor1');
		const place2 = document.getElementById('richeditor2');

		this.editor1 = new RichEditor({place: place1, text: "# what \n heyyyyyyy \n ## a \n# what \n ## hi \n # hi"});
		this.editor2 = new DiffRichEditor({place: place2, text: "# what \n heyyyyyyy \n# what \n ## hi \n # hi", otherEditor: this.editor1});

		window.setTimeout(this.compareDiffs, 5000);

	},

	compareDiffs() {
		const a = this.editor1.toJSON();
		const b = this.editor2.toJSON();

		console.log(JSON.stringify(a));
		console.log(JSON.stringify(b));


		var delta = jsondiffpatch.diff(a, b);
		console.log('json diff:' , delta);
		var changes = diff(a, b);
		console.log('json diff2: ', changes);
		var changes2 = diffchangeset(a, b);
		console.log('json diff2: ', changes2);
	},


	render: function() {
		return (
			<div>
				<div id="richeditor1">
				</div>
				<div id="richeditor2">
				</div>
			</div>
		);
	}

});

export default connect( state => {
	return {
		followButtonData: state.followButton,
		loginData: state.login,
		path: state.router.location.pathname,
	};
})( Radium(DiffView) );

styles = {
	followButton: {
		padding: '0em 1em ',
		fontSize: '0.85em',
		position: 'relative',
	},
	loginMessage: {
		position: 'absolute',
		zIndex: 2,
		left: 0,
		top: 0,
		right: 0,
		bottom: 0,
		backgroundColor: '#2C2A2B',
		textDecoration: 'none',
		color: 'inherit',
		textAlign: 'center',
		padding: 0,
	}
};
