'use strict';

var expect = require('chai').expect,
	langBuilder = require('../');

describe('langBuilder', function() {

	describe('test group 1', function() {

		it('should pass', function() {
			var value = langBuilder();
			expect( value ).to.equal(1);
		});

	});

});
