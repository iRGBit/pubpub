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
			editingId: null,
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
		// make these commits immutable or something, because they cannot change
		for (const commit of this.state.commits) {
					const querySelector = '.commit-id-' + commit.id;
					const queryElem = document.querySelector(querySelector);
					if (!queryElem) {
						commit.top = null;
						continue;
					}
					const top = queryElem.offsetTop;
					if (commit.top !== top) {
						commit.top = top;
						changedCommits = true;
					}
		}

		if (this.state.editingId !== null) {
			const queryElem = document.querySelector('.blame-marker.editing');
			let editorTop = null;
			if (queryElem) {
				editorTop = queryElem.offsetTop;
			}
			if (this.state.editorTop !== editorTop) {
				this.setState({editorTop: editorTop});
			}
		}

		if (changedCommits) {
			this.setState({commits: this.state.commits});
		}

	},

	renderCommits(commits, editingId) {
		const newState = {commits, editingId};
		if (!editingId) {
			newState.editorTop = null;
		}
		this.setState(newState);
	},

	submitMsg() {
		const msg = this.refs.commitmsg.value;
		this.editor1.createCommit(msg);
	},

	hoverCommit(commitId) {
		this.setState({highlightCommit: commitId});
		this.editor1.highlightCommit(commitId);
	},

	unhoverCommt(commitId) {
		this.setState({highlightCommit: null});
		this.editor1.clearHighlight(commitId);
	},

	revertCommit(commitId) {
		this.editor1.revertCommit(commitId);
	},

	onHighlightHover(evt) {
		const hoverClass = evt.target.className;
		if (hoverClass.indexOf('commit-id') !== -1) {
			if (hoverClass.indexOf('editing') !== -1) {
				this.setState({highlightCommit: 'editing'});
				return;
			}
			const commitRegex = /commit-id-(\d)*/;
			const match = commitRegex.exec(hoverClass);
			if (match && match[1]) {
				const commit = parseInt(match[1]);
				this.setState({highlightCommit: commit});
				this.editor1.highlightCommit(commit);
			}
		} else if (this.state.highlightCommit) {
			this.editor1.clearHighlight(this.state.highlightCommit);
			this.setState({highlightCommit: null});
		}
	},

	clearHighlightHover() {
		this.setState({highlightCommit: null});
	},


	render: function() {
		const {highlightCommit, commits, editorTop} = this.state;

		//Transform Map algorithm:
		//1) Sort by top
		//2) Keep running count of how much needs to be bumped down
		//3) Place editor first
		//4) Run same algorithm up and down from the editor keeping a global bump
		//3) check if next element has enough space in the bottom
		//4) if not, increase global bump down, otherwise decrease global bump
		//5) render element
		//6) for next element, add global bump and render

		const MINHEIGHT = 50;


		const commitsTop = commits.map((commit) => {
			return {id: commit.id, top: Math.max(MINHEIGHT, commit.top)};
		}).filter((commit) => { return (commit.top < editorTop) });

		const commitsBottom = commits.map((commit) => {
			return {id: commit.id, top: Math.max(MINHEIGHT, commit.top)};
		}).filter((commit) => { return (commit.top >= editorTop) });


		const filterBump = (commitMap, _commits, direction) => {
			let bumpAmount = 0;
			const sortedCommits = _commits.sort((a, b) => (a.top - b.top) * direction);
			const MAX_DIFF = 75;
			const EDITOR_DIFF = 150;

			let lastCommitTop = editorTop;
			for (const commit of sortedCommits) {
				const diffTop = Math.abs(lastCommitTop - (commit.top + bumpAmount * direction));
				const SPACE_BETWEEN = (lastCommitTop === editorTop) ? EDITOR_DIFF : MAX_DIFF;
 				if (SPACE_BETWEEN < diffTop ) {
					bumpAmount += (SPACE_BETWEEN - diffTop);
				} else {
					bumpAmount -= (diffTop - SPACE_BETWEEN);
				}
				bumpAmount = Math.max(bumpAmount, 0);
				commitMap[commit.id] = commit.top + bumpAmount * direction;
				lastCommitTop = commitMap[commit.id];
			}
			return commitMap;
		};

		const commitPositions = {};
		filterBump(commitPositions, commitsBottom, 1);
		filterBump(commitPositions, commitsTop, -1);

		return (
			<div style={{backgroundColor: 'rgb(243, 243, 244)'}}>
			  <div key={this.state.editingId} ref="commitdiv" style={styles.commitDiv(this.state.editorTop, (highlightCommit === 'editing'))}>
					<div>
						Enter a message:
						<input ref="commitmsg" type="text"></input>
						<button onClick={this.submitMsg}>Typo</button>
						<button onClick={this.submitMsg}>Flow</button>
						<button className="button" style={styles.submit} onClick={this.submitMsg}>Submit</button>
					</div>
			  </div>
				{commits.map((commit, index) => {
					if (commit.top) {
							const positionTop = (commitPositions[commit.id]) ? commitPositions[commit.id] : commit.top;
							return (
								<div
									onMouseOver={this.hoverCommit.bind(this, commit.id)}
									onMouseOut={this.unhoverCommt.bind(this, commit.id)}
									style={styles.commitMsg(positionTop, (commit.id === highlightCommit))}>
										<strong>#{index}</strong> - {commit.message}
										{/*
										<button onClick={this.revertCommit.bind(this, commit.id)}>Revert</button>
										*/}
							</div>);
					} else {
						return null;
					}

				})}
				<div id="richeditor1" style={styles.reviewEditor} onMouseOver={this.onHighlightHover} onMouseOut={this.clearHighlightHover}>
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
		marginLeft: '100px',
		backgroundColor: 'white',
		padding: '0px 25px',
	},
	commitMsg: function(commitTop, highlighted) {
		return {
			position: 'absolute',
			top: commitTop,
			left: '800px',
			zIndex: 100,
			minHeight: 50,
			// border: '1px solid black',
			display: 'block',
			cursor: 'pointer',
			// backgroundColor: (highlighted) ? 'rgba(200,200,50,0.4)' : 'white',
			backgroundColor: 'white',
			boxShadow: 'rgb(128, 130, 132) 0px 0px 2px',
			padding: '5px 15px',
			transition: '0.25s ease-in-out',
			transform: (highlighted) ? 'translate(-0.5em,0)' : null,
		};
	},
	submit: {
		fontSize: '0.7em',
	},
	commitDiv: function(editorTop, highlighted) {
		if (!editorTop) {
			return {
				display: 'none',
			};
		}
		return {
			position: 'absolute',
			top: editorTop,
			left: '800px',
			zIndex: 100,
			backgroundColor: (highlighted) ? 'rgba(200,200,50,0.4)' : 'white',
			boxShadow: 'rgb(128, 130, 132) 0px 0px 2px',
			padding: '5px 15px',
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
