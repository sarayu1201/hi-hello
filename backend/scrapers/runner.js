const { Job, User, ScraperRun, ScraperConfig } = require('../models');
const adapters = require('./adapters');
const { generateJobSummaries } = require('../services/gemini');
const { notifyUsersForJob } = require('../services/fcm');

const SCRAPER_CLASSES = {
    'UPSCScraper': adapters.UPSCScraper,
    'SSCScraper': adapters.SSCScraper,
    'RRBScraper': adapters.RRBScraper,
    'IBPSScraper': adapters.IBPSScraper,
    'APPSCScraper': adapters.APPSCScraper,
    'TSPSCScraper': adapters.TSPSCScraper
};

async function runScraper(scraperName, force = false) {
    if (!SCRAPER_CLASSES[scraperName]) {
        return { status: 'ERROR', message: `Scraper '${scraperName}' not found.` };
    }

    // Check config
    let config = await ScraperConfig.findOne({ scraper_name: scraperName });
    
    if (!config) {
        config = new ScraperConfig({ scraper_name: scraperName, is_active: true, interval_minutes: 15 });
        await config.save();
    }

    if (!config.is_active && !force) {
        console.log(`Scraper ${scraperName} is disabled. Skipping scheduled run.`);
        return { status: 'SKIPPED', message: 'Scraper is disabled.' };
    }

    // Create runner log
    const runLog = new ScraperRun({
        scraper_name: scraperName,
        status: 'RUNNING',
        started_at: new Date()
    });
    await runLog.save();

    const ScraperClass = SCRAPER_CLASSES[scraperName];
    const scraperInstance = new ScraperClass();
    
    try {
        const scrapedJobs = await scraperInstance.scrape();
        let jobsAdded = 0;

        // Fetch all users with registered FCM tokens
        const users = await User.find({ fcmToken: { $ne: null } });

        for (const job of scrapedJobs) {
            // Check duplicate by guid or official_notification_url to satisfy unique index constraint
            const query = { guid: job.guid };
            if (job.official_notification_url) {
                query.$or = [
                    { guid: job.guid },
                    { official_notification_url: job.official_notification_url }
                ];
            }
            const existingJob = await Job.findOne(job.official_notification_url ? { $or: [ { guid: job.guid }, { official_notification_url: job.official_notification_url } ] } : { guid: job.guid });
            if (existingJob) {
                continue;
            }

            // Generate AI Summary
            console.log(`Generating AI summaries for job: ${job.title}`);
            const summaries = await generateJobSummaries(
                job.title,
                job.organization,
                job.state,
                job.qualification
            );

            const newJob = new Job({
                title: job.title,
                organization: job.organization,
                notification_date: job.notification_date,
                application_start_date: job.application_start_date,
                application_last_date: job.application_last_date,
                vacancies: job.vacancies,
                official_notification_url: job.official_notification_url,
                official_apply_url: job.official_apply_url,
                category: job.category,
                state: job.state,
                qualification: job.qualification,
                summary_english: summaries.summary_english,
                summary_telugu: summaries.summary_telugu,
                eligibility_summary: summaries.eligibility_summary,
                important_dates_summary: summaries.important_dates_summary,
                guid: job.guid,
                notification_sent: false
            });

            // Dispatch FCM Notifications
            const notifiedCount = await notifyUsersForJob(newJob, users);
            if (notifiedCount > 0) {
                newJob.notification_sent = true;
            }

            await newJob.save();
            jobsAdded++;
        }

        // Complete runner logs
        runLog.status = 'SUCCESS';
        runLog.jobs_found = scrapedJobs.length;
        runLog.jobs_added = jobsAdded;
        runLog.completed_at = new Date();
        await runLog.save();

        config.last_run_at = new Date();
        await config.save();

        console.log(`Scraper ${scraperName} completed successfully. Found: ${scrapedJobs.length}, Added: ${jobsAdded}`);
        return { status: 'SUCCESS', jobs_found: scrapedJobs.length, jobs_added: jobsAdded };

    } catch (e) {
        console.error(`Scraper execution failed for ${scraperName}: `, e);
        runLog.status = 'FAILED';
        runLog.error_message = e.message;
        runLog.completed_at = new Date();
        await runLog.save();
        return { status: 'FAILED', error: e.message };
    }
}

async function runAllScrapers(force = false) {
    const results = {};
    for (const name of Object.keys(SCRAPER_CLASSES)) {
        results[name] = await runScraper(name, force);
    }
    return results;
}

module.exports = {
    runScraper,
    runAllScrapers,
    SCRAPER_CLASSES
};
