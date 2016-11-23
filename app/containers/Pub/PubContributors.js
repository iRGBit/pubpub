import React, { PropTypes } from 'react';
import Radium from 'radium';
import { Popover, PopoverInteractionKind, Position, Menu, MenuItem, MenuDivider, Tooltip } from 'components/Blueprint';
import { AutocompleteBar } from 'components';
import { postContributor, putContributor, deleteContributor } from './actionsContributors';
let styles;

import request from 'superagent';


export const PubContributors = React.createClass({
	propTypes: {
		contributors: PropTypes.array,
		pubId: PropTypes.number,
		dispatch: PropTypes.func,
	},

	getInitialState: function() {
		return {
			newContributor: null,
			contributorStates: {},
		};
	},

	componentWillMount() {
		const contributors = this.props.contributors || [];
		const contributorStates = {};
		contributors.map((contributor)=> {
			contributorStates[contributor.id] = {
				canEdit: contributor.canEdit || false,
				canRead: contributor.canRead || false,
				isAuthor: contributor.isAuthor || false,
				isHidden: contributor.isHidden || false,
			};
		});
		this.setState({ contributorStates: contributorStates });
	},

	componentWillReceiveProps(nextProps) {
		const prevContributors = this.props.contributors || [];
		const nextContributors = nextProps.contributors || [];

		if (prevContributors.length < nextContributors.length) {
			const contributors = nextProps.contributors || [];
			const contributorStates = {};
			contributors.map((contributor)=> {
				contributorStates[contributor.id] = contributor.id in this.state.contributorStates 
					? this.state.contributorStates[contributor.id]
					: {
						canEdit: contributor.canEdit || false,
						canRead: contributor.canRead || false,
						isAuthor: contributor.isAuthor || false,
						isHidden: contributor.isHidden || false,
					};
			});
			this.setState({ newContributor: null, contributorStates: contributorStates });
		}
	},

	loadOptions: function(input, callback) {
		if (input.length < 3) {
			callback(null, { options: null });
		}
		request.get('/api/search/user?q=' + input).end((err, response)=>{
			const responseArray = (response && response.body) || [];
			const options = responseArray.map((item)=>{
				return {
					value: item.username,
					label: item.firstName + ' ' + item.lastName,
					slug: item.username,
					image: item.image,
					id: item.id,
				};
			});
			callback(null, { options: options });
		});
	},
	handleSelectChange: function(value) {
		this.setState({ newContributor: value });
	},

	isAuthorChange: function(contributorId, evt) {
		this.setState({ 
			contributorStates: {
				...this.state.contributorStates,
				[contributorId]: {
					...this.state.contributorStates[contributorId],
					isAuthor: evt.target.checked
				}
			} 
		});
		this.props.dispatch(putContributor(
			this.props.pubId, 
			contributorId, 
			this.state.contributorStates[contributorId].canEdit, 
			this.state.contributorStates[contributorId].canRead, 
			evt.target.checked,
			this.state.contributorStates[contributorId].isHidden, 
			
		));
	},

	isHiddenChange: function(contributorId, evt) {
		this.setState({ 
			contributorStates: {
				...this.state.contributorStates,
				[contributorId]: {
					...this.state.contributorStates[contributorId],
					isHidden: evt.target.checked
				}
			} 
		});
		this.props.dispatch(putContributor(
			this.props.pubId, 
			contributorId, 
			this.state.contributorStates[contributorId].canEdit, 
			this.state.contributorStates[contributorId].canRead, 
			this.state.contributorStates[contributorId].isAuthor, 
			evt.target.checked
		));
	},

	permissionChange: function(contributorId, permission) {
		const canEdit = permission === 2;
		const canRead = permission === 1;
		this.setState({ 
			contributorStates: {
				...this.state.contributorStates,
				[contributorId]: {
					...this.state.contributorStates[contributorId],
					canRead: canRead,
					canEdit: canEdit,
				}
			} 
		});
		this.props.dispatch(putContributor(
			this.props.pubId, 
			contributorId, 
			canEdit, 
			canRead, 
			this.state.contributorStates[contributorId].isAuthor, 
			this.state.contributorStates[contributorId].isHidden, 
		));
	},

	addContributor: function() {
		this.props.dispatch(postContributor(this.state.newContributor.id, this.props.pubId));
	},

	deleteContributor: function(contributorId) {
		this.props.dispatch(deleteContributor(this.props.pubId, contributorId));
	},

	render() {
		const contributors = this.props.contributors || [];
		console.log('contributorStates', this.state.contributorStates);
		return (
			<div style={styles.container}>
				<h2>Contributors</h2>
				<p>Contributors can be added and given edit permissions, to signify authorship, or to ackowledge contributions. Check out roles.</p>

				<AutocompleteBar
					filterOptions={(options)=>{
						return options.filter((option)=>{
							for (let index = 0; index < contributors.length; index++) {
								if (contributors[index].userId === option.id) {
									return false;
								}
							}
							return true;
						});
					}}
					placeholder={'Find New Contributor'}
					loadOptions={this.loadOptions}
					value={this.state.newContributor}
					onChange={this.handleSelectChange}
					onComplete={this.addContributor}
					completeDisabled={!this.state.newContributor || !this.state.newContributor.id}
				/>			

					
				{contributors.map((contributor, index)=> {
					const user = contributor.user || {};
					const canEdit = this.state.contributorStates[contributor.id].canEdit;
					const canRead = this.state.contributorStates[contributor.id].canRead;
					const isAuthor = this.state.contributorStates[contributor.id].isAuthor;
					return (
						<div key={'contributorId-' + contributor.id}>
							<div style={styles.contributorName}>{user.firstName + ' ' + user.lastName}</div>
							<img src={'https://jake.pubpub.org/unsafe/50x50/' + user.image} alt={user.firstName + ' ' + user.lastName} />
							{/*<div>
								{user.roles.map((role)=> {
									return <div style={styles.role}>{role}</div>;
								})}	
							</div>*/}
							<Popover 
								content={<Menu>
									<MenuItem 
										onClick={this.permissionChange.bind(this, contributor.id, 0)}
										text={
											<div>
												None
												<p style={styles.menuSubText}>Ackowledge contributor for their input, but grant no special permissions.</p>
											</div>
										}
									/>
									<MenuDivider />
									<MenuItem 
										onClick={this.permissionChange.bind(this, contributor.id, 1)}
										text={
											<div>
												Can Read 
												<p style={styles.menuSubText}>Allow contributor to read private versions and discussions.</p>
											</div>
										}
									/>
									<MenuDivider />
									<MenuItem 
										onClick={this.permissionChange.bind(this, contributor.id, 2)}
										text={
											<div>
												Can Edit 
												<p style={styles.menuSubText}>Allow contributor to create new versions, publish versions, manage discussions, submit to journals.</p>
											</div>
										}
									/>
								</Menu>}
								interactionKind={PopoverInteractionKind.CLICK}
								position={Position.BOTTOM_LEFT}
								transitionDuration={200}
								popoverClassName="pt-minimal"
							>
								<Tooltip content={'Authors are granted Edit permissions'} isDisabled={!isAuthor} position={Position.BOTTOM} useSmartPositioning={true}>
									<button type="button" className={isAuthor ? 'pt-button pt-disabled' : 'pt-button'}>
										Permission: {(canEdit || isAuthor) && 'Can Edit'}{(canRead && !isAuthor) && 'Can Read'}{(!canRead && !canEdit && !isAuthor) && 'None'}
										<span className="pt-icon-standard pt-icon-caret-down pt-align-right" />
									</button>
								</Tooltip>
								
							</Popover>	

							<label className="pt-control pt-checkbox">
								<input type="checkbox" checked={this.state.contributorStates[contributor.id].isAuthor} onChange={this.isAuthorChange.bind(this, contributor.id)} />
								<span className="pt-control-indicator"></span>
								List as Author
							</label>
							<label className="pt-control pt-checkbox">
								<input type="checkbox" checked={this.state.contributorStates[contributor.id].isHidden} onChange={this.isHiddenChange.bind(this, contributor.id)} />
								<span className="pt-control-indicator"></span>
								Hide Contributor
							</label>

							<button type="button" className="pt-button pt-intent-danger pt-minimal" onClick={this.deleteContributor.bind(this, contributor.id)}>Delete Contributor</button>
						</div>
					);
				})}
			</div>
		);
	}
});

export default Radium(PubContributors);

styles = {
	container: {
		padding: '1.5em',
	},
	contributorName: {
		paddingTop: '1em',
	},
	menuSubText: {
		maxWidth: '300px',
		marginBottom: 0,
		fontSize: '0.85em',
		whiteSpace: 'normal',
	},
	role: {
		display: 'inline-block',
		border: '1px solid #CCC',
		fontSize: '.85em',
		padding: '0em .5em',
		marginRight: '1em',
	},
};