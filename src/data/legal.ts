import { site } from '@/lib/site';

/*
 * The legal documents, shown on the website and in the mobile app. The app
 * has a copy: after a change, run `npm run legal:sync`. Change `policiesUpdated`
 * in site.ts whenever the meaning changes, so learners are told.
 */

export type LegalBlock =
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'callout'; text: string };

export type LegalSection = { id: string; title: string; blocks: LegalBlock[] };

export type LegalDoc = {
  title: string;
  summary: string;
  updated: string;
  webPath: string;
  sections: LegalSection[];
};

const p = (text: string): LegalBlock => ({ type: 'p', text });
const list = (...items: string[]): LegalBlock => ({ type: 'list', items });
const callout = (text: string): LegalBlock => ({ type: 'callout', text });

const operator = site.operatorName || site.legalName;
const who = [operator, site.operatorAddress, site.country].filter(Boolean).join(', ');
const officer = site.grievanceOfficer || 'Grievance Officer';

export const PRIVACY: LegalDoc = {
  title: 'Privacy Policy',
  summary: 'We collect what we need to run your learning account, we never sell your data, and you can download or delete it yourself.',
  updated: site.policiesUpdated,
  webPath: '/privacy',
  sections: [
    {
      id: 'overview',
      title: 'Who we are',
      blocks: [
        p(`${site.name} is run by ${who} ("we"). We decide why and how your personal data is used: we are the data fiduciary under India's Digital Personal Data Protection Act, 2023, and the controller under laws that use that word. This policy covers the website and the mobile app, which share one account.`),
        p(`Questions about your data: ${site.privacyEmail}. Complaints: see "Grievances" below.`),
      ],
    },
    {
      id: 'collect',
      title: 'What we collect',
      blocks: [
        p('Needed for an account: your name, email address, age, and a password, which our authentication provider stores only as a secure hash.'),
        p('Optional: gender, city, institute, field of study, phone number, learning goal, bio and profile picture. Leaving these empty takes nothing away.'),
        list(
          'Learning: lessons, quizzes, practice, assessments, certificates, streaks, notes, flashcards, projects, enrollments, saved circuits and code you run.',
          'AI conversations: what you ask and the replies.',
          'Community: questions, answers, comments, reviews, reports, and your leaderboard nickname if you take part.',
          'Classes and colleges: membership, assignments, and which live classes you joined, if you join one.',
          'Messages: support requests, complaints and feedback, with screenshots you attach.',
          'Technical: IP address, device and browser type, request and security logs, crash reports, and a notification address for your phone if you allow notifications.',
          'Choices: settings, and when and which version of these documents you accepted.',
          'From others, only if you choose it: Google or your college gives us your name and email when you sign in with them; your college\'s learning site gives us its identifier for you when you connect it.',
        ),
        p('Do not put health, financial, government-ID or other sensitive details in your profile, posts or AI messages. We do not need them.'),
      ],
    },
    {
      id: 'use',
      title: 'Why we use it',
      blocks: [
        list(
          'To provide what you asked for: your account, lessons, grading, certificates, AI answers, classes and support. We rely on your consent at signup and, where the law uses it, on our agreement with you.',
          'To recommend what to study next from your own results. Nobody is refused anything by an automated decision alone.',
          'To keep people safe: prevent abuse, moderate posts, fix errors and secure accounts. We rely on the law and our legitimate interest in a safe service.',
          'To send service messages. Study reminders, leaderboard and phone notifications happen only if you turn them on.',
          'To obey the law and answer lawful requests.',
        ),
        callout('We do not sell your personal data, show advertising, or track you across other sites.'),
      ],
    },
    {
      id: 'ai',
      title: 'AI features',
      blocks: [
        p('The AI tutor, summaries, translations, flashcard suggestions and code analysis send the text you submit, with the lesson, code or circuit it is about, to Google (Gemini API), which generates the reply. We do not send your name or email with it.'),
        p('Google may keep this text for a limited time to detect misuse. On its unpaid service level, Google may also use it to improve its products, and human reviewers may read it without knowing whose it is. So never type personal or confidential information into AI features. Google\'s own terms apply to this processing.'),
        p('You do not have to use AI features. Replies can be wrong; use Report under a reply to tell us.'),
      ],
    },
    {
      id: 'sharing',
      title: 'Who receives it',
      blocks: [
        p('Companies that run parts of the service for us:'),
        list(
          'Supabase: accounts and database.',
          'Vercel: website, requests and cookie-free page counts.',
          'Render: runs the code and circuits you send to it.',
          'Google: Gemini AI, Google sign-in if you choose it, and YouTube videos in privacy-enhanced mode, which your browser loads from Google.',
          'Expo, Google and Apple: deliver phone notifications if you allow them.',
          'jsDelivr: delivers maths fonts to the mobile app.',
          'Brevo: sends email, where we use it.',
          'qBraid: receives a circuit only if you choose its simulator.',
        ),
        p('People: your teacher sees your name, assigned work and live-class attendance if you join a class. Your college or company sees your name, email, last active day and learning totals if you join it, and receives a score when you press Send. Teachers see projects you submit. Live classes open on the meeting service your teacher chose, under its own rules.'),
        p('Authorities: only when the law requires it, or to protect someone from harm.'),
        p('We take no payments now. If that changes, this policy will name the payment company before you can pay.'),
      ],
    },
    {
      id: 'transfers',
      title: 'Other countries',
      blocks: [
        p('These companies may store or process data outside your country, including in the United States. Where the law requires safeguards, we rely on the ones in their data-processing terms. Indian law allows transfers unless the government restricts a country, and we would follow such an order.'),
      ],
    },
    {
      id: 'visibility',
      title: 'What others can see',
      blocks: [
        p('Your profile is private at first. On posts and reviews, others see your name, username, picture and role. The leaderboard shows only the nickname and points of people who join it. Anyone with a certificate\'s link or number can check it and sees your name, the title, date and score. You choose in Settings whether your bio and studies are public.'),
      ],
    },
    {
      id: 'cookies',
      title: 'Cookies and device storage',
      blocks: [
        p('We use only necessary cookies: to keep you signed in and, for a short time, to open work from a college site safely. Device storage remembers things like drafts and preferences. The app keeps your session in the phone\'s secure storage, and saved programs and blocked users on that device only. There are no advertising or cross-site tracking cookies, and the app does not use your camera, microphone, contacts, photos or location.'),
      ],
    },
    {
      id: 'retention',
      title: 'How long we keep it',
      blocks: [
        list(
          'Account and learning data: until you delete it or your account.',
          'Crash reports: about 90 days after the error was last seen.',
          'Registration details (name, email, account number, dates): 180 days after an account closes, as India\'s intermediary rules require, then deleted.',
          'Provider logs and backups: for our providers\' limited periods, after which they are overwritten.',
          'Public community posts: may stay without your name so discussions make sense.',
          'Anything the law or an investigation requires: only as long as required. When India\'s data protection rules on logs apply (from May 2027), some records must be kept for one year.',
        ),
        p('Delete your account in Settings on the website or in the app, or follow the steps on the website\'s Delete your account page. Your login stops working immediately.'),
      ],
    },
    {
      id: 'security',
      title: 'Security',
      blocks: [
        p('We use encrypted connections, access rules in the database, server-side checks, optional two-factor sign-in and isolated code execution. No system is perfectly safe. If a breach affects you, we will tell you and the authorities as the law requires, with what happened and what you can do.'),
      ],
    },
    {
      id: 'rights',
      title: 'Your rights',
      blocks: [
        list(
          'See and download: Settings, Security, Download my data.',
          'Correct: Settings, Profile.',
          'Delete, and withdraw consent: Settings, Delete account. It is as easy as signing up. Withdrawal does not affect what happened before it.',
          'Turn off notifications, reminders, the leaderboard, classes or a college at any time.',
          'Nominate someone to use your rights if you die or cannot: write to us.',
          'Where your law gives it: object, restrict, move your data to another service, and have an automated result reviewed by a person.',
        ),
        p(`For anything else, write to ${site.privacyEmail} from your account's email address, so we know it is you. We confirm within 24 hours where we can, at most 30 days, and answer within one month; if the law allows longer for a difficult request, never more than 90 days. It is free.`),
        p('You can complain to us first (see Grievances), and then to the Data Protection Board of India, or to your own regulator, such as your EU country\'s authority or the UK Information Commissioner\'s Office.'),
      ],
    },
    {
      id: 'children',
      title: 'Adults only',
      blocks: [
        p('The service is for people aged 18 and over. We ask your age at signup, do not store an age that is refused, and do not knowingly collect children\'s data. If you believe someone under 18 has an account, tell us and we will close it and delete the data.'),
      ],
    },
    {
      id: 'grievances',
      title: 'Grievances',
      blocks: [
        p(`${officer}, ${site.name}${site.operatorAddress ? `, ${site.operatorAddress}` : ''}. Email: ${site.grievanceEmail}${site.grievancePhone ? `. Phone: ${site.grievancePhone}` : ''}. The process and times are on the Grievances page.`),
      ],
    },
    {
      id: 'changes',
      title: 'Changes',
      blocks: [
        p('When our practices change we update this page and its date, and notify signed-in learners. If a change needs your consent, we ask first.'),
      ],
    },
  ],
};

