# Unajua — The Kenyan Knowledge Game

**Product:** Unajua  
**Working tagline:** *How well do you know Kenya?*  
**Initial market:** Kenya  
**Future markets:** Tanzania → East Africa → other localized markets  
**Platform:** React Native mobile app + Next.js web/admin platform + Supabase  
**Document status:** MVP Product Requirements Document  
**Target MVP prototype:** 2 weeks  
**Initial public launch target:** September 2026

---

# 1. Product Vision

Unajua is a gamified knowledge and discovery application built around **Kenyan culture, places, people, brands, history, trends and everyday experiences**.

The core idea is simple:

> **Show me something. Unajua?**

A player may see a photograph of a building, hear a short audio clip, see a Kenyan brand logo, identify a town from a landmark, recognize a famous personality, complete a slogan, or answer an interesting fact about Kenya.

Unajua turns this knowledge into a game.

The product should sit somewhere between:

- Logo Quiz
- Trivia
- Kahoot
- Word guessing games
- Social challenges
- Cultural discovery

But its differentiator is **deep local relevance**.

Instead of asking generic questions that could belong to any country, Unajua asks questions that make a Kenyan say:

> "I should know this!"

or:

> "Wait... I've seen this my whole life but never knew what it was!"

---

# 2. The Core Product Philosophy

Unajua should not initially try to become a massive social network or complicated multiplayer platform.

The first objective is:

> **Make answering 10 questions so fun that someone immediately wants to play another 10.**

Everything else comes later.

The product should follow this progression:

**Fun → Retention → Sharing → Community → Monetization → Scale**

Not:

**Features → Features → Features → Monetization**

---

# 3. The Problem

There are many trivia and quiz applications, but very few are deeply localized to Kenyan culture.

Generic trivia apps often lack:

- Kenyan locations
- Kenyan brands
- Kenyan slang
- Kenyan history
- Kenyan personalities
- Kenyan television
- Kenyan music culture
- Kenyan advertising
- Kenyan transport culture
- Kenyan geography
- Generational Kenyan experiences
- Current Kenyan trends

There is an opportunity to create a product that turns **local knowledge into entertainment**.

---

# 4. Target Users

## Primary users

### 1. Young Kenyans

Approximately 18–35.

They are likely to enjoy:

- Trends
- Brands
- Social challenges
- Music
- Celebrities
- TikTok/Instagram culture
- Competitive games
- Shareable results

### 2. Millennials

Questions can tap into nostalgia:

- Old TV shows
- Old advertisements
- Former Kenyan brands
- Childhood games
- Famous personalities
- School experiences
- Old technology
- Music
- Nairobi experiences from the 90s/2000s

### 3. Generation X and older users

Potential categories include:

- Kenyan history
- Old political/historical events
- Former businesses
- Traditional culture
- Historical personalities
- Old television/radio
- Former national landmarks
- Nostalgia

### 4. Families

Unajua should eventually support a family-friendly experience where parents and children can play together.

### 5. House parties and social groups

This is an important future use case.

A group could put Unajua on a TV or screen and compete together.

---

# 5. Core Value Proposition

Unajua should communicate three things:

### Learn

Discover interesting things about Kenya.

### Play

Turn knowledge into a fun competitive experience.

### Share

Challenge your friends and show off your score.

A player shouldn't feel like they are studying.

They should feel like:

> "I'm just playing a game... but I'm actually learning something."

---

# 6. MVP Goal

The MVP is **not** intended to prove the entire business.

It is intended to answer one question:

> **Do people find Unajua fun enough to play repeatedly?**

The MVP should therefore contain only the functionality required to create the core game loop.

---

# 7. MVP Core Game Loop

The fundamental loop is:

**Open App**

↓

**Choose / receive challenge**

↓

**See question**

↓

**Answer**

↓

**Immediate feedback**

↓

**Earn points**

↓

**Next question**

↓

**Finish game**

↓

**See score**

↓

**Share / challenge friend**

↓

**Play again**

This loop is more important than almost every other feature.

---

# 8. MVP Game Format

The initial game should contain approximately:

**10 questions per round**

Each question should have:

- Question
- Image/media where applicable
- Answer
- Timer
- Points
- Correct/incorrect state
- Explanation/fun fact
- Source attribution

Example:

### Question

**Which building is this?**

[IMAGE]

