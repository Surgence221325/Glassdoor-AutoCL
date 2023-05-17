const fs = require('fs');
const { Configuration, OpenAIApi} = require("openai");

const config = new Configuration({
    apiKey: YOUR_KEY
});

const openai = new OpenAIApi(config);

const runPrompt = async (title, company) => {
    const prompt = "My name is Muhammad Tahir, the key points of my resume are listed as follows" + "I am currently 22 years old, after completing my first degree in Pharmacology at the University of Alberta I decided to switch degrees to follow my passion of computer Science at the UBC."
    + "currently I have maintained an excellent average in both programs. During this past first year at UBC I created a journaling app for mental health using Java, an online web-app in which you can play multiple games (using js, phaser), a student socializing network (using js). The last project won a hackathon prize. I have also done a lot of volunteering"
    + "focused on directoring science competitions for highschoolers, acting as a supportive listener, being a research assistant." + "Using this information please write a cover letter for the company" + company + "with title" + title;

    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 2048,
        temperature: 0,
    })
    return response.data.choices[0].text;
}

const writeToResults = async (coverLetter) => {
    await fs.promises.appendFile('results.csv', coverLetter, function (err) {
             if (err) throw err;
             console.log('Saved!')
         });
}

const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: false,
        executablePath: '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome',
        userDataDir: "./tmp"
    });

    

    const page = await browser.newPage();

    await page.goto('https://www.glassdoor.com/Job/vancouver-software-engineer-jobs-SRCH_IL.0,9_IC2278756_KO10,27.htm?includeNoSalaryJobs=true');


    const jobListings = await page.$$('#MainCol > div:nth-child(1) > ul > li');


    for (const jobListing of jobListings) {
        try {
            const title = await page.evaluate(el => el.querySelector('div.d-flex.flex-column.pl-sm.css-3g3psg.css-1of6cnp.e1rrn5ka4 > a > span').textContent, jobListing)
            const company = await page.evaluate(el => el.querySelector('div.d-flex.flex-column.pl-sm.css-3g3psg.css-1of6cnp.e1rrn5ka4 > div.d-flex.justify-content-between.align-items-start > a > span').textContent, jobListing)
            const info = await page.evaluate(el => el.querySelector('a.jobLink').href, jobListing)
            console.log(title);
            console.log(company);
            console.log(info);

            
            (async () => {
                const coverLetter = await runPrompt(title, company);
                console.log(coverLetter);
                const data = coverLetter
                writeToResults(coverLetter);
            })();
        //get the generated cover letter from the API response
        

        

        
    
        // fs.appendFile('results.csv', {title}, {company}, {info}, {coverLetter} +'\n', function (err) {
        //     if (err) throw err;
        //     console.log('Saved!')
        // });

        } catch(error) {
            //
        }
    }

})()

