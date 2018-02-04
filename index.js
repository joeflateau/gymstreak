#!/usr/bin/env node

const rp = require("request-promise");
const jar = rp.jar();
const client = rp.defaults({ jar, followAllRedirects: true });
const moment = require("moment");
const chalk = require("chalk");
const program = require("commander");

program
  .command("fetch")
  .option("-u, --username <username>", "Username")
  .option("-p, --password <password>", "Password")
  .option("-d, --days <days>", "Days", Number)
  .action(options => {
    const { username, password, days } = options;

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
        console.error(streak);
        console.log(streak.map(went => (went ? 1 : 0)).join(""));
        process.exit(0);
      })
      .catch(err => {
        console.error(err);
        process.exit(1);
      });
  });

program
  .command("format")
  .option("-w, --went <spec>", "Display days at the gym according to spec: char[:color]")
  .option("-a, --away <spec>", "Display days away from the gym according to spec: char[:color]")
  .action(options => {

  chalk.enabled = 1;
  chalk.level = 3;

  // Character and its background color
  const defaultWent   = ["\u25ac", 220];
  const defaultAway = ["\u25ac", 110];

  let wentChar = defaultWent;
  if(options.went) {
    wentChar = options.went.split(":", 2);
    if(wentChar.length < 2)
      wentChar[1] = defaultWent[1];
  }

  let awayChar = defaultAway;
  if(options.away) {
    awayChar = options.away.split(":", 2);
    if(awayChar.length < 2)
      awayChar[1] = defaultAway[1];
  }

  const streak$p = new Promise(resolve => {
    var streak = "";
    process.stdin.resume();
    process.stdin.on("data", function(buf) {
      streak += buf.toString();
    });
    process.stdin.on("end", function() {
      resolve(
        streak
          .trim()
          .split("")
          .map(v => Boolean(Number(v)))
      );
    });
  });

  streak$p.then(streak => {
    console.error(streak);
    console.log(
      streak
        .map(went => {
          let [ char, color ] = went ? wentChar : awayChar;
          return chalk.ansi256(color)(char);
        })
        .join("")
    );
  });
});

program.parse(process.argv);
