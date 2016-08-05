import {wilsonScore} from 'decay';

export function sortDiscussions(sortBy, discussionsData, randomSeed, authors) {

  console.log(sortBy);

	let sortedDiscussions;

	if(sortBy=='Best Discussions') {

		console.log('entered BEST');


	const scoredDiscussions = scoreDiscussions(discussionsData, randomSeed, authors);

		sortedDiscussions = scoredDiscussions.sort(function(aIndex, bIndex) {

			const aScore = aIndex.score;
			const bScore = bIndex.score;

			if (aScore < bScore) {
				return 1;
			} else if (aScore > bScore) {
				return -1;
			} else if (aScore === bScore) {

				if (new Date(aIndex.createDate) < new Date(bIndex.createDate)) {

					return 1;

				} else if (new Date(aIndex.createDate) > new Date(bIndex.createDate)) {

					return -1;
				}
			}
			return 0;

		}.bind(this));

	} else if (sortBy=='Top Discussions') {

		sortedDiscussions = discussionsData.sort(function(aIndex, bIndex){

			const aUpvotes = aIndex.linkData.metadata.yays - aIndex.linkData.metadata.nays + 1;
			const bUpvotes = bIndex.linkData.metadata.yays - bIndex.linkData.metadata.nays + 1;

			if (aUpvotes < bUpvotes) {

				return 1;
			} else if (aUpvotes > bUpvotes) {

				return -1;
			}
			return 0;

		}.bind(this));

	} else if (sortBy=='Longest Discussions') {

		sortedDiscussions = discussionsData.sort(function(aIndex, bIndex){

			const aReplies = aIndex.children.length
			const bReplies = bIndex.children.length

			if (aReplies < bReplies) {
				return 1;
			} else if (aReplies > bReplies) {
				return -1;
			}
			return 0;

		});
	} else if (sortBy=='Newest Discussions'){

		sortedDiscussions = discussionsData.sort(function(aIndex, bIndex){

			if (new Date(aIndex.versionData.createDate) < new Date(bIndex.versionData.createDate)) {
				return 1;
			} else if (new Date(aIndex.versionData.createDate) > new Date(bIndex.versionData.createDate)) {
				return -1;
			}
			return 0;

		});
	} else if (sortBy=='Oldest Discussions'){

		sortedDiscussions = discussionsData.sort(function(aIndex, bIndex){

			if (new Date(aIndex.versionData.createDate) > new Date(bIndex.versionData.createDate)) {
				return 1;
			} else if (new Date(aIndex.versionData.createDate) < new Date(bIndex.versionData.createDate)) {
				return -1;
			}
			return 0;

		});

	} else if (sortBy=='Filter - Replied By Author'){

		sortedDiscussions = discussionsData.filter((discussionItem)=>{
			return authorReplied(discussionItem, authors);
		});

	} else if (sortBy=='Filter - Links'){

		sortedDiscussions = discussionsData.filter(this.includedLink)

	} else if (sortBy=='Filter - Replied'){

		console.log('it entered the else statement for filter for replied discussions');

		sortedDiscussions = discussionsData.filter(this.replied)

	}

	return sortedDiscussions;
}

export function scoreDiscussions(discussionsData, randomSeed, authors) {

	for(let i = 0; i < discussionsData.length; i++) {
		discussionsData[i].score=getScore(discussionsData[i],randomSeed, authors);
	}
	return discussionsData;
}

export function authorReplied(discussionItem, authors) {

	for (let i=0; i<discussionItem.children.length;i++){
 
		const hasChildCommentByThisPubAuthor = (!!(authors.find( (author) => {

			return (discussionItem.children[i].authorsData[0].source.username === author);
		})) );

		if(hasChildCommentByThisPubAuthor){
			return hasChildCommentByThisPubAuthor
		}
	}
}

export function includedLink(discussionItem) {

	const hasLink = discussionItem.versionData.content.markdown.indexOf('http')

	if(hasLink>0){
		return true
	}
}

export function replies(discussionItem){
	return discussionItem.children.length
}

// topChildren[0].linkData.metadata.nays

export function getScore(discussionItem, randomSeed, authors) {

	const didAuthorReply = authorReplied(discussionItem, authors);
	const didIncludeLink = includedLink(discussionItem);
	const amountReplies = replies(discussionItem);
	const wilsonLowerScore = wilsonScore();
	const yays = (discussionItem.linkData.metadata.yays) ? discussionItem.linkData.metadata.yays : 0;
	const nays = (discussionItem.linkData.metadata.nays) ? discussionItem.linkData.metadata.nays : 0;

	var n = yays + nays;
	if (n === 0) {
		return 0;
	}
	const z=1.96
	let p = yays / n, zzfn = z*z / (4*n);


	let upperScore = (p + 2*zzfn + z*Math.sqrt((zzfn / n + p*(1 - p))/n)) / (1 + 4*zzfn)
	let lowerScore = wilsonScore(yays, nays);

	if (didAuthorReply) {
		lowerScore = lowerScore + (wilsonLowerScore(yays+3,nays)-lowerScore)
	}

	if (didIncludeLink){
		lowerScore = lowerScore + (wilsonLowerScore(yays+1,nays)-lowerScore)
	}

	if (amountReplies>0){

		const normalReplies = 2*Math.log(replies)

		lowerScore = lowerScore + (wilsonLowerScore(yays+normalReplies,nays)-lowerScore)

	}

	if (upperScore>1){

		upperScore=1
	}

	const interval = (upperScore-lowerScore)/3

  // const random = randomSeed()*interval
  const random = randomSeed*interval

  lowerScore=lowerScore+random

	return lowerScore
}
