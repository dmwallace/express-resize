'use strict';

///////////////
///INCLUDES///
//////////////

var sharp = require('sharp');
var pathUtil = require('path');

var util = require('./utils/utils');

///////////////
//PUBLIC API//
//////////////

module.exports = resizer;

///////////////
/////MAIN/////
//////////////

function resizer(req, res, next) {
	
	var path = decodeURI(util.relativePath(req._parsedUrl.pathname));
	var requestedAsset = util.parseReqURL(path);
	if (requestedAsset.constructor === Array) {
		requestedAsset = requestedAsset.join('/');
	}
	var ext = pathUtil.extname(requestedAsset).toLowerCase();
	
	var formats = ['.jpg', '.jpeg', '.gif', '.png', '.svg'];
	
	if (formats.indexOf(ext) !== -1) {
		
		util.assetAvailable(path, function (err) {
			if (err) {
				return res.sendStatus(404);
			}
			
			var reqParams = util.params(req);
			
			if (reqParams !== null && (reqParams.hasOwnProperty('height') || reqParams.hasOwnProperty('width'))) {
				
				if (ext == '.gif') {
					
					// pass through gifs - sharp doesn't support gif output
					return res.sendFile(process.cwd() + '/' + path);
					
				} else {
					res.writeHead(200, {'Content-Type': 'image/' + ext.slice(1)});
					
					return sharp(path)
					.resize(reqParams.width, reqParams.height)
					.progressive()
					.pipe(res);
				}
			}
			
			return res.sendFile(process.cwd() + '/' + path);
			
		})
		
	}
	else {
		return next();
	}
}

