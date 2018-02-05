#!/usr/bin/env node

const rp = require("request-promise");
const jar = rp.jar();
const client = rp.defaults({ jar, followAllRedirects: true });
const moment = require("moment");
const chalk = require("chalk");
const program = require("commander");
const { writeFile, readFile } = require("fs-extra");
const untildify = require("untildify");
const assert = require("assert");

program
  .command("fetch")
  .option("-u, --username <username>", "Username")
  .option("-p, --password <password>", "Password")
  .option("-d, --days <days>", "Days", Number)
  .option("-f, --file <file>", "Streak File", "~/.gymstreak")
  .action(options => {
    const { username, password, days, file } = options;

    assert.notEqual(username, null);
    assert.notEqual(password, null);

    const planetFitnessClubNumber = 7000;
    const lowDate = moment().add(-days, "days");
    const highDate = moment();

    const signin = Promise.resolve()
      .then(() => {
        return client(
          "https://www.myiclubonline.com/iclub/members/signin.htm",
          {
            qs: { clubNumber: planetFitnessClubNumber }
          }
        );
      })
      .then(resp => {
        return client(
          "https://www.myiclubonline.com/iclub/j_spring_security_check",
          {
            method: "POST",
            form: {
              "spring-security-redirect": "",
              j_username: username,
              j_password: password
            }
          }
        );
      })
      .then(resp => {
        return client(
          "https://www.myiclubonline.com/iclub/account/checkInHistory.htm",
          {
            qs: {
              lowDate: lowDate.format("MM/DD/YYYY"),
              highDate: highDate.format("MM/DD/YYYY")
            }
          }
        );
      })
      .then(resp => JSON.parse(resp))
      .then(resp =>
        resp.map(checkin =>
          moment(`${checkin.date} ${checkin.time}`, "MM/DD/YYYY hh:mm a")
        )
      )
      .then(checkins => {
        console.error(checkins);
        return Array(days)
          .fill(0)
          .map((_, i) => {
            const day = moment().add(-i, "days");
            return checkins.find(c => c.isSame(day, "day")) != null;
          })
          .reverse();
      })
      .then(streak => {
        const streakString = streak.map(went => (went ? 1 : 0)).join("");
        const filePath = untildify(file);
        return writeFile(filePath, streakString);
      })
      .catch(err => {
        console.error(err);
        process.exit(1);
      });
  });

program
  .command("format")
  .option(
    "-w, --went <spec>",
    "Display days at the gym according to spec: char[:color]"
  )
  .option(
    "-a, --away <spec>",
    "Display days away from the gym according to spec: char[:color]"
  )
  .option("-f, --file <file>", "Streak File", "~/.gymstreak")
  .action(options => {
    chalk.enabled = 1;
    chalk.level = 3;

    // Character and its background color
    const defaultWent = { char: "\u25ac", color: 220 };
    const defaultAway = { char: "\u25ac", color: 105 };

    const wentChar = fromOption(options.went, defaultWent);
    const awayChar = fromOption(options.away, defaultAway);

    const streak$p = readFile(untildify(options.file)).then(fileContents => {
      return fileContents
        .toString("utf8")
        .trim()
        .split("")
        .map(v => Boolean(Number(v)));
    });

    streak$p.then(streak => {
      console.log(
        streak
          .map(went => {
            const { char, color } = went ? wentChar : awayChar;
            return chalk.ansi256(color)(char);
          })
          .join("")
      );
    });
  });

function fromOption(spec, defaults) {
  if (spec == null) return defaults;
  const [char, color] = spec.split(":");
  return {
    char: char || defaults.char,
    color: color || defaults.color
  };
}

program.parse(process.argv);
