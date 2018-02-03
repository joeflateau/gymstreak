#!/usr/bin/env node

const rp = require("request-promise");
const jar = rp.jar();
const client = rp.defaults({ jar, followAllRedirects: true });
const moment = require("moment");
const chalk = require("chalk");
const program = require("commander");

program
  .command("fetch")
  .option("-u, --username [username]", "Username")
  .option("-p, --password [username]", "Password")
  .option("-d, --days [days]", "Days", Number)
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

program.command("format").action(() => {
  chalk.enabled = 1;
  chalk.level = 3;

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
        .map(went => chalk.ansi256(!went ? "105" : "220")("\u25ac"))
        .join("")
    );
  });
});

program.parse(process.argv);