Possible answer:

**KICC**

The player uses letter tiles to enter:

`K I C C`

If correct:

> 🎉 Correct!

> KICC — Kenyatta International Convention Centre — opened in 1973.

**Source:** Official/reference source.

---

# 9. Answer Mechanism

Rather than allowing unrestricted text input, Unajua should use **letter tiles**.

This is inspired by the Logo Quiz experience but can be improved significantly.

Example:

**Answer: KENYATTA**

Available letters:

`K E N Y A T T A R M S P L`

The player taps letters to construct the answer.

Benefits:

- Prevents copy/paste
- Controls acceptable answers
- Makes gameplay faster
- Works well on mobile
- Creates opportunities for hints
- Allows partial-answer logic
- Feels more like a game

---

# 10. "Almost There" Mechanic

This is an important part of the game experience.

If the player enters an answer that is close to the correct answer, Unajua can respond:

> **Almost there! 🔥**

or:

> **You're very close!**

Example:

Correct answer:

**NAKURU**

Player enters:

**NAKURU**

→ Correct.

But if the game supports answer similarity:

**NAKUR**

→

> "Almost there! You have 5/6 letters."

This can eventually become more sophisticated using answer normalization and similarity scoring.

For MVP, however, keep validation deterministic.

Define:

- Accepted answer
- Alternative accepted answers
- Common spelling variations
- Abbreviations

---

# 11. MVP Categories

Do not launch with 20 categories.

Start with approximately **4–5 categories**.

Recommended initial categories:

## 1. Kenyan Places

Examples:

- Nairobi
- Mombasa
- Kisumu
- Nakuru
- Eldoret
- Parks
- Beaches
- Mountains
- Buildings
- Streets
- Estates
- Landmarks

## 2. Kenyan Brands

Examples:

- Company logos
- Product packaging
- Slogans
- Historical brands
- Kenyan businesses

## 3. Famous Kenyans

Examples:

- Athletes
- Musicians
- Actors
- Media personalities
- Historical figures
- Business personalities

Content must be carefully sourced and reviewed.

## 4. Kenya Trivia

Interesting facts such as:

- Population
- Geography
- Counties
- History
- Wildlife
- National symbols
- Infrastructure
- Culture

The objective isn't merely to ask obvious facts.

Ask:

> "Things Kenyans should know but surprisingly don't."

## 5. Nostalgia

This can become one of Unajua's strongest categories.

Examples:

- Old TV shows
- Old adverts
- Former brands
- Childhood games
- Old technology
- Famous catchphrases
- Music
- Kenyan pop culture

---

# 12. Future Categories

After validating the MVP:

- Kenyan Music
- Kenyan Football
- Kenyan Slang
- Matatu Culture
- Kenyan Food
- Kenyan History
- Counties
- Kenyan Politics
- Kenyan Wildlife
- Kenyan Tourism
- Famous Buildings
- Kenyan Businesses
- Radio
- TV
- Old School
- Gen Z
- Millennials
- Gen X
- Kids
- School Life
- Proverbs
- Audio Guessing
- Emoji Guessing
- Map Guessing
- Who Said It?
- Complete the Slogan
- Guess the Location

---

# 13. Generational Modes

Unajua can eventually create separate experiences for different generations.

### Gen Z

- Current trends
- Social media
- Slang
- Current artists
- Current influencers
- Current brands
- Viral moments

### Millennials

- 2000s nostalgia
- Early internet
- Old phones
- TV
- Music
- Childhood experiences
- Former brands

### Gen X

- Older Kenyan music
- Radio
- Historical events
- Former businesses
- Old television
- Kenyan history

### Family/Kids

- Geography
- Wildlife
- Science
- Kenyan history
- Education
- General knowledge

---

# 14. Daily Challenge

A daily challenge should eventually become one of Unajua's strongest retention mechanisms.

Every day:

**10 questions**

Everyone receives the same challenge.

Example:

> 🇰🇪 **Today's Unajua Challenge**

> Can you score 10/10?

After completing it:

> You scored **8/10**

> You beat **74% of players today.**

This creates a reason to return every day.

---

# 15. Weekly Content Contest

Unajua should eventually introduce:

> **This Week in Kenya**

Questions based on current events, trends and interesting discoveries.

Examples:

