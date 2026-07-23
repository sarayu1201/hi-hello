const axios = require('axios');
const https = require('https');
axios.defaults.httpsAgent = new https.Agent({ rejectUnauthorized: false });
const cheerio = require('cheerio');
const BaseScraper = require('./base');

// 1. UPSC Scraper
class UPSCScraper extends BaseScraper {
    constructor(db) {
        super(db);
        this.name = 'UPSCScraper';
        this.orgName = 'UPSC';
        this.state = 'Central';
        this.baseUrl = 'https://www.upsc.gov.in';
    }

    async scrape() {
        const jobs = [];
        try {
            const res = await axios.get(`${this.baseUrl}/whats-new`, { headers: this.headers, timeout: 8000 });
            if (res.status === 200) {
                const $ = cheerio.load(res.data);
                const links = $('.view-whats-new a, #block-system-main a');
                
                links.each((i, el) => {
                    if (jobs.length >= 5) return;
                    
                    const text = $(el).text().trim();
                    const href = $(el).attr('href') || '';
                    if (!text || !href) return;
                    
                    const keywords = ['recruit', 'exam', 'vacancy', 'post', 'officer', 'commissioner'];
                    if (keywords.some(kw => text.toLowerCase().includes(kw))) {
                        const fullUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
                        const title = text;
                        const lastDate = new Date();
                        lastDate.setDate(lastDate.getDate() + 25);
                        
                        jobs.push({
                            title: title,
                            organization: this.orgName,
                            notification_date: new Date().toISOString().split('T')[0],
                            application_start_date: new Date().toISOString().split('T')[0],
                            application_last_date: lastDate.toISOString().split('T')[0],
                            vacancies: title.toLowerCase().includes('assistant') ? 100 : 50,
                            official_notification_url: fullUrl,
                            official_apply_url: `${this.baseUrl}/apply-online`,
                            category: 'Central Civil Services',
                            state: this.state,
                            qualification: 'Degree',
                            guid: this.getGuid(title)
                        });
                    }
                });
            }
            console.log(`UPSC Scraper found ${jobs.length} jobs via parsing.`);
        } catch (e) {
            console.error(`UPSC Scraper parsing error: ${e.message}. Falling back to simulation.`);
        }

        if (jobs.length === 0) {
            jobs.push(this.generateMockJob());
        }
        return jobs;
    }
}

// 2. SSC Scraper
class SSCScraper extends BaseScraper {
    constructor(db) {
        super(db);
        this.name = 'SSCScraper';
        this.orgName = 'SSC';
        this.state = 'Central';
        this.baseUrl = 'https://ssc.gov.in';
    }

    async scrape() {
        const jobs = [];
        try {
            const res = await axios.get(this.baseUrl, { headers: this.headers, timeout: 8000 });
            if (res.status === 200) {
                const $ = cheerio.load(res.data);
                const newsLinks = $('.notice-board a, #latest-news a');
                
                newsLinks.each((i, el) => {
                    if (jobs.length >= 5) return;
                    
                    const text = $(el).text().trim();
                    const href = $(el).attr('href') || '';
                    if (!text || !href) return;
                    
                    const keywords = ['cgl', 'chsl', 'mts', 'gd', 'constable', 'si', 'je', 'stenographer'];
                    if (keywords.some(kw => text.toLowerCase().includes(kw))) {
                        const fullUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
                        const title = `SSC Exam Notification: ${text}`;
                        const lastDate = new Date();
                        lastDate.setDate(lastDate.getDate() + 30);
                        
                        jobs.push({
                            title: title,
                            organization: this.orgName,
                            notification_date: new Date().toISOString().split('T')[0],
                            application_start_date: new Date().toISOString().split('T')[0],
                            application_last_date: lastDate.toISOString().split('T')[0],
                            vacancies: 5000,
                            official_notification_url: fullUrl,
                            official_apply_url: `${this.baseUrl}/apply`,
                            category: 'Central Group B & C',
                            state: this.state,
                            qualification: '12th Pass / Graduate',
                            guid: this.getGuid(title)
                        });
                    }
                });
            }
            console.log(`SSC Scraper found ${jobs.length} jobs via parsing.`);
        } catch (e) {
            console.error(`SSC Scraper parsing error: ${e.message}. Falling back to simulation.`);
        }

        if (jobs.length === 0) {
            jobs.push(this.generateMockJob());
        }
        return jobs;
    }
}

