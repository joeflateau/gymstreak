# GYMSTREAK

![Example of streak](https://raw.githubusercontent.com/joeflateau/gymstreak/master/img/preview.png)

** This only works with your Planet Fitness checkins **

### Installation

Run `npm i -g gymstreak`

### Setup

There are two steps to set this up once installed.

#### 1. Install in your crontab

Run `crontab -e` and add the following line. This will query the gym every hour for checkins.

```
0 * * * * gymstreak fetch --username "xxxx" --password 'xxxx' --days "14" > ~/.gymstreak 2> /dev/null
```

#### 2. Configure your prompt in `.bash_profile` (or `.bashrc`):

This will output your current streak in your prompt. If you've never done this before, I recommend you read this first: https://www.howtogeek.com/307701/how-to-customize-and-colorize-your-bash-prompt/

```
function gym_streak(){
    cat ~/.gymstreak | gymstreak format 2>/dev/null
}

PS1+='$(gym_streak) '
```
