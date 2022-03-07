## The cool git: 1. Git Bisect

**TL;DR:** Use binary search to find the commit that introduced a bug.

**For humans:** Take 2 commits and start removing halves until you find the error.

The command `git blame` has been my ally in those times that the bug is a mistery. It has allowed me to go back in history and see the commit that broke something. Usually it's me being a detective for my own murder.

As simple as it sounds, it takes a "correct" commit and a broken one and with binary search, it allows you to find the offending one _fast_.
 
 This is probably as far as I can go on explaning so let's see it with an example, using my favorite song.

> This code will go to your home directory and create a folder with a git history for us to experiment. Read it first, and go ahead and run it.
```shell 
cd 
mkdir wm-git-blame
cd wm-git-blame
git init
echo 'It might not be the right time' >> wm-git-blame.txt
git add wm-git-blame.txt && git commit -m 'Add line 1'
echo 'I might not be the right one' >> wm-git-blame.txt
git add wm-git-blame.txt && git commit -m 'Add line 2'
echo 'But there´s something about us I want to say' >> wm-git-blame.txt
git add wm-git-blame.txt && git commit -m 'Add line 3'
echo 'Cause there´s something between us anyway' >> wm-git-blame.txt
git add wm-git-blame.txt && git commit -m 'Add line 4'
echo 'I might not be the right one' >> wm-git-blame.txt
git add wm-git-blame.txt && git commit -m 'Add line 5'
echo 'It might not be the right time' >> wm-git-blame.txt
git add wm-git-blame.txt && git commit -m 'Add line 6'
echo 'But there´s something about us I´ve got to do' >> wm-git-blame.txt
git add wm-git-blame.txt && git commit -m 'Add line 7'
echo 'Some kind of secret I will share with you' >> wm-git-blame.txt
git add wm-git-blame.txt && git commit -m 'Add line 9'
echo 'I need you more than anythin´ in my life' >> wm-git-blame.txt
git add wm-git-blame.txt && git commit -m 'Add line 10'
sed -i -e 's/something/nothing/g' wm-git-blame.txt
git add wm-git-blame.txt && git commit -m 'change something for nothing'
echo 'I want you more than anythin´ in my life' >> wm-git-blame.txt
git add wm-git-blame.txt && git commit -m 'Add line 11'
echo 'I´ll miss you more than anyone in my life' >> wm-git-blame.txt
git add wm-git-blame.txt && git commit -m 'Add line 12'
echo 'I love you more than anyone in my life' >> wm-git-blame.txt
git add wm-git-blame.txt && git commit -m 'Add line 13'
```
As you can see, after adding line 10, we change a word in line 4. This is where our code broke, but we continued working without noticing for a while, just like the real world. 

And just like the real world, a user reported and now it's on us to fix it, let's do it:

```shell 
git log
```
This will bring up our git history, where we'll find the offending commit, but this will be way harder in a real timeline e.g. if you ```squash``` your commits, your commit names are not standarized, or your history is longer.

Now, you know tht the latest commit ("Add line 13") is broken, this will be the *bad* commit. You need a commit that is considered *good*, so we'll take the original one where we added the line ("Add line 4"). This probably will take longer, skip back a lot and test.
> Your commit IDs will be different, remember to use the output on your console.
```shell 
commit 778d62a21ae08ff38db34bf9465db423f7e990fb (HEAD -> master)                                                                     
Add line 13    
commit c0ac1bdd88d6e89b2a07d5356dd50c3720fc9ace
Add line 12    
commit a2fa117307aacd11ddb502a1059cecdd3d8da78f
Add line 11    
commit e1249a7f0d86a8dca982289aa35e3892fe189ae2
change something for nothing  
commit c93b967c5d5e7a601e83c3adda2b3ab814ad10f1
Add line 10    
commit 219e531c50779854789dbae70a911dbfb2c652e8
Add line 9     
commit 2ab752fcb792a742ac0fda9ddb4d65a97045090d
Add line 7                             
...            
```
We're in luck, ```git bisect``` is interactive, so let's let it guide us through this rabbit hole. Once you start you will be in bisect mode untill you type ```git bisect reset```.
```shell 
git bisect
```
This command has no output. Let's give it some input.
> You can use short commit IDs but we already have the long ones.
```shell
git bisect bad 778d62a21ae08ff38db34bf9465db423f7e990fb
git bisect good 6e83eec542f915bdaeb9565fe5dbd1c6cfaec4d6
```
And it will output a useful number of revisions and a calculated distance. With longer histories you'll see the power of binary search.

```shell 
Bisecting: 4 revisions left to test after this (roughly 2 steps)
[219e531c50779854789dbae70a911dbfb2c652e8] Add line 9
```
Now, the second part is the interesting one. Notice how a commit that we didn't input was printed? Well, now it is checked out and we can test it to know if it's a *good* or *bad* one.
```shell 
cat wm-git-blame.txt
```
We can see that this specific commit, even if incomplete, has the correct lyrics, so we'll tell git this one is good.
```shell 
git bisect good
```
And now the output will be similar, also checking out another commit. 
```shell 
Bisecting: 2 revisions left to test after this (roughly 1 step)
[e1249a7f0d86a8dca982289aa35e3892fe189ae2] change something for nothing
```
We check again.
```shell 
cat wm-git-blame.txt
```
*Aha!* We have found the error, or bug in a real development environment.
```shell 
git bisect bad
```
Outpust tells us that this is the last step.
```shell 
Bisecting: 0 revisions left to test after this (roughly 0 steps)
[c93b967c5d5e7a601e83c3adda2b3ab814ad10f1] Add line 10
```
We check for the last time.
```shell 
cat wm-git-blame.txt
```
No error so...
```shell 
git bisect good
```
And now git tells us the offending commit has been found, the commit author, date, commit message and lists all changed files.
```shell 
e1249a7f0d86a8dca982289aa35e3892fe189ae2 is the first bad commit
commit e1249a7f0d86a8dca982289aa35e3892fe189ae2
Author: estebandalelr <estebandalelr@gmail.com>
Date:   Mon Mar 7 11:07:06 2022 -0600

    change something for nothing

:100644 100644 ebecac7931b48bb4aaa63e1e2a8624712d959eb2 ffc445f53b954c6ad8c05a8a860920df064388d1 M      wm-git-blame.txt
```
So we close the case, it was me (as it's common), we can fix it commit and close the Jira ticket.
```shell 
git bisect reset
```
Now we are in the commit we were in (usually HEAD) when we started, and know what broke our app.

