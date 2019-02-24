const reviews = require('./mocks/reviews.json');

describe('duplicateReviews', () => {
	it('returns last id', () => {
		expect(duplicateReviews(reviews, {user: 'title-lint'})).toBe(194380958)
	})

	it('returns null if not found', () => {
		expect(duplicateReviews(reviews, {user: 'blah'})).toBe(null)
	})


})


function duplicateReviews(reviews, {user, event}) {
	try {
		return reviews[0].filter( v => {
			return v.user.login === `${user}[bot]`
		}).pop().id
	} catch(e) {
		return null
	}
}