- Something trending on Kenyan social media
- A new Kenyan artist
- A sporting event
- A new building/project
- A viral phrase
- A cultural event
- A historical anniversary
- A newly announced development

This allows the app to feel alive instead of becoming a static quiz database.

---

# 16. User Profiles

MVP profile:

- Nickname
- Email
- Profile picture/avatar — optional
- Country
- Score
- Games played
- Games completed
- Categories played
- Best score
- Current streak

A phone number should **not** be required initially.

Supabase Auth can handle authentication.

Email verification should be used before granting full account functionality.

---

# 17. Friends / Rivals

Instead of building a traditional social network, introduce the concept of:

> **Rivals**

A player can challenge another player.

Example:

> Felix challenged you to beat his score.

After completing the challenge:

> You won! 🎉

or:

> Felix still holds the crown 👑

Players can eventually see:

- Head-to-head scores
- Category performance
- Games won
- Best scores
- Recent challenges

This is much simpler than building messaging, feeds and a full social graph.

---

# 18. Leaderboards

MVP leaderboard:

### Global

Who has the highest score?

### Weekly

Who performed best this week?

### Rivals

How do I compare against my friends?

Future:

### County leaderboard

- Nairobi
- Kiambu
- Mombasa
- Kisumu
- Nakuru
- etc.

This could become a powerful Kenyan identity mechanic.

Example:

> **Nairobi is currently #1 in Kenya!**

or:

> **Kiambu players are dominating this week's Unajua Challenge.**

---

# 19. Gamification

Unajua should use several lightweight gamification mechanics.

### Points

Earn points for correct answers.

### Speed bonus

Answer faster → more points.

### Streaks

Correct answers consecutively.

### Daily streak

Play every day.

### Badges

Examples:

- Nairobi Expert
- Kenya Know-It-All
- History Buff
- Brand Master
- Coast Explorer
- 7-Day Streak
- Perfect 10

### Levels

Example:

Level 1 — Tourist  
Level 2 — Explorer  
Level 3 — Local  
Level 4 — Expert  
Level 5 — Kenyan Legend

Avoid overcomplicating this in MVP.

---

# 20. Shareable Results

This should be an MVP feature because it supports organic growth.

After a game:

> 🇰🇪 Unajua

> I scored **8/10**

> Kenyan Landmarks

> Can you beat me?

[Challenge Me]

The share card should contain a deep link to Unajua.

Potential channels:

- WhatsApp
- Instagram
- TikTok
- Facebook
- X

The objective is:

**Game → Share → New player → Game → Share**

---

# 21. Viral Growth Loop

The primary viral loop:

**Player plays**

↓

**Gets score**

↓

**Creates share card**

↓

**Shares**

↓

**Friend clicks**

↓

**Friend plays challenge**

↓

**Friend gets score**

↓

**Friend shares**

↓

**More players**

This is more valuable than spending heavily on advertising during the early stage.

---

# 22. Content Philosophy

Unajua's biggest long-term asset will not be the code.

It will be:

> **The quality and uniqueness of its content database.**

The content should be:

- Accurate
- Interesting
- Local
- Entertaining
- Current
- Properly sourced
- Age appropriate
- Periodically reviewed

A question should ideally create one of these reactions:

> "I knew that!"

> "I should have known that!"

> "Wow, I didn't know that!"

---

# 23. Content Sources

AI should **not** be treated as the source of truth.

Use a hierarchy.

### Tier 1 — Official sources

Examples:

- Kenya National Bureau of Statistics
- Government ministries
- Kenya Wildlife Service
- Tourism authorities
- County governments
- Sports organizations
- Official company websites
- Museums and cultural institutions
- Official publications

### Tier 2 — Trusted references

Examples:

- Universities
- Established publications
- Reputable books
- Academic sources
- Historical archives
- Industry organizations

### Tier 3 — Community submissions

Community information can be useful, but should go through verification before publication.

---

# 24. Source Attribution

Every factual question should have an internal source.

Example:

**Question:**

What is the population of Nairobi?

**Answer:**

[Correct figure]

**Source:**

KNBS

**Source date:**

2026

This allows the team to periodically update information.

For changing facts, store:

- Source
- Publication date
- Last verified date
- Review date

This prevents Unajua from becoming outdated.

---

# 25. AI Content Pipeline

AI should function as an **editorial assistant**, not the publisher.

Recommended pipeline:

