import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

export async function GET(context) {
	const notes = (await getCollection('notes')).sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: notes.map((note) => ({
			title: note.data.title,
			description: note.data.description,
			pubDate: note.data.pubDate,
			link: `/notes/${note.id}/`,
		})),
	});
}
