import React, { PropTypes } from 'react';
import {follow, unfollow} from './actions';

import ElementPortal from 'react-element-portal';
import {FormattedMessage} from 'react-intl';
import { Link } from 'react-router';
import Radium from 'radium';
import {connect} from 'react-redux';
import {globalMessages} from 'utils/globalMessages';

let styles = {};

export const DiffView = React.createClass({
	propTypes: {
	},

	getInitialState() {
		return {
			isFollowing: false,
			commits: [],
			editorTop: null,
		};
	},

	componentWillMount() {
	},

	componentDidMount() {

		const {ReviewEditor} = require('components/AtomTypes/Document/proseEditor/editors/ReviewEditor');

		const place1 = document.getElementById('richeditor1');

		this.editor1 = new ReviewEditor({
			place: place1,
			text: "# what \n heyyyyyyy \n ## a \n# what \n ## hi \n # hi",
			renderCommits: this.renderCommits
		});

	},

	componentDidUpdate() {
		let changedCommits = false;
		for (const commit of this.state.commits) {
					const querySelector = '.commit-id-' + commit.id;
					const queryElem = document.querySelector(querySelector);
					if (!queryElem) {
						commit.top = null;
						continue;
					}
					const top = queryElem.offsetTop;
					if (commit.unsaved) {
						if (this.state.editorTop !== top) {
							this.setState({editorTop: top});
						}
					} else {
						if (commit.top !== top) {
							commit.top = top;
							changedCommits = true;
						}
					}
		}

		if (changedCommits) {
			this.setState({commits: this.state.commits});
		}

	},

	renderCommits(commits) {
		this.setState({commits});
	},

	submitMsg() {
		const msg = this.refs.commitmsg.value;
		this.editor1.createCommit(msg);
	},

	hoverCommit(commitId) {
		this.editor1.highlightCommit(commitId);
	},

	unhoverCommt(commitId) {
		this.editor1.clearHighlight(commitId);
	},


	render: function() {
		return (
			<div>
			  <div ref="commitdiv" style={styles.commitDiv(this.state.editorTop)}>
					<div>
						Enter a message:
						<input ref="commitmsg" type="text"></input>
						<button onClick={this.submitMsg}>Typo</button>
						<button onClick={this.submitMsg}>Flow</button>
						<button onClick={this.submitMsg}>Submit</button>
					</div>
			  </div>
				{this.state.commits.map((commit, index) => {
					if (commit.top) {
							return (
								<div
									onMouseOver={this.hoverCommit.bind(this, commit.id)}
									onMouseOut={this.unhoverCommt.bind(this, commit.id)}
									style={styles.commitMsg(commit.top)}>
									#{index} - {commit.message}
							</div>);
					} else {
						return null;
					}

				})}
				<div id="richeditor1" styles={styles.reviewEditor}>
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
	reviewEditor: {
		width: '650px',
		marginLeft: '50px',
	},
	commitMsg: function(commitTop) {
		return {
			position: 'absolute',
			top: commitTop,
			left: '700px',
			zIndex: 100,
			minHeight: 50,
			border: '1px solid black',
			display: 'block',
			cursor: 'pointer',
		};
	},
	commitDiv: function(editorTop) {
		if (!editorTop) {
			return {
				display: 'none',
			};
		}
		return {
			position: 'absolute',
			top: editorTop,
			left: '700px',
			zIndex: 100,
		};
	},
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
