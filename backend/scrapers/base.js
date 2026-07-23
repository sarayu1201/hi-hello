const crypto = require('crypto');

class BaseScraper {
    constructor(db) {
        this.db = db;
        this.name = 'BaseScraper';
        this.orgName = 'BASE';
        this.state = 'Central';
        this.baseUrl = '';
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive'
        };
    }

    getGuid(title) {
        const combined = `${this.orgName.toUpperCase()}_${title.trim().toLowerCase()}`;
        return crypto.createHash('md5').update(combined).digest('hex');
    }

    async scrape() {
        throw new Error('Scrape method must be implemented by subclass.');
    }

    generateMockJob() {
        const jobTitles = [
            ["Technical Assistant Recruitment 2026", "B.Tech", 450, "Technical"],
            ["Group D Staff Officers Notice", "10th Pass", 3450, "General"],
            ["Assistant Section Officer Exam", "Degree", 120, "Administrative"],
            ["Junior Engineer Selection (Civil/Mech)", "Diploma", 890, "Technical"],
            ["Civil Services Preliminary Exam 2026", "Degree", 1056, "Administrative"],
            ["Probationary Officers (PO) Direct Drive", "Degree", 2000, "Banking"],
            ["Multi Tasking Staff (MTS) Vacancies", "10th Pass", 1450, "General"],
            ["Sub-Inspector (SI) General Duty Exam", "Degree", 380, "Police"],
            ["Assistant Professor & Lecturer Jobs", "Post Graduation", 180, "Teaching"]
        ];

        const selected = jobTitles[Math.floor(Math.random() * jobTitles.length)];
        const year = new Date().getFullYear();
        const title = `${this.orgName} ${selected[0]} - ${year}`;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 5));
        
        const lastDate = new Date(startDate);
        lastDate.setDate(lastDate.getDate() + 20 + Math.floor(Math.random() * 20));

        const urlStub = title.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
        const notifUrl = `${this.baseUrl}/notifications/${urlStub}`;
        const applyUrl = `${this.baseUrl}/apply/${urlStub}`;

        const formatDate = (d) => d.toISOString().split('T')[0];

        return {
            title: title,
            organization: this.orgName,
            notification_date: formatDate(startDate),
            application_start_date: formatDate(startDate),
            application_last_date: formatDate(lastDate),
            vacancies: selected[2],
            official_notification_url: notifUrl,
            official_apply_url: applyUrl,
            category: selected[3],
            state: this.state,
            qualification: selected[1],
            guid: this.getGuid(title)
        };
    }
}

module.exports = BaseScraper;