**Trusted Source**

↓

**Data ingestion**

↓

**AI extraction**

↓

**AI question generation**

↓

**AI quality checks**

↓

**Human review**

↓

**Approve**

↓

**Publish**

AI can generate:

- Questions
- Answers
- Explanations
- Wrong answer options
- Fun facts
- Category suggestions
- Difficulty rating
- Question variations

But humans make the final decision.

---

# 26. Proposed AI Content System

Your admin dashboard should contain:

### Draft Questions

Each generated question has:

- Question
- Answer
- Category
- Difficulty
- Age rating
- Source
- Source URL/reference
- Explanation
- Media
- AI confidence
- Status

Statuses:

**Draft**

→ **Under Review**

→ **Approved**

→ **Scheduled**

→ **Published**

or

→ **Rejected**

This allows you or your content team to simply review a queue.

---

# 27. Automated Content Pipeline

A future n8n workflow could run daily.

Example:

**8:00 AM**

n8n checks selected sources.

↓

Finds new information.

↓

Sends relevant content to an LLM.

↓

LLM proposes quiz questions.

↓

Questions are saved in Supabase as `DRAFT`.

↓

Editor receives notification.

↓

Editor opens Unajua Admin.

↓

Reviews questions.

↓

Clicks **Approve**.

↓

Question becomes available.

This gives you a continuously evolving content engine.

---

# 28. Content Moderation

User-generated content should **not** go directly into production.

Submission:

**User**

↓

**Automated moderation**

↓

**Content queue**

↓

**Human review**

↓

**Approval**

↓

**Published**

Moderation should check:

- Sexual content
- Hate speech
- Violence
- Harassment
- Defamation
- Illegal content
- Personal information
- Copyright concerns
- Misleading information
- Political misinformation

---

# 29. Age Ratings

Content should carry an age/content classification.

For example:

- `ALL`
- `13+`
- `16+`
- `18+`

Categories/content can also carry flags:

- Violence
- Mature themes
- Music
- Alcohol
- Politics
- Sexual references
- Strong language

The player experience should then respect the user's selected age range.

---

# 30. Child / Family Experience

For younger players:

- Avoid mature content
- Avoid inappropriate imagery
- Use educational categories
- Avoid sensitive celebrity content
- Use age-appropriate language
- Keep advertisements appropriately controlled

The safest strategy is to make the default experience broadly family friendly and explicitly separate mature content later.

---

# 31. Monetization Strategy

Do **not** put the core game behind a paywall during MVP.

Unajua should primarily be:

> **Free to play.**

Potential monetization:

### 1. Rewarded advertisements

Watch an advertisement to:

- Get a hint
- Reveal a letter
- Revive a game
- Double points

### 2. Subscription

Potential future premium benefits:

- Ad-free experience
- Exclusive categories
- Premium challenges
- Advanced statistics
- Special badges
- Early access to content
- Premium game modes

### 3. Sponsored challenges

A Kenyan brand could sponsor:

> "This week's Unajua Challenge"

Clearly labelled as sponsored content.

### 4. Premium content packs

Examples:

- Kenyan Music Pack
- Nairobi Pack
- Kenyan History Pack
- Football Pack
- 2000s Nostalgia Pack

### 5. Events

Potential future tournaments with entry fees/prizes should only be introduced after checking applicable Kenyan legal and platform requirements.

---

# 32. MVP Monetization

Do **not** spend significant development time on monetization initially.

First prove:

**People play.**

Then:

**People return.**

Then:

**People share.**

Then:

**People invite others.**

Then:

**People are willing to monetize.**

The MVP can initially use no monetization or very limited rewarded ads during testing.

---

# 33. Technical Architecture

## Mobile

**React Native**

Recommended:

- React Native
- Expo if appropriate for the project's requirements
- TypeScript

The mobile application handles:

- Authentication
- Game UI
- Question rendering
- Timers
- Answer interaction
- Scoring
- Profiles
- Leaderboards
- Challenges
- Sharing

---

# 34. Backend

Use:

**Supabase**

For MVP:

- PostgreSQL
- Authentication
- Storage
- Row Level Security
- Database functions where required

Potential entities:

```text
users
profiles
categories
questions
question_answers
question_media
question_sources
games
game_questions
game_answers
scores
challenges
leaderboards
badges
user_badges
content_submissions
content_reviews
```

