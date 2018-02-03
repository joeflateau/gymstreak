###Add something like this to your crontab:
0 \* \* \* \* gymstreak fetch --username "xxxx" --password 'xxxx' --days "14" > ~/.gymstreak 2> /dev/null

###Configure your prompt in .bash_profile:

```
function gym_streak(){
    cat ~/.gymstreak | gymstreak format 2>/dev/null
}

...

PS1+='$(gym_streak) '
```
