#!/usr/bin/env node

'use strict';

var builder = require('../lib/index');

var opts = require('nomnom')
	.options({
		path: {
			position: 0,
			help: 'Directory containing language files',
			required: true
		},
		output: {
			position: 1,
			help: 'Directory to place output files',
			required: true
		}
	}).parse();

builder(opts.path, opts.output, function(err){
	if(err) {
		console.error(err);
	}
	process.exit(err === null ? 0 : 1);
});