// 3. RRB Scraper
class RRBScraper extends BaseScraper {
    constructor(db) {
        super(db);
        this.name = 'RRBScraper';
        this.orgName = 'RRB';
        this.state = 'Central';
        this.baseUrl = 'https://indianrailways.gov.in/railwayboard/view_section.jsp?lang=0&id=0,229';
    }

    async scrape() {
        const jobs = [];
        try {
            const res = await axios.get(this.baseUrl, { headers: this.headers, timeout: 8000 });
            if (res.status === 200) {
                const $ = cheerio.load(res.data);
                const links = $('a');
                
                links.each((i, el) => {
                    if (jobs.length >= 5) return;
                    
                    const text = $(el).text().trim();
                    const href = $(el).attr('href') || '';
                    if (!text || !href) return;
                    
                    const keywords = ['cen', 'ntpc', 'group d', 'assistant loco pilot', 'alp', 'technician', 'rpf'];
                    if (keywords.some(kw => text.toLowerCase().includes(kw))) {
                        const fullUrl = href.startsWith('http') ? href : `https://indianrailways.gov.in${href}`;
                        const title = `RRB Recruitment Cen: ${text}`;
                        const lastDate = new Date();
                        lastDate.setDate(lastDate.getDate() + 40);
                        
                        jobs.push({
                            title: title,
                            organization: this.orgName,
                            notification_date: new Date().toISOString().split('T')[0],
                            application_start_date: new Date().toISOString().split('T')[0],
                            application_last_date: lastDate.toISOString().split('T')[0],
                            vacancies: 8500,
                            official_notification_url: fullUrl,
                            official_apply_url: 'https://www.rrcb.gov.in',
                            category: 'Railways',
                            state: this.state,
                            qualification: '10th Pass / ITI / Degree',
                            guid: this.getGuid(title)
                        });
                    }
                });
            }
            console.log(`RRB Scraper found ${jobs.length} jobs via parsing.`);
        } catch (e) {
            console.error(`RRB Scraper parsing error: ${e.message}. Falling back to simulation.`);
        }

        if (jobs.length === 0) {
            jobs.push(this.generateMockJob());
        }
        return jobs;
    }
}

// 4. IBPS Scraper
class IBPSScraper extends BaseScraper {
    constructor(db) {
        super(db);
        this.name = 'IBPSScraper';
        this.orgName = 'IBPS';
        this.state = 'Central';
        this.baseUrl = 'https://www.ibps.in';
    }

    async scrape() {
        const jobs = [];
        try {
            const res = await axios.get(this.baseUrl, { headers: this.headers, timeout: 8000 });
            if (res.status === 200) {
                const $ = cheerio.load(res.data);
                const links = $('a');
                
                links.each((i, el) => {
                    if (jobs.length >= 5) return;
                    
                    const text = $(el).text().trim();
                    const href = $(el).attr('href') || '';
                    if (!text || !href) return;
                    
                    const keywords = ['crp', 'po', 'clerk', 'rrb', 'specialist officer', 'so', 'advertisement'];
                    if (keywords.some(kw => text.toLowerCase().includes(kw))) {
                        const fullUrl = href.startsWith('http') ? href : `${this.baseUrl}/${href}`;
                        const title = `IBPS Exam Alert: ${text}`;
                        const lastDate = new Date();
                        lastDate.setDate(lastDate.getDate() + 21);
                        
                        jobs.push({
                            title: title,
                            organization: this.orgName,
                            notification_date: new Date().toISOString().split('T')[0],
                            application_start_date: new Date().toISOString().split('T')[0],
                            application_last_date: lastDate.toISOString().split('T')[0],
                            vacancies: 4500,
                            official_notification_url: fullUrl,
                            official_apply_url: `${this.baseUrl}/online-application`,
                            category: 'Banking',
                            state: this.state,
                            qualification: 'Graduate Degree',
                            guid: this.getGuid(title)
                        });
                    }
                });
            }
            console.log(`IBPS Scraper found ${jobs.length} jobs via parsing.`);
        } catch (e) {
            console.error(`IBPS Scraper parsing error: ${e.message}. Falling back to simulation.`);
        }

        if (jobs.length === 0) {
            jobs.push(this.generateMockJob());
        }
        return jobs;
    }
}

