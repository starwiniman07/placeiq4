async function test() {
  const targetRole = 'frontend developer';
  const text = 'This is a test resume for Dinesh. Frontend Developer at TechCorp. HTML, CSS, React.js.';

  const res1 = {
    "atsScore": 40,
    "missingKeywords": [
      { "keyword": "JavaScript" },
      { "keyword": "UI/UX" }
    ]
  };

  const sys2 = "You are a hiring manager at a top tech company. Be specific, honest, and actionable. Return ONLY valid JSON.";
  const user2 = `A student wants to get this job: "${targetRole}". Current ATS: ${res1.atsScore}/100. Missing Keywords: ${res1.missingKeywords?.map(k => k.keyword).join(', ') || 'None'}. Resume Content: ${text}. Give them a COMPLETE gap analysis of everything they need to ADD. Return EXACTLY this JSON: { "gapSummary": "...", "criticalMissing": [{ "category": "...", "item": "...", "priority": "Must Have"|"Should Have"|"Nice to Have", "howToGet": "...", "timeToAcquire": "...", "freeResources": ["..."] }], "skillsToAdd": [{ "skill": "...", "currentLevel": "...", "requiredLevel": "...", "learningPath": "...", "projectIdea": "..." }], "projectsToAdd": [{ "projectTitle": "...", "description": "...", "techStack": ["..."], "whyItMatters": "...", "estimatedTime": "...", "githubTips": "..." }], "certificationsToAdd": [{ "certification": "...", "provider": "...", "cost": "...", "duration": "...", "impact": "..." }], "experienceToAdd": [{ "type": "...", "description": "...", "howToFind": "...", "timeCommitment": "..." }], "resumeSectionsToAdd": [{ "section": "...", "reason": "...", "template": "..." }], "30DayActionPlan": [{ "week": 1, "focus": "...", "tasks": ["..."], "milestone": "..." }], "bulletPointsToAdd": [{ "section": "...", "bulletPoint": "...", "placementTip": "..." }] }`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: sys2 },
        { role: 'user', content: user2 }
      ],
      temperature: 0.3,
      max_tokens: 3000
    })
  });
  const data = await response.json();
  const rawText = data.choices[0].message.content;
  console.log('--- RAW TEXT ---');
  console.log(rawText);
  console.log('----------------');

  const firstBrace = rawText.indexOf('{');
  const lastBrace = rawText.lastIndexOf('}');
  const extracted = rawText.substring(firstBrace, lastBrace + 1);

  try {
    JSON.parse(extracted);
    console.log('Parse successful');
  } catch (err) {
    console.log('PARSE ERROR:', err.message);
    console.log(extracted);
  }
}
test();
