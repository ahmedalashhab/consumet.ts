"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = require("cheerio");
const models_1 = require("../../models");
const utils_1 = require("../../utils");
class AnimeFox extends models_1.AnimeParser {
    constructor() {
        super(...arguments);
        this.name = 'AnimeFox';
        this.baseUrl = 'https://animefox.tv';
        this.logo = 'https://animefox.tv/assets/images/logo.png';
        this.classPath = 'ANIME.AnimeFox';
        /**
         * @param query Search query
         * @param page Page number (optional)
         */
        this.search = (query, page = 1) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { data } = yield axios_1.default.get(`${this.baseUrl}/search?keyword=${decodeURIComponent(query)}&page=${page}`);
                const $ = (0, cheerio_1.load)(data);
                const hasNextPage = $('.pagination > nav > ul > li').last().hasClass('disabled') ? false : true;
                const searchResults = [];
                $('div.film_list-wrap > div').each((i, el) => {
                    var _a;
                    searchResults.push({
                        id: (_a = $(el).find('div.film-poster > a').attr('href')) === null || _a === void 0 ? void 0 : _a.replace('/anime/', ''),
                        title: $(el).find('div.film-poster > img').attr('alt'),
                        type: $(el).find('div.fd-infor > span').text(),
                        image: $(el).find('div.fd-infor > span:nth-child(1)').text(),
                        url: `${this.baseUrl}${$(el).find('div.film-poster > a').attr('href')}`,
                        episode: parseInt($(el).find('div.tick-eps').text().replace('EP', '').trim()),
                    });
                });
                return {
                    currentPage: page,
                    hasNextPage: hasNextPage,
                    results: searchResults,
                };
            }
            catch (err) {
                throw new Error(err);
            }
        });
        /**
         * @param id Anime id
         */
        this.fetchAnimeInfo = (id) => __awaiter(this, void 0, void 0, function* () {
            const info = {
                id: id,
                title: '',
            };
            try {
                const { data } = yield axios_1.default.get(`${this.baseUrl}/anime/${id}`);
                const $ = (0, cheerio_1.load)(data);
                info.title = $('h2.film-name').attr('data-jname');
                info.image = $('img.film-poster-img').attr('data-src');
                info.description = $('div.anisc-info > div:nth-child(1) > div').text().trim();
                info.type = $('div.anisc-info > div:nth-child(8) > a').text().trim();
                info.releaseYear = $('div.anisc-info > div:nth-child(7) > a').text().trim();
                switch ($('div.anisc-info > div:nth-child(9) > a').text().trim()) {
                    case 'Ongoing':
                        info.status = models_1.MediaStatus.ONGOING;
                        break;
                    case 'Completed':
                        info.status = models_1.MediaStatus.COMPLETED;
                        break;
                    case 'Upcoming':
                        info.status = models_1.MediaStatus.NOT_YET_AIRED;
                        break;
                    default:
                        info.status = models_1.MediaStatus.UNKNOWN;
                        break;
                }
                info.totalEpisodes = parseInt($('div.anisc-info > div:nth-child(4) > span:nth-child(2)').text().trim());
                info.url = `${this.baseUrl}/${id}`;
                info.episodes = [];
                const episodes = Array.from({ length: info.totalEpisodes }, (_, i) => i + 1);
                episodes.forEach((element, i) => {
                    var _a;
                    return (_a = info.episodes) === null || _a === void 0 ? void 0 : _a.push({
                        id: `${id}-episode-${i + 1}`,
                        number: i + 1,
                        title: `${info.title} Episode ${i + 1}`,
                        url: `${this.baseUrl}/watch/${id}-episode-${i + 1}`,
                    });
                });
                return info;
            }
            catch (err) {
                throw new Error(err);
            }
        });
        /**
         * @param page Page number
         */
        this.fetchRecentEpisodes = (page = 1) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { data } = yield axios_1.default.get(`${this.baseUrl}/latest-added?page=${page}`);
                const $ = (0, cheerio_1.load)(data);
                const hasNextPage = $('.pagination > nav > ul > li').last().hasClass('disabled') ? false : true;
                const recentEpisodes = [];
                $('div.film_list-wrap > div').each((i, el) => {
                    var _a;
                    recentEpisodes.push({
                        id: (_a = $(el).find('div.film-poster > a').attr('href')) === null || _a === void 0 ? void 0 : _a.replace('/watch/', ''),
                        image: $(el).find('div.film-poster > img').attr('data-src'),
                        title: $(el).find('div.film-poster > img').attr('alt'),
                        url: `${this.baseUrl}${$(el).find('div.film-poster > a').attr('href')}!`,
                        episode: parseInt($(el).find('div.tick-eps').text().replace('EP ', '').split('/')[0]),
                    });
                });
                return {
                    currentPage: page,
                    hasNextPage: hasNextPage,
                    results: recentEpisodes,
                };
            }
            catch (err) {
                throw new Error('Something went wrong. Please try again later.');
            }
        });
        /**
         *
         * @param episodeId episode id
         */
        this.fetchEpisodeSources = (episodeId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { data } = yield axios_1.default.get(`${this.baseUrl}/watch/${episodeId}`);
                const $ = (0, cheerio_1.load)(data);
                const iframe = $('#iframe-to-load').attr('src') || '';
                const streamUrl = `https://goload.io/streaming.php?id=${iframe.split('=').pop()}`;
                return {
                    sources: yield new utils_1.GogoCDN().extract(new URL(streamUrl)),
                };
            }
            catch (err) {
                throw new Error('Something went wrong. Please try again later.');
            }
        });
        /**
         * @deprecated Use fetchEpisodeSources instead
         */
        this.fetchEpisodeServers = (episodeIs) => {
            throw new Error('Method not implemented.');
        };
    }
}
exports.default = AnimeFox;
//# sourceMappingURL=animefox.js.map