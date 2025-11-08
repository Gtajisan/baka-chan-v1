const axios = require('axios');
const onStart = async ({ event, args, message }) => {
		let type = 'audio',
		query = args.join(" ").trim(),
		quality = "240";
	if (!query) {
		return message.reply("❌ | Search query is required");
	} 
	if (query.startsWith('https://')) {
	try {
		message.reaction("⏳", event.messageID);
		query = query.split(" ").find(x => x.startsWith('https://'));
		const stream = await download(query, type, quality);
		return message.reply({
			body: `${stream.title}`,
			attachment: await Stream(stream.downloadUrl, type)
		});
	} catch (e) { return message.reply("❌ | " + e.message);
		}
	}
		message.reaction("⏳", event.messageID);
		try {
		const results = await search(query);
	if (results.length == 0) { return message.reply("❌ | no videos found");
	}
		const {
			id,
			title
		} = results[0]
		const response = await download(id, type, quality);
		message.reply({
			body: `• ${title}`,
			attachment: await Stream(response.downloadUrl, type)
		});
	} catch (e) {
		message.reply("❌ | " + e.message);
	}
};
async function download(id, type, quality = 480) {
	const url = id.startsWith('https://') ? id : `https://youtube.com/watch?v=${id}`;
	const res = await axios.get(`https://tawsif.is-a.dev/downloader/youtube?url=${encodeURIComponent(url)}&type=${type == "audio" ? "audio" : "video"}&quality=${quality}`);
	if (!res?.data?.success) {
		throw "An error occurred"
	}
	return {
		downloadUrl: res.data.downloadUrl,
		title: res.data.title
	}
};
async function search(keyWord) {
	try {
		const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(keyWord)}`;
		const res = await axios.get(url);
		const getJson = JSON.parse(res.data.split("ytInitialData = ")[1].split(";</script>")[0]);
		const videos = getJson.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
		const results = [];
		for (const video of videos)
			if (video.videoRenderer?.lengthText?.simpleText) // check is video, not playlist or channel or live
				results.push({
					id: video.videoRenderer.videoId,
					title: video.videoRenderer.title.runs[0].text,
					thumbnail: video.videoRenderer.thumbnail.thumbnails.pop().url,
					time: video.videoRenderer.lengthText.simpleText,
					author: video.videoRenderer.ownerText.runs[0].text,
				});
		return results;
	} catch (e) {
		const error = new Error("Cannot search video");
		error.code = "SEARCH_VIDEO_ERROR";
		throw error;
	}
};
async function Stream(url, type) {
	return await global.utils.getStreamFromURL(url, `stream.${type == 'audio' ? 'mp3' : 'mp4'}`)
};
const config = {
	name: "sing",
	author: "Tawsif~",
	role: 0,
	category: "media",
	countDown: 5,
	shortDescription: {
		en: "download youtube audio"
	},
	guide: {
		en: "sing [search query]"
	}
};
module.exports = {
	config,
	onStart
};
