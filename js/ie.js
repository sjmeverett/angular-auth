
/* I.E. detection: http://james.padolsey.com/javascript/detect-ie-in-js-using-conditional-comments/
I can't believe we're still doing this in 2013. */
window.IEVersion = (function(){

	var undef,
		v = 3,
		div = document.createElement('div'),
		all = div.getElementsByTagName('i');

	while (
		div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
		all[0]
	);

	return v > 4 ? v : undef;

}());


if (window.IEVersion < 9)
{
	/* create html 5 elements so that they can be styled */
	for (element in ['article', 'aside', 'bdi', 'command', 'details',
		'summary', 'figure', 'figcaption', 'footer', 'header', 'hgroup', 
		'main', 'mark', 'meter', 'nav', 'progress', 'ruby', 'rt', 'rp',
		'section', 'time', 'wbr'])
	{
		document.createElement(element);
	}
}