Do not build every table on day one.

Start with the minimum required for gameplay.

---

# 35. Next.js Web Application

Use Next.js primarily for:

### Public website

- Landing page
- How Unajua works
- Download links
- Challenge links
- SEO pages

### Admin dashboard

- Questions
- Categories
- Users
- Content review
- Sources
- Challenges
- Reports
- Analytics

The admin dashboard will eventually become extremely important because **content operations are the heart of Unajua**.

---

# 36. MVP Admin Dashboard

Minimum functionality:

### Questions

- Create
- Edit
- Delete
- Preview
- Publish/unpublish

### Categories

- Create
- Edit
- Enable/disable

### Content status

- Draft
- Published

### Source

- Source name
- Source reference

That's enough initially.

AI workflows and advanced moderation can be added after gameplay has been validated.

---

# 37. Analytics

Use product analytics from the beginning.

Recommended:

**PostHog**

Track events such as:

```text
app_opened
signup_started
signup_completed
game_started
question_viewed
answer_submitted
answer_correct
answer_wrong
hint_used
game_completed
score_viewed
score_shared
challenge_created
challenge_opened
challenge_completed
```

Important metrics:

### Activation

Percentage of new users who actually play their first game.

### Completion rate

How many players finish a 10-question game?

### Retention

- Day 1
- Day 7
- Day 30

### Session frequency

How many games does the average user play?

### Sharing rate

What percentage of completed games are shared?

### Challenge conversion

How many people who receive a challenge actually play?

### Viral coefficient

How many new players does each existing player generate?

---

# 38. MVP User Journey

## Step 1 — Discovery

User sees:

> "How Kenyan are you? Try the Unajua Challenge."

on TikTok, WhatsApp, Instagram or another channel.

↓

## Step 2 — Install

User downloads Unajua.

↓

## Step 3 — Welcome

> **How well do you know Kenya?**

Button:

**PLAY NOW**

↓

## Step 4 — Profile

User chooses:

- Nickname
- Email

↓

## Step 5 — Choose Game

Categories appear.

Example:

**Kenyan Places**

**Kenyan Brands**

**Kenyan People**

**Kenya Trivia**

↓

## Step 6 — Game

10 questions.

Each question has:

- Image
- Timer
- Letter tiles
- Points

↓

## Step 7 — Feedback

Correct:

> **Correct! 🔥**

Wrong:

> **Not quite!**

Then:

> **Did you know?**

with a short explanation.

↓

## Step 8 — Results

> **8/10**

> You beat 72% of players.

↓

## Step 9 — Share

> **Challenge a friend**

↓

## Step 10 — Return

Friend beats the score.

Original player gets:

> **Your rival just beat you! 👀**

> **Play again**

This creates the retention loop.

---

# 39. User Stories

## Authentication

**US-001**

As a new player, I want to create an account using my email and nickname so that I can save my progress.

**Acceptance criteria:**

- User can enter email.
- Email is validated.
- User chooses a unique nickname.
- Account is created successfully.
- User can return later and retain their progress.

---

## Gameplay

**US-002**

As a player, I want to start a quiz so that I can test my knowledge.

**Acceptance criteria:**

- Player can select a category.
- A game contains 10 questions.
- Questions appear one at a time.
- Each question has a timer.
- Player receives immediate feedback.

---

## Answering

**US-003**

As a player, I want to construct answers using letter buttons so that I can play quickly without typing.

**Acceptance criteria:**

- Available letters are displayed.
- Player can select letters.
- Selected letters appear in answer slots.
- Player can remove a selected letter.
- Answer can be submitted.
- Correct and incorrect answers are detected.

---

## Scoring

**US-004**

As a player, I want to earn points for correct answers so that I can compete with others.

**Acceptance criteria:**

- Correct answers award points.
- Faster answers can receive bonus points.
- Final score is calculated after the game.

---

## Learning

**US-005**

As a player, I want to see an explanation after answering so that I learn something even when I get the answer wrong.

**Acceptance criteria:**

- Explanation appears after every question.
- Information is concise.
- Source attribution is available.

---

## Results

**US-006**

As a player, I want to see my final score so that I know how well I performed.

**Acceptance criteria:**

- Score is displayed.
- Correct answers are shown.
- Percentage is displayed.
- Performance can be compared with previous games.

---

## Sharing

