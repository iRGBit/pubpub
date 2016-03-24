var mongoose  = require('mongoose');
var Schema    =  mongoose.Schema;
var ObjectId  = Schema.Types.ObjectId;

var Heroku = require('heroku-client');
var heroku = undefined;

if(process.env.NODE_ENV !== 'production'){
	// import {herokuApiKey} from '../authentication/herokuCredentials';
	var herokuApiKey = require('../authentication/herokuCredentials').herokuApiKey;
	heroku = new Heroku({ token: herokuApiKey });
}else{
	heroku = new Heroku({ token: process.env.HEROKU_API_KEY });
}

var journalSchema = new Schema({

	journalName: { type: String},
	subdomain: { type: String, required: true, index: true, unique: true },
	customDomain: { type: String, index: true, unique: true, sparse: true },
	journalLogoURL: { type: String},
	journalLogoThumbnailURL: { type: String},
	journalDescription: { type: String},

	defaultLanguage: {type: String},
	createDate: {type: Date},

	admins: [{ type: ObjectId, ref: 'User' }],

	pubsFeatured: [{ type: ObjectId, ref: 'Pub' }],
	pubsSubmitted: [{ type: ObjectId, ref: 'Pub' }],

	autoFeature: { type: Boolean },

	design: { type: Schema.Types.Mixed },
	landingPage: { type: ObjectId, ref: 'Pub' },

	settings: { type: Schema.Types.Mixed },

	collections: [{
		description: { type: String},
		slug: {type: String},
		title: { type: String},
		pubs: [{ type: ObjectId, ref: 'Pub' }],
		headerImage: { type: String},
	}],

	followers: [{ type: ObjectId, ref: 'User' }],

});

journalSchema.statics.isUnique = function (subdomain, callback) {

	this.findOne({'subdomain':subdomain})
	.exec(function (err, journal) {
			if (err) return callback(err);
			// if (err) return res.json(500);

			if(journal!=null){ //We found a journal
				return callback(null,false);  //False - is not unique
			}else{ //We did not find a pub
				return callback(null,true) //True -  is unique.
			}
		});
};

journalSchema.statics.findByHost = function(host,callback) {
	this.findOne(
		{ $or:[ {'subdomain':host.split('.')[0]},
		{'customDomain':host}]})
	.exec(function(err, journal) {
		return callback(err,journal);
	});
}

journalSchema.statics.updateHerokuDomains = function (oldDomain, newDomain) {
	heroku.delete('/apps/pubpub/domains/' + oldDomain, function (err, app) {
		if (err) {console.log(err);}
		heroku.post('/apps/pubpub/domains', { hostname: newDomain }, function (err, app) {
			if (err) {console.log(err);}
			console.log('New domain succesfully added');
		});
	});
};

journalSchema.statics.populationObject = function(collectionsOnly) {
	const options = [
		{path: 'landingPage', select: 'markdown'},

		{path: "pubsSubmitted", select:"title abstract slug settings"},
		{path: "admins", select:"name firstName lastName username thumbnail"},
		{
			path: "pubsFeatured",
			select:"title abstract slug authors lastUpdated createDate discussions",
			populate: [{
				path: 'authors',
				model: 'User',
				select: 'name firstName lastName username thumbnail',
			},
			{
				path: 'discussions',
				model: 'Discussion',
				select: 'markdown author postDate',
				populate: {
					path: 'author',
					model: 'User',
					select: 'name firstName lastName username thumbnail',
				},
			}],
		},
		{
			path: "collections.pubs",
			select:"title abstract slug authors lastUpdated createDate discussions",
			populate: [{
				path: 'authors',
				model: 'User',
				select: 'name firstName lastName username thumbnail',
			},
			{
				path: 'discussions',
				model: 'Discussion',
				select: 'markdown author postDate',
				populate: {
					path: 'author',
					model: 'User',
					select: 'name firstName lastName username thumbnail',
				},
			}],
		}
	];
	return collectionsOnly ? [options[3]] : options;
};

module.exports = mongoose.model('Journal', journalSchema);