export const TERMS: LegalDoc = {
  title: 'Terms of Service',
  summary: 'Plain rules: be 18 or older, be honest, be respectful, and use the platform to learn.',
  updated: site.policiesUpdated,
  webPath: '/terms',
  sections: [
    {
      id: 'agreement',
      title: 'Agreement',
      blocks: [
        p(`These terms are a contract between you and ${who}, for the ${site.name} website and mobile app. By creating an account you agree to them and to the Community Guidelines. The Privacy Policy explains how your data is used. This is an electronic record under India's Information Technology Act, 2000.`),
        p('If you got the app from an app store, its terms apply too. The store is not responsible for the app or its content.'),
      ],
    },
    {
      id: 'accounts',
      title: 'Your account',
      blocks: [
        list(
          'You must be 18 or older.',
          'Give correct information, use one account, and keep your password to yourself.',
          `Tell us at ${site.securityEmail} if someone else may be using your account.`,
        ),
      ],
    },
    {
      id: 'price',
      title: 'Free service',
      blocks: [
        p('The service is free today and we take no payments. If we add paid features, the price, tax, renewal, cancellation and refund terms will be shown before you can buy, and you will not be charged without choosing it.'),
      ],
    },
    {
      id: 'use',
      title: 'What you must not do',
      blocks: [
        p('Do not host, display, upload, change, publish, send, store, update or share anything that:'),
        list(
          'belongs to someone else, and you have no right to it;',
          'is obscene, pornographic, paedophilic, invades another\'s privacy including bodily privacy, insults or harasses on the basis of gender, is racially or ethnically objectionable, encourages money laundering or gambling, or promotes enmity between groups on grounds of religion or caste with the intent to incite violence;',
          'is harmful to children;',
          'infringes a patent, trademark, copyright or other right;',
          'deceives about where a message comes from, or knowingly and intentionally communicates misinformation or information that is patently false, untrue or misleading, including about the business of government;',
          'impersonates another person, including by realistic AI-made images, audio or video;',
          'threatens the unity, integrity, defence, security or sovereignty of India, friendly relations with other states or public order, incites an offence, prevents its investigation, or insults another nation;',
          'contains a virus or code meant to interrupt, destroy or limit a computer;',
          'breaks any law in force.',
        ),
        p('Also do not bypass security, access others\' accounts or data, overload or scrape the service, use code execution for mining, scanning or attacks, use AI features to make harmful content, cheat in assessments, share answer keys, or resell our material.'),
        callout('If you break these rules, or our policies, we may remove content and suspend or close your account at once. Breaking the law can also bring penalties under Indian and other laws, and we may have to report it.'),
      ],
    },
    {
      id: 'content',
      title: 'Your content',
      blocks: [
        p('You own what you create. You give us a free, worldwide, non-exclusive licence to host, copy, format and show it only to run the service; it ends when the content is deleted, except for copies others have quoted and limited backups. You promise you have the right to share it. We do not check posts before they appear, but we may review and remove them.'),
        p('Keep your own copies of work you care about.'),
      ],
    },
    {
      id: 'reports',
      title: 'Reports, copyright and appeals',
      blocks: [
        p(`Use Report on posts and AI replies, or write to ${site.grievanceEmail}. For copyright, give your contact details, the work, the address of the content, a statement that you act in good faith and are authorised, and your signature. False reports can make you liable.`),
        p('If we remove your content or restrict your account, you can appeal the same way, and a person will look at it again.'),
      ],
    },
    {
      id: 'ai',
      title: 'AI features',
      blocks: [
        p('You are talking to a machine, not a person. AI answers, summaries, translations, flashcards and code can be wrong, incomplete or similar to what others receive. Check important results, and do not rely on them for medical, legal, financial, safety or other decisions. Do not enter personal or confidential information. You are responsible for how you use the output.'),
      ],
    },
    {
      id: 'certificates',
      title: 'Assessments and certificates',
      blocks: [
        p(`Certificates record that an account completed lessons or passed an assessment on ${site.name}. They are certificates of completion: not a degree, diploma, licence or academic credit. We are not a university, and are not recognised, accredited by or affiliated with UGC, AICTE or any university unless we say so in writing. Assessments are not supervised and we do not check identity. We promise no job, marks or admission. We may correct or withdraw a certificate issued by mistake or through cheating.`),
      ],
    },
    {
      id: 'ip',
      title: 'Our content and others\' names',
      blocks: [
        p('Lessons, questions, software and branding belong to us or our licensors. You may use them for your own learning. Teachers may use them with their classes inside the service. Code generated from your own circuits is yours. Open-source parts stay under their licences.'),
        p('IBM and Qiskit are trademarks of International Business Machines Corporation. Cirq and Google, PennyLane and Xanadu, qBraid, Moodle, Canvas and other names belong to their owners. We mention them only to describe what we teach or work with. They do not sponsor or endorse us.'),
      ],
    },
    {
      id: 'classes',
      title: 'Classes and colleges',
      blocks: [
        p('Teachers and colleges are responsible for what they assign, the meetings they run and the recordings they share, and must have the consent of people they record. They may use learners\' data only for teaching those learners. Removing someone from a class or college does not delete their account.'),
      ],
    },
    {
      id: 'availability',
      title: 'Availability',
      blocks: [
        p('We may change, limit, pause or end parts of the service, and it may be unavailable at times. If we close it, we will try to give you notice and time to download your data.'),
      ],
    },
    {
      id: 'liability',
      title: 'Responsibility and limits',
      blocks: [
        p('The service is provided as it is, for education only. Simulations are models and may differ from real quantum hardware. As far as the law allows, we give no other warranties and are not liable for indirect or consequential loss, or for lost data, profit or opportunity.'),
        p('Nothing here removes rights you have as a consumer, or liability that cannot be limited by law, such as for fraud, or for death or injury caused by negligence.'),
      ],
    },
    {
      id: 'termination',
      title: 'Ending',
      blocks: [
        p('You can delete your account at any time in Settings. We may suspend or close accounts that break these terms, put others at risk, or where the law requires it. We tell you why unless the law or safety prevents it, and you can appeal.'),
      ],
    },
    {
      id: 'law',
      title: 'Law and disputes',
      blocks: [
        p(`Please contact us first; most problems can be solved that way. Indian law applies, and the courts ${site.courts ? `at ${site.courts}` : 'of India'} have jurisdiction. If you are a consumer elsewhere, you keep the protection of your own country's mandatory laws and may be able to use your local courts.`),
        p('If one part of these terms cannot be enforced, the rest stays in force.'),
      ],
    },
    {
      id: 'changes',
      title: 'Changes and contact',
      blocks: [
        p('We update the date above when these terms change and notify signed-in learners. Important changes apply only to the future. If you disagree, delete your account before they apply.'),
        p(`Contact: ${site.supportEmail}. Complaints: ${officer}, ${site.grievanceEmail}.`),
      ],
    },
  ],
};

