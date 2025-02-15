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
const cheerio_1 = require("cheerio");
const axios_1 = __importDefault(require("axios"));
const models_1 = require("../../models");
const { get } = axios_1.default;
class Ummangurau extends models_1.MovieParser {
    constructor() {
        super(...arguments);
        this.name = 'Ummangurau';
        this.baseUrl = 'https://www1.ummagurau.com';
        this.logo = 'https://www1.ummagurau.com/images/group_1/theme_8/logo.png?v=0.1';
        this.classPath = `MOVIES.${this.name}`;
        this.supportedTypes = new Set([models_1.TvType.MOVIE, models_1.TvType.TVSERIES]);
        this.search = (query, page = 1) => __awaiter(this, void 0, void 0, function* () {
            const searchResult = {
                currentPage: page,
                hasNextPage: false,
                results: [],
            };
            try {
                const { data } = yield get(`${this.baseUrl}/search/${query.replace(/[\W_]+/g, '-')}?page=${page}`);
                const $ = (0, cheerio_1.load)(data);
                searchResult.hasNextPage =
                    $("nav[area-label='Page navigation']").html() === null
                        ? false
                        : page <
                            Number($("nav ul li a[title='Last']").attr('href')[$("nav ul li a[title='Last']").attr('href').length - 1]);
                $('div.flw-item').each((i, e) => {
                    var _a, _b;
                    searchResult.results.push({
                        id: `${(_b = (_a = $(e).find('a.film-poster-ahref')) === null || _a === void 0 ? void 0 : _a.attr('href')) === null || _b === void 0 ? void 0 : _b.slice(1)}`,
                        title: `${$(e).find('h2.film-name a').attr('href')}`,
                        url: `${this.baseUrl}${$(e).find('.film-poster a').attr('href')}`,
                        image: `${$(e).find('.film-poster img').attr('data-src')}`,
                        type: $(e).find('span.fdi-type').text() === 'Movie' ? models_1.TvType.MOVIE : models_1.TvType.TVSERIES,
                    });
                });
                return searchResult;
            }
            catch (e) {
                throw new Error(e.message);
            }
        });
        this.fetchMediaInfo = (mediaId) => __awaiter(this, void 0, void 0, function* () {
            if (!mediaId.startsWith(this.baseUrl)) {
                mediaId = `${this.baseUrl}/${mediaId}`;
            }
            const movieInfo = {
                id: mediaId.split('com/')[-1],
                title: '',
                url: mediaId,
            };
            try {
                const { data } = yield get(mediaId);
                const $ = (0, cheerio_1.load)(data);
                movieInfo.title = `${$('.heading-name a').text()}`;
                movieInfo.image = `${$('img.film-poster-img').attr('src')}`;
                movieInfo.description = `${$('.description').text()}`;
                movieInfo.type = $("a[title='TV Shows']").text() === '' ? models_1.TvType.TVSERIES : models_1.TvType.MOVIE;
                movieInfo.releaseDate = $('div.row-line').text().replace('Released: ', '').trim();
                movieInfo.genres = $('div.row-line:eq(1) a')
                    .text()
                    .trim()
                    .split(', ')
                    .map(v => v.trim());
            }
            catch (err) {
                throw new Error(err.message);
            }
        });
    }
    fetchEpisodeServers(mediaLink, ...args) {
        throw new Error('Method not implemented.');
    }
    fetchEpisodeSources(mediaId, ...args) {
        throw new Error('Method not implemented.');
    }
}
//# sourceMappingURL=ummagurau.js.map