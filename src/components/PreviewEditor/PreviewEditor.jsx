import AtomContributors from 'containers/Atom/AtomContributors';
import AtomDetails from 'containers/Atom/AtomDetails';
import AtomEditorPane from 'containers/Atom/AtomEditorPane';
import Radium from 'radium';
import React, {PropTypes} from 'react';
import {HorizontalNav} from 'components';
import {FormattedMessage} from 'react-intl';
import {Link as UnwrappedLink} from 'react-router';
import {ensureImmutable} from 'reducers';
import {globalMessages} from 'utils/globalMessages';
import {globalStyles} from 'utils/styleConstants';
const Link = Radium(UnwrappedLink);


let styles = {};

export const PreviewEditor = React.createClass({
	propTypes: {
		atomData: PropTypes.object,
		versionData: PropTypes.object,
		contributorsData: PropTypes.array,
		permissionType: PropTypes.string,

		buttons: PropTypes.array,
		header: PropTypes.object,
		footer: PropTypes.node,

		onSaveVersion: PropTypes.func,
		onSaveAtom: PropTypes.func,
		updateDetailsHandler: PropTypes.func,
		handleAddContributor: PropTypes.func,
		handleUpdateContributor: PropTypes.func,
		handleDeleteContributor: PropTypes.func,
		saveVersionHandler: PropTypes.func,
		deleteAtomHandler: PropTypes.func,
		setItemHandler: PropTypes.func,


		contributorsLoading: PropTypes.bool,
		detailsLoading: PropTypes.bool,
		contributorsError: PropTypes.bool,
		detailsError: PropTypes.bool,
		doNotEdit: PropTypes.bool,

		defaultOpen: PropTypes.bool,

	},

	getInitialState() {
		return {
			editorOpen: false,
			editorMode: 'content',
			confirmDelete: false,
		};
	},

	componentWillMount() {
		this.setState({editorOpen: this.props.defaultOpen});
	},

	openEditor: function(index) {
		this.setState({editorOpen: true});
	},

	closeEditor: function(index) {
		this.setState({editorOpen: false});
	},
	setEditorMode: function(mode) {
		this.setState({editorMode: mode});
	},

	addContributor: function(contributorID) {
		this.props.handleAddContributor(this.props.atomData._id, contributorID);
	},

	updateDetails: function(newDetails) {
		this.props.updateDetailsHandler(this.props.atomData._id, newDetails);
	},

	saveVersion: function() {
		const newVersionContent = this.refs.atomEditorPane.refs.editor.getSaveVersionContent();
		const versionMessage = 'New version from quick editor';
		const atomData = this.props.atomData;
		this.props.saveVersionHandler(newVersionContent, versionMessage, atomData);
	},

	toggleConfirmDelete: function() {
		this.setState({confirmDelete: !this.state.confirmDelete});
	},

	deleteAtom: function() {
		this.props.deleteAtomHandler(this.props.atomData._id);
	},

	render: function() {
		const atomData = this.props.atomData || {};
		// console.log(atomData);
		const previewImage = atomData.previewImage && atomData.previewImage.indexOf('.gif') > -1 ? atomData.previewImage : 'https://jake.pubpub.org/unsafe/fit-in/50x50/' + atomData.previewImage;
		const image = previewImage || 'https://assets.pubpub.org/_site/pub.png';
		const href = '/pub/' + atomData.slug;

		// let buttons = [{ type: 'action', text: 'Edit', action: this.setEditIndex }];
		// buttons = buttons.concat(this.props.buttons);
		const buttons = this.props.buttons || [];

		const mobileNavButtons = [
			{ type: 'link', mobile: true, text: 'Discussions', link: '/pub/' },
			{ type: 'button', mobile: true, text: 'Menu', action: undefined },
		];

		const atomNavItems = [
			{action: this.setEditorMode.bind(this, 'content'), text: 'Content', active: this.state.editorMode === 'content'},
			{action: this.setEditorMode.bind(this, 'details'), text: 'Details', active: this.state.editorMode === 'details'},
			{action: this.setEditorMode.bind(this, 'contributors'), text: 'Contributors', active: this.state.editorMode === 'contributors'},
			{link: '/pub/' + atomData.slug + '/edit', text: 'Go To Full Editor', active: false},
		];

		return (
			<div style={styles.container}>
				{/* Custom Header content, for notifcations, details etc */}
				<div style={[styles.header, !this.props.header && {display: 'none'}]}>
					{this.props.header}
				</div>

				<div style={styles.table}>

					{/* Preview card image */}
					<div style={[styles.tableCell, styles.edges]}>
						<Link to={href} style={globalStyles.link}>
							<img style={styles.image} src={'https://jake.pubpub.org/unsafe/100x100/' + image} alt={atomData.title}/>
						</Link>
					</div>

					<div style={styles.tableCell}>
						<Link to={href} style={globalStyles.link}>
							<h3 style={styles.title} className={'underlineOnHover'}>{atomData.title}</h3>
						</Link>
						<div style={styles.description}>{atomData.description}</div>
					</div>

					{/* Option Buttons */}
					<div style={[styles.tableCell, styles.edges]}>
						{!this.state.editorOpen && buttons.map((item, index)=>{
							if (item.link) {
								return <Link className={'button'} to={item.link} style={styles.button} key={'previewEditor-button-' + index} >{item.text}</Link>;
							}
							if (item.action) {
								return <div className={'button'} onClick={item.action} style={styles.button} key={'previewEditor-button-' + index}>{item.text}</div>;
							}
						})}

						{!this.state.editorOpen && this.props.setItemHandler &&
							<div>
								<div className={'button'} onClick={()=>{this.props.setItemHandler(this.props.versionData)}} style={styles.button}>
									<FormattedMessage id="previewEditor.SetToInsert" defaultMessage="Insert"/>
								</div>
							</div>

						}

						{atomData.type === 'document' &&
							<div>
								<Link to={'/pub/' + atomData.slug + '/edit'} style={globalStyles.link}>
									<div className={'button'} style={styles.button}>Go to Full Editor</div>
								</Link>
							</div>

						}

						{atomData.type !== 'document' && !this.state.editorOpen && !this.props.doNotEdit &&
							<div>
								<div className={'button'} onClick={this.openEditor} style={styles.button}>
									<FormattedMessage {...globalMessages.Edit}/>
								</div>
							</div>

						}

						{!this.state.editorOpen && !this.state.confirmDelete && !this.props.setItemHandler &&
							<div>
								<div className={'button'} onClick={this.toggleConfirmDelete} style={styles.button}>
									<FormattedMessage {...globalMessages.Delete}/>
								</div>

							</div>
						}

						{!this.state.editorOpen && this.state.confirmDelete &&
							<div>
								<div className={'button'} onClick={this.toggleConfirmDelete} style={styles.button}>
									<FormattedMessage {...globalMessages.CancelDelete}/>
								</div>
								<div className={'button'} onClick={this.deleteAtom} style={styles.button}>
									<FormattedMessage {...globalMessages.ConfirmDelete}/>
								</div>
							</div>

						}

						{this.state.editorOpen &&
							<div>
								<div className={'button'} onClick={this.closeEditor} style={styles.button}>
									<FormattedMessage {...globalMessages.CloseEditor}/>
								</div>
							</div>
						}
						{this.state.editorOpen && this.state.editorMode === 'content' &&
							<div>
								<div className={'button'} onClick={this.saveVersion} style={styles.button}>Save Version</div>
							</div>
						}

					</div>

				</div>

				{this.state.editorOpen &&
					<div style={styles.editorWrapper}>
						<HorizontalNav navItems={atomNavItems} mobileNavButtons={mobileNavButtons}/>
						{(()=>{
							switch (this.state.editorMode) {
							case 'contributors':
								return (
									<AtomContributors
										atomData={ensureImmutable({ atomData: this.props.atomData})}
										contributorsData={this.props.contributorsData}
										handleAddContributor={this.addContributor}
										handleUpdateContributor={this.props.handleUpdateContributor}
										handleDeleteContributor={this.props.handleDeleteContributor}
										isLoading={this.props.contributorsLoading}
										error={this.props.contributorsError}
										permissionType={this.props.permissionType}/>
								);
							case 'details':
								return <AtomDetails atomData={ensureImmutable({ atomData: this.props.atomData})} updateDetailsHandler={this.updateDetails} isLoading={this.props.detailsLoading} error={this.props.detailsError}/>;
							case 'content':
								return <AtomEditorPane ref={'atomEditorPane'} atomData={ensureImmutable({ atomData: this.props.atomData, currentVersionData: this.props.versionData })}/>;

							default:
								return null;
							}
						})()}

					</div>
				}


				{/* Custom Footer content, for notifcations, details etc */}
				<div style={[styles.footer, !this.props.footer && {display: 'none'}]}>
					{this.props.footer}
				</div>


			</div>
		);
	}
});