**US-007**

As a player, I want to share my score so that I can challenge my friends.

**Acceptance criteria:**

- Shareable card is generated.
- Card contains score.
- Card contains Unajua branding.
- Card contains a deep link.
- User can share through the mobile sharing system.

---

## Challenges

**US-008**

As a player, I want to challenge another player so that we can compete.

**Acceptance criteria:**

- Challenge can be created.
- Challenge contains a link.
- Recipient can open the challenge.
- Recipient can play.
- Scores can be compared.

---

## Leaderboards

**US-009**

As a player, I want to see leaderboards so that I can compare my performance with others.

**Acceptance criteria:**

- Global leaderboard exists.
- Weekly leaderboard exists.
- Player's position is visible.

---

## Content Management

**US-010**

As an administrator, I want to create questions so that I can continuously expand Unajua's content.

**Acceptance criteria:**

- Admin can create questions.
- Admin can assign categories.
- Admin can add answers.
- Admin can add sources.
- Admin can publish/unpublish questions.

---

## Content Verification

**US-011**

As an editor, I want to review AI-generated questions before publishing so that inaccurate information does not reach users.

**Acceptance criteria:**

- AI-generated content is stored as draft.
- Editor can review content.
- Editor can edit content.
- Editor can reject content.
- Editor can approve content.
- Only approved content becomes public.

---

# 40. MVP Non-Goals

Do **not** build these during the first two weeks:

- Full multiplayer
- Messaging
- Complex social feed
- User-generated content
- AI-generated content pipeline
- Advanced recommendation engine
- County battles
- Subscription system
- Complex advertising system
- Multiple countries
- Sophisticated moderation platform
- Complex avatar system
- Real-time multiplayer rooms
- Massive analytics dashboard

These are future opportunities.

---

# 41. Two-Week Prototype Plan

## WEEK 1 — Make the Game Work

### Days 1–2

Project setup:

- React Native
- TypeScript
- Supabase
- Authentication
- Navigation
- Basic design system

### Days 3–4

Gameplay:

- Categories
- Questions
- Question screen
- Timer
- Letter keyboard
- Answer validation

### Days 5–6

Scoring:

- Points
- Correct/incorrect states
- Explanations
- Game completion

### Day 7

Build enough content to play.

Target:

**50–100 excellent questions**

Not 500 mediocre questions.

---

# 42. Week 2 — Make It Feel Like a Product

### Days 8–9

Profile:

- Nickname
- Email
- Basic statistics

### Day 10

Results:

- Score
- Performance
- Replay

### Day 11

Sharing:

- Generate score card
- Native sharing
- Deep link structure

### Day 12

Leaderboard:

- Global
- Weekly

### Day 13

Polish:

- Animations
- Sounds
- Loading states
- Error handling
- Empty states

### Day 14

Testing:

Play with:

- Yourself
- Your wife
- Friends
- Family

Watch them play without explaining the app.

Observe where they struggle.

---

# 43. The First Five Users

Do not worry about 1,000 users initially.

Your first goal:

**5 real users.**

Ideally:

- You
- Your wife
- 3 friends/family members

Ask them:

1. Was it fun?
2. Which question did you enjoy most?
3. Which question felt boring?
4. Was anything confusing?
5. Did you want to play another game?
6. Would you share your score?
7. Would you challenge someone?
8. What category should we add?
9. What made you laugh?
10. What would make you come back tomorrow?

Don't ask:

> "Do you like my app?"

Ask about actual behaviour.

---

# 44. September Launch Strategy

Once the prototype is enjoyable:

### Phase 1

Private testing.

5–20 users.

### Phase 2

Closed/public Play Store release.

50–100 users.

### Phase 3

Content-led growth.

Create:

- TikTok videos
- Instagram Reels
- WhatsApp challenges
- Shareable trivia
- "Can you get 10/10?" posts

### Phase 4

Daily/weekly challenges.

### Phase 5

Begin measuring retention and sharing.

---

# 45. Content Marketing

Unajua has an advantage because the product itself creates content.

Examples:

> "Only 8% of Nairobians got this right."

> "If you grew up in Kenya in the 2000s, you'll know this."

> "Can you identify this Kenyan building?"

> "Only true Coast people will get 10/10."

> "Gen Z vs Millennials: Who knows Kenya better?"

These can become social media content.

---

