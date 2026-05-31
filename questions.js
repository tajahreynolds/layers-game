/*
 * Layers — question data
 *
 * Design notes:
 * - Curated prompts are primary. They are written to be answerable by BOTH
 *   partners (symmetry creates surprise) and to use "you/I/we" framing so they
 *   read naturally regardless of whose turn it is.
 * - `templates` is a SMALL, constrained generator. Every base sentence reads
 *   grammatically and emotionally fine with ANY value from its arrays. This is
 *   what gives the deck its "endless" feel without the tone-deaf combos that a
 *   naive Mad-Libs engine produces.
 */

const LEVELS = {
  surface: {
    id: "surface",
    name: "Surface",
    tagline: "Perception",
    blurb:
      "How we see each other's outer shells, habits, and the small everyday tells.",
    cards: [
      "What's a habit of mine you think I picked up from my family?",
      "What was your exact first impression of me?",
      "What song would you put on to describe my mood today?",
      "What's something I do that you find quietly endearing?",
      "If a stranger watched us for ten minutes, what would they guess about us?",
      "What's a small thing I do that instantly tells you how my day went?",
      "What part of my daily routine do you wish you understood better?",
      "What's something you think I'm better at than I give myself credit for?",
      "What's a look or expression I make that you've come to know well?",
      "If you had to describe my 'vibe' this week in three words, what would they be?",
      "What's a topic I light up about that you love watching me talk about?",
      "What's something about my style or taste that has grown on you?",
      "What do you think I was like as a kid, based on who I am now?",
      "What's a tiny ritual of ours that you'd miss if it disappeared?",
    ],
  },

  subsurface: {
    id: "subsurface",
    name: "Subsurface",
    tagline: "Connection",
    blurb:
      "Emotional blueprints, the frameworks we inherited, and the fears we don't always say out loud.",
    cards: [
      "What's a compliment you wish I gave you more often?",
      "In what ways do you think our definitions of 'success' differ?",
      "What's a boundary you're trying to set for yourself right now?",
      "When was a moment you felt closest to me, and what made it that?",
      "What's something you needed as a kid that you're still learning to ask for?",
      "What do you do to protect yourself when you feel hurt, and can I recognize it?",
      "What's a fear about us that you rarely say out loud?",
      "What's something you've forgiven me for that I might not know about?",
      "Where do you think I misunderstand you the most?",
      "What does feeling safe with someone actually look like for you?",
      "What's a way you've changed since we've been together that you're proud of?",
      "What's a part of your past that still shapes how you love?",
      "When you picture us a year from now, what do you hope is different?",
      "What's something you've been carrying lately that you haven't told me?",
    ],
  },

  core: {
    id: "core",
    name: "Core",
    tagline: "Reflection",
    blurb:
      "Process what came up tonight, and look toward the version of us we're building.",
    cards: [
      "What did I say tonight that surprised you the most?",
      "What's one thing I can do this week to make you feel safer with me?",
      "What do you think we still need to learn about each other?",
      "What's something you understand about me now that you didn't an hour ago?",
      "What's a promise you want to make to us — not to me, to us?",
      "What did it feel like to be this open right now?",
      "What's one thing you appreciate about how we handle hard conversations?",
      "If tonight became a memory we look back on, what would you want to remember?",
      "What's something you want to be braver about with me?",
      "What do you need more of from me, and what do you need less of?",
      "What's a way we've quietly grown stronger that we don't talk about enough?",
      "What do you want the next layer between us to be?",
    ],
  },
};

const WILDCARDS = [
  {
    title: "Stare Down",
    body:
      "Hold eye contact for 30 seconds without speaking. Start the timer when you're both ready.",
    timer: 30,
  },
  {
    title: "Role Reversal",
    body:
      "Draw the next card and answer it as your partner — in their voice, from their perspective. They'll tell you how close you got.",
    timer: null,
  },
  {
    title: "Gratitude Burst",
    body:
      "Each of you, think of three specific things you appreciate about the other right now. Count to three and say them out loud at the same time.",
    timer: null,
  },
  {
    title: "Hand on Heart",
    body:
      "Place a hand over your partner's heart for 20 seconds. Notice their breathing. No words needed.",
    timer: 20,
  },
  {
    title: "Trade a Secret",
    body:
      "Each share one small thing you've never told the other. It doesn't have to be heavy — just true.",
    timer: null,
  },
  {
    title: "Rewind",
    body:
      "Name the exact moment you knew you wanted this person in your life. Describe it in detail.",
    timer: null,
  },
];

/*
 * Constrained template generator.
 * Each base reads naturally with every value in its arrays — no awkward combos.
 * Used to top up a level's deck so it never truly runs dry.
 */
const TEMPLATES = {
  surface: [
    {
      base: "When do you think I feel most {a} when we're together?",
      a: ["at ease", "playful", "myself", "proud of us", "alive"],
    },
    {
      base: "What's a {a} thing about me you've noticed but never mentioned?",
      a: ["funny", "sweet", "stubborn", "thoughtful", "quirky"],
    },
  ],
  subsurface: [
    {
      base: "What's one thing you've come to understand about my {a}?",
      a: ["silences", "moods", "ambitions", "fears", "kindness"],
    },
    {
      base: "What's a {a} memory of us you keep coming back to?",
      a: ["quiet", "joyful", "pivotal", "underrated", "surprising"],
    },
  ],
  core: [
    {
      base: "What's one way I could help you feel more {a} with me going forward?",
      a: ["seen", "supported", "free", "understood", "secure"],
    },
  ],
};
