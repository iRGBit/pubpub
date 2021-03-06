import {expect} from 'chai';
import {shallowRender} from 'tests/helpersClient';
import {JupyterViewer} from './JupyterViewer.jsx'

describe('Components', () => {
	describe('JupyterViewer.jsx', () => {

		it('should render with empty props', () => {
			const props = {};
			const {renderOutput, error} = shallowRender(JupyterViewer, props) ;

			expect(error).to.not.exist; // Did not render an error
			expect(renderOutput).to.exist; // Successfully rendered

		});

	});
});
