# GYMSTREAK

Gymstreak is a utility to print an indicator of your recent gym attendance in your bash prompt.

**This only works with your Planet Fitness checkins. I am not affiliated with Planet Fitness and they may block this at any time.**

By default visits are shown with yellow, days off are shown in purple:

![Example of streak](https://raw.githubusercontent.com/joeflateau/gymstreak/master/img/preview.png)

These characters and colors can be customized. See [output format](#output-format).

### Installation

Run `npm i -g gymstreak`

### Setup

There are two steps to set this up once installed.

#### 1. Install in your crontab

Run `crontab -e` and add the following line. This will query the gym every hour for checkins.

```
0 * * * * gymstreak fetch --username "xxxx" --password 'xxxx' --days "14"
```

#### 2. Configure your prompt in `.bash_profile` (or `.bashrc`):

This will output your current streak in your prompt. If you've never done this before, I recommend you read this first: https://www.howtogeek.com/307701/how-to-customize-and-colorize-your-bash-prompt/

```bash
function gym_streak(){
    gymstreak format 2>/dev/null
}

PS1+='$(gym_streak) '
```

### Output Format

Use the `format` command's `--went <spec>` and `--away <spec>` options to control how the days you attend and/or don't attend the gym are formatted.
The format of `spec` is: `character[:color]`, where `character` is the character to display and `color` is an optional ANSI 256 color code.

For example:

```
gymstreak format --went x:201 --away o
```

Will display days attended in a pink `x` and days away in an `o` using the default away color.

Certain characters may appear squished together. In this case you can add a space to the end when specifying them:

```
gymstreak format --went '💪 ' --away '💤 '
```

### Recent Changes

Starting with v1.1, gymstreak reads and writes a file instead of relying on the file being piped through stdin/stdout. The default file is `~/.gymstreak` but can be overridden by the `--file` option.
