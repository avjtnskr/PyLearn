# PyLearn

PyLearn is a fully responsive, multi-page Python learning website created for an O Level IT project.

## Pages

- `html/index.html` - Home page with hero, benefits, and course map.
- `html/introduction.html` - Introduction to Python, uses, installation, and first program.
- `html/basics.html` - Variables, data types, operators, and type conversion.
- `html/control-flow.html` - If-else, loops, break, continue, and nested loops.
- `html/functions.html` - Functions, arguments, modules, and practice examples.
- `html/data-structures.html` - Lists, tuples, dictionaries, sets, and a comparison table.
- `html/quiz.html` - 20-question practice quiz with explanations, progress, and score review.
- `html/css/style.css` - Main stylesheet for all pages.
- `html/js/main.js` - Shared navigation, motion, clipboard, progress, and quiz enhancements.
- `html/favicon.svg` - Local site icon.

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript

No frameworks, backend, build tools, or remotely hosted assets are required. Lessons, navigation, quiz answer feedback, and explanations remain available without JavaScript. Scoring and saved progress need JavaScript.

## Features

- Responsive sticky navigation with an accessible mobile menu.
- Subtle page entrances, code-line animation, scroll reveals, and hover transitions. The operating system's reduced-motion setting is respected, including changes while the page is open.
- Lesson contents links, current-section highlighting, a reading indicator, and previous/next navigation.
- Code-copy buttons that preserve indentation and line breaks.
- Explicit lesson completion with undo and a home-page link to the next unfinished lesson.
- Progress stored locally in this browser; no account or server is involved. If storage is blocked, the current page still works and explains that progress cannot be saved.
- Detailed lesson pages with explanations, examples, outputs, tips, and practice tasks.
- Quiz question navigation, instant answer feedback, partial or complete score review, explanations, and reset.
- Keyboard skip link, visible focus styles, semantic question groups, live feedback, and scrollable tables/code on small screens.
- Print styles for lesson revision.

## How to Run

Open `html/index.html` in a web browser

The home-page output replay is a fixed demonstration of the displayed example. Run lesson examples in your own Python editor.

## Verification

- All seven pages checked at 320, 390, 768, and 1440 pixels wide.
- Desktop and mobile WCAG A/AA automated accessibility scans.
- Local page links, section anchors, and assets validated.
- All 18 lesson code samples executed and their deterministic outputs compared with the displayed examples.