import React, {PropTypes} from 'react';
import Radium from 'radium';
import { Link } from 'react-router';
import dateFormat from 'dateformat';

import {globalMessages} from 'utils/globalMessages';
import {FormattedMessage} from 'react-intl';

let styles;

export const AtomVersions = React.createClass({
	propTypes: {
		versionsData: PropTypes.array,
		slug: PropTypes.string,
		buttonStyle: PropTypes.object,
		handlePublishVersion: PropTypes.func,
		permissionType: PropTypes.string,
	},

	getInitialState() {
		return {
			confirmPublishIndex: undefined,
		};
	},

	onPublish: function(id) {
		this.props.handlePublishVersion(id);
	},

	setPublishIndex: function(index) {
		this.setState({confirmPublishIndex: index});
	},

	clearPublishIndex: function() {
		this.setState({confirmPublishIndex: undefined});
	},

	render: function() {
		const versionsData = this.props.versionsData || [];
		const showPublishStatus = this.props.permissionType === 'author' || this.props.permissionType === 'editor' || this.props.permissionType === 'reader';
		const isAuthor = this.props.permissionType === 'author';
		return (
			<div>
				{versionsData.filter((item)=>{
					const permissionType = this.props.permissionType;
					if (permissionType !== 'author' && permissionType !== 'editor' && permissionType !== 'reader') {
						return item.isPublished;
					}
					return true;
				}).sort((foo, bar)=>{
					// Sort so that most recent is first in array
					if (foo.createDate > bar.createDate) { return -1; }
					if (foo.createDate < bar.createDate) { return 1; }
					return 0;
				}).map((item, index)=> {
					return (
						<div key={'version-' + index} style={[styles.versionItem, index === versionsData.length - 1 && styles.versionItemLast]}>

							{!item.isPublished && showPublishStatus && <div style={styles.statusLabel}>
								<FormattedMessage {...globalMessages.Private}/>
							</div> }
							{item.isPublished && showPublishStatus && <div style={styles.statusLabel}>
								<FormattedMessage {...globalMessages.Published}/>
							</div> }

							<Link to={'/pub/' + this.props.slug + '?version=' + item._id} className={'underlineOnHover'} style={styles.versionDate}>{dateFormat(item.createDate, 'mmm dd, yyyy h:MM TT')}</Link>
							<div style={styles.versionMessage}>{item.message}</div>

							{!item.isPublished && isAuthor &&

								<div style={styles.publishButtonWrapper}>
									{this.state.confirmPublishIndex === index &&
										<div>
											<div className={'button'} onClick={this.onPublish.bind(this, item._id)} style={styles.publishButton}>
												<FormattedMessage id="atomVersions.ConfirmPublish" defaultMessage="Confirm Publish"/>
										</div>
											<div className={'button'} onClick={this.clearPublishIndex} style={styles.publishButton}>
												<FormattedMessage id="atomVersions.CancelPublish" defaultMessage="Cancel Publish"/>
											</div>
										</div>
									}

									{this.state.confirmPublishIndex !== index &&
										<div className={'button'} onClick={this.setPublishIndex.bind(this, index)} style={styles.publishButton}>
											<FormattedMessage id="atomVersions.Publish Version" defaultMessage="Publish Version"/>
										</div>
									}
								</div>
							}

						</div>
					);
				})}
			</div>
		);
	}
});

export default Radium(AtomVersions);

styles = {
	content: {
		// minWidth: '400px',
		userSelect: 'initial',
	},
	versionItem: {
		// whiteSpace: 'nowrap',
		margin: '0.5em 0em',
		borderBottom: '1px solid #bbbdc0',
		padding: '0.5em 0em',
		position: 'relative',
		minHeight: '3.5em',
	},
	versionItemLast: {
		borderBottom: '0px solid black',
	},
	versionDate: {
		color: 'inherit',
		textDecoration: 'none',
		fontSize: '1.1em',
	},
	versionMessage: {
		padding: '.5em 0em',
	},
	publishButtonWrapper: {
		textAlign: 'right',
	},
	publishButton: {
		padding: '0em .5em',
		fontSize: '.85em',
		marginLeft: '.5em',
		// position: 'absolute',
		// bottom: 'calc(1em / .85)',
		// right: 0,
	},
	statusLabel: {
		display: 'inline-block',
		padding: '0em .5em',
		backgroundColor: '#BBBDC0',
		color: 'white',
		fontSize: '.85em',
		position: 'absolute',
		top: 'calc(1em / .85)',
		right: 0,
	},
};
