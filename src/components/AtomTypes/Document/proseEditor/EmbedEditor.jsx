import ElementPortal from 'react-element-portal';
import Radium from 'radium';
import React, {PropTypes} from 'react';

const popupKeyframes = Radium.keyframes({
  '0%': {opacity: '0', transform: 'matrix(.97,0,0,1,0,12)'},
	'20%': {opacity: '0.7', transform: 'matrix(.99,0,0,1,0,2)'},
	'40%': {opacity: '0.7', transform: 'matrix(1,0,0,1,0,-1)'},
	'70%': {opacity: '1', transform: 'matrix(1,0,0,1,0,0)'},
  '100%': {opacity: '1', transform: 'matrix(1,0,0,1,0,0)'},
}, 'popup');



export const EmbedEditor = React.createClass({
	propTypes: {
		status: PropTypes.oneOf(['loading', 'connected', 'reconnecting', 'disconnected', 'timeout', 'unknown']),
		coordinates: PropTypes.string,
		embedAttrs: PropTypes.object,
    saveCallback: PropTypes.func,
  },

  setEmbedAttribute: function(key, value, evt) {
    this.props.saveCallback(key, value, evt);
  },

  changeCaption: function() {

  },
	render: function() {

		const {participants, status} = this.props;

		return (
      <div className={'contrastbox'} style={styles.box}>

        <label htmlFor={'test'}>
          Alignment
        </label>

        <div style={styles.alignDiv} name={'test'}>
          <div onClick={this.setEmbedAttribute.bind(this, 'align', 'inline')} style={[styles.alignOption, this.props.embedAttrs.align === 'inline' && styles.activeAlign]}>Inline</div>
          <div onClick={this.setEmbedAttribute.bind(this, 'align', 'full')} style={[styles.alignOption, this.props.embedAttrs.align === 'full' && styles.activeAlign]}>Full</div>
          <div onClick={this.setEmbedAttribute.bind(this, 'align', 'left')} style={[styles.alignOption, this.props.embedAttrs.align === 'left' && styles.activeAlign]}>Left</div>
          <div onClick={this.setEmbedAttribute.bind(this, 'align', 'right')} style={[styles.alignOption, this.props.embedAttrs.align === 'right' && styles.activeAlign]}>Right</div>
        </div>

        <label htmlFor={'sizeNote'}>
          Size
        </label>
        <input type="text" id={'sizeNote'} name={'size'}/>

        <label htmlFor={'captionNote'}>
          Caption
        </label>
        <input onChange={this} type="text" id={'captionNote'} name={'caption'}/>

      </div>
	  );

	}
});

const styles = {
  activeAlign: {
    fontWeight: '700',
  },
  box: {
    padding: '0.6em 1.2em',
    fontSize: '0.8em',
		animation: 'x 180ms forwards linear',
		animationName: popupKeyframes,
  },
  alignDiv: {
    paddingBottom: '0.5em',
  },
  alignOption: {
    display: 'inline-block',
    paddingRight: '0.8em',
    cursor: 'pointer',
  }
};

export default Radium(EmbedEditor);