export const GUIDELINES: LegalDoc = {
  title: 'Community Guidelines',
  summary: 'Community Q&A works when everyone asks in good faith and answers with care.',
  updated: site.policiesUpdated,
  webPath: '/guidelines',
  sections: [
    {
      id: 'spirit',
      title: 'The spirit',
      blocks: [
        list(
          'Be kind. Everyone was a beginner once.',
          'Be specific. Share what you tried and what you expected.',
          'Be honest. Cite sources, and say when you are unsure or used AI.',
        ),
      ],
    },
    {
      id: 'not-allowed',
      title: 'Not allowed',
      blocks: [
        callout('We have zero tolerance for objectionable content and abusive users. Content is removed, and accounts can be suspended or closed.'),
        list(
          'Harassment, bullying, hate, threats or discrimination.',
          'Sexual content, violence, or anything that harms children.',
          'Impersonation, or fake images, audio or video of real people.',
          'Other people\'s personal information or private images.',
          'Spam, scams, advertising, malware or misleading links.',
          'Knowingly false or misleading information.',
          'Copied work without permission, assessment answers, or helping others cheat.',
          'Anything the Terms of Service or the law forbid.',
        ),
      ],
    },
    {
      id: 'tools',
      title: 'Report and block',
      blocks: [
        list(
          'Report a question, answer or AI reply with its Report button. People review reports.',
          'In the app, Block hides everything a person posts, on that device.',
          `Urgent, or no account: ${site.grievanceEmail}. If someone is in danger, call the emergency services first (112 in India).`,
        ),
      ],
    },
  ],
};

