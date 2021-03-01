# COVID-NY-vaccine-tracker
Track when the nearest covid vaccine facility is avaliable (NY ONLY)

## Disclaimer
> ⚠️ I make no guarantees as to whether this software will work or whether it is allowed (probably not). The state website is subject to change it's structure at any moment without prior notice, so this tool can break at any moment. Use at your own risk. This project will not be maintained and will only receive critical security updates.

## About
This project was created when I needed to get my mother vaccinated, but found myself not able to find a nearby vaccine facility. Not wanting to have to check manually on the states slow and bulky website, I created this, made a private docker image, and had it running in the background on an interval for days on end until I received results.

## Usage
### Envs
These are the required environment variables:

[`src/index.ts`](https://github.com/zaida04/covid-ny-vaccine-tracker/blob/main/src/index.ts)
```js
    ["SMS_ID", "Please provide a Twilio SMS ID"], 
    ["SMS_TOKEN", "Please provide a Twilio SMS Token"], 
    ["NOTIFY_NUMBER", "Please provide a phone number to send notifications to"],
    ["MILE_THRESHOLD", "Please provide a mile threshold"],
    ["ADDRESS", "Please provide your address to compare the distance against."],
    ["FROM_NUMBER", "Please provide a Twilio phone number to send the text from."]
```

please provide in the format of `KEY=VALUE` in a `.env` file. Example: `SMS_ID=2309840890`

### Setup
- Install [`Node`](https://nodejs.org/en/) (LTS preferred.)
- Clone this repo with `git clone https://github.com/zaida04/covid-ny-vaccine-tracker`
- cd into it `cd covid-ny-vaccine-tracker`
- `npm install`
- Supply env variables from [required envs](#envs)
- `npm run build`
- `npm run start`

## Built with
- [puppeteer](https://developers.google.com/web/tools/puppeteer)
- [typescript](https://www.typescriptlang.org/)
- [twilio](https://www.npmjs.com/package/twilio)


## LICENSING
> **covid-ny-vaccine-tracker** © [zaida04](https://github.com/zaida04), Released under the [MIT](https://github.com/zaida04/covid-ny-vaccine-tracker/blob/master/LICENSE) License.  