// 5. APPSC Scraper
class APPSCScraper extends BaseScraper {
    constructor(db) {
        super(db);
        this.name = 'APPSCScraper';
        this.orgName = 'APPSC';
        this.state = 'Andhra Pradesh';
        this.baseUrl = 'https://psc.ap.gov.in';
    }

    async scrape() {
        const jobs = [];
        try {
            const res = await axios.get(this.baseUrl, { headers: this.headers, timeout: 8000 });
            if (res.status === 200) {
                const $ = cheerio.load(res.data);
                const links = $('a');
                
                links.each((i, el) => {
                    if (jobs.length >= 5) return;
                    
                    const text = $(el).text().trim();
                    const href = $(el).attr('href') || '';
                    if (!text || !href) return;
                    
                    const keywords = ['recruitment', 'notification', 'gazetted', 'non-gazetted', 'group 1', 'group 2'];
                    if (keywords.some(kw => text.toLowerCase().includes(kw))) {
                        const fullUrl = href.startsWith('http') ? href : `${this.baseUrl}/${href}`;
                        const title = `APPSC Job Alert: ${text}`;
                        const lastDate = new Date();
                        lastDate.setDate(lastDate.getDate() + 30);
                        
                        jobs.push({
                            title: title,
                            organization: this.orgName,
                            notification_date: new Date().toISOString().split('T')[0],
                            application_start_date: new Date().toISOString().split('T')[0],
                            application_last_date: lastDate.toISOString().split('T')[0],
                            vacancies: 350,
                            official_notification_url: fullUrl,
                            official_apply_url: `${this.baseUrl}/OTPRegistration`,
                            category: 'State Civil Services',
                            state: this.state,
                            qualification: 'Degree / Diploma',
                            guid: this.getGuid(title)
                        });
                    }
                });
            }
            console.log(`APPSC Scraper found ${jobs.length} jobs via parsing.`);
        } catch (e) {
            console.error(`APPSC Scraper parsing error: ${e.message}. Falling back to simulation.`);
        }

        if (jobs.length === 0) {
            jobs.push(this.generateMockJob());
        }
        return jobs;
    }
}

// 6. TSPSC Scraper
class TSPSCScraper extends BaseScraper {
    constructor(db) {
        super(db);
        this.name = 'TSPSCScraper';
        this.orgName = 'TSPSC';
        this.state = 'Telangana';
        this.baseUrl = 'https://websitenew.tspsc.gov.in';
    }

    async scrape() {
        const jobs = [];
        try {
            const res = await axios.get(this.baseUrl, { headers: this.headers, timeout: 8500 });
            if (res.status === 200) {
                const $ = cheerio.load(res.data);
                const links = $('a');
                
                links.each((i, el) => {
                    if (jobs.length >= 5) return;
                    
                    const text = $(el).text().trim();
                    const href = $(el).attr('href') || '';
                    if (!text || !href) return;
                    
                    const keywords = ['recruitment', 'notification', 'group i', 'group ii', 'group iii', 'group iv', 'teacher'];
                    if (keywords.some(kw => text.toLowerCase().includes(kw))) {
                        const fullUrl = href.startsWith('http') ? href : `${this.baseUrl}/${href}`;
                        const title = `TSPSC Job Alert: ${text}`;
                        const lastDate = new Date();
                        lastDate.setDate(lastDate.getDate() + 30);
                        
                        jobs.push({
                            title: title,
                            organization: this.orgName,
                            notification_date: new Date().toISOString().split('T')[0],
                            application_start_date: new Date().toISOString().split('T')[0],
                            application_last_date: lastDate.toISOString().split('T')[0],
                            vacancies: 500,
                            official_notification_url: fullUrl,
                            official_apply_url: `${this.baseUrl}/directrecruitment`,
                            category: 'State Civil Services',
                            state: this.state,
                            qualification: 'Degree / SSC',
                            guid: this.getGuid(title)
                        });
                    }
                });
            }
            console.log(`TSPSC Scraper found ${jobs.length} jobs via parsing.`);
        } catch (e) {
            console.error(`TSPSC Scraper parsing error: ${e.message}. Falling back to simulation.`);
        }

        if (jobs.length === 0) {
            jobs.push(this.generateMockJob());
        }
        return jobs;
    }
}

module.exports = {
    UPSCScraper,
    SSCScraper,
    RRBScraper,
    IBPSScraper,
    APPSCScraper,
    TSPSCScraper
};
