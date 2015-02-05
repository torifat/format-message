import MessageFormat from 'message-format'

let
	formats = MessageFormat.data.formats,
	localeData = MessageFormat.data.locales,
	cache = formats.cache,
	options = {
		enableCache: true,
		locale: 'en',
		translate(pattern) {
			return pattern
		}
	}


function cached(key, fn) {
	if (options.enableCache && key in cache) {
		return cache[key]
	} else {
		let value = fn()
		if (options.enableCache) {
			cache[key] = value
		}
		return value
	}
}


function format(pattern, args, locale) {
	locale = locale || options.locale
	let
		key = locale + ':format:' + pattern,
		func = cached(key, function() {
			let localPattern = options.translate(pattern, locale)
			return new MessageFormat(localPattern, locale, { cache:options.enableCache }).format
		})
	return func(args)
}


format.setup = function({ cache, locale, translate }={}) {
	options.enableCache = 'boolean' === typeof cache ? cache : options.enableCache
	options.locale = locale || options.locale
	options.translate = translate || options.translate
}


format.number = function(locale, num, style='medium') {
	let
		key = locale + ':number:' + style,
		func = cached(key, function() {
			return new Intl.NumberFormat(locale, formats.number[style]).format
		})
	return func(num)
}


format.date = function(locale, date, style='medium') {
	let
		key = locale + ':date:' + style,
		func = cached(key, function() {
			return new Intl.DateTimeFormat(locale, formats.date[style]).format
		})
	return func(date)
}


format.time = function(locale, date, style='medium') {
	let
		key = locale + ':time:' + style,
		func = cached(key, function() {
			return new Intl.DateTimeFormat(locale, formats.time[style]).format
		})
	return func(date)
}


format.plural = function(locale, num, offset, options) {
	let
		plural = localeData[locale].plural,
		exactSelector = '=' + num,
		keywordSelector = plural(num - offset),
		func =
			options[exactSelector] ||
			options[keywordSelector] ||
			options.other
	return ('string' === typeof func) ? func : func()
}


format.select = function(locale, selector, options) {
	let func = options[selector] || options.other
	return ('string' === typeof func) ? func : func()
}


export default format

