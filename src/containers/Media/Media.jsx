import React, { PropTypes } from 'react';
import {connect} from 'react-redux';
import Radium from 'radium';

// import {globalStyles} from 'utils/styleConstants';
// import {globalMessages} from 'utils/globalMessages';
// import {FormattedMessage} from 'react-intl';
// import Dropzone from 'react-dropzone';
// import {s3Upload} from 'utils/uploadFile';
// import {createAsset, updateAsset} from './actions';

let styles;

export const Media = React.createClass({
	propTypes: {
		mediaData: PropTypes.object,
		dispatch: PropTypes.func,
	},

	getInitialState() {
		return {
			showMedia: false,
			closeCallback: undefined
		};
	},

	componentDidMount() {
		window.toggleMedia = this.toggleMedia;
	},

	toggleMedia: function(pm, callback, node) {
		this.setState({
			showMedia: true,
			closeCallback: callback,
		});
	},

	save: function() {
		const versionData = {
			_id: '578951a86dcc445787b0ef5a',
			type: 'image',
			message: '',
			parent: {
				_id: '578951a86dcc445787b0ef57',
				slug: '95e48c3441a46bf95481b60dbaeaba469b2d4d74',
				title: 'New Pub: 1468617128060',
				type: 'image',
			},
			content: {
				url: 'https://assets.pubpub.org/uiyvascj/1468617127681.gif',
			}
		};

		this.state.closeCallback({
			source: versionData._id, 
			className: 'embed',
			id: versionData._id,
			align: 'full',
			size: '100%',
			caption: 'Caption here',
			data: versionData,
		});
		this.setState({
			showMedia: false,
			closeCallback: undefined
		});
	},

	render: function() {

		return (

			<div style={[styles.container, !this.state.showMedia && {opacity: '0', pointerEvents: 'none'}]}>
				<div style={styles.content}>
					<p>Media</p>

					<div className={'button'} onClick={this.save}>Save</div>
				</div>
				
			</div>

		);
	}

});

export default connect( state => {
	return {
		mediaData: state.media,
	};
})( Radium(Media) );

styles = {
	container: {
		position: 'fixed',
		width: '100vw',
		height: '100vh',
		top: 0,
		left: 0,
		backgroundColor: 'rgba(0,0,0,0.5)',
		opacity: 1,
		transform: 'scale(1.0)',
		transition: '.1s linear opacity, .1s linear transform',
		zIndex: 999,
	},
	content: {
		backgroundColor: 'white',
		width: '600px',
		margin: '20vh auto 0 auto',
		height: '300px',
	},
};
