/**
 * Required ENV Vars:
 * SMS_ID - twilio account SID
 * SMS_TOKEN - twilio account token
 * 
 * NOTIFY_NUMBER - number to send notification texts to
 * MILE_THRESHOLD - threshold miles away to trigger notification
 * ADDRESS - Your address to compare distance against
 * FROM_NUMBER - Your twilio phone number
 */

import puppeteer from "puppeteer";
import Logger from "./util/Logger";
import Client from "twilio";
import { config } from "dotenv";
import { writeFile, access } from "fs";
import { promisify } from "util";

// debugging purposes
// import { join } from "path";
// const [writeFileP, accessP] = [promisify(writeFile), promisify(access)];

config();
// sharable object containing configs and logger
const context = {
    config: {
        SMS_ID: process.env.SMS_ID,
        SMS_TOKEN: process.env.SMS_TOKEN,
        NOTIFY_NUMBER: process.env.NOTIFY_NUMBER,
        MILE_THRESHOLD: process.env.MILE_THRESHOLD,
        ADDRESS: process.env.ADDRESS,
        FROM_NUMBER: process.env.FROM_NUMBER
    },
    logger: new Logger()
}

const requiredFields = [
    ["SMS_ID", "Please provide a Twilio SMS ID"], 
    ["SMS_TOKEN", "Please provide a Twilio SMS Token"], 
    ["NOTIFY_NUMBER", "Please provide a phone number to send notifications to"],
    ["MILE_THRESHOLD", "Please provide a mile threshold"],
    ["ADDRESS", "Please provide your address to compare the distance against."],
    ["FROM_NUMBER", "Please provide a Twilio phone number to send the text from."]
];

const main = async () => {
    context.logger.log("Welcome to Covid Vaccination Tracking NY.");
    context.logger.warn("Checking for ENV variables...");

    /**
     * Check all the ENV Variables and make sure they exist.
     */
    let failed = false;
    for(const field of requiredFields) {
        if(process.env[field[0]]) continue;
        failed = true;
        context.logger.error(`Missing value in ENV var ${field[0]}. ${field[1]}`);
    }

    /**
     * If any of the ENV vars are missing, then stop the program. The reason this isn't done in the loop is so 
     * that we can list out all the vars that are missing first then terminate the process
     */
    if(failed) {
        const error_message = "Exiting due to missing ENV variables. Please supply the required values in a .env file in the root...";
        context.logger.error(error_message);
        throw new Error(error_message)
    }

    context.logger.log("All ENV vars detected...");
    context.logger.log("Logging in SMS Client...");

    /**
     * Construct the Twilio SMS Client
     */
    let sms;
    try {
        sms = Client(context.config.SMS_ID, context.config.SMS_TOKEN);
    } catch(e) {
        const error_message = `Error starting up SMS Client. ${e}`
        context.logger.error(error_message);
        throw new Error(error_message);
    }

    // launch puppeteer browser
    context.logger.log("Starting up puppet browser...");
    const browser = await puppeteer.launch();

    // create new puppeteer page
    context.logger.log("Opening new page...");
    const newPage = await browser.newPage();

    // navigate to the NYC vaccine facility finder website. Wait until there are no network reqs for 500 ms.
    context.logger.log("Going to NYC Vaccine Facility Website...");
    await newPage.goto("https://vaccinefinder.nyc.gov/locations", { waitUntil: 'networkidle2' });

    // type in our user's address
    context.logger.log("Filling out form...");
    await newPage.type("[aria-label=\"Search\"]", context.config.ADDRESS!.replace(/_/g, " "));

    // grab the form and submit it 
    context.logger.log("Submiting form...");
    await Promise.all([
        newPage.click("button[aria-label=\"Search\"]"),
        newPage.waitForNavigation({ waitUntil: "networkidle2"})
    ])

    const aside = await newPage.$("aside.JhijG");

    const entries: any[] = []; 
    await aside?.$$eval("span.irPtrP", el2 => {
        for(const element of el2) {
            entries.push(element.innerHTML);
        }
    });

    if(entries.some((x: string) => {
        const milesIndex = x.indexOf("miles");
        if(milesIndex === -1) return false;
        const slicedMiles = x.slice(milesIndex + 5); 
        let parsedMiles = "";
        for(let i = 0; i < slicedMiles.length; i++) {
            if(Number.isNaN(slicedMiles[i])) break;
            parsedMiles += slicedMiles[i];
        }
        if(parseInt(parsedMiles) < Number(context.config.MILE_THRESHOLD)) return true;
    })) {
        context.logger.log("FOUND NEARBY FACILITIES... SENDING SMS...");

        return (sms as Client.Twilio).messages.create(
            { 
                "body": "There is a nearby vaccine facility, please go onto the website and sign up manually! Also verify that it is not a second dose only station.", 
                "from": context.config.FROM_NUMBER!,
                "to": context.config.NOTIFY_NUMBER!
            })
    } else {
        context.logger.error("NO NEARBY FACILITIES FOUND...");
    }
    
    // making sure to close the browser
    context.logger.log("Closing browser");
    await newPage.close();

    context.logger.warn("Thanks for using this tool, ending process...");
    return void 0;
};

main();
