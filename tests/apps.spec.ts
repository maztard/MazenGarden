import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

test('AboutCanvas component exists and conforms to structural specifications', () => {
  const filePath = resolve('src/components/apps/AboutCanvas.astro');
  expect(existsSync(filePath)).toBe(true);

  const content = readFileSync(filePath, 'utf-8');

  // Giant pixel "About" on line 1, offset red "Me!" on line 2
  expect(content).toContain('about-canvas__title');
  expect(content).toContain('About');
  expect(content).toContain('Me!');
  expect(content).toContain('--font-display');

  // Mazen Ragab aka (Maztardoo) with styling
  expect(content).toContain('Mazen Ragab aka');
  expect(content).toContain('(Maztardoo)');

  // All 5 bio paragraphs verbatim
  const normalized = content.replace(/\s+/g, ' ');
  expect(normalized).toContain(
    'Hi, you already know my name! I am currently a G12 student at New Cairo STEM School. Even though I am G12, I am 16 years old, which is kinda dope ngl cuz I feel superior lol.',
  );
  expect(normalized).toContain(
    'A fun fact about me is that I am trying to be a Polymath. I am into multiple stuff. I am into Tech, Marketing, Psychology and Human Behaviour, Business, and honestly a lot of other random things that I find interesting. I really enjoy learning about things outside of what I am supposed to know, especially when I can connect different fields together and use them to create something.',
  );
  expect(normalized).toContain(
    "I don't really want to limit myself to one specific field or career. I want to explore as much as I can, build things, understand people, learn how businesses work, and develop skills that complement each other. I think the most interesting ideas usually happen when you combine knowledge from completely different areas.",
  );
  expect(normalized).toContain(
    'Outside of academics, I am also really into building projects and experimenting with ideas. I enjoy taking an idea that sounds stupid at first and trying to turn it into something real. I am especially interested in AI, entrepreneurship, and using technology to solve actual problems.',
  );
  expect(normalized).toContain(
    'Overall, I would say I am just extremely curious. I like going down random rabbit holes, learning things that have absolutely nothing to do with school, and then somehow finding a way to connect them back to something useful. My goal is basically to become the type of person who can walk into almost any conversation and have something interesting to contribute.',
  );

  // SKILLS section with circular retro badges for Tech, AI, Marketing, Psychology, Web
  expect(content).toContain('SKILLS');
  expect(content).toContain('Tech');
  expect(content).toContain('AI');
  expect(content).toContain('Marketing');
  expect(content).toContain('Psychology');
  expect(content).toContain('Web');
  expect(content).toContain('about-canvas__badge');

  // EDUCATION section: New Cairo STEM School (G12)
  expect(content).toContain('EDUCATION');
  expect(content).toContain('New Cairo STEM School (G12)');
});

test('MeetMazenWindow component exists and renders portrait in retro frame', () => {
  const filePath = resolve('src/components/apps/MeetMazenWindow.astro');
  expect(existsSync(filePath)).toBe(true);

  const content = readFileSync(filePath, 'utf-8');

  // Uses Image component and points to mazen-1.jpeg
  expect(content).toContain("import { Image } from 'astro:assets'");
  expect(content).toContain('mazen-1.jpeg');
  expect(content).toContain('alt="Mazen Ragab"');

  // Caption "Mazen Ragab" and retro frame
  expect(content).toContain('Mazen Ragab');
  expect(content).toContain('meet-mazen__frame');
  expect(content).toContain('meet-mazen__caption');
});

test('SocialsWindow component exists and provides pixel icon social links', () => {
  const filePath = resolve('src/components/apps/SocialsWindow.astro');
  expect(existsSync(filePath)).toBe(true);

  const content = readFileSync(filePath, 'utf-8');

  // Imports PixelIcon
  expect(content).toContain("import PixelIcon from '../ui/PixelIcon.astro'");

  // Instagram: @papisartisticgarden
  expect(content).toContain('https://www.instagram.com/papisartisticgarden/');
  expect(content).toContain('@papisartisticgarden');

  // GitHub: maztard
  expect(content).toContain('https://github.com/maztard');
  expect(content).toContain('maztard');

  // Email: mazenra100@gmail.com
  expect(content).toContain('mailto:mazenra100@gmail.com');
  expect(content).toContain('mazenra100@gmail.com');
});

test('ProjectsContent component exists and renders retro browser chrome with projects', () => {
  const filePath = resolve('src/components/apps/ProjectsContent.astro');
  expect(existsSync(filePath)).toBe(true);

  const content = readFileSync(filePath, 'utf-8');

  // Retro address bar with URL
  expect(content).toContain('https://portfolio.local/projects');
  expect(content).toContain('projects-browser__address');

  // EmadEats Project external link
  expect(content).toContain('https://emadeats.vercel.app');
  expect(content).toContain('EmadEats Project');

  // BuggyEyes and Sudany entries
  expect(content).toContain('BuggyEyes');
  expect(content).toContain('Sudany');
});

test('WritingContent component exists and satisfies inline blog reader requirements', () => {
  const filePath = resolve('src/components/apps/WritingContent.astro');
  expect(existsSync(filePath)).toBe(true);

  const content = readFileSync(filePath, 'utf-8');

  // Optional props initialSlug
  expect(content).toContain('initialSlug?: string');

  // Uses getPublishedPosts from src/utils/posts.ts
  expect(content).toContain("import { getPublishedPosts, postUrl } from '../../utils/posts'");

  // Renders post list with [data-writing-list]
  expect(content).toContain('data-writing-list');

  // Renders inline post readers with [data-writing-post]
  expect(content).toContain('data-writing-post');

  // Back button with data-writing-back and label
  expect(content).toContain('data-writing-back');
  expect(content).toContain('← Back to articles');

  // Pre-renders article bodies
  expect(content).toContain('.render(');
  expect(content).toContain('<Content />');
});

test('RssContent component exists and provides feed URL with copy functionality', () => {
  const filePath = resolve('src/components/apps/RssContent.astro');
  expect(existsSync(filePath)).toBe(true);

  const content = readFileSync(filePath, 'utf-8');

  // Feed URL reference
  expect(content).toContain('/rss.xml');

  // One-click copy button with [data-copy-feed]
  expect(content).toContain('data-copy-feed');

  // Subscription instructions
  expect(content).toContain('How to Subscribe');
  expect(content).toContain('RSS reader');
});