export const GRIEVANCES: LegalDoc = {
  title: 'Grievances',
  summary: 'How to complain about content, privacy, or the service, and how quickly we act.',
  updated: site.policiesUpdated,
  webPath: '/grievance',
  sections: [
    {
      id: 'officer',
      title: 'Grievance Officer',
      blocks: [
        list(
          `Name: ${site.grievanceOfficer || 'Being appointed'}`,
          `Email: ${site.grievanceEmail}`,
          ...(site.grievancePhone ? [`Phone: ${site.grievancePhone}`] : []),
          ...(site.operatorAddress ? [`Address: ${site.operatorAddress}, ${site.country}`] : []),
          `Service: ${site.name}, run by ${operator}`,
        ),
      ],
    },
    {
      id: 'how',
      title: 'How to complain',
      blocks: [
        p('Signed in: open a support request and choose Complaint or Privacy request; you get a number to follow. Otherwise email the Grievance Officer. Say what happened, where (a link helps), who you are, and what you want. You do not need an account, and it is free.'),
      ],
    },
    {
      id: 'times',
      title: 'Our times',
      blocks: [
        list(
          'We confirm that we received it within 24 hours.',
          'Complaints are resolved within 7 days.',
          'Requests to remove content the rules forbid: within 36 hours.',
          'Private, sexual or nude images, or impersonation including altered images, of the person complaining or someone they speak for: within 2 hours.',
          'Orders of a court or authorised government agency: within 3 hours.',
          'Privacy requests: within one month, and never more than 90 days.',
        ),
      ],
    },
    {
      id: 'next',
      title: 'If you are not satisfied',
      blocks: [
        p('In India you can appeal to the Grievance Appellate Committee at gac.gov.in within 30 days of our decision, complain to the Data Protection Board about personal data, report cybercrime at cybercrime.gov.in or on 1930, or go to a consumer commission or court where you have that right. Elsewhere, contact your data protection or consumer authority.'),
      ],
    },
  ],
};