# 46. AI-Generated Marketing Content

AI tools can help reduce initial marketing costs.

You can create simulated:

- House party gameplay
- Matatu gameplay
- Friends competing
- Family playing
- Office competitions
- University students playing

But clearly treat simulated/generated content as marketing creative rather than pretending it is genuine user footage.

The long-term goal should be replacing simulated UGC with real community content.

---

# 47. Long-Term Product Evolution

Once the core game works:

### Phase 2

- Daily challenges
- Better leaderboards
- Rivals
- Badges
- Streaks
- More categories

### Phase 3

- Community submissions
- AI content pipeline
- Editorial workflow
- Trending content
- Weekly contests

### Phase 4

- Multiplayer
- House party mode
- TV/second-screen experience
- County battles

### Phase 5

- Monetization
- Premium
- Sponsored challenges
- Content packs

### Phase 6

**Tanzania**

Localize:

- Language
- Culture
- Brands
- People
- Geography
- Trends
- Music
- History

Then expand into additional markets.

---

# 48. The Bigger Vision

Unajua should eventually become more than a quiz app.

The bigger idea is:

> **A gamified cultural knowledge platform.**

People come to Unajua to discover:

- What they know
- What they don't know
- What their friends know
- What their generation knows
- What their county knows
- What their country knows

The game becomes the interface for discovering culture.

---

# 49. The Competitive Advantage

The strongest moat is unlikely to be the React Native application.

Anyone can build a quiz app.

The moat becomes:

### 1. Content

A huge, accurate Kenyan knowledge database.

### 2. Localization

Deep understanding of Kenyan culture.

### 3. Freshness

Content that changes with Kenya.

### 4. Community

Users contributing and challenging one another.

### 5. Distribution

Shareable challenges and social content.

### 6. Trust

Every factual question is sourced and verified.

---

# 50. Product Principles

Every feature should pass these questions:

### Does it make the game more fun?

If not, reconsider it.

### Does it encourage people to return?

If not, it may not be MVP material.

### Does it encourage sharing?

If yes, prioritize it.

### Does it improve learning?

If yes, consider it.

### Can the feature be explained in one sentence?

If not, simplify it.

### Can we build it in days rather than weeks?

For MVP, prioritize the answer "yes."

---

# 51. MVP Success Criteria

The first version is successful if:

- People can install it.
- People understand the game without assistance.
- People complete games.
- People want to play again.
- People enjoy the questions.
- People learn something.
- People share scores.
- People challenge friends.
- You can add new questions without changing the app.
- You can identify which content users enjoy.

Downloads are **not** the primary success metric initially.

The most important metric is:

> **Do people come back to play?**

---

# 52. The First Version in One Sentence

If the entire MVP had to be described in one sentence:

> **Unajua lets you identify Kenyan places, people, brands and facts through fast, fun 10-question games, then compare and share your score with friends.**

---

# 53. Final MVP Scope

### MUST HAVE

- [ ] React Native app
- [ ] Supabase authentication
- [ ] Nickname
- [ ] Email verification
- [ ] Categories
- [ ] Questions
- [ ] Images
- [ ] Letter-tile answers
- [ ] Timer
- [ ] Answer validation
- [ ] Correct/incorrect feedback
- [ ] Explanations/fun facts
- [ ] Source attribution
- [ ] Scoring
- [ ] Results screen
- [ ] Basic profile
- [ ] Basic leaderboard
- [ ] Shareable score
- [ ] Basic Next.js admin
- [ ] Question management

### SHOULD HAVE

- [ ] Daily challenge
- [ ] Weekly leaderboard
- [ ] Basic streak
- [ ] Challenge links
- [ ] Basic analytics
- [ ] Deep linking

### NOT YET

- [ ] Multiplayer
- [ ] User-generated content
- [ ] AI content automation
- [ ] Subscriptions
- [ ] Complex ads
- [ ] County battles
- [ ] Advanced moderation
- [ ] Tanzania
- [ ] Real-time party mode

---

# 54. The Immediate Next Step

Do not start by building the entire Unajua platform.

Start with:

**One category.**

**10 questions.**

**One game.**

**One score.**

**One share button.**

Then make that experience genuinely enjoyable.

Once you and your wife find yourselves saying:

> "Wait, let me try again."

you have something worth building.

That is the signal to move from **prototype → product → community → business**.