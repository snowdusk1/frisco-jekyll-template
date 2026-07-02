/* super-search
Author: Kushagra Gour (http://kushagragour.in)
MIT Licensed
*/
(function () {
	var searchFile = '/feed.xml',
		searchEl,
		searchInputEl,
		searchResultsEl,
		currentInputValue = '',
		lastSearchResultHash,
		posts = [];

	// Strips HTML tags and extracts clean text from XML nodes
	function getNodeText(node) {
		if (!node) return '';
		var text = node.textContent || node.text || '';
		return text.replace(/<\/?[^>]+(>|$)/g, ""); // Remove any stray HTML tags
	}

	function getPostsFromXml(xmlDoc) {
		var items = [];
		// Support both Atom (entry) and RSS (item) formats
		var nodes = xmlDoc.querySelectorAll('item, entry');
		
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			var titleNode = node.querySelector('title');
			var linkNode = node.querySelector('link');
			var descNode = node.querySelector('description, content, summary');
			var dateNode = node.querySelector('pubDate, updated, dc\\:date');

			// Extract link attributes for Atom, or node value for RSS
			var link = '';
			if (linkNode) {
				link = linkNode.getAttribute('href') || linkNode.textContent || linkNode.text || '';
			}

			items.push({
				title: titleNode ? titleNode.textContent : '',
				link: link,
				description: getNodeText(descNode),
				pubDate: dateNode ? dateNode.textContent : ''
			});
		}
		return items;
	}

	window.toggleSearch = function toggleSearch() {
		searchEl.classList.toggle('is-active');
		if (searchEl.classList.contains('is-active')) {
			// while opening
			searchInputEl.value = '';
		} else {
			// while closing
			searchResultsEl.classList.add('is-hidden');
		}
		setTimeout(function () {
			searchInputEl.focus();
		}, 210);
	}

	function handleInput() {
		var currentResultHash, d;

		currentInputValue = (searchInputEl.value + '').trim().toLowerCase();
		if (!currentInputValue || currentInputValue.length < 3) {
			lastSearchResultHash = '';
			searchResultsEl.classList.add('is-hidden');
			return;
		}
		searchResultsEl.style.offsetWidth;

		// Escape special characters and enforce whole-word matching using regex word boundaries (\b)
		var escapedInput = currentInputValue.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
		var searchRegex = new RegExp('\\b' + escapedInput + '\\b', 'i');

		var matchingPosts = posts.filter(function (post) {
			var title = (post.title || '').toLowerCase();
			var body = (post.description || '').toLowerCase();

			return searchRegex.test(title) || searchRegex.test(body);
		});

		if (!matchingPosts.length) {
			searchResultsEl.classList.add('is-hidden');
		}
		
		currentResultHash = matchingPosts.reduce(function(hash, post) { return post.title + hash; }, '');
		
		if (matchingPosts.length && currentResultHash !== lastSearchResultHash) {
			searchResultsEl.classList.remove('is-hidden');
			searchResultsEl.innerHTML = matchingPosts.map(function (post) {
				d = new Date(post.pubDate);
				// Fallback if date parsing fails
				var formattedDate = isNaN(d.getTime()) ? post.pubDate : d.toUTCString().replace(/.*(\d{2})\s+(\w{3})\s+(\d{4}).*/,'$2 $1, $3');
				return '<li><a href="' + post.link + '">' + post.title + '<span class="super-search__result-date">' + formattedDate + '</span></a></li>';
			}).join('');
		}
		lastSearchResultHash = currentResultHash;
	}

	function init(options) {
		searchFile = options.searchFile || searchFile;
		searchEl = document.querySelector(options.searchSelector || '#js-super-search');
		searchInputEl = document.querySelector(options.inputSelector || '#js-super-search__input');
		searchResultsEl = document.querySelector(options.resultsSelector || '#js-super-search__results');

		var xmlhttp=new XMLHttpRequest();
		xmlhttp.open('GET', searchFile);
		xmlhttp.onreadystatechange = function () {
			if (xmlhttp.readyState != 4) return;
			if (xmlhttp.status != 200 && xmlhttp.status != 304) { return; }
			var parser = new DOMParser();
			var xmlDoc = parser.parseFromString(xmlhttp.responseText, 'text/xml');
			posts = getPostsFromXml(xmlDoc);
		}
		xmlhttp.send();

		// Toggle on ESC key
		window.addEventListener('keyup', function onKeyPress(e) {
			if (e.which === 27) {
				toggleSearch();
			}
		});
		// Open on '/' key
		window.addEventListener('keypress', function onKeyPress(e) {
			if (e.which === 47 && !searchEl.classList.contains('is-active')) {
				toggleSearch();
			}
		});

		searchInputEl.addEventListener('input', function onInputChange() {
			handleInput();
		});
	}

	init.toggle = toggleSearch;

	window.superSearch = init;

})();
