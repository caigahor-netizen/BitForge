import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
export async function GET(context) {
  const notes = (await getCollection('notesZh')).sort((a,b) => b.data.pubDate.valueOf()-a.data.pubDate.valueOf());
  return rss({ title: 'BitForge 中文笔记', description: '数字电源、嵌入式系统、Linux 与网络工程笔记。', site: context.site, customData: '<language>zh-cn</language>', items: notes.map(n => ({ title: n.data.title, description: n.data.description, pubDate: n.data.pubDate, link: `/zh/notes/${n.id}/` })) });
}
