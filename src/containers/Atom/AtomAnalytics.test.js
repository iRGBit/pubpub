import {expect} from 'chai';
import {shallowRender} from 'tests/helpersClient';
import {AtomAnalytics} from './AtomAnalytics.jsx'

describe('Components', () => {
	describe('AtomAnalytics.jsx', () => {

		it('should render with empty props', () => {
			const props = {};
			const {renderOutput, error} = shallowRender(AtomAnalytics, props) ;

			expect(error).to.not.exist; // Did not render an error
			expect(renderOutput).to.exist; // Successfully rendered
			
		});

	});
});
