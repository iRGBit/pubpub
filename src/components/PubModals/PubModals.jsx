import React, {PropTypes} from 'react';
import Radium from 'radium';
import {globalStyles} from '../../utils/styleConstants';
import {PubModalCite, PubModalTOC, } from './';
import {PubStatus, PubReviews, PubDiscussions} from '../';

let styles = {};

const PubModals = React.createClass({
	propTypes: {
		slug: PropTypes.string,
		status: PropTypes.string,
		pubStatus: PropTypes.string,

		openPubModalHandler: PropTypes.func,
		closePubModalHandler: PropTypes.func,
		closeMenuHandler: PropTypes.func,
		activeModal: PropTypes.string,
		// TOC Props
		tocData: PropTypes.array,
		// Status Data
		featuredIn: PropTypes.array,
		submittedTo: PropTypes.array,
		// Reviews Data
		reviewsData: PropTypes.array,
		// Discussions Data
		discussionsData: PropTypes.array,
		expertsData: PropTypes.object,
		addDiscussionHandler: PropTypes.func,
		addDiscussionStatus: PropTypes.string,
		newDiscussionData: PropTypes.object,
		userThumbnail: PropTypes.string,
	},

	closeModalandMenu: function() {
		this.props.closePubModalHandler();
		this.props.closeMenuHandler();
	},

	render: function() {
		return (
			<div className={'pubModals'} style={[styles.container, styles[this.props.status]]}>

				<div className="modals" style={[styles.modalWrapper, this.props.activeModal && styles.modalWrapperActive]}>

					<div className="modalSplash" onClick={this.closeModalandMenu} style={[styles.modalSplash, this.props.activeModal && styles.modalSplashActive]}>
					</div>

					<div className="modalContainer" style={[styles.modalContainer, this.props.activeModal && styles.modalContainerActive]} >

						<div key={'modalBack'} style={styles.modalBackButton} onClick={this.props.closePubModalHandler}>Back</div>

						{() => {
							switch (this.props.activeModal) {
							case 'tableOfContents':
								return (<PubModalTOC 
										tocData={this.props.tocData}
										closeModalAndMenuHandler={this.closeModalandMenu}/>
									);
							case 'cite':
								return (<PubModalCite/>
									);
							case 'reviews':
								return (<div>
										<PubStatus 
											slug={this.props.slug}
											pubStatus={this.props.pubStatus}
											featuredIn={this.props.featuredIn}
											submittedTo={this.props.submittedTo}/>
										<PubReviews 
											slug={this.props.slug}
											reviewsData={this.props.reviewsData} />
									</div>);
										

							case 'discussions':
							// Don't 
								return (<PubDiscussions 
									slug={this.props.slug}
									discussionsData={this.props.discussionsData}
									expertsData={this.props.expertsData}
									addDiscussionHandler={this.props.addDiscussionHandler} 
									pHashes={{}} // Send a blank object in because we don't want to repopulate the highlights. We'll probably have to do something different so selections are clickable/scrollable...
									addDiscussionStatus={this.props.addDiscussionStatus}
									newDiscussionData={this.props.newDiscussionData}
									userThumbnail={this.props.userThumbnail}/>
								);
							
							
							default:
								return null;
							}
						}()}
					</div>
				</div>

			</div>
		);
	}
});

export default Radium(PubModals);

styles = {	
	container: {
		fontFamily: globalStyles.headerFont,
		transition: '.3s linear opacity .25s', // This is the transition for pub load, not for modalOpen
	},
	loading: {
		opacity: 0,
	}, 
	loaded: {
		opacity: 1
	},

	// Modal Styling
	modalWrapper: {
		width: '100%',
		height: '100%',
		position: 'absolute',
		top: 0,
		left: 0,
		pointerEvents: 'none',

		'@media screen and (min-resolution: 3dppx), (max-width: 767px)': {
			position: 'fixed',
			top: 0,
			left: 0,
			width: '100vw',
			height: '100vh',
			// backgroundColor: 'red',
			zIndex: 9,
			transition: '.2s linear transform',
			transform: 'translateX(105%)',
		},
	},
	modalWrapperActive: {
		'@media screen and (min-resolution: 3dppx), (max-width: 767px)': {
			transform: 'translateX(0%)',
		}
	},

	modalSplash: {
		opacity: 0,
		pointerEvents: 'none',
		width: '100%',
		// height: 'calc(100% - ' + globalStyles.headerHeight + ')',
		height: '100%',
		position: 'absolute',
		top: 0,
		backgroundColor: 'rgba(255,255,255,0.7)',
		transition: '.1s linear opacity',
		zIndex: 10,
		'@media screen and (min-resolution: 3dppx), (max-width: 767px)': {
			position: 'fixed',
			width: '10vw',
			height: '100%',
			transition: '0s linear opacity',
			backgroundColor: 'transparent',
			left: 0,
			top: 0,
		},
	},
	modalSplashActive: {
		opacity: 1,
		pointerEvents: 'auto',
	},
	modalContainer: {
		width: '90%',
		// minHeight: 400,
		maxHeight: 'calc(100% - 90px)',
		// height: 'calc(100% - 90px)',
		overflow: 'hidden',
		overflowY: 'scroll',
		margin: '0 auto',
		position: 'absolute',
		top: 60,
		left: '5%',
		backgroundColor: 'white',
		boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.25)',
		zIndex: 150,

		opacity: 0,
		pointerEvents: 'none',
		transform: 'scale(0.9)',
		transition: '.0s linear opacity, .1s linear transform',

		'@media screen and (min-resolution: 3dppx), (max-width: 767px)': {
			position: 'fixed',
			width: '90vw',
			height: '100%',
			maxHeight: '100%',
			// backgroundColor: 'blue',
			left: '10vw',
			top: 0,
			// opacity: 1,
			backgroundColor: globalStyles.sideBackground,
			transition: '0s linear opacity 0.3s, 0s linear transform',
			transform: 'scale(1.0)',
		},

	},
	modalContainerActive: {
		opacity: 1,
		pointerEvents: 'auto',
		transform: 'scale(1.0)',
		'@media screen and (min-resolution: 3dppx), (max-width: 767px)': {
			transition: '0s linear opacity 0s, 0s linear transform',	
		},
		
	},
	modalContainerInactive: {
		pointerEvents: 'none',
		opacity: 0,
		'@media screen and (min-resolution: 3dppx), (max-width: 767px)': {
			opacity: 1,
		},
	},

	modalBackButton: {
		display: 'none',
		margin: '15px',
		fontFamily: globalStyles.headerFont,
		padding: '0px',
		fontSize: '1.5em',
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		textAlign: 'right',
		':hover': {
			cursor: 'pointer',
			color: 'black',
		},
		'@media screen and (min-resolution: 3dppx), (max-width: 767px)': {
			display: 'block',
			margin: '0px 0px 0px 60px',
			fontSize: '2em',
			width: 'calc(100% - 100px)',
			padding: '20px 20px',
		},
	},
	modalBackButtonAlwaysShow: {
		display: 'block',		
	}
};