export default Radium(PreviewEditor);

styles = {
	container: {
		border: '1px solid #BBBDC0',
		borderRadius: '1px',
		margin: '1em 0em',
		backgroundColor: 'white',
	},
	image: {
		width: '2.5em',
		display: 'block',
		maxWidth: 'initial',
	},
	button: {
		display: 'block',
		textAlign: 'center',
		padding: '.1em 1em',
		fontSize: '.7em',
		marginBottom: '.5em',
		minWidth: '5em', // Need min width so Follow -> Following doesn't cause resize
		whiteSpace: 'nowrap',
	},
	table: {
		display: 'table',
		width: '100%',
		'@media screen and (min-resolution: 3dppx), screen and (max-width: 767px)': {
			display: 'block',
		}
	},
	tableCell: {
		display: 'table-cell',
		verticalAlign: 'top',
		padding: '.5em',
	},
	edges: {
		width: '1%',
	},
	title: {
		margin: 0,
		display: 'inline-block',
	},
	description: {
		fontSize: '.9em',
		margin: '.5em 0em',
	},
	header: {
		fontSize: '0.9em',
		margin: '0em .5em .25em .5em',
		padding: '.5em 0em',
		borderBottom: '1px solid #F3F3F4',
	},
	editorWrapper: {
		margin: '0.0em .5em',
		// padding: '.5em 0em',
		// borderTop: '1px solid #F3F3F4',
	},
	footer: {
		fontSize: '0.9em',
		margin: '0.25em .5em 0em .5em',
		padding: '.5em 0em',
		borderTop: '1px solid #F3F3F4',
	},